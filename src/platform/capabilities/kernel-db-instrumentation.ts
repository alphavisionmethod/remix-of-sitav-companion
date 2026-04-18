// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel-Instrumented Table Access
// Wraps fromTable/fromDynamicTable to emit kernel events for
// every database operation, achieving 100% kernel adoption
// without rewriting every page/component.
// ═══════════════════════════════════════════════════════════════

import { getSitaKernel } from "@/lib/sita-kernel";

type Operation = "select" | "insert" | "update" | "upsert" | "delete";

/**
 * Emit a kernel event for a database operation.
 * Called by the instrumented supabase-helpers proxy.
 */
export function emitKernelDbEvent(
  table: string,
  operation: Operation,
  payload?: unknown,
): void {
  try {
    const kernel = getSitaKernel();
    if (!kernel?.eventBus) return;

    kernel.eventBus.publish(`db.${operation}`, {
      table,
      operation,
      timestamp: Date.now(),
      ...(operation !== "select" ? { mutationPayload: summarize(payload) } : {}),
    }, {
      source: `supabase:${table}`,
      domain: inferDomain(table),
    });

    // For mutations, also record a receipt
    if (operation !== "select" && kernel.receipts) {
      kernel.receipts.createReceipt(
        `db-${table}-${Date.now()}`,
        "execution-summary",
        {
          domain: inferDomain(table),
          action: `${table}.${operation}`,
          surface: "database",
          result: "completed",
          table,
          operation,
        },
      );
    }
  } catch {
    // Never block DB operations if kernel instrumentation fails
  }
}

/** Infer domain from table name */
function inferDomain(table: string): string {
  const domainMap: Record<string, string> = {
    invoices: "finance", bills: "finance", payments: "finance",
    subscriptions: "finance", reserves: "finance", budgets: "finance",
    financial_accounts: "finance", cashflow: "finance",
    customers: "business", leads: "business", opportunities: "business",
    quotes: "business", contacts: "business", communications: "business",
    tasks: "concierge", bookings: "concierge", calendar_events: "concierge",
    household_tasks: "concierge", household_members: "concierge",
    workflows: "automation", workflow_runs: "automation",
    scheduled_jobs: "automation", job_executions: "automation",
    profiles: "system", user_memory: "system", policies: "system",
    notifications: "system", notifications_queue: "system",
    audit_logs: "system", incidents: "system",
    advisor_registry: "ai", ai_workforce_recommendations: "ai",
    ai_workforce_approval_queue: "ai",
  };
  
  for (const [prefix, domain] of Object.entries(domainMap)) {
    if (table === prefix || table.startsWith(prefix)) return domain;
  }
  return "system";
}

/** Summarize payload for receipts (avoid storing full data) */
function summarize(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const p = payload as Record<string, unknown>;
  return {
    hasUserId: "user_id" in p,
    fieldCount: Object.keys(p).length,
    fields: Object.keys(p).slice(0, 10),
  };
}
