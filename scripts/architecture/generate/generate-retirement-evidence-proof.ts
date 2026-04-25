#!/usr/bin/env tsx
/**
 * Wave D §D.3 — Retirement Evidence Proof Generator
 *
 * Given a candidate retirement target (file or folder), runs `rg` across the
 * five required scopes and emits a JSON entry suitable for appending to
 * `generated/manifests/safe-change-evidence-ledger.json` (Constitution Rule 24).
 *
 * Usage:
 *   npx tsx scripts/architecture/generate/generate-retirement-evidence-proof.ts \
 *     --target <path> --kind <delete|merge|retire> --owner <name> [--reconciliation <url>]
 *
 * Output:
 *   - generated/manifests/deletion-merge-evidence-map.json (append entry)
 *   - prints a ready-to-append ledger entry to stdout
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "generated", "manifests", "deletion-merge-evidence-map.json");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const target = arg("target");
const kind = arg("kind") as "delete" | "merge" | "retire" | undefined;
const owner = arg("owner") ?? "unknown";
const reconciliation = arg("reconciliation") ?? null;

if (!target || !kind) {
  console.error("Usage: --target <path> --kind <delete|merge|retire> --owner <name> [--reconciliation <url>]");
  process.exit(2);
}
if (!["delete", "merge", "retire"].includes(kind)) {
  console.error(`Invalid --kind: ${kind}`);
  process.exit(2);
}
if (kind === "merge" && !reconciliation) {
  console.error("--reconciliation <url|ADR-id> is required for merge entries");
  process.exit(2);
}

function rg(pattern: string, scope: string): string {
  try {
    const out = execSync(`rg --no-heading --color=never -l ${JSON.stringify(pattern)} ${scope}`, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return out;
  } catch {
    return ""; // rg returns non-zero when no matches
  }
}

// Strip ".tsx", ".ts" etc. so imports without extension match too.
const stem = target.replace(/\.(tsx?|jsx?|mjs|cjs|json|md)$/i, "");
const probe = stem.replace(/^src\//, "@/");

function summarize(scopes: string[]): string | string[] {
  const hits = new Set<string>();
  for (const s of scopes) {
    const a = rg(target, s);
    const b = rg(probe, s);
    [...a.split("\n"), ...b.split("\n")].forEach((l) => l && hits.add(l));
  }
  // Always exclude self-references
  hits.delete(target);
  return hits.size === 0 ? "reference-zero" : [...hits].sort();
}

const evidence = {
  grepProof: summarize(["src"]),
  manifestProof: summarize(["generated/manifests"]),
  routeProof: summarize(["src/routes", "src/App.tsx"]),
  testProof: summarize(["tests", "src/__tests__"]),
  docsProof: summarize(["docs", "generated/audits"]),
  duplicateReconciliation: kind === "merge" ? reconciliation : null,
};

const changeId = `${kind}-${stem.replace(/[^a-z0-9]+/gi, "-")}-${Date.now()}`;
const entry = {
  changeId,
  kind,
  target,
  evidence,
  approvedAt: new Date().toISOString(),
  owner,
};

// Append to deletion-merge-evidence-map (separate from the append-only ledger)
let map: { generatedAt: string; entries: typeof entry[] } = { generatedAt: "", entries: [] };
if (existsSync(OUT)) {
  try {
    map = JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    map = { generatedAt: "", entries: [] };
  }
}
map.generatedAt = new Date().toISOString();
map.entries = [...(map.entries ?? []), entry];

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(map, null, 2) + "\n", "utf8");

console.log("─── ledger entry (append manually to safe-change-evidence-ledger.json) ───");
console.log(JSON.stringify(entry, null, 2));
console.log(
  `\n✅ Evidence emitted to ${OUT} (target=${target}, kind=${kind}, ` +
    `grep=${evidence.grepProof === "reference-zero" ? "ZERO" : (evidence.grepProof as string[]).length})`,
);