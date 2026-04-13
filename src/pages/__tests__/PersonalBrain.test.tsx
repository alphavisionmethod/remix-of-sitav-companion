import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { DemoModeProvider } from "@/contexts/DemoModeProvider";
import { useDataMode } from "@/contexts/DataModeContext";

Element.prototype.scrollIntoView = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
    })),
    functions: { invoke: vi.fn().mockResolvedValue({ data: { response: "test" }, error: null }) },
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" }, loading: false, signOut: vi.fn() }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <DataModeProvider>
    <DemoModeProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </DemoModeProvider>
  </DataModeProvider>
);

describe("PersonalBrain Page", () => {
  it("exports a default component", async () => {
    const mod = await import("../PersonalBrain");
    expect(mod.default).toBeDefined();
  });

  it("renders chat interface with textarea", async () => {
    const PersonalBrain = (await import("../PersonalBrain")).default;
    const { container } = render(<PersonalBrain />, { wrapper: Wrapper });
    expect(container.querySelector("textarea")).toBeTruthy();
  });

  it("renders mode selector buttons", async () => {
    const PersonalBrain = (await import("../PersonalBrain")).default;
    const { container } = render(<PersonalBrain />, { wrapper: Wrapper });
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
