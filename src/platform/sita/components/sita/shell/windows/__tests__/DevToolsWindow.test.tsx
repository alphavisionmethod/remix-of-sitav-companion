import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@/test/test-utils";
import { DevToolsWindow } from "../DevToolsWindow";

vi.mock("../NovaCanvasChart", () => ({
  NovaCanvasChart: () => <div data-testid="mock-chart" />,
}));
vi.mock("../NovaCanvasBars", () => ({
  NovaCanvasBars: () => <div data-testid="mock-bars" />,
}));

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
});

describe("DevToolsWindow", () => {
  it("renders without crashing", () => {
    const { container } = render(<DevToolsWindow />);
    expect(container).toBeTruthy();
  });

  it("renders developer tools content", () => {
    render(<DevToolsWindow />);
    const text = document.body.textContent || "";
    expect(text.length).toBeGreaterThan(0);
  });
});
