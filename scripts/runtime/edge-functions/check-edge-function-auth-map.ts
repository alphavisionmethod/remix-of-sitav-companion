#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Auth Map Check
// Validates auth requirements for edge functions
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
  let authProtected = 0;
  let publicEndpoints = 0;

  for (const fn of functions) {
    const indexPath = path.join(functionsDir, fn, "index.ts");
    if (!fs.existsSync(indexPath)) continue;
    const content = fs.readFileSync(indexPath, "utf-8");
    if (content.includes("auth") || content.includes("jwt") || content.includes("Authorization") || content.includes("getUser")) {
      authProtected++;
    } else {
      publicEndpoints++;
    }
  }

  console.log(`  🔒 ${authProtected} auth-protected edge functions`);
  console.log(`  🌐 ${publicEndpoints} public edge functions`);

  if (publicEndpoints > functions.length * 0.5) {
    vc.add(functionsDir, "too-many-public", `${publicEndpoints}/${functions.length} edge functions appear to be public — verify auth requirements`, "warning");
  }
}

vc.report("check-edge-function-auth-map");
vc.exitIfErrors();
