#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Topology Check
// Validates edge function structure and categorization
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDirShallow } from "../../architecture/lib/utils";
import * as fs from "fs";
import * as path from "path";

const vc = new ViolationCollector();
const functionsDir = "supabase/functions";

if (!fs.existsSync(functionsDir)) {
  vc.add(functionsDir, "missing-functions-dir", "Edge functions directory not found");
} else {
  const functions = scanDirShallow(functionsDir).filter(f => !f.startsWith("_") && !f.startsWith("."));
  console.log(`  ⚡ ${functions.length} edge functions found`);

  let withIndex = 0;
  let withTest = 0;
  for (const fn of functions) {
    const indexPath = path.join(functionsDir, fn, "index.ts");
    if (fs.existsSync(indexPath)) {
      withIndex++;
    } else {
      vc.add(indexPath, "missing-index", `Edge function "${fn}" has no index.ts`, "warning");
    }
    const testPath = path.join(functionsDir, fn, "index_test.ts");
    if (fs.existsSync(testPath)) withTest++;
  }

  console.log(`  📄 ${withIndex}/${functions.length} have index.ts`);
  console.log(`  🧪 ${withTest}/${functions.length} have test files`);

  // Check topology registry exists
  const topoRegistry = "src/lib/backend-topology/edge-function-topology.ts";
  if (fs.existsSync(topoRegistry)) {
    const content = fs.readFileSync(topoRegistry, "utf-8");
    let registered = 0;
    for (const fn of functions) {
      if (content.includes(fn)) registered++;
    }
    console.log(`  📋 ${registered}/${functions.length} registered in topology`);
    if (registered < functions.length * 0.5) {
      vc.add(topoRegistry, "low-topology-coverage", `Only ${registered}/${functions.length} edge functions registered in topology`, "warning");
    }
  }
}

vc.report("check-edge-function-topology");
vc.exitIfErrors();
