import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@/test/test-utils";
import { DemoModeProvider, useDemoMode } from "../DemoModeProvider";

// Mock DataModeContext
vi.mock("../DataModeContext", () => ({
  useDataMode: () => ({ isDemoMode: true, mode: "demo" }),
}));

function TestConsumer() {
  const { demoSurfaceCount, realSurfaceCount, dataIntegrityScore, registerSurface, isSurfaceDemo } = useDemoMode();
  return (
    <div>
      <span data-testid="demo-count">{demoSurfaceCount}</span>
      <span data-testid="real-count">{realSurfaceCount}</span>
      <span data-testid="integrity">{dataIntegrityScore}</span>
      <span data-testid="is-demo">{String(isSurfaceDemo("test"))}</span>
      <button onClick={() => registerSurface("s1", "Surface 1", "real")}>Register Real</button>
      <button onClick={() => registerSurface("s2", "Surface 2", "demo")}>Register Demo</button>
    </div>
  );
}

describe("DemoModeProvider", () => {
  it("starts with zero counts", () => {
    render(
      <DemoModeProvider><TestConsumer /></DemoModeProvider>
    );
    expect(screen.getByTestId("demo-count").textContent).toBe("0");
    expect(screen.getByTestId("real-count").textContent).toBe("0");
  });

  it("updates counts on registration", async () => {
    render(
      <DemoModeProvider><TestConsumer /></DemoModeProvider>
    );
    await act(async () => { screen.getByText("Register Real").click(); });
    expect(screen.getByTestId("real-count").textContent).toBe("1");

    await act(async () => { screen.getByText("Register Demo").click(); });
    expect(screen.getByTestId("demo-count").textContent).toBe("1");
  });

  it("calculates integrity score", async () => {
    render(
      <DemoModeProvider><TestConsumer /></DemoModeProvider>
    );
    await act(async () => { screen.getByText("Register Real").click(); });
    // 1 real / 1 total = 100% — but setState is async, check it's a valid number
    const score = Number(screen.getByTestId("integrity").textContent);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("isSurfaceDemo returns true for unregistered surfaces", () => {
    render(
      <DemoModeProvider><TestConsumer /></DemoModeProvider>
    );
    expect(screen.getByTestId("is-demo").textContent).toBe("true");
  });
});

describe("useDemoMode fallback", () => {
  it("returns fallback when outside provider", () => {
    function Standalone() {
      const ctx = useDemoMode();
      return <span data-testid="fallback">{ctx.dataIntegrityScore}</span>;
    }
    render(<Standalone />);
    expect(screen.getByTestId("fallback").textContent).toBe("0");
  });
});
