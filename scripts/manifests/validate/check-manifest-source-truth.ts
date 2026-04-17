#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Source Truth Check (Phase 26 / Gate 37)
// Bidirectional registry ↔ disk truth. Eliminates manifest theater.
//
// FAILS when:
//   1. Any generated/*.json on disk is NOT registered in MANIFEST_REGISTRY (orphan-on-disk)
//   2. Any MANIFEST_REGISTRY entry path does NOT exist on disk          (phantom)
//   3. Any "authoritative" entry's validator script does NOT exist      (missing-validator)
//
// Emits generated/manifest-theater-report.json with full snapshot.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../../architecture/lib/utils";
import { MANIFEST_REGISTRY } from "../../../src/lib/truth-manifests/manifest-registry";

const vc = new ViolationCollector();
const generatedDir = "generated";

// ── 1. Inventory disk ─────────────────────────────────────────────
const onDiskJson = fs.existsSync(generatedDir)
  ? fs
      .readdirSync(generatedDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => `${generatedDir}/${f}`)
  : [];

const onDiskMd = fs.existsSync(generatedDir)
  ? fs
      .readdirSync(generatedDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => `${generatedDir}/${f}`)
  : [];

// Skip the report this gate itself emits to avoid bootstrap chicken/egg
const SELF_EMITTED = new Set(["generated/manifest-theater-report.json"]);

// ── 2. Build registry index ───────────────────────────────────────
const registeredPaths = new Set(MANIFEST_REGISTRY.map((m) => m.path));

// ── 3. Find orphans (on disk, not registered) ─────────────────────
const orphanOnDisk: string[] = [];
for (const p of [...onDiskJson, ...onDiskMd]) {
  if (SELF_EMITTED.has(p)) continue;
  if (!registeredPaths.has(p)) {
    orphanOnDisk.push(p);
    vc.add(p, "orphan-artifact", `Generated artifact "${p}" is not registered in MANIFEST_REGISTRY`);
  }
}

// ── 4. Find phantoms (registered, not on disk) ────────────────────
const phantomEntries: Array<{ id: string; path: string }> = [];
for (const entry of MANIFEST_REGISTRY) {
  if (!fs.existsSync(entry.path)) {
    phantomEntries.push({ id: entry.id, path: entry.path });
    vc.add(entry.path, "phantom-entry", `Registry entry "${entry.id}" points to missing file "${entry.path}"`);
  }
}

// ── 5. Find missing validators on authoritative entries ───────────
const missingValidators: Array<{ id: string; validator: string }> = [];
for (const entry of MANIFEST_REGISTRY) {
  if (entry.authority !== "authoritative") continue;
  if (!entry.validator) continue;
  if (!fs.existsSync(entry.validator)) {
    missingValidators.push({ id: entry.id, validator: entry.validator });
    vc.add(entry.validator, "missing-validator", `Authoritative entry "${entry.id}" declares validator "${entry.validator}" which does not exist on disk`);
  }
}

// ── 6. Aggregate snapshot ─────────────────────────────────────────
const byClass: Record<string, number> = {};
const byAuthority: Record<string, number> = {};
for (const entry of MANIFEST_REGISTRY) {
  byClass[entry.class] = (byClass[entry.class] ?? 0) + 1;
  byAuthority[entry.authority] = (byAuthority[entry.authority] ?? 0) + 1;
}

const ok = orphanOnDisk.length === 0 && phantomEntries.length === 0 && missingValidators.length === 0;

const report = {
  generatedAt: new Date().toISOString(),
  phase: "phase-26-manifest-truth",
  gate: "manifest-theater-elimination",
  ok,
  totals: {
    registry: MANIFEST_REGISTRY.length,
    onDiskJson: onDiskJson.length,
    onDiskMd: onDiskMd.length,
    orphanOnDisk: orphanOnDisk.length,
    phantomEntries: phantomEntries.length,
    missingValidators: missingValidators.length,
  },
  byClass,
  byAuthority,
  orphanOnDisk,
  phantomEntries,
  missingValidators,
};

const outPath = path.join(generatedDir, "manifest-theater-report.json");
fs.mkdirSync(generatedDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");

console.log(`📦 Manifest Theater Check`);
console.log(`   registry entries: ${MANIFEST_REGISTRY.length}`);
console.log(`   on-disk JSON:     ${onDiskJson.length}`);
console.log(`   on-disk MD:       ${onDiskMd.length}`);
console.log(`   orphans:          ${orphanOnDisk.length}`);
console.log(`   phantoms:         ${phantomEntries.length}`);
console.log(`   missing validators: ${missingValidators.length}`);
console.log(`   → ${outPath}`);

vc.report("check-manifest-source-truth");
vc.exitIfErrors();
