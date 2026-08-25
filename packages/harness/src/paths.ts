import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = resolve(currentDir, "../../..");
let currentRepoRoot = defaultRepoRoot;

export function getRepoRoot() {
  return currentRepoRoot;
}

export function setRepoRootForTesting(root: string) {
  currentRepoRoot = resolve(root);
  return () => {
    currentRepoRoot = defaultRepoRoot;
  };
}

export function normalizeRepoPath(input: string) {
  const repoRoot = getRepoRoot();
  const absolutePath = resolve(repoRoot, input);
  const relativePath = relative(repoRoot, absolutePath);

  if (relativePath === "" || isAbsolute(relativePath) || relativePath === ".." || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`Path is outside the repository: ${input}`);
  }

  return {
    absolutePath,
    relativePath: relativePath.split(sep).join("/"),
  };
}
