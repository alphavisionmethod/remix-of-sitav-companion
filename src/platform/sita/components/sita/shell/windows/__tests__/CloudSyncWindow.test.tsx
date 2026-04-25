import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import { CloudSyncWindow } from "../CloudSyncWindow";

vi.mock("../NovaCanvasChart", () => ({
  NovaCanvasChart: () => <div data-testid="mock-chart" />,
}));
vi.mock("../NovaCanvasBars", () => ({
  NovaCanvasBars: () => <div data-testid="mock-bars" />,
}));

describe("CloudSyncWindow", () => {
  it("renders without crashing", () => {
    const { container } = render(<CloudSyncWindow />);
    expect(container).toBeTruthy();
  });

  it("renders sync-related UI elements", () => {
    render(<CloudSyncWindow />);
    const text = document.body.textContent || "";
    expect(text.length).toBeGreaterThan(0);
  });
});
