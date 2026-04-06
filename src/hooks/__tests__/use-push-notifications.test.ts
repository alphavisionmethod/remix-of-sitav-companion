import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

describe("usePushNotifications hook", () => {
  it("module exports the hook function", async () => {
    const mod = await import("@/hooks/use-push-notifications");
    expect(typeof mod.usePushNotifications).toBe("function");
  });
});
