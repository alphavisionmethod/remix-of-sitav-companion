// ═══════════════════════════════════════════════════════════════
// Phase 6 — Background Task Source/Lineage Coverage
// Verifies that every BackgroundJobVM carries a typed `sourceTable`
// and `sourceId`, so the operator's task center can route to the
// real underlying record without guessing.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  crmAutomationToVM,
  crmImportJobToVM,
  connectorSyncRunToVM,
  dataExportRequestToVM,
  ingestionJobToVM,
  workflowRunToVM,
  recoveryJobToVM,
  auditLogToVM,
  aiInvocationToVM,
} from "@/modules/business/domain/background-tasks/types";

const ALLOWED_SOURCES = new Set([
  "crm_import_jobs",
  "connector_sync_runs",
  "data_export_requests",
  "ingestion_jobs",
  "crm_automations",
  "workflow_runs",
  "recovery_jobs",
  "audit_logs",
  "ai_invocations",
]);

const NOW = new Date().toISOString();

describe("Phase 6 — background task source lineage", () => {
  it("crm_import_jobs row → VM carries source lineage", () => {
    const vm = crmImportJobToVM({
      id: "imp-1",
      user_id: "u1",
      status: "running",
      total_rows: 1000,
      processed_rows: 500,
      created_at: NOW,
      updated_at: NOW,
      error_message: null,
    } as any);
    expect(vm.sourceTable).toBe("crm_import_jobs");
    expect(ALLOWED_SOURCES.has(vm.sourceTable)).toBe(true);
    expect(vm.sourceId).toBe("imp-1");
  });

  it("connector_sync_runs row → VM carries source lineage", () => {
    const vm = connectorSyncRunToVM({
      id: "csr-1",
      user_id: "u1",
      status: "succeeded",
      created_at: NOW,
      updated_at: NOW,
      finished_at: NOW,
    } as any);
    expect(vm.sourceTable).toBe("connector_sync_runs");
    expect(vm.sourceId).toBe("csr-1");
  });

  it("audit_logs row → VM is correctly NOT retryable (read-only audit truth)", () => {
    const vm = auditLogToVM({
      id: "aud-1",
      user_id: "u1",
      action: "read",
      created_at: NOW,
    } as any);
    expect(vm.sourceTable).toBe("audit_logs");
    expect(vm.canRetry).toBe(false);
    // The honesty contract: a non-retryable VM MUST surface a reason.
    expect(vm.retryUnavailableReason && vm.retryUnavailableReason.length).toBeGreaterThan(0);
  });

  it("every VM converter produces a non-empty sourceTable from the allowed set", () => {
    const samples = [
      crmAutomationToVM({ id: "1", user_id: "u", status: "completed", created_at: NOW, updated_at: NOW } as any),
      dataExportRequestToVM({ id: "1", user_id: "u", status: "completed", created_at: NOW, updated_at: NOW } as any),
      ingestionJobToVM({ id: "1", user_id: "u", status: "succeeded", created_at: NOW, updated_at: NOW } as any),
      workflowRunToVM({ id: "1", user_id: "u", status: "completed", created_at: NOW, updated_at: NOW } as any),
      recoveryJobToVM({ id: "1", user_id: "u", status: "completed", created_at: NOW, updated_at: NOW } as any),
      aiInvocationToVM({ id: "1", user_id: "u", status: "completed", created_at: NOW } as any),
    ];
    for (const vm of samples) {
      expect(ALLOWED_SOURCES.has(vm.sourceTable)).toBe(true);
      expect(vm.sourceId.length).toBeGreaterThan(0);
      expect(vm.id.length).toBeGreaterThan(0);
      // Progress is bounded — no fake 110%.
      expect(vm.progress).toBeGreaterThanOrEqual(0);
      expect(vm.progress).toBeLessThanOrEqual(100);
    }
  });
});