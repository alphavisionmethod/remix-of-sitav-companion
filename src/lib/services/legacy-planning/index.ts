// ═══════════════════════════════════════════════════════════════
// SITA OS — Legacy Planning Engine
// Multi-generational wealth + knowledge + values transfer
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type VaultItemType = 'financial' | 'knowledge' | 'values' | 'legal' | 'personal';
export type AccessTrigger = 'age' | 'event' | 'date' | 'manual';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  content: string; // encrypted in production
  beneficiaries: string[];
  accessTrigger: AccessTrigger;
  triggerCondition: string; // e.g., "age:18", "event:marriage", "date:2030-01-01"
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface SuccessionScore {
  overall: number; // 0-100
  business: { score: number; gaps: string[] };
  family: { score: number; gaps: string[] };
  personal: { score: number; gaps: string[] };
  criticalGaps: string[];
}

export interface GenerationalWealthProjection {
  generation: number;
  label: string;
  startingWealth: number;
  projectedWealth: number;
  assumptions: string[];
  riskFactors: string[];
}

export interface KnowledgeTransferItem {
  memberId: string;
  memberName: string;
  uniqueKnowledge: string[];
  documentedPct: number;
  criticalItems: string[];
  plan: string[];
}

export class LegacyPlanningEngine {
  private vault: Map<string, VaultItem> = new Map();
  private counter = 0;

  addVaultItem(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): VaultItem {
    const id = `vault-${++this.counter}`;
    const full: VaultItem = { ...item, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.vault.set(id, full);
    return full;
  }

  removeVaultItem(id: string): void { this.vault.delete(id); }

  getVaultItems(type?: VaultItemType): VaultItem[] {
    const items = [...this.vault.values()];
    return type ? items.filter(i => i.type === type) : items;
  }

  checkAccessTriggers(memberId: string, memberAge: number, events: string[]): VaultItem[] {
    return [...this.vault.values()].filter(item => {
      if (!item.beneficiaries.includes(memberId) && !item.beneficiaries.includes('*')) return false;
      switch (item.accessTrigger) {
        case 'age': return memberAge >= parseInt(item.triggerCondition.replace('age:', ''), 10);
        case 'event': return events.some(e => item.triggerCondition.replace('event:', '') === e);
        case 'date': return new Date() >= new Date(item.triggerCondition.replace('date:', ''));
        case 'manual': return false;
      }
    });
  }

  assessSuccessionReadiness(params: {
    businessProcessesDocumented: number; trainedSuccessors: number; accountsAccessible: boolean;
    passwordsKnown: boolean; insuranceLocated: boolean; legalDocsCurrent: boolean;
    wishesDocumented: boolean; digitalLegacyOrganized: boolean;
  }): SuccessionScore {
    const biz = Math.round((params.businessProcessesDocumented * 40 + params.trainedSuccessors * 40 + (params.accountsAccessible ? 20 : 0)));
    const fam = Math.round(((params.passwordsKnown ? 33 : 0) + (params.insuranceLocated ? 33 : 0) + (params.legalDocsCurrent ? 34 : 0)));
    const per = Math.round(((params.wishesDocumented ? 50 : 0) + (params.digitalLegacyOrganized ? 50 : 0)));
    const overall = Math.round((biz * 0.4 + fam * 0.35 + per * 0.25));

    const gaps: string[] = [];
    if (params.businessProcessesDocumented < 0.5) gaps.push('Less than 50% of business processes documented');
    if (params.trainedSuccessors < 1) gaps.push('No trained successor identified');
    if (!params.passwordsKnown) gaps.push('Critical passwords not shared with trusted person');
    if (!params.legalDocsCurrent) gaps.push('Legal documents (will, POA) not current');
    if (!params.wishesDocumented) gaps.push('Personal wishes not documented');

    return {
      overall, criticalGaps: gaps,
      business: { score: biz, gaps: biz < 60 ? ['Document key processes', 'Identify and train successor'] : [] },
      family: { score: fam, gaps: fam < 60 ? ['Share account access', 'Locate insurance policies', 'Update legal documents'] : [] },
      personal: { score: per, gaps: per < 60 ? ['Document personal wishes', 'Organize digital legacy'] : [] },
    };
  }

  projectGenerationalWealth(params: {
    currentWealth: number;
    annualSavings: number;
    returnRate: number;
    inflationRate: number;
    estateTaxRate: number;
    generations: number;
    yearsPerGeneration: number;
  }): GenerationalWealthProjection[] {
    const projections: GenerationalWealthProjection[] = [];
    let wealth = params.currentWealth;

    for (let g = 1; g <= params.generations; g++) {
      const startWealth = wealth;
      const realReturn = params.returnRate - params.inflationRate;
      // Compound: FV = PV(1+r)^n + PMT × ((1+r)^n - 1) / r
      const n = params.yearsPerGeneration;
      const r = realReturn;
      const compounded = r > 0
        ? wealth * Math.pow(1 + r, n) + params.annualSavings * (Math.pow(1 + r, n) - 1) / r
        : wealth + params.annualSavings * n;
      const afterTax = compounded * (1 - params.estateTaxRate);

      projections.push({
        generation: g,
        label: g === 1 ? 'Children' : g === 2 ? 'Grandchildren' : `Generation ${g}`,
        startingWealth: Math.round(startWealth),
        projectedWealth: Math.round(afterTax),
        assumptions: [`${(realReturn * 100).toFixed(1)}% real return`, `${params.yearsPerGeneration}yr span`, `${(params.estateTaxRate * 100).toFixed(0)}% estate tax`],
        riskFactors: ['Market volatility', 'Tax law changes', 'Inflation spikes', 'Family disputes'],
      });
      wealth = afterTax;
    }
    return projections;
  }

  generateKnowledgeTransferPlan(members: { id: string; name: string; uniqueKnowledge: string[]; documented: string[] }[]): KnowledgeTransferItem[] {
    return members.map(m => {
      const undocumented = m.uniqueKnowledge.filter(k => !m.documented.includes(k));
      return {
        memberId: m.id, memberName: m.name,
        uniqueKnowledge: m.uniqueKnowledge,
        documentedPct: m.uniqueKnowledge.length > 0 ? Math.round((m.documented.length / m.uniqueKnowledge.length) * 100) : 100,
        criticalItems: undocumented,
        plan: undocumented.map(k => `Document "${k}" — schedule 30min recording session`),
      };
    }).sort((a, b) => a.documentedPct - b.documentedPct);
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("legacy-planning", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      vault: Array.from(this.vault.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.vault) this.vault = new Map(state.vault as Iterable<[string, never]>) as typeof this.vault;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("legacy-planning");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createLegacyPlanning = () => new LegacyPlanningEngine();

