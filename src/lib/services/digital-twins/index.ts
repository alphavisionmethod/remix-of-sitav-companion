// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twins Service
// Customer/entity digital twin management and simulation
// ═══════════════════════════════════════════════════════════════

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
}

export const createDigitalTwins = () => new DigitalTwinsService();
