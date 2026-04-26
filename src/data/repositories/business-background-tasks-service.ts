// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Background Tasks Service
// Aggregates the canonical job/run tables (no new schema) into a
// single typed BackgroundJobVM[] for the operator surface.
// Demo mode → fixture. Live mode → 6 parallel RLS-scoped queries.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import {
  crmAutomationToVM,
  crmImportJobToVM,
  connectorSyncRunToVM,
  dataExportRequestToVM,
  ingestionJobToVM,
  workflowRunToVM,
  type BackgroundJobVM,
  type CrmAutomationRow,
  type CrmImportJobRow,
  type ConnectorSyncRunRow,
  type DataExportRequestRow,
  type IngestionJobRow,
  type WorkflowRunRow,
} from "@/modules/business/domain/background-tasks/types";
import { buildDemoBackgroundJobs } from "@/data/fixtures/mock-data/business-background-tasks";

export type BackgroundTasksMode = "demo" | "live";

export interface FetchBackgroundJobsOptions {
  mode: BackgroundTasksMode;
  /** How many hours of history to include (default 72). */
  sinceHours?: number;
}

export interface BackgroundJobsResult {
  jobs: BackgroundJobVM[];
  /** True when one or more source queries failed; the rest still returned. */
  partial: boolean;
  /** Names of source tables that errored, for honest UI surfacing. */
  failedSources: string[];
}

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function safeQuery<T>(label: string, fn: () => Promise<T[]>): Promise<{ rows: T[]; ok: boolean }> {
  try {
    const rows = await fn();
    return { rows, ok: true };
  } catch (err) {
    console.warn(`[bg-tasks] ${label} query failed:`, err);
    return { rows: [], ok: false };
  }
}

/**
 * Fetch the unified background-job list for the active operator.
 * Each source is queried independently; failures degrade gracefully
 * (partial=true) rather than breaking the whole page.
 */
export async function fetchBackgroundJobs(
  opts: FetchBackgroundJobsOptions
): Promise<BackgroundJobsResult> {
  if (opts.mode === "demo") {
    return { jobs: buildDemoBackgroundJobs(), partial: false, failedSources: [] };
  }

  const userId = await uid();
  if (!userId) {
    return { jobs: [], partial: false, failedSources: [] };
  }

  const sinceHours = opts.sinceHours ?? 72;
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();

  const [imports, syncs, exports_, ingestions, automations, workflows] = await Promise.all([
    safeQuery<CrmImportJobRow>("crm_import_jobs", async () => {
      const { data, error } = await fromTable("crm_import_jobs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as CrmImportJobRow[];
    }),
    safeQuery<ConnectorSyncRunRow>("connector_sync_runs", async () => {
      const { data, error } = await fromTable("connector_sync_runs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as ConnectorSyncRunRow[];
    }),
    safeQuery<DataExportRequestRow>("data_export_requests", async () => {
      const { data, error } = await fromTable("data_export_requests")
        .select("*")
        .eq("user_id", userId)
        .gte("requested_at", since)
        .order("requested_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as DataExportRequestRow[];
    }),
    safeQuery<IngestionJobRow>("ingestion_jobs", async () => {
      const { data, error } = await fromTable("ingestion_jobs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as IngestionJobRow[];
    }),
    safeQuery<CrmAutomationRow>("crm_automations", async () => {
      const { data, error } = await fromTable("crm_automations")
        .select("*")
        .eq("user_id", userId)
        .not("last_run_at", "is", null)
        .gte("last_run_at", since)
        .order("last_run_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data ?? []) as CrmAutomationRow[];
    }),
    safeQuery<WorkflowRunRow>("workflow_runs", async () => {
      const { data, error } = await fromTable("workflow_runs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as WorkflowRunRow[];
    }),
  ]);

  const jobs: BackgroundJobVM[] = [
    ...imports.rows.map(crmImportJobToVM),
    ...syncs.rows.map(connectorSyncRunToVM),
    ...exports_.rows.map(dataExportRequestToVM),
    ...ingestions.rows.map(ingestionJobToVM),
    ...automations.rows.map(crmAutomationToVM).filter((j): j is BackgroundJobVM => j !== null),
    ...workflows.rows.map(workflowRunToVM),
  ];

  jobs.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));

  const failedSources: string[] = [];
  if (!imports.ok) failedSources.push("crm_import_jobs");
  if (!syncs.ok) failedSources.push("connector_sync_runs");
  if (!exports_.ok) failedSources.push("data_export_requests");
  if (!ingestions.ok) failedSources.push("ingestion_jobs");
  if (!automations.ok) failedSources.push("crm_automations");
  if (!workflows.ok) failedSources.push("workflow_runs");

  return { jobs, partial: failedSources.length > 0, failedSources };
}

// ── Mutations ────────────────────────────────────────────────

export interface JobActionResult {
  ok: boolean;
  reason?: "not-supported" | "not-authenticated" | "wrong-status" | string;
  message?: string;
}

/**
 * Retry a failed job by setting its status back to a re-runnable state.
 * Honest: where the source table supports a status reset, we do it.
 * Where execution is gated by an external worker, we surface "manual"
 * so the UI shows a deferred state instead of a dead button.
 */
export async function retryBackgroundJob(job: BackgroundJobVM): Promise<JobActionResult> {
  if (!job.canRetry) return { ok: false, reason: "not-supported", message: "Retry is not available for this job kind." };
  const userId = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" };

  switch (job.sourceTable) {
    case "crm_import_jobs": {
      const { error } = await fromTable("crm_import_jobs")
        .update({ status: "pending", error_count: 0, errors: [] })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Import re-queued" };
    }
    case "connector_sync_runs": {
      const { error } = await fromTable("connector_sync_runs")
        .update({ status: "pending", error: null, dead_letter: false })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Sync re-queued" };
    }
    case "ingestion_jobs": {
      const { error } = await fromTable("ingestion_jobs")
        .update({ stage: "queued", error: null, progress: 0 })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Ingestion re-queued" };
    }
    case "data_export_requests": {
      const { error } = await fromTable("data_export_requests")
        .update({ status: "pending", error_message: null })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Export re-queued" };
    }
    case "workflow_runs": {
      const { error } = await fromTable("workflow_runs")
        .update({ status: "pending", error: null })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Workflow re-queued" };
    }
    case "crm_automations":
      return {
        ok: false,
        reason: "not-supported",
        message: "Open the automation to re-run it from its definition.",
      };
    default:
      return { ok: false, reason: "not-supported" };
  }
}

/**
 * Cancel a queued or running job where the source table supports it.
 * Honest: returns reason="not-supported" for kinds without a cancel path.
 */
export async function cancelBackgroundJob(job: BackgroundJobVM): Promise<JobActionResult> {
  if (!job.canCancel) return { ok: false, reason: "wrong-status" };
  const userId = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" };

  switch (job.sourceTable) {
    case "crm_import_jobs": {
      const { error } = await fromTable("crm_import_jobs")
        .update({ status: "cancelled", completed_at: new Date().toISOString() })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Import cancelled" };
    }
    case "ingestion_jobs": {
      const { error } = await fromTable("ingestion_jobs")
        .update({ stage: "cancelled", completed_at: new Date().toISOString() })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Ingestion cancelled" };
    }
    case "workflow_runs": {
      const { error } = await fromTable("workflow_runs")
        .update({ status: "cancelled", completed_at: new Date().toISOString() })
        .eq("id", job.sourceId)
        .eq("user_id", userId);
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: "Workflow cancelled" };
    }
    default:
      return { ok: false, reason: "not-supported", message: "This job kind cannot be cancelled mid-run." };
  }
}

/**
 * Emit a governance receipt to ai_action_receipts (matches the
 * autopilot-config-service pattern — no parallel proof system).
 */
export async function recordBackgroundJobAction(
  action: "retry" | "cancel" | "view",
  job: BackgroundJobVM,
  result: JobActionResult
): Promise<void> {
  const userId = await uid();
  if (!userId) return;
  try {
    await fromTable("ai_action_receipts").insert({
      user_id: userId,
      action_type: `background_task.${action}`,
      recommendation_summary: `${action} ${job.kind} job (${job.title})`,
      status: result.ok ? "executed" : "failed",
      executed_at: new Date().toISOString(),
      action_payload: {
        job_id: job.id,
        source_table: job.sourceTable,
        source_id: job.sourceId,
        kind: job.kind,
        title: job.title,
        result,
      },
      metadata: { surface: "business.background-tasks" },
    });
  } catch (err) {
    console.warn("[bg-tasks] receipt emission failed:", err);
  }
}