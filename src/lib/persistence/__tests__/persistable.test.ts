import { describe, it, expect } from "vitest";
import { isPersistable, serializeMap, hydrateMap } from "../persistable";

describe("isPersistable", () => {
  it("returns true for objects with serialize and hydrate", () => {
    const obj = { serialize: () => ({}), hydrate: () => {} };
    expect(isPersistable(obj)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isPersistable(null)).toBe(false);
  });

  it("returns false for objects missing methods", () => {
    expect(isPersistable({ serialize: () => ({}) })).toBe(false);
    expect(isPersistable({ hydrate: () => {} })).toBe(false);
    expect(isPersistable({})).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isPersistable("string")).toBe(false);
    expect(isPersistable(42)).toBe(false);
  });
});

describe("serializeMap", () => {
  it("converts Map to array of entries", () => {
    const map = new Map([["a", 1], ["b", 2]]);
    const result = serializeMap(map);
    expect(result).toEqual([["a", 1], ["b", 2]]);
  });

  it("handles empty map", () => {
    expect(serializeMap(new Map())).toEqual([]);
  });
});

describe("hydrateMap", () => {
  it("converts array of entries back to Map", () => {
    const entries: [string, number][] = [["a", 1], ["b", 2]];
    const map = hydrateMap(entries);
    expect(map.get("a")).toBe(1);
    expect(map.get("b")).toBe(2);
    expect(map.size).toBe(2);
  });

  it("handles empty array", () => {
    expect(hydrateMap([]).size).toBe(0);
  });
});
