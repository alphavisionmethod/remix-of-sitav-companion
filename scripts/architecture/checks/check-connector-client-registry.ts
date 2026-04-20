#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Client Registry Completeness Gate (BLOCK-tier)
//
// Asserts the per-provider client surface is complete and durable:
//   1. Every catalog connector has src/lib/connectors/<id>/client.ts
//   2. Each per-provider module re-exports its capability + client
//   3. The canonical providers.ts registry maps 1:1 with the catalog
//   4. No orphan provider directories (provider w/o catalog entry)
//
// Resolves audit item:
//   "src/lib/connectors/<provider>/client.ts per OAuth provider —
//    Real provider logic lives in edge functions; no client-side
//    capability registry export"
// ═══════════════════════════════════════════════════════════════
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CATALOG_PATH = "generated/connector-catalog.json";
const CONNECTORS_ROOT = "src/lib/connectors";
const REGISTRY_FILE = "src/lib/connectors/providers.ts";
const REPORT_PATH = "generated/connector-client-registry-report.json";

interface Issue { severity: "error" | "warning"; area: string; message: string }
const issues: Issue[] = [];

if (!existsSync(CATALOG_PATH)) {
  console.error(`❌ Missing ${CATALOG_PATH}`);
  process.exit(1);
}
if (!existsSync(REGISTRY_FILE)) {
  console.error(`❌ Missing canonical registry ${REGISTRY_FILE}`);
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8"));
const connectors: Array<{ id: string; status?: string }> = catalog.connectors ?? [];
const registrySrc = readFileSync(REGISTRY_FILE, "utf-8");

// Reserved sub-dirs that aren't per-provider client modules
const RESERVED_DIRS = new Set(["capabilities", "clients"]);

const providerDirs = readdirSync(CONNECTORS_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((n) => !RESERVED_DIRS.has(n));

let coveredCount = 0;

for (const conn of connectors) {
  const id = conn.id;
  const dir = join(CONNECTORS_ROOT, id);
  const file = join(dir, "client.ts");

  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    issues.push({ severity: "error", area: "missing-provider-dir", message: `Connector "${id}" has no per-provider directory at ${dir}` });
    continue;
  }
  if (!existsSync(file)) {
    issues.push({ severity: "error", area: "missing-client-file", message: `Connector "${id}" has no client.ts at ${file}` });
    continue;
  }

  const src = readFileSync(file, "utf-8");
  if (!/export\s+const\s+[A-Z_]+_CAPABILITY/.test(src)) {
    issues.push({ severity: "error", area: "missing-capability-export", message: `${file} does not export a *_CAPABILITY constant` });
  }
  if (!/export\s+const\s+[a-zA-Z]+Client\s*:/.test(src)) {
    issues.push({ severity: "error", area: "missing-client-export", message: `${file} does not export a *Client instance` });
  }
  if (!/createEdgeFunctionClient/.test(src)) {
    issues.push({ severity: "warning", area: "missing-edge-binding", message: `${file} does not bind via createEdgeFunctionClient` });
  }

  // Canonical registry must reference this connector id
  const idLiteral = `"${id}"`;
  if (!registrySrc.includes(idLiteral)) {
    issues.push({ severity: "error", area: "registry-missing-entry", message: `providers.ts does not include connectorId ${idLiteral}` });
  }

  coveredCount++;
}

// Detect orphan provider directories
const catalogIds = new Set(connectors.map((c) => c.id));
for (const d of providerDirs) {
  if (!catalogIds.has(d)) {
    issues.push({ severity: "warning", area: "orphan-provider-dir", message: `Provider directory "${d}" has no catalog entry` });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const ok = errorCount === 0;

// Persist machine-readable report
mkdirSync("generated", { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify({
  gate: "connector-client-registry-completeness",
  ok,
  generatedAt: new Date().toISOString(),
  catalogConnectors: connectors.length,
  perProviderClients: coveredCount,
  registryFile: REGISTRY_FILE,
  issues,
}, null, 2));

console.log(`  📦 ${connectors.length} catalog / ${coveredCount} per-provider client modules`);
if (!ok) {
  for (const i of issues.filter((x) => x.severity === "error")) {
    console.error(`  ✖ ${i.area}: ${i.message}`);
  }
  console.error(`❌ connector-client-registry-completeness: ${errorCount} error(s)`);
  process.exit(1);
}
console.log("✅ connector-client-registry-completeness PASS");
