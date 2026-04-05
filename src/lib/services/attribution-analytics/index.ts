// SITA OS — Attribution Analytics (merge: observability)
export interface AttributionEvent { channel: string; touchpoint: string; value: number; timestamp: string; conversionId?: string; }
export class AttributionAnalyticsService {
  private events: AttributionEvent[] = [];
  record(event: AttributionEvent): void { this.events.push(event); }
  getByChannel(channel: string): AttributionEvent[] { return this.events.filter(e => e.channel === channel); }
  getChannelBreakdown(): Record<string, { count: number; totalValue: number }> { return this.events.reduce((a, e) => { if (!a[e.channel]) a[e.channel] = { count: 0, totalValue: 0 }; a[e.channel].count++; a[e.channel].totalValue += e.value; return a; }, {} as Record<string, { count: number; totalValue: number }>); }
  getConversions(): AttributionEvent[] { return this.events.filter(e => e.conversionId); }
}
export const createAttributionAnalytics = () => new AttributionAnalyticsService();
