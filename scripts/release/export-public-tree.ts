import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { getRepoRoot } from "../../packages/harness/src/paths.js";
import { isPublicHistoricalCommentaryAuditSample } from "./public-export-policy.js";

type Config = { schema_version: number; include: string[]; root_files: string[]; exclude: string[] };
type Entry = { path: string; sha256: string };

const root = getRepoRoot();
const configPath = "release/public-files.toml";
const config = Bun.TOML.parse(readFileSync(join(root, configPath), "utf8")) as unknown as Config;
const value = (name: string) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const outputArg = value("--out-dir");
const manifestArg = value("--manifest") ?? "release/private/public-export-manifest.json";
if (!outputArg) throw new Error("--out-dir is required");
const knownOptions = new Set(["--out-dir", "--manifest"]);
for (let index = 2; index < process.argv.length; index += 2) {
  const option = process.argv[index];
  if (!option || !knownOptions.has(option) || !process.argv[index + 1]) {
    throw new Error(`unknown or incomplete public-export option: ${option ?? "<missing>"}`);
  }
}
const output = resolve(root, outputArg);
if (output === root || output.startsWith(`${root}/`)) throw new Error("public export must be outside the private repository");
if (existsSync(output) && readdirSync(output).length > 0) throw new Error(`output directory is not empty: ${output}`);

const trackedStatus = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=no"], { cwd: root })
  .toString("utf8")
  .trim();
if (trackedStatus.length > 0) {
  throw new Error("public export requires a clean tracked working tree; commit the exact release candidate first");
}

const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root }).toString().split("\0").filter(Boolean).sort();
const selected = tracked.filter((path) => {
  if (config.exclude.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix))) return false;
  return config.root_files.includes(path) || config.include.some((prefix) => path.startsWith(prefix)) || path === configPath;
});
const sha256 = (content: Uint8Array) => createHash("sha256").update(content).digest("hex");
const commentaryProtocolContent = readFileSync(join(root, "docs/commentary-protocol.md"), "utf8");
const absolutePath = /\/Users\/|\/home\/|[A-Za-z]:\\Users\\/u;
const secretLike = /(?:sk-[A-Za-z0-9_-]{20,}|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|(?:API|ACCESS|SECRET)_KEY[\t ]*=[\t ]*[^\s#]+)/u;
const planReference = /(?:plans?\/0[0-9]{2}\b|plan[- _]?0[0-9]{2}\b)/iu;
// Accepted commentary audit manifests bind this protocol byte-for-byte. Its
// two historical campaign labels are inert prose, not links or operational
// dependencies; rewriting them would invalidate every accepted audit.
const immutableHistoricalPlanLabels = new Set([
  "docs/commentary-protocol.md",
  // The public allowlist must name the exact private one-off prefix it omits.
  "release/public-files.toml",
]);
const forbiddenTextPath = join(root, "release/private/public-forbidden-text.txt");
const forbiddenText = existsSync(forbiddenTextPath)
  ? readFileSync(forbiddenTextPath, "utf8").split("\n").map((line) => line.trim()).filter(Boolean)
  : [];
for (const path of selected) {
  const source = join(root, path);
  if (lstatSync(source).isSymbolicLink() || !lstatSync(source).isFile()) throw new Error(`unsafe tracked entry: ${path}`);
  const bytes = readFileSync(source);
  const text = bytes.toString("utf8");
  if (absolutePath.test(text)) throw new Error(`private absolute path in ${path}`);
  if (secretLike.test(text)) throw new Error(`secret-like material in ${path}`);
  if (
    planReference.test(text)
    && !immutableHistoricalPlanLabels.has(path)
    && !isPublicHistoricalCommentaryAuditSample(path, bytes, commentaryProtocolContent)
  ) {
    throw new Error(`private plan reference in ${path}`);
  }
  if (forbiddenText.some((value) => text.includes(value))) {
    throw new Error(`private history identifier in ${path}`);
  }
  const destination = join(output, path);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}
const files: Entry[] = selected.map((path) => ({ path, sha256: sha256(readFileSync(join(output, path))) }));
const allowlistSha256 = sha256(readFileSync(join(root, configPath)));
const manifest = {
  schemaVersion: 1,
  artifactKind: "plato-public-export-manifest",
  releaseVersion: "2.0.0",
  allowlistSha256,
  publicFilesSha256: allowlistSha256,
  files,
};
const manifestPath = resolve(root, manifestArg);
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`public export: ${relative(root, output) || output}; ${files.length} tracked files`);
