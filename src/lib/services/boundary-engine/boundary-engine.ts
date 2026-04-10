// ═══════════════════════════════════════════════════════════════
// SITA OS — Life/Work/Wealth Boundary Engine
// Privacy walls, cross-domain synthesis, attention boundaries
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

export type BoundaryScope = "personal" | "household" | "business" | "investment" | "family";

export interface BoundaryRule {
  id: string;
  fromScope: BoundaryScope;
  toScope: BoundaryScope;
  permission: "allow" | "anonymized" | "aggregated" | "blocked";
  reason: string;
  overridable: boolean;
}

export interface BoundaryCheck {
  allowed: boolean;
  permission: BoundaryRule["permission"];
  reason: string;
  appliedRule: string;
}

export class BoundaryEngineService {
  private rules: BoundaryRule[] = [
    { id: "b1", fromScope: "personal", toScope: "business", permission: "blocked", reason: "Personal data stays personal", overridable: true },
    { id: "b2", fromScope: "business", toScope: "personal", permission: "aggregated", reason: "Business summaries only", overridable: true },
    { id: "b3", fromScope: "household", toScope: "business", permission: "blocked", reason: "Family privacy", overridable: false },
    { id: "b4", fromScope: "investment", toScope: "household", permission: "anonymized", reason: "Financial privacy", overridable: true },
    { id: "b5", fromScope: "personal", toScope: "household", permission: "allow", reason: "Household sharing", overridable: true },
    { id: "b6", fromScope: "business", toScope: "household", permission: "blocked", reason: "Work-life boundary", overridable: true },
  ];

  checkBoundary(fromScope: BoundaryScope, toScope: BoundaryScope): BoundaryCheck {
    if (fromScope === toScope) return { allowed: true, permission: "allow", reason: "Same scope", appliedRule: "identity" };
    const rule = this.rules.find(r => r.fromScope === fromScope && r.toScope === toScope);
    if (!rule) return { allowed: true, permission: "allow", reason: "No rule — default allow", appliedRule: "default" };
    return { allowed: rule.permission !== "blocked", permission: rule.permission, reason: rule.reason, appliedRule: rule.id };
  }

  addRule(rule: BoundaryRule): void { this.rules.push(rule); this._persist(); }
  removeRule(id: string): void { this.rules = this.rules.filter(r => r.id !== id); this._persist(); }
  listRules(): BoundaryRule[] { return [...this.rules]; }

  canCrossDomainSynthesize(domains: DomainId[]): { allowed: boolean; blockedPairs: string[] } {
    const blocked: string[] = [];
    const scopeMap: Record<string, BoundaryScope> = { business: "business", finance: "investment", concierge: "personal", platform: "personal" };
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const a = scopeMap[domains[i]] ?? "personal";
        const b = scopeMap[domains[j]] ?? "personal";
        const check = this.checkBoundary(a, b);
        if (!check.allowed) blocked.push(`${domains[i]}→${domains[j]}`);
      }
    }
    return { allowed: blocked.length === 0, blockedPairs: blocked };
  }

  private _persist = () => debouncedSaveServiceState("boundary-engine", { rules: this.rules });
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("boundary-engine"); if (s && (s as Record<string,unknown>).rules) this.rules = (s as Record<string,unknown>).rules as BoundaryRule[]; }
}

export const createBoundaryEngine = () => new BoundaryEngineService();
