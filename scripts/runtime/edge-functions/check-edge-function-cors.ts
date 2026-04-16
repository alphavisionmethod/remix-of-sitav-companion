#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function CORS Check
//
// Asserts every function declared corsRequired=true in the authority
// map either imports from _shared/cors.ts or defines corsHeaders inline.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../../architecture/lib/utils";
import { EDGE_FUNCTION_AUTHORITY } from "../../../src/lib/migration/edge-function-authority-map";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";

let scanned = 0;
let withCors = 0;

for (const entry of EDGE_FUNCTION_AUTHORITY) {
  const indexPath = path.join(FUNCTIONS_DIR, entry.name, "index.ts");
  if (!fs.existsSync(indexPath)) {
    vc.add(indexPath, "missing-function-file", `Authority map references ${entry.name} but index.ts not found`, "error");
    continue;
  }
  scanned++;
  const content = fs.readFileSync(indexPath, "utf-8");
  const hasCors = /corsHeaders|Access-Control-Allow|handleCors|corsResponse|_shared\/cors/.test(content);

  if (entry.corsRequired && !hasCors) {
    vc.add(indexPath, "cors-missing", `Function ${entry.name} (${entry.category}, ${entry.authClass}) requires CORS but none detected`, "error");
  } else if (entry.corsRequired && hasCors) {
    withCors++;
  }
}

console.log(`  📊 scanned ${scanned} function(s), ${withCors} with CORS, ${EDGE_FUNCTION_AUTHORITY.filter(e => !e.corsRequired).length} CORS-exempt (cron/internal)`);
vc.report("check-edge-function-cors");
vc.exitIfErrors();
