import { describe, it, expect, vi } from "vitest";
import { evaluateStaleness, getStaleSourceNames, shouldBlockOnStaleness } from "../staleness";

function makeSource(domain: string, hoursAgo: number) {
  return {
    id: `src-${domain}`,
    name: `${domain}-source`,
    domain,
    lastUpdated: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
  };
}

describe("evaluateStaleness", () => {
  it("marks all sources as fresh when recently updated", () => {
    const state = evaluateStaleness([makeSource("business", 1)]);
    expect(state.overallFreshness).toBe("fresh");
    expect(state.sources[0].isStale).toBe(false);
  });

  it("marks source as stale when exceeding domain threshold", () => {
    // finance threshold is 4h
    const state = evaluateStaleness([makeSource("finance", 5)]);
    expect(state.sources[0].isStale).toBe(true);
  });

  it("uses default threshold for unknown domains", () => {
    // default is 24h
    const state = evaluateStaleness([makeSource("unknown", 10)]);
    expect(state.sources[0].isStale).toBe(false);
    const state2 = evaluateStaleness([makeSource("unknown", 25)]);
    expect(state2.sources[0].isStale).toBe(true);
  });

  it("returns critical when >50% sources stale", () => {
    const state = evaluateStaleness([
      makeSource("finance", 5), // stale (4h threshold)
      makeSource("trust", 2),   // stale (1h threshold)
      makeSource("business", 1), // fresh
    ]);
    expect(state.overallFreshness).toBe("critical");
  });

  it("returns stale when some but <50% are stale", () => {
    const state = evaluateStaleness([
      makeSource("finance", 5), // stale
      makeSource("business", 1), // fresh
      makeSource("concierge", 1), // fresh
    ]);
    expect(state.overallFreshness).toBe("stale");
  });

  it("returns aging when >50% sources exceed 70% of threshold", () => {
    // business threshold=24h, 70%=16.8h → 18h is aging but not stale
    const state = evaluateStaleness([
      makeSource("business", 18),
      makeSource("business", 20),
    ]);
    expect(state.overallFreshness).toBe("aging");
  });

  it("supports custom threshold overrides", () => {
    const state = evaluateStaleness(
      [makeSource("business", 2)],
      { "src-business": 1 * 3600000 } // 1h override
    );
    expect(state.sources[0].isStale).toBe(true);
  });

  it("returns critical for empty sources array", () => {
    const state = evaluateStaleness([]);
    expect(state.overallFreshness).toBe("critical");
  });
});

describe("getStaleSourceNames", () => {
  it("returns names of stale sources only", () => {
    const state = evaluateStaleness([makeSource("finance", 5), makeSource("business", 1)]);
    const names = getStaleSourceNames(state);
    expect(names).toContain("finance-source");
    expect(names).not.toContain("business-source");
  });
});

describe("shouldBlockOnStaleness", () => {
  it("blocks when overall freshness is critical", () => {
    const state = evaluateStaleness([makeSource("finance", 5), makeSource("trust", 2)]);
    expect(shouldBlockOnStaleness(state)).toBe(true);
  });

  it("does not block when freshness is stale but not critical", () => {
    const state = evaluateStaleness([makeSource("finance", 5), makeSource("business", 1), makeSource("concierge", 1)]);
    expect(shouldBlockOnStaleness(state)).toBe(false);
  });
});
