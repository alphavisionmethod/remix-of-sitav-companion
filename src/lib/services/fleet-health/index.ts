// SITA OS — Fleet Health (merge: fleet)
export interface HealthCheck { nodeId: string; check: string; status: 'pass' | 'warn' | 'fail'; value?: number; threshold?: number; checkedAt: string; }
export class FleetHealthService {
  private checks: HealthCheck[] = [];
  record(check: Omit<HealthCheck, 'checkedAt'>): void { this.checks.push({ ...check, checkedAt: new Date().toISOString() }); }
  getNodeHealth(nodeId: string): HealthCheck[] { return this.checks.filter(c => c.nodeId === nodeId); }
  getLatest(nodeId: string): HealthCheck[] { const byCheck = new Map<string, HealthCheck>(); this.checks.filter(c => c.nodeId === nodeId).forEach(c => byCheck.set(c.check, c)); return [...byCheck.values()]; }
  getFailingNodes(): string[] { return [...new Set(this.checks.filter(c => c.status === 'fail').map(c => c.nodeId))]; }
  getOverallHealth(): { total: number; passing: number; warning: number; failing: number } { const latest = new Map<string, HealthCheck>(); this.checks.forEach(c => latest.set(`${c.nodeId}:${c.check}`, c)); const all = [...latest.values()]; return { total: all.length, passing: all.filter(c => c.status === 'pass').length, warning: all.filter(c => c.status === 'warn').length, failing: all.filter(c => c.status === 'fail').length }; }
}
export const createFleetHealth = () => new FleetHealthService();
