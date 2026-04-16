#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Coverage Check
// Asserts:
//   • Every high-risk subsystem has a kill switch
//   • Every switch maps to a real bounded context (Phase 1)
//   • Every switch has at least one enforcement point
//   • Every switch has a runtime consequence declared
//   • Every dependency edge resolves to a real switch
//   • Every runbookRef points to a real runbook ID
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import { KILL_SWITCH_REGISTRY } from "../../../src/lib/control-plane/kill-switch-registry";
import { KILL_SWITCH_ENFORCEMENT_MAP } from "../../../src/lib/control-plane/kill-switch-enforcement-map";
import { KILL_SWITCH_DEPENDENCY_MAP } from "../../../src/lib/control-plane/kill-switch-dependency-map";
import { KILL_SWITCH_CONSEQUENCE_MAP } from "../../../src/lib/control-plane/kill-switch-runtime-consequence";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/lib/architecture/bounded-context-registry";
import { RUNBOOK_REGISTRY } from "../../../src/lib/support/runbook-registry";

const vc = new ViolationCollector();

const validContextIds = new Set(BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId));
const validSwitchIds = new Set(KILL_SWITCH_REGISTRY.map((s) => s.switchId));
const validRunbookIds = new Set(RUNBOOK_REGISTRY.map((r) => r.runbookId));
const enforcementBySwitch = new Map<string, number>();
for (const point of KILL_SWITCH_ENFORCEMENT_MAP) {
  enforcementBySwitch.set(point.switchId, (enforcementBySwitch.get(point.switchId) ?? 0) + 1);
}
const consequenceSwitchIds = new Set(KILL_SWITCH_CONSEQUENCE_MAP.map((c) => c.switchId));

// ── Required high-risk subsystems must have a switch ──────────
const REQUIRED_SUBSYSTEMS: readonly { id: string; reason: string }[] = [
  { id: "KS-PAYMENTS", reason: "Money mutations require a circuit breaker" },
  { id: "KS-MODEL-PROVIDERS", reason: "AI provider outage requires a kill switch" },
  { id: "KS-ADVISORS", reason: "Autonomous advisor actions require a kill switch" },
  { id: "KS-WORKFLOW", reason: "Workflow engine requires a kill switch" },
  { id: "KS-OUTBOUND", reason: "Outbound comms require a kill switch" },
  { id: "KS-RELEASE-ROLLOUT", reason: "Release pipeline requires a kill switch" },
  { id: "KS-APPLIANCE-UPDATE", reason: "Appliance OTA channel requires a kill switch" },
  { id: "KS-SELF-HEALING", reason: "Self-healing loop requires a kill switch" },
  { id: "KS-PROVIDER-INGESTION", reason: "Provider ingestion requires a kill switch" },
];

for (const req of REQUIRED_SUBSYSTEMS) {
  if (!validSwitchIds.has(req.id)) {
    vc.add(
      "kill-switch-registry.ts",
      "missing-required-switch",
      `Required kill switch ${req.id} missing — ${req.reason}`,
      "error",
    );
  }
}

// ── Per-switch validation ─────────────────────────────────────
for (const sw of KILL_SWITCH_REGISTRY) {
  if (!validContextIds.has(sw.boundedContextId)) {
    vc.add(
      "kill-switch-registry.ts",
      "invalid-bounded-context",
      `Switch ${sw.switchId} → unknown boundedContextId "${sw.boundedContextId}"`,
      "error",
    );
  }
  if ((enforcementBySwitch.get(sw.switchId) ?? 0) === 0) {
    vc.add(
      "kill-switch-enforcement-map.ts",
      "missing-enforcement-point",
      `Switch ${sw.switchId} has no enforcement point declared`,
      "error",
    );
  }
  if (!consequenceSwitchIds.has(sw.switchId)) {
    vc.add(
      "kill-switch-runtime-consequence.ts",
      "missing-consequence",
      `Switch ${sw.switchId} has no runtime consequence declared`,
      "error",
    );
  }
  if (sw.runbookRef && !validRunbookIds.has(sw.runbookRef)) {
    vc.add(
      "kill-switch-registry.ts",
      "dangling-runbook-ref",
      `Switch ${sw.switchId} → runbookRef "${sw.runbookRef}" not found in RUNBOOK_REGISTRY`,
      "warning",
    );
  }
  for (const dep of sw.dependsOn) {
    if (!validSwitchIds.has(dep)) {
      vc.add(
        "kill-switch-registry.ts",
        "dangling-dependency",
        `Switch ${sw.switchId} dependsOn unknown switch ${dep}`,
        "error",
      );
    }
  }
  for (const sup of sw.supersedes) {
    if (!validSwitchIds.has(sup)) {
      vc.add(
        "kill-switch-registry.ts",
        "dangling-supersedes",
        `Switch ${sw.switchId} supersedes unknown switch ${sup}`,
        "error",
      );
    }
  }
  if (sw.requiresDualApproval && sw.cooldownMs < 60_000) {
    vc.add(
      "kill-switch-registry.ts",
      "dual-approval-cooldown",
      `Switch ${sw.switchId} requires dual approval but cooldown <60s`,
      "warning",
    );
  }
}

// ── Dependency edges resolve ──────────────────────────────────
for (const edge of KILL_SWITCH_DEPENDENCY_MAP) {
  if (!validSwitchIds.has(edge.fromSwitchId)) {
    vc.add(
      "kill-switch-dependency-map.ts",
      "dangling-edge-from",
      `Dependency edge from unknown switch ${edge.fromSwitchId}`,
      "error",
    );
  }
  if (!validSwitchIds.has(edge.toSwitchId)) {
    vc.add(
      "kill-switch-dependency-map.ts",
      "dangling-edge-to",
      `Dependency edge to unknown switch ${edge.toSwitchId}`,
      "error",
    );
  }
}

// ── Enforcement points resolve ────────────────────────────────
for (const point of KILL_SWITCH_ENFORCEMENT_MAP) {
  if (!validSwitchIds.has(point.switchId)) {
    vc.add(
      "kill-switch-enforcement-map.ts",
      "dangling-enforcement",
      `Enforcement point references unknown switch ${point.switchId}`,
      "error",
    );
  }
}

console.log(
  `  📊 ${KILL_SWITCH_REGISTRY.length} switches, ${KILL_SWITCH_ENFORCEMENT_MAP.length} enforcement points, ${KILL_SWITCH_DEPENDENCY_MAP.length} dependency edges, ${KILL_SWITCH_CONSEQUENCE_MAP.length} consequences`,
);
vc.report("check-kill-switch-coverage");
vc.exitIfErrors();
