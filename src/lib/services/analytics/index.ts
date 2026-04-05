// ═══════════════════════════════════════════════════════════════
// SITA OS — Analytics Service (merge target: observability)
// ═══════════════════════════════════════════════════════════════

export interface AnalyticsEvent { name: string; domain: string; properties: Record<string, unknown>; timestamp: string; userId: string; sessionId: string; }
export interface AnalyticsMetric { name: string; value: number; unit: string; dimensions: Record<string, string>; recordedAt: string; }
export interface AnalyticsQuery { metric: string; from: string; to: string; granularity: 'minute' | 'hour' | 'day' | 'week' | 'month'; dimensions?: Record<string, string>; }
export interface AnalyticsResult { metric: string; dataPoints: { timestamp: string; value: number }[]; total: number; average: number; min: number; max: number; }

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private metrics: AnalyticsMetric[] = [];

  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void { this.events.push({ ...event, timestamp: new Date().toISOString() }); }
  recordMetric(metric: Omit<AnalyticsMetric, 'recordedAt'>): void { this.metrics.push({ ...metric, recordedAt: new Date().toISOString() }); }

  query(q: AnalyticsQuery): AnalyticsResult {
    const matching = this.metrics.filter(m => m.name === q.metric && m.recordedAt >= q.from && m.recordedAt <= q.to);
    const values = matching.map(m => m.value);
    return {
      metric: q.metric, dataPoints: matching.map(m => ({ timestamp: m.recordedAt, value: m.value })),
      total: values.reduce((s, v) => s + v, 0), average: values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0,
      min: values.length > 0 ? Math.min(...values) : 0, max: values.length > 0 ? Math.max(...values) : 0,
    };
  }

  getEventCount(name?: string): number { return name ? this.events.filter(e => e.name === name).length : this.events.length; }
  getRecentEvents(limit: number = 50): AnalyticsEvent[] { return this.events.slice(-limit); }
  getDomainBreakdown(): Record<string, number> { return this.events.reduce((a, e) => { a[e.domain] = (a[e.domain] || 0) + 1; return a; }, {} as Record<string, number>); }
}

export const createAnalytics = () => new AnalyticsService();
