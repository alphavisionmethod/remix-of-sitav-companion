#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — BLOCK Gate #30: Artifact Ownership Graph Completeness
// Asserts the producer→consumer ownership graph is:
//   1. Present and fresh (<24h)
//   2. ≥95% of non-terminal nodes have at least one consumer
//   3. Zero cycles
//   4. Zero orphan producers (producer declared, artifact missing)
//   5. Zero release-critical artifacts that are stale or transitively stale
// Emits generated/artifact-ownership-graph-report.json so the master
// release aggregator (check-os-release-readiness.ts) can pick it up.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { readJsonSafe } from "../lib/utils";

interface Issue { severity: "error" | "warning"; area: string; message: string; }

const GRAPH_PATH = "generated/artifact-ownership-graph.json";
const REPORT_PATH = "generated/artifact-ownership-graph-report.json";
const FRESHNESS_MAX_MS = 24 * 60 * 60 * 1000;
const CONSUMER_COVERAGE_MIN_PCT = 95;

const issues: Issue[] = [];

const enveloped = readJsonSafe<{ generatedAt?: string; data?: any }>(GRAPH_PATH);
const graph = enveloped?.data ?? enveloped;

if (!graph || typeof graph.totalNodes !== "number") {
  issues.push({ severity: "error", area: "presence", message: `Missing or malformed ${GRAPH_PATH}. Run: npm run generate:artifact-ownership-graph` });
} else {
  // 1. Freshness (file mtime)
  try {
    const ageMs = Date.now() - statSync(GRAPH_PATH).mtimeMs;
    if (ageMs > FRESHNESS_MAX_MS) {
      issues.push({ severity: "error", area: "freshness", message: `Graph is ${Math.round(ageMs / 3.6e6)}h old (>24h). Regenerate.` });
    }
  } catch { /* covered by presence */ }

  // 2. Consumer coverage on non-terminal nodes
  const nonTerminal = (graph.nodes || []).filter((n: any) => !n.isTerminal);
  const withConsumer = nonTerminal.filter((n: any) => n.consumerCount > 0).length;
  const pct = nonTerminal.length === 0 ? 100 : Math.round((withConsumer / nonTerminal.length) * 100);
  if (pct < CONSUMER_COVERAGE_MIN_PCT) {
    issues.push({
      severity: "error",
      area: "consumer-coverage",
      message: `Consumer coverage ${pct}% < ${CONSUMER_COVERAGE_MIN_PCT}% (${withConsumer}/${nonTerminal.length} non-terminal nodes consumed)`,
    });
  }

  // 3. Cycles
  if ((graph.cycleCount ?? 0) > 0) {
    issues.push({
      severity: "error",
      area: "cycles",
      message: `${graph.cycleCount} cycle(s) detected: ${(graph.cycles || []).slice(0, 3).map((c: string[]) => c.join(" → ")).join("; ")}`,
    });
  }

  // 4. Orphan producers
  if ((graph.orphanProducerCount ?? 0) > 0) {
    issues.push({
      severity: "error",
      area: "orphan-producers",
      message: `${graph.orphanProducerCount} orphan producer(s): ${(graph.orphanProducers || []).slice(0, 5).join(", ")}`,
    });
  }

  // 5. Release-critical staleness
  if ((graph.releaseCriticalStaleCount ?? 0) > 0) {
    issues.push({
      severity: "error",
      area: "release-critical-staleness",
      message: `${graph.releaseCriticalStaleCount} release-critical artifact(s) stale or transitively stale: ${(graph.releaseCriticalStale || []).slice(0, 5).join(", ")}`,
    });
  }

  // Warnings (non-blocking observations)
  if ((graph.transitivelyStaleCount ?? 0) > 0) {
    issues.push({ severity: "warning", area: "transitive-staleness", message: `${graph.transitivelyStaleCount} downstream artifact(s) flagged transitively-stale.` });
  }
  if ((graph.orphanConsumerCount ?? 0) > 0) {
    issues.push({ severity: "warning", area: "orphan-consumers", message: `${graph.orphanConsumerCount} artifact(s) consumed but lack a declared producer.` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const warningCount = issues.filter(i => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "artifact-ownership-graph",
  phase: "phase-30-producer-consumer-graph",
  errorCount,
  warningCount,
  ok,
  issues,
  metrics: graph ? {
    totalNodes: graph.totalNodes,
    totalEdges: graph.totalEdges,
    artifactToArtifactEdges: graph.artifactToArtifactEdges,
    fresh: graph.freshNodes,
    aging: graph.agingNodes,
    stale: graph.staleNodes,
    transitivelyStale: graph.transitivelyStaleCount,
    cycles: graph.cycleCount,
    orphanProducers: graph.orphanProducerCount,
    releaseCriticalStale: graph.releaseCriticalStaleCount,
  } : null,
}, null, 2));

console.log(`Artifact ownership graph: ${ok ? "✅ OK" : `❌ ${errorCount} errors`}${warningCount ? ` (${warningCount} warnings)` : ""}`);
if (graph) {
  console.log(`   nodes=${graph.totalNodes} edges=${graph.totalEdges} cycles=${graph.cycleCount} orphan-producers=${graph.orphanProducerCount} rc-stale=${graph.releaseCriticalStaleCount}`);
}
if (!ok) {
  for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
if (!existsSync(GRAPH_PATH)) process.exit(1);
process.exit(0);
