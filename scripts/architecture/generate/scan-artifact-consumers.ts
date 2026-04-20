#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Consumer Scanner
// Walks scripts/, src/, supabase/functions/, os/ and detects
// every reference to a generated/**/*.json or public/generated/**/*.json
// artifact. Emits generated/artifact-consumer-scan.json.
//
// Detection patterns:
//   • readJsonSafe("generated/...") / readFileSync("generated/...")
//   • JSON.parse with generated/... literal nearby
//   • fetch("/generated/..."), import.meta.glob("/generated/...")
//   • Bare string literals "generated/<name>.json"
// Every artifact name from generated/artifact-ownership-manifest.json
// is checked individually as a fast-path bare-name match.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import { scanDir, writeJsonOutput, readJsonSafe, envelope } from "../lib/utils";

interface ConsumerRef {
  path: string;
  kind: "script" | "component" | "edge-function" | "shell" | "other";
  line: number;
  pattern: "readJsonSafe" | "readFileSync" | "fetch" | "import.meta.glob" | "literal";
}

interface ArtifactConsumers {
  artifact: string;
  consumerCount: number;
  consumers: ConsumerRef[];
}

const OUT_PATH = "generated/artifact-consumer-scan.json";

// 1. Source surface
const allFiles: string[] = [
  ...scanDir("scripts", [".ts", ".js", ".mjs", ".cjs"]),
  ...scanDir("src", [".ts", ".tsx", ".js", ".jsx"]),
  ...(fs.existsSync("supabase/functions") ? scanDir("supabase/functions", [".ts"]) : []),
  ...(fs.existsSync("os") ? scanDir("os", [".sh", ".bash", ".ts"]) : []),
];

function classify(p: string): ConsumerRef["kind"] {
  if (p.startsWith("supabase/functions/")) return "edge-function";
  if (p.startsWith("src/")) return "component";
  if (p.startsWith("scripts/")) return "script";
  if (p.endsWith(".sh") || p.endsWith(".bash")) return "shell";
  return "other";
}

// 2. Authoritative artifact list comes from the producer manifest
const ownership = readJsonSafe<{ entries: Array<{ artifact: string }> }>("generated/artifact-ownership-manifest.json");
if (!ownership) {
  console.error("❌ generated/artifact-ownership-manifest.json missing — run generate:artifact-ownership first.");
  process.exit(1);
}
const artifactNames = ownership.entries
  .map(e => e.artifact)
  .filter(a => a.endsWith(".json") || a.endsWith(".md"));

// We only score JSON artifacts for the graph (md mirrors are terminal docs)
const jsonArtifacts = artifactNames.filter(a => a.endsWith(".json"));

// Build a map: bare filename → full artifact path (e.g., "routes-manifest.json" → "generated/routes-manifest.json")
const bareToArtifact = new Map<string, string>();
for (const a of jsonArtifacts) {
  const bare = path.basename(a);
  if (!bareToArtifact.has(bare)) bareToArtifact.set(bare, a);
}

// 3. Pre-compile per-file content + line index
const fileLines = new Map<string, string[]>();
for (const f of allFiles) {
  try {
    const norm = f.replace(/\\/g, "/");
    fileLines.set(norm, fs.readFileSync(f, "utf-8").split("\n"));
  } catch { /* skip unreadable */ }
}

// 4. Pattern matchers
const PATTERNS: Array<{ name: ConsumerRef["pattern"]; rx: RegExp }> = [
  { name: "readJsonSafe", rx: /readJsonSafe\s*<?[^>]*>?\s*\(\s*["'`]([^"'`]+\.json)["'`]/g },
  { name: "readFileSync", rx: /readFileSync\s*\(\s*["'`]([^"'`]+\.json)["'`]/g },
  { name: "fetch", rx: /fetch\s*\(\s*["'`](\/?(?:public\/)?generated\/[^"'`]+\.json)["'`]/g },
  { name: "import.meta.glob", rx: /import\.meta\.glob\s*\(\s*["'`]([^"'`]*generated[^"'`]+)["'`]/g },
];

// 5. Scan
const consumerMap = new Map<string, ConsumerRef[]>();
for (const a of jsonArtifacts) consumerMap.set(a, []);

function recordHit(artifact: string, file: string, lineIdx: number, pattern: ConsumerRef["pattern"]) {
  const arr = consumerMap.get(artifact);
  if (!arr) return;
  // Dedupe identical (file,line,pattern)
  if (arr.some(c => c.path === file && c.line === lineIdx + 1 && c.pattern === pattern)) return;
  arr.push({ path: file, kind: classify(file), line: lineIdx + 1, pattern });
}

function normalizeRef(ref: string): string | null {
  // strip leading "/" or "public/" so "generated/..." canonical form wins
  let r = ref.replace(/^\/+/, "");
  if (r.startsWith("public/generated/")) r = r.replace(/^public\//, "");
  if (r.startsWith("generated/")) return r;
  // Bare filename match
  const bare = path.basename(r);
  if (bareToArtifact.has(bare)) return bareToArtifact.get(bare)!;
  return null;
}

for (const [file, lines] of fileLines) {
  // Skip self (the consumer scanner output) and any artifact files themselves
  if (file.includes("artifact-consumer-scan") || file.includes("artifact-ownership-graph")) continue;

  // Pattern-based scan (precise call-site detection)
  const fullText = lines.join("\n");
  for (const { name, rx } of PATTERNS) {
    rx.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(fullText)) !== null) {
      const ref = normalizeRef(m[1]);
      if (!ref) continue;
      // Find line number
      const upTo = fullText.slice(0, m.index);
      const lineIdx = (upTo.match(/\n/g) || []).length;
      recordHit(ref, file, lineIdx, name);
    }
  }

  // Bare-name literal scan (catches dynamic / templated reads)
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    // Quick reject: must contain a quoted token ending in .json
    if (!ln.includes(".json")) continue;
    // Check for any artifact's basename inside a string literal
    const literalMatches = ln.matchAll(/["'`]([^"'`]*?[A-Za-z0-9_-]+\.json)["'`]/g);
    for (const lm of literalMatches) {
      const ref = normalizeRef(lm[1]);
      if (!ref) continue;
      // Skip — we already recorded structured patterns; only add if no PATTERN already hit this exact line
      const arr = consumerMap.get(ref)!;
      if (arr.some(c => c.path === file && c.line === i + 1)) continue;
      recordHit(ref, file, i, "literal");
    }
  }
}

// 6. Emit
const result: ArtifactConsumers[] = [];
let totalEdges = 0;
let consumed = 0;
for (const [artifact, refs] of consumerMap) {
  if (refs.length > 0) consumed++;
  totalEdges += refs.length;
  result.push({ artifact, consumerCount: refs.length, consumers: refs });
}
result.sort((a, b) => b.consumerCount - a.consumerCount || a.artifact.localeCompare(b.artifact));

const summary = {
  totalArtifactsScanned: jsonArtifacts.length,
  artifactsWithConsumers: consumed,
  consumerCoveragePercent: jsonArtifacts.length === 0 ? 0 : Math.round((consumed / jsonArtifacts.length) * 100),
  totalEdges,
  filesScanned: fileLines.size,
  artifacts: result,
};

writeJsonOutput(OUT_PATH, envelope("1.0.0", summary));
console.log(`✅ scan-artifact-consumers: ${consumed}/${jsonArtifacts.length} artifacts have consumers (${summary.consumerCoveragePercent}%), ${totalEdges} edges across ${fileLines.size} files`);
