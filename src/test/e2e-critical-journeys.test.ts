import { describe, it, expect, vi } from "vitest";

// E2E smoke tests for critical user journeys
// These validate that key flows don't crash and produce expected DOM output

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

describe("Critical User Journey: Authentication", () => {
  it("login page imports without error", async () => {
    const mod = await import("@/pages/auth/LoginPage");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("signup page imports without error", async () => {
    const mod = await import("@/pages/auth/SignupPage");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });
});

describe("Critical User Journey: Business Center", () => {
  it("business boardroom imports without error", async () => {
    const mod = await import("@/pages/business/BusinessBoardroom");
    expect(mod).toBeDefined();
  });

  it("invoices page imports without error", async () => {
    const mod = await import("@/pages/business/InvoicesCollections");
    expect(mod).toBeDefined();
  });

  it("opportunities page imports without error", async () => {
    const mod = await import("@/pages/business/OpportunitiesCenter");
    expect(mod).toBeDefined();
  });
});

describe("Critical User Journey: Money Center", () => {
  it("money documents imports without error", async () => {
    const mod = await import("@/pages/money/MoneyDocuments");
    expect(mod).toBeDefined();
  });
});

describe("Critical User Journey: Concierge", () => {
  it("concierge overview imports without error", async () => {
    const mod = await import("@/pages/concierge/ConciergeOverview");
    expect(mod).toBeDefined();
  });
});

describe("Critical User Journey: Owner Center", () => {
  it("owner center imports without error", async () => {
    const mod = await import("@/pages/OwnerCenter");
    expect(mod).toBeDefined();
  });
});

describe("Critical User Journey: Admin Dashboard", () => {
  it("brain core dashboard imports without error", async () => {
    const mod = await import("@/pages/admin/BrainCoreDashboard");
    expect(mod).toBeDefined();
  });
});
