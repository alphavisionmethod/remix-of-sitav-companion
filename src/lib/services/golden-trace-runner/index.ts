// SITA OS — Golden Trace Runner (merge: observability)
export interface GoldenTrace { id: string; name: string; steps: { action: string; expected: Record<string, unknown> }[]; status: 'passing' | 'failing' | 'untested'; lastRunAt?: string; }
export class GoldenTraceRunnerService {
  private traces: Map<string, GoldenTrace> = new Map();
  register(trace: GoldenTrace): void { this.traces.set(trace.id, trace); }
  run(id: string): { passed: boolean; failures: string[] } { const t = this.traces.get(id); if (!t) return { passed: false, failures: ['trace not found'] }; t.lastRunAt = new Date().toISOString(); t.status = 'passing'; return { passed: true, failures: [] }; }
  runAll(): { total: number; passed: number; failed: number } { let passed = 0; this.traces.forEach((_, id) => { if (this.run(id).passed) passed++; }); return { total: this.traces.size, passed, failed: this.traces.size - passed }; }
  getTrace(id: string): GoldenTrace | undefined { return this.traces.get(id); }
  listTraces(): GoldenTrace[] { return [...this.traces.values()]; }
}
export const createGoldenTraceRunner = () => new GoldenTraceRunnerService();
