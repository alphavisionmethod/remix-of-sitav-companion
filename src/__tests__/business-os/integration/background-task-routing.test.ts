// Phase 7 — Background Task Routing & Lineage Forwarding
// Verifies entity-aware deep links + graceful fallback.

import { describe, it, expect } from "vitest";
import {
  recoveryJobToVM,
  auditLogToVM,
} from "@/modules/business/domain/background-tasks/types";
import { resolveTaskTarget } from "@/lib/business/task-target-resolver";

const NOW = new Date().toISOString();

describe("Phase 7 — background task routing", () => {
  it("recovery_jobs with lead_id → routes to lead-recovery with entity hint", () => {
    const vm = recoveryJobToVM({
      id: "r1", user_id: "u1", status: "completed", label: "Win-back call",
      lead_id: "lead-42", appointment_id: null, crm_contact_id: null,
      created_at: NOW, started_at: NOW, progress: 100,
    } as any);
    expect(vm.linkedEntity?.type).toBe("lead");
    expect(vm.linkedEntity?.id).toBe("lead-42");
    const target = resolveTaskTarget(vm);
    expect(target?.module).toBe("lead-recovery");
    expect(target?.entityType).toBe("lead");
    expect(target?.entityId).toBe("lead-42");
  });

  it("recovery_jobs with appointment_id → routes to appointments", () => {
    const vm = recoveryJobToVM({
      id: "r2", user_id: "u1", status: "completed", label: "No-show recovery",
      lead_id: null, appointment_id: "appt-7", crm_contact_id: null,
      created_at: NOW, started_at: NOW, progress: 100,
    } as any);
    const target = resolveTaskTarget(vm);
    expect(target?.module).toBe("appointments");
    expect(target?.entityType).toBe("appointment");
    expect(target?.entityId).toBe("appt-7");
  });

  it("recovery_jobs with no lineage → falls back to lead-recovery list", () => {
    const vm = recoveryJobToVM({
      id: "r3", user_id: "u1", status: "completed", label: "Generic",
      lead_id: null, appointment_id: null, crm_contact_id: null,
      created_at: NOW, started_at: NOW, progress: 100,
    } as any);
    const target = resolveTaskTarget(vm);
    expect(target?.module).toBe("lead-recovery");
    expect(target?.entityId).toBeUndefined();
  });

  it("audit_logs with subject_type=invoice → routes to billing", () => {
    const vm = auditLogToVM({
      id: "a1", user_id: "u1", action: "invoice.sent", severity: "info",
      subject_type: "invoice", subject_id: "inv-9", created_at: NOW,
    } as any);
    expect(vm.linkedEntity?.type).toBe("invoice");
    const target = resolveTaskTarget(vm);
    expect(target?.module).toBe("billing");
    expect(target?.entityType).toBe("invoice");
    expect(target?.entityId).toBe("inv-9");
  });

  it("audit_logs without a subject → falls back to proof", () => {
    const vm = auditLogToVM({
      id: "a2", user_id: "u1", action: "system.boot", severity: "info",
      subject_type: null, subject_id: null, created_at: NOW,
    } as any);
    const target = resolveTaskTarget(vm);
    expect(target?.module).toBe("proof");
    expect(target?.entityId).toBeUndefined();
  });
});
