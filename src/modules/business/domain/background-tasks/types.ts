// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Background Tasks Domain
// Canonical view-model + mappers for the Background Task Center.
// Reads from existing job/run tables (no new schema). Pure functions
// only — no I/O, no React. RLS enforced at the service layer.
// ═══════════════════════════════════════════════════════════════

import type { Database } from "@/integrations/supabase/types";

// ── Source row aliases (typed from generated Database) ────────
type Tables = Database["public"]["Tables"];
export type CrmImportJobRow = Tables["crm_import_jobs"]["Row"];
export type ConnectorSyncRunRow = Tables["connector_sync_runs"]["Row"];
export type DataExportRequestRow = Tables["data_export_requests"]["Row"];
export type IngestionJobRow = Tables["ingestion_jobs"]["Row"];
export type CrmAutomationRow = Tables["crm_automations"]["Row"];
export type WorkflowRunRow = Tables["workflow_runs"]["Row"];
export type RecoveryJobRow = Tables["recovery_jobs"]["Row"];
export type AuditLogRow = Tables["audit_logs"]["Row"];
export type AiInvocationRow = Tables["ai_invocations"]["Row"];

// ── Canonical contracts ───────────────────────────────────────
export type BackgroundJobKind =
  | "import"
  | "sync"
  | "export"
  | "automation"
  | "ingestion"
  | "workflow"
  | "recovery"
  | "audit"
  | "ai-invocation";

export type BackgroundJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface BackgroundJobVM {
  id: string;
  kind: BackgroundJobKind;
  title: string;
  status: BackgroundJobStatus;
  /** 0–100 — derived from source progress columns or status. */
  progress: number;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  /** Short subtitle/details line (e.g., "1,340 of 2,000 rows"). */
  details?: string;
  /** Failure reason for failed jobs. */
  error?: string;
  /** Source table name — used for retry/cancel routing. */
  sourceTable:
    | "crm_import_jobs"
    | "connector_sync_runs"
    | "data_export_requests"
    | "ingestion_jobs"
    | "crm_automations"
    | "workflow_runs"
    | "recovery_jobs"
    | "audit_logs"
    | "ai_invocations";
  sourceId: string;
  canRetry: boolean;
  canCancel: boolean;
  /** Honest reason shown when canRetry is false (e.g., "Read-only audit entry"). */
  retryUnavailableReason?: string;
  /** Optional structured target for in-app navigation (resolved by task-target-resolver). */
  navigationTarget?: BackgroundJobNavigationTarget;
  /** Optional deep-link to recovery surface for failed jobs. */
  recoveryHref?: string;
}

/** Where clicking a job row should send the operator inside Business OS. */
export interface BackgroundJobNavigationTarget {
  /** Business app sub-page key consumed by `subpageFromPath` / `navigateTo`. */
  module: string;
  /** Optional entity id to preselect at the destination. */
  entityId?: string;
  /** Human-readable label for the link (used as tooltip / aria-label). */
  label: string;
}

// ── Helpers ───────────────────────────────────────────────────

function durationMs(start?: string | null, end?: string | null): number | undefined {
  if (!start) return undefined;
  const s = Date.parse(start);
  const e = end ? Date.parse(end) : Date.now();
  if (Number.isNaN(s) || Number.isNaN(e)) return undefined;
  return Math.max(0, e - s);
}

function normalizeStatus(raw: string | null | undefined): BackgroundJobStatus {
  const v = (raw ?? "").toLowerCase();
  if (v === "running" || v === "in_progress" || v === "active" || v === "processing") return "running";
  if (v === "queued" || v === "pending" || v === "scheduled" || v === "awaiting-approval") return "queued";
  if (v === "completed" || v === "complete" || v === "success" || v === "succeeded" || v === "indexed" || v === "pass") return "completed";
  if (v === "failed" || v === "error" || v === "errored" || v === "fail" || v === "stuck") return "failed";
  if (v === "cancelled" || v === "canceled") return "cancelled";
  return "queued";
}

function progressFromCounts(processed: number, total: number, status: BackgroundJobStatus): number {
  if (status === "completed") return 100;
  if (status === "cancelled" || status === "failed") {
    if (total > 0) return Math.min(100, Math.round((processed / total) * 100));
    return 0;
  }
  if (total > 0) return Math.min(99, Math.round((processed / total) * 100));
  return status === "running" ? 25 : 0;
}

function progressFromStatus(status: BackgroundJobStatus): number {
  if (status === "completed") return 100;
  if (status === "running") return 50;
  if (status === "failed" || status === "cancelled") return 100;
  return 0;
}

// ── Mappers ───────────────────────────────────────────────────

export function crmImportJobToVM(row: CrmImportJobRow): BackgroundJobVM {
  const status = normalizeStatus(row.status);
  const total = row.total_rows ?? 0;
  const processed =
    (row.created_count ?? 0) + (row.updated_count ?? 0) + (row.skipped_count ?? 0) + (row.error_count ?? 0);
  const errorCount = row.error_count ?? 0;
  const errorsArr = Array.isArray(row.errors) ? row.errors : [];
  const firstErr = errorsArr[0] && typeof errorsArr[0] === "object"
    ? (errorsArr[0] as { message?: string }).message
    : undefined;

  return {
    id: `import:${row.id}`,
    kind: "import",
    title: `CSV Import — ${row.file_name ?? row.source ?? "Untitled"}`,
    status,
    progress: progressFromCounts(processed, total, status),
    startedAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    durationMs: durationMs(row.created_at, row.completed_at),
    details: total > 0
      ? `${processed.toLocaleString()} of ${total.toLocaleString()} rows · ${errorCount} errors`
      : `${row.source ?? "csv"} import`,
    error: status === "failed" ? (firstErr ?? "Import failed") : undefined,
    sourceTable: "crm_import_jobs",
    sourceId: row.id,
    canRetry: status === "failed",
    canCancel: status === "queued" || status === "running",
    recoveryHref: status === "failed" ? `/admin/ar07-retry-failure-center?source=crm_import_jobs&id=${row.id}` : undefined,
  };
}

export function connectorSyncRunToVM(row: ConnectorSyncRunRow): BackgroundJobVM {
  const status = normalizeStatus(row.status);
  const records = row.records_synced ?? 0;
  return {
    id: `sync:${row.id}`,
    kind: "sync",
    title: `Sync — ${row.connector}${row.resource_type ? ` (${row.resource_type})` : ""}`,
    status,
    progress: progressFromStatus(status),
    startedAt: row.started_at ?? row.created_at ?? new Date().toISOString(),
    completedAt: row.completed_at ?? undefined,
    durationMs: durationMs(row.started_at ?? row.created_at, row.completed_at),
    details: records > 0 ? `${records.toLocaleString()} records · ${row.direction ?? "pull"}` : (row.direction ?? "pull"),
    error: status === "failed" ? (row.error ?? (row.dead_letter ? "Dead-lettered" : "Sync failed")) : undefined,
    sourceTable: "connector_sync_runs",
    sourceId: row.id,
    canRetry: status === "failed",
    canCancel: false, // connector sync workers are short-lived, no cancel API
    recoveryHref: status === "failed" ? `/admin/ar07-retry-failure-center?source=connector_sync_runs&id=${row.id}` : undefined,
  };
}

export function dataExportRequestToVM(row: DataExportRequestRow): BackgroundJobVM {
  const status = normalizeStatus(row.status);
  const rows = row.row_count ?? 0;
  const tables = row.table_count ?? 0;
  return {
    id: `export:${row.id}`,
    kind: "export",
    title: `Data export — ${row.export_format.toUpperCase()}`,
    status,
    progress: progressFromStatus(status),
    startedAt: row.requested_at,
    completedAt: row.completed_at ?? undefined,
    durationMs: durationMs(row.requested_at, row.completed_at),
    details: rows > 0 || tables > 0 ? `${rows.toLocaleString()} rows across ${tables} tables` : row.export_format,
    error: status === "failed" ? (row.error_message ?? "Export failed") : undefined,
    sourceTable: "data_export_requests",
    sourceId: row.id,
    canRetry: status === "failed",
    canCancel: false,
    recoveryHref: status === "failed" ? `/admin/ar07-retry-failure-center?source=data_export_requests&id=${row.id}` : undefined,
  };
}

export function ingestionJobToVM(row: IngestionJobRow): BackgroundJobVM {
  const status = normalizeStatus(row.stage);
  const pct = Math.round(Number(row.progress ?? 0) * 100);
  return {
    id: `ingestion:${row.id}`,
    kind: "ingestion",
    title: `Ingestion — ${row.source_kind}`,
    status,
    progress: status === "completed" ? 100 : Math.max(pct, status === "running" ? 5 : 0),
    startedAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    durationMs: durationMs(row.created_at, row.completed_at),
    details: row.source_table ? `Stage: ${row.stage} · ${row.source_table}` : `Stage: ${row.stage}`,
    error: status === "failed" ? (row.error ?? "Ingestion failed") : undefined,
    sourceTable: "ingestion_jobs",
    sourceId: row.id,
    canRetry: status === "failed",
    canCancel: status === "queued",
    recoveryHref: status === "failed" ? `/admin/ar07-retry-failure-center?source=ingestion_jobs&id=${row.id}` : undefined,
  };
}

export function crmAutomationToVM(row: CrmAutomationRow): BackgroundJobVM | null {
  // Only surface automations that have actually executed at least once.
  if (!row.last_run_at) return null;
  // crm_automations is a definition table — we represent its most recent run as a "completed" row.
  // Failure surfacing requires the dedicated automation_fatigue_alerts table (linked via recovery).
  return {
    id: `automation:${row.id}`,
    kind: "automation",
    title: `Automation — ${row.title}`,
    status: "completed",
    progress: 100,
    startedAt: row.last_run_at,
    completedAt: row.last_run_at,
    durationMs: 0,
    details: `${row.runs.toLocaleString()} total runs · ${row.target_entity}`,
    sourceTable: "crm_automations",
    sourceId: row.id,
    canRetry: false,
    canCancel: false,
  };
}

export function workflowRunToVM(row: WorkflowRunRow): BackgroundJobVM {
  const status = normalizeStatus(row.status);
  const errMsg = row.error ?? undefined;
  return {
    id: `workflow:${row.id}`,
    kind: "workflow",
    title: `Workflow run — step ${row.current_step}`,
    status,
    progress: progressFromStatus(status),
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    durationMs: durationMs(row.started_at, row.completed_at),
    details: row.next_retry_at ? `Next retry: ${new Date(row.next_retry_at).toLocaleTimeString()}` : undefined,
    error: status === "failed" ? (errMsg ?? "Workflow failed") : undefined,
    sourceTable: "workflow_runs",
    sourceId: row.id,
    canRetry: status === "failed",
    canCancel: status === "queued" || status === "running",
    recoveryHref: status === "failed" ? `/admin/workflow-replay-audit?run=${row.id}` : undefined,
  };
}

// ── Phase 7: Recovery / Audit / AI invocation mappers ────────

export function recoveryJobToVM(row: RecoveryJobRow): BackgroundJobVM {
  const status = normalizeStatus(row.status);
  const pct = Math.max(0, Math.min(100, Number(row.progress ?? 0)));
  return {
    id: `recovery:${row.id}`,
    kind: "recovery",
    title: `Recovery — ${row.label ?? "job"}`,
    status,
    progress: status === "completed" ? 100 : status === "running" ? Math.max(pct, 5) : pct,
    startedAt: row.started_at ?? row.created_at,
    completedAt: row.completed_at ?? undefined,
    durationMs: durationMs(row.started_at ?? row.created_at, row.completed_at),
    details: row.is_dry_run ? "Dry-run" : (row.appointment_id ? "Appointment recovery" : undefined),
    error: status === "failed" ? (row.error ?? "Recovery failed") : undefined,
    sourceTable: "recovery_jobs",
    sourceId: row.id,
    canRetry: status === "failed",
    canCancel: status === "queued" || status === "running",
    retryUnavailableReason: status === "failed" ? undefined : "Only failed recovery jobs can be re-run.",
    recoveryHref: status === "failed" ? `/admin/ar07-retry-failure-center?source=recovery_jobs&id=${row.id}` : undefined,
  };
}

/**
 * Audit log entries are read-only proof — surfaced here so operators
 * see the most recent meaningful events alongside live jobs.
 */
export function auditLogToVM(row: AuditLogRow): BackgroundJobVM {
  return {
    id: `audit:${row.id}`,
    kind: "audit",
    title: `Event — ${row.action}${row.subject_type ? ` · ${row.subject_type}` : ""}`,
    status: row.severity === "error" || row.severity === "critical" ? "failed" : "completed",
    progress: 100,
    startedAt: row.created_at,
    completedAt: row.created_at,
    durationMs: 0,
    details: row.domain ? `${row.domain} · ${row.severity}` : row.severity,
    error: (row.severity === "error" || row.severity === "critical") ? (row.reason ?? row.action) : undefined,
    sourceTable: "audit_logs",
    sourceId: row.id,
    canRetry: false,
    canCancel: false,
    retryUnavailableReason: "Read-only audit entry · no retry path.",
  };
}

export function aiInvocationToVM(row: AiInvocationRow): BackgroundJobVM {
  const status = normalizeStatus(row.status);
  const tokens = row.total_tokens ?? 0;
  return {
    id: `ai:${row.id}`,
    kind: "ai-invocation",
    title: `AI · ${row.capability_key}`,
    status,
    progress: progressFromStatus(status),
    startedAt: row.created_at,
    completedAt: undefined,
    durationMs: typeof row.latency_ms === "number" ? row.latency_ms : undefined,
    details: tokens > 0
      ? `${row.model} · ${tokens.toLocaleString()} tok${row.estimated_cost_usd ? ` · $${Number(row.estimated_cost_usd).toFixed(4)}` : ""}`
      : row.model,
    error: status === "failed" ? (row.error_message ?? row.error_code ?? "Inference failed") : undefined,
    sourceTable: "ai_invocations",
    sourceId: row.id,
    canRetry: false,
    canCancel: false,
    retryUnavailableReason: "AI invocations are emitted by capabilities · re-trigger from the source surface.",
  };
}

// ── Aggregations ──────────────────────────────────────────────

export interface BackgroundJobsSummary {
  total: number;
  running: number;
  queued: number;
  completed24h: number;
  failed24h: number;
}

export function summarizeJobs(jobs: BackgroundJobVM[]): BackgroundJobsSummary {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const summary: BackgroundJobsSummary = {
    total: jobs.length,
    running: 0,
    queued: 0,
    completed24h: 0,
    failed24h: 0,
  };
  for (const j of jobs) {
    if (j.status === "running") summary.running++;
    else if (j.status === "queued") summary.queued++;
    const ts = Date.parse(j.completedAt ?? j.startedAt);
    if (!Number.isNaN(ts) && ts >= cutoff) {
      if (j.status === "completed") summary.completed24h++;
      else if (j.status === "failed") summary.failed24h++;
    }
  }
  return summary;
}

export interface BackgroundJobSections {
  attention: BackgroundJobVM[]; // failed + retryable
  running: BackgroundJobVM[];
  queued: BackgroundJobVM[];
  recent: BackgroundJobVM[]; // completed in last 24h
  history: BackgroundJobVM[]; // everything older
}

export function groupJobsBySection(jobs: BackgroundJobVM[]): BackgroundJobSections {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const out: BackgroundJobSections = { attention: [], running: [], queued: [], recent: [], history: [] };
  for (const j of jobs) {
    if (j.status === "failed") { out.attention.push(j); continue; }
    if (j.status === "running") { out.running.push(j); continue; }
    if (j.status === "queued") { out.queued.push(j); continue; }
    const ts = Date.parse(j.completedAt ?? j.startedAt);
    if (!Number.isNaN(ts) && ts >= cutoff) out.recent.push(j);
    else out.history.push(j);
  }
  return out;
}

/** Filter by user-selected status tab. */
export function filterJobsByStatus(
  jobs: BackgroundJobVM[],
  filter: "all" | BackgroundJobStatus
): BackgroundJobVM[] {
  if (filter === "all") return jobs;
  return jobs.filter((j) => j.status === filter);
}

/** Format a duration in ms as a short label (e.g., "3m 42s", "28s"). */
export function formatDuration(ms?: number): string | undefined {
  if (ms === undefined || ms < 0) return undefined;
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
}

/** Relative time short label (e.g., "2 min ago", "1 hour ago"). */
export function formatRelativeShort(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diff = Math.max(0, now - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}