// SITA OS — Attribution Analytics (merge: observability)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface AttributionEvent { channel: string; touchpoint: string; value: number; timestamp: string; conversionId?: string; }
export class AttributionAnalyticsService {
  private events: AttributionEvent[] = [];
  record(event: AttributionEvent): void { this.events.push(event); }
  getByChannel(channel: string): AttributionEvent[] { return this.events.filter(e => e.channel === channel); }
  getChannelBreakdown(): Record<string, { count: number; totalValue: number }> { return this.events.reduce((a, e) => { if (!a[e.channel]) a[e.channel] = { count: 0, totalValue: 0 }; a[e.channel].count++; a[e.channel].totalValue += e.value; return a; }, {} as Record<string, { count: number; totalValue: number }>); }
  getConversions(): AttributionEvent[] { return this.events.filter(e => e.conversionId); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("attribution-analytics", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      events: this.events,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.events) this.events = state.events as any;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("attribution-analytics");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createAttributionAnalytics = () => new AttributionAnalyticsService();
