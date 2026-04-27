// ═══════════════════════════════════════════════════════════════
// SITA OS — Background Task Target Resolver
// Maps a BackgroundJobVM to a structured destination inside the
// Business OS app (subpage key + optional entity id). Used by
// BackgroundTaskCenter to deep-link rows to their source surface.
// Pure function — no I/O, no React.
// ═══════════════════════════════════════════════════════════════

import type {
  BackgroundJobVM,
  BackgroundJobNavigationTarget,
} from "@/modules/business/domain/background-tasks/types";

/**
 * Resolve the in-app navigation target for a background job row.
 * Returns `null` when the source has no meaningful surface
 * (in which case the row stays read-only and renders no link).
 */
export function resolveTaskTarget(job: BackgroundJobVM): BackgroundJobNavigationTarget | null {
  switch (job.sourceTable) {
    case "crm_import_jobs":
      return { module: "crm-import", label: "Open Import Center" };

    case "connector_sync_runs":
      return { module: "integrations", label: "Open Integrations" };

    case "data_export_requests":
      return { module: "documents", label: "Open Documents" };

    case "ingestion_jobs":
      return { module: "operations", label: "Open Operations" };

    case "crm_automations":
      return { module: "crm-automations", label: "Open Automations" };

    case "workflow_runs":
      return { module: "operations", label: "Open Workflows" };

    case "recovery_jobs": {
      // Phase 7 lineage: route to the most specific surface available
      // for the originating entity, falling back to the recovery list.
      const linked = job.linkedEntity;
      if (linked?.type === "appointment") {
        return {
          module: "appointments",
          entityId: linked.id,
          entityType: "appointment",
          label: "Open appointment",
        };
      }
      if (linked?.type === "lead") {
        return {
          module: "lead-recovery",
          entityId: linked.id,
          entityType: "lead",
          label: "Open lead in Recovery",
        };
      }
      if (linked?.type === "customer") {
        return {
          module: "crm",
          entityId: linked.id,
          entityType: "customer",
          label: "Open contact",
        };
      }
      return { module: "lead-recovery", label: "Open Lead Recovery" };
    }

    case "audit_logs": {
      const linked = job.linkedEntity;
      if (linked) {
        // Map the audit subject to the closest operator surface.
        if (linked.type === "appointment") return { module: "appointments", entityId: linked.id, entityType: "appointment", label: "Open appointment" };
        if (linked.type === "lead")        return { module: "lead-recovery", entityId: linked.id, entityType: "lead", label: "Open lead" };
        if (linked.type === "invoice")     return { module: "billing", entityId: linked.id, entityType: "invoice", label: "Open invoice" };
        if (linked.type === "opportunity") return { module: "opportunities", entityId: linked.id, entityType: "opportunity", label: "Open opportunity" };
        if (linked.type === "customer")    return { module: "crm", entityId: linked.id, entityType: "customer", label: "Open contact" };
      }
      // Otherwise fall back to the proof surface for full lineage view.
      return { module: "proof", label: "Open Proof" };
    }

    case "ai_invocations":
      // AI invocations are surfaced inside the boardroom proof tab.
      return { module: "boardroom", label: "Open Boardroom" };

    default:
      return null;
  }
}

/**
 * Returns true when retry is *not* possible and we should show the
 * honest tooltip explaining why (per Phase 7 plan).
 */
export function shouldShowNoRetryTooltip(job: BackgroundJobVM): boolean {
  return !job.canRetry && Boolean(job.retryUnavailableReason);
}