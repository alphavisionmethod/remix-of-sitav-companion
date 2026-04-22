import { describe, it, expect } from "vitest";
import { canonicalIntentOrchestrator } from "../intent/intent-orchestrator";
import { createOrchestrationEnvelope } from "../shared/orchestration-envelope";
import { createDefaultContext } from "../shared/orchestration-context";

function makeEnvelope(intentRaw: string) {
  return createOrchestrationEnvelope({
    sourceSurface: "test",
    sourceUserId: "u1",
    domain: "cross-domain",
    capabilityId: "auto-detect",
    intentRaw,
  });
}

const ctx = createDefaultContext("u1");

describe("CanonicalIntentOrchestrator", () => {
  it("classifies financial intent correctly", async () => {
    const result = await canonicalIntentOrchestrator.resolveIntent(makeEnvelope("pay the invoice"), ctx);
    expect(result.intentState?.classification).toBe("financial");
    expect(result.intentState?.resolvedDomain).toBe("finance");
    expect(result.intentState?.riskTier).toBe("critical");
  });

  it("classifies approval intent as elevated risk", async () => {
    const result = await canonicalIntentOrchestrator.resolveIntent(makeEnvelope("approve this request"), ctx);
    expect(result.intentState?.classification).toBe("approval");
    expect(result.intentState?.riskTier).toBe("elevated");
  });

  it("classifies query intent as standard risk", async () => {
    const result = await canonicalIntentOrchestrator.resolveIntent(makeEnvelope("what is my balance"), ctx);
    expect(result.intentState?.classification).toBe("query");
    expect(result.intentState?.riskTier).toBe("standard");
  });

  it("falls back to query/cross-domain for unmatched input", async () => {
    const result = await canonicalIntentOrchestrator.resolveIntent(makeEnvelope("foobar baz"), ctx);
    expect(result.intentState?.classification).toBe("query");
    expect(result.domain).toBe("cross-domain");
  });

  it("populates all intentState fields", async () => {
    const result = await canonicalIntentOrchestrator.resolveIntent(makeEnvelope("schedule a meeting"), ctx);
    const state = result.intentState!;
    expect(state.classification).toBeTruthy();
    expect(state.resolvedDomain).toBeTruthy();
    expect(state.resolvedCapability).toBeTruthy();
    expect(state.riskTier).toBeTruthy();
    expect(state.confidenceScore).toBeGreaterThan(0);
    expect(typeof state.escalationRequired).toBe("boolean");
    expect(state.recommendationIds).toBeInstanceOf(Array);
  });

  it("throws on empty intent", async () => {
    await expect(
      canonicalIntentOrchestrator.resolveIntent(makeEnvelope(""), ctx)
    ).rejects.toThrow("Empty intent");
  });
});