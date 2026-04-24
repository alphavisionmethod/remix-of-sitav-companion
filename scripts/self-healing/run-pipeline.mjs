#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Phase 1→6 pipeline entrypoint.
//
// Order:
//   P1 normalize-failures.mjs      → failure-report.json     (triage)
//   P2 group-root-causes.mjs       → root-cause-clusters.json (RCA)
//   P2.5 llm-narrative (optional)  → annotates clusters
//   P3 (in-process)                → strategy resolution per cluster
//   P4 policy-engine               → lane decision + patch gate
//   P5 execute-safe-repairs.mjs    → applies / proposes
//   P6 chained receipts            → tamper-evident audit trail
//
// Flags:
//   --apply       Actually apply repairs (default: dry-run)
//   --no-llm      Force-disable LLM narrative even if SITA_HEAL_LLM=1
//   --verify      Only verify the receipt chain, don't run pipeline
// ═══════════════════════════════════════════════════════════════
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { annotateClustersFile } from "./lib/llm-narrative.mjs";
import { emitChainedReceipt, verifyChain } from "./lib/heal-receipt-chain.mjs";

const APPLY = process.argv.includes("--apply");
const NO_LLM = process.argv.includes("--no-llm");
const VERIFY_ONLY = process.argv.includes("--verify");
const CLUSTERS = path.resolve("generated/self-healing/root-cause-clusters.json");
const HISTORY = path.resolve("generated/self-healing/repair-history.json");

function step(name, cmd, args) {
  console.log(`\n[pipeline] ▶ ${name}`);
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) { console.error(`[pipeline] ✗ ${name} exited ${r.status}`); process.exit(r.status || 1); }
  console.log(`[pipeline] ✓ ${name}`);
}

if (VERIFY_ONLY) {
  const v = verifyChain();
  console.log(`[pipeline] receipt chain verify:`, v);
  process.exit(v.ok ? 0 : 1);
}

// P1
step("P1 normalize-failures (triage)", "node", ["scripts/self-healing/normalize-failures.mjs"]);

// P2
step("P2 group-root-causes (RCA)", "node", ["scripts/self-healing/group-root-causes.mjs"]);

// P2.5 optional narrative
if (!NO_LLM) {
  console.log("\n[pipeline] ▶ P2.5 LLM narrative (optional)");
  const out = await annotateClustersFile(CLUSTERS);
  console.log(`[pipeline] ✓ narrative ${out.status}: ${out.annotated}/${out.total}`);
}

// P3+P4+P5 — execute-safe-repairs combines strategy resolution +
// policy decision + execution. Receives --apply if set.
step(
  "P3+P4+P5 execute-safe-repairs",
  "node",
  ["scripts/self-healing/execute-safe-repairs.mjs", ...(APPLY ? ["--apply"] : [])],
);

// P6 chained receipt for the whole run
const history = existsSync(HISTORY) ? JSON.parse(readFileSync(HISTORY, "utf8")) : { runs: [] };
const lastRun = history.runs.at(-1);
const sealed = emitChainedReceipt({
  kind: "self-heal-pipeline-run",
  apply: APPLY,
  llmNarrative: !NO_LLM && process.env.SITA_HEAL_LLM === "1",
  proofs: lastRun?.proofs || [],
  clusterFile: CLUSTERS,
});
console.log(`\n[pipeline] ✓ P6 sealed receipt ${sealed.id} (seq ${sealed.seq}, hash ${sealed.hash.slice(0, 12)}…)`);

const v = verifyChain();
console.log(`[pipeline] chain verify:`, v.ok ? `ok (${v.total} receipts)` : `BROKEN at ${v.brokenAt}`);
process.exit(v.ok ? 0 : 2);