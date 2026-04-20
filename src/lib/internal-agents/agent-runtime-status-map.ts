// SITA OS — Internal Agent Runtime Status Map (canonical overlay)
//
// EVERY agent in ALL_DETAILED_AGENTS (registry of 40) MUST appear here.
// Enforced by BLOCK gate #22:
//   scripts/architecture/checks/check-internal-agent-deferred-set-explicitness.ts
//
// This overlay declares — explicitly and per agent — whether the agent is:
//   - "wired"            : real edge-function invocation path on disk that
//                          references the agent ID (or a registered alias).
//   - "scheduled-only"   : has a pg_cron row but no executor body yet.
//   - "ui-surface-only"  : surfaced in admin UI but not on a scheduler.
//   - "deferred"         : intentionally postponed; reason + ETA required.
//
// The literal user requirement "Mark deferred set explicitly" is satisfied by:
//   (a) status field is non-optional in this map
//   (b) deferred entries MUST carry deferredReason + deferredEta
//   (c) the gate fails build if any registry agent is missing from this map
//   (d) the gate fails build if a "wired" entry's invocation path does not
//       reference the agent ID or one of its aliases.

import type { AgentRuntimeStatusEntry } from "@/packages/internal-agent-config/types";

export const AGENT_RUNTIME_STATUS_MAP: Record<string, AgentRuntimeStatusEntry> = {
  // ───────────────────────── security-trust (7) — all wired via security-council-tick
  "aw-security-monitor": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/security-council-tick",
    runtimeAliasId: "st-security-monitor",
  },
  "aw-permission-drift": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/security-council-tick",
    runtimeAliasId: "st-permission-drift",
  },
  "aw-policy-review": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/security-council-tick",
    runtimeAliasId: "st-policy-review",
  },
  "aw-trust-threshold": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/security-council-tick",
    runtimeAliasId: "st-trust-threshold",
  },
  "aw-fraud-abuse": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/security-council-tick",
    runtimeAliasId: "st-fraud-abuse",
  },
  "aw-privacy-boundary": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/security-council-tick",
    runtimeAliasId: "st-privacy-boundary",
  },
  "aw-audit-trail": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/security-council-tick",
    runtimeAliasId: "st-audit-completeness",
  },

  // ───────────────────────── reliability-ops (8)
  // The self-healer, slo-evaluator, and execute-action edge functions exist
  // and run on schedule, but they operate at the council/event level rather
  // than dispatching by per-agent ID — so honest classification is
  // "scheduled-only" until per-agent dispatch is added.
  "aw-incident-response": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-self-healer but does not dispatch by per-agent ID yet.",
    deferredEta: "post-launch",
  },
  "aw-workflow-recovery": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-self-healer; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-sre": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-slo-evaluator; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-fleet-health": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/health-cron; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-connector-health": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Per-provider OAuth refresh observers are wired; council-level aggregator executor pending.",
    deferredEta: "post-launch",
  },
  "aw-release-safety": {
    runtimeStatus: "ui-surface-only",
    deferredReason:
      "Surfaces in admin Release board; runtime trigger lives in CI, not in an edge function.",
    deferredEta: "post-launch",
  },
  "aw-rollback": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-execute-action; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-support-diagnostics": {
    runtimeStatus: "deferred",
    deferredReason: "Phase 10 — pending support-bundle ingestion pipeline.",
    deferredEta: "post-launch",
  },

  // ───────────────────────── runtime-cost (6)
  "aw-ai-spend-control": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-cost-optimizer; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-token-budget": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-cost-optimizer; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-model-routing": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/routing-policy-update; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-latency-optimizer": {
    runtimeStatus: "deferred",
    deferredReason: "Latency telemetry roll-up pending; needs p95/p99 windowed source.",
    deferredEta: "post-launch",
  },
  "aw-capacity-planning": {
    runtimeStatus: "deferred",
    deferredReason: "Forecast model not yet trained; awaits 90 days of usage data.",
    deferredEta: "post-launch",
  },
  "aw-cache-compression": {
    runtimeStatus: "deferred",
    deferredReason: "No prompt-cache layer in production yet.",
    deferredEta: "post-launch",
  },

  // ───────────────────────── architecture-governance (6)
  "aw-arch-consistency": {
    runtimeStatus: "wired",
    runtimeInvocationPath: "supabase/functions/internal-agent-policy-architect",
    runtimeAliasId: "ar-architecture-truth",
  },
  "aw-registry-truth": {
    runtimeStatus: "scheduled-only",
    deferredReason: "Registry diff job runs in CI; no edge-function executor yet.",
    deferredEta: "post-launch",
  },
  "aw-generated-manifest": {
    runtimeStatus: "scheduled-only",
    deferredReason: "Manifest freshness checked by CI; runtime executor not required.",
    deferredEta: "post-launch",
  },
  "aw-contract-integrity": {
    runtimeStatus: "scheduled-only",
    deferredReason: "Contract validators run in CI; runtime executor pending.",
    deferredEta: "post-launch",
  },
  "aw-boundary-enforcement": {
    runtimeStatus: "scheduled-only",
    deferredReason: "5-plane boundary enforcement runs in CI; runtime executor pending.",
    deferredEta: "post-launch",
  },
  "aw-change-control": {
    runtimeStatus: "ui-surface-only",
    deferredReason: "Change-control board surfaces in admin; no scheduler yet.",
    deferredEta: "post-launch",
  },

  // ───────────────────────── knowledge-coordination (5)
  "aw-knowledge-curator": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/advisor-knowledge-manage; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-release-notes": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-weekly-digest; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-sprint-planning": {
    runtimeStatus: "deferred",
    deferredReason: "Sprint planner depends on roadmap signal source not yet wired.",
    deferredEta: "post-launch",
  },
  "aw-tpm": {
    runtimeStatus: "deferred",
    deferredReason: "TPM agent depends on multi-team coordination signals not yet modelled.",
    deferredEta: "post-launch",
  },
  "aw-repo-drift": {
    runtimeStatus: "scheduled-only",
    deferredReason: "Repo drift detection runs in CI; runtime executor pending.",
    deferredEta: "post-launch",
  },

  // ───────────────────────── product-build (8)
  "aw-product-manager": {
    runtimeStatus: "ui-surface-only",
    deferredReason: "Product-Manager agent surfaces in admin Boardroom; no scheduler.",
    deferredEta: "post-launch",
  },
  "aw-ux-research": {
    runtimeStatus: "deferred",
    deferredReason: "UX-research signal source (session replay aggregation) not yet ingested.",
    deferredEta: "post-launch",
  },
  "aw-design-system": {
    runtimeStatus: "scheduled-only",
    deferredReason: "Design-system drift checks run in CI; runtime executor pending.",
    deferredEta: "post-launch",
  },
  "aw-frontend-engineer": {
    runtimeStatus: "ui-surface-only",
    deferredReason: "Surfaces as advisor card in AI Engineering hub; no scheduler.",
    deferredEta: "post-launch",
  },
  "aw-backend-engineer": {
    runtimeStatus: "ui-surface-only",
    deferredReason: "Surfaces as advisor card in AI Engineering hub; no scheduler.",
    deferredEta: "post-launch",
  },
  "aw-mobile-engineer": {
    runtimeStatus: "deferred",
    deferredReason: "Native mobile is ARCHIVED scope; agent kept as registry-only placeholder.",
    deferredEta: "indefinite (mobile scope archived)",
  },
  "aw-documentation": {
    runtimeStatus: "scheduled-only",
    deferredReason:
      "Executor lives in supabase/functions/internal-agent-suggestion-generator; per-agent dispatch pending.",
    deferredEta: "post-launch",
  },
  "aw-qa-architect": {
    runtimeStatus: "scheduled-only",
    deferredReason: "QA architect depends on test-coverage signal stream not yet wired.",
    deferredEta: "post-launch",
  },
};
