// SITA OS — Observability Hub (merge: observability)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface HubMetric { service: string; metric: string; value: number; timestamp: string; }
export class ObservabilityHubService {
  private metrics: HubMetric[] = [];
  push(service: string, metric: string, value: number): void { this.metrics.push({ service, metric, value, timestamp: new Date().toISOString() }); }
  query(service: string, metric: string, limit: number = 100): HubMetric[] { return this.metrics.filter(m => m.service === service && m.metric === metric).slice(-limit); }
  getServiceHealth(): Record<string, { metrics: number; lastSeen: string }> { const h: Record<string, { metrics: number; lastSeen: string }> = {}; this.metrics.forEach(m => { if (!h[m.service]) h[m.service] = { metrics: 0, lastSeen: m.timestamp }; h[m.service].metrics++; if (m.timestamp > h[m.service].lastSeen) h[m.service].lastSeen = m.timestamp; }); return h; }
  getStats(): { totalMetrics: number; services: number } { return { totalMetrics: this.metrics.length, services: new Set(this.metrics.map(m => m.service)).size }; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("observability-hub", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      metrics: this.metrics,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.metrics) this.metrics = state.metrics as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("observability-hub");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createObservabilityHub = () => new ObservabilityHubService();
