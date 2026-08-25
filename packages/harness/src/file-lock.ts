import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1_000;
const DEFAULT_STALE_MS = 30 * 60 * 1_000;
const RETRY_MS = 100;

/**
 * A write lock is taken on the repo-relative paths a body actually writes, never
 * on a free-form label. Two callers that touch the same file are mutually
 * exclusive even when their labels differ, and two callers that touch different
 * files never block each other.
 */
export type WriteLockScope = {
  /** Repo-relative or absolute paths the body writes. */
  paths: string[];
  /** Diagnostic only. Recorded in the lock owner file; never affects exclusion. */
  label: string;
};

function sleepSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function positiveEnvInteger(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function lockRoot() {
  return join(getRepoRoot(), "scratch/wiki-write-locks");
}

/**
 * Lock directory for one repo-relative path. The readable prefix is for humans
 * reading `scratch/wiki-write-locks`; the hash suffix is what makes it unique,
 * because sanitizing separators is not injective.
 */
export function lockPathForTarget(relativePath: string) {
  const readable = relativePath.replace(/[^a-zA-Z0-9._-]+/g, "__").slice(0, 80);
  const digest = createHash("sha256").update(relativePath).digest("hex").slice(0, 16);
  return join(lockRoot(), `${readable}.${digest}.lock`);
}

/** Distinct, sorted repo-relative targets. Sorted order is what prevents deadlock. */
export function resolveLockTargets(paths: string[]) {
  if (paths.length === 0) throw new Error("A repo write lock requires at least one target path");

  const relative = paths.map((path) => normalizeRepoPath(path).relativePath);
  return [...new Set(relative)].sort();
}

function removeStaleLock(path: string, staleMs: number) {
  if (!existsSync(path)) return;

  const ageMs = Date.now() - statSync(path).mtimeMs;
  if (ageMs < staleMs) return;

  rmSync(path, { recursive: true, force: true });
}

function acquire(path: string, label: string, target: string, timeoutMs: number, staleMs: number) {
  const startedAt = Date.now();

  for (;;) {
    try {
      mkdirSync(dirname(path), { recursive: true });
      mkdirSync(path);
      writeFileSync(
        join(path, "owner.json"),
        JSON.stringify({ label, target, pid: process.pid, createdAt: new Date().toISOString() }, null, 2),
        "utf8",
      );
      return;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
      if (code !== "EEXIST") throw error;

      removeStaleLock(path, staleMs);
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error(`Timed out waiting for wiki write lock on ${target}: ${label}`);
      }
      sleepSync(RETRY_MS);
    }
  }
}

/**
 * Run `body` holding an exclusive lock on every path in `scope.paths`.
 *
 * Locks are acquired in sorted target order and released in reverse, so
 * concurrent multi-path callers cannot deadlock against each other.
 */
export function withRepoWriteLock<T>(scope: WriteLockScope, body: () => T): T {
  const targets = resolveLockTargets(scope.paths);
  const timeoutMs = positiveEnvInteger("WIKI_WRITE_LOCK_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
  const staleMs = positiveEnvInteger("WIKI_WRITE_LOCK_STALE_MS", DEFAULT_STALE_MS);
  const held: string[] = [];

  try {
    for (const target of targets) {
      const path = lockPathForTarget(target);
      acquire(path, scope.label, target, timeoutMs, staleMs);
      held.push(path);
    }

    return body();
  } finally {
    for (const path of held.reverse()) {
      rmSync(path, { recursive: true, force: true });
    }
  }
}
