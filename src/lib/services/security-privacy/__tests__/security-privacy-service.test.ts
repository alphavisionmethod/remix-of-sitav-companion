// ═══════════════════════════════════════════════════════════════
// SITA OS — Unit Tests: Security & Privacy Service
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ data: [], error: null }) }) },
}));

describe("Security & Privacy Service", () => {
  it("computes score with all checks", async () => {
    const { computeSecurityPrivacyIndex } = await import("@/lib/services/security-privacy/security-privacy-service");
    const result = await computeSecurityPrivacyIndex();

    expect(result.score).toBe(100);
    expect(result.checks.length).toBe(11);
    expect(result.detail).toContain("11/11");
  });

  it("all checks have required fields", async () => {
    const { computeSecurityPrivacyIndex } = await import("@/lib/services/security-privacy/security-privacy-service");
    const result = await computeSecurityPrivacyIndex();

    for (const check of result.checks) {
      expect(check.key).toBeTruthy();
      expect(check.label).toBeTruthy();
      expect(typeof check.passed).toBe("boolean");
      expect(typeof check.weight).toBe("number");
      expect(check.weight).toBeGreaterThan(0);
      expect(check.detail).toBeTruthy();
    }
  });

  it("weights sum to 100", async () => {
    const { computeSecurityPrivacyIndex } = await import("@/lib/services/security-privacy/security-privacy-service");
    const result = await computeSecurityPrivacyIndex();
    const totalWeight = result.checks.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it("score cannot exceed 100", async () => {
    const { computeSecurityPrivacyIndex } = await import("@/lib/services/security-privacy/security-privacy-service");
    const result = await computeSecurityPrivacyIndex();
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
