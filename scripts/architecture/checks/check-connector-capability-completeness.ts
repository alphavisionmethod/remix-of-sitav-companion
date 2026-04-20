#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Capability Completeness Gate (BLOCK-tier)
// Ensures every catalog connector has:
//   1. A *.capability.ts file in src/lib/connectors/capabilities/
//   2. A non-empty actions[] + scopes[] declaration
//   3. An edgeFunction reference that exists in supabase/functions/
//      (or is explicitly status: 'planned')
//   4. A client binding in src/lib/connectors/clients/ for non-planned
// ═══════════════════════════════════════════════════════════════
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";

const CATALOG_PATH = "generated/connector-catalog.json";
const CAPABILITIES_DIR = "src/lib/connectors/capabilities";
const CLIENTS_FILE = "src/lib/connectors/clients/index.ts";
const FUNCTIONS_DIR = "supabase/functions";

const issues: GateIssue[] = [];

if (!existsSync(CATALOG_PATH)) {
  issues.push({ severity: "error", area: "catalog", message: `Missing ${CATALOG_PATH}` });
  emitGateReport({ gate: "connector-capability-completeness", ok: false, issues });
  console.error("❌ connector catalog missing");
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8"));
const connectors: Array<{ id: string; status?: string }> = catalog.connectors ?? [];

const capabilityFiles = existsSync(CAPABILITIES_DIR)
  ? readdirSync(CAPABILITIES_DIR).filter((f) => f.endsWith(".capability.ts"))
  : [];
const declaredIds = new Set(capabilityFiles.map((f) => f.replace(".capability.ts", "")));

const clientsContent = existsSync(CLIENTS_FILE) ? readFileSync(CLIENTS_FILE, "utf-8") : "";

const edgeFunctions = existsSync(FUNCTIONS_DIR)
  ? new Set(readdirSync(FUNCTIONS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name))
  : new Set<string>();

let nonPlannedCount = 0;
let plannedCount = 0;

for (const conn of connectors) {
  const id = conn.id;

  // 1. capability file exists
  if (!declaredIds.has(id)) {
    issues.push({ severity: "error", area: "capability-missing", message: `No capability file for connector "${id}"` });
    continue;
  }

  const capPath = join(CAPABILITIES_DIR, `${id}.capability.ts`);
  const capSrc = readFileSync(capPath, "utf-8");

  // 2. actions[] non-empty + scopes[] non-empty
  const actionsMatch = capSrc.match(/actions:\s*\[([\s\S]*?)\]/);
  if (!actionsMatch || !/key:\s*["']/.test(actionsMatch[1])) {
    issues.push({ severity: "error", area: "actions-empty", message: `Connector "${id}" declares no actions` });
  }
  const scopesMatch = capSrc.match(/scopes:\s*\[([\s\S]*?)\]/);
  if (!scopesMatch || scopesMatch[1].trim() === "") {
    issues.push({ severity: "warning", area: "scopes-empty", message: `Connector "${id}" declares no scopes` });
  }

  // 3. edgeFunction wiring
  const edgeMatch = capSrc.match(/edgeFunction:\s*(?:"([^"]+)"|null)/);
  const statusMatch = capSrc.match(/status:\s*"([^"]+)"/);
  const status = statusMatch?.[1] ?? "unknown";
  const edgeFn = edgeMatch?.[1];

  if (status === "planned") {
    plannedCount++;
  } else {
    nonPlannedCount++;
    if (!edgeFn) {
      issues.push({ severity: "error", area: "edge-fn-missing", message: `Connector "${id}" (status=${status}) has no edgeFunction reference` });
    } else if (!edgeFunctions.has(edgeFn)) {
      issues.push({ severity: "error", area: "edge-fn-not-deployed", message: `Connector "${id}" references edge function "${edgeFn}" which does not exist in supabase/functions/` });
    }

    // 4. client binding present
    if (!clientsContent.includes(`"${id}"`)) {
      issues.push({ severity: "error", area: "client-binding-missing", message: `Connector "${id}" has no client binding in src/lib/connectors/clients/` });
    }
  }
}

// catalog → capability orphans
for (const declaredId of declaredIds) {
  if (!connectors.some((c) => c.id === declaredId)) {
    issues.push({ severity: "warning", area: "orphan-capability", message: `Capability file "${declaredId}.capability.ts" has no matching catalog entry` });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const ok = errorCount === 0;

emitGateReport({
  gate: "connector-capability-completeness",
  ok,
  issues,
  extra: {
    catalogConnectors: connectors.length,
    capabilityFiles: capabilityFiles.length,
    nonPlannedCount,
    plannedCount,
  },
});

console.log(`  📦 ${connectors.length} catalog / ${capabilityFiles.length} capabilities / ${nonPlannedCount} live + ${plannedCount} planned`);
if (!ok) {
  for (const i of issues.filter((x) => x.severity === "error")) {
    console.error(`  ✖ ${i.area}: ${i.message}`);
  }
  process.exit(1);
}
console.log("✅ connector-capability-completeness PASS");
