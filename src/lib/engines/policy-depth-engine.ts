// ═══════════════════════════════════════════════════════════════
// SITA OS — Deep Policy Engine
// Full policy inheritance, conflict resolution, consent system
// ═══════════════════════════════════════════════════════════════

import type {
  PolicyRule, PolicyCondition, PolicyInheritanceChain, PolicyConflict,
  PolicyEffect, PolicyScope, PolicyAuditEntry, ConsentRecord, ConsentMode,
  EmergencyPolicyFreeze, PolicyTemplate,
} from "../types/policy-depth.types";

const SCOPE_PRIORITY: Record<PolicyScope, number> = {
  global: 100,
  environment: 90,
  business: 70,
  household: 60,
  user: 50,
  advisor: 40,
  device: 30,
};

export class PolicyDepthEngine {
  private policies: Map<string, PolicyRule> = new Map();
  private consents: Map<string, ConsentRecord> = new Map();
  private auditLog: PolicyAuditEntry[] = [];
  private freezes: EmergencyPolicyFreeze[] = [];

  // ── Policy CRUD ─────────────────────────────────────────────
  addPolicy(policy: PolicyRule): void {
    this.policies.set(policy.id, policy);
    this.audit(policy.id, "created", policy.createdBy, policy.version);
  }

  updatePolicy(id: string, updates: Partial<PolicyRule>, updatedBy: string): PolicyRule {
    const policy = this.policies.get(id);
    if (!policy) throw new Error(`Policy ${id} not found`);

    const previousVersion = policy.version;
    const updated = { ...policy, ...updates, version: policy.version + 1, updatedAt: new Date().toISOString() };
    this.policies.set(id, updated);
    this.audit(id, "updated", updatedBy, updated.version, previousVersion);
    return updated;
  }

  deactivatePolicy(id: string, by: string): void {
    const policy = this.policies.get(id);
    if (policy) {
      policy.active = false;
      this.audit(id, "deactivated", by, policy.version);
    }
  }

  // ── Policy Evaluation ───────────────────────────────────────
  evaluate(context: {
    domain: string;
    action: string;
    userId: string;
    householdId?: string;
    orgId?: string;
    advisorId?: string;
    deviceId?: string;
    amount?: number;
    time?: string;
  }): PolicyInheritanceChain {
    // Check emergency freeze
    const activeFreeze = this.freezes.find(f =>
      !f.deactivatedAt && (f.scope === "global" || f.scopeId === context.domain || f.scopeId === context.advisorId)
    );
    if (activeFreeze) {
      return {
        resolved: this.createDenyPolicy("Emergency freeze active", context.domain),
        chain: [{ scope: "global", policyId: activeFreeze.id, effect: "deny", overridden: false }],
        conflicts: [],
      };
    }

    // Gather applicable policies
    const applicable = this.getApplicablePolicies(context);

    // Sort by scope priority (global first)
    applicable.sort((a, b) => (SCOPE_PRIORITY[b.scope] || 0) - (SCOPE_PRIORITY[a.scope] || 0));

    // Build inheritance chain
    const chain: PolicyInheritanceChain["chain"] = [];
    const conflicts: PolicyConflict[] = [];
    let resolved: PolicyRule | undefined;

    for (const policy of applicable) {
      const matches = this.evaluateConditions(policy.conditions, context);
      if (!matches) continue;

      chain.push({
        scope: policy.scope,
        policyId: policy.id,
        effect: policy.effect,
        overridden: false,
      });

      // Check for conflicts with previous
      if (resolved && resolved.effect !== policy.effect) {
        const conflict: PolicyConflict = {
          id: `conflict_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          policyA: resolved.id,
          policyB: policy.id,
          field: context.action,
          effectA: resolved.effect,
          effectB: policy.effect,
          resolution: this.resolveConflict(resolved, policy),
        };
        conflicts.push(conflict);

        // Apply resolution
        if (conflict.resolution === "deny_wins" && policy.effect === "deny") {
          chain[chain.length - 2].overridden = true;
          resolved = policy;
        } else {
          chain[chain.length - 1].overridden = true;
        }
      } else if (!resolved) {
        resolved = policy;
      }
    }

    return {
      resolved: resolved || this.createDenyPolicy("No matching policy", context.domain),
      chain,
      conflicts,
    };
  }

  // ── Consent Management ──────────────────────────────────────
  grantConsent(consent: ConsentRecord): void {
    this.consents.set(consent.id, consent);
  }

  revokeConsent(consentId: string): void {
    const consent = this.consents.get(consentId);
    if (consent) {
      consent.revoked = true;
      consent.revokedAt = new Date().toISOString();
    }
  }

  checkConsent(userId: string, domain: string, action: string, advisorId?: string): ConsentRecord | undefined {
    return Array.from(this.consents.values()).find(c =>
      c.userId === userId && c.domain === domain && c.action === action &&
      !c.revoked && (!c.expiresAt || new Date(c.expiresAt) > new Date()) &&
      (!advisorId || !c.advisorId || c.advisorId === advisorId) &&
      (!c.maxUsages || c.usageCount < c.maxUsages)
    );
  }

  getConsentMode(userId: string, domain: string, action: string): ConsentMode {
    const consent = this.checkConsent(userId, domain, action);
    return consent?.mode ?? "always_ask";
  }

  // ── Emergency Freeze ────────────────────────────────────────
  activateFreeze(scope: EmergencyPolicyFreeze["scope"], scopeId: string | undefined, activatedBy: string, reason: string): EmergencyPolicyFreeze {
    const freeze: EmergencyPolicyFreeze = {
      id: `freeze_${Date.now()}`,
      activatedBy,
      activatedAt: new Date().toISOString(),
      scope,
      scopeId,
      reason,
      affectedPolicies: [],
      affectedWorkflows: [],
    };
    this.freezes.push(freeze);
    return freeze;
  }

  deactivateFreeze(freezeId: string, by: string): void {
    const freeze = this.freezes.find(f => f.id === freezeId);
    if (freeze) {
      freeze.deactivatedAt = new Date().toISOString();
      freeze.deactivatedBy = by;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────
  private getApplicablePolicies(context: Record<string, unknown>): PolicyRule[] {
    return Array.from(this.policies.values()).filter(p =>
      p.active && p.domain === (context.domain as string) &&
      (!p.expiresAt || new Date(p.expiresAt) > new Date())
    );
  }

  private evaluateConditions(conditions: PolicyCondition[], context: Record<string, unknown>): boolean {
    return conditions.every(c => {
      const fieldValue = context[c.field];
      switch (c.operator) {
        case "eq": return fieldValue === c.value;
        case "neq": return fieldValue !== c.value;
        case "gt": return typeof fieldValue === "number" && fieldValue > (c.value as number);
        case "gte": return typeof fieldValue === "number" && fieldValue >= (c.value as number);
        case "lt": return typeof fieldValue === "number" && fieldValue < (c.value as number);
        case "lte": return typeof fieldValue === "number" && fieldValue <= (c.value as number);
        case "in": return Array.isArray(c.value) && (c.value as unknown[]).includes(fieldValue);
        case "not_in": return Array.isArray(c.value) && !(c.value as unknown[]).includes(fieldValue);
        case "contains": return typeof fieldValue === "string" && fieldValue.includes(c.value as string);
        default: return true;
      }
    });
  }

  private resolveConflict(a: PolicyRule, b: PolicyRule): PolicyConflict["resolution"] {
    if (b.effect === "deny") return "deny_wins";
    if (SCOPE_PRIORITY[a.scope] > SCOPE_PRIORITY[b.scope]) return "higher_scope_wins";
    if (!a.overridable && b.overridable) return "explicit_wins";
    return "higher_scope_wins";
  }

  private createDenyPolicy(reason: string, domain: string): PolicyRule {
    return {
      id: "system_deny",
      name: "System Default Deny",
      description: reason,
      scope: "global",
      scopeId: "system",
      domain,
      priority: 0,
      conditions: [],
      effect: "deny",
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
      active: true,
      overridable: false,
    };
  }

  private audit(policyId: string, action: PolicyAuditEntry["action"], by: string, version: number, previousVersion?: number): void {
    this.auditLog.push({
      id: `audit_${Date.now()}`,
      policyId,
      action,
      previousVersion,
      newVersion: version,
      changedBy: by,
      timestamp: new Date().toISOString(),
      diff: {},
    });
  }

  getAuditLog(policyId?: string): PolicyAuditEntry[] {
    return policyId ? this.auditLog.filter(a => a.policyId === policyId) : this.auditLog;
  }

  serialize(): Record<string, unknown> {
    return {
      policies: Array.from(this.policies.entries()),
      consents: Array.from(this.consents.entries()),
      auditLog: this.auditLog.slice(-500),
      freezes: this.freezes,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (state.policies) this.policies = new Map(state.policies as Iterable<[string, never]>) as typeof this.policies;
    if (state.consents) this.consents = new Map(state.consents as Iterable<[string, never]>) as typeof this.consents;
    if (state.auditLog) this.auditLog = state.auditLog as typeof this.auditLog;
    if (state.freezes) this.freezes = state.freezes as typeof this.freezes;
  }
}

