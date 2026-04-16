#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Manifest vs Supabase Linkage Check
// Diffs generated/edge-function-governance-report.json against
// actual supabase/functions/* on disk
// ═══════════════════════════════════════════════════════════════
//
// Source of truth: supabase/functions/* directory inventory
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, readJsonSafe } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const MANIFEST_PATH = "generated/edge-function-governance-report.json";
const FUNCTIONS_DIR = "supabase/functions";

// ── Filesystem inventory ───────────────────────────────────────
const fsFunctions = new Set<string>();
if (fs.existsSync(FUNCTIONS_DIR)) {
  for (const entry of fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue; // _shared
    const indexPath = path.join(FUNCTIONS_DIR, entry.name, "index.ts");
    if (fs.existsSync(indexPath)) fsFunctions.add(entry.name);
  }
}

// ── Manifest inventory ─────────────────────────────────────────
const manifest = readJsonSafe<any>(MANIFEST_PATH);
const manifestFunctions = new Set<string>();
if (manifest) {
  const list =
    manifest.functions ||
    manifest.entries ||
    manifest.edgeFunctions ||
    [];
  for (const fn of list) {
    const name = typeof fn === "string" ? fn : fn.name || fn.id;
    if (name) manifestFunctions.add(name);
  }
}

// ── Diff ───────────────────────────────────────────────────────
let manifestOnly = 0;
let fsOnly = 0;
const manifestOnlySamples: string[] = [];
const fsOnlySamples: string[] = [];

for (const fn of manifestFunctions) {
  if (!fsFunctions.has(fn)) {
    manifestOnly++;
    manifestOnlySamples.push(fn);
  }
}
for (const fn of fsFunctions) {
  if (!manifestFunctions.has(fn)) {
    fsOnly++;
    fsOnlySamples.push(fn);
  }
}

// If manifest is missing/empty, that's a generation gap (warning, not error)
if (manifestFunctions.size === 0) {
  vc.add(
    MANIFEST_PATH,
    "empty-or-missing-manifest",
    `Edge function governance report is missing or empty. ${fsFunctions.size} functions exist on disk and are untracked.`,
    "warning"
  );
} else {
  const SAMPLE_LIMIT = 8;
  if (manifestOnly > 0) {
    vc.add(
      MANIFEST_PATH,
      "manifest-claims-missing-function",
      `${manifestOnly} function(s) in manifest do not exist in supabase/functions. Sample: ${manifestOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
      "error"
    );
  }
  if (fsOnly > 0) {
    vc.add(
      MANIFEST_PATH,
      "function-on-disk-not-in-manifest",
      `${fsOnly} edge function(s) on disk not in manifest (regenerate). Sample: ${fsOnlySamples.slice(0, SAMPLE_LIMIT).join(", ")}`,
      "warning"
    );
  }
}

console.log(
  `  🔌 Edge functions — manifest: ${manifestFunctions.size}, filesystem: ${fsFunctions.size}`
);
console.log(
  `  📊 Drift — manifest→missing-fs: ${manifestOnly}, fs→missing-manifest: ${fsOnly}`
);

vc.report("check-edge-function-manifest-vs-supabase");
vc.exitIfErrors();
