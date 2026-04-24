#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Repair Execution Orchestrator
// Reads root-cause-clusters.json, applies policy, executes safe
// strategies with snapshots, persists repair-proof-*.json.
// Default DRY. Set --apply to actually execute.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { decideRepair } from "./lib/policy-engine.mjs";
import { strategyForClass, runStrategy } from "./lib/repair-strategies.mjs";
import { createRepairContext, persistRepairContext, snapshotFile } from "./lib/repair-context.mjs";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const CLUSTERS = path.resolve("generated/self-healing/root-cause-clusters.json");
const HISTORY = path.resolve("generated/self-healing/repair-history.json");
const ATTESTATIONS = path.resolve("generated/self-healing/approvals.json");

// Load human attestations the gate requires. Format:
// { "approvals": [ { "user": "alice", "team": "@sita/platform-core", "ts": "..." } ],
//   "bypassAttempted": [] }
const env = existsSync(ATTESTATIONS)
  ? JSON.parse(readFileSync(ATTESTATIONS, "utf8"))
  : { approvals: [], bypassAttempted: [] };

if (!existsSync(CLUSTERS)) { console.error(`[execute] missing ${CLUSTERS}`); process.exit(1); }
const clusters = JSON.parse(readFileSync(CLUSTERS, "utf8"));

const proofs = [];
for (const cluster of clusters.clusters) {
  const decision = decideRepair(cluster, env);
  console.log(`[execute] ${cluster.class} → ${decision.decision} (${decision.lane}) — ${decision.reason}`);

  if (decision.decision === "REFUSE" || decision.decision === "ESCALATE" || decision.decision === "DOWNGRADE-TO-GATED") {
    proofs.push({ clusterId: cluster.clusterId, decision, applied: false });
    continue;
  }

  const strategy = strategyForClass(cluster.class);
  const ctx = createRepairContext({ cluster, decision, files: cluster.impactedFiles });

  if (!APPLY) {
    ctx.outcome = { dryRun: true, plannedStrategy: strategy };
    persistRepairContext(ctx, "-plan");
    proofs.push({ clusterId: cluster.clusterId, repairId: ctx.repairId, decision, strategy, dryRun: true });
    continue;
  }

  // Defense-in-depth: even if a caller hand-crafts a PROCEED decision,
  // refuse to mutate the tree without a passing patch-application gate.
  if (!decision.gate?.ok) {
    console.error(`[execute] REFUSING APPLY — gate not satisfied for ${cluster.clusterId}: ${decision.gate?.reason || "no gate result"}`);
    proofs.push({ clusterId: cluster.clusterId, repairId: ctx.repairId, decision, strategy, applied: false, refusedReason: "gate-not-ok" });
    continue;
  }

  const result = runStrategy(strategy, { files: cluster.impactedFiles, cluster });
  ctx.strategyExecuted = strategy;
  ctx.snapshotsAfter = cluster.impactedFiles.map(snapshotFile);
  ctx.outcome = result;
  const proofFile = persistRepairContext(ctx, "-proof");
  proofs.push({ clusterId: cluster.clusterId, repairId: ctx.repairId, decision, strategy, applied: result.applied, proofFile });
}

const history = existsSync(HISTORY) ? JSON.parse(readFileSync(HISTORY, "utf8")) : { runs: [] };
history.runs.push({ runAt: new Date().toISOString(), apply: APPLY, proofs });
writeFileSync(HISTORY, JSON.stringify(history, null, 2));
console.log(`[execute] ${proofs.length} clusters processed; history → ${HISTORY}`);