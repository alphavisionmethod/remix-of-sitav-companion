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
  source: "auto-discovered" | "registry" | "overlay" | "directory-inferred" | "orphan";
}

const GENERATED_DIR = "generated";
const SCRIPTS_DIR = "scripts";
const OUT_PATH = "generated/artifact-ownership-manifest.json";

// ── 1. Enumerate every artifact on disk ──────────────────────
const allArtifacts = scanDir(GENERATED_DIR, [".json", ".md", ".html", ".sarif", ".txt", ".yaml", ".yml"])
  .map((p) => p.replace(/\\/g, "/"))
  .filter((p) => !p.endsWith("artifact-ownership-manifest.json"));

// ── 2. Build per-script directory-constant table ─────────────
// Plus: scan ALL scripts (and shells/edge functions) for any "generated/<dir>" literal
// to catch the many emit-style validators that don't use a constant.
const allScripts = [
  ...scanDir(SCRIPTS_DIR, [".ts", ".js", ".mjs", ".cjs", ".sh", ".bash"]),
  ...(fs.existsSync("supabase/functions") ? scanDir("supabase/functions", [".ts"]) : []),
  ...(fs.existsSync("os/scripts") ? scanDir("os/scripts", [".sh", ".bash"]) : []),
];
const scriptDirConsts = new Map<string, Map<string, string>>();
const scriptContents = new Map<string, string>();
const scriptMentionsDir = new Map<string, Set<string>>(); // script → "generated/<dir>" referenced AND has a write call

const constPattern = /(?:const|let)\s+([A-Z_][A-Z0-9_]*)\s*=\s*["'`]([^"'`]+)["'`]/g;
const joinConstPattern = /(?:const|let)\s+([A-Z_][A-Z0-9_]*)\s*=\s*(?:path\.)?join\s*\(\s*["'`]([^"'`]+)["'`](?:\s*,\s*["'`]([^"'`]+)["'`])?\s*\)/g;
const dirMentionPattern = /["'`](generated\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)?)["'`]/gi;
const writeIndicator = /(?:writeFileSync|writeJsonOutput|writeFile|Deno\.writeTextFile|>\s*"?generated\/|>>\s*"?generated\/|tee\s+generated\/)/;

for (const scriptPath of allScripts) {
  let content: string;
  try { content = fs.readFileSync(scriptPath, "utf-8"); } catch { continue; }
  const normalized = scriptPath.replace(/\\/g, "/");
  scriptContents.set(normalized, content);
  const consts = new Map<string, string>();
  for (const m of content.matchAll(constPattern)) {
    if (m[2].includes("generated/") || m[2].startsWith("generated")) consts.set(m[1], m[2]);
  }
  for (const m of content.matchAll(joinConstPattern)) {
    const composed = m[3] ? `${m[2]}/${m[3]}` : m[2];
    if (composed.includes("generated")) consts.set(m[1], composed);
  }
  scriptDirConsts.set(normalized, consts);

  if (writeIndicator.test(content)) {
    const mentions = new Set<string>();
    for (const m of content.matchAll(dirMentionPattern)) mentions.add(m[1]);
    if (mentions.size > 0) scriptMentionsDir.set(normalized, mentions);
  }
}

// ── 3. Discover write calls and resolve to artifact paths ────
const producerByPath = new Map<string, string>();

// 3a. Direct literal writes: writeFileSync("generated/...", ...)
const literalWrite = /(?:writeJsonOutput|writeFileSync|writeFile|fs\.promises\.writeFile)\s*\(\s*["'`]([^"'`]*generated\/[^"'`]+)["'`]/g;
// 3b. path.join/resolve with literal: writeFileSync(path.join("generated/x", "y.json"), ...)
const joinLiteralWrite = /(?:writeJsonOutput|writeFileSync|writeFile)\s*\(\s*(?:path\.)?(?:join|resolve)\s*\(\s*["'`](generated\/[^"'`]+|generated)["'`]\s*,\s*["'`]([^"'`]+)["'`]\s*\)/g;
// 3c. path.join/resolve with const: writeFileSync(path.join(OUT_DIR, "y.json"), ...)
const joinConstWrite = /(?:writeJsonOutput|writeFileSync|writeFile)\s*\(\s*(?:path\.)?(?:join|resolve)\s*\(\s*([A-Z_][A-Z0-9_]*)\s*,\s*["'`]([^"'`]+)["'`]\s*\)/g;
// 3d. const-only write: writeJsonOutput(OUT_PATH, ...) where OUT_PATH points to generated/
const constOnlyWrite = /(?:writeJsonOutput|writeFileSync|writeFile)\s*\(\s*([A-Z_][A-Z0-9_]*)\s*,/g;
// 3e. Template literal: writeFileSync(`generated/${x}/file.json`, ...)
const templateWrite = /(?:writeJsonOutput|writeFileSync|writeFile)\s*\(\s*`(generated\/[^`]+)`/g;

function record(artifact: string, scriptPath: string) {
  const norm = artifact.replace(/\\/g, "/").replace(/^\.\//, "");
  if (!norm.startsWith("generated/")) return;
  if (norm.includes("${")) return; // unresolved template
  if (!producerByPath.has(norm)) producerByPath.set(norm, scriptPath);
}

for (const [scriptPath, content] of scriptContents) {
  const consts = scriptDirConsts.get(scriptPath) || new Map();
  for (const m of content.matchAll(literalWrite)) record(m[1], scriptPath);
  for (const m of content.matchAll(joinLiteralWrite)) record(`${m[1]}/${m[2]}`, scriptPath);
  for (const m of content.matchAll(joinConstWrite)) {
    const base = consts.get(m[1]);
    if (base) record(`${base}/${m[2]}`, scriptPath);
  }
  for (const m of content.matchAll(constOnlyWrite)) {
    const target = consts.get(m[1]);
    if (target && target.endsWith(".json") || target?.endsWith(".md")) record(target, scriptPath);
    else if (target && /\.[a-z]+$/i.test(target)) record(target, scriptPath);
  }
  for (const m of content.matchAll(templateWrite)) {
    if (!m[1].includes("${")) record(m[1], scriptPath);
  }
}

// ── 4. Directory-level inference for unresolved artifacts ────
// If an artifact's parent dir matches a known producer's OUT_DIR, attribute the producer.
const dirOwnerMap = new Map<string, string>(); // generated/<sub> → scriptPath
for (const [scriptPath, consts] of scriptDirConsts) {
  for (const dirVal of consts.values()) {
    if (dirVal.startsWith("generated/") && !dirOwnerMap.has(dirVal)) {
      dirOwnerMap.set(dirVal, scriptPath);
    }
  }
}
// Also attribute scripts that mention "generated/<dir>" AND contain a write call
for (const [scriptPath, mentions] of scriptMentionsDir) {
  for (const dir of mentions) {
    if (!dirOwnerMap.has(dir)) dirOwnerMap.set(dir, scriptPath);
  }
}

// ── 5. Build npm-script reverse map (load early so directory inference can use it) ─
const pkg = readJsonSafe<{ scripts: Record<string, string> }>("package.json");
const scriptToNpm = new Map<string, string>();
if (pkg?.scripts) {
  for (const [npmKey, cmd] of Object.entries(pkg.scripts)) {
    const m = cmd.match(/(?:tsx|ts-node|node|deno run -A)\s+([^\s;&|]+\.(?:ts|js|mjs|cjs))/);
    if (m) {
      const f = m[1].replace(/\\/g, "/").replace(/^\.\//, "");
      if (!scriptToNpm.has(f)) scriptToNpm.set(f, npmKey);
    }
  }
}

// Also attribute by package.json script command mentions of "generated/<dir>" — for
// `closure:* :emit` scripts that declare static curated dirs via echo statements.
if (pkg?.scripts) {
  for (const [npmKey, cmd] of Object.entries(pkg.scripts)) {
    const dirMatches = [...cmd.matchAll(/(generated\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)?)/gi)];
    for (const dm of dirMatches) {
      const dir = dm[1];
      if (!dirOwnerMap.has(dir)) dirOwnerMap.set(dir, `package.json#${npmKey}`);
    }
  }
}

// ── 6. Consumer discovery ────────────────────────────────────
const checksDir = "scripts/architecture/checks";
const checkScripts = fs.existsSync(checksDir) ? scanDir(checksDir, [".ts"]) : [];
const consumersByPath = new Map<string, Set<string>>();
const consumerByDir = new Map<string, Set<string>>();
for (const checkPath of checkScripts) {
  const content = scriptContents.get(checkPath.replace(/\\/g, "/")) ?? (() => { try { return fs.readFileSync(checkPath, "utf-8"); } catch { return ""; } })();
  const norm = checkPath.replace(/\\/g, "/");
  const readPattern = /["'`](generated\/[^"'`]+\.(?:json|md|html|sarif|txt|yaml|yml))["'`]/g;
  for (const m of content.matchAll(readPattern)) {
    if (!consumersByPath.has(m[1])) consumersByPath.set(m[1], new Set());
    consumersByPath.get(m[1])!.add(norm);
  }
  // Directory-level consumers (e.g. scanDir("generated/foo"))
  const dirReadPattern = /["'`](generated\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)?)["'`]/gi;
  for (const m of content.matchAll(dirReadPattern)) {
    if (!consumerByDir.has(m[1])) consumerByDir.set(m[1], new Set());
    consumerByDir.get(m[1])!.add(norm);
  }
}

// ── 7. Manifest registry overlay ─────────────────────────────
const registryPaths = new Set<string>();
try {
  const regSrc = fs.readFileSync("src/lib/truth-manifests/manifest-registry.ts", "utf-8");
  for (const m of regSrc.matchAll(/path:\s*["'`](generated\/[^"'`]+)["'`]/g)) registryPaths.add(m[1]);
} catch { /* noop */ }

// ── 8. Hand-curated overlay ──────────────────────────────────
const overlayMap = new Map<string, { producer: string; owner: string }>();
try {
  const overlaySrc = fs.readFileSync("src/lib/architecture/artifact-ownership-registry.ts", "utf-8");
  const entryPattern = /\{\s*artifact:\s*["'`]([^"'`]+)["'`]\s*,\s*producer:\s*["'`]([^"'`]+)["'`]\s*,\s*owner:\s*["'`]([^"'`]+)["'`]/g;
  for (const m of overlaySrc.matchAll(entryPattern)) overlayMap.set(m[1], { producer: m[2], owner: m[3] });
} catch { /* optional */ }

// ── 9. Owner inference ───────────────────────────────────────
function inferOwner(p: string): string {
  const seg = p.split("/")[1] || "";
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

// ── 9b. Filename-fuzzy script index for top-level orphan recovery ─
const scriptByBaseName = new Map<string, string>();
for (const sp of allScripts) {
  const norm = sp.replace(/\\/g, "/");
  const base = path.basename(norm).replace(/\.(ts|js|mjs|cjs|sh|bash)$/, "");
  if (!scriptByBaseName.has(base)) scriptByBaseName.set(base, norm);
}
function fuzzyMatchScript(artifact: string): string | null {
  const filename = path.basename(artifact).replace(/\.(json|md|html|sarif|txt|yaml|yml)$/, "");
  const candidates = [
    `check-${filename}`,
    `emit-${filename}`,
    `generate-${filename}`,
    `check-${filename.replace(/-report$/, "")}`,
    `check-${filename.replace(/-map$/, "")}`,
    `check-${filename.replace(/-summary$/, "")}`,
    `check-${filename.replace(/-manifest$/, "")}`,
    `emit-${filename.replace(/-report$/, "")}`,
    `generate-${filename.replace(/-manifest$/, "")}`,
    `generate-${filename.replace(/-report$/, "")}`,
  ];
  for (const c of candidates) {
    const found = scriptByBaseName.get(c);
    if (found) return found;
  }
  return null;
}

// ── 10. Build entries ────────────────────────────────────────
const entries: ArtifactEntry[] = allArtifacts.map((artifact) => {
  let producer = producerByPath.get(artifact) || overlayMap.get(artifact)?.producer || null;
  let source: ArtifactEntry["source"] = producer
    ? (producerByPath.has(artifact) ? "auto-discovered" : "overlay")
    : "orphan";

  if (!producer) {
    const parent = artifact.split("/").slice(0, 2).join("/");
    const grandparent = artifact.split("/").slice(0, 3).join("/");
    const found = dirOwnerMap.get(grandparent) || dirOwnerMap.get(parent);
    if (found) { producer = found; source = "directory-inferred"; }
  }

  if (!producer) {
    const fuzzy = fuzzyMatchScript(artifact);
    if (fuzzy) { producer = fuzzy; source = "directory-inferred"; }
  }

  if (!producer && registryPaths.has(artifact)) source = "registry";

  const overlay = overlayMap.get(artifact);
  const owner = overlay?.owner || inferOwner(artifact);

  // Direct + directory consumers
  const directConsumers = Array.from(consumersByPath.get(artifact) || []);
  const parent = artifact.split("/").slice(0, 2).join("/");
  const dirConsumers = Array.from(consumerByDir.get(parent) || []);
  const consumers = Array.from(new Set([...directConsumers, ...dirConsumers])).sort();

  let lastWritten: string | null = null;
  try { lastWritten = fs.statSync(artifact).mtime.toISOString(); } catch { /* noop */ }

  const npmScript = producer ? scriptToNpm.get(producer) || null : null;

  return { artifact, producer, npmScript, owner, consumers, declaredInRegistry: registryPaths.has(artifact), lastWrittenAt: lastWritten, source };
});

// ── 11. Coverage summary ─────────────────────────────────────
const total = entries.length;
const withProducer = entries.filter((e) => e.producer !== null).length;
const orphans = entries.filter((e) => e.source === "orphan").map((e) => e.artifact);
const coveragePercent = total === 0 ? 100 : Math.round((withProducer / total) * 1000) / 10;

const ownerBreakdown: Record<string, number> = {};
const sourceBreakdown: Record<string, number> = {};
for (const e of entries) {
  ownerBreakdown[e.owner] = (ownerBreakdown[e.owner] || 0) + 1;
  sourceBreakdown[e.source] = (sourceBreakdown[e.source] || 0) + 1;
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  generator: "scripts/manifests/generate/generate-artifact-ownership-manifest.ts",
  totalArtifacts: total,
  withProducer,
  withoutProducer: total - withProducer,
  coveragePercent,
  orphanCount: orphans.length,
  declaredInRegistry: entries.filter((e) => e.declaredInRegistry).length,
  ownerBreakdown,
  sourceBreakdown,
  orphans: orphans.slice(0, 100),
  entries: entries.sort((a, b) => a.artifact.localeCompare(b.artifact)),
};

writeJsonOutput(OUT_PATH, output);

console.log(`✅ Artifact Ownership Manifest`);
console.log(`   Total artifacts:     ${total}`);
console.log(`   With producer:       ${withProducer} (${coveragePercent}%)`);
console.log(`   Orphans:             ${orphans.length}`);
console.log(`   Declared in registry: ${output.declaredInRegistry}`);
console.log(`   Source breakdown:    ${JSON.stringify(sourceBreakdown)}`);
console.log(`   Output:              ${OUT_PATH}`);
