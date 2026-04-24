import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import React from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";



vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
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

vi.mock("@/contexts/InspectorContext", () => ({
  useInspector: () => ({ inspect: vi.fn(), inspectedEntity: null }),
}));

describe("Boardroom Page", () => {
  it("exports a default component", async () => {
    const mod = await import("../Boardroom");
    expect(mod.default).toBeDefined();
  }, 15000);

  it("renders with DemoModeBadge", async () => {
    const Boardroom = (await import("../Boardroom")).default;
    const { container } = render(<Boardroom />);
    expect(container).toBeTruthy();
    expect(container.textContent).toContain("Demo");
  }, 15000);
});
