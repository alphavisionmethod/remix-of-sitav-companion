import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }) }),
    functions: { invoke: vi.fn() },
    channel: () => ({ on: () => ({ subscribe: vi.fn() }), unsubscribe: vi.fn() }),
    removeChannel: vi.fn(),
    auth: { onAuthStateChange: vi.fn() },
  },
}));

describe("useAdminData", () => {
  it("exports admin hooks", async () => {
    const mod = await import("../use-admin-data");
    expect(typeof mod.useAdminIncidents).toBe("function");
    expect(typeof mod.useAdminAuditLogs).toBe("function");
    expect(typeof mod.useAdminPolicies).toBe("function");
  });
});
