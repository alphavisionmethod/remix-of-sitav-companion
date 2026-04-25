#!/usr/bin/env tsx
/**
 * SITA OS — Generated Artifact Governance Map (Wave B / Constitution §B.1)
 *
 * Walks `generated/**`, classifies every artifact (lifecycleClass,
 * freshnessTtlDays, owningScript, publishable, ageDays, stale), and emits:
 *   - generated/manifests/generated-artifact-governance-map.json
 *
 * Classification rules: see docs/architecture/GENERATED_ARTIFACT_LIFECYCLE_MODEL.md.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const GEN = path.join(ROOT, "generated");
const SRC = path.join(ROOT, "src");
const OUT = path.join(GEN, "manifests", "generated-artifact-governance-map.json");

type LifecycleClass = "active-blocking" | "active-informational" | "reference" | "historical-archived";
const TTL: Record<LifecycleClass, number | null> = {
  "active-blocking": 7,
  "active-informational": 30,
  "reference": 180,
  "historical-archived": null,
};

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (e.isFile() && (e.name.endsWith(".json") || e.name.endsWith(".md"))) out.push(f);
  }
  return out;
}

// Parse VALIDATOR_GATE_OVERRIDES for block-classified validators.
const vgmText = fs.readFileSync(path.join(SRC, "lib/ci/validator-gate-map.ts"), "utf8");
const blockValidators = new Set<string>();
const reBlock = /validator:\s*"([^"]+)"[^}]*?classification:\s*"block"/gs;
let m: RegExpExecArray | null;
while ((m = reBlock.exec(vgmText))) blockValidators.add(m[1]);

// Load all check-*.ts contents.
const checksDir = path.join(ROOT, "scripts/architecture/checks");
const checkFiles = fs.existsSync(checksDir)
  ? fs.readdirSync(checksDir).filter((f) => f.startsWith("check-") && f.endsWith(".ts"))
  : [];
const checkContents = new Map<string, string>();
for (const c of checkFiles) checkContents.set(c, fs.readFileSync(path.join(checksDir, c), "utf8"));

// Load all script contents (for owning-script lookup).
const scriptContents = new Map<string, string>();
function walkScripts(d: string) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walkScripts(f);
    else if (e.isFile() && /\.(ts|mjs|js)$/.test(e.name)) {
      try { scriptContents.set(f, fs.readFileSync(f, "utf8")); } catch {}
    }
  }
}
walkScripts(path.join(ROOT, "scripts"));

function findOwningScript(rel: string): string | null {
  for (const [s, c] of scriptContents) {
    if (c.includes(rel)) return path.relative(ROOT, s).replace(/\\/g, "/");
  }
  return null;
}

function classify(rel: string): LifecycleClass {
  if (/\/audits\/wave-\d+/.test(rel) || /historical/.test(rel) || /-baseline\.json$/.test(rel)) {
    return "historical-archived";
  }
  for (const v of blockValidators) {
    const c = checkContents.get(`${v}.ts`);
    if (c && c.includes(rel)) return "active-blocking";
  }
  for (const c of checkContents.values()) {
    if (c.includes(rel)) return "active-informational";
  }
  return "reference";
}

const ONE_DAY = 86400000;
const now = Date.now();
const entries: Array<Record<string, unknown>> = [];
const stats: Record<string, number> = { total: 0, "active-blocking": 0, "active-informational": 0, "reference": 0, "historical-archived": 0, stale: 0, orphan: 0 };

for (const f of walk(GEN)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const stat = fs.statSync(f);
  const ageDays = +((now - stat.mtimeMs) / ONE_DAY).toFixed(1);
  const lifecycleClass = classify(rel);
  const owningScript = findOwningScript(rel);
  const ttl = TTL[lifecycleClass];
  const stale = ttl !== null && ageDays > ttl;
  entries.push({
    path: rel,
    lifecycleClass,
    freshnessTtlDays: ttl,
    owningScript,
    publishable: lifecycleClass !== "active-blocking",
    lastModifiedISO: stat.mtime.toISOString(),
    ageDays,
    stale,
  });
  stats.total++;
  stats[lifecycleClass]++;
  if (stale) stats.stale++;
  if (!owningScript && lifecycleClass !== "historical-archived") stats.orphan++;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), stats, entries }, null, 2) + "\n", "utf8");
console.log(`✅ Wrote ${entries.length} entries to ${OUT}`);
console.log(`   Stats:`, stats);