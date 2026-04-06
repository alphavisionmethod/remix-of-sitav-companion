import { describe, it, expect } from "vitest";

// The reality provider is a pattern used across hooks - test the resolve logic
describe("Reality provider pattern", () => {
  function resolveByMode<T>(isDemoMode: boolean, demoData: T, liveData: T | undefined): T {
    return isDemoMode ? demoData : (liveData ?? demoData);
  }

  it("returns demo data in demo mode", () => {
    expect(resolveByMode(true, [1, 2, 3], [4, 5])).toEqual([1, 2, 3]);
  });

  it("returns live data in live mode when available", () => {
    expect(resolveByMode(false, [1, 2, 3], [4, 5])).toEqual([4, 5]);
  });

  it("falls back to demo data when live data is undefined", () => {
    expect(resolveByMode(false, [1, 2, 3], undefined)).toEqual([1, 2, 3]);
  });

  it("returns empty array when live data is empty array", () => {
    expect(resolveByMode(false, [1, 2, 3], [])).toEqual([]);
  });
});
