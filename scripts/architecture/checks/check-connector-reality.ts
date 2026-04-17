#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Reality Validator (Phase 22.H + 22.1.D, Gate 33)
// Verifies registry, tables, fns, crons, admin wiring, reconnect flow,
// and auto-fallback policy.
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

// 4. Phase 22.1 — Reconnect flow assertions
const oauthFn = "supabase/functions/connector-oauth/index.ts";
const reconnectAssertions = { reconnectAction: false, reconnectButton: false, fakeFailureFn: false, fakeEngageFn: false };
if (fs.existsSync(oauthFn)) {
  const src = fs.readFileSync(oauthFn, "utf-8");
  if (/case\s+"reconnect"|action:\s*"reconnect"|literal\("reconnect"\)/.test(src) && /handleReconnect/.test(src)) {
    reconnectAssertions.reconnectAction = true;
  } else {
    vc.add(oauthFn, "missing-reconnect", "connector-oauth/index.ts must implement 'reconnect' action");
  }
} else {
  vc.add(oauthFn, "missing-fn", `Required edge function not found: ${oauthFn}`);
}

// 5. Reconnect button on CN01
const cn01 = "src/pages/admin/CN01ConnectorRealityOverview.tsx";
if (fs.existsSync(cn01)) {
  const src = fs.readFileSync(cn01, "utf-8");
  if (/Reconnect/.test(src) && /action:\s*["']reconnect["']/.test(src)) {
    reconnectAssertions.reconnectButton = true;
  } else {
    vc.add(cn01, "missing-reconnect-button", "CN01ConnectorRealityOverview.tsx must render Reconnect button + invoke connector-oauth reconnect");
  }
} else {
  vc.add(cn01, "missing-page", "CN01ConnectorRealityOverview.tsx not found");
}

// 6. Auto-fallback policy in connector-fake-mode.service
const fakeSvc = "src/lib/services/connector-control-plane/connector-fake-mode.service.ts";
if (fs.existsSync(fakeSvc)) {
  const src = fs.readFileSync(fakeSvc, "utf-8");
  if (/export\s+async\s+function\s+recordConnectorFailure/.test(src)) reconnectAssertions.fakeFailureFn = true;
  else vc.add(fakeSvc, "missing-recordConnectorFailure", "connector-fake-mode.service.ts must export recordConnectorFailure");
  if (/export\s+async\s+function\s+engageFakeMode/.test(src)) reconnectAssertions.fakeEngageFn = true;
  else vc.add(fakeSvc, "missing-engageFakeMode", "connector-fake-mode.service.ts must export engageFakeMode");
} else {
  vc.add(fakeSvc, "missing-svc", "connector-fake-mode.service.ts not found");
}

// 7. Wired into connector-proxy + connector-sync error paths
for (const f of ["supabase/functions/connector-proxy/index.ts", "supabase/functions/connector-sync/index.ts"]) {
  if (fs.existsSync(f)) {
    const src = fs.readFileSync(f, "utf-8");
    if (!/recordProxyFailure|recordSyncFailure|fallback_engaged/.test(src)) {
      vc.add(f, "missing-fallback-wiring", `${f} must call failure-tracker / write fallback_engaged on error`, "warning");
    }
  }
}

// 8. Emit report
const report = {
  generatedAt: new Date().toISOString(),
  gate: "Gate 33 — Connector Reality (Phase 22 + 22.1)",
  requiredTables: REQUIRED_TABLES,
  requiredFunctions: REQUIRED_FNS,
  catalogTotal: catalog?.total ?? 0,
  reconnectAssertions,
  errors: vc.errors,
  warnings: vc.warnings,
  ok: vc.errors.length === 0,
};
fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/connector-reality-report.json", JSON.stringify(report, null, 2));

console.log(`  📡 Connector reality: ${REQUIRED_TABLES.length} tables, ${REQUIRED_FNS.length} fns, ${catalog?.total ?? 0} catalog entries, reconnect=${reconnectAssertions.reconnectAction}, fallback=${reconnectAssertions.fakeFailureFn}`);
vc.report("check-connector-reality");
vc.exitIfErrors();
