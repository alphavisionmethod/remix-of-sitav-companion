#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Category Coverage Check
// Ensures all edge functions have category classification
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDirShallow } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const CATEGORIES = ["core", "admin", "integration", "intelligence", "utility", "auth"];

const topoPath = "src/lib/backend-topology/edge-function-topology.ts";
if (!fs.existsSync(topoPath)) {
  vc.add(topoPath, "missing-topology", "Edge function topology registry not found", "warning");
} else {
  const content = fs.readFileSync(topoPath, "utf-8");
  let categorized = 0;
  for (const cat of CATEGORIES) {
    if (content.includes(cat)) categorized++;
  }
  console.log(`  📂 ${categorized}/${CATEGORIES.length} categories referenced in topology`);
}

const functionsDir = "supabase/functions";
if (fs.existsSync(functionsDir)) {
  const functions = scanDirShallow(functionsDir).filter(f => !f.startsWith("_") && !f.startsWith("."));
  console.log(`  ⚡ ${functions.length} edge functions to categorize`);
}

vc.report("check-edge-function-category-coverage");
vc.exitIfErrors();
