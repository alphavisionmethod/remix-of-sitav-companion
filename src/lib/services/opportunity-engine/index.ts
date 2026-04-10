// SITA OS — Opportunity Engine (Elevated: cross-domain detection)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";
// @persistence: os_service_state — state survives refresh via universal adapter

export type OpportunityType = 'revenue' | 'cost_saving' | 'relationship' | 'strategic' | 'efficiency' | 'asset_utilization' | 'timing' | 'anomaly';

export interface OpportunitySignal {
  id: string;
  type: OpportunityType;
  source: string;
  domain: DomainId;
  value: number;
  confidence: number;
  actionRequired: string;
  detectedAt: string;
  expiresAt?: string;
  status: 'new' | 'evaluated' | 'acted' | 'dismissed' | 'expired';
  crossDomainLinks: string[];
  metadata: Record<string, unknown>;
}

export interface OpportunityPattern {
  id: string;
  name: string;
  description: string;
  detector: (signals: OpportunitySignal[]) => OpportunitySignal[];
  domain: DomainId | 'cross-domain';
  enabled: boolean;
}

export class OpportunityEngineService {
  private signals: OpportunitySignal[] = [];
  private counter = 0;
  private patterns: OpportunityPattern[] = [];

  constructor() {
    this.registerDefaultPatterns();
  }

  private registerDefaultPatterns(): void {
    this.patterns = [
      {
        id: 'overdue-followups', name: 'Overdue Follow-ups', description: 'Detects relationships with stale follow-ups',
        domain: 'concierge', enabled: true,
        detector: (existing) => {
          const hasFollowup = existing.some(s => s.type === 'relationship' && s.source === 'overdue-followup');
          if (!hasFollowup) return [this.buildSignal('relationship', 'overdue-followup', 'concierge', 30, 0.7, 'Review overdue follow-ups')];
          return [];
        },
      },
      {
        id: 'cost-anomaly', name: 'Spending Anomaly', description: 'Detects unusual spending patterns',
        domain: 'finance', enabled: true,
        detector: (existing) => {
          const hasAnomaly = existing.some(s => s.type === 'anomaly' && s.source === 'spending-pattern');
          if (!hasAnomaly) return [this.buildSignal('anomaly', 'spending-pattern', 'finance', 50, 0.6, 'Review recent spending for anomalies')];
          return [];
        },
      },
      {
        id: 'revenue-gap', name: 'Revenue Opportunity', description: 'Detects gaps in revenue pipeline',
        domain: 'business', enabled: true,
        detector: (existing) => {
          const has = existing.some(s => s.type === 'revenue' && s.source === 'pipeline-gap');
          if (!has) return [this.buildSignal('revenue', 'pipeline-gap', 'business', 100, 0.5, 'Evaluate pipeline gaps')];
          return [];
        },
      },
      {
        id: 'asset-underuse', name: 'Underused Assets', description: 'Detects assets not being utilized',
        domain: 'cross-domain' as DomainId, enabled: true,
        detector: (existing) => {
          const has = existing.some(s => s.type === 'asset_utilization');
          if (!has) return [this.buildSignal('asset_utilization', 'underused-assets', 'business', 40, 0.5, 'Review underused assets')];
          return [];
        },
      },
      {
        id: 'timing-window', name: 'Timing Window', description: 'Strategic timing opportunities',
        domain: 'cross-domain' as DomainId, enabled: true,
        detector: (existing) => {
          const has = existing.some(s => s.type === 'timing');
          if (!has) return [this.buildSignal('timing', 'strategic-window', 'business', 60, 0.4, 'Evaluate strategic timing')];
          return [];
        },
      },
    ];
  }

  private buildSignal(type: OpportunityType, source: string, domain: DomainId, value: number, confidence: number, action: string): OpportunitySignal {
    return {
      id: `opp-${++this.counter}`, type, source, domain, value, confidence,
      actionRequired: action, detectedAt: new Date().toISOString(),
      status: 'new', crossDomainLinks: [], metadata: {},
    };
  }

  // ── Detection ──────────────────────────────────────────────

  detect(type: OpportunityType, source: string, domain: DomainId, value: number, confidence: number, action: string, crossLinks: string[] = []): OpportunitySignal {
    const s = this.buildSignal(type, source, domain, value, confidence, action);
    s.crossDomainLinks = crossLinks;
    this.signals.push(s);
    this._persist();
    return s;
  }

  runPatternDetection(): OpportunitySignal[] {
    const detected: OpportunitySignal[] = [];
    for (const pattern of this.patterns) {
      if (!pattern.enabled) continue;
      const newSignals = pattern.detector(this.signals);
      detected.push(...newSignals);
      this.signals.push(...newSignals);
    }
    if (detected.length > 0) this._persist();
    return detected;
  }

  // ── Actions ────────────────────────────────────────────────

  evaluate(id: string): void { const s = this.signals.find(x => x.id === id); if (s) { s.status = 'evaluated'; this._persist(); } }
  act(id: string): void { const s = this.signals.find(x => x.id === id); if (s) { s.status = 'acted'; this._persist(); } }
  dismiss(id: string): void { const s = this.signals.find(x => x.id === id); if (s) { s.status = 'dismissed'; this._persist(); } }

  expireStale(): number {
    const now = new Date().toISOString();
    let count = 0;
    for (const s of this.signals) {
      if (s.expiresAt && s.expiresAt < now && s.status === 'new') { s.status = 'expired'; count++; }
    }
    if (count > 0) this._persist();
    return count;
  }

  // ── Queries ────────────────────────────────────────────────

  getNew(): OpportunitySignal[] { return this.signals.filter(s => s.status === 'new'); }
  getByDomain(domain: DomainId): OpportunitySignal[] { return this.signals.filter(s => s.domain === domain); }
  getByType(type: OpportunityType): OpportunitySignal[] { return this.signals.filter(s => s.type === type); }
  getCrossDomain(): OpportunitySignal[] { return this.signals.filter(s => s.crossDomainLinks.length > 0); }
  getAll(): OpportunitySignal[] { return [...this.signals]; }
  getTotalValue(): number { return this.signals.filter(s => s.status !== 'dismissed' && s.status !== 'expired').reduce((s, o) => s + o.value * o.confidence, 0); }

  getStats(): { total: number; byType: Record<string, number>; byStatus: Record<string, number>; totalValue: number } {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const s of this.signals) { byType[s.type] = (byType[s.type] ?? 0) + 1; byStatus[s.status] = (byStatus[s.status] ?? 0) + 1; }
    return { total: this.signals.length, byType, byStatus, totalValue: this.getTotalValue() };
  }

  // ── Pattern Management ─────────────────────────────────────

  addPattern(pattern: OpportunityPattern): void { this.patterns.push(pattern); }
  togglePattern(id: string, enabled: boolean): void { const p = this.patterns.find(x => x.id === id); if (p) p.enabled = enabled; }
  listPatterns(): OpportunityPattern[] { return [...this.patterns]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("opportunity-engine", this.serialize());
  serialize(): Record<string, unknown> { return { signals: this.signals.slice(-300), counter: this.counter }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.signals) this.signals = state.signals as OpportunitySignal[];
    if (state.counter) this.counter = state.counter as number;
  }
  async loadPersistedState(): Promise<void> { const state = await loadServiceState("opportunity-engine"); if (state) this.hydrate(state as Record<string, unknown>); }
}
export const createOpportunityEngine = () => new OpportunityEngineService();
