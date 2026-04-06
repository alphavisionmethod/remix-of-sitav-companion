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

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ data: [], error: null }), data: [], error: null }) }),
    auth: { getUser: () => Promise.resolve({ data: { user: { id: "test" } }, error: null }) },
  },
}));

describe("SettingsPage", () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it("exports a default component", async () => {
    const mod = await import("../SettingsPage");
    expect(mod.default).toBeDefined();
  });

  it("renders settings sections", async () => {
    const SettingsPage = (await import("../SettingsPage")).default;
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
