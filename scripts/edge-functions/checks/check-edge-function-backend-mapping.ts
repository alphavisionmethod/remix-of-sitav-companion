#!/usr/bin/env node
/* eslint-disable no-console */
// Wave 16 — ADVISORY: Edge Function Backend Mapping
import { writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_TABLE_IO } from "../../../src/lib/backend-topology/edge-function-table-io-map";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

interface Issue { fn: string; severity: "error" | "warning"; message: string }
const issues: Issue[] = [];
const registryNames = new Set(EDGE_FUNCTION_REGISTRY.map(f => f.name));

// Check table-io coverage
const activeFns = EDGE_FUNCTION_REGISTRY.filter(f =>
  f.status === "active" && f.migrationStatus !== "wrapper"
);
for (const f of activeFns) {
  if (!EDGE_FUNCTION_TABLE_IO[f.name]) {
    issues.push({ fn: f.name, severity: "warning", message: "Missing table-io-map entry" });
  }
}

// Orphan check
const FN_DIR = "supabase/functions";
if (existsSync(FN_DIR)) {
  for (const d of readdirSync(FN_DIR)) {
    if (d.startsWith("_") || d.startsWith(".")) continue;
    try {
      if (!statSync(join(FN_DIR, d)).isDirectory()) continue;
      if (!registryNames.has(d)) {
        issues.push({ fn: d, severity: "warning", message: "On-disk function not in registry" });
      }
    } catch { /* skip */ }
  }
}

writeFileSync(join(OUT, "edge-function-backend-mapping-report.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "edge-function-backend-mapping",
  ok: true, warningCount: issues.length, issues,
}, null, 2));

console.log(`${issues.length === 0 ? "✅" : "⚠"} edge-function-backend-mapping: ${issues.length} warnings`);
process.exit(0);