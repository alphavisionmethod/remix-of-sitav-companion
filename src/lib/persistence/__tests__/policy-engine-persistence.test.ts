import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "test-user" } } })),
      onAuthStateChange: vi.fn(),
    },
    from: () => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    }),
  },
}));

describe("PolicyEnginePersistence", () => {
  it("exports persistence function", async () => {
    const mod = await import("../policy-engine-persistence");
    expect(mod.persistPolicyEvaluation).toBeDefined();
    expect(typeof mod.persistPolicyEvaluation).toBe("function");
  });
});
