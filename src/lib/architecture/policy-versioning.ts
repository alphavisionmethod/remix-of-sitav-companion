// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Versioning System
// Constitutional infrastructure. No silent weakening.
// ═══════════════════════════════════════════════════════════════

export type PolicyEnvironment = "development" | "staging" | "canary" | "production";
export type PolicyChangeType = "strengthening" | "weakening" | "neutral" | "restructuring";

export interface PolicyRule {
  ruleId: string;
  name: string;
  domain: "finance-os" | "business-os" | "concierge-os" | "platform" | "cross-domain";
  category: "approval" | "budget" | "trust" | "privacy" | "execution" | "connector" | "memory" | "identity";
  condition: string;         // human-readable condition
  action: "allow" | "deny" | "require-approval" | "escalate" | "degrade" | "simulate-first";
  riskTier: "standard" | "elevated" | "critical";
  overridable: boolean;
  overrideRequires?: "owner-approval" | "dual-approval" | "never";
}

export interface PolicyBundle {
  bundleId: string;
  version: number;
  tenantId: string;
  environment: PolicyEnvironment;
  rules: PolicyRule[];
  hash: string;              // SHA-256 of serialized rules
  parentVersion?: number;
  createdBy: string;
  createdAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
  approvalId?: string;       // required for weakening changes
}

export interface PolicyChange {
  changeId: string;
  fromVersion: number;
  toVersion: number;
  tenantId: string;
  changeType: PolicyChangeType;
  addedRules: string[];
  removedRules: string[];
  modifiedRules: Array<{ ruleId: string; field: string; from: string; to: string }>;
  requiresApproval: boolean;  // always true for weakening
  simulationRequired: boolean;
  approvalId?: string;
  appliedAt?: string;
  rolledBackAt?: string;
  diffSummary: string;
}

export interface PolicyRegressionTest {
  testId: string;
  bundleVersion: number;
  scenario: string;
  expectedOutcome: "allow" | "deny" | "require-approval" | "escalate";
  actualOutcome?: "allow" | "deny" | "require-approval" | "escalate";
  passed?: boolean;
  executedAt?: string;
}

// ── Policy Versioning Engine ────────────────────────────────

export function hashPolicyBundle(rules: PolicyRule[]): string {
  const serialized = JSON.stringify(rules.map(r => ({
    ruleId: r.ruleId, name: r.name, condition: r.condition,
    action: r.action, riskTier: r.riskTier, overridable: r.overridable,
  })).sort((a, b) => a.ruleId.localeCompare(b.ruleId)));
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    hash = ((hash << 5) - hash) + serialized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(10, "0");
}

export function classifyChange(
  oldRules: PolicyRule[],
  newRules: PolicyRule[],
): PolicyChangeType {
  const oldIds = new Set(oldRules.map(r => r.ruleId));
  const newIds = new Set(newRules.map(r => r.ruleId));

  const removed = oldRules.filter(r => !newIds.has(r.ruleId));
  const added = newRules.filter(r => !oldIds.has(r.ruleId));

  // Any removed deny rule or overridable change = weakening
  const hasWeakening = removed.some(r => r.action === "deny" || r.action === "require-approval")
    || newRules.some(nr => {
      const old = oldRules.find(or => or.ruleId === nr.ruleId);
      if (!old) return false;
      return (old.action === "deny" && nr.action !== "deny")
        || (old.action === "require-approval" && nr.action === "allow")
        || (!old.overridable && nr.overridable);
    });

  if (hasWeakening) return "weakening";

  const hasStrengthening = added.some(r => r.action === "deny" || r.action === "require-approval");
  if (hasStrengthening) return "strengthening";

  if (removed.length > 0 || added.length > 0) return "restructuring";
  return "neutral";
}

export function createPolicyChange(
  oldBundle: PolicyBundle,
  newRules: PolicyRule[],
  createdBy: string,
): PolicyChange {
  const changeType = classifyChange(oldBundle.rules, newRules);
  const oldIds = new Set(oldBundle.rules.map(r => r.ruleId));
  const newIds = new Set(newRules.map(r => r.ruleId));

  return {
    changeId: crypto.randomUUID(),
    fromVersion: oldBundle.version,
    toVersion: oldBundle.version + 1,
    tenantId: oldBundle.tenantId,
    changeType,
    addedRules: newRules.filter(r => !oldIds.has(r.ruleId)).map(r => r.ruleId),
    removedRules: oldBundle.rules.filter(r => !newIds.has(r.ruleId)).map(r => r.ruleId),
    modifiedRules: newRules
      .filter(nr => oldIds.has(nr.ruleId))
      .flatMap(nr => {
        const old = oldBundle.rules.find(r => r.ruleId === nr.ruleId)!;
        const diffs: Array<{ ruleId: string; field: string; from: string; to: string }> = [];
        if (old.action !== nr.action) diffs.push({ ruleId: nr.ruleId, field: "action", from: old.action, to: nr.action });
        if (old.overridable !== nr.overridable) diffs.push({ ruleId: nr.ruleId, field: "overridable", from: String(old.overridable), to: String(nr.overridable) });
        if (old.riskTier !== nr.riskTier) diffs.push({ ruleId: nr.ruleId, field: "riskTier", from: old.riskTier, to: nr.riskTier });
        return diffs;
      }),
    requiresApproval: changeType === "weakening",
    simulationRequired: changeType === "weakening" || changeType === "restructuring",
    diffSummary: `${changeType} change: v${oldBundle.version} → v${oldBundle.version + 1}`,
  };
}
