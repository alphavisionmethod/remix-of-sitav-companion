#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Ownership Check
//
// Asserts every function in supabase/functions/ is registered in
// the authority map (no orphan functions).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../../architecture/lib/utils";
import { EDGE_FUNCTION_AUTHORITY } from "../../../src/lib/migration/edge-function-authority-map";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";

if (!fs.existsSync(FUNCTIONS_DIR)) {
  console.log("⚠️ supabase/functions directory not found");
  process.exit(0);
}

const onDisk = fs.readdirSync(FUNCTIONS_DIR)
  .filter((n) => !n.startsWith("_") && !n.startsWith("."))
  .filter((n) => fs.existsSync(path.join(FUNCTIONS_DIR, n, "index.ts")));

const registered = new Set(EDGE_FUNCTION_AUTHORITY.map((e) => e.name));
const onDiskSet = new Set(onDisk);

let orphans = 0;
let phantoms = 0;

for (const name of onDisk) {
  if (!registered.has(name)) {
    vc.add(`supabase/functions/${name}`, "unregistered-function", `Function ${name} exists on disk but not in edge-function-authority-map.ts`, "error");
    orphans++;
  }
}

for (const entry of EDGE_FUNCTION_AUTHORITY) {
  if (!onDiskSet.has(entry.name)) {
    vc.add(`supabase/functions/${entry.name}`, "phantom-function", `Authority map registers ${entry.name} but no index.ts on disk`, "error");
    phantoms++;
  }
}

console.log(`  📊 ${onDisk.length} on disk, ${EDGE_FUNCTION_AUTHORITY.length} registered, ${orphans} orphan(s), ${phantoms} phantom(s)`);
vc.report("check-edge-function-ownership");
vc.exitIfErrors();
