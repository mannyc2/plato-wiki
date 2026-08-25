import { smokeSite } from "../../packages/harness/src/site-smoke.js";

function option(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const baseUrl = option("--base-url");
const expectedRevision = option("--expected-revision");
const expectedManifestSha256 = option("--expected-manifest-sha256");
const knownOptions = new Set(["--base-url", "--expected-revision", "--expected-manifest-sha256"]);
for (let index = 2; index < process.argv.length; index += 2) {
  const argument = process.argv[index];
  if (!argument || !knownOptions.has(argument) || !process.argv[index + 1]) {
    throw new Error(`unknown or incomplete smoke option: ${argument ?? "<missing>"}`);
  }
}
if (!baseUrl || !expectedRevision || !expectedManifestSha256) {
  throw new Error("--base-url, --expected-revision, and --expected-manifest-sha256 are required");
}

const marker = await smokeSite({ baseUrl, expectedRevision, expectedManifestSha256 });
console.log(`site smoke passed: ${baseUrl} ${marker.sourceRevision}`);
