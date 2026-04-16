#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Test Coverage Check
//
// Warns on R3+ (financial/sensitive) functions without test files.
// Warns on admin-required functions without test files.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../../architecture/lib/utils";
import { EDGE_FUNCTION_AUTHORITY } from "../../../src/lib/migration/edge-function-authority-map";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";

const HIGH_RISK = new Set(["R3", "R4", "R5"]);

let scanned = 0;
let withTests = 0;
let highRiskWithoutTests = 0;

for (const entry of EDGE_FUNCTION_AUTHORITY) {
  const fnDir = path.join(FUNCTIONS_DIR, entry.name);
  if (!fs.existsSync(fnDir)) continue;
  scanned++;

  const hasTest =
    fs.existsSync(path.join(fnDir, "index_test.ts")) ||
    fs.existsSync(path.join(fnDir, "index.test.ts")) ||
    fs.readdirSync(fnDir).some((f) => f.endsWith("_test.ts") || f.endsWith(".test.ts"));

  if (hasTest) {
    withTests++;
  } else if (HIGH_RISK.has(entry.riskTier) || entry.authClass === "admin-required") {
    vc.add(`supabase/functions/${entry.name}`, "missing-test-coverage",
      `${entry.name} (${entry.riskTier}, ${entry.authClass}) is high-risk but has no test file`, "warning");
    highRiskWithoutTests++;
  }
}

const coverage = scanned > 0 ? Math.round((withTests / scanned) * 100) : 0;
console.log(`  📊 ${withTests}/${scanned} functions with tests (${coverage}%), ${highRiskWithoutTests} high-risk without tests`);
vc.report("check-edge-function-test-coverage");
vc.exitIfErrors();
