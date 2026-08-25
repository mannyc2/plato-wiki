export const RECORDING_RESUME_SCHEMA_VERSION = 1;
export const RECORDING_PROGRESS_SAVE_INTERVAL_MS = 5_000;

export function recordingResumeKey(recordingId: string, audioSha256: string) {
  return `plato-recording-resume:v${RECORDING_RESUME_SCHEMA_VERSION}:${encodeURIComponent(recordingId)}:${audioSha256}`;
}

export function recordingCompletionWindow(durationSeconds: number) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.min(10, durationSeconds * 0.02);
}

export function shouldClearRecordingProgress(currentSeconds: number, durationSeconds: number) {
  if (
    !Number.isFinite(currentSeconds) ||
    currentSeconds < 0 ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return false;
  }
  if (currentSeconds === 0) return true;
  return durationSeconds - currentSeconds <= recordingCompletionWindow(durationSeconds);
}

export function restorableRecordingProgress(storedValue: string | null, durationSeconds: number) {
  if (storedValue === null || !Number.isFinite(durationSeconds) || durationSeconds <= 0) return undefined;
  const seconds = Number(storedValue);
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds >= durationSeconds) return undefined;
  return shouldClearRecordingProgress(seconds, durationSeconds) ? undefined : seconds;
}

export function recordingChapterSeekTime(value: string | number, durationSeconds: number) {
  const seconds = typeof value === "number" ? value : Number(value);
  if (
    !Number.isFinite(seconds) ||
    seconds < 0 ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    seconds >= durationSeconds
  ) {
    return undefined;
  }
  return seconds;
}

export function shouldSaveRecordingProgress({
  now,
  lastSavedAt,
  force = false,
  intervalMs = RECORDING_PROGRESS_SAVE_INTERVAL_MS,
}: {
  now: number;
  lastSavedAt: number;
  force?: boolean;
  intervalMs?: number;
}) {
  if (force) return true;
  return Number.isFinite(now) && Number.isFinite(lastSavedAt) && now - lastSavedAt >= intervalMs;
}

export function formatRecordingTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const rounded = Math.floor(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remainder = rounded % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function recordingResumeLinkLabel(storedValue: string | null, durationSeconds: number) {
  const seconds = restorableRecordingProgress(storedValue, durationSeconds);
  return seconds === undefined ? "Listen" : `Resume at ${formatRecordingTime(seconds)}`;
}
