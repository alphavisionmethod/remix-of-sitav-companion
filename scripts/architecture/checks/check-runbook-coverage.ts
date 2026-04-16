#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Coverage Check
// Asserts:
//   • Every mandatory subsystem has at least one runbook
//   • Every runbook's `markdownRef` points to a real file
//   • Every runbook → bounded context resolves
//   • Every runbook → kill switch resolves
//   • Every kill switch with `runbookRef` resolves to a real runbook
//   • Every critical-incident-class subsystem has a critical/high
//     severity runbook
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../lib/utils";
import { RUNBOOK_REGISTRY } from "../../../src/lib/support/runbook-registry";
import {
  RUNBOOK_SUBSYSTEM_REQUIREMENTS,
  getMandatorySubsystems,
  getCriticalIncidentSubsystems,
} from "../../../src/lib/support/runbook-subsystem-map";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/lib/architecture/bounded-context-registry";
import { KILL_SWITCH_REGISTRY } from "../../../src/lib/control-plane/kill-switch-registry";

const vc = new ViolationCollector();
const repoRoot = process.cwd();

const validContextIds = new Set(BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId));
const validSwitchIds = new Set(KILL_SWITCH_REGISTRY.map((s) => s.switchId));
const runbookIds = new Set(RUNBOOK_REGISTRY.map((r) => r.runbookId));
const subsystemsCovered = new Set(RUNBOOK_REGISTRY.map((r) => r.subsystem));

// ── Per-runbook validation ─────────────────────────────────────
for (const rb of RUNBOOK_REGISTRY) {
  // markdown file exists
  const mdPath = path.join(repoRoot, rb.markdownRef);
  if (!fs.existsSync(mdPath)) {
    vc.add(
      "runbook-registry.ts",
      "missing-markdown",
      `Runbook ${rb.runbookId} markdownRef "${rb.markdownRef}" does not exist`,
      "error",
    );
  }
  if (!validContextIds.has(rb.boundedContextId)) {
    vc.add(
      "runbook-registry.ts",
      "invalid-bounded-context",
      `Runbook ${rb.runbookId} → unknown boundedContextId "${rb.boundedContextId}"`,
      "error",
    );
  }
  if (rb.killSwitchRef && !validSwitchIds.has(rb.killSwitchRef)) {
    vc.add(
      "runbook-registry.ts",
      "dangling-kill-switch",
      `Runbook ${rb.runbookId} → unknown killSwitchRef "${rb.killSwitchRef}"`,
      "error",
    );
  }
  if (rb.steps.length === 0) {
    vc.add(
      "runbook-registry.ts",
      "empty-steps",
      `Runbook ${rb.runbookId} has no steps`,
      "error",
    );
  }
}

// ── Mandatory subsystems must be covered ───────────────────────
for (const sub of getMandatorySubsystems()) {
  if (!subsystemsCovered.has(sub)) {
    vc.add(
      "runbook-subsystem-map.ts",
      "missing-subsystem-runbook",
      `Mandatory subsystem "${sub}" has no runbook`,
      "error",
    );
  }
}

// ── Critical incident class subsystems need critical/high runbook ─
for (const sub of getCriticalIncidentSubsystems()) {
  const rbs = RUNBOOK_REGISTRY.filter((r) => r.subsystem === sub);
  const hasSerious = rbs.some(
    (r) => r.severity === "critical" || r.severity === "high",
  );
  if (rbs.length > 0 && !hasSerious) {
    vc.add(
      "runbook-registry.ts",
      "weak-critical-coverage",
      `Critical-incident subsystem "${sub}" only has low/medium severity runbooks`,
      "warning",
    );
  }
}

// ── Kill switches must point to real runbooks ─────────────────
for (const sw of KILL_SWITCH_REGISTRY) {
  if (sw.runbookRef && !runbookIds.has(sw.runbookRef)) {
    vc.add(
      "kill-switch-registry.ts",
      "dangling-runbook-from-switch",
      `Kill switch ${sw.switchId} → unknown runbook ${sw.runbookRef}`,
      "error",
    );
  }
}

console.log(
  `  📊 ${RUNBOOK_REGISTRY.length} runbooks, ${subsystemsCovered.size}/${RUNBOOK_SUBSYSTEM_REQUIREMENTS.length} subsystems covered`,
);
vc.report("check-runbook-coverage");
vc.exitIfErrors();
