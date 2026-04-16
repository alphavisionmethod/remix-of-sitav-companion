#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Bounded Context Manifest Generator
// Reads bounded-context-registry.ts and produces machine-readable
// generated/bounded-context-manifest.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, envelope, readFileContent } from "../../architecture/lib/utils";

const registryPath = "src/lib/architecture/bounded-context-registry.ts";
const efPath = "src/lib/backend-topology/edge-function-bounded-contexts.ts";

if (!fs.existsSync(registryPath)) {
  console.error(`❌ generate-bounded-context-manifest: registry not found at ${registryPath}`);
  process.exit(1);
}

const src = readFileContent(registryPath);

interface ManifestEntry {
  contextId: string;
  contextName: string;
  owner: string;
  primarySurface: string;
  deploymentUnit: string;
  edgeFunctionCount: number;
  serviceCount: number;
  tableCount: number;
  killSwitchCount: number;
  runbookCount: number;
  journeyCount: number;
  runtimeTierCount: number;
}

const entries: ManifestEntry[] = [];

// Parse each entry block — between "contextId:" markers
const entryRegex = /contextId:\s*"([a-z0-9-]+)"[\s\S]*?(?=contextId:\s*"|^\] as const;)/gm;
const matches = [...src.matchAll(entryRegex)];

function countListItems(block: string, key: string): number {
  const m = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) return 0;
  const items = [...m[1].matchAll(/"[^"]+"/g)];
  return items.length;
}

function extractScalar(block: string, key: string): string {
  const m = block.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  return m?.[1] || "";
}

for (const m of matches) {
  const block = m[0];
  entries.push({
    contextId: m[1],
    contextName: extractScalar(block, "contextName"),
    owner: extractScalar(block, "owner"),
    primarySurface: extractScalar(block, "primarySurface"),
    deploymentUnit: extractScalar(block, "deploymentUnit"),
    edgeFunctionCount: countListItems(block, "edgeFunctions"),
    serviceCount: countListItems(block, "services"),
    tableCount: countListItems(block, "tables"),
    killSwitchCount: countListItems(block, "killSwitches"),
    runbookCount: countListItems(block, "supportRunbooks"),
    journeyCount: countListItems(block, "criticalJourneys"),
    runtimeTierCount: countListItems(block, "runtimeTiersSupported"),
  });
}

const totalEdgeFns = entries.reduce((s, e) => s + e.edgeFunctionCount, 0);
const totalTables = entries.reduce((s, e) => s + e.tableCount, 0);
const totalServices = entries.reduce((s, e) => s + e.serviceCount, 0);

let efMapCount = 0;
if (fs.existsSync(efPath)) {
  const efSrc = readFileContent(efPath);
  efMapCount = [...efSrc.matchAll(/^\s*"[a-z0-9-]+":/gm)].length;
}

const manifest = envelope("1.0.0", {
  registrySource: registryPath,
  summary: {
    totalContexts: entries.length,
    totalEdgeFunctionRefs: totalEdgeFns,
    totalTableRefs: totalTables,
    totalServiceRefs: totalServices,
    edgeFunctionsInTopologyMap: efMapCount,
  },
  contexts: entries,
});

writeJsonOutput("generated/bounded-context-manifest.json", manifest);
console.log(`✅ generate-bounded-context-manifest: ${entries.length} contexts, ${totalEdgeFns} edge fn refs, ${totalTables} tables`);
