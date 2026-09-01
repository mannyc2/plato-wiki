import { existsSync, lstatSync, mkdirSync, mkdtempSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

const CANONICAL_ONTOLOGY_AUDIT_PACKAGE_RE =
  /^wiki\/ontology-audits\/sha256-[a-f0-9]{64}$/u;

function canonicalDirectory(path: string, label: string) {
  const lexical = resolve(path);
  if (!existsSync(lexical)) throw new Error(`${label} is missing: ${lexical}`);
  const metadata = lstatSync(lexical);
  if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
    throw new Error(`${label} must be one real directory: ${lexical}`);
  }
  const real = realpathSync(lexical);
  if (real !== lexical) {
    throw new Error(`${label} must use its exact real path with no symlinked parent component: ${lexical} != ${real}`);
  }
  return lexical;
}

function missing(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function assertCanonicalOptionalFile(path: string, label: string) {
  try {
    const metadata = lstatSync(path);
    if (metadata.isSymbolicLink() || !metadata.isFile() || realpathSync(path) !== path) {
      throw new Error(`${label} must be a canonical regular non-symlink file: ${path}`);
    }
  } catch (error) {
    if (missing(error)) return;
    throw error;
  }
}

function assertCanonicalOptionalDirectory(path: string, label: string) {
  try {
    const metadata = lstatSync(path);
    if (metadata.isSymbolicLink() || !metadata.isDirectory() || realpathSync(path) !== path) {
      throw new Error(`${label} must be a canonical regular non-symlink directory: ${path}`);
    }
  } catch (error) {
    if (missing(error)) return;
    throw error;
  }
}

/**
 * Resolve the only write-authorized audit-package identity.  This check is
 * intentionally dependency-neutral so every mutation entrypoint can invoke it
 * before touching acceptance, manifests, partitions, receipts, or projections.
 */
export function resolveCanonicalOntologyAuditPackage({
  repoRoot,
  packagePath,
}: {
  repoRoot: string;
  packagePath: string;
}) {
  const root = canonicalDirectory(repoRoot, "Repository root");
  const lexicalPackage = resolve(isAbsolute(packagePath) ? packagePath : join(root, packagePath));
  const logical = relative(root, lexicalPackage).split("\\").join("/");
  if (!CANONICAL_ONTOLOGY_AUDIT_PACKAGE_RE.test(logical)) {
    throw new Error(`Ontology audit package is not the exact canonical snapshot location: ${logical}`);
  }
  const absolute = canonicalDirectory(lexicalPackage, "Ontology audit package");
  return Object.freeze({ repoRoot: root, absolute, logical });
}

/** Create or re-open the one canonical sibling scratch root used by closure. */
export function ensureCanonicalOntologyWorkRoot(repoRoot: string) {
  const root = canonicalDirectory(repoRoot, "Repository root");
  const parent = canonicalDirectory(dirname(root), "Repository parent");
  const workRoot = join(parent, "work");
  try {
    mkdirSync(workRoot);
  } catch (error) {
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== "EEXIST") throw error;
  }
  return canonicalDirectory(workRoot, "Ontology work root");
}

export function createCanonicalOntologyRegenerationWorkspace(repoRoot: string) {
  const workRoot = ensureCanonicalOntologyWorkRoot(repoRoot);
  const temporaryRoot = canonicalDirectory(
    mkdtempSync(join(workRoot, "ontology-regeneration-")),
    "Ontology regeneration workspace",
  );
  return Object.freeze({
    workRoot,
    temporaryRoot,
    siteOne: join(temporaryRoot, "site-one"),
    siteTwo: join(temporaryRoot, "site-two"),
    manifestOne: join(temporaryRoot, "run-one.json"),
    manifestTwo: join(temporaryRoot, "run-two.json"),
  });
}

/**
 * Reject direct or miswired worker argv before a site builder can remove or
 * write any path. Site and manifest paths are exact paired children of one
 * real `work/ontology-regeneration-*` workspace.
 */
export function assertCanonicalOntologyRegenerationWorkerPaths({
  repoRoot,
  siteDirectory,
  manifestPath,
}: {
  repoRoot: string;
  siteDirectory: string;
  manifestPath?: string;
}) {
  const workRoot = ensureCanonicalOntologyWorkRoot(repoRoot);
  const site = resolve(siteDirectory);
  const temporaryRoot = dirname(site);
  const workspaceName = basename(temporaryRoot);
  if (
    dirname(temporaryRoot) !== workRoot
    || !/^ontology-regeneration-[A-Za-z0-9_-]+$/u.test(workspaceName)
  ) {
    throw new Error(`Ontology regeneration site is outside a minted canonical work-root workspace: ${site}`);
  }
  canonicalDirectory(temporaryRoot, "Ontology regeneration workspace");
  const siteName = basename(site);
  if ((siteName !== "site-one" && siteName !== "site-two") || site !== join(temporaryRoot, siteName)) {
    throw new Error(`Ontology regeneration site is not an exact worker child: ${site}`);
  }
  assertCanonicalOptionalDirectory(site, "Ontology regeneration site");

  if (manifestPath !== undefined) {
    const manifest = resolve(manifestPath);
    const expectedManifest = join(
      temporaryRoot,
      siteName === "site-one" ? "run-one.json" : "run-two.json",
    );
    if (manifest !== expectedManifest) {
      throw new Error(`Ontology regeneration manifest is not the exact paired worker child: ${manifest}`);
    }
    assertCanonicalOptionalFile(manifest, "Ontology regeneration manifest");
  }
  return Object.freeze({ workRoot, temporaryRoot, siteDirectory: site, manifestPath });
}

/** Resolve a fixed repo-relative output without following parent/target links. */
export function resolveCanonicalOntologyRepoFileWriteTarget({
  repoRoot,
  relativePath,
  label,
}: {
  repoRoot: string;
  relativePath: string;
  label: string;
}) {
  const root = canonicalDirectory(repoRoot, "Repository root");
  const absolute = resolve(root, relativePath);
  const logical = relative(root, absolute).split("\\").join("/");
  if (logical === ".." || logical.startsWith("../") || logical.startsWith("/") || logical !== relativePath) {
    throw new Error(`${label} must be one normalized repo-relative file path: ${relativePath}`);
  }
  canonicalDirectory(dirname(absolute), `${label} parent`);
  assertCanonicalOptionalFile(absolute, label);
  return absolute;
}
