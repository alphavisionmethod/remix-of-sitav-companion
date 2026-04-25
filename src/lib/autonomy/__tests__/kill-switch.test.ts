import { describe, it, expect } from "vitest";
import { shouldHalt, type KillSwitchStatus } from "../kill-switch";

const inactive: KillSwitchStatus = {
  engaged: false,
  reason: null,
  domainScope: null,
  engagedAt: null,
};

const globalHalt: KillSwitchStatus = {
  engaged: true,
  reason: "test",
  domainScope: null,
  engagedAt: new Date().toISOString(),
};

const financeHalt: KillSwitchStatus = {
  engaged: true,
  reason: "test",
  domainScope: "finance",
  engagedAt: new Date().toISOString(),
};

describe("shouldHalt", () => {
  it("never halts when not engaged", () => {
    expect(shouldHalt(inactive)).toBe(false);
    expect(shouldHalt(inactive, "finance")).toBe(false);
  });

  it("global halt blocks every domain", () => {
    expect(shouldHalt(globalHalt)).toBe(true);
    expect(shouldHalt(globalHalt, "finance")).toBe(true);
    expect(shouldHalt(globalHalt, "inbox")).toBe(true);
  });

  it("domain-scoped halt only blocks the matching domain", () => {
    expect(shouldHalt(financeHalt, "finance")).toBe(true);
    expect(shouldHalt(financeHalt, "inbox")).toBe(false);
    expect(shouldHalt(financeHalt, "calendar")).toBe(false);
  });

  it("domain-scoped halt blocks unknown domain calls (safe default)", () => {
    expect(shouldHalt(financeHalt)).toBe(true);
    expect(shouldHalt(financeHalt, null)).toBe(true);
  });
});