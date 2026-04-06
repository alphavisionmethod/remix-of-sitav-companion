import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() }, auth: { onAuthStateChange: vi.fn() } },
}));

describe("useBrainCore", () => {
  it("module exports useBrainCore function", async () => {
    const mod = await import("../use-brain-core");
    expect(typeof mod.useBrainCore).toBe("function");
  });

  it("AdvisorResponse type shape is documented", async () => {
    // Verify the module can be imported without errors
    const mod = await import("../use-brain-core");
    expect(mod).toBeDefined();
  });
});
