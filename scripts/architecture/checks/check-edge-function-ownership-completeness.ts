#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Ownership Completeness (BLOCK gate #26)
//
// Asserts:
//   1. Every function in supabase/functions/<name>/index.ts (excluding
//      _shared / _tests / shared / _lib) has an entry in
//      EDGE_FUNCTION_OWNER_MAP — i.e. 100% ownership coverage.
//   2. No phantom entries (owner map references nonexistent functions).
//   3. Every ownership-manifest entry has non-empty primaryContact,
//      escalationContact, slackChannel, reviewerCodeOwners.
//   4. generated/edge-function-ownership.json and the public mirror
//      exist, are byte-identical (md5), and were regenerated within
//      the last 7 days (freshness window).
//
// Wired into:
//   - scripts/architecture/checks/check-os-release-readiness.ts (REQUIRED_GATES)
//   - src/lib/ci/ci-gate-registry.ts (severity: blocker)
//   - package.json: check:edge-function-ownership-completeness
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {
  EDGE_FUNCTION_OWNER_MAP,
  EDGE_FUNCTION_OWNERSHIP_MANIFEST,
} from "../../../src/lib/backend-topology/edge-function-owner-map";

const FUNCTIONS_DIR = "supabase/functions";
const SHARED_DIRS = new Set(["_shared", "_tests", "shared", "_lib"]);
const CANONICAL = "generated/edge-function-ownership.json";
const PUBLIC_MIRROR = "public/generated/edge-function-ownership.json";
const COLOCATED_MIRROR = "supabase/functions/_owners.json";
const FRESHNESS_DAYS = 7;
const REPORT_PATH = "generated/edge-function-ownership-completeness-report.json";

interface Violation { kind: string; subject: string; detail: string; }
const violations: Violation[] = [];

function listEdgeFunctions(): string[] {
  if (!fs.existsSync(FUNCTIONS_DIR)) return [];
  return fs.readdirSync(FUNCTIONS_DIR)
    .filter((name) => {
      if (SHARED_DIRS.has(name)) return false;
      if (name.startsWith(".")) return false;
      const full = path.join(FUNCTIONS_DIR, name);
      try {
        return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "index.ts"));
      } catch { return false; }
    })
    .sort();
}

function md5(p: string): string | null {
  if (!fs.existsSync(p)) return null;
  return crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");
}

const onDisk = listEdgeFunctions();
const owned = new Set(Object.keys(EDGE_FUNCTION_OWNER_MAP));

// 1. Coverage
const orphans = onDisk.filter((fn) => !owned.has(fn));
for (const o of orphans) {
  violations.push({ kind: "unowned-function", subject: o,
    detail: `${FUNCTIONS_DIR}/${o}/index.ts has no entry in EDGE_FUNCTION_OWNER_MAP` });
}

// 2. Phantoms
const onDiskSet = new Set(onDisk);
const phantoms = [...owned].filter((fn) => !onDiskSet.has(fn));
for (const p of phantoms) {
  violations.push({ kind: "phantom-entry", subject: p,
    detail: `EDGE_FUNCTION_OWNER_MAP claims '${p}' but no ${FUNCTIONS_DIR}/${p}/index.ts on disk` });
}

// 3. Per-entry metadata completeness
for (const fn of onDisk) {
  const entry = EDGE_FUNCTION_OWNERSHIP_MANIFEST[fn];
  if (!entry) continue;
  for (const field of ["primaryContact", "escalationContact", "slackChannel", "reviewerCodeOwners"] as const) {
    if (!entry[field] || String(entry[field]).trim() === "") {
      violations.push({ kind: "missing-metadata", subject: fn,
        detail: `Ownership entry for '${fn}' has empty '${field}'` });
    }
  }
}

// 4. Mirror parity + freshness
const canonicalMd5 = md5(CANONICAL);
const mirrorMd5 = md5(PUBLIC_MIRROR);
if (!canonicalMd5) {
  violations.push({ kind: "missing-canonical", subject: CANONICAL,
    detail: `Run \`npm run generate:edge-function-ownership\` to emit it.` });
}
if (!mirrorMd5) {
  violations.push({ kind: "missing-public-mirror", subject: PUBLIC_MIRROR,
    detail: `Run \`npm run generate:edge-function-ownership\` to emit it.` });
}
if (canonicalMd5 && mirrorMd5 && canonicalMd5 !== mirrorMd5) {
  violations.push({ kind: "mirror-drift", subject: PUBLIC_MIRROR,
    detail: `md5(${CANONICAL})=${canonicalMd5} ≠ md5(${PUBLIC_MIRROR})=${mirrorMd5}` });
}

if (canonicalMd5) {
  const stat = fs.statSync(CANONICAL);
  const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
  if (ageDays > FRESHNESS_DAYS) {
    violations.push({ kind: "stale-manifest", subject: CANONICAL,
      detail: `Last regenerated ${ageDays.toFixed(1)} days ago (>${FRESHNESS_DAYS}). Run \`npm run generate:edge-function-ownership\`.` });
  }
}

const totalOnDisk = onDisk.length;
const totalOwned = onDisk.filter(fn => owned.has(fn)).length;
const coveragePercent = totalOnDisk === 0 ? 0 : Math.round((totalOwned / totalOnDisk) * 10000) / 100;

const teamCounts = onDisk
  .map(fn => EDGE_FUNCTION_OWNER_MAP[fn])
  .filter(Boolean)
  .reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>);

const report = {
  generatedAt: new Date().toISOString(),
  totalFunctionsOnDisk: totalOnDisk,
  totalFunctionsOwned: totalOwned,
  coveragePercent,
  ownerTeamCount: Object.keys(teamCounts).length,
  ownersByTeam: teamCounts,
  orphanCount: orphans.length,
  phantomCount: phantoms.length,
  metadataViolationCount: violations.filter(v => v.kind === "missing-metadata").length,
  manifestArtifacts: {
    canonical: { path: CANONICAL, md5: canonicalMd5, present: !!canonicalMd5 },
    publicMirror: { path: PUBLIC_MIRROR, md5: mirrorMd5, present: !!mirrorMd5 },
    parityOk: !!canonicalMd5 && canonicalMd5 === mirrorMd5,
  },
  violations,
  ok: violations.length === 0,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

console.log(`📊 Edge function ownership: ${totalOwned}/${totalOnDisk} (${coveragePercent}%), ${Object.keys(teamCounts).length} teams`);
if (violations.length > 0) {
  console.error(`❌ ${violations.length} violations:`);
  for (const v of violations.slice(0, 30)) console.error(`   [${v.kind}] ${v.subject} — ${v.detail}`);
  if (violations.length > 30) console.error(`   ...and ${violations.length - 30} more`);
  console.error(`   See ${REPORT_PATH}`);
  process.exit(1);
}
console.log(`✅ check-edge-function-ownership-completeness: 100% ownership coverage`);
console.log(`   Report: ${REPORT_PATH}`);
