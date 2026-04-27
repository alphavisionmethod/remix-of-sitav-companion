// ═══════════════════════════════════════════════════════════════
// Phase 6 — Appointment no-show → Follow-Through callback bridge
//
// Verifies that recovering a no-show inserts a `callback_queue` row
// in the "recovery" kind, carrying CRM lineage forward from the
// source appointment. Mirrors the Phase 4/5 mocking style.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

const inserts: Array<{ table: string; row: Record<string, unknown> }> = [];
const stored: Record<string, Record<string, unknown>[]> = {
  appointments: [
    {
      id: "appt-1",
      user_id: "user-1",
      title: "Discovery call",
      customer_name: "Maya Chen",
      crm_contact_id: "contact-1",
      crm_company_id: "company-1",
      metadata: {},
    },
  ],
};

function chain(table: string) {
  const c: any = {
    select: () => c,
    eq: () => c,
    gte: () => c,
    lte: () => c,
    order: () => Promise.resolve({ data: stored[table] ?? [], error: null }),
    single: () => Promise.resolve({ data: stored[table]?.[0] ?? null, error: null }),
    maybeSingle: () => Promise.resolve({ data: stored[table]?.[0] ?? null, error: null }),
    update: () => ({ eq: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) }),
    insert: (row: Record<string, unknown>) => {
      inserts.push({ table, row });
      return Promise.resolve({ data: { id: `row-${inserts.length}`, ...row }, error: null });
    },
  };
  return c;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }) },
    from: (t: string) => chain(t),
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: (t: string) => chain(t),
}));

vi.mock("@/data/fixtures/mock-data/business-scheduling", () => ({
  buildDemoScheduledAppointments: () => [],
}));

describe("Phase 6 — appointment no-show → callback_queue bridge", () => {
  beforeEach(() => {
    inserts.length = 0;
  });

  it("recoverNoShow inserts a recovery callback_queue row with CRM lineage", async () => {
    const { recoverNoShow } = await import(
      "@/data/repositories/business-scheduling-service"
    );
    const result = await recoverNoShow("appt-1", "email");
    expect(result.ok).toBe(true);

    const cb = inserts.find((i) => i.table === "callback_queue");
    expect(cb).toBeTruthy();
    expect(cb!.row.queue_kind).toBe("recovery");
    expect(cb!.row.urgency).toBe("high");
    expect(cb!.row.channel).toBe("email");
    expect(cb!.row.crm_contact_id).toBe("contact-1");
    expect(cb!.row.crm_company_id).toBe("company-1");
    expect(cb!.row.source_appointment_id).toBe("appt-1");
  });
});