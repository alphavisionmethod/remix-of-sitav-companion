import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@/test/test-utils";
import React from "react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), info: vi.fn() } }));

import { DataModeProvider, useDataMode } from "../DataModeContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(DataModeProvider, null, children);
}

describe("DataModeContext", () => {
  it("defaults to demo mode", () => {
    const { result } = renderHook(() => useDataMode(), { wrapper });
    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.isLiveMode).toBe(false);
    expect(result.current.mode).toBe("demo");
  });

  it("toggleMode switches between demo and live", () => {
    const { result } = renderHook(() => useDataMode(), { wrapper });
    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe("live");
    expect(result.current.isLiveMode).toBe(true);
  });

  it("setMode sets specific mode", () => {
    const { result } = renderHook(() => useDataMode(), { wrapper });
    act(() => result.current.setMode("live"));
    expect(result.current.isLiveMode).toBe(true);
  });

  it("provides connectors list", () => {
    const { result } = renderHook(() => useDataMode(), { wrapper });
    expect(result.current.connectors.length).toBeGreaterThan(0);
  });

  it("refreshConnectors updates connector list", () => {
    const { result } = renderHook(() => useDataMode(), { wrapper });
    act(() => result.current.refreshConnectors());
    expect(result.current.connectors.length).toBeGreaterThan(0);
  });
});
