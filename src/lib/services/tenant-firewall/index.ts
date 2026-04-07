// ═══════════════════════════════════════════════════════════════
// SITA OS — Tenant Firewall Service
// Tenant boundary enforcement, cross-tenant isolation
// Canonical contract: contracts/core/tenant-context
// ═══════════════════════════════════════════════════════════════

import type { TenantContext } from "@/packages/contracts/core/tenant-context";
import type { DomainId, PrivacyTier } from "@/packages/contracts";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

// ── Types ───────────────────────────────────────────────────────

export interface TenantBoundaryRule {
  id: string;
  sourceTenantId: string;
  targetTenantId?: string; // undefined = applies to all targets
  domain: DomainId;
  action: "allow" | "deny" | "audit";
  resource: string;
  privacyTier: PrivacyTier;
}

export interface CrossTenantAuditEntry {
  id: string;
  timestamp: string;
  sourceTenant: string;
  targetTenant: string;
  resource: string;
  action: string;
  result: "allowed" | "denied" | "audited";
  reason: string;
}

export interface TenantFirewallState {
  rules: TenantBoundaryRule[];
  auditLog: CrossTenantAuditEntry[];
  activeTenants: string[];
  violations: number;
  lastEnforcedAt: string;
}

// ── Service ─────────────────────────────────────────────────────

export class TenantFirewallService {
  private rules = new Map<string, TenantBoundaryRule>();
  private auditLog: CrossTenantAuditEntry[] = [];
  private activeTenants = new Set<string>();

  addRule(rule: TenantBoundaryRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  registerTenant(tenantId: string): void {
    this.activeTenants.add(tenantId);
  }

  deregisterTenant(tenantId: string): void {
    this.activeTenants.delete(tenantId);
  }

  enforce(
    source: TenantContext,
    targetTenantId: string,
    resource: string,
    domain: DomainId
  ): { allowed: boolean; reason: string } {
    // Same-tenant access is always allowed
    if (source.tenantId === targetTenantId) {
      return { allowed: true, reason: "same-tenant" };
    }

    // Check explicit rules
    const matchingRules = Array.from(this.rules.values()).filter(r => {
      if (r.sourceTenantId !== source.tenantId) return false;
      if (r.targetTenantId && r.targetTenantId !== targetTenantId) return false;
      if (r.domain !== domain) return false;
      if (r.resource !== "*" && r.resource !== resource) return false;
      return true;
    });

    // Deny rules take precedence
    const denyRule = matchingRules.find(r => r.action === "deny");
    if (denyRule) {
      this.recordAudit(source.tenantId, targetTenantId, resource, "access", "denied", `rule:${denyRule.id}`);
      return { allowed: false, reason: `denied by rule ${denyRule.id}` };
    }

    const allowRule = matchingRules.find(r => r.action === "allow");
    if (allowRule) {
      const auditRule = matchingRules.find(r => r.action === "audit");
      if (auditRule) {
        this.recordAudit(source.tenantId, targetTenantId, resource, "access", "audited", `rule:${auditRule.id}`);
      }
      return { allowed: true, reason: `allowed by rule ${allowRule.id}` };
    }

    // Default deny for cross-tenant access
    this.recordAudit(source.tenantId, targetTenantId, resource, "access", "denied", "default-deny");
    return { allowed: false, reason: "default-deny: no explicit allow rule" };
  }

  private recordAudit(
    source: string, target: string, resource: string,
    action: string, result: CrossTenantAuditEntry["result"], reason: string
  ): void {
    this.auditLog.push({
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      sourceTenant: source,
      targetTenant: target,
      resource,
      action,
      result,
      reason,
    });
  }

  getViolations(): CrossTenantAuditEntry[] {
    return this.auditLog.filter(e => e.result === "denied");
  }

  evaluate(): TenantFirewallState {
    return {
      rules: Array.from(this.rules.values()),
      auditLog: [...this.auditLog],
      activeTenants: Array.from(this.activeTenants),
      violations: this.getViolations().length,
      lastEnforcedAt: new Date().toISOString(),
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("tenant-firewall", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      rules: Array.from(this.rules.entries()),
      auditLog: this.auditLog,
      activeTenants: Array.from(this.activeTenants),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.rules) this.rules = new Map(state.rules as Iterable<[string, never]>) as typeof this.rules;
    if (state.auditLog) this.auditLog = state.auditLog as never;
    if (state.activeTenants) this.activeTenants = new Set(state.activeTenants as never);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("tenant-firewall");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createTenantFirewallService(): TenantFirewallService {
  return new TenantFirewallService();
}

