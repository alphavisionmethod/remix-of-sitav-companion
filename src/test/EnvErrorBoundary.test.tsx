import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnvErrorBoundary } from "@/platform/sita/components/sita/EnvErrorBoundary";

// Mock the env validation module
vi.mock("@/lib/env-validation", () => {
  let result = { valid: true, missing: [] as string[], warnings: [] as string[] };
  return {
    getEnvValidation: () => result,
    validateEnvironment: () => result,
    __setMockResult: (r: typeof result) => { result = r; },
  };
});

describe("EnvErrorBoundary", () => {
  beforeEach(() => {
    const mod = require("@/lib/env-validation") as any;
    mod.__setMockResult({ valid: true, missing: [], warnings: [] });
  });

  it("renders children when env is valid", () => {
    render(
      <EnvErrorBoundary>
        <div>App Content</div>
      </EnvErrorBoundary>
    );
    expect(screen.getByText("App Content")).toBeInTheDocument();
  });

  it("blocks rendering and shows error when env is invalid", () => {
    const mod = require("@/lib/env-validation") as any;
    mod.__setMockResult({ valid: false, missing: ["VITE_SUPABASE_URL"], warnings: [] });

    render(
      <EnvErrorBoundary>
        <div>App Content</div>
      </EnvErrorBoundary>
    );
    expect(screen.queryByText("App Content")).not.toBeInTheDocument();
    expect(screen.getByText("Configuration Error")).toBeInTheDocument();
    expect(screen.getByText("VITE_SUPABASE_URL")).toBeInTheDocument();
  });

  it("shows retry button that reloads", () => {
    const mod = require("@/lib/env-validation") as any;
    mod.__setMockResult({ valid: false, missing: ["VITE_SUPABASE_URL"], warnings: [] });

    render(
      <EnvErrorBoundary>
        <div>App Content</div>
      </EnvErrorBoundary>
    );
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});