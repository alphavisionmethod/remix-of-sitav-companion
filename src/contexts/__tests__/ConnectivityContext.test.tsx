import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { ConnectivityProvider, useConnectivity } from "../ConnectivityContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(ConnectivityProvider, null, children);
}

describe("ConnectivityContext", () => {
  it("starts as online", () => {
    const { result } = renderHook(() => useConnectivity(), { wrapper });
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it("provides default values without provider", () => {
    const { result } = renderHook(() => useConnectivity());
    expect(result.current.isOnline).toBe(true);
  });
});
