import { describe, it, expect } from "vitest";
import { getModeDefinition, isRealMode, isDemoMode, isSideEffectSafe, CANONICAL_MODES } from "../reality-mode-registry";

describe("RealityModeRegistry", () => {
  it("getModeDefinition returns real mode", () => {
    const def = getModeDefinition("real");
    expect(def.key).toBe("real");
    expect(def.launchHonestyClass).toBe("truthful");
    expect(def.sideEffects.externalWritesAllowed).toBe(true);
  });

  it("getModeDefinition returns demo mode", () => {
    const def = getModeDefinition("demo");
    expect(def.key).toBe("demo");
    expect(def.sideEffects.externalWritesAllowed).toBe(false);
    expect(def.aiPolicy).toBe("cached_only");
  });

  it("isRealMode identifies real", () => {
    expect(isRealMode("real")).toBe(true);
    expect(isRealMode("demo")).toBe(false);
  });

  it("isDemoMode identifies demo and dev_demo", () => {
    expect(isDemoMode("demo")).toBe(true);
    expect(isDemoMode("dev_demo")).toBe(true);
    expect(isDemoMode("real")).toBe(false);
    expect(isDemoMode("sandbox")).toBe(false);
  });

  it("isSideEffectSafe for non-real modes", () => {
    expect(isSideEffectSafe("demo")).toBe(true);
    expect(isSideEffectSafe("sandbox")).toBe(true);
    expect(isSideEffectSafe("real")).toBe(false);
  });

  it("all four modes are defined", () => {
    expect(Object.keys(CANONICAL_MODES)).toHaveLength(4);
    expect(CANONICAL_MODES.real).toBeDefined();
    expect(CANONICAL_MODES.demo).toBeDefined();
    expect(CANONICAL_MODES.sandbox).toBeDefined();
    expect(CANONICAL_MODES.dev_demo).toBeDefined();
  });
});
