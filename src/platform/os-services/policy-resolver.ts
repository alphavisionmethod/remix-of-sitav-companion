// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Resolver
// 8-source precedence engine with human-readable explanations
// ═══════════════════════════════════════════════════════════════

export type PolicySource =
  | 'platform_baseline' | 'hardware_constraints' | 'org_policy'
  | 'recovery_mode' | 'device_profile' | 'mode_policy'
  | 'user_preference' | 'temp_override';

export type PolicyDecision = 'allow' | 'deny' | 'ask' | 'conditional';

export interface PolicyRule {
  id: string;
  capabilityId: string;
  source: PolicySource;
  decision: PolicyDecision;
  reason: string;
  priority: number; // Lower = higher precedence
  expiresAt?: number;
  conditions?: Record<string, unknown>;
}

export interface PolicyResolution {
  capabilityId: string;
  finalDecision: PolicyDecision;
  decidingRule: PolicyRule;
  allRules: PolicyRule[];
  explanation: string;
  overridable: boolean;
}

// Source precedence (lower number = higher priority)
const SOURCE_PRIORITY: Record<PolicySource, number> = {
  platform_baseline: 0,
  hardware_constraints: 1,
  org_policy: 2,
  recovery_mode: 3,
  device_profile: 4,
  mode_policy: 5,
  user_preference: 6,
  temp_override: 7,
};

const SOURCE_LABELS: Record<PolicySource, string> = {
  platform_baseline: 'platform security policy',
  hardware_constraints: 'hardware security requirement',
  org_policy: 'organization management policy',
  recovery_mode: 'recovery mode restriction',
  device_profile: 'device profile configuration',
  mode_policy: 'current mode setting',
  user_preference: 'your personal preference',
  temp_override: 'temporary session override',
};

class PolicyResolver {
  private rules: PolicyRule[] = [];

  addRule(rule: PolicyRule): void {
    rule.priority = SOURCE_PRIORITY[rule.source];
    this.rules.push(rule);
  }

  addRules(rules: PolicyRule[]): void {
    rules.forEach(r => this.addRule(r));
  }

  removeRule(id: string): boolean {
    const len = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== id);
    return this.rules.length < len;
  }

  /** Resolve policy for a capability — returns the winning rule with explanation */
  resolve(capabilityId: string): PolicyResolution {
    // Clean expired rules
    const now = Date.now();
    const applicable = this.rules
      .filter(r => r.capabilityId === capabilityId && (!r.expiresAt || r.expiresAt > now))
      .sort((a, b) => a.priority - b.priority);

    if (applicable.length === 0) {
      return {
        capabilityId, finalDecision: 'ask',
        decidingRule: { id: 'default', capabilityId, source: 'platform_baseline', decision: 'ask', reason: 'No policy defined', priority: 99 },
        allRules: [], explanation: 'No specific policy exists for this capability. You will be asked for permission.', overridable: true,
      };
    }

    const winner = applicable[0];
    const overridable = winner.source !== 'platform_baseline' && winner.source !== 'hardware_constraints';

    let explanation: string;
    if (winner.decision === 'deny') {
      explanation = `This action is blocked by ${SOURCE_LABELS[winner.source]}: ${winner.reason}`;
    } else if (winner.decision === 'allow') {
      explanation = `Allowed by ${SOURCE_LABELS[winner.source]}`;
    } else {
      explanation = `Requires confirmation per ${SOURCE_LABELS[winner.source]}`;
    }

    if (!overridable) {
      explanation += '. This cannot be overridden.';
    }

    return { capabilityId, finalDecision: winner.decision, decidingRule: winner, allRules: applicable, explanation, overridable };
  }

  /** Explain why a capability is blocked — user-friendly */
  explainBlock(capabilityId: string): string {
    const resolution = this.resolve(capabilityId);
    if (resolution.finalDecision !== 'deny') return 'This action is not blocked.';
    return resolution.explanation;
  }

  /** Get all rules for a source */
  getRulesBySource(source: PolicySource): PolicyRule[] {
    return this.rules.filter(r => r.source === source);
  }

  allRules(): PolicyRule[] { return [...this.rules]; }

  stats() {
    const bySource: Partial<Record<PolicySource, number>> = {};
    const byDecision: Partial<Record<PolicyDecision, number>> = {};
    this.rules.forEach(r => {
      bySource[r.source] = (bySource[r.source] ?? 0) + 1;
      byDecision[r.decision] = (byDecision[r.decision] ?? 0) + 1;
    });
    return { totalRules: this.rules.length, bySource, byDecision };
  }
}

export const policyResolver = new PolicyResolver();

// Pre-register platform baseline rules
const BASELINE_RULES: PolicyRule[] = [
  { id: 'baseline:factory_reset', capabilityId: 'system.factory_reset', source: 'platform_baseline', decision: 'deny', reason: 'Requires explicit admin approval and MFA', priority: 0 },
  { id: 'baseline:firewall_disable', capabilityId: 'shield.firewall.disable', source: 'platform_baseline', decision: 'deny', reason: 'Firewall cannot be disabled without admin override', priority: 0 },
  { id: 'baseline:third_party_driver', capabilityId: 'driver.load.third_party', source: 'platform_baseline', decision: 'deny', reason: 'Third-party drivers require explicit approval', priority: 0 },
  { id: 'baseline:system_file_write', capabilityId: 'fs.system.write', source: 'platform_baseline', decision: 'deny', reason: 'System files are protected', priority: 0 },
  { id: 'baseline:data_delete', capabilityId: 'privacy.data.delete', source: 'platform_baseline', decision: 'deny', reason: 'Data deletion requires verification', priority: 0 },
];
policyResolver.addRules(BASELINE_RULES);
