/**
 * Phase 4 — Platform Background Task Target Resolver.
 *
 * Verifies that the new platform-level resolver:
 *   1. Falls back to the legacy Business resolver for original sources.
 *   2. Maps Concierge source tables to /concierge/* routes.
 *   3. Maps Finance source tables to /business/billing /quotes /money/wealth.
 *   4. Preserves the legacy contract via the back-compat re-export.
 */
import { describe, it, expect } from "vitest";
import {
  resolvePlatformTaskTarget,
  resolveTaskTarget,
} from "@/platform/integration/background-task-target-resolver";
import type { BackgroundJobVM } from "@/modules/business/domain/background-tasks/types";

function vm(partial: Partial<BackgroundJobVM> & Pick<BackgroundJobVM, "sourceTable">): BackgroundJobVM {
  return {
    id: "j1",
    kind: "automation",
    title: "Test job",
    status: "completed",
    progress: 100,
    startedAt: new Date().toISOString(),
    sourceId: "src-1",
    canRetry: false,
    canCancel: false,
    ...partial,
  } as BackgroundJobVM;
}

describe("Phase 4 — Platform Background Task Target Resolver", () => {
  it("routes Business sources via the legacy resolver", () => {
    const t = resolvePlatformTaskTarget(vm({ sourceTable: "crm_import_jobs" }));
    expect(t).not.toBeNull();
    expect(t?.app).toBe("business");
    expect(t?.route).toBe("/business/crm/import");
  });

  it("routes Concierge automations to /concierge/recurring", () => {
    const t = resolvePlatformTaskTarget(vm({ sourceTable: "concierge_automations" as never }));
    expect(t?.app).toBe("concierge");
    expect(t?.route).toBe("/concierge/recurring");
  });

  it("routes calendar sync links to /concierge/calendar", () => {
    const t = resolvePlatformTaskTarget(vm({ sourceTable: "calendar_sync_links" as never }));
    expect(t?.app).toBe("concierge");
    expect(t?.route).toBe("/concierge/calendar");
  });

  it("routes Finance sources to the right surface", () => {
    const billing = resolvePlatformTaskTarget(vm({ sourceTable: "invoices" as never }));
    const quotes = resolvePlatformTaskTarget(vm({ sourceTable: "quotes" as never }));
    const wealth = resolvePlatformTaskTarget(vm({ sourceTable: "wealth_snapshots" as never }));
    expect(billing?.app).toBe("finance");
    expect(billing?.route).toBe("/business/billing");
    expect(quotes?.route).toBe("/business/quotes");
    expect(wealth?.route).toBe("/money/wealth");
  });

  it("preserves the legacy contract for back-compat callers", () => {
    const legacy = resolveTaskTarget(vm({ sourceTable: "audit_logs" }));
    // Legacy shape has no `app` / `route` fields.
    expect(legacy).not.toBeNull();
    expect((legacy as Record<string, unknown>).app).toBeUndefined();
    expect((legacy as Record<string, unknown>).route).toBeUndefined();
  });

  it("returns null for unknown sources rather than guessing", () => {
    const t = resolvePlatformTaskTarget(vm({ sourceTable: "totally_made_up_source" as never }));
    expect(t).toBeNull();
  });
});