#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: manifest truth completeness
// Phase 30 — also surfaces transitive-staleness count from the producer→consumer graph (WARN only).
import { readJsonSafe } from "../lib/utils";

interface M { governance: Record<string, boolean>; classification: string; generatedArtifactCount: number }
interface AOM { coveragePercent: number; totalArtifacts: number; withProducer: number; orphanCount: number }
interface Graph { transitivelyStaleCount?: number; releaseCriticalStaleCount?: number; cycleCount?: number; orphanProducerCount?: number; totalNodes?: number; totalEdges?: number }

const data = readJsonSafe<M>("generated/deployment-gap-closure/manifest-truth-closure-map.json");
const aom = readJsonSafe<AOM>("generated/artifact-ownership-manifest.json");
const graphEnv = readJsonSafe<{ data?: Graph } & Graph>("generated/artifact-ownership-graph.json");
const graph: Graph | null = graphEnv ? (graphEnv.data ?? graphEnv) : null;

if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const missing = Object.entries(data.governance).filter(([, v]) => !v).map(([k]) => k);
const ok = missing.length === 0;
console.log(`${ok ? "✅" : "⚠"} Manifest truth: ${data.classification} (${data.generatedArtifactCount} artifacts)${missing.length ? ` missing: ${missing.join(", ")}` : ""}`);
if (aom) console.log(`   Producer coverage: ${aom.coveragePercent}% (${aom.withProducer}/${aom.totalArtifacts}, ${aom.orphanCount} orphans)`);
if (graph) {
  const tsi = graph.transitivelyStaleCount ?? 0;
  const rcs = graph.releaseCriticalStaleCount ?? 0;
  const cyc = graph.cycleCount ?? 0;
  const opp = graph.orphanProducerCount ?? 0;
  const symbol = (tsi > 0 || rcs > 0 || cyc > 0 || opp > 0) ? "⚠" : "✅";
  console.log(`   ${symbol} Producer→consumer graph: nodes=${graph.totalNodes ?? 0} edges=${graph.totalEdges ?? 0} cycles=${cyc} orphan-producers=${opp} transitively-stale=${tsi} release-critical-stale=${rcs}`);
}
process.exit(0);
