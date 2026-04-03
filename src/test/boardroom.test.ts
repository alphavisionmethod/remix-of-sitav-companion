import { describe, it, expect } from "vitest";
import { scoreConfidence, detectStaleData, generatePacketHash } from "@/lib/boardroom/confidence";
import type { BoardroomType, DataSource } from "@/lib/boardroom/types";

describe("Boardroom System", () => {
  it("scores confidence for a packet", () => {
    const score = scoreConfidence({ domainConfidences: [0.9, 0.85, 0.7], sourceCount: 5, staleWarningCount: 0, completenessRatio: 0.9 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("detects stale data sources", () => {
    const sources: DataSource[] = [
      { id: "ds-1", name: "Business", domain: "business", lastUpdated: new Date(Date.now() - 48 * 3600000).toISOString(), recordCount: 10 },
    ];
    const warnings = detectStaleData(sources, "morning-briefing");
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("generates a packet hash", () => {
    const hash = generatePacketHash("PKT-001", new Date().toISOString(), 5);
    expect(hash).toMatch(/^sha256:/);
  });
});
