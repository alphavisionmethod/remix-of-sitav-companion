// ═══════════════════════════════════════════════════════════════
// Business OS — AutopilotHub Page-State Honesty
// Verifies AutopilotHub correctly surfaces:
//   loading → PageSkeleton
//   error   → "Autopilot unavailable" + retry
//   live mode + no userId → "requires sign-in"
//   not onboarded → wizard ("Setup")
//   ready + onboarded → command center copy
// Drives the page by mocking the canonical use-autopilot-config hook.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderBusinessPage } from "../_helpers/render-business-page";

// Hook return state — mutable across tests.
const hookState: {
  data: unknown;
  state: "loading" | "error" | "ready" | "empty";
  error: Error | null;
  userId: string | null;
  mode: "demo" | "live";
} = {
  data: null,
  state: "loading",
  error: null,
  userId: "user-1",
  mode: "demo",
};

vi.mock("@/hooks/use-autopilot-config", () => ({
  useAutopilotConfig: () => ({
    ...hookState,
    isLoading: hookState.state === "loading",
    isError: hookState.state === "error",
    isEmpty: hookState.state === "empty",
    isReady: hookState.state === "ready",
    refetch: vi.fn(),
  }),
  useCompleteAutopilotWizard: () => ({ mutate: vi.fn() }),
  useSaveAutopilotConfig: () => ({ mutate: vi.fn() }),
  useSkipAutopilotWizard: () => ({ mutate: vi.fn() }),
  autopilotConfigQueryKey: () => ["autopilot-config"],
}));

// Stub the heavy wizard / command center children — we are testing the
// page-state branching, not the children's internals.
vi.mock("@/platform/orchestration/components/autopilot/AutopilotWizard", () => ({
  __esModule: true,
  default: () => <div data-testid="autopilot-wizard">Wizard</div>,
}));
vi.mock("@/platform/orchestration/components/autopilot/AutopilotCommandCenter", () => ({
  __esModule: true,
  default: () => <div data-testid="autopilot-command-center">Command Center</div>,
}));

// Isolate from a downstream icon-rendering quirk in EmptyState (lucide
// forwardRef icons are objects, not functions; EmptyState's `typeof
// iconProp === "function"` check then attempts to render an object as a
// React child). We assert the page-state *branch* — title + action — not
// the icon implementation.
vi.mock("@/platform/sita/components/sita/EmptyStateCard", () => ({
  __esModule: true,
  EmptyStateCard: ({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) => (
    <div data-testid="empty-state-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  ),
  LegacyEmptyStateCard: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

// Lazy import after mocks.
import AutopilotHubPage from "@/modules/business/pages/AutopilotHub";

describe("AutopilotHub — page-state honesty", () => {
  beforeEach(() => {
    hookState.data = null;
    hookState.state = "loading";
    hookState.error = null;
    hookState.userId = "user-1";
    hookState.mode = "demo";
  });

  it("renders skeleton while loading", () => {
    hookState.state = "loading";
    renderBusinessPage(<AutopilotHubPage />);
    // Wizard / command center MUST NOT be rendered while loading.
    expect(screen.queryByTestId("autopilot-wizard")).not.toBeInTheDocument();
    expect(screen.queryByTestId("autopilot-command-center")).not.toBeInTheDocument();
  });

  it("renders error state with retry when state is error", () => {
    hookState.state = "error";
    hookState.error = new Error("Backend unavailable");
    renderBusinessPage(<AutopilotHubPage />);
    expect(screen.getByText(/Autopilot unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders sign-in required when in live mode without userId", () => {
    hookState.state = "ready";
    hookState.mode = "live";
    hookState.userId = null;
    hookState.data = { isOnboarded: false, config: {}, source: "default", updatedAt: null };
    renderBusinessPage(<AutopilotHubPage />);
    expect(screen.getByText(/requires sign-in/i)).toBeInTheDocument();
  });

  it("renders the wizard when authenticated but not onboarded", () => {
    hookState.state = "ready";
    hookState.mode = "demo";
    hookState.data = { isOnboarded: false, config: {}, source: "default", updatedAt: null };
    renderBusinessPage(<AutopilotHubPage />);
    expect(screen.getByTestId("autopilot-wizard")).toBeInTheDocument();
    // Command center MUST NOT show when in setup/wizard mode.
    expect(screen.queryByTestId("autopilot-command-center")).not.toBeInTheDocument();
  });

  it("renders the command center when onboarded", () => {
    hookState.state = "ready";
    hookState.mode = "demo";
    hookState.data = {
      isOnboarded: true,
      config: { activePlaybooks: [], approvalMode: "supervised" },
      source: "demo",
      updatedAt: null,
    };
    renderBusinessPage(<AutopilotHubPage />);
    expect(screen.getByTestId("autopilot-command-center")).toBeInTheDocument();
    // Wizard MUST NOT show in onboarded state (unless user re-opened it).
    expect(screen.queryByTestId("autopilot-wizard")).not.toBeInTheDocument();
  });
});