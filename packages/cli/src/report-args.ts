export type EditionTarget = "corpus" | "knowledge-base" | "audio-edition";
export type ReleaseTarget = Exclude<EditionTarget, "corpus">;

export type ReportArgs<T extends EditionTarget = EditionTarget> = {
  target: T;
  write: boolean;
  json: boolean;
  allowIncomplete: boolean;
  publicTree?: string;
  exportManifest?: string;
};

function oneValue(args: string[], name: string) {
  const indexes = args.flatMap((arg, index) => arg === name ? [index] : []);
  if (indexes.length > 1) throw new Error(`Duplicate option: ${name}`);
  if (indexes.length === 0) return undefined;
  const value = args[indexes[0]! + 1];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
  return value;
}

export function parseReportArgs(kind: "completeness", args: string[]): ReportArgs<EditionTarget>;
export function parseReportArgs(kind: "release", args: string[]): ReportArgs<ReleaseTarget>;
export function parseReportArgs(kind: "completeness" | "release", args: string[]): ReportArgs {
  const valueOptions = new Set(["--target", "--public-tree", "--export-manifest"]);
  const flagOptions = new Set(["--write", "--json", "--allow-incomplete"]);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (valueOptions.has(arg)) {
      index += 1;
      if (index >= args.length || args[index]!.startsWith("--")) throw new Error(`Missing value for ${arg}`);
    } else if (!flagOptions.has(arg)) {
      throw new Error(`Unknown report option: ${arg}`);
    }
  }
  for (const flag of flagOptions) {
    if (args.filter((arg) => arg === flag).length > 1) throw new Error(`Duplicate option: ${flag}`);
  }
  const rawTarget = oneValue(args, "--target");
  if (!rawTarget) throw new Error("Missing value for --target");
  const targets = kind === "release" ? ["knowledge-base", "audio-edition"] : ["corpus", "knowledge-base", "audio-edition"];
  if (!targets.includes(rawTarget)) throw new Error(`Unknown ${kind} target: ${rawTarget}`);
  const write = args.includes("--write");
  const json = args.includes("--json");
  if (write && json) throw new Error("--write and --json are mutually exclusive");
  const publicTree = oneValue(args, "--public-tree");
  const exportManifest = oneValue(args, "--export-manifest");
  if (kind === "completeness" && (publicTree || exportManifest)) {
    throw new Error("--public-tree and --export-manifest are release-audit options");
  }
  return {
    target: rawTarget as EditionTarget,
    write,
    json,
    allowIncomplete: args.includes("--allow-incomplete"),
    ...(publicTree ? { publicTree } : {}),
    ...(exportManifest ? { exportManifest } : {}),
  };
}

export function reportExitCode(ready: boolean, allowIncomplete: boolean) {
  return ready || allowIncomplete ? 0 : 2;
}

