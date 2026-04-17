#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Coverage Check (Phase 29 hardened)
// Asserts every Golden Path is fully wired AND backed by real
// on-disk artifacts and resolved cross-registry references.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../lib/utils";
import { GOLDEN_PATH_REGISTRY } from "../../../src/lib/operations/golden-path-registry";
import { getMissingVerifications } from "../../../src/lib/operations/golden-path-verification-map";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/lib/architecture/bounded-context-registry";
import { KILL_SWITCH_REGISTRY } from "../../../src/lib/control-plane/kill-switch-registry";
import { RUNBOOK_REGISTRY } from "../../../src/lib/support/runbook-registry";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { CANONICAL_SERVICES } from "../../../src/lib/architecture/canonical-service-registry";
import { DB_SCHEMA_REGISTRY } from "../../../src/lib/db/schema-registry";

const vc = new ViolationCollector();
const repoRoot = process.cwd();

const validContextIds = new Set(BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId));
const validSwitchIds = new Set(KILL_SWITCH_REGISTRY.map((s) => s.switchId));
const validRunbookIds = new Set(RUNBOOK_REGISTRY.map((r) => r.runbookId));
const goldenPathIds = new Set(GOLDEN_PATH_REGISTRY.map((p) => p.pathId));
const validEdgeFns = new Set(EDGE_FUNCTION_REGISTRY.map((e) => e.name));
const validServices = new Set(CANONICAL_SERVICES.map((s) => s.id));
const validTables = new Set(DB_SCHEMA_REGISTRY.map((t) => t.name));

// Known release gates (until launch-readiness-gates.ts is generated)
const validGateRefs = new Set<string>([
  "GATE-23-GOLDEN-PATH",
  "GATE-37-MANIFEST-TRUTH",
  "GATE-AUTH-RELIABILITY",
  "GATE-DR-RECOVERY",
  "GATE-CONNECTOR-HEALTH",
  "GATE-APPROVAL-INTEGRITY",
  "GATE-PROOF-CHAIN",
  "GATE-MOBILE-PUSH",
  "GATE-KILL-SWITCH-COVERAGE",
]);

const phantomArtifacts: string[] = [];

function assertExists(file: string, ref: string, ctx: string) {
  const abs = path.resolve(repoRoot, ref);
  if (!fs.existsSync(abs)) {
    phantomArtifacts.push(ref);
    vc.add(file, "phantom-artifact", `${ctx}: artifactRef "${ref}" does not exist on disk`);
  }
}

// ── Per-path validation ──────────────────────────────────────
for (const p of GOLDEN_PATH_REGISTRY) {
  const id = p.pathId;
  const file = "src/lib/operations/golden-path-registry.ts";

  if (!validContextIds.has(p.primaryContextId as any)) {
    vc.add(file, "context-ref", `${id}: primaryContextId "${p.primaryContextId}" does not exist`);
  }
  for (const ctx of p.contextIds) {
    if (!validContextIds.has(ctx as any)) {
      vc.add(file, "context-ref", `${id}: contextIds includes unknown "${ctx}"`);
    }
  }
  if (!p.contextIds.includes(p.primaryContextId)) {
    vc.add(file, "context-ref", `${id}: contextIds must include primaryContextId "${p.primaryContextId}"`);
  }
  for (const sw of p.blockingKillSwitches) {
    if (!validSwitchIds.has(sw)) vc.add(file, "killswitch-ref", `${id}: unknown switch "${sw}"`);
  }
  for (const rb of p.recoveryRunbookRefs) {
    if (!validRunbookIds.has(rb)) vc.add(file, "runbook-ref", `${id}: unknown runbook "${rb}"`);
  }

  // Phase 29: release gate refs
  for (const g of p.releaseGateRefs) {
    if (!validGateRefs.has(g)) vc.add(file, "gate-ref", `${id}: unknown release gate "${g}"`);
  }
  if (!p.supportFallbackUrl || !p.supportFallbackUrl.startsWith("/")) {
    vc.add(file, "support-url", `${id}: supportFallbackUrl must be absolute path`);
  }

  // Path-level verification artifacts on disk
  for (const v of p.verifications) assertExists(file, v.artifactRef, `${id}.verification[${v.kind}]`);

  if (p.steps.length === 0) vc.add(file, "step-required", `${id}: must declare at least one step`);

  const seenOrders = new Set<number>();
  const seenStepIds = new Set<string>();
  let lastOrder = 0;
  for (const step of p.steps) {
    if (seenStepIds.has(step.stepId)) vc.add(file, "step-unique", `${id}: duplicate stepId "${step.stepId}"`);
    seenStepIds.add(step.stepId);
    if (seenOrders.has(step.order)) vc.add(file, "step-order", `${id}: duplicate order ${step.order}`);
    seenOrders.add(step.order);
    if (step.order <= lastOrder) {
      vc.add(file, "step-order", `${id}: order not strictly increasing at "${step.stepId}"`);
    }
    lastOrder = step.order;

    if (!validContextIds.has(step.contextId as any)) {
      vc.add(file, "context-ref", `${id}.${step.stepId}: contextId "${step.contextId}" missing`);
    }
    for (const sw of step.blockingKillSwitches) {
      if (!validSwitchIds.has(sw)) vc.add(file, "killswitch-ref", `${id}.${step.stepId}: unknown switch "${sw}"`);
    }
    for (const rb of step.recoveryRunbookRefs) {
      if (!validRunbookIds.has(rb)) vc.add(file, "runbook-ref", `${id}.${step.stepId}: unknown runbook "${rb}"`);
    }

    // Phase 29: cross-registry refs
    for (const ef of step.edgeFunctionRefs) {
      if (!validEdgeFns.has(ef)) {
        vc.add(file, "edge-fn-ref", `${id}.${step.stepId}: unknown edge function "${ef}"`);
      }
    }
    for (const sv of step.serviceRefs) {
      if (!validServices.has(sv)) {
        vc.add(file, "service-ref", `${id}.${step.stepId}: unknown service "${sv}"`);
      }
    }
    for (const tb of step.tableRefs) {
      // Allow auth.* tables (managed by Supabase, not in public schema registry)
      if (tb.startsWith("auth.")) continue;
      if (!validTables.has(tb)) {
        vc.add(file, "table-ref", `${id}.${step.stepId}: unknown table "${tb}"`);
      }
    }
    if (step.screenComponentRef) {
      assertExists(file, step.screenComponentRef, `${id}.${step.stepId}.screenComponentRef`);
    }
  }
}

// Reverse linkage
for (const ctx of BOUNDED_CONTEXT_REGISTRY) {
  for (const journeyId of ctx.criticalJourneys) {
    if (!goldenPathIds.has(journeyId as any)) {
      vc.add(
        "src/lib/architecture/bounded-context-registry.ts",
        "golden-path-ref",
        `${ctx.contextId}: criticalJourneys references unknown "${journeyId}"`
      );
    }
  }
}

// Verification coverage
for (const m of getMissingVerifications()) {
  vc.add(
    "src/lib/operations/golden-path-verification-map.ts",
    "verification-coverage",
    `${m.pathId}: ${m.reasons.join(", ")}`
  );
}

vc.report("check-golden-path-coverage");
if (vc.errors.length === 0) {
  console.log(
    `   ${GOLDEN_PATH_REGISTRY.length} Golden Paths, ` +
      `${GOLDEN_PATH_REGISTRY.reduce((n, p) => n + p.steps.length, 0)} step(s) verified ` +
      `· 0 phantom artifacts · all cross-registry refs resolved`
  );
}
vc.exitIfErrors();
