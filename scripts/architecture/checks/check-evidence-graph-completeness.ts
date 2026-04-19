#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 4 — Evidence Graph Completeness Validator (WARN initially, BLOCK after burn-in).
// Compares evidence_graph_nodes count vs manifest-registry entry count.
// Reads the most recent evidence-persistence-layer-status.json as ground truth
// when DB is unreachable from validator context (validators run pre-deploy).
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const issues: Issue[] = [];
const COVERAGE_BLOCK_THRESHOLD = 0.9;
const COVERAGE_WARN_THRESHOLD = 0.6;

let manifestEntries = 0;
let nodeCount = 0;
let coverage = 0;

const manifestRegistryPath = "generated/manifest-registry.json";
if (existsSync(manifestRegistryPath)) {
  try {
    const reg = JSON.parse(readFileSync(manifestRegistryPath, "utf8"));
    const entries = reg.manifests || reg.entries || reg;
    if (Array.isArray(entries)) manifestEntries = entries.length;
    else if (typeof entries === "object") manifestEntries = Object.keys(entries).length;
  } catch (e) {
    issues.push({ severity: "warning", area: "manifest-registry", message: `Parse failure: ${(e as Error).message}` });
  }
} else {
  issues.push({ severity: "warning", area: "manifest-registry", message: "manifest-registry.json not found — coverage cannot be computed" });
}

const statusPath = "generated/evidence-persistence-layer-status.json";
if (existsSync(statusPath)) {
  try {
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    nodeCount = Number(status?.last_known_node_count ?? 0);
  } catch {
    /* ignore */
  }
}

if (manifestEntries > 0) {
  coverage = nodeCount / manifestEntries;
  if (coverage < COVERAGE_WARN_THRESHOLD) {
    issues.push({
      severity: "warning",
      area: "evidence-graph",
      message: `coverage=${(coverage * 100).toFixed(1)}% (${nodeCount}/${manifestEntries}) — below WARN threshold ${COVERAGE_WARN_THRESHOLD * 100}%`,
    });
  } else if (coverage < COVERAGE_BLOCK_THRESHOLD) {
    issues.push({
      severity: "warning",
      area: "evidence-graph",
      message: `coverage=${(coverage * 100).toFixed(1)}% — below BLOCK threshold ${COVERAGE_BLOCK_THRESHOLD * 100}% (currently warn-only during ramp)`,
    });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  join("generated", "evidence-graph-completeness-report.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "evidence-graph-completeness",
      ok,
      errorCount,
      warningCount,
      manifestEntries,
      nodeCount,
      coveragePct: Number((coverage * 100).toFixed(2)),
      blockThresholdPct: COVERAGE_BLOCK_THRESHOLD * 100,
      warnThresholdPct: COVERAGE_WARN_THRESHOLD * 100,
      issues,
    },
    null,
    2,
  ),
);

console.log(`evidence-graph-completeness: ${nodeCount}/${manifestEntries} (${(coverage * 100).toFixed(1)}%), ${errorCount} errors, ${warningCount} warnings`);
process.exit(errorCount === 0 ? 0 : 1);
