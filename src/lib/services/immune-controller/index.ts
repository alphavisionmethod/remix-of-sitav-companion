// SITA OS — Immune Controller
export interface ThreatSignal { id: string; type: string; severity: string; source: string; mitigated: boolean; detectedAt: string; }
export class ImmuneControllerService {
  private threats: ThreatSignal[] = [];
  private counter = 0;
  detect(type: string, severity: string, source: string): ThreatSignal { const t: ThreatSignal = { id: `threat-${++this.counter}`, type, severity, source, mitigated: false, detectedAt: new Date().toISOString() }; this.threats.push(t); return t; }
  mitigate(id: string): boolean { const t = this.threats.find(x => x.id === id); if (t) { t.mitigated = true; return true; } return false; }
  getActiveThreats(): ThreatSignal[] { return this.threats.filter(t => !t.mitigated); }
  getThreatLevel(): 'clear' | 'elevated' | 'high' | 'critical' { const active = this.getActiveThreats(); if (active.some(t => t.severity === 'critical')) return 'critical'; if (active.some(t => t.severity === 'high')) return 'high'; if (active.length > 0) return 'elevated'; return 'clear'; }
}
export const createImmuneController = () => new ImmuneControllerService();
