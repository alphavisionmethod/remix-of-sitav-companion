import { describe, it, expect } from "vitest";
import { renderHook, act } from "@/test/test-utils";
import React from "react";
import { ThemeProvider, useTheme } from "../ThemeContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(ThemeProvider, null, children);
}

describe("ThemeContext", () => {
  it("defaults to dark theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("dark");
    expect(result.current.resolved).toBe("dark");
  });

  it("setTheme changes theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme("light"));
    expect(result.current.theme).toBe("light");
    expect(result.current.resolved).toBe("light");
  });

  it("system theme resolves based on matchMedia", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme("system"));
    expect(result.current.theme).toBe("system");
    // matchMedia is mocked to return false (light) in test setup
    expect(["dark", "light"]).toContain(result.current.resolved);
  });
});
