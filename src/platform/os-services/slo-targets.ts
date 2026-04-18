// ═══════════════════════════════════════════════════════════════
// SITA OS — SLO Targets
// Service Level Objectives for production reliability
// ═══════════════════════════════════════════════════════════════

export interface SLODefinition {
  id: string;
  name: string;
  description: string;
  target: number; // percentage or value
  unit: string;
  window: '1h' | '24h' | '7d' | '30d';
  current: number;
  status: 'meeting' | 'at_risk' | 'breaching';
  category: 'boot' | 'update' | 'reliability' | 'performance' | 'network' | 'power';
  history: { timestamp: number; value: number }[];
}

class SLOTargetManager {
  private slos = new Map<string, SLODefinition>();

  constructor() {
    const defaults: SLODefinition[] = [
      { id: 'boot_success', name: 'Boot Success Rate', description: 'Percentage of successful boots without errors', target: 99.9, unit: '%', window: '30d', current: 99.95, status: 'meeting', category: 'boot', history: [] },
      { id: 'boot_time', name: 'Boot Time', description: 'Time from power-on to interactive desktop', target: 3000, unit: 'ms', window: '24h', current: 2400, status: 'meeting', category: 'boot', history: [] },
      { id: 'update_success', name: 'Update Success Rate', description: 'Percentage of updates that complete without rollback', target: 99.0, unit: '%', window: '30d', current: 99.2, status: 'meeting', category: 'update', history: [] },
      { id: 'service_crash', name: 'Service Crash Rate', description: 'Service crashes per 1000 operating hours', target: 2, unit: 'per 1000h', window: '7d', current: 1.5, status: 'meeting', category: 'reliability', history: [] },
      { id: 'wifi_reconnect', name: 'Wi-Fi Reconnect Success', description: 'Successful auto-reconnection after signal loss', target: 98.0, unit: '%', window: '7d', current: 97.5, status: 'at_risk', category: 'network', history: [] },
      { id: 'suspend_resume', name: 'Suspend/Resume Success', description: 'Clean suspend and resume cycles', target: 99.5, unit: '%', window: '30d', current: 99.7, status: 'meeting', category: 'power', history: [] },
      { id: 'battery_drain', name: 'Idle Battery Drain', description: 'Maximum battery drain percentage per hour while idle', target: 1.5, unit: '%/hr', window: '24h', current: 1.2, status: 'meeting', category: 'power', history: [] },
      { id: 'app_launch', name: 'App Launch Time', description: 'Cold launch to interactive for core apps', target: 1500, unit: 'ms', window: '24h', current: 1200, status: 'meeting', category: 'performance', history: [] },
      { id: 'rollback_success', name: 'Rollback Success Rate', description: 'Successful recovery after failed update', target: 99.5, unit: '%', window: '30d', current: 100, status: 'meeting', category: 'update', history: [] },
      { id: 'cc_latency', name: 'Command Center Response', description: 'P95 latency for control center interactions', target: 200, unit: 'ms', window: '24h', current: 150, status: 'meeting', category: 'performance', history: [] },
    ];
    defaults.forEach(s => this.slos.set(s.id, s));
  }

  get(id: string): SLODefinition | undefined { return this.slos.get(id); }
  all(): SLODefinition[] { return [...this.slos.values()]; }
  getByCategory(category: SLODefinition['category']): SLODefinition[] { return this.all().filter(s => s.category === category); }

  update(id: string, current: number): void {
    const slo = this.slos.get(id);
    if (!slo) return;
    slo.current = current;
    slo.history.push({ timestamp: Date.now(), value: current });
    if (slo.history.length > 100) slo.history.shift();

    // Determine status based on unit type
    const isLowerBetter = ['ms', '%/hr', 'per 1000h'].includes(slo.unit);
    if (isLowerBetter) {
      slo.status = current <= slo.target ? 'meeting' : current <= slo.target * 1.2 ? 'at_risk' : 'breaching';
    } else {
      slo.status = current >= slo.target ? 'meeting' : current >= slo.target * 0.95 ? 'at_risk' : 'breaching';
    }
  }

  summary(): { meeting: number; atRisk: number; breaching: number; overallScore: number } {
    const all = this.all();
    const meeting = all.filter(s => s.status === 'meeting').length;
    const atRisk = all.filter(s => s.status === 'at_risk').length;
    const breaching = all.filter(s => s.status === 'breaching').length;
    return { meeting, atRisk, breaching, overallScore: Math.round((meeting / all.length) * 100) };
  }
}

export const sloTargets = new SLOTargetManager();
