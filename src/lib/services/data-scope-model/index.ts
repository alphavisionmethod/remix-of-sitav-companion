// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Scope Model Service
// Data boundary definitions, scope-based access, field-level permissions
// ═══════════════════════════════════════════════════════════════

import type { DomainId, PrivacyTier } from "@/packages/contracts";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export type AccessLevel = "none" | "read" | "write" | "admin";

export interface DataScope {
  id: string;
  name: string;
  domain: DomainId;
  privacyTier: PrivacyTier;
  tables: string[];
  fieldRestrictions: FieldRestriction[];
  accessRules: AccessRule[];
  retentionDays?: number;
  encryptionRequired: boolean;
  auditRequired: boolean;
  createdAt: string;
}

export interface FieldRestriction {
  table: string;
  field: string;
  maxAccessLevel: AccessLevel;
  masking: "none" | "partial" | "full" | "hash";
  visibleTo: string[]; // role IDs
}

export interface AccessRule {
  id: string;
  scopeId: string;
  roleId: string;
  accessLevel: AccessLevel;
  conditions?: Record<string, unknown>;
  expiresAt?: string;
}

export interface AccessCheck {
  allowed: boolean;
  accessLevel: AccessLevel;
  masking: FieldRestriction["masking"];
  reason: string;
}

export class DataScopeModelService {
  private scopes: Map<string, DataScope> = new Map();

  defineScope(scope: DataScope): void {
    this.scopes.set(scope.id, scope);
  }

  getScope(id: string): DataScope | null {
    return this.scopes.get(id) ?? null;
  }

  getScopesByDomain(domain: DomainId): DataScope[] {
    return Array.from(this.scopes.values()).filter(s => s.domain === domain);
  }

  checkAccess(scopeId: string, roleId: string, table: string, field?: string): AccessCheck {
    const scope = this.scopes.get(scopeId);
    if (!scope) return { allowed: false, accessLevel: "none", masking: "full", reason: "Scope not found" };

    const rule = scope.accessRules.find(r => r.scopeId === scopeId && r.roleId === roleId);
    if (!rule) return { allowed: false, accessLevel: "none", masking: "full", reason: "No access rule for this role" };

    if (rule.expiresAt && new Date(rule.expiresAt) < new Date()) {
      return { allowed: false, accessLevel: "none", masking: "full", reason: "Access rule expired" };
    }

    if (field) {
      const restriction = scope.fieldRestrictions.find(r => r.table === table && r.field === field);
      if (restriction) {
        const levelOrder: AccessLevel[] = ["none", "read", "write", "admin"];
        const ruleLevel = levelOrder.indexOf(rule.accessLevel);
        const maxLevel = levelOrder.indexOf(restriction.maxAccessLevel);
        const effectiveLevel = levelOrder[Math.min(ruleLevel, maxLevel)] ?? "none";

        return {
          allowed: effectiveLevel !== "none",
          accessLevel: effectiveLevel,
          masking: restriction.masking,
          reason: `Field-level restriction: ${restriction.masking} masking`,
        };
      }
    }

    return { allowed: rule.accessLevel !== "none", accessLevel: rule.accessLevel, masking: "none", reason: "Access granted" };
  }

  addAccessRule(rule: AccessRule): void {
    const scope = this.scopes.get(rule.scopeId);
    if (scope) scope.accessRules.push(rule);
  }

  revokeAccess(scopeId: string, roleId: string): boolean {
    const scope = this.scopes.get(scopeId);
    if (!scope) return false;
    scope.accessRules = scope.accessRules.filter(r => r.roleId !== roleId);
    return true;
  }

  listAllScopes(): DataScope[] {
    return Array.from(this.scopes.values());
  }

  getStats(): { totalScopes: number; byDomain: Record<string, number>; byPrivacy: Record<string, number>; totalRules: number } {
    const scopes = Array.from(this.scopes.values());
    const byDomain: Record<string, number> = {};
    const byPrivacy: Record<string, number> = {};
    scopes.forEach(s => {
      byDomain[s.domain] = (byDomain[s.domain] ?? 0) + 1;
      byPrivacy[s.privacyTier] = (byPrivacy[s.privacyTier] ?? 0) + 1;
    });
    return {
      totalScopes: scopes.length,
      byDomain,
      byPrivacy,
      totalRules: scopes.reduce((s, sc) => s + sc.accessRules.length, 0),
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("data-scope-model", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      scopes: Array.from(this.scopes.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.scopes) this.scopes = new Map(state.scopes as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("data-scope-model");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createDataScopeModel(): DataScopeModelService {
  return new DataScopeModelService();
}
