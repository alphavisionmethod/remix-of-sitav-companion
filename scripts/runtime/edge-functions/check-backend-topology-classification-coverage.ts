#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Topology Classification Coverage Check
//
// Phase 1 gate: every function on disk must have a strict
// BackendCategory verdict (or an explicit migration verdict).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../../architecture/lib/utils";
import { EDGE_FUNCTION_BACKEND_CATEGORY } from "../../../src/lib/backend-topology/edge-function-categories";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";

if (!fs.existsSync(FUNCTIONS_DIR)) {
  console.log("⚠️ supabase/functions directory not found");
  process.exit(0);
}

const onDisk = fs.readdirSync(FUNCTIONS_DIR)
  .filter((n) => !n.startsWith("_") && !n.startsWith("."))
  .filter((n) => fs.existsSync(path.join(FUNCTIONS_DIR, n, "index.ts")));

const STRICT = new Set([
  "PUBLIC_BFF", "ADMIN_BFF", "DOMAIN_FUNCTION",
  "ORCHESTRATION_FUNCTION", "CONNECTOR_WEBHOOK_FUNCTION", "RUNTIME_SYSTEM_FUNCTION",
]);
const MIGRATION = new Set(["SPLIT_REQUIRED", "DUPLICATE_MERGE_REQUIRED", "WRAPPER_ONLY", "DEPRECATE_AND_REDIRECT"]);

let strict = 0;
let migration = 0;
let unclassified = 0;

for (const name of onDisk) {
  const verdict = EDGE_FUNCTION_BACKEND_CATEGORY[name];
  if (!verdict) {
    vc.add(`supabase/functions/${name}`, "unclassified-function",
      `Function ${name} has no BackendCategory verdict in EDGE_FUNCTION_BACKEND_CATEGORY`, "error");
    unclassified++;
  } else if (STRICT.has(verdict)) {
    strict++;
  } else if (MIGRATION.has(verdict)) {
    migration++;
    vc.add(`supabase/functions/${name}`, "migration-pending",
      `Function ${name} has migration verdict "${verdict}" — must be resolved before final deployment`, "warning");
  } else {
    vc.add(`supabase/functions/${name}`, "invalid-verdict",
      `Function ${name} has unknown verdict "${verdict}"`, "error");
  }
}

// Detect phantoms: classifications with no on-disk function
const onDiskSet = new Set(onDisk);
for (const name of Object.keys(EDGE_FUNCTION_BACKEND_CATEGORY)) {
  if (!onDiskSet.has(name)) {
    vc.add(`supabase/functions/${name}`, "phantom-classification",
      `Classification exists for ${name} but no index.ts on disk`, "warning");
  }
}

// HARD RULE: only one ADMIN_BFF
const adminBffs = Object.entries(EDGE_FUNCTION_BACKEND_CATEGORY).filter(([, v]) => v === "ADMIN_BFF").map(([n]) => n);
if (adminBffs.length > 1) {
  vc.add("backend-topology", "multiple-admin-bff",
    `Multiple ADMIN_BFF declared (${adminBffs.join(", ")}) — only one canonical admin BFF allowed`, "error");
}

console.log(`  📊 ${onDisk.length} on disk`);
console.log(`  ✅ ${strict} strict-classified`);
console.log(`  🔧 ${migration} migration-pending`);
console.log(`  ❌ ${unclassified} unclassified`);
console.log(`  👑 canonical ADMIN_BFF: ${adminBffs.join(", ") || "(none)"}`);

vc.report("check-backend-topology-classification-coverage");
vc.exitIfErrors();
