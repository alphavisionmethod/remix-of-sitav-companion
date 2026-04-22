import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { probeRuntimeTier } from "../runtime-detection";
import { RUNTIME_TIERS, getRuntimeTier, listRuntimeTiers } from "../runtime-tier-model";
import { RuntimeTierProvider, useRuntimeTier } from "../runtime-context";
import React from "react";

describe("Runtime Detection", () => {
  it("probeRuntimeTier returns valid probe object", () => {
    const probe = probeRuntimeTier();
    expect(probe.tier).toBeTruthy();
    expect(["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"]).toContain(probe.tier);
    expect(typeof probe.isAppliance).toBe("boolean");
    expect(typeof probe.isDesktop).toBe("boolean");
    expect(typeof probe.isWeb).toBe("boolean");
    expect(probe.supportsSimulatedShell).toBe(true);
    expect(probe.detectedAt).toBeTruthy();
  });

  it("defaults to WEB_APP in jsdom environment", () => {
    const probe = probeRuntimeTier();
    expect(probe.tier).toBe("WEB_APP");
    expect(probe.isWeb).toBe(true);
  });
});

describe("Runtime Tier Model", () => {
  it("defines 4 tiers", () => {
    expect(RUNTIME_TIERS.length).toBe(4);
  });

  it("getRuntimeTier returns valid definition", () => {
    const def = getRuntimeTier("WEB_APP");
    expect(def.tier).toBe("WEB_APP");
    expect(def.ordinal).toBe(1);
    expect(def.label).toBeTruthy();
  });

  it("listRuntimeTiers returns all 4 tiers", () => {
    const tiers = listRuntimeTiers();
    expect(tiers.length).toBe(4);
  });

  it("throws for unknown tier", () => {
    expect(() => getRuntimeTier("UNKNOWN" as any)).toThrow();
  });
});

describe("RuntimeTierProvider", () => {
  it("renders children", () => {
    const { getByText } = render(
      React.createElement(RuntimeTierProvider, null,
        React.createElement("div", null, "child content")
      )
    );
    expect(getByText("child content")).toBeTruthy();
  });

  it("provides tier through context hook", () => {
    let capturedTier: string | null = null;
    function Consumer() {
      capturedTier = useRuntimeTier();
      return React.createElement("div", null, capturedTier);
    }
    render(
      React.createElement(RuntimeTierProvider, null,
        React.createElement(Consumer)
      )
    );
    expect(capturedTier).toBe("WEB_APP");
  });
});