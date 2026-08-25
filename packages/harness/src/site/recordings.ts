import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { getRepoRoot } from "../paths.js";
import {
  formatRecordingManifestValidationError,
  listRecordingManifestPaths,
  parseRecordingManifest,
  validateRecordingManifests,
  type RecordingManifest,
  type RecordingChapter,
  type RecordingStatus,
} from "../wiki/recording-manifest.js";
import { resolveRecordingArtifactRoot, validateRecordingMasteringEvidence } from "./mastering-evidence.js";

const COPY_BUFFER_BYTES = 1024 * 1024;
const MP3_FRAME_BUFFER_BYTES = 4096;
const MP3_DURATION_TOLERANCE_SECONDS = 0.25;

const MPEG_1_LAYER_3_BITRATES_KBPS = [
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320,
] as const;
const MPEG_2_LAYER_3_BITRATES_KBPS = [
  0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160,
] as const;
const MPEG_1_SAMPLE_RATES = [44_100, 48_000, 32_000] as const;

export type SiteRecordingStatus = Extract<RecordingStatus, "accepted" | "draft">;

export type SiteRecording = {
  manifest: RecordingManifest;
  manifestPath: string;
  status: SiteRecordingStatus;
  recordingId: string;
  dialogue: string;
  sourceArtifactPath: string;
  siteAssetPath: string;
  mimeType: string;
  durationSeconds: number;
  audioSha256: string;
  chapters: RecordingChapter[];
};

export type MaterializedRecordingAsset = {
  dialogue: string;
  status: SiteRecordingStatus;
  path: string;
  sha256: string;
  bytes: number;
};

function readAt(descriptor: number, position: number, length: number) {
  const buffer = Buffer.alloc(length);
  let offset = 0;
  while (offset < length) {
    const bytesRead = readSync(descriptor, buffer, offset, length - offset, position + offset);
    if (bytesRead === 0) break;
    offset += bytesRead;
  }
  return buffer.subarray(0, offset);
}

function synchsafeInteger(bytes: Buffer) {
  if (bytes.length !== 4 || bytes.some((value) => (value & 0x80) !== 0)) {
    throw new Error("ID3v2 size is not a four-byte synchsafe integer");
  }
  return ((bytes[0] ?? 0) << 21) | ((bytes[1] ?? 0) << 14) | ((bytes[2] ?? 0) << 7) | (bytes[3] ?? 0);
}

type ParsedMp3Frame = {
  bytes: number;
  durationSeconds: number;
  sampleRate: number;
  bitrateKbps: number;
  channels: number;
};

function parseMp3FrameHeader(header: Buffer): ParsedMp3Frame {
  if (header.length < 4 || header[0] !== 0xff || ((header[1] ?? 0) & 0xe0) !== 0xe0) {
    throw new Error("missing MPEG frame sync");
  }
  const versionBits = ((header[1] ?? 0) >> 3) & 0x03;
  const layerBits = ((header[1] ?? 0) >> 1) & 0x03;
  if (versionBits === 1) throw new Error("reserved MPEG version");
  if (layerBits !== 1) throw new Error("audio is not MPEG Layer III");

  const bitrateIndex = ((header[2] ?? 0) >> 4) & 0x0f;
  const sampleRateIndex = ((header[2] ?? 0) >> 2) & 0x03;
  const padding = ((header[2] ?? 0) >> 1) & 0x01;
  if (bitrateIndex === 0 || bitrateIndex === 0x0f) throw new Error("free or invalid Layer III bitrate");
  if (sampleRateIndex === 0x03) throw new Error("reserved MPEG sample rate");
  if (((header[3] ?? 0) & 0x03) === 0x02) throw new Error("reserved MPEG emphasis");

  const mpeg1 = versionBits === 3;
  const divisor = versionBits === 0 ? 4 : versionBits === 2 ? 2 : 1;
  const sampleRate = (MPEG_1_SAMPLE_RATES[sampleRateIndex] ?? 0) / divisor;
  const bitrateKbps = (mpeg1 ? MPEG_1_LAYER_3_BITRATES_KBPS : MPEG_2_LAYER_3_BITRATES_KBPS)[
    bitrateIndex
  ] ?? 0;
  const samples = mpeg1 ? 1152 : 576;
  const bytes = Math.floor(((mpeg1 ? 144 : 72) * bitrateKbps * 1000) / sampleRate) + padding;
  if (bytes < 4 || bytes > MP3_FRAME_BUFFER_BYTES) throw new Error(`invalid Layer III frame length ${bytes}`);
  const channelMode = ((header[3] ?? 0) >> 6) & 0x03;
  return { bytes, durationSeconds: samples / sampleRate, sampleRate, bitrateKbps, channels: channelMode === 3 ? 1 : 2 };
}

class Mp3FrameInspector {
  readonly #audioStart: number;
  readonly #audioEnd: number;
  readonly #metadataBytes: number;
  readonly #buffer = Buffer.allocUnsafe(COPY_BUFFER_BYTES + MP3_FRAME_BUFFER_BYTES);
  #pendingBytes = 0;
  #frameBytes = 0;
  #frameCount = 0;
  #durationSeconds = 0;
  #sampleRate: number | undefined;
  #bitrateKbps: number | undefined;
  #channels: number | undefined;

  constructor(descriptor: number, fileBytes: number) {
    if (fileBytes < 4) throw new Error("file is too short to contain an MPEG Layer III frame");
    const head = readAt(descriptor, 0, Math.min(10, fileBytes));
    let audioStart = 0;
    if (head.length >= 3 && head.subarray(0, 3).toString("ascii") === "ID3") {
      if (head.length < 10) throw new Error("truncated ID3v2 header");
      const majorVersion = head[3] ?? 0;
      if (majorVersion < 2 || majorVersion > 4) throw new Error(`unsupported ID3v2 major version ${majorVersion}`);
      const tagBytes = synchsafeInteger(head.subarray(6, 10));
      const footerBytes = ((head[5] ?? 0) & 0x10) !== 0 ? 10 : 0;
      audioStart = 10 + tagBytes + footerBytes;
      if (audioStart > fileBytes) throw new Error("ID3v2 tag extends beyond the end of the file");
    }

    let audioEnd = fileBytes;
    if (fileBytes - audioStart >= 128) {
      const id3v1 = readAt(descriptor, fileBytes - 128, 3);
      if (id3v1.toString("ascii") === "TAG") audioEnd -= 128;
    }
    if (audioStart >= audioEnd) throw new Error("file contains metadata but no MPEG Layer III frames");
    this.#audioStart = audioStart;
    this.#audioEnd = audioEnd;
    this.#metadataBytes = audioStart + (fileBytes - audioEnd);
  }

  consume(chunk: Buffer, chunkStart: number) {
    const start = Math.max(0, this.#audioStart - chunkStart);
    const end = Math.min(chunk.length, this.#audioEnd - chunkStart);
    if (end <= start) return;
    chunk.copy(this.#buffer, this.#pendingBytes, start, end);
    const available = this.#pendingBytes + end - start;
    let offset = 0;
    while (available - offset >= 4) {
      const frame = parseMp3FrameHeader(this.#buffer.subarray(offset, offset + 4));
      if (available - offset < frame.bytes) break;
      if (
        (this.#sampleRate !== undefined && this.#sampleRate !== frame.sampleRate) ||
        (this.#bitrateKbps !== undefined && this.#bitrateKbps !== frame.bitrateKbps) ||
        (this.#channels !== undefined && this.#channels !== frame.channels)
      ) {
        throw new Error("MPEG Layer III stream changes sample rate, bitrate, or channel mode");
      }
      this.#sampleRate = frame.sampleRate;
      this.#bitrateKbps = frame.bitrateKbps;
      this.#channels = frame.channels;
      offset += frame.bytes;
      this.#frameBytes += frame.bytes;
      this.#frameCount += 1;
      this.#durationSeconds += frame.durationSeconds;
    }
    this.#pendingBytes = available - offset;
    if (this.#pendingBytes > 0) this.#buffer.copyWithin(0, offset, available);
  }

  finish() {
    if (this.#pendingBytes !== 0) throw new Error(`truncated final MPEG Layer III frame (${this.#pendingBytes} trailing bytes)`);
    if (this.#frameCount === 0) throw new Error("file contains no complete MPEG Layer III frames");
    if (this.#frameBytes !== this.#audioEnd - this.#audioStart) {
      throw new Error("non-frame bytes occur inside the MPEG Layer III stream");
    }
    return {
      frameCount: this.#frameCount,
      durationSeconds: this.#durationSeconds,
      sampleRate: this.#sampleRate!,
      bitrateKbps: this.#bitrateKbps!,
      channels: this.#channels!,
      metadataBytes: this.#metadataBytes,
    };
  }
}

function assertPublicationMp3Profile(result: ReturnType<Mp3FrameInspector["finish"]>, path: string) {
  if (
    result.sampleRate !== 48_000 ||
    result.bitrateKbps !== 96 ||
    result.channels !== 1 ||
    result.metadataBytes !== 0
  ) {
    throw new Error(
      `Invalid MP3 publication profile for ${path}: expected mono 48 kHz 96 kbps; found ` +
        `${result.channels} channel(s), ${result.sampleRate} Hz, ${result.bitrateKbps} kbps, ` +
        `${result.metadataBytes} metadata byte(s).`,
    );
  }
}

function durationMismatch(actual: number, expected: number) {
  return (
    !Number.isFinite(actual) ||
    actual <= 0 ||
    !Number.isFinite(expected) ||
    expected <= 0 ||
    Math.abs(actual - expected) > MP3_DURATION_TOLERANCE_SECONDS
  );
}

export function inspectMp3File(path: string, expectedDurationSeconds?: number) {
  const descriptor = openSync(path, "r");
  const buffer = Buffer.allocUnsafe(COPY_BUFFER_BYTES);
  const hash = createHash("sha256");
  let inspector: Mp3FrameInspector;
  let offset = 0;
  try {
    inspector = new Mp3FrameInspector(descriptor, fstatSync(descriptor).size);
    while (true) {
      const bytesRead = readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      const chunk = buffer.subarray(0, bytesRead);
      hash.update(chunk);
      inspector.consume(chunk, offset);
      offset += bytesRead;
    }
  } catch (error) {
    throw new Error(`Invalid MP3 ${path}: ${error instanceof Error ? error.message : String(error)}.`);
  } finally {
    closeSync(descriptor);
  }
  const result = inspector!.finish();
  assertPublicationMp3Profile(result, path);
  if (
    expectedDurationSeconds !== undefined &&
    (!Number.isFinite(expectedDurationSeconds) ||
      expectedDurationSeconds <= 0 ||
      durationMismatch(result.durationSeconds, expectedDurationSeconds))
  ) {
    throw new Error(
      `MP3 duration mismatch for ${path}: expected ${expectedDurationSeconds.toFixed(3)} seconds; ` +
        `parsed ${result.durationSeconds.toFixed(3)} seconds (tolerance ${MP3_DURATION_TOLERANCE_SECONDS.toFixed(3)}).`,
    );
  }
  return { ...result, bytes: offset, sha256: hash.digest("hex") };
}

export function streamFileSha256(path: string) {
  const descriptor = openSync(path, "r");
  const buffer = Buffer.allocUnsafe(COPY_BUFFER_BYTES);
  const hash = createHash("sha256");
  try {
    while (true) {
      const bytesRead = readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      hash.update(buffer.subarray(0, bytesRead));
    }
  } finally {
    closeSync(descriptor);
  }
  return hash.digest("hex");
}

export function discoverSiteRecordings({
  includeDraftRecordings = false,
}: {
  includeDraftRecordings?: boolean;
} = {}) {
  const issues = validateRecordingManifests();
  if (issues.length > 0) {
    throw new Error(`Recording manifest validation failed:\n${formatRecordingManifestValidationError(issues)}`);
  }

  const recordings = new Map<string, SiteRecording>();
  for (const manifestPath of listRecordingManifestPaths()) {
    const manifest = parseRecordingManifest(
      manifestPath,
      readFileSync(join(getRepoRoot(), manifestPath), "utf8"),
    );
    if (manifest.status !== "accepted" && !(includeDraftRecordings && manifest.status === "draft")) continue;
    if (manifest.audio.mime_type !== "audio/mpeg") {
      throw new Error(
        `${manifest.status === "accepted" ? "Accepted recording" : "Review candidate"} ${manifest.recording_id} must use audio/mpeg for the static complete.mp3 audio asset.`,
      );
    }
    if (recordings.has(manifest.dialogue)) {
      throw new Error(`Duplicate playable recording for dialogue ${manifest.dialogue}.`);
    }
    recordings.set(manifest.dialogue, {
      manifest,
      manifestPath,
      status: manifest.status,
      recordingId: manifest.recording_id,
      dialogue: manifest.dialogue,
      sourceArtifactPath: manifest.audio.path,
      siteAssetPath: `assets/recordings/${manifest.dialogue}/complete.mp3`,
      mimeType: manifest.audio.mime_type,
      durationSeconds: manifest.audio.duration_seconds,
      audioSha256: manifest.audio.sha256,
      chapters: manifest.chapters,
    });
  }
  return recordings;
}

function insideRoot(root: string, target: string) {
  const child = relative(root, target);
  return child === "" || (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`));
}

function resolveDraftRecordingAudio(recording: SiteRecording, root: string) {
  const configured = resolve(root, recording.sourceArtifactPath);
  if (!insideRoot(root, configured)) {
    throw new Error(`Review candidate audio escapes the configured artifact root: ${recording.sourceArtifactPath}`);
  }
  if (!existsSync(configured)) throw new Error(`Review candidate audio is missing: ${configured}`);
  if (lstatSync(configured).isSymbolicLink() || !statSync(configured).isFile()) {
    throw new Error(`Review candidate audio must be a regular non-symlink file: ${configured}`);
  }
  const resolved = realpathSync(configured);
  if (!insideRoot(root, resolved)) {
    throw new Error(`Review candidate audio resolves outside the configured artifact root: ${recording.sourceArtifactPath}`);
  }
  return resolved;
}

function resolveSiteRecordingAudio(recording: SiteRecording, root: string) {
  if (recording.status === "accepted") {
    return validateRecordingMasteringEvidence(recording.manifest, root).publicationPath;
  }
  return resolveDraftRecordingAudio(recording, root);
}

function inspectSiteRecordingSource(recording: SiteRecording, root: string) {
  const source = resolveSiteRecordingAudio(recording, root);
  const inspected = inspectMp3File(source, recording.durationSeconds);
  if (inspected.sha256 !== recording.audioSha256) {
    throw new Error(
      `Recording artifact hash mismatch for ${source}: expected ${recording.audioSha256}; found ${inspected.sha256}.`,
    );
  }
  return source;
}

function copyAndVerifyRecording(
  source: string,
  destination: string,
  expectedSha256: string,
  expectedDurationSeconds: number,
) {
  mkdirSync(join(destination, ".."), { recursive: true });
  const temporary = `${destination}.tmp-${process.pid}`;
  rmSync(temporary, { force: true });
  const input = openSync(source, "r");
  const output = openSync(temporary, "wx");
  const buffer = Buffer.allocUnsafe(COPY_BUFFER_BYTES);
  const hash = createHash("sha256");
  let inspector: Mp3FrameInspector | undefined;
  let mp3Error: Error | undefined;
  let bytes = 0;
  try {
    try {
      inspector = new Mp3FrameInspector(input, fstatSync(input).size);
    } catch (error) {
      mp3Error = error instanceof Error ? error : new Error(String(error));
    }
    while (true) {
      const bytesRead = readSync(input, buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      const chunk = buffer.subarray(0, bytesRead);
      hash.update(chunk);
      if (inspector && !mp3Error) {
        try {
          inspector.consume(chunk, bytes);
        } catch (error) {
          mp3Error = error instanceof Error ? error : new Error(String(error));
        }
      }
      let written = 0;
      while (written < bytesRead) {
        written += writeSync(output, buffer, written, bytesRead - written);
      }
      bytes += bytesRead;
    }
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  } finally {
    closeSync(input);
    closeSync(output);
  }

  const actualSha256 = hash.digest("hex");
  if (actualSha256 !== expectedSha256) {
    rmSync(temporary, { force: true });
    throw new Error(`Recording artifact hash mismatch for ${source}: expected ${expectedSha256}; found ${actualSha256}.`);
  }
  let mp3: ReturnType<Mp3FrameInspector["finish"]> | undefined;
  if (!mp3Error) {
    try {
      mp3 = inspector?.finish();
    } catch (error) {
      mp3Error = error instanceof Error ? error : new Error(String(error));
    }
  }
  if (mp3Error || !mp3) {
    rmSync(temporary, { force: true });
    throw new Error(`Invalid MP3 recording artifact ${source}: ${mp3Error?.message ?? "no audio frames"}.`);
  }
  try {
    assertPublicationMp3Profile(mp3, source);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
  if (durationMismatch(mp3.durationSeconds, expectedDurationSeconds)) {
    rmSync(temporary, { force: true });
    throw new Error(
      `MP3 duration mismatch for ${source}: expected ${expectedDurationSeconds.toFixed(3)} seconds; ` +
        `parsed ${mp3.durationSeconds.toFixed(3)} seconds (tolerance ${MP3_DURATION_TOLERANCE_SECONDS.toFixed(3)}).`,
    );
  }
  renameSync(temporary, destination);
  return bytes;
}

export function materializeSiteRecordings({
  recordings,
  artifactRoot,
  outDir,
}: {
  recordings: ReadonlyMap<string, SiteRecording>;
  artifactRoot: string | undefined;
  outDir: string;
}) {
  if (recordings.size === 0) return [];
  const resolvedRoot = resolveRecordingArtifactRoot(artifactRoot);

  const assets: MaterializedRecordingAsset[] = [];
  for (const recording of [...recordings.values()].sort((a, b) => a.dialogue.localeCompare(b.dialogue))) {
    const source = resolveSiteRecordingAudio(recording, resolvedRoot);
    const destination = join(outDir, recording.siteAssetPath);
    const bytes = copyAndVerifyRecording(
      source,
      destination,
      recording.audioSha256,
      recording.durationSeconds,
    );
    assets.push({
      dialogue: recording.dialogue,
      status: recording.status,
      path: recording.siteAssetPath,
      sha256: recording.audioSha256,
      bytes,
    });
  }
  return assets;
}

export function validateSiteRecordingEvidence({
  recordings,
  artifactRoot,
  outDir,
}: {
  recordings: ReadonlyMap<string, SiteRecording>;
  artifactRoot: string | undefined;
  outDir?: string;
}) {
  if (recordings.size === 0 && artifactRoot === undefined) return;
  const resolvedRoot = resolveRecordingArtifactRoot(artifactRoot);
  if (outDir) {
    const suffix: string[] = [];
    let existingAncestor = resolve(outDir);
    while (!existsSync(existingAncestor)) {
      suffix.unshift(basename(existingAncestor));
      existingAncestor = dirname(existingAncestor);
    }
    const resolvedOutDir = resolve(realpathSync(existingAncestor), ...suffix);
    if (insideRoot(resolvedOutDir, resolvedRoot) || insideRoot(resolvedRoot, resolvedOutDir)) {
      throw new Error(
        `Generated site output must not overlap the recording artifact root: ${resolvedOutDir} and ${resolvedRoot}.`,
      );
    }
  }
  if (recordings.size === 0) return;
  for (const recording of [...recordings.values()].sort((a, b) => a.dialogue.localeCompare(b.dialogue))) {
    inspectSiteRecordingSource(recording, resolvedRoot);
  }
}
