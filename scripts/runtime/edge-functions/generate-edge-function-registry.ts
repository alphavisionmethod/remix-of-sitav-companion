#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Edge Function Registry
// Produces generated/edge-function-registry.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { writeJsonOutput, scanDirShallow, envelope } from "../../architecture/lib/utils";

const functionsDir = "supabase/functions";
const functions = fs.existsSync(functionsDir)
  ? scanDirShallow(functionsDir).filter(f => !f.startsWith("_") && !f.startsWith("."))
  : [];

const entries = functions.map(fn => {
  const indexPath = path.join(functionsDir, fn, "index.ts");
  const hasIndex = fs.existsSync(indexPath);
  const hasTest = fs.existsSync(path.join(functionsDir, fn, "index_test.ts"));
  let authType = "unknown";
  let category = "utility";

  if (hasIndex) {
    const content = fs.readFileSync(indexPath, "utf-8");
    if (content.includes("Authorization") || content.includes("getUser") || content.includes("auth")) authType = "authenticated";
    else authType = "public";
    if (fn.includes("admin")) category = "admin";
    else if (fn.includes("brain") || fn.includes("intelligence") || fn.includes("ai")) category = "intelligence";
    else if (fn.includes("connector") || fn.includes("proxy")) category = "integration";
    else if (fn.includes("event") || fn.includes("processor")) category = "core";
    else if (fn.includes("auth") || fn.includes("mfa")) category = "auth";
  }

  return { name: fn, hasIndex, hasTest, authType, category };
});

writeJsonOutput("generated/edge-function-registry.json", envelope("1.0.0", {
  totalFunctions: entries.length,
  byCategory: Object.fromEntries(
    ["core", "admin", "integration", "intelligence", "utility", "auth"]
      .map(c => [c, entries.filter(e => e.category === c).length])
  ),
  entries,
}));

console.log(`✅ generate-edge-function-registry: ${entries.length} edge functions registered`);
