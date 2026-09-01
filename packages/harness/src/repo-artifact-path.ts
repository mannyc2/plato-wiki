import { existsSync, lstatSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { getRepoRoot, normalizeRepoPath } from "./paths.js";

function canonicalRoot() {
  const root = getRepoRoot();
  const metadata = lstatSync(root);
  if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
    throw new Error(`Repository root traverses a symlink or realpath alias: ${root}`);
  }
  return realpathSync.native(root);
}

function assertCanonicalDirectory(path: string, expected: string, label: string) {
  const metadata = lstatSync(path);
  if (metadata.isSymbolicLink() || !metadata.isDirectory() || realpathSync.native(path) !== expected) {
    throw new Error(`${label} traverses a symlink or realpath alias: ${path}`);
  }
}

function assertExistingParents(relativePath: string, label: string) {
  const normalized = normalizeRepoPath(relativePath);
  const root = getRepoRoot();
  const realRoot = canonicalRoot();
  const parentParts = normalized.relativePath.split("/").slice(0, -1);
  let lexical = root;
  let expected = realRoot;
  for (const part of parentParts) {
    lexical = join(lexical, part);
    expected = join(expected, part);
    if (!existsSync(lexical)) break;
    assertCanonicalDirectory(lexical, expected, label);
  }
  return normalized.absolutePath;
}

/** Resolve a repo-relative file that must already exist as one canonical regular file. */
export function canonicalRepoFileForRead(relativePath: string, label: string) {
  const absolutePath = assertExistingParents(relativePath, label);
  if (!existsSync(absolutePath)) throw new Error(`Missing ${label}: ${relativePath}`);
  const metadata = lstatSync(absolutePath);
  const expected = resolve(canonicalRoot(), normalizeRepoPath(relativePath).relativePath);
  if (metadata.isSymbolicLink() || !metadata.isFile() || realpathSync.native(absolutePath) !== expected) {
    throw new Error(`${label} must be a canonical regular non-symlink file: ${relativePath}`);
  }
  return absolutePath;
}

/** Resolve a repo-relative write target while rejecting symlinked or aliased parents/targets. */
export function canonicalRepoFileForWrite(relativePath: string, label: string) {
  const absolutePath = assertExistingParents(relativePath, label);
  if (existsSync(absolutePath)) {
    const metadata = lstatSync(absolutePath);
    const expected = resolve(canonicalRoot(), normalizeRepoPath(relativePath).relativePath);
    if (metadata.isSymbolicLink() || !metadata.isFile() || realpathSync.native(absolutePath) !== expected) {
      throw new Error(`${label} must be a canonical regular non-symlink file: ${relativePath}`);
    }
  }
  return absolutePath;
}

/** Recheck a target after parent directories have been created. */
export function assertCanonicalRepoFileParent(relativePath: string, label: string) {
  const absolutePath = assertExistingParents(relativePath, label);
  const parent = dirname(absolutePath);
  const normalized = normalizeRepoPath(relativePath);
  const expectedParent = resolve(canonicalRoot(), ...normalized.relativePath.split("/").slice(0, -1));
  if (!existsSync(parent)) throw new Error(`Missing parent directory for ${label}: ${relativePath}`);
  assertCanonicalDirectory(parent, expectedParent, label);
  return absolutePath;
}

/** Resolve a repo-relative directory target while rejecting symlinked or aliased path components. */
export function canonicalRepoDirectoryForWrite(relativePath: string, label: string) {
  const normalized = normalizeRepoPath(`${relativePath}/.directory-sentinel`);
  const directoryPath = dirname(assertExistingParents(normalized.relativePath, label));
  if (existsSync(directoryPath)) {
    const expected = resolve(canonicalRoot(), relativePath);
    assertCanonicalDirectory(directoryPath, expected, label);
  }
  return directoryPath;
}
