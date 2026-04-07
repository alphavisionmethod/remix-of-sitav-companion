// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twins Service
// Customer/entity digital twin management and simulation
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface DigitalTwin { id: string; entityType: string; name: string; segment: string; healthScore: number; churnProbability: number; predictedRevenue: number; revenueAtRisk: number; trend: 'improving' | 'stable' | 'declining'; lastActivity?: string; signals: TwinSignal[]; projections: TwinProjection[]; updatedAt: string; }
export interface TwinSignal { type: string; value: number; source: string; timestamp: string; }
export interface TwinProjection { metric: string; current: number; projected: number; confidence: number; horizon: string; }

export class DigitalTwinsService {
  private twins: Map<string, DigitalTwin> = new Map();

  createTwin(twin: Omit<DigitalTwin, 'updatedAt' | 'signals' | 'projections'>): DigitalTwin {
    const full: DigitalTwin = { ...twin, signals: [], projections: [], updatedAt: new Date().toISOString() };
    this.twins.set(twin.id, full);
    return full;
  }

  getTwin(id: string): DigitalTwin | undefined { return this.twins.get(id); }
  listTwins(filter?: { segment?: string; minHealth?: number }): DigitalTwin[] {
    let result = [...this.twins.values()];
    if (filter?.segment) result = result.filter(t => t.segment === filter.segment);
    if (filter?.minHealth !== undefined) result = result.filter(t => t.healthScore >= filter.minHealth!);
    return result;
  }

  addSignal(twinId: string, signal: TwinSignal): void { const t = this.twins.get(twinId); if (t) { t.signals.push(signal); t.updatedAt = new Date().toISOString(); } }
  updateProjections(twinId: string, projections: TwinProjection[]): void { const t = this.twins.get(twinId); if (t) { t.projections = projections; t.updatedAt = new Date().toISOString(); } }
  getAtRiskTwins(threshold: number = 0.5): DigitalTwin[] { return [...this.twins.values()].filter(t => t.churnProbability >= threshold); }
  getRevenueAtRisk(): number { return [...this.twins.values()].reduce((s, t) => s + t.revenueAtRisk, 0); }
  getSegmentBreakdown(): Record<string, { count: number; avgHealth: number; totalRevenue: number }> {
    const segments: Record<string, { count: number; totalHealth: number; totalRevenue: number }> = {};
    this.twins.forEach(t => { if (!segments[t.segment]) segments[t.segment] = { count: 0, totalHealth: 0, totalRevenue: 0 }; segments[t.segment].count++; segments[t.segment].totalHealth += t.healthScore; segments[t.segment].totalRevenue += t.predictedRevenue; });
    return Object.fromEntries(Object.entries(segments).map(([k, v]) => [k, { count: v.count, avgHealth: v.totalHealth / v.count, totalRevenue: v.totalRevenue }]));
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("digital-twins", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      twins: Array.from(this.twins.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.twins) this.twins = new Map(state.twins as Iterable<[string, never]>) as typeof this.twins;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("digital-twins");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createDigitalTwins = () => new DigitalTwinsService();

