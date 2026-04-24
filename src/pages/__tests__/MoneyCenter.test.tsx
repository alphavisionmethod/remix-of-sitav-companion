import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import React from "react";



vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ data: [], error: null })), data: [], error: null, order: vi.fn(() => ({ data: [], error: null })) })),
    })),
  },
}));

vi.mock("@/contexts/DataModeContext", () => ({
  useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" }, loading: false, signOut: vi.fn() }),
}));

describe("MoneyCenter Page", () => {
  it("exports a default component", async () => {
    const mod = await import("../MoneyCenter");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("renders with tabs", async () => {
    const MoneyCenter = (await import("../MoneyCenter")).default;
    const { container } = render(<MoneyCenter />);
    expect(container).toBeTruthy();
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
}, 15000);
