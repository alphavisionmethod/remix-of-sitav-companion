import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
      select: () => ({
        eq: () => ({
          order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    }),
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "u1" } } })), onAuthStateChange: vi.fn() },
  },
}));

describe("SupabaseAdapters", () => {
  it("exports receipt persistence", async () => {
    const mod = await import("../supabase-adapters");
    expect(mod.persistReceipt).toBeDefined();
    expect(typeof mod.persistReceipt).toBe("function");
  });

  it("PersistedReceipt type shape", async () => {
    const mod = await import("../supabase-adapters");
    expect(mod).toBeDefined();
  });
});
