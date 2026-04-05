// SITA OS — Opportunity Engine
export interface OpportunitySignal { id: string; type: string; source: string; value: number; confidence: number; actionRequired: string; detectedAt: string; status: 'new' | 'evaluated' | 'acted' | 'dismissed'; }
export class OpportunityEngineService {
  private signals: OpportunitySignal[] = [];
  private counter = 0;
  detect(type: string, source: string, value: number, confidence: number, action: string): OpportunitySignal { const s: OpportunitySignal = { id: `opp-${++this.counter}`, type, source, value, confidence, actionRequired: action, detectedAt: new Date().toISOString(), status: 'new' }; this.signals.push(s); return s; }
  evaluate(id: string): void { const s = this.signals.find(x => x.id === id); if (s) s.status = 'evaluated'; }
  act(id: string): void { const s = this.signals.find(x => x.id === id); if (s) s.status = 'acted'; }
  dismiss(id: string): void { const s = this.signals.find(x => x.id === id); if (s) s.status = 'dismissed'; }
  getNew(): OpportunitySignal[] { return this.signals.filter(s => s.status === 'new'); }
  getAll(): OpportunitySignal[] { return [...this.signals]; }
  getTotalValue(): number { return this.signals.filter(s => s.status !== 'dismissed').reduce((s, o) => s + o.value * o.confidence, 0); }
}
export const createOpportunityEngine = () => new OpportunityEngineService();
