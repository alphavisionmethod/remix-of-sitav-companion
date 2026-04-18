// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Replay Map (Phase 17.1)
//
// Declares the failure / replay path for every edge function.
//
// MANDATORY for ORCHESTRATION_FUNCTION + CONNECTOR_WEBHOOK_FUNCTION.
// Optional (informational) for other categories.
//
// Each entry references a real on-disk mechanism:
//   • job-dead-letter   → cloud_worker_jobs table dead-letter loop
//   • command-replay    → api-gateway command-bus replay route
//   • workflow-replay   → WorkflowReplayEngine (lib/workflow/replay)
//   • webhook-redelivery → provider redelivery + idempotency-key dedupe
//   • idempotent-retry  → at-least-once semantics with Idempotency-Key
//   • not-applicable    → pure-read / fire-and-forget; rationale required
// ═══════════════════════════════════════════════════════════════

import { EDGE_FUNCTION_BACKEND_CATEGORY } from "./edge-function-categories";

export type ReplayPathKind =
  | "job-dead-letter"
  | "command-replay"
  | "workflow-replay"
  | "webhook-redelivery"
  | "idempotent-retry"
  | "not-applicable";

export interface EdgeFunctionReplayEntry {
  readonly kind: ReplayPathKind;
  readonly mechanism: string;   // human-readable mechanism name
  readonly evidence: string;    // on-disk reference (file or table)
  readonly rationale?: string;  // required for "not-applicable"
}

export const EDGE_FUNCTION_REPLAY_MAP: Record<string, EdgeFunctionReplayEntry> = {
  // ── ORCHESTRATION_FUNCTION (mandatory) ──────────────────────
  "agent-executor": {
    kind: "command-replay",
    mechanism: "command-bus replay via api-gateway",
    evidence: "supabase/functions/api-gateway/index.ts (command-replay route) + agent_executions table",
  },
  "brain-core": {
    kind: "workflow-replay",
    mechanism: "WorkflowReplayEngine snapshot resume",
    evidence: "src/lib/workflow/WorkflowReplayEngine.ts + brain_workflow_runs table",
  },
  "scheduler-dispatch": {
    kind: "job-dead-letter",
    mechanism: "cloud_worker_jobs dead-letter requeue",
    evidence: "cloud_worker_jobs table + cloud-worker-api dead-letter route",
  },
  "advisor-agent-loop": {
    kind: "workflow-replay",
    mechanism: "advisor loop checkpoint resume",
    evidence: "advisor_board_actions table + WorkflowReplayEngine",
  },
  "advisor-deep-intelligence": {
    kind: "command-replay",
    mechanism: "deep-reasoning command bus replay",
    evidence: "advisor_board_recommendations table + api-gateway command-replay",
  },
  "event-processor": {
    kind: "job-dead-letter",
    mechanism: "event-bus dead-letter retry with backoff",
    evidence: "cloud_worker_jobs (kind=event) + cloud-worker-api dead-letter handler",
  },
  "digital-twin-engine": {
    kind: "workflow-replay",
    mechanism: "twin simulation snapshot resume",
    evidence: "src/lib/workflow/WorkflowReplayEngine.ts + simulation snapshots table",
  },
  "simulation-engine-api": {
    kind: "idempotent-retry",
    mechanism: "Idempotency-Key dedupe + deterministic seed replay",
    evidence: "Idempotency-Key header in supabase/functions/_shared (idempotency helper)",
  },
  "admin-ai-workforce-run": {
    kind: "job-dead-letter",
    mechanism: "AI workforce job dead-letter requeue",
    evidence: "ai_workforce_invocations table + cloud_worker_jobs dead-letter loop",
  },
  "agent-scheduler": {
    kind: "job-dead-letter",
    mechanism: "scheduler tick replay via cloud_worker_jobs",
    evidence: "cloud_worker_jobs table + scheduler-dispatch backstop",
  },
  "agent-signal": {
    kind: "command-replay",
    mechanism: "signal-bus command-replay route",
    evidence: "supabase/functions/api-gateway/index.ts command-replay route",
  },
  "ecosystem-operations": {
    kind: "workflow-replay",
    mechanism: "ecosystem orchestration snapshot resume",
    evidence: "src/lib/workflow/WorkflowReplayEngine.ts",
  },

  // ── CONNECTOR_WEBHOOK_FUNCTION (mandatory) ──────────────────
  "connector-batch": {
    kind: "idempotent-retry",
    mechanism: "batch Idempotency-Key + connector_sync_runs dedupe",
    evidence: "Idempotency-Key header + connector_sync_runs table",
  },
  "connector-discover": {
    kind: "idempotent-retry",
    mechanism: "discover Idempotency-Key dedupe",
    evidence: "Idempotency-Key header in supabase/functions/_shared",
  },
  "connector-health": {
    kind: "idempotent-retry",
    mechanism: "health probe Idempotency-Key + last-result cache",
    evidence: "Idempotency-Key header + connector_health_snapshots table",
  },
  "connector-oauth": {
    kind: "webhook-redelivery",
    mechanism: "OAuth callback redelivery + state-token dedupe",
    evidence: "connector_oauth_states table + state nonce dedupe",
  },
  "connector-operations": {
    kind: "idempotent-retry",
    mechanism: "operation Idempotency-Key + connector_operations_log",
    evidence: "Idempotency-Key header + connector_operations_log table",
  },
  "connector-proxy": {
    kind: "idempotent-retry",
    mechanism: "proxy Idempotency-Key passthrough + dedupe ring",
    evidence: "Idempotency-Key header in supabase/functions/_shared",
  },
  "connector-sync": {
    kind: "idempotent-retry",
    mechanism: "sync run Idempotency-Key + connector_sync_runs dedupe",
    evidence: "Idempotency-Key header + connector_sync_runs table",
  },
  "connector-transform": {
    kind: "idempotent-retry",
    mechanism: "transform Idempotency-Key + content-hash dedupe",
    evidence: "Idempotency-Key header + content hash dedupe ring",
  },
  "crm-sync": {
    kind: "webhook-redelivery",
    mechanism: "CRM provider redelivery + record-id dedupe",
    evidence: "Idempotency-Key header + crm_sync_runs table",
  },
  "provider-family-operations": {
    kind: "idempotent-retry",
    mechanism: "family-op Idempotency-Key + provider_family_ops_log dedupe",
    evidence: "Idempotency-Key header + provider_family_ops_log table",
  },
  "agent-heartbeat": {
    kind: "idempotent-retry",
    mechanism: "heartbeat Idempotency-Key + last-seen upsert",
    evidence: "Idempotency-Key header + agent_heartbeats table",
  },

  // ── OPTIONAL: notable RUNTIME_SYSTEM + DOMAIN replay paths ──
  "os-command": {
    kind: "command-replay",
    mechanism: "kernel command-bus replay via api-gateway",
    evidence: "supabase/functions/api-gateway/index.ts command-replay route",
  },
  "self-healing": {
    kind: "job-dead-letter",
    mechanism: "self-heal job dead-letter requeue",
    evidence: "cloud_worker_jobs table",
  },
  "system-updates": {
    kind: "job-dead-letter",
    mechanism: "update job dead-letter requeue",
    evidence: "cloud_worker_jobs table",
  },
  "push-dispatch": {
    kind: "idempotent-retry",
    mechanism: "push Idempotency-Key + push_deliveries dedupe",
    evidence: "Idempotency-Key header + push_deliveries table",
  },
  "payment-process": {
    kind: "idempotent-retry",
    mechanism: "Stripe Idempotency-Key + payment_intents dedupe",
    evidence: "Idempotency-Key header + payments_log table",
  },
  "gdpr-delete": {
    kind: "job-dead-letter",
    mechanism: "GDPR delete job dead-letter requeue",
    evidence: "cloud_worker_jobs table + gdpr_jobs table",
  },
  "gdpr-export": {
    kind: "job-dead-letter",
    mechanism: "GDPR export job dead-letter requeue",
    evidence: "cloud_worker_jobs table + gdpr_jobs table",
  },
  "file-ingestion": {
    kind: "idempotent-retry",
    mechanism: "ingestion Idempotency-Key + file content-hash dedupe",
    evidence: "Idempotency-Key header + file_ingestion_runs table",
  },
};

/** Categories that MUST have a replay-map entry. */
const REQUIRED_CATEGORIES = new Set([
  "ORCHESTRATION_FUNCTION",
  "CONNECTOR_WEBHOOK_FUNCTION",
]);

export function getReplayEntry(name: string): EdgeFunctionReplayEntry | undefined {
  return EDGE_FUNCTION_REPLAY_MAP[name];
}

export function isReplayRequired(name: string): boolean {
  const cat = EDGE_FUNCTION_BACKEND_CATEGORY[name];
  return cat ? REQUIRED_CATEGORIES.has(cat) : false;
}

export interface ReplayCoverageSummary {
  readonly requiredCount: number;
  readonly coveredCount: number;
  readonly missing: readonly string[];
  readonly invalidNotApplicable: readonly string[];
  readonly byKind: Record<ReplayPathKind, number>;
  readonly ok: boolean;
}

export function replayCoverageSummary(): ReplayCoverageSummary {
  const missing: string[] = [];
  const invalidNotApplicable: string[] = [];
  const byKind = {
    "job-dead-letter": 0,
    "command-replay": 0,
    "workflow-replay": 0,
    "webhook-redelivery": 0,
    "idempotent-retry": 0,
    "not-applicable": 0,
  } as Record<ReplayPathKind, number>;

  for (const [name, cat] of Object.entries(EDGE_FUNCTION_BACKEND_CATEGORY)) {
    if (!REQUIRED_CATEGORIES.has(cat)) continue;
    const entry = EDGE_FUNCTION_REPLAY_MAP[name];
    if (!entry) {
      missing.push(name);
      continue;
    }
    if (entry.kind === "not-applicable" && !entry.rationale) {
      invalidNotApplicable.push(name);
    }
  }

  for (const entry of Object.values(EDGE_FUNCTION_REPLAY_MAP)) {
    byKind[entry.kind]++;
  }

  let requiredCount = 0;
  for (const cat of Object.values(EDGE_FUNCTION_BACKEND_CATEGORY)) {
    if (REQUIRED_CATEGORIES.has(cat)) requiredCount++;
  }

  return {
    requiredCount,
    coveredCount: requiredCount - missing.length,
    missing,
    invalidNotApplicable,
    byKind,
    ok: missing.length === 0 && invalidNotApplicable.length === 0,
  };
}
