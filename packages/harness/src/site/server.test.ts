import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Server } from "node:http";
import { createSiteServer } from "./server.js";

let root = "";
let base = "";
let server: Server;
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "plato-site-http-"));
  const site = join(root, "site");
  await mkdir(site);
  await writeFile(join(site, "index.html"), "<h1>Listen</h1>");
  await writeFile(join(site, "complete.mp3"), "0123456789");
  await writeFile(join(root, "private.txt"), "private");
  await symlink(join(root, "private.txt"), join(site, "escape.txt"));
  server = await createSiteServer(site);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing server address");
  base = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
  await rm(root, { recursive: true, force: true });
});
test("serves complete files and HEAD metadata without a body", async () => {
  const page = await fetch(base);
  expect(await page.text()).toBe("<h1>Listen</h1>");
  const audio = await fetch(`${base}/complete.mp3`, { method: "HEAD" });
  expect(audio.status).toBe(200);
  expect(audio.headers.get("content-type")).toBe("audio/mpeg");
  expect(audio.headers.get("content-length")).toBe("10");
  expect(audio.headers.get("accept-ranges")).toBe("bytes");
  expect(await audio.text()).toBe("");
});
test("returns exact bounded, open-ended, and suffix bytes for seeking", async () => {
  for (const [range, expected, contentRange] of [
    ["bytes=2-5", "2345", "bytes 2-5/10"],
    ["bytes=7-", "789", "bytes 7-9/10"],
    ["bytes=-3", "789", "bytes 7-9/10"],
    ["bytes=8-100", "89", "bytes 8-9/10"],
  ]) {
    const result = await fetch(`${base}/complete.mp3`, { headers: { Range: range! } });
    expect(result.status).toBe(206);
    expect(result.headers.get("content-range")).toBe(contentRange);
    expect(await result.text()).toBe(expected);
  }
});
test("rejects impossible ranges and never serves paths outside the site", async () => {
  for (const range of ["bytes=10-", "bytes=-0", "bytes=6-2", "bytes=9007199254740992-"]) {
    const result = await fetch(`${base}/complete.mp3`, { headers: { Range: range } });
    expect(result.status).toBe(416);
    expect(result.headers.get("content-range")).toBe("bytes */10");
  }
  for (const path of ["/escape.txt", "/%2e%2e%2fprivate.txt", "/%ZZ", "/missing.mp3"]) {
    expect((await fetch(`${base}${path}`)).status).toBe(404);
  }
  expect((await fetch(base, { method: "POST" })).status).toBe(405);
});
test("revalidates cached audio and ignores ranges bound to an obsolete version", async () => {
  const first = await fetch(`${base}/complete.mp3`, { method: "HEAD" });
  const etag = first.headers.get("etag")!;
  const cached = await fetch(`${base}/complete.mp3`, { headers: { "If-None-Match": etag } });
  expect(cached.status).toBe(304);
  const stale = await fetch(`${base}/complete.mp3`, { headers: { Range: "bytes=2-3", "If-Range": '"obsolete"' } });
  expect(stale.status).toBe(200);
  expect(await stale.text()).toBe("0123456789");
});
