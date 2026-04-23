import { describe, it, expect } from "vitest";

// Test the defaultEmptyCheck logic directly
function defaultEmptyCheck<T>(data: T): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object") return Object.keys(data as object).length === 0;
  return !data;
}

describe("usePageData emptyCheck", () => {
  it("treats null as empty", () => {
    expect(defaultEmptyCheck(null)).toBe(true);
  });

  it("treats undefined as empty", () => {
    expect(defaultEmptyCheck(undefined)).toBe(true);
  });

  it("treats empty array as empty", () => {
    expect(defaultEmptyCheck([])).toBe(true);
  });

  it("treats populated array as non-empty", () => {
    expect(defaultEmptyCheck([1, 2])).toBe(false);
  });

  it("treats empty object as empty", () => {
    expect(defaultEmptyCheck({})).toBe(true);
  });

  it("treats populated object as non-empty", () => {
    expect(defaultEmptyCheck({ key: "value" })).toBe(false);
  });

  it("treats empty string as empty", () => {
    expect(defaultEmptyCheck("")).toBe(true);
  });

  it("treats non-empty string as non-empty", () => {
    expect(defaultEmptyCheck("data")).toBe(false);
  });

  it("treats zero as empty (falsy)", () => {
    expect(defaultEmptyCheck(0)).toBe(true);
  });

  it("treats positive number as non-empty", () => {
    expect(defaultEmptyCheck(42)).toBe(false);
  });
});