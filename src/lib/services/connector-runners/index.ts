// SITA OS — Connector Runners (merge: connector-control-plane)
export interface ConnectorRunner { id: string; connectorId: string; status: 'idle' | 'running' | 'error'; lastRunAt?: string; nextRunAt?: string; config: Record<string, unknown>; }
export class ConnectorRunnersService {
  private runners: Map<string, ConnectorRunner> = new Map();
  register(runner: ConnectorRunner): void { this.runners.set(runner.id, runner); }
  start(id: string): boolean { const r = this.runners.get(id); if (r) { r.status = 'running'; r.lastRunAt = new Date().toISOString(); return true; } return false; }
  stop(id: string): boolean { const r = this.runners.get(id); if (r) { r.status = 'idle'; return true; } return false; }
  getRunner(id: string): ConnectorRunner | undefined { return this.runners.get(id); }
  listRunners(): ConnectorRunner[] { return [...this.runners.values()]; }
  getHealth(): { total: number; running: number; errors: number } { const all = [...this.runners.values()]; return { total: all.length, running: all.filter(r => r.status === 'running').length, errors: all.filter(r => r.status === 'error').length }; }
}
export const createConnectorRunners = () => new ConnectorRunnersService();
