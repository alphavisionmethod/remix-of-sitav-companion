#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Ownership Manifest Generator
//
// Emits the canonical machine-readable per-function ownership manifest:
//   - generated/edge-function-ownership.json            (canonical)
//   - public/generated/edge-function-ownership.json     (public mirror)
//
// Schema:
//   {
//     generatedAt, totalFunctions, totalOwners, coveragePercent,
//     ownersByTeam: { team -> count },
//     entries: [{ name, path, ownerTeam, primaryContact,
//                 escalationContact, slackChannel,
//                 runbookRef, killSwitchRef, reviewerCodeOwners }]
//   }
//
// External probes: curl https://<host>/generated/edge-function-ownership.json
// Driven by src/lib/backend-topology/edge-function-owner-map.ts.
// Enforced by scripts/architecture/checks/check-edge-function-ownership-completeness.ts
// (BLOCK gate #26 in master release roster).
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import {
  EDGE_FUNCTION_OWNER_MAP,
  EDGE_FUNCTION_OWNERSHIP_MANIFEST,
  getOwnerCounts,
} from "../../../src/lib/backend-topology/edge-function-owner-map";

const FUNCTIONS_DIR = "supabase/functions";
const SHARED_DIRS = new Set(["_shared", "_tests", "shared", "_lib"]);

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

const onDisk = listEdgeFunctions();
const ownersByTeam = getOwnerCounts();
const totalOwned = Object.keys(EDGE_FUNCTION_OWNER_MAP).length;
const coveragePercent =
  onDisk.length === 0 ? 0 : Math.round((onDisk.filter(n => EDGE_FUNCTION_OWNER_MAP[n]).length / onDisk.length) * 10000) / 100;

const entries = onDisk.map((name) => {
  const ownership = EDGE_FUNCTION_OWNERSHIP_MANIFEST[name];
  return {
    name,
    path: `${FUNCTIONS_DIR}/${name}/index.ts`,
    ownerTeam: ownership?.ownerTeam ?? null,
    primaryContact: ownership?.primaryContact ?? null,
    escalationContact: ownership?.escalationContact ?? null,
    slackChannel: ownership?.slackChannel ?? null,
    runbookRef: ownership?.runbookRef ?? null,
    killSwitchRef: ownership?.killSwitchRef ?? null,
    reviewerCodeOwners: ownership?.reviewerCodeOwners ?? null,
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  source: "src/lib/backend-topology/edge-function-owner-map.ts",
  totalFunctionsOnDisk: onDisk.length,
  totalFunctionsOwned: totalOwned,
  coveragePercent,
  totalOwnerTeams: Object.keys(ownersByTeam).length,
  ownersByTeam,
  entries,
};

const json = JSON.stringify(manifest, null, 2) + "\n";

const targets = [
  "generated/edge-function-ownership.json",
  "public/generated/edge-function-ownership.json",
];
for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, json);
}

console.log(`✅ Wrote ${targets.length} mirrors`);
console.log(`   • ${onDisk.length} functions on disk`);
console.log(`   • ${totalOwned} owned (${coveragePercent}% coverage)`);
console.log(`   • ${Object.keys(ownersByTeam).length} owner teams`);
for (const target of targets) console.log(`   ↳ ${target}`);
