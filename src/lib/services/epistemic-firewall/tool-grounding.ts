// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Tool Grounding
// Strict rules: LLMs must NOT invent deterministic facts
// Math, time, balances, policy state must come from canonical tools
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Grounding Rule Types ───────────────────────────────────────

export type GroundedFieldType =
  | "numeric"
  | "currency"
  | "percentage"
  | "date"
  | "timestamp"
  | "balance"
  | "account-state"
  | "policy-state"
  | "calculation-result"
  | "connector-fact"
  | "kpi-value";

export interface GroundingRule {
  fieldType: GroundedFieldType;
  description: string;
  requiredSource: string;
  blockIfUngrounded: boolean;
  domains: DomainId[];
}

export interface GroundingViolation {
  violationId: string;
  fieldType: GroundedFieldType;
  claimedValue: string;
  source: "llm-weight" | "unknown";
  requiredSource: string;
  rule: GroundingRule;
  severity: "warning" | "block";
  message: string;
}

export interface GroundingCheckResult {
  checkId: string;
  totalFieldsChecked: number;
  violations: GroundingViolation[];
  passed: boolean;
  blockedCount: number;
  warningCount: number;
  domain: DomainId;
  checkedAt: string;
}

// ── Canonical Grounding Rules ──────────────────────────────────

export const GROUNDING_RULES: GroundingRule[] = [
  {
    fieldType: "currency",
    description: "Currency amounts must come from calculations, APIs, or receipts — never LLM weights.",
    requiredSource: "Math.calculate | ConnectorAPI | Receipt",
    blockIfUngrounded: true,
    domains: ["finance", "legal", "general"],
  },
  {
    fieldType: "numeric",
    description: "Numeric values in high-trust domains must be tool-derived.",
    requiredSource: "Math.calculate | KPIEngine | DataQuery",
    blockIfUngrounded: true,
    domains: ["finance", "health"],
  },
  {
    fieldType: "percentage",
    description: "Percentages must be calculated, not estimated from training data.",
    requiredSource: "Math.calculate | KPIEngine",
    blockIfUngrounded: true,
    domains: ["finance"],
  },
  {
    fieldType: "date",
    description: "Current dates/times must come from system clock, not LLM guesses.",
    requiredSource: "Clock.now | SystemTime",
    blockIfUngrounded: true,
    domains: ["finance", "legal", "general", "health"],
  },
  {
    fieldType: "balance",
    description: "Account balances must come from connectors or verified records.",
    requiredSource: "ConnectorAPI.getBalance | VerifiedRecord",
    blockIfUngrounded: true,
    domains: ["finance"],
  },
  {
    fieldType: "account-state",
    description: "Account states must come from provider/connector data.",
    requiredSource: "ConnectorAPI | AccountService",
    blockIfUngrounded: true,
    domains: ["finance", "general"],
  },
  {
    fieldType: "policy-state",
    description: "Policy states (active, expired, etc.) must come from policy engine.",
    requiredSource: "PolicyEngine | AdminService",
    blockIfUngrounded: true,
    domains: ["finance", "legal"],
  },
  {
    fieldType: "calculation-result",
    description: "Financial/tax/KPI calculations must use deterministic engines.",
    requiredSource: "SovereignCalculation | TaxEngine | KPIEngine",
    blockIfUngrounded: true,
    domains: ["finance", "legal"],
  },
  {
    fieldType: "connector-fact",
    description: "Facts about external systems must come from connector sync.",
    requiredSource: "ConnectorAPI | SyncService",
    blockIfUngrounded: false,
    domains: ["general"],
  },
  {
    fieldType: "kpi-value",
    description: "KPI metrics must be computed from actual data, not estimated.",
    requiredSource: "KPIEngine.compute | AnalyticsService",
    blockIfUngrounded: true,
    domains: ["finance", "general"],
  },
];

// ── Grounding Patterns (regex-based detection) ─────────────────

const UNGROUNDED_PATTERNS: Array<{
  pattern: RegExp;
  fieldType: GroundedFieldType;
  label: string;
}> = [
  { pattern: /\$[\d,]+\.?\d*/g, fieldType: "currency", label: "Dollar amount" },
  { pattern: /€[\d,]+\.?\d*/g, fieldType: "currency", label: "Euro amount" },
  { pattern: /£[\d,]+\.?\d*/g, fieldType: "currency", label: "Pound amount" },
  { pattern: /[\d,]+\.?\d*\s*(?:USD|EUR|GBP|CHF)/gi, fieldType: "currency", label: "Currency amount" },
  { pattern: /\b\d{1,3}(?:,\d{3})+(?:\.\d{2})?\b/g, fieldType: "numeric", label: "Large number" },
  { pattern: /\b\d+\.?\d*\s*%/g, fieldType: "percentage", label: "Percentage" },
  { pattern: /\b(?:balance|saldo|kontostand)\s*(?:is|of|:)\s*[\$€£]?[\d,]+/gi, fieldType: "balance", label: "Balance claim" },
];

// ── Grounding Check Engine ─────────────────────────────────────

export function checkGrounding(
  responseText: string,
  domain: DomainId,
  groundedSources: GroundedSource[] = []
): GroundingCheckResult {
  const violations: GroundingViolation[] = [];
  let fieldsChecked = 0;

  const applicableRules = GROUNDING_RULES.filter((r) => r.domains.includes(domain));

  for (const { pattern, fieldType, label } of UNGROUNDED_PATTERNS) {
    const rule = applicableRules.find((r) => r.fieldType === fieldType);
    if (!rule) continue;

    const matches = responseText.matchAll(new RegExp(pattern.source, pattern.flags));
    for (const match of matches) {
      fieldsChecked++;
      const value = match[0];

      // Check if this value has a grounded source
      const isGrounded = groundedSources.some(
        (s) => s.fieldType === fieldType && s.values.includes(normalizeValue(value))
      );

      if (!isGrounded) {
        violations.push({
          violationId: `gv-${Date.now()}-${violations.length}`,
          fieldType,
          claimedValue: value,
          source: "llm-weight",
          requiredSource: rule.requiredSource,
          rule,
          severity: rule.blockIfUngrounded ? "block" : "warning",
          message: `${label} "${value}" appears without tool/evidence backing. Required source: ${rule.requiredSource}`,
        });
      }
    }
  }

  const blockedCount = violations.filter((v) => v.severity === "block").length;

  return {
    checkId: `gc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    totalFieldsChecked: fieldsChecked,
    violations,
    passed: blockedCount === 0,
    blockedCount,
    warningCount: violations.filter((v) => v.severity === "warning").length,
    domain,
    checkedAt: new Date().toISOString(),
  };
}

// ── Grounded Source Registration ───────────────────────────────

export interface GroundedSource {
  sourceId: string;
  fieldType: GroundedFieldType;
  values: string[];
  source: string;
  retrievedAt: string;
}

function normalizeValue(val: string): string {
  return val.replace(/[\s,$€£%]/g, "").toLowerCase();
}

// ── Rule Queries ───────────────────────────────────────────────

export function getGroundingRulesForDomain(domain: DomainId): GroundingRule[] {
  return GROUNDING_RULES.filter((r) => r.domains.includes(domain));
}

export function getBlockingRulesForDomain(domain: DomainId): GroundingRule[] {
  return GROUNDING_RULES.filter((r) => r.domains.includes(domain) && r.blockIfUngrounded);
}

// ── Stats ──────────────────────────────────────────────────────

const groundingLog: GroundingCheckResult[] = [];

export function logGroundingCheck(result: GroundingCheckResult): void {
  groundingLog.push(result);
  if (groundingLog.length > 500) groundingLog.splice(0, groundingLog.length - 500);
}

export function getGroundingStats(): {
  totalChecks: number;
  passRate: number;
  totalViolations: number;
  blockViolations: number;
  byFieldType: Record<string, number>;
} {
  const byFieldType: Record<string, number> = {};
  let totalViolations = 0;
  let blockViolations = 0;
  let passed = 0;

  for (const r of groundingLog) {
    if (r.passed) passed++;
    for (const v of r.violations) {
      totalViolations++;
      if (v.severity === "block") blockViolations++;
      byFieldType[v.fieldType] = (byFieldType[v.fieldType] || 0) + 1;
    }
  }

  return {
    totalChecks: groundingLog.length,
    passRate: groundingLog.length > 0 ? passed / groundingLog.length : 1,
    totalViolations,
    blockViolations,
    byFieldType,
  };
}
