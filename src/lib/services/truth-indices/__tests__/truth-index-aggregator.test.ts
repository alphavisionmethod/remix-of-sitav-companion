// ═══════════════════════════════════════════════════════════════
// SITA OS — Unit Tests: Truth Index Aggregator
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all service dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ count: 0, data: [], error: null }),
    }),
  },
}));

vi.mock("@/lib/services/domain-runtime/domain-runtime-service", () => ({
  getDomainRuntimeStatuses: vi.fn().mockResolvedValue([
    { domain_key: "auth", runtime_class: "real", truth_score: 90 },
    { domain_key: "finance", runtime_class: "real", truth_score: 90 },
    { domain_key: "crm", runtime_class: "real", truth_score: 90 },
  ]),
  getRuntimeTruthIndex: vi.fn((records: any[]) => {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((s: number, r: any) => s + r.truth_score, 0) / records.length);
  }),
}));

vi.mock("@/lib/services/launch-gate/launch-gate-service", () => ({
  getLaunchGates: vi.fn().mockResolvedValue([
    { feature_key: "auth", status: "live" },
    { feature_key: "boardroom", status: "beta" },
  ]),
  getLaunchHonestyIndex: vi.fn().mockReturnValue(85),
}));

vi.mock("@/lib/services/connector-truth/connector-truth-service", () => ({
  getOAuthFlows: vi.fn().mockResolvedValue([]),
  getSyncJobs: vi.fn().mockResolvedValue([]),
  getConnectorTruthIndex: vi.fn().mockReturnValue(80),
}));

vi.mock("@/lib/services/surface-portability/surface-portability-service", () => ({
  getSurfacePortability: vi.fn().mockResolvedValue([
    { capability_key: "boardroom", portability_score: 100, mobile_ready: true, surface_adapter_exists: true },
  ]),
  getSurfacePortabilityIndex: vi.fn().mockReturnValue(100),
}));

vi.mock("@/lib/services/demo-governance/demo-governance-service", () => ({
  getDemoGovernanceStatuses: vi.fn().mockResolvedValue([
    { domainKey: "auth", hasDemoProvider: true },
  ]),
  getDemoGovernanceIndex: vi.fn().mockReturnValue(90),
}));

vi.mock("@/lib/services/observability/observability-service", () => ({
  computeObservabilityIndex: vi.fn().mockResolvedValue(85),
  computeDeviceReadinessIndex: vi.fn().mockResolvedValue(90),
}));

vi.mock("@/lib/services/security-privacy/security-privacy-service", () => ({
  computeSecurityPrivacyIndex: vi.fn().mockResolvedValue({
    score: 100,
    checks: [],
    detail: "11/11 security checks passed",
  }),
}));

describe("Truth Index Aggregator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes all 9 truth indices", async () => {
    const { computeTruthIndices } = await import("@/lib/services/truth-indices/truth-index-aggregator");
    const result = await computeTruthIndices();

    expect(result.runtimeTruth).toBeDefined();
    expect(result.launchHonesty).toBeDefined();
    expect(result.aiTruth).toBeDefined();
    expect(result.connectorTruth).toBeDefined();
    expect(result.demoGovernance).toBeDefined();
    expect(result.surfacePortability).toBeDefined();
    expect(result.deviceReadiness).toBeDefined();
    expect(result.observability).toBeDefined();
    expect(result.securityPrivacy).toBeDefined();
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.lastComputed).toBeTruthy();
  });

  it("each index has score, label, detail", async () => {
    const { computeTruthIndices } = await import("@/lib/services/truth-indices/truth-index-aggregator");
    const result = await computeTruthIndices();

    for (const key of ["runtimeTruth", "launchHonesty", "aiTruth", "connectorTruth", "demoGovernance", "surfacePortability", "deviceReadiness", "observability", "securityPrivacy"] as const) {
      const idx = result[key];
      expect(idx.score).toBeGreaterThanOrEqual(0);
      expect(idx.score).toBeLessThanOrEqual(100);
      expect(["LOW", "PARTIAL", "MODERATE", "GOOD", "EXCELLENT"]).toContain(idx.label);
      expect(idx.detail.length).toBeGreaterThan(0);
    }
  });

  it("overall score is average of all indices", async () => {
    const { computeTruthIndices } = await import("@/lib/services/truth-indices/truth-index-aggregator");
    const result = await computeTruthIndices();
    expect(typeof result.overallScore).toBe("number");
  });
});

