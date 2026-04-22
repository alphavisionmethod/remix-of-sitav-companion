import { describe, it, expect } from "vitest";
import {
  API_VERSION_REGISTRY,
  EDGE_FUNCTION_NAMES,
  resolveApiVersion,
  isVersionDeprecated,
  getVersionHeaders,
} from "../api-versioning";

describe("API Versioning System", () => {
  it("registry covers all declared edge functions", () => {
    expect(API_VERSION_REGISTRY.length).toBe(EDGE_FUNCTION_NAMES.length);
    for (const name of EDGE_FUNCTION_NAMES) {
      const entry = API_VERSION_REGISTRY.find(e => e.functionName === name);
      expect(entry, `Missing registry entry for ${name}`).toBeDefined();
    }
  });

  it("registry has no duplicate function names", () => {
    const names = API_VERSION_REGISTRY.map(e => e.functionName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("registry has >190 edge functions", () => {
    expect(API_VERSION_REGISTRY.length).toBeGreaterThan(190);
  });

  it("resolveApiVersion returns current version when none requested", () => {
    const version = resolveApiVersion("ai-gateway");
    expect(version).toBe("1.0.0");
  });

  it("resolveApiVersion returns requested version if >= minimum", () => {
    const version = resolveApiVersion("ai-gateway", "1.0.0");
    expect(version).toBe("1.0.0");
  });

  it("resolveApiVersion throws for version below minimum", () => {
    expect(() => resolveApiVersion("ai-gateway", "0.9.0")).toThrow(
      /below minimum/
    );
  });

  it("resolveApiVersion throws for unknown function", () => {
    expect(() => resolveApiVersion("nonexistent-function")).toThrow(
      /Unknown edge function/
    );
  });

  it("isVersionDeprecated returns false for active functions", () => {
    expect(isVersionDeprecated("personal-brain")).toBe(false);
  });

  it("getVersionHeaders returns correct header", () => {
    const headers = getVersionHeaders("health-check");
    expect(headers).toEqual({ "X-API-Version": "1.0.0" });
  });

  it("every entry has valid semver format", () => {
    const semverRe = /^\d+\.\d+\.\d+$/;
    for (const entry of API_VERSION_REGISTRY) {
      expect(entry.currentVersion).toMatch(semverRe);
      expect(entry.minimumVersion).toMatch(semverRe);
    }
  });
});