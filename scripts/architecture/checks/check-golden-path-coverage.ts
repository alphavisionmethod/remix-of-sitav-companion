#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Coverage Check
// Asserts every Golden Path is fully wired:
//   • Every contextId in registry resolves to a real bounded context
//   • Every blocking kill-switch resolves
//   • Every recovery runbook resolves
//   • Every Golden Path declared in BOUNDED_CONTEXT_REGISTRY.criticalJourneys
//     exists in GOLDEN_PATH_REGISTRY (no orphan references)
//   • Every P0/P1 path has at least one Playwright e2e verification
//   • Every P0 path has at least one receipt-emitted verification
//   • Step ordering is monotonically increasing and unique
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import { GOLDEN_PATH_REGISTRY } from "../../../src/lib/operations/golden-path-registry";
import { getMissingVerifications } from "../../../src/lib/operations/golden-path-verification-map";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/lib/architecture/bounded-context-registry";
import { KILL_SWITCH_REGISTRY } from "../../../src/lib/control-plane/kill-switch-registry";
import { RUNBOOK_REGISTRY } from "../../../src/lib/support/runbook-registry";

const vc = new ViolationCollector();

const validContextIds = new Set(BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId));
const validSwitchIds = new Set(KILL_SWITCH_REGISTRY.map((s) => s.switchId));
const validRunbookIds = new Set(RUNBOOK_REGISTRY.map((r) => r.runbookId));
const goldenPathIds = new Set(GOLDEN_PATH_REGISTRY.map((p) => p.pathId));

// ── Per-path validation ──────────────────────────────────────
for (const p of GOLDEN_PATH_REGISTRY) {
  const id = p.pathId;

  const file = "src/lib/operations/golden-path-registry.ts";

  // Primary context
  if (!validContextIds.has(p.primaryContextId as any)) {
    vc.add(file, "context-ref", `${id}: primaryContextId "${p.primaryContextId}" does not exist`);
  }

  // Context list
  for (const ctx of p.contextIds) {
    if (!validContextIds.has(ctx as any)) {
      vc.add(file, "context-ref", `${id}: contextIds includes unknown "${ctx}"`);
    }
  }
  if (!p.contextIds.includes(p.primaryContextId)) {
    vc.add(file, "context-ref", `${id}: contextIds must include primaryContextId "${p.primaryContextId}"`);
  }

  // Path-level kill switches
  for (const sw of p.blockingKillSwitches) {
    if (!validSwitchIds.has(sw)) {
      vc.add(file, "killswitch-ref", `${id}: blockingKillSwitches references unknown "${sw}"`);
    }
  }

  // Path-level runbooks
  for (const rb of p.recoveryRunbookRefs) {
    if (!validRunbookIds.has(rb)) {
      vc.add(file, "runbook-ref", `${id}: recoveryRunbookRefs references unknown "${rb}"`);
    }
  }

  // Steps
  if (p.steps.length === 0) {
    vc.add(file, "step-required", `${id}: must declare at least one step`);
  }
  const seenOrders = new Set<number>();
  const seenStepIds = new Set<string>();
  let lastOrder = 0;
  for (const step of p.steps) {
    if (seenStepIds.has(step.stepId)) {
      vc.add(file, "step-unique", `${id}: duplicate stepId "${step.stepId}"`);
    }
    seenStepIds.add(step.stepId);
    if (seenOrders.has(step.order)) {
      vc.add(file, "step-order", `${id}: duplicate step order ${step.order}`);
    }
    seenOrders.add(step.order);
    if (step.order <= lastOrder) {
      vc.add(file, "step-order", `${id}: step order not strictly increasing at "${step.stepId}"`);
    }
    lastOrder = step.order;

    if (!validContextIds.has(step.contextId as any)) {
      vc.add(file, "context-ref", `${id}.${step.stepId}: contextId "${step.contextId}" does not exist`);
    }
    for (const sw of step.blockingKillSwitches) {
      if (!validSwitchIds.has(sw)) {
        vc.add(file, "killswitch-ref", `${id}.${step.stepId}: unknown switch "${sw}"`);
      }
    }
    for (const rb of step.recoveryRunbookRefs) {
      if (!validRunbookIds.has(rb)) {
        vc.add(file, "runbook-ref", `${id}.${step.stepId}: unknown runbook "${rb}"`);
      }
    }
  }
}

// ── Reverse linkage: every criticalJourney in bounded contexts must exist ──
for (const ctx of BOUNDED_CONTEXT_REGISTRY) {
  for (const journeyId of ctx.criticalJourneys) {
    if (!goldenPathIds.has(journeyId as any)) {
      vc.add(
        "src/lib/architecture/bounded-context-registry.ts",
        "golden-path-ref",
        `${ctx.contextId}: criticalJourneys references unknown Golden Path "${journeyId}"`
      );
    }
  }
}

// ── Verification coverage ────────────────────────────────────
for (const m of getMissingVerifications()) {
  vc.add(
    "src/lib/operations/golden-path-verification-map.ts",
    "verification-coverage",
    `${m.pathId}: ${m.reasons.join(", ")}`
  );
}

// ── Report ───────────────────────────────────────────────────
vc.report("check-golden-path-coverage");
if (vc.errors.length === 0) {
  console.log(
    `   ${GOLDEN_PATH_REGISTRY.length} Golden Paths, ` +
      `${GOLDEN_PATH_REGISTRY.reduce((n, p) => n + p.steps.length, 0)} step(s) verified`
  );
}
vc.exitIfErrors();
