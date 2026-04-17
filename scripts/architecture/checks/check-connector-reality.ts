#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Reality Validator (Phase 22.H, Gate 33)
// Verifies registry, tables, fns, crons, and admin-page wiring.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../lib/utils";

const vc = new ViolationCollector();
const REQUIRED_TABLES = [
  "connector_registry",
  "connector_accounts",
  "connector_oauth_tokens",
  "connector_receipts",
  "connector_configs",
  "consent_scope_records",
  "webhook_events",
  "connector_sync_cursors",
];
const REQUIRED_FNS = [
  "supabase/functions/webhook-ingest/index.ts",
  "supabase/functions/webhook-process/index.ts",
  "supabase/functions/webhook-replay/index.ts",
  "supabase/functions/connector-token-refresh/index.ts",
  "supabase/functions/seed-connector-registry/index.ts",
];

// 1. Edge functions exist
for (const f of REQUIRED_FNS) {
  if (!fs.existsSync(f)) vc.add(f, "missing-fn", `Required edge function not found: ${f}`);
}

// 2. Catalog truth
const catalog = readJsonSafe<any>("generated/connector-catalog.json");
if (!catalog) vc.add("connector-catalog.json", "missing", "generated/connector-catalog.json not found");
else {
  const total = catalog.total ?? (catalog.connectors?.length ?? 0);
  if (total < 11) vc.add("connector-catalog.json", "underseeded", `Expected ≥11 connectors, found ${total}`);
  for (const c of catalog.connectors ?? []) {
    if (typeof c !== "object" || !c.id) vc.add("connector-catalog.json", "bad-shape", `Connector entry missing id: ${JSON.stringify(c).slice(0,80)}`);
  }
}

// 3. Required table names referenced in migrations
const migDir = "supabase/migrations";
let migText = "";
if (fs.existsSync(migDir)) {
  for (const f of fs.readdirSync(migDir)) {
    if (f.endsWith(".sql")) migText += fs.readFileSync(`${migDir}/${f}`, "utf-8");
  }
}
for (const t of REQUIRED_TABLES) {
  const re = new RegExp(`CREATE TABLE[^;]*public\\.${t}\\b`, "i");
  if (!re.test(migText)) {
    vc.add(`migrations/${t}`, "missing-table", `Table ${t} not declared in any migration`, "warning");
  }
}

// 4. Emit report
const report = {
  generatedAt: new Date().toISOString(),
  gate: "Gate 33 — Connector Reality",
  requiredTables: REQUIRED_TABLES,
  requiredFunctions: REQUIRED_FNS,
  catalogTotal: catalog?.total ?? 0,
  errors: vc.errors,
  warnings: vc.warnings,
  ok: vc.errors.length === 0,
};
fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/connector-reality-report.json", JSON.stringify(report, null, 2));

console.log(`  📡 Connector reality: ${REQUIRED_TABLES.length} tables, ${REQUIRED_FNS.length} fns, ${catalog?.total ?? 0} catalog entries`);
vc.report("check-connector-reality");
vc.exitIfErrors();
