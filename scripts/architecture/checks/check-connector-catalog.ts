#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Catalog Validator
// Validates connector-catalog.json matches source connector configs
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, scanDir, readFileContent } from "./lib/utils";

const vc = new ViolationCollector();
const catalog = readJsonSafe<any>("generated/connector-catalog.json");

if (!catalog) {
  console.error("❌ generated/connector-catalog.json not found");
  process.exit(1);
}

const connectors = catalog.connectors || catalog.entries || [];
const catalogIds = new Set<string>();

for (const conn of connectors) {
  const id = conn.id || conn.connectorId;
  if (!id) {
    vc.add("connector-catalog.json", "missing-id", "Connector entry has no id");
    continue;
  }
  if (catalogIds.has(id)) {
    vc.add("connector-catalog.json", "duplicate-id", `Duplicate connector id: ${id}`);
  }
  catalogIds.add(id);

  if (!conn.name && !conn.label) {
    vc.add("connector-catalog.json", "missing-name", `Connector ${id} has no name/label`, "warning");
  }
  if (!conn.status) {
    vc.add("connector-catalog.json", "missing-status", `Connector ${id} has no status field`, "warning");
  }
}

// Cross-reference with source connector definitions
const connectorDirs = ["src/lib/services/connector", "src/packages/connectors"];
const sourceConnectorIds = new Set<string>();

for (const dir of connectorDirs) {
  const files = scanDir(dir, [".ts"]);
  for (const file of files) {
    const content = readFileContent(file);
    const matches = content.match(/connectorId:\s*["']([^"']+)["']/g);
    if (matches) {
      for (const m of matches) {
        const id = m.match(/["']([^"']+)["']/)?.[1];
        if (id) sourceConnectorIds.add(id);
      }
    }
  }
}

for (const sourceId of sourceConnectorIds) {
  if (!catalogIds.has(sourceId)) {
    vc.add("connector-catalog.json", "unregistered-connector", `Source connector "${sourceId}" not in catalog`, "warning");
  }
}

console.log(`  📡 ${catalogIds.size} connectors registered, ${sourceConnectorIds.size} found in source`);
vc.report("check-connector-catalog");
vc.exitIfErrors();
