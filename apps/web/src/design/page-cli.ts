// Curated pages from the command line.
//
//   bun run pages check              every problem as `path:line: message`; exits 1 if there are any
//   bun run pages review <path...>   stamp the receipt once the user has read these pages, as
//                                    crito/43b-c.md; the hash is computed here, never typed
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkPages } from "./page-check";
import { PAGES_DIR, readPages, stamp } from "./page-sources";

const [command, ...paths] = process.argv.slice(2);

if (command === "check") {
  const problems = checkPages(readPages());
  for (const problem of problems) console.log(problem);
  console.log(problems.length === 0 ? `${readPages().length} pages pass` : `${problems.length} problems`);
  process.exit(problems.length === 0 ? 0 : 1);
}

if (command === "review" && paths.length > 0) {
  const date = new Date().toISOString().slice(0, 10);
  const problems = checkPages(readPages().filter(({ path }) => paths.includes(path)));
  const unknown = paths.filter((path) => !readPages().some((page) => page.path === path));
  if (unknown.length > 0 || problems.some((problem) => !problem.includes("has changed since the user read it"))) {
    for (const path of unknown) console.error(`${path}: no such page`);
    for (const problem of problems) console.error(problem);
    process.exit(1);
  }
  for (const path of paths) {
    const file = join(PAGES_DIR, path);
    writeFileSync(file, stamp(readFileSync(file, "utf8"), date));
    console.log(`${path}: reviewed ${date}`);
  }
  process.exit(0);
}

console.error("usage: bun run pages check | bun run pages review <path...>");
process.exit(1);
