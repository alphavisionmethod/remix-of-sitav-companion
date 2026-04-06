import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/contexts/DataModeContext", () => ({
  useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" }, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/contexts/InspectorContext", () => ({
  useInspector: () => ({ inspect: vi.fn(), inspectedEntity: null }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ data: [], error: null }) }) },
}));

describe("Boardroom Page", () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it("exports a default component", async () => {
    const mod = await import("../Boardroom");
    expect(mod.default).toBeDefined();
  });

  it("renders DemoModeBadge in demo mode", async () => {
    const Boardroom = (await import("../Boardroom")).default;
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <Boardroom />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(container.firstChild).toBeTruthy();
    // Should contain demo badge text
    expect(container.textContent).toContain("Demo");
  });
});
