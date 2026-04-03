import { describe, it, expect } from "vitest";
import {
  evaluateTruthBoundaries,
  getBoundaryRule,
  listProtectedFields,
  isFieldProtected,
  type FieldClaim,
} from "@/lib/services/policy-engine/truth-boundaries.service";
import {
  resolveApprovalRequirements,
  getThresholdsForDomain,
} from "@/lib/services/policy-engine/approval-requirements.service";
import {
  classifyDocument,
  getRedactionRules,
  bulkClassify,
} from "@/lib/services/policy-engine/sensitive-doc-policy.service";
import {
  validateOutboundCommunication,
  getRemainingQuota,
} from "@/lib/services/policy-engine/outbound-comm-policy.service";

describe("Policy Engine — Truth Boundaries", () => {
  it("blocks LLM-sourced data for protected finance fields", () => {
    const claims: FieldClaim[] = [
      { field: "safe-to-spend", domain: "finance", source: "llm", value: 5000 },
    ];
    const result = evaluateTruthBoundaries(claims);
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].severity).toBe("critical");
    expect(result.violations[0].requiredSource).toBe("deterministic");
  });

  it("allows deterministic source for protected fields", () => {
    const claims: FieldClaim[] = [
      { field: "safe-to-spend", domain: "finance", source: "deterministic", value: 5000 },
      { field: "account-balance", domain: "finance", source: "verified-external", value: 14500 },
    ];
    const result = evaluateTruthBoundaries(claims);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("flags source mismatch even for non-LLM", () => {
    const claims: FieldClaim[] = [
      { field: "account-balance", domain: "finance", source: "deterministic", value: 14500 },
    ];
    const result = evaluateTruthBoundaries(claims);
    expect(result.passed).toBe(false);
    expect(result.violations[0].severity).toBe("high");
  });

  it("allows user-input for any field", () => {
    const claims: FieldClaim[] = [
      { field: "safe-to-spend", domain: "finance", source: "user-input", value: 5000 },
    ];
    const result = evaluateTruthBoundaries(claims);
    expect(result.passed).toBe(true);
  });

  it("ignores unprotected fields", () => {
    const claims: FieldClaim[] = [
      { field: "customer-note", domain: "business", source: "llm", value: "Great client" },
    ];
    const result = evaluateTruthBoundaries(claims);
    expect(result.passed).toBe(true);
  });

  it("getBoundaryRule returns correct rule", () => {
    const rule = getBoundaryRule("finance", "tax-estimation");
    expect(rule).toBeDefined();
    expect(rule!.neverFromLLM).toBe(true);
  });

  it("listProtectedFields filters by domain", () => {
    const financeFields = listProtectedFields("finance");
    expect(financeFields.length).toBeGreaterThan(0);
    expect(financeFields.every((f) => f.domain === "finance")).toBe(true);
  });

  it("isFieldProtected identifies protected fields", () => {
    expect(isFieldProtected("finance", "safe-to-spend")).toBe(true);
    expect(isFieldProtected("finance", "random-field")).toBe(false);
  });
});

describe("Policy Engine — Approval Requirements", () => {
  it("requires dual approval for large finance payments", () => {
    const result = resolveApprovalRequirements("finance", "payment", 600000);
    expect(result.requiresApproval).toBe(true);
    expect(result.requiresDualApproval).toBe(true);
  });

  it("requires single approval for medium finance payments", () => {
    const result = resolveApprovalRequirements("finance", "payment", 100000);
    expect(result.requiresApproval).toBe(true);
    expect(result.requiresDualApproval).toBe(false);
  });

  it("auto-approves small finance payments", () => {
    const result = resolveApprovalRequirements("finance", "payment", 3000);
    expect(result.autoApproved).toBe(true);
  });

  it("auto-approves when no threshold matches", () => {
    const result = resolveApprovalRequirements("unknown-domain", "unknown-action");
    expect(result.autoApproved).toBe(true);
    expect(result.matchedThreshold).toBeNull();
  });

  it("getThresholdsForDomain returns domain-specific rules", () => {
    const finance = getThresholdsForDomain("finance");
    expect(finance.length).toBeGreaterThan(0);
    expect(finance.every((t) => t.domain === "finance")).toBe(true);
  });
});

describe("Policy Engine — Sensitive Documents", () => {
  it("classifies tax return content as restricted", () => {
    const result = classifyDocument("This contains SSN 123-45-6789 and tax return data");
    expect(result.isSensitive).toBe(true);
    expect(result.privacyTier).toBe("restricted");
    expect(result.auditRequired).toBe(true);
  });

  it("classifies bank statement content as confidential", () => {
    const result = classifyDocument("Account number 123456789, routing number 021000021");
    expect(result.isSensitive).toBe(true);
    expect(result.privacyTier).toBe("confidential");
  });

  it("returns non-sensitive for regular content", () => {
    const result = classifyDocument("Meeting notes from Tuesday standup");
    expect(result.isSensitive).toBe(false);
  });

  it("classifies by filename too", () => {
    const result = classifyDocument("Some data", "tax return 2024.pdf");
    expect(result.isSensitive).toBe(true);
  });

  it("getRedactionRules returns rules for known types", () => {
    const rules = getRedactionRules("tax-return");
    expect(rules).toBeDefined();
    expect(rules!.fieldsToRedact).toContain("SSN");
  });

  it("bulkClassify handles multiple documents", () => {
    const results = bulkClassify([
      { content: "SSN 123-45-6789" },
      { content: "Regular meeting notes" },
      { content: "bank statement with account number" },
    ]);
    expect(results).toHaveLength(3);
    expect(results[0].isSensitive).toBe(true);
    expect(results[1].isSensitive).toBe(false);
    expect(results[2].isSensitive).toBe(true);
  });
});

describe("Policy Engine — Outbound Communication", () => {
  it("blocks communication when recipient opted out", () => {
    const result = validateOutboundCommunication({
      type: "email",
      recipientId: "r-1",
      sentTodayCount: 0,
      hasOptedOut: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedReasons.some((r) => r.includes("opted out"))).toBe(true);
  });

  it("blocks when daily limit reached", () => {
    const result = validateOutboundCommunication({
      type: "email",
      recipientId: "r-1",
      sentTodayCount: 50,
    });
    expect(result.allowed).toBe(false);
  });

  it("returns remaining quota", () => {
    expect(getRemainingQuota("email", 10)).toBe(40);
    expect(getRemainingQuota("email", 50)).toBe(0);
  });
});
