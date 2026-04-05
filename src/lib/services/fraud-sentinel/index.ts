// SITA OS — Fraud Sentinel
export interface FraudSignal { id: string; type: string; severity: 'low' | 'medium' | 'high' | 'critical'; score: number; source: string; details: Record<string, unknown>; detectedAt: string; resolved: boolean; }
export class FraudSentinelService {
  private signals: FraudSignal[] = [];
  private counter = 0;
  detect(type: string, severity: FraudSignal['severity'], score: number, source: string, details: Record<string, unknown>): FraudSignal { const s: FraudSignal = { id: `fraud-${++this.counter}`, type, severity, score, source, details, detectedAt: new Date().toISOString(), resolved: false }; this.signals.push(s); return s; }
  resolve(id: string): boolean { const s = this.signals.find(x => x.id === id); if (s) { s.resolved = true; return true; } return false; }
  getActive(): FraudSignal[] { return this.signals.filter(s => !s.resolved); }
  getByType(type: string): FraudSignal[] { return this.signals.filter(s => s.type === type); }
  getRiskScore(): number { return this.signals.filter(s => !s.resolved).reduce((s, f) => s + f.score, 0); }
}
export const createFraudSentinel = () => new FraudSentinelService();
