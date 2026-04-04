#!/usr/bin/env node
// SITA OS — Connector Governance Validator
import { ViolationCollector, readJsonSafe, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const catalog = readJsonSafe<any>("generated/connector-catalog.json");
if (!catalog) { console.error("❌ connector-catalog.json not found"); process.exit(1); }
const connectors = catalog.connectors || catalog.entries || [];
for (const conn of connectors) {
  const id = conn.id || conn.connectorId;
  if (!conn.authMethod && !conn.auth) {
    vc.add("connector-catalog.json", "no-auth", `Connector "${id}" has no auth method defined`, "warning");
  }
  if (!conn.rateLimiting && !conn.rateLimit) {
    vc.add("connector-catalog.json", "no-rate-limit", `Connector "${id}" has no rate limiting config`, "warning");
  }
  if (!conn.retryPolicy && !conn.retry) {
    vc.add("connector-catalog.json", "no-retry", `Connector "${id}" has no retry policy`, "warning");
  }
}
console.log(`  📡 ${connectors.length} connectors checked for governance compliance`);
vc.report("check-connector-governance");
vc.exitIfErrors();
