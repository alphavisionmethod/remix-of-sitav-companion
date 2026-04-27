// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Background Task Target Resolver (Phase 4)
// ───────────────────────────────────────────────────────────────
// Promotes the legacy `src/lib/business/task-target-resolver.ts`
// helper to a cross-module platform service. The Business OS
// resolver remains the canonical implementation for
// business-domain source tables; this module extends it with
// Concierge and Finance source tables and exposes a single
// `resolvePlatformTaskTarget()` entry point that downstream apps
// (Concierge, Finance, Boardroom) can use without reaching into
// the Business module.
//
// Pure function. No I/O. No React. No new tables.
// Owner: src/platform/integration/cross-module-integration-map.ts
//        (entries `background-task-to-source` and
//         `background-task-to-result`).
// ═══════════════════════════════════════════════════════════════

import {
  resolveTaskTarget as resolveBusinessTaskTarget,
  shouldShowNoRetryTooltip as shouldShowNoRetryTooltipBusiness,
} from "@/lib/business/task-target-resolver";
import type {
  BackgroundJobVM,
  BackgroundJobNavigationTarget,
} from "@/modules/business/domain/background-tasks/types";

/** Optional cross-module destination surface keys. */
export type PlatformTaskModule =
  | BackgroundJobNavigationTarget["module"]
  // Concierge
  | "concierge-overview"
  | "concierge-recurring"
  | "concierge-providers"
  | "concierge-errands"
  | "concierge-calendar"
  | "concierge-files"
  // Finance
  | "finance-billing"
  | "finance-quotes"
  | "finance-wealth";

export interface PlatformBackgroundJobTarget extends BackgroundJobNavigationTarget {
  /** App surface that should host the destination route. */
  app: "business" | "concierge" | "finance" | "files" | "boardroom" | "operations";
  /** Full route path (used by NavLink/back-link components). */
  route: string;
}

function withApp(
  target: BackgroundJobNavigationTarget,
): PlatformBackgroundJobTarget {
  // Business app sub-pages keep the legacy `module` key — translate
  // them into the canonical /business/<sub> route.
  const businessRoutes: Record<string, string> = {
    "crm-import": "/business/crm/import",
    "integrations": "/business/integrations",
    "documents": "/business/documents",
    "operations": "/business/operations",
    "crm-automations": "/business/crm/automations",
    "lead-recovery": "/business/lead-recovery",
    "appointments": "/business/appointments",
    "crm": "/business/crm",
    "billing": "/business/billing",
    "opportunities": "/business/opportunities",
    "proof": "/business/proof",
    "boardroom": "/boardroom",
  };
  const route = businessRoutes[target.module] ?? `/business/${target.module}`;
  const app = target.module === "boardroom" ? "boardroom" : "business";
  return { ...target, app, route };
}

/**
 * Resolve a navigation target across all modules, not just Business.
 * Falls back to the canonical Business resolver for source tables
 * it knows about; otherwise classifies the row by source table into
 * the Concierge or Finance app surface.
 *
 * Returns `null` only when the row has no meaningful destination
 * (mirroring the legacy contract used by BackgroundTaskCenter).
 */
export function resolvePlatformTaskTarget(
  job: BackgroundJobVM,
): PlatformBackgroundJobTarget | null {
  // Concierge-source tables (e.g. concierge_automations, calendar_sync_links).
  // These are not currently surfaced by fetchBackgroundJobs but the resolver
  // must accept them for forward compatibility (Concierge background queue,
  // adaptive proof emission, future ingestion sources).
  const sourceTable = job.sourceTable as string;
  switch (sourceTable) {
    case "concierge_automations":
      return {
        module: "concierge-recurring",
        app: "concierge",
        route: "/concierge/recurring",
        label: "Open recurring obligations",
      };
    case "calendar_sync_links":
      return {
        module: "concierge-calendar",
        app: "concierge",
        route: "/concierge/calendar",
        label: "Open Calendar",
      };
    case "household_tasks":
      return {
        module: "concierge-overview",
        app: "concierge",
        route: "/concierge/household",
        entityId: job.linkedEntity?.id,
        label: "Open household task",
      };
    case "errands":
      return {
        module: "concierge-errands",
        app: "concierge",
        route: "/concierge/errands",
        entityId: job.linkedEntity?.id,
        label: "Open errand",
      };
    case "concierge_documents":
      return {
        module: "concierge-files",
        app: "concierge",
        route: "/concierge/files",
        label: "Open Concierge files",
      };

    // Finance-source tables (recurring billing, recovered ledger, wealth).
    case "billing_runs":
    case "invoices":
      return {
        module: "finance-billing",
        app: "finance",
        route: "/business/billing",
        entityId: job.linkedEntity?.id,
        label: "Open invoice",
      };
    case "quotes":
      return {
        module: "finance-quotes",
        app: "finance",
        route: "/business/quotes",
        entityId: job.linkedEntity?.id,
        label: "Open quote",
      };
    case "wealth_snapshots":
    case "recovered_value_entries":
      return {
        module: "finance-wealth",
        app: "finance",
        route: "/money/wealth",
        label: "Open Wealth",
      };
    default:
      break;
  }

  // Legacy Business resolver handles all originally-mapped tables.
  const legacy = resolveBusinessTaskTarget(job);
  if (legacy) return withApp(legacy);

  // For audit/recovery rows whose `linkedEntity` points at a concierge
  // entity, translate the legacy fallback to the right concierge surface.
  const linked = job.linkedEntity;
  if (linked?.type === "appointment" && job.sourceTable === "audit_logs") {
    return {
      module: "concierge-calendar",
      app: "concierge",
      route: "/concierge/calendar",
      entityId: linked.id,
      entityType: "appointment",
      label: "Open appointment",
    };
  }
  return null;
}

/** Re-exported so consumers can import the tooltip helper from one place. */
export const shouldShowNoRetryTooltip = shouldShowNoRetryTooltipBusiness;

/**
 * Back-compat wrapper: returns the legacy `BackgroundJobNavigationTarget`
 * shape (without `app`/`route`) for callers that still expect it
 * (e.g. BackgroundTaskCenter row renderers). New callers should prefer
 * `resolvePlatformTaskTarget`.
 */
export function resolveTaskTarget(
  job: BackgroundJobVM,
): BackgroundJobNavigationTarget | null {
  const platform = resolvePlatformTaskTarget(job);
  if (!platform) return null;
  // Strip platform-only fields.
  const { app: _app, route: _route, ...rest } = platform;
  void _app;
  void _route;
  return rest;
}