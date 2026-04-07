import { describe, it, expect, vi } from "vitest";

describe("Hook Tests - useDataMode", () => {
  it("returns isDemoMode true by default (mocked)", async () => {
    const { useDataMode } = await import("@/contexts/DataModeContext");
    const result = useDataMode();
    expect(result.isDemoMode).toBe(true);
  });
});

describe("Hook Tests - useAuth", () => {
  it("returns null user when not authenticated (mocked)", async () => {
    const { useAuth } = await import("@/contexts/AuthContext");
    const result = useAuth();
    expect(result.user).toBeNull();
    expect(result.loading).toBe(false);
  });
});
