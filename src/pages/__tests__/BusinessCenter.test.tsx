import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

vi.mock("@/contexts/DataModeContext", () => ({
  useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" }, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ data: [], error: null }) }) },
}));

describe("BusinessCenter Page", () => {
  it("exports a default component", async () => {
    const mod = await import("../BusinessCenter");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("renders tabs navigation", async () => {
    const BusinessCenter = (await import("../BusinessCenter")).default;
    const { container } = render(
      <MemoryRouter initialEntries={["/business"]}>
        <BusinessCenter />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeTruthy();
    // Should have tab-like navigation
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
