// ═══════════════════════════════════════════════════════════════
// SITA OS — Registry Integrity Validator (Phase 7)
// Validates that every cross-link between Phase 1, 4, 5, and 6
// registries resolves to a real entry. Returns a structured
// report consumable by both the CI gate and the admin surface.
// ═══════════════════════════════════════════════════════════════

import { BOUNDED_CONTEXT_REGISTRY } from "@/lib/architecture/bounded-context-registry";
import { KILL_SWITCH_REGISTRY } from "@/lib/control-plane/kill-switch-registry";
import { RUNBOOK_REGISTRY } from "@/lib/support/runbook-registry";
import { GOLDEN_PATH_REGISTRY } from "@/lib/operations/golden-path-registry";
import type {
  RegistryIntegrityIssue,
  RegistryIntegrityReport,
} from "./meta-arch-types";

export function validateRegistryIntegrity(): RegistryIntegrityReport {
  const issues: RegistryIntegrityIssue[] = [];

  const contextIds = new Set(BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId));
  const switchIds = new Set(KILL_SWITCH_REGISTRY.map((s) => s.switchId));
  const runbookIds = new Set(RUNBOOK_REGISTRY.map((r) => r.runbookId));
  const pathIds = new Set(GOLDEN_PATH_REGISTRY.map((p) => p.pathId));

  // ── Bounded contexts → kill switches / runbooks / journeys ───
  for (const ctx of BOUNDED_CONTEXT_REGISTRY) {
    for (const sw of ctx.killSwitches) {
      if (!switchIds.has(sw)) {
        issues.push({
          severity: "error",
          registry: "bounded-context",
          subject: ctx.contextId,
          message: `references unknown kill switch '${sw}'`,
        });
      }
    }
    for (const rb of ctx.supportRunbooks) {
      // Runbooks may reference legacy textual IDs; only error on RB-### shape that doesn't resolve.
      if (/^RB-\d+$/i.test(rb) && !runbookIds.has(rb)) {
        issues.push({
          severity: "error",
          registry: "bounded-context",
          subject: ctx.contextId,
          message: `references unknown runbook '${rb}'`,
        });
      }
    }
    for (const j of ctx.criticalJourneys) {
      if (!pathIds.has(j as any)) {
        issues.push({
          severity: "warning",
          registry: "bounded-context",
          subject: ctx.contextId,
          message: `criticalJourney '${j}' is not registered as a Golden Path`,
        });
      }
    }
  }

  // ── Kill switches → contexts / runbooks / dependencies ───────
  for (const sw of KILL_SWITCH_REGISTRY) {
    if (sw.boundedContextId && !contextIds.has(sw.boundedContextId as any)) {
      issues.push({
        severity: "error",
        registry: "kill-switch",
        subject: sw.switchId,
        message: `boundedContextId '${sw.boundedContextId}' is unknown`,
      });
    }
    if (sw.runbookRef && !runbookIds.has(sw.runbookRef)) {
      issues.push({
        severity: "error",
        registry: "kill-switch",
        subject: sw.switchId,
        message: `runbookRef '${sw.runbookRef}' does not resolve`,
      });
    }
    for (const dep of sw.dependsOn ?? []) {
      if (!switchIds.has(dep)) {
        issues.push({
          severity: "error",
          registry: "kill-switch",
          subject: sw.switchId,
          message: `dependsOn references unknown switch '${dep}'`,
        });
      }
    }
  }

  // ── Runbooks → contexts / kill switches ──────────────────────
  for (const rb of RUNBOOK_REGISTRY) {
    if (rb.boundedContextId && !contextIds.has(rb.boundedContextId as any)) {
      issues.push({
        severity: "error",
        registry: "runbook",
        subject: rb.runbookId,
        message: `boundedContextId '${rb.boundedContextId}' is unknown`,
      });
    }
    if (rb.killSwitchRef && !switchIds.has(rb.killSwitchRef)) {
      issues.push({
        severity: "error",
        registry: "runbook",
        subject: rb.runbookId,
        message: `killSwitchRef '${rb.killSwitchRef}' does not resolve`,
      });
    }
  }

  // ── Golden paths → contexts / kill switches / runbooks ───────
  for (const p of GOLDEN_PATH_REGISTRY) {
    for (const c of p.contextIds) {
      if (!contextIds.has(c as any)) {
        issues.push({
          severity: "error",
          registry: "golden-path",
          subject: p.pathId,
          message: `contextId '${c}' is unknown`,
        });
      }
    }
    for (const sw of p.blockingKillSwitches) {
      if (!switchIds.has(sw)) {
        issues.push({
          severity: "error",
          registry: "golden-path",
          subject: p.pathId,
          message: `blockingKillSwitch '${sw}' is unknown`,
        });
      }
    }
    for (const rb of p.recoveryRunbookRefs) {
      if (!runbookIds.has(rb)) {
        issues.push({
          severity: "warning",
          registry: "golden-path",
          subject: p.pathId,
          message: `recoveryRunbookRef '${rb}' is unknown`,
        });
      }
    }
    for (const step of p.steps) {
      for (const sw of step.blockingKillSwitches) {
        if (!switchIds.has(sw)) {
          issues.push({
            severity: "error",
            registry: "golden-path",
            subject: `${p.pathId}/${step.stepId}`,
            message: `step blockingKillSwitch '${sw}' is unknown`,
          });
        }
      }
      for (const rb of step.recoveryRunbookRefs) {
        if (!runbookIds.has(rb)) {
          issues.push({
            severity: "warning",
            registry: "golden-path",
            subject: `${p.pathId}/${step.stepId}`,
            message: `step recoveryRunbookRef '${rb}' is unknown`,
          });
        }
      }
    }
  }

  // ── Cross-link: every P0 context should have at least one runbook ──
  for (const ctx of BOUNDED_CONTEXT_REGISTRY) {
    if (ctx.supportRunbooks.length === 0) {
      issues.push({
        severity: "warning",
        registry: "cross-link",
        subject: ctx.contextId,
        message: "bounded context has no associated support runbooks",
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    checkedAt: new Date().toISOString(),
    contextCount: BOUNDED_CONTEXT_REGISTRY.length,
    killSwitchCount: KILL_SWITCH_REGISTRY.length,
    runbookCount: RUNBOOK_REGISTRY.length,
    goldenPathCount: GOLDEN_PATH_REGISTRY.length,
    issues,
    errorCount,
    warningCount,
    ok: errorCount === 0,
  };
}
