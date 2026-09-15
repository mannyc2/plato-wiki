import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { open, realpath } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
};

function inside(root: string, path: string) {
  const child = relative(root, path);
  return child === "" || (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`));
}

function byteRange(header: string, size: number): { start: number; end: number } | undefined {
  const match = /^bytes=(\d*)-(\d*)$/u.exec(header);
  if (!match || (!match[1] && !match[2]) || size === 0) return undefined;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return undefined;
  return { start, end };
}

/** Serve only the generated tree, with byte ranges so long recordings can seek. */
export async function createSiteServer(directory: string) {
  const root = await realpath(directory);
  async function serve(request: IncomingMessage, response: ServerResponse) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    let path: string;
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
      const candidate = resolve(root, `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`);
      if (!inside(root, candidate)) throw new Error("outside site");
      path = await realpath(candidate);
      if (!inside(root, path)) throw new Error("outside site");
    } catch {
      response.writeHead(404).end();
      return;
    }
    const file = await open(path, "r");
    try {
      const stat = await file.stat();
      if (!stat.isFile()) {
        response.writeHead(404).end();
        return;
      }
      const etag = `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
      response.setHeader("Content-Type", CONTENT_TYPES[extname(path)] ?? "application/octet-stream");
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.setHeader("Accept-Ranges", "bytes");
      response.setHeader("ETag", etag);
      // Paths are reused by later builds, so clients must revalidate cached audio.
      response.setHeader("Cache-Control", "no-cache");
      if (request.headers["if-none-match"]?.split(/\s*,\s*/u).includes(etag)) {
        response.writeHead(304).end();
        return;
      }
      const requestedRange = request.method === "GET" && (!request.headers["if-range"] || request.headers["if-range"] === etag)
        ? request.headers.range : undefined;
      let range: { start: number; end: number } | undefined;
      if (requestedRange) {
        range = byteRange(requestedRange, stat.size);
        if (!range) {
          response.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
          return;
        }
      }
      response.setHeader("Content-Length", range ? range.end - range.start + 1 : stat.size);
      if (range) response.setHeader("Content-Range", `bytes ${range.start}-${range.end}/${stat.size}`);
      response.writeHead(range ? 206 : 200);
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      await pipeline(file.createReadStream({ ...range, autoClose: false }), response);
    } finally {
      await file.close();
    }
  }
  return createServer((request, response) => {
    void serve(request, response).catch(() => {
      if (response.headersSent) response.destroy();
      else response.writeHead(500).end();
    });
  });
}
