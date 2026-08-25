import { describe, expect, it } from "bun:test";
import {
  formatRecordingTime,
  recordingChapterSeekTime,
  recordingCompletionWindow,
  recordingResumeKey,
  recordingResumeLinkLabel,
  restorableRecordingProgress,
  shouldClearRecordingProgress,
  shouldSaveRecordingProgress,
} from "./player.js";
import { siteJs } from "./layout.js";

describe("recording player state", () => {
  it("versions resume state by immutable recording id and audio hash", () => {
    expect(recordingResumeKey("recording_fixture_v1", "a".repeat(64))).toBe(
      `plato-recording-resume:v1:recording_fixture_v1:${"a".repeat(64)}`,
    );
    expect(recordingResumeKey("recording fixture/v2", "b".repeat(64))).toContain(
      "recording%20fixture%2Fv2",
    );
  });

  it("restores only finite in-range progress after a duration is known", () => {
    expect(restorableRecordingProgress("37.5", Number.NaN)).toBeUndefined();
    expect(restorableRecordingProgress("37.5", 100)).toBe(37.5);
    expect(restorableRecordingProgress(null, 100)).toBeUndefined();
    expect(restorableRecordingProgress("not-a-number", 100)).toBeUndefined();
    expect(restorableRecordingProgress("0", 100)).toBeUndefined();
    expect(restorableRecordingProgress("100", 100)).toBeUndefined();
  });

  it("clears progress only in the bounded near-completion window", () => {
    expect(recordingCompletionWindow(1_000)).toBe(10);
    expect(recordingCompletionWindow(100)).toBe(2);
    expect(shouldClearRecordingProgress(0, 100)).toBe(true);
    expect(shouldClearRecordingProgress(989.9, 1_000)).toBe(false);
    expect(shouldClearRecordingProgress(990, 1_000)).toBe(true);
    expect(shouldClearRecordingProgress(97.9, 100)).toBe(false);
    expect(shouldClearRecordingProgress(98, 100)).toBe(true);
    expect(restorableRecordingProgress("995", 1_000)).toBeUndefined();
  });

  it("bounds chapter seeks and throttles ordinary saves while allowing lifecycle saves", () => {
    expect(recordingChapterSeekTime("0", 120)).toBe(0);
    expect(recordingChapterSeekTime(45.5, 120)).toBe(45.5);
    expect(recordingChapterSeekTime("bad", 120)).toBeUndefined();
    expect(recordingChapterSeekTime(-1, 120)).toBeUndefined();
    expect(recordingChapterSeekTime(120, 120)).toBeUndefined();
    expect(shouldSaveRecordingProgress({ now: 4_999, lastSavedAt: 0 })).toBe(false);
    expect(shouldSaveRecordingProgress({ now: 5_000, lastSavedAt: 0 })).toBe(true);
    expect(shouldSaveRecordingProgress({ now: 1, lastSavedAt: 0, force: true })).toBe(true);
  });

  it("formats bounded chapter times for visible controls", () => {
    expect(formatRecordingTime(0)).toBe("0:00");
    expect(formatRecordingTime(65.9)).toBe("1:05");
    expect(formatRecordingTime(3_661)).toBe("1:01:01");
    expect(recordingResumeLinkLabel("65.9", 1_000)).toBe("Resume at 1:05");
    expect(recordingResumeLinkLabel("995", 1_000)).toBe("Listen");
  });

  it("surfaces a saved position from the audio-edition catalog without playing audio", () => {
    const sha256 = "a".repeat(64);
    const summary = { textContent: "Checking saved position…" };
    const attributes = new Map<string, string>();
    const link = {
      dataset: {
        recordingId: "recording_fixture_v1",
        recordingDialogue: "fixture",
        audioSha256: sha256,
        recordingDuration: "100",
      },
      textContent: "Listen",
      parentElement: { querySelector: () => summary },
      setAttribute: (name: string, value: string) => attributes.set(name, value),
    };
    const document = {
      querySelector: () => null,
      querySelectorAll: (selector: string) => (selector === "[data-recording-resume-link]" ? [link] : []),
    };
    const window = { addEventListener: () => undefined };
    const key = recordingResumeKey("recording_fixture_v1", sha256);
    const localStorage = {
      getItem: (candidate: string) => (candidate === key ? "37.5" : null),
      setItem: () => undefined,
      removeItem: () => undefined,
    };

    new Function("document", "window", "localStorage", siteJs())(document, window, localStorage);
    expect(link.textContent).toBe("Resume at 0:37");
    expect(summary.textContent).toBe("Saved locally in this browser.");
    expect(attributes.get("aria-label")).toBe("Resume fixture at 0:37");
  });

  it("removes stale resume state when pause or pagehide observes an explicit seek to zero", () => {
    const audioListeners = new Map<string, () => void>();
    const windowListeners = new Map<string, () => void>();
    const storage = new Map<string, string>();
    const sha256 = "a".repeat(64);
    const resumeKey = recordingResumeKey("recording_fixture_v1", sha256);
    const audio = {
      currentTime: 0,
      duration: 100,
      ended: false,
      readyState: 0,
      addEventListener: (event: string, listener: () => void) => audioListeners.set(event, listener),
    };
    const status = { textContent: "" };
    const player = {
      dataset: { recordingId: "recording_fixture_v1", audioSha256: sha256 },
      querySelector: (selector: string) =>
        selector === "[data-recording-audio]" ? audio : selector === "[data-recording-status]" ? status : null,
      querySelectorAll: () => [],
    };
    const document = {
      querySelector: (selector: string) => (selector === "[data-recording-player]" ? player : null),
      getElementById: () => null,
    };
    const window = {
      addEventListener: (event: string, listener: () => void) => windowListeners.set(event, listener),
    };
    const localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };

    new Function("document", "window", "localStorage", siteJs())(document, window, localStorage);
    storage.set(resumeKey, "37");
    audioListeners.get("pause")?.();
    expect(storage.has(resumeKey)).toBe(false);

    storage.set(resumeKey, "52");
    windowListeners.get("pagehide")?.();
    expect(storage.has(resumeKey)).toBe(false);
  });

  it("restores the live status after buffering recovers", () => {
    const audioListeners = new Map<string, () => void>();
    const sha256 = "a".repeat(64);
    const audio = {
      currentTime: 12,
      duration: 100,
      ended: false,
      paused: false,
      readyState: 1,
      addEventListener: (event: string, listener: () => void) => audioListeners.set(event, listener),
    };
    const status = { textContent: "" };
    const player = {
      dataset: { recordingId: "recording_fixture_v1", audioSha256: sha256 },
      querySelector: (selector: string) =>
        selector === "[data-recording-audio]" ? audio : selector === "[data-recording-status]" ? status : null,
      querySelectorAll: () => [],
    };
    const document = {
      querySelector: (selector: string) => (selector === "[data-recording-player]" ? player : null),
      getElementById: () => null,
    };
    const window = { addEventListener: () => undefined };
    const localStorage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };

    new Function("document", "window", "localStorage", siteJs())(document, window, localStorage);
    audioListeners.get("waiting")?.();
    expect(status.textContent).toBe("Loading audio…");
    audioListeners.get("playing")?.();
    expect(status.textContent).toBe("Playing.");

    audio.paused = true;
    audioListeners.get("waiting")?.();
    audioListeners.get("canplay")?.();
    expect(status.textContent).toBe("Ready at 12 seconds.");
  });

  it("persists an explicit chapter seek immediately and clears progress at chapter zero", () => {
    const audioListeners = new Map<string, () => void>();
    const buttonListeners = new Map<string, () => void>();
    const storage = new Map<string, string>();
    const sha256 = "a".repeat(64);
    const resumeKey = recordingResumeKey("recording_fixture_v1", sha256);
    const audio = {
      currentTime: 5,
      duration: 100,
      ended: false,
      readyState: 0,
      addEventListener: (event: string, listener: () => void) => audioListeners.set(event, listener),
    };
    const status = { textContent: "" };
    const chapterButton = {
      dataset: {
        chapterSeconds: "45",
        chapterTarget: "comm_fixture_0001",
        chapterHref: "reading-2.html#comm_fixture_0001",
      },
      textContent: "Middle 0:45",
      addEventListener: (event: string, listener: () => void) => buttonListeners.set(event, listener),
    };
    let scrollOptions: unknown;
    let targetAvailable = true;
    const player = {
      dataset: { recordingId: "recording_fixture_v1", audioSha256: sha256 },
      querySelector: (selector: string) =>
        selector === "[data-recording-audio]" ? audio : selector === "[data-recording-status]" ? status : null,
      querySelectorAll: (selector: string) => (selector === "[data-recording-chapter]" ? [chapterButton] : []),
    };
    const document = {
      querySelector: (selector: string) => (selector === "[data-recording-player]" ? player : null),
      getElementById: (id: string) =>
        targetAvailable && id === "comm_fixture_0001"
          ? { scrollIntoView: (options: unknown) => { scrollOptions = options; } }
          : null,
    };
    const window = { addEventListener: () => undefined, location: { href: "" } };
    const localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };

    storage.set(resumeKey, "5");
    new Function("document", "window", "localStorage", siteJs())(document, window, localStorage);
    buttonListeners.get("click")?.();
    expect(audio.currentTime).toBe(45);
    expect(storage.get(resumeKey)).toBe("45");
    expect(scrollOptions).toEqual({ block: "start" });
    expect(status.textContent).toBe("Ready at Middle 0:45.");

    targetAvailable = false;
    chapterButton.dataset.chapterSeconds = "60";
    buttonListeners.get("click")?.();
    expect(audio.currentTime).toBe(60);
    expect(storage.get(resumeKey)).toBe("60");
    expect(window.location.href).toBe("reading-2.html#comm_fixture_0001");

    targetAvailable = true;
    chapterButton.dataset.chapterSeconds = "0";
    buttonListeners.get("click")?.();
    expect(audio.currentTime).toBe(0);
    expect(storage.has(resumeKey)).toBe(false);
  });
});
