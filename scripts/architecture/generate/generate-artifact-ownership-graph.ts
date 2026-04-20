#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Ownership Graph Builder
// Joins:
//   • generated/artifact-ownership-manifest.json (producer side)
//   • generated/artifact-consumer-scan.json     (consumer side)
//   • generated/manifest-truth-dashboard.json   (freshness)
// Emits generated/artifact-ownership-graph.json with directed
// producer→consumer edges, transitive staleness, orphan detection,
// and cycle detection.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import { writeJsonOutput, readJsonSafe, envelope } from "../lib/utils";

interface OwnershipEntry {
  artifact: string;
  producer: string | null;
  npmScript: string | null;
  owner: string;
  consumers: string[];
  declaredInRegistry: boolean;
  lastWrittenAt: string | null;
  source: string;
}

interface ConsumerScan {
  data?: {
    artifacts: Array<{
      artifact: string;
      consumerCount: number;
      consumers: Array<{ path: string; kind: string; line: number; pattern: string }>;
    }>;
  };
  // also handle legacy non-enveloped shape
  artifacts?: any[];
}

const STALE_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const AGING_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const ownership = readJsonSafe<{ entries: OwnershipEntry[] }>("generated/artifact-ownership-manifest.json");
const consumerScanRaw = readJsonSafe<ConsumerScan>("generated/artifact-consumer-scan.json");
if (!ownership) { console.error("❌ Missing artifact-ownership-manifest.json"); process.exit(1); }
if (!consumerScanRaw) { console.error("❌ Missing artifact-consumer-scan.json — run generate:artifact-consumers first"); process.exit(1); }
const consumerScan = consumerScanRaw.data || consumerScanRaw;

// Terminal artifacts: dashboards, audits, reports, snapshots, summaries — outputs the
// system reads, not other scripts. These are leaf nodes and excluded from the
// ≥95% consumer-coverage requirement (they're allowed to have zero consumers).
function isTerminal(artifact: string): boolean {
  const base = artifact.toLowerCase();
  return (
    base.endsWith("-report.json") ||
    base.endsWith("-readiness-report.json") ||
    base.endsWith("-summary.json") ||
    base.endsWith("-snapshot.json") ||
    base.endsWith("-status.json") ||
    base.endsWith("-baseline.json") ||
    base.endsWith("-evidence.json") ||
    base.endsWith("-metrics.json") ||
    base.endsWith("-audit.json") ||
    base.endsWith("-ledger.json") ||
    base.endsWith("-attestation.json") ||
    base.includes("dashboard") ||
    base.includes("audit") ||
    base.includes("snapshot") ||
    base.includes("/coverage") ||
    base.includes("-coverage.json")
  );
}

// Release-critical artifacts: feed BLOCK gates. If any go transitively stale, gate fails.
const RELEASE_CRITICAL_GATES = [
  "evidence-graph-completeness", "evidence-chain-integrity", "evidence-attestation-coverage",
  "evidence-retention-policy", "evidence-purge-audit", "ai-receipt-coverage", "ai-receipt-completeness",
  "connector-capability-completeness", "app-sdk-registry-completeness", "boardroom-cockpit-telemetry",
  "onboarding-branch-telemetry", "mobile-deferral-attestation", "app-sdk-extension-events",
  "release-evidence-graph-snapshot", "owner-copilot-readonly", "federation-optin-append-only",
  "dr-drill-evidence", "chaos-drill-classification", "production-launch-attestation",
  "electron-domain-layout", "os-ci-end-to-end", "recovery-boot-evidence",
];
const releaseCriticalArtifacts = new Set(RELEASE_CRITICAL_GATES.map(g => `generated/${g}-report.json`));

// Build per-artifact freshness from on-disk mtime (more reliable than dashboard which only tracks generatedAt fields)
const now = Date.now();
function freshnessOf(artifact: string, lastWrittenAt: string | null): "fresh" | "aging" | "stale" | "missing" {
  if (!fs.existsSync(artifact)) return "missing";
  let ts: number | null = null;
  if (lastWrittenAt) ts = new Date(lastWrittenAt).getTime();
  if (!ts || Number.isNaN(ts)) {
    try { ts = fs.statSync(artifact).mtimeMs; } catch { ts = null; }
  }
  if (!ts) return "missing";
  const age = now - ts;
  if (age > STALE_AGE_MS) return "stale";
  if (age > AGING_AGE_MS) return "aging";
  return "fresh";
}

// Build consumer index
const consumerByArtifact = new Map<string, ConsumerScan["data"] extends infer X ? any : any>();
for (const a of (consumerScan.artifacts || [])) {
  consumerByArtifact.set(a.artifact, a);
}

// Map every consumer file (script) → which generated artifact it ALSO produces.
// This lets us draw artifact→artifact edges (producer-of-A is also consumer-of-B ⇒ B feeds A).
const producerByArtifact = new Map<string, string>();
for (const e of ownership.entries) {
  if (e.producer) producerByArtifact.set(e.artifact, e.producer.split(" ")[0]);
}
const artifactByProducerScript = new Map<string, string[]>();
for (const [art, prod] of producerByArtifact) {
  if (!artifactByProducerScript.has(prod)) artifactByProducerScript.set(prod, []);
  artifactByProducerScript.get(prod)!.push(art);
}

// Nodes
interface GraphNode {
  id: string;
  producer: string | null;
  owner: string;
  freshness: "fresh" | "aging" | "stale" | "missing";
  lastGeneratedAt: string | null;
  isTerminal: boolean;
  isReleaseCritical: boolean;
  consumerCount: number;
}

// Edges
interface GraphEdge {
  from: string;        // producing artifact
  to: string;          // consuming artifact OR consumer file (when artifact-to-artifact unavailable)
  toKind: "artifact" | "script" | "component" | "edge-function" | "shell" | "other";
  relation: "feeds";
}

const nodes: GraphNode[] = [];
const edges: GraphEdge[] = [];

for (const e of ownership.entries) {
  if (!e.artifact.endsWith(".json")) continue; // graph is JSON-artifact-scoped
  const fresh = freshnessOf(e.artifact, e.lastWrittenAt);
  const cs = consumerByArtifact.get(e.artifact);
  const consumerCount = cs?.consumerCount ?? 0;
  nodes.push({
    id: e.artifact,
    producer: e.producer ? e.producer.split(" ")[0] : null,
    owner: e.owner,
    freshness: fresh,
    lastGeneratedAt: e.lastWrittenAt,
    isTerminal: isTerminal(e.artifact),
    isReleaseCritical: releaseCriticalArtifacts.has(e.artifact),
    consumerCount,
  });

  // Artifact→artifact: each consumer script that ALSO produces another artifact creates an edge
  // BUT skip cases where the consumer script IS the producer of the current artifact (sibling-output
  // false positive: a single generator that emits multiple JSONs reads its own input fixtures, which
  // would otherwise create artificial A↔B cycles between sibling outputs).
  const ownProducer = e.producer ? e.producer.split(" ")[0] : null;
  if (cs && Array.isArray(cs.consumers)) {
    const seenTargets = new Set<string>();
    for (const c of cs.consumers) {
      if (ownProducer && c.path === ownProducer) continue; // self-producer read — not a real edge
      const downstreamArtifacts = artifactByProducerScript.get(c.path);
      if (downstreamArtifacts) {
        for (const downstream of downstreamArtifacts) {
          if (downstream === e.artifact) continue;
          const edgeKey = `${e.artifact}::${downstream}`;
          if (seenTargets.has(edgeKey)) continue;
          seenTargets.add(edgeKey);
          edges.push({ from: e.artifact, to: downstream, toKind: "artifact", relation: "feeds" });
        }
      } else {
        // terminal consumer (component/edge-function/shell with no JSON output)
        const edgeKey = `${e.artifact}::${c.path}`;
        if (seenTargets.has(edgeKey)) continue;
        seenTargets.add(edgeKey);
        edges.push({
          from: e.artifact,
          to: c.path,
          toKind: c.kind as GraphEdge["toKind"],
          relation: "feeds",
        });
      }
    }
  }
}

// Cycle detection (artifact→artifact edges only)
const adj = new Map<string, string[]>();
for (const e of edges) {
  if (e.toKind !== "artifact") continue;
  if (!adj.has(e.from)) adj.set(e.from, []);
  adj.get(e.from)!.push(e.to);
}
const cycles: string[][] = [];
{
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const stack: string[] = [];
  function dfs(n: string) {
    color.set(n, GRAY); stack.push(n);
    for (const next of adj.get(n) || []) {
      const c = color.get(next) ?? WHITE;
      if (c === WHITE) dfs(next);
      else if (c === GRAY) {
        const idx = stack.indexOf(next);
        if (idx !== -1) cycles.push([...stack.slice(idx), next]);
      }
    }
    color.set(n, BLACK); stack.pop();
  }
  for (const n of adj.keys()) {
    if ((color.get(n) ?? WHITE) === WHITE) dfs(n);
  }
}

// Transitive staleness: BFS from every stale node along outgoing edges
const staleSet = new Set(nodes.filter(n => n.freshness === "stale").map(n => n.id));
const transitivelyStale = new Set<string>();
{
  const queue = [...staleSet];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const next of adj.get(cur) || []) {
      if (!transitivelyStale.has(next) && !staleSet.has(next)) {
        transitivelyStale.add(next);
        queue.push(next);
      }
    }
  }
}

// Orphans
const orphanProducers: string[] = []; // producer declared but artifact missing on disk
const orphanConsumers: string[] = []; // artifact has no producer but is read by something
for (const n of nodes) {
  if (n.producer && n.freshness === "missing") orphanProducers.push(n.id);
  if (!n.producer && n.consumerCount > 0) orphanConsumers.push(n.id);
}

// Hubs (most-consumed)
const hubs = [...nodes].sort((a, b) => b.consumerCount - a.consumerCount).slice(0, 10).map(n => ({
  artifact: n.id, consumerCount: n.consumerCount, owner: n.owner,
}));

// Stale blast-radius
const staleBlast = [...staleSet].map(s => {
  const downstream = new Set<string>();
  const q = [s];
  while (q.length) {
    const cur = q.shift()!;
    for (const next of adj.get(cur) || []) if (!downstream.has(next)) { downstream.add(next); q.push(next); }
  }
  return { artifact: s, blastRadius: downstream.size, downstream: [...downstream].slice(0, 10) };
}).sort((a, b) => b.blastRadius - a.blastRadius).slice(0, 10);

const releaseCriticalStale = nodes.filter(n => n.isReleaseCritical && (n.freshness === "stale" || transitivelyStale.has(n.id))).map(n => n.id);

const out = {
  totalNodes: nodes.length,
  totalEdges: edges.length,
  artifactToArtifactEdges: edges.filter(e => e.toKind === "artifact").length,
  artifactToConsumerEdges: edges.filter(e => e.toKind !== "artifact").length,
  freshNodes: nodes.filter(n => n.freshness === "fresh").length,
  agingNodes: nodes.filter(n => n.freshness === "aging").length,
  staleNodes: staleSet.size,
  missingNodes: nodes.filter(n => n.freshness === "missing").length,
  transitivelyStaleCount: transitivelyStale.size,
  transitivelyStale: [...transitivelyStale],
  releaseCriticalStaleCount: releaseCriticalStale.length,
  releaseCriticalStale,
  orphanProducerCount: orphanProducers.length,
  orphanProducers,
  orphanConsumerCount: orphanConsumers.length,
  orphanConsumers,
  cycleCount: cycles.length,
  cycles,
  hubs,
  staleBlastRadius: staleBlast,
  nodes,
  edges,
};

writeJsonOutput("generated/artifact-ownership-graph.json", envelope("1.0.0", out));
console.log(`✅ generate-artifact-ownership-graph: ${nodes.length} nodes, ${edges.length} edges, ${cycles.length} cycles, ${transitivelyStale.size} transitively-stale, ${releaseCriticalStale.length} release-critical-stale`);
