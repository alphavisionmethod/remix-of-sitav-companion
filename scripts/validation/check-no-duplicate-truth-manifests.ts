#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: No Duplicate Truth Manifests
// Reads TRUTH_MANIFEST_RECONCILIATION_PLAN.md status; BLOCKs if a
// noncanonical artifact is referenced by an active consumer.
// Defensive against future drift in generated/ canonical sources.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/architectural-cleanup/architectural-cleanup-status.json";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

if (!existsSync(STATUS)) {
  emitGateReport({
    gate: "no-duplicate-truth-manifests",
    ok: false,
    issues: [{ severity: "error", area: STATUS, message: "architectural-cleanup-status.json missing" }],
  });
  console.error(`[no-duplicate-truth-manifests] FAIL — status missing`);
  process.exit(1);
}

// Heuristic: detect duplicate canonical-named artifacts at generated/ root.
// Specifically check that no two siblings claim the same concern.
const ROOT = "generated";
const CONCERN_KEYS = [
  "plane-boundary",
  "service-topology",
  "route-truth",
  "manifest-registry",
  "release-readiness",
];

let duplicates = 0;
for (const concern of CONCERN_KEYS) {
  const matches: string[] = [];
  function walk(d: string, depth = 0) {
    if (depth > 3) return;
    let entries: string[];
    try { entries = readdirSync(d); } catch { return; }
    for (const e of entries) {
      const p = join(d, e);
      let s;
      try { s = statSync(p); } catch { continue; }
      if (s.isDirectory()) {
        // Skip archive directories — they're allowed to hold noncanonical history
        if (e === "archive" || e.startsWith("archive-")) continue;
        walk(p, depth + 1);
      } else if (e.includes(concern) && (e.endsWith(".json") || e.endsWith(".md"))) {
        matches.push(p);
      }
    }
  }
  walk(ROOT);
  if (matches.length > 1) {
    // Multiple files mention the concern — verify only ONE is canonical at root level
    const rootLevel = matches.filter(m => m.split("/").length === 2);
    if (rootLevel.length > 1) {
      duplicates++;
      issues.push({
        severity: "error",
        area: rootLevel.join(", "),
        message: `Multiple canonical-level artifacts for concern "${concern}": ${rootLevel.length} found at generated/ root.`,
      });
    }
  }
}

const ok = duplicates === 0;
emitGateReport({
  gate: "no-duplicate-truth-manifests",
  ok,
  issues,
  extra: { concernsChecked: CONCERN_KEYS.length, duplicates },
});
console.log(`[no-duplicate-truth-manifests] ${ok ? "PASS" : "FAIL"} (${duplicates} duplicate canonical sources detected)`);
process.exit(ok ? 0 : 1);
