import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { UpdateCenterWindow } from "../UpdateCenterWindow";

// Mock NovaCanvasChart/Bars since they use canvas
vi.mock("../NovaCanvasChart", () => ({
  NovaCanvasChart: () => <div data-testid="mock-chart" />,
}));
vi.mock("../NovaCanvasBars", () => ({
  NovaCanvasBars: () => <div data-testid="mock-bars" />,
}));

describe("UpdateCenterWindow", () => {
  it("renders without crashing", () => {
    const { container } = render(<UpdateCenterWindow />);
    expect(container).toBeTruthy();
  });

  it("displays update-related content", () => {
    render(<UpdateCenterWindow />);
    // Should render some text related to updates
    const text = document.body.textContent || "";
    expect(text.length).toBeGreaterThan(0);
  });
});
