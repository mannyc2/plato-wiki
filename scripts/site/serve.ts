import { createSiteServer } from "../../packages/harness/src/site/server.js";

const options = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (!key || !["--directory", "--host", "--port"].includes(key) || !value || options.has(key)) {
    throw new Error("Usage: bun scripts/site/serve.ts --directory <site> [--host <address>] [--port <port>]");
  }
  options.set(key, value);
}
const directory = options.get("--directory");
if (!directory) throw new Error("--directory is required");
const port = Number(options.get("--port") ?? "8080");
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error("Invalid port");
const host = options.get("--host") ?? "127.0.0.1";
const server = await createSiteServer(directory);
server.listen(port, host, () => console.log(`Serving ${directory} at http://${host}:${port}`));
for (const signal of ["SIGTERM", "SIGINT"] as const) process.on(signal, () => server.close());
