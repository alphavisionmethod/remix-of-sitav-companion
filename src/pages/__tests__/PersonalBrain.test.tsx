import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" }, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: { response: "test" }, error: null }) },
    from: () => ({ select: () => ({ data: [], error: null }) }),
  },
}));

describe("PersonalBrain Page", () => {
  it("exports a default component", async () => {
    const mod = await import("../PersonalBrain");
    expect(mod.default).toBeDefined();
  });

  it("renders chat interface", async () => {
    const PersonalBrain = (await import("../PersonalBrain")).default;
    const { container } = render(
      <MemoryRouter>
        <PersonalBrain />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeTruthy();
    // Should have a textarea for input
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeTruthy();
  });

  it("renders mode selector buttons", async () => {
    const PersonalBrain = (await import("../PersonalBrain")).default;
    const { container } = render(
      <MemoryRouter>
        <PersonalBrain />
      </MemoryRouter>
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
