import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoModeBadge } from "../DemoModeBadge";

// Mock DataModeContext
const mockIsDemoMode = vi.fn().mockReturnValue(true);
vi.mock("@/contexts/DataModeContext", () => ({
  useDataMode: () => ({
    isDemoMode: mockIsDemoMode(),
    mode: mockIsDemoMode() ? "demo" : "live",
    isLiveMode: !mockIsDemoMode(),
    toggleMode: vi.fn(),
    setMode: vi.fn(),
    connectors: [],
    refreshConnectors: vi.fn(),
  }),
  DataModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("DemoModeBadge", () => {
  it("renders in demo mode", () => {
    mockIsDemoMode.mockReturnValue(true);
    render(<DemoModeBadge />);
    expect(screen.getByText("Demo Mode")).toBeInTheDocument();
  });

  it("hides in live mode without forceShow", () => {
    mockIsDemoMode.mockReturnValue(false);
    const { container } = render(<DemoModeBadge />);
    // Component returns null when not demo mode — the container div remains but has no children
    expect(container.querySelector("[data-testid='demo-mode-badge']")).toBeNull();
  });

  it("shows with forceShow even in live mode", () => {
    mockIsDemoMode.mockReturnValue(false);
    render(<DemoModeBadge forceShow />);
    expect(screen.getByText("Demo Mode")).toBeInTheDocument();
  });

  it("shows custom label", () => {
    mockIsDemoMode.mockReturnValue(true);
    render(<DemoModeBadge label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders compact mode (icon only)", () => {
    mockIsDemoMode.mockReturnValue(true);
    const { container } = render(<DemoModeBadge compact />);
    expect(container.querySelector("span")).toBeInTheDocument();
    expect(screen.queryByText("Demo Mode")).not.toBeInTheDocument();
  });
});
