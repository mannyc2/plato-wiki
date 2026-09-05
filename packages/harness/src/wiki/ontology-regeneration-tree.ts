import { createHash } from "node:crypto";
import {
  closeSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readSync,
  readdirSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

export type OntologyRegenerationArtifact = {
  path: string;
  bytes: number;
  sha256: string;
};

export const ONTOLOGY_ARTIFACT_HASH_CHUNK_BYTES = 64 * 1024;

const GENERATED_PROJECTION_ROOTS = [
  { path: "derived/plato/joins", suffix: ".toon", preserve: new Set<string>() },
  {
    path: "derived/plato/voices",
    suffix: ".toon",
    preserve: new Set(["cutovers.toml", "sigla.toml"]),
  },
  { path: "wiki/clusters", suffix: ".jsonl", preserve: new Set<string>() },
  { path: "wiki/dossiers", suffix: ".json", preserve: new Set<string>() },
] as const;

const FIXED_REGENERATION_WRITE_TARGETS = [
  "audio/coverage.md",
  "wiki/completeness.md",
] as const;

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function regularFilesRecursively(directory: string, allowMissing: boolean): string[] {
  assertCanonicalDirectoryOrNearestParent(directory);
  let root: ReturnType<typeof lstatSync>;
  try {
    root = lstatSync(directory);
  } catch (error) {
    if (
      allowMissing
      && typeof error === "object"
      && error !== null
      && "code" in error
      && error.code === "ENOENT"
    ) return [];
    throw error;
  }
  if (root.isSymbolicLink() || !root.isDirectory()) {
    throw new Error(`Expected a regular generated directory tree: ${directory}`);
  }
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
        throw new Error(`Generated trees may contain only regular files and directories: ${path}`);
      }
      return stat.isDirectory() ? regularFilesRecursively(path, false) : [path];
    })
    .sort();
}

function assertCanonicalFileWriteTarget(path: string) {
  const lexical = resolve(path);
  assertCanonicalDirectoryOrNearestParent(dirname(lexical));
  try {
    const metadata = lstatSync(lexical);
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new Error(`Ontology regeneration fixed output must be a regular non-symlink file: ${lexical}`);
    }
    const real = realpathSync(lexical);
    if (real !== lexical) {
      throw new Error(
        `Ontology regeneration fixed output must have no symlinked parent component: ${lexical} != ${real}`,
      );
    }
  } catch (error) {
    if (
      typeof error === "object"
      && error !== null
      && "code" in error
      && error.code === "ENOENT"
    ) return;
    throw error;
  }
}

/** Validate every non-tree file target before a regeneration phase writes it. */
export function assertOntologyRegenerationFixedWriteTargets(repoRoot: string) {
  for (const target of FIXED_REGENERATION_WRITE_TARGETS) {
    assertCanonicalFileWriteTarget(join(repoRoot, target));
  }
}

/**
 * Establishes an empty generated-projection scope while preserving only the
 * two canonical voice configuration inputs. Every root is validated before
 * any root is changed, so a pre-existing symlink or special file cannot leave
 * a partially cleaned projection.
 */
export function cleanOntologyGeneratedProjectionRoots(repoRoot: string) {
  assertOntologyRegenerationFixedWriteTargets(repoRoot);
  for (const spec of GENERATED_PROJECTION_ROOTS) {
    regularFilesRecursively(join(repoRoot, spec.path), true);
  }
  for (const spec of GENERATED_PROJECTION_ROOTS) {
    const root = join(repoRoot, spec.path);
    mkdirSync(root, { recursive: true });
    assertCanonicalDirectoryOrNearestParent(root);
    const rootStat = lstatSync(root);
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
      throw new Error(`Expected a regular generated projection directory: ${root}`);
    }
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const path = join(root, entry.name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
        throw new Error(`Generated trees may contain only regular files and directories: ${path}`);
      }
      if (stat.isFile() && spec.preserve.has(entry.name)) continue;
      rmSync(path, { recursive: stat.isDirectory(), force: true });
    }
  }
}

function artifact(
  path: string,
  logicalPath: string,
  scratch: Uint8Array,
): OntologyRegenerationArtifact {
  const pathStat = lstatSync(path);
  if (pathStat.isSymbolicLink() || !pathStat.isFile()) {
    throw new Error(`Ontology regeneration artifacts must be regular files: ${logicalPath}`);
  }
  const hash = createHash("sha256");
  const descriptor = openSync(path, "r");
  let bytes = 0;
  try {
    const before = fstatSync(descriptor);
    while (true) {
      const read = readSync(descriptor, scratch, 0, scratch.byteLength, null);
      if (read === 0) break;
      bytes += read;
      hash.update(scratch.subarray(0, read));
    }
    const after = fstatSync(descriptor);
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || bytes !== after.size) {
      throw new Error(`Generated ontology artifact changed while it was hashed: ${logicalPath}`);
    }
  } finally {
    closeSync(descriptor);
  }
  return { path: logicalPath, bytes, sha256: hash.digest("hex") };
}

export function ontologyRegenerationArtifact(
  path: string,
  logicalPath: string,
): OntologyRegenerationArtifact {
  return artifact(path, logicalPath, Buffer.allocUnsafe(ONTOLOGY_ARTIFACT_HASH_CHUNK_BYTES));
}

function uniqueArtifactPaths(artifacts: readonly OntologyRegenerationArtifact[]) {
  return new Set(artifacts.map((entry) => entry.path)).size === artifacts.length;
}

function assertCanonicalDirectoryOrNearestParent(directory: string) {
  const requested = resolve(directory);
  let candidate = requested;
  while (true) {
    try {
      const metadata = lstatSync(candidate);
      if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
        throw new Error(`Expected a regular generated directory tree: ${candidate}`);
      }
      const real = realpathSync(candidate);
      if (real !== candidate) {
        throw new Error(
          `Expected a regular generated directory tree with no symlinked parent component: ${candidate} != ${real}`,
        );
      }
      return;
    } catch (error) {
      if (
        typeof error === "object"
        && error !== null
        && "code" in error
        && error.code === "ENOENT"
      ) {
        const parent = dirname(candidate);
        if (parent === candidate) throw error;
        candidate = parent;
        continue;
      }
      throw error;
    }
  }
}

export function ontologyRegenerationDigest(artifacts: readonly OntologyRegenerationArtifact[]) {
  if (!uniqueArtifactPaths(artifacts)) {
    throw new Error("Ontology regeneration artifacts contain duplicate logical paths.");
  }
  const hash = createHash("sha256");
  const sorted = [...artifacts].sort((left, right) => left.path.localeCompare(right.path));
  hash.update("[");
  for (const [index, entry] of sorted.entries()) {
    if (index > 0) hash.update(",");
    hash.update(canonicalJson(entry));
  }
  hash.update("]");
  return hash.digest("hex");
}

export function ontologyRegenerationArtifactsEqual(
  first: readonly OntologyRegenerationArtifact[],
  second: readonly OntologyRegenerationArtifact[],
) {
  if (first.length !== second.length || !uniqueArtifactPaths(first) || !uniqueArtifactPaths(second)) return false;
  const left = [...first].sort((a, b) => a.path.localeCompare(b.path));
  const right = [...second].sort((a, b) => a.path.localeCompare(b.path));
  return left.every((entry, index) => {
    const other = right[index]!;
    return entry.path === other.path && entry.bytes === other.bytes && entry.sha256 === other.sha256;
  });
}

export function collectOntologyCanonicalRegenerationArtifacts(
  repoRoot: string,
): OntologyRegenerationArtifact[] {
  assertOntologyRegenerationFixedWriteTargets(repoRoot);
  const scratch = Buffer.allocUnsafe(ONTOLOGY_ARTIFACT_HASH_CHUNK_BYTES);
  const artifacts = GENERATED_PROJECTION_ROOTS.flatMap((spec) => {
    const root = join(repoRoot, spec.path);
    return regularFilesRecursively(root, false).flatMap((path) => {
      const projectionPath = relative(root, path).split("\\").join("/");
      if (spec.preserve.has(projectionPath)) return [];
      if (!projectionPath.endsWith(spec.suffix)) {
        throw new Error(`Unexpected file in generated ontology projection ${spec.path}: ${projectionPath}`);
      }
      return [artifact(path, relative(repoRoot, path).split("\\").join("/"), scratch)];
    });
  });
  artifacts.push(artifact(join(repoRoot, "audio/coverage.md"), "audio/coverage.md", scratch));
  artifacts.push(artifact(join(repoRoot, "wiki/completeness.md"), "wiki/completeness.md", scratch));
  if (!uniqueArtifactPaths(artifacts)) {
    throw new Error("Canonical ontology regeneration artifacts contain duplicate logical paths.");
  }
  return artifacts.sort((left, right) => left.path.localeCompare(right.path));
}

export function collectOntologyRegenerationArtifacts(
  repoRoot: string,
  siteDirectory: string,
): OntologyRegenerationArtifact[] {
  const scratch = Buffer.allocUnsafe(ONTOLOGY_ARTIFACT_HASH_CHUNK_BYTES);
  const artifacts = [
    ...collectOntologyCanonicalRegenerationArtifacts(repoRoot),
    ...regularFilesRecursively(siteDirectory, false).map((path) =>
      artifact(path, `site/${relative(siteDirectory, path).split("\\").join("/")}`, scratch)
    ),
  ];
  if (!uniqueArtifactPaths(artifacts)) {
    throw new Error("Ontology regeneration artifacts contain duplicate logical paths.");
  }
  return artifacts.sort((left, right) => left.path.localeCompare(right.path));
}
