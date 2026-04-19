#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Doc Canonicality
// Verifies every canonical hardening / closure markdown under
// generated/architecture-hardening/ is referenced by at least one of:
//   • another generated/* JSON or markdown
//   • a validator under scripts/validation/
//   • a CI workflow under .github/workflows/
//   • the release readiness aggregator
// Orphaned canonical docs trigger WARN (not BLOCK) so this is an
// honest drift detector, not a brittle gate.
// ═══════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const TARGET_DIR = "generated/architecture-hardening";
const SEARCH_ROOTS = [
  "generated",
  "scripts",
  ".github/workflows",
  "src/components/admin/ai-runtime",
  "src/pages/admin/ai-runtime",
  "docs",
];

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function walk(d: string): string[] {
  const out: string[] = [];
  if (!existsSync(d)) return out;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

if (!existsSync(TARGET_DIR)) {
  emitGateReport({
    gate: "doc-canonicality",
    ok: false,
    issues: [
      { severity: "error", area: TARGET_DIR, message: "Architecture-hardening directory missing." },
    ],
    extra: { targetDir: TARGET_DIR, present: false },
  });
  console.log(`[doc-canonicality] FAIL (target dir missing)`);
  process.exit(1);
}

const canonicalDocs = readdirSync(TARGET_DIR).filter((f) => f.endsWith(".md"));
const allFiles: string[] = [];
for (const r of SEARCH_ROOTS) allFiles.push(...walk(r));

let referenced = 0;
let orphans = 0;
const orphanList: string[] = [];

for (const doc of canonicalDocs) {
  const docPath = join(TARGET_DIR, doc);
  let isReferenced = false;
  for (const f of allFiles) {
    if (f === docPath) continue;
    try {
      const src = readFileSync(f, "utf8");
      if (src.includes(doc) || src.includes(docPath)) {
        isReferenced = true;
        break;
      }
    } catch {}
  }
  if (isReferenced) referenced++;
  else {
    orphans++;
    orphanList.push(doc);
    issues.push({
      severity: "warning",
      area: docPath,
      message: "Canonical hardening doc has no inbound reference (potential orphan).",
    });
  }
}

// Honest WARN: orphans don't BLOCK; only missing target dir does.
const ok = true;
emitGateReport({
  gate: "doc-canonicality",
  ok,
  issues,
  extra: { canonicalDocs: canonicalDocs.length, referenced, orphans, orphanList },
});
console.log(`[doc-canonicality] PASS (referenced=${referenced} orphans=${orphans} / ${canonicalDocs.length})`);
process.exit(0);
