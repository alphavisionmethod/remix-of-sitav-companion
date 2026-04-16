#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Auth Class Check
//
// Asserts in-code auth pattern matches the declared authClass:
//   • jwt-required    → must call requireAuth or auth.getUser/getClaims
//   • admin-required  → must call requireAdmin
//   • service-role    → must use SUPABASE_SERVICE_ROLE_KEY
//   • webhook-sig     → must validate a signature header
//   • public          → no auth check required, must declare authJustification
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../../architecture/lib/utils";
import { EDGE_FUNCTION_AUTHORITY } from "../../../src/lib/migration/edge-function-authority-map";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";

const PATTERNS = {
  requireAuth: /requireAuth\s*\(|\.auth\.getUser\s*\(|\.auth\.getClaims\s*\(/,
  requireAdmin: /requireAdmin\s*\(|has_role.*admin|isAdmin/,
  serviceRole: /SUPABASE_SERVICE_ROLE_KEY|getServiceClient\s*\(/,
  webhookSig: /signature|x-hub-signature|stripe-signature|hmac|x-agent-token|x-device-id/i,
};

let scanned = 0;
let aligned = 0;

for (const entry of EDGE_FUNCTION_AUTHORITY) {
  const indexPath = path.join(FUNCTIONS_DIR, entry.name, "index.ts");
  if (!fs.existsSync(indexPath)) continue;
  scanned++;
  const content = fs.readFileSync(indexPath, "utf-8");

  switch (entry.authClass) {
    case "jwt-required":
      if (!PATTERNS.requireAuth.test(content) && !PATTERNS.requireAdmin.test(content)) {
        vc.add(indexPath, "missing-jwt-validation", `${entry.name}: declared jwt-required but no requireAuth/getUser/getClaims call found`, "error");
      } else aligned++;
      break;
    case "admin-required":
      if (!PATTERNS.requireAdmin.test(content)) {
        vc.add(indexPath, "missing-admin-check", `${entry.name}: declared admin-required but no requireAdmin call found`, "error");
      } else aligned++;
      break;
    case "service-role":
      if (!PATTERNS.serviceRole.test(content)) {
        vc.add(indexPath, "missing-service-role", `${entry.name}: declared service-role but SERVICE_ROLE_KEY/getServiceClient not used`, "warning");
      } else aligned++;
      if (!entry.authJustification) {
        vc.add(indexPath, "missing-justification", `${entry.name}: service-role functions must declare authJustification`, "warning");
      }
      break;
    case "webhook-sig":
      if (!PATTERNS.webhookSig.test(content)) {
        vc.add(indexPath, "missing-webhook-sig", `${entry.name}: declared webhook-sig but no signature validation found`, "error");
      } else aligned++;
      break;
    case "public":
      if (!entry.authJustification) {
        vc.add(indexPath, "missing-justification", `${entry.name}: public functions must declare authJustification`, "error");
      } else aligned++;
      break;
  }
}

console.log(`  📊 scanned ${scanned} function(s), ${aligned} auth-aligned`);
vc.report("check-edge-function-auth");
vc.exitIfErrors();
