// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Capability Handlers
// Registers every production `useAction(domain, capability)` ID
// into the kernel ExecutorService. Without this registration the
// canonical chain returns NO_HANDLER for every business write.
//
// Each handler:
//   1. Resolves the authenticated user via Supabase
//   2. Performs the DB write through the typed client
//   3. Returns the persisted row as the capability result
//   4. Returns { status: "failure" } on auth/DB errors so the
//      executor's circuit-breaker + lineage transitions fire
//
// NEVER call this twice on the same executor — registration is
// idempotent (Map.set overwrites) but redundant work.
// ═══════════════════════════════════════════════════════════════

import type { ExecutorService, CapabilityHandler } from "@/lib/core-services/executor-service";
import { registerBusinessHandlers } from "./business-handlers";
import { registerFinanceHandlers } from "./finance-handlers";
import { registerConciergeHandlers } from "./concierge-handlers";

export type { CapabilityHandler };

let _registered = false;

/**
 * Register every canonical business/finance/concierge handler against
 * the supplied executor. Idempotent: safe to call multiple times.
 */
export function registerCanonicalHandlers(executor: ExecutorService): void {
  if (_registered) return;

  registerBusinessHandlers(executor);
  registerFinanceHandlers(executor);
  registerConciergeHandlers(executor);

  _registered = true;
}

/** For tests — clears the singleton guard so handlers can re-register on a fresh executor. */
export function _resetCanonicalHandlersForTests(): void {
  _registered = false;
}

/** Returns the canonical list of capability IDs that should be registered. Used by verification tests. */
export const CANONICAL_HANDLER_IDS = [
  // business
  "business.opportunity.create",
  "business.opportunity.update-stage",
  "business.opportunity.delete",
  "business.quote.create",
  "business.quote.delete",
  "business.status.update",
  "business.customer.create",
  "business.customer.delete",
  // finance
  "finance.invoice.create",
  "finance.invoice.status",
  "finance.invoice.delete",
  "finance.bill.create",
  "finance.bill.update",
  "finance.bill.pay",
  "finance.bill.delete",
  "finance.subscription.status",
  "finance.subscription.delete",
  "finance.reserve.create",
  "finance.reserve.delete",
  // concierge
  "concierge.task.create",
  "concierge.task.delete",
  "concierge.status.update",
] as const;