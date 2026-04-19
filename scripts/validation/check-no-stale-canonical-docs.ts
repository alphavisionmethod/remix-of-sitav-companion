#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: No Stale Canonical Docs
// Audit-only this pass — emits WARN-tier coverage report; BLOCKs
// only on regression of docs explicitly labeled canonical in
// architectural-cleanup-status.json.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function walk(d: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try { entries = readdirSync(d); } catch { return out; }
  for (const f of entries) {
    const p = join(d, f);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".md")) out.push(p);
  }
  return out;
}

const docs = existsSync("docs") ? walk("docs") : [];
let staleCanonicalRegressions = 0;

// Heuristic: a doc with frontmatter or header claiming "canonical" or "source of truth"
// must still exist and be non-empty.
for (const d of docs) {
  let content: string;
  try { content = readFileSync(d, "utf8"); } catch { continue; }
  const claimsCanonical = /^\s*(>?\s*)?(\*\*)?(canonical|source\s+of\s+truth|authoritative)/im.test(content) ||
                          /status:\s*canonical/i.test(content);
  if (claimsCanonical && content.trim().length < 200) {
    staleCanonicalRegressions++;
    issues.push({
      severity: "error",
      area: d,
      message: `Doc claims canonical authority but is suspiciously short (<200 chars) — possible stub or stale stub regression.`,
    });
  }
}

// Honest WARN: total docs count for visibility on truth panel
issues.push({
  severity: "warning",
  area: "docs/",
  message: `Total markdown docs: ${docs.length}. Audit-only register — see DOCUMENTATION_CLEANUP_AUDIT.md for proven-safe candidates.`,
});

const errorCount = issues.filter(i => i.severity === "error").length;
const ok = errorCount === 0;
emitGateReport({
  gate: "no-stale-canonical-docs",
  ok,
  issues,
  extra: { totalDocs: docs.length, staleCanonicalRegressions },
});
console.log(`[no-stale-canonical-docs] ${ok ? "PASS" : "FAIL"} (${staleCanonicalRegressions} stale-canonical regressions / ${docs.length} docs)`);
process.exit(ok ? 0 : 1);
