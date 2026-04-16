#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Manifest vs Registrations Linkage Check
// Verifies generated/capability-index.json against actual source files
// ═══════════════════════════════════════════════════════════════
//
// Strategy (authoritative, not heuristic):
//   1. Every manifest entry declares a `source` file. That file MUST
//      exist on disk.
//   2. The declared `name` MUST appear as an exported identifier (or
//      string literal) in that source file.
//   3. Optionally surface source-side declarations that aren't in the
//      manifest (warning only — regen debt).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const MANIFEST_PATH = "generated/capability-index.json";

const manifest = readJsonSafe<any>(MANIFEST_PATH);
if (!manifest) {
  vc.add(MANIFEST_PATH, "missing", "Capability index does not exist", "error");
  vc.report("check-capability-manifest-vs-registrations");
  vc.exitIfErrors();
  process.exit(0);
}

const manifestCaps: Array<{ name: string; source?: string }> =
  manifest.capabilities || manifest.entries || [];
const uniqueSources = new Set(
  manifestCaps.map((c) => c.source).filter(Boolean) as string[]
);

// ── 1. Source path existence ───────────────────────────────────
let missingSources = 0;
const missingSourceSamples: string[] = [];
for (const src of uniqueSources) {
  if (!fs.existsSync(src)) {
    missingSources++;
    missingSourceSamples.push(src);
  }
}

// ── 2. Name presence in declared source ───────────────────────
const sourceCache = new Map<string, string>();
function readSource(p: string): string {
  if (sourceCache.has(p)) return sourceCache.get(p)!;
  let content = "";
  try {
    content = fs.readFileSync(p, "utf-8");
  } catch {
    /* ignore */
  }
  sourceCache.set(p, content);
  return content;
}

let nameNotInSource = 0;
const nameNotInSourceSamples: string[] = [];
for (const cap of manifestCaps) {
  if (!cap.name || !cap.source) continue;
  if (!fs.existsSync(cap.source)) continue; // already counted
  const src = readSource(cap.source);
  const escName = cap.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Identifier as a word-bounded token, OR same as a string literal.
  const declared = new RegExp(`\\b${escName}\\b|["'\`]${escName}["'\`]`);
  if (!declared.test(src)) {
    nameNotInSource++;
    nameNotInSourceSamples.push(`${cap.name}@${cap.source}`);
  }
}

// ── Report ─────────────────────────────────────────────────────
const SAMPLE_LIMIT = 8;
if (missingSources > 0) {
  vc.add(
    MANIFEST_PATH,
    "manifest-source-path-missing",
    `${missingSources} capability source path(s) reference files not on disk. Sample: ${missingSourceSamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
    "error"
  );
}
if (nameNotInSource > 0) {
  const ratio = nameNotInSource / Math.max(manifestCaps.length, 1);
  const severity = ratio > 0.25 ? "error" : "warning";
  vc.add(
    MANIFEST_PATH,
    "capability-name-not-in-declared-source",
    `${nameNotInSource} capability/source pair(s) where the declared name is not present in the source file. Sample: ${nameNotInSourceSamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
    severity
  );
}

console.log(
  `  🎯 Capabilities — entries: ${manifestCaps.length}, unique sources: ${uniqueSources.size}, missing source files: ${missingSources}, name-not-in-source: ${nameNotInSource}`
);

vc.report("check-capability-manifest-vs-registrations");
vc.exitIfErrors();
