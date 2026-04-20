#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Ownership Manifest Generator
// Discovers producers + consumers for every JSON artifact in generated/
// Closes the "459 artifacts, only a subset have a declared producer" gap.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { scanDir, writeJsonOutput, readJsonSafe } from "../../architecture/lib/utils";

interface ArtifactEntry {
  artifact: string;
  producer: string | null;
  npmScript: string | null;
  owner: string;
  consumers: string[];
  declaredInRegistry: boolean;
  lastWrittenAt: string | null;
  source: "auto-discovered" | "registry" | "overlay" | "orphan";
}

const REPO_ROOT = process.cwd();
const GENERATED_DIR = "generated";
const SCRIPTS_DIR = "scripts";
const OUT_PATH = "generated/artifact-ownership-manifest.json";

// ── 1. Enumerate every JSON artifact on disk ─────────────────
const allArtifacts = scanDir(GENERATED_DIR, [".json", ".md", ".html", ".sarif", ".txt"])
  .map((p) => p.replace(/\\/g, "/"))
  .filter((p) => !p.endsWith("artifact-ownership-manifest.json")); // self-exclude

// ── 2. Scan every script for write calls into generated/ ─────
const allScripts = scanDir(SCRIPTS_DIR, [".ts", ".js", ".mjs", ".cjs"]);
const writePattern = /(?:writeJsonOutput|writeFileSync|writeFile|fs\.promises\.writeFile)\s*\(\s*["'`]([^"'`]*generated\/[^"'`]+)["'`]/g;
const dynamicWritePattern = /(?:writeJsonOutput|writeFileSync)\s*\(\s*(?:path\.join\s*\(\s*)?["'`]generated["'`]\s*,\s*["'`]([^"'`]+)["'`]/g;

const producerByPath = new Map<string, string>(); // artifactPath → scriptPath

for (const scriptPath of allScripts) {
  let content: string;
  try { content = fs.readFileSync(scriptPath, "utf-8"); } catch { continue; }
  const normalizedScript = scriptPath.replace(/\\/g, "/");

  for (const m of content.matchAll(writePattern)) {
    const artifact = m[1].replace(/\\/g, "/").replace(/^\.\//, "");
    if (artifact.startsWith("generated/")) {
      if (!producerByPath.has(artifact)) producerByPath.set(artifact, normalizedScript);
    }
  }
  for (const m of content.matchAll(dynamicWritePattern)) {
    const artifact = `generated/${m[1]}`.replace(/\\/g, "/");
    if (!producerByPath.has(artifact)) producerByPath.set(artifact, normalizedScript);
  }
}

// ── 3. Build npm-script reverse map (producer file → npm key) ─
const pkg = readJsonSafe<{ scripts: Record<string, string> }>("package.json");
const scriptToNpm = new Map<string, string>();
if (pkg?.scripts) {
  for (const [npmKey, cmd] of Object.entries(pkg.scripts)) {
    const m = cmd.match(/(?:tsx|ts-node|node)\s+([^\s]+\.(?:ts|js|mjs|cjs))/);
    if (m) {
      const scriptFile = m[1].replace(/\\/g, "/").replace(/^\.\//, "");
      if (!scriptToNpm.has(scriptFile)) scriptToNpm.set(scriptFile, npmKey);
    }
  }
}

// ── 4. Consumer discovery: scan checks for read calls ────────
const checksDir = "scripts/architecture/checks";
const checkScripts = fs.existsSync(checksDir) ? scanDir(checksDir, [".ts"]) : [];
const consumersByPath = new Map<string, Set<string>>();

for (const checkPath of checkScripts) {
  let content: string;
  try { content = fs.readFileSync(checkPath, "utf-8"); } catch { continue; }
  const normalized = checkPath.replace(/\\/g, "/");
  const readPattern = /["'`](generated\/[^"'`]+\.(?:json|md|html|sarif|txt))["'`]/g;
  for (const m of content.matchAll(readPattern)) {
    const artifact = m[1];
    if (!consumersByPath.has(artifact)) consumersByPath.set(artifact, new Set());
    consumersByPath.get(artifact)!.add(normalized);
  }
}

// ── 5. Manifest registry overlay ──────────────────────────────
let registryPaths = new Set<string>();
try {
  const regSrc = fs.readFileSync("src/lib/truth-manifests/manifest-registry.ts", "utf-8");
  for (const m of regSrc.matchAll(/path:\s*["'`](generated\/[^"'`]+)["'`]/g)) {
    registryPaths.add(m[1]);
  }
} catch { /* noop */ }

// ── 6. Hand-curated overlay (non-discoverable producers) ─────
let overlayMap = new Map<string, { producer: string; owner: string }>();
try {
  // Lazy import overlay (TS file at src/lib/architecture/artifact-ownership-registry.ts)
  const overlaySrc = fs.readFileSync("src/lib/architecture/artifact-ownership-registry.ts", "utf-8");
  const entryPattern = /\{\s*artifact:\s*["'`]([^"'`]+)["'`]\s*,\s*producer:\s*["'`]([^"'`]+)["'`]\s*,\s*owner:\s*["'`]([^"'`]+)["'`]/g;
  for (const m of overlaySrc.matchAll(entryPattern)) {
    overlayMap.set(m[1], { producer: m[2], owner: m[3] });
  }
} catch { /* overlay optional */ }

// ── 7. Owner inference from path segment ─────────────────────
function inferOwner(artifactPath: string): string {
  const seg = artifactPath.split("/")[1] || "";
  if (/^runtime|tier|conformance/.test(seg)) return "runtime";
  if (/^security|rls|secret|threat/.test(seg)) return "security";
  if (/^deploy|release|electron|os-|appliance|ova/.test(seg)) return "deployment";
  if (/^ai-|advisor|boardroom|prompt|workforce/.test(seg)) return "ai-workforce";
  if (/^connector|integration/.test(seg)) return "integrations";
  if (/^support|drill|runbook|chaos|dr-/.test(seg)) return "support";
  if (/^db|schema|migration/.test(seg)) return "platform";
  if (/^launch|attestation/.test(seg)) return "launch";
  if (/^compliance|governance|audit/.test(seg)) return "governance";
  if (/^operator|admin/.test(seg)) return "operations";
  return "architecture";
}

// ── 8. Build entries ─────────────────────────────────────────
const entries: ArtifactEntry[] = allArtifacts.map((artifact) => {
  const producer = producerByPath.get(artifact) || overlayMap.get(artifact)?.producer || null;
  const overlay = overlayMap.get(artifact);
  const owner = overlay?.owner || inferOwner(artifact);
  const consumers = Array.from(consumersByPath.get(artifact) || []).sort();
  const declared = registryPaths.has(artifact);
  let lastWritten: string | null = null;
  try { lastWritten = fs.statSync(artifact).mtime.toISOString(); } catch { /* noop */ }
  const source: ArtifactEntry["source"] = producer
    ? (producerByPath.has(artifact) ? "auto-discovered" : "overlay")
    : (declared ? "registry" : "orphan");
  const npmScript = producer ? scriptToNpm.get(producer) || null : null;
  return { artifact, producer, npmScript, owner, consumers, declaredInRegistry: declared, lastWrittenAt: lastWritten, source };
});

// ── 9. Coverage summary ──────────────────────────────────────
const total = entries.length;
const withProducer = entries.filter((e) => e.producer !== null).length;
const withoutProducer = total - withProducer;
const orphans = entries.filter((e) => e.source === "orphan").map((e) => e.artifact);
const coveragePercent = total === 0 ? 100 : Math.round((withProducer / total) * 1000) / 10;

const ownerBreakdown: Record<string, number> = {};
for (const e of entries) ownerBreakdown[e.owner] = (ownerBreakdown[e.owner] || 0) + 1;

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  generator: "scripts/manifests/generate/generate-artifact-ownership-manifest.ts",
  totalArtifacts: total,
  withProducer,
  withoutProducer,
  coveragePercent,
  orphanCount: orphans.length,
  declaredInRegistry: entries.filter((e) => e.declaredInRegistry).length,
  ownerBreakdown,
  orphans: orphans.slice(0, 50),
  entries: entries.sort((a, b) => a.artifact.localeCompare(b.artifact)),
};

writeJsonOutput(OUT_PATH, output);

console.log(`✅ Artifact Ownership Manifest`);
console.log(`   Total artifacts:     ${total}`);
console.log(`   With producer:       ${withProducer} (${coveragePercent}%)`);
console.log(`   Orphans:             ${orphans.length}`);
console.log(`   Declared in registry: ${output.declaredInRegistry}`);
console.log(`   Output:              ${OUT_PATH}`);
