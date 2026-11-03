// Sketches are small Foldkit pages built on the design kit, one folder each under `sketches/`.
// Design reviews start here rather than as hand-written HTML, so every artifact shares the
// tokens and components the app will use, and improves when they do.
//
//   bun run sketch new <name>     copy the template to sketches/<name>
//   bun run sketch dev <name>     serve it with hot reload on every interface (Tailscale)
//   bun run sketch build <name>   write scratch/sketches/<name>/artifact.html to publish
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const appRoot = resolve(import.meta.dir, "../..");
const repoRoot = resolve(appRoot, "../..");
const sketchesDir = join(appRoot, "sketches");
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const sketchDir = (name: string | undefined, mustExist: boolean): string => {
  if (!name || !NAME.test(name)) return fail("name a sketch in kebab-case, such as `bookshelf-system`");
  const dir = join(sketchesDir, name);
  if (mustExist && !existsSync(join(dir, "index.html"))) return fail(`no sketch at ${dir}`);
  return dir;
};

const isHtmlBundle = (value: unknown): value is Bun.HTMLBundle =>
  typeof value === "object" && value !== null && "index" in value;

const serve = async (dir: string, port: number) => {
  const loaded: unknown = await import(join(dir, "index.html"));
  const index = typeof loaded === "object" && loaded !== null && "default" in loaded ? loaded.default : undefined;
  if (!isHtmlBundle(index)) return fail(`${dir}/index.html did not load as a page`);
  const server = Bun.serve({ hostname: "0.0.0.0", port, development: { hmr: true }, routes: { "/": index } });
  console.log(`serving ${dir} at ${server.url} (from a Mac: http://cjpher.tail5aecb5.ts.net:${server.port})`);
};

// The Artifact host supplies the doctype, head and body, so the published file is the page's
// title, font links, one inline stylesheet, the root and one inline module.
const inlineScript = (source: string) => source.replaceAll("</script", "<\\/script").replaceAll("<!--", "<\\!--");

// The kit's stylesheets are inlined as written. Bun's CSS minifier lowers syntax for older browsers,
// which rewrites font stacks and colour functions, so the artifact would no longer be the kit.
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//gu, "");

const build = async (dir: string, name: string) => {
  const source = readFileSync(join(dir, "index.html"), "utf8");
  const title = /<title>([^<]+)<\/title>/u.exec(source)?.[1] ?? fail("index.html needs a <title>");
  const script = /<script type="module" src="([^"]+)"><\/script>/u.exec(source)?.[1] ?? fail("index.html needs one module script");
  const fontLinks = source.match(/<link [^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/gu) ?? [];
  const sheets = [...source.matchAll(/<link rel="stylesheet" href="(\.[^"]+\.css)"/gu)].map((m) => resolve(dir, m[1] ?? ""));
  const outDir = join(repoRoot, "scratch", "sketches", name);
  rmSync(outDir, { recursive: true, force: true });
  const result = await Bun.build({ entrypoints: [resolve(dir, script)], target: "browser", minify: true });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    return fail(`build failed for ${name}`);
  }
  const [bundle, ...extra] = result.outputs;
  if (!bundle || extra.length > 0) return fail(`expected one script chunk, found ${result.outputs.length}`);
  const styles = sheets.map((sheet) => stripComments(readFileSync(sheet, "utf8")).trim());
  const artifact = [
    `<title>${title}</title>`,
    ...fontLinks,
    `<style>\n${styles.join("\n")}\n</style>`,
    `<div id="root"></div>`,
    `<script type="module">${inlineScript(await bundle.text())}</script>`,
    "",
  ].join("\n");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "artifact.html"), artifact);
  console.log(`${join(outDir, "artifact.html")} (${Math.round(artifact.length / 1024)} KB)`);
};

const [command, name, ...rest] = process.argv.slice(2);
switch (command) {
  case "new": {
    const dir = sketchDir(name, false);
    if (existsSync(dir)) fail(`${dir} already exists`);
    cpSync(join(sketchesDir, "template"), dir, { recursive: true });
    console.log(`created ${dir}; run \`bun run sketch dev ${name}\``);
    break;
  }
  case "dev": {
    const portFlag = rest.indexOf("--port");
    const port = portFlag >= 0 ? Number(rest[portFlag + 1]) : 4173;
    if (!Number.isInteger(port)) fail("--port takes a number");
    await serve(sketchDir(name, true), port);
    break;
  }
  case "build": {
    const dir = sketchDir(name, true);
    await build(dir, basename(dir));
    break;
  }
  default:
    fail("usage: bun run sketch <new|dev|build> <name> [--port 4173]");
}
