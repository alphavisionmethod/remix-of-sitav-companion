import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test" } }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ data: [], error: null })), data: [], error: null, order: vi.fn(() => ({ data: [], error: null })) })),
    })),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  },
}));

vi.mock("@/contexts/DataModeContext", () => ({
  useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),
  DataModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/DisplayModeContext", () => ({
  useDisplayMode: () => ({ displayMode: "full", setDisplayMode: vi.fn() }),
}));

vi.mock("@/contexts/InspectorContext", () => ({
  useInspector: () => ({ inspect: vi.fn(), inspectedEntity: null }),
  InspectorProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user", email: "test@test.com" }, loading: false, signOut: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("DailyPulse Page", () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it("exports a default component", async () => {
    const mod = await import("../DailyPulse");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});
