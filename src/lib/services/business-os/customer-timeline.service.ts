// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Customer Timeline Service
// ═══════════════════════════════════════════════════════════════

export interface TimelineEvent {
  id: string;
  accountId: string;
  type: "interaction" | "deal" | "invoice" | "support" | "system";
  title: string;
  detail: string;
  timestamp: string;
  actor: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export function aggregateTimeline(accountId: string, events: TimelineEvent[]): TimelineEvent[] {
  return events
    .filter(e => e.accountId === accountId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function detectEngagementGaps(events: TimelineEvent[]): { gapDays: number; lastEvent: TimelineEvent | null } {
  if (events.length === 0) return { gapDays: 999, lastEvent: null };
  const sorted = events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const lastEvent = sorted[0];
  const gapDays = Math.floor((Date.now() - new Date(lastEvent.timestamp).getTime()) / 86400000);
  return { gapDays, lastEvent };
}

export function summarizeEngagement(events: TimelineEvent[]): {
  totalInteractions: number;
  sentimentScore: number;
  avgGapDays: number;
  topActivityType: string;
} {
  const interactions = events.filter(e => e.type === "interaction");
  const sentimentMap = { positive: 1, neutral: 0, negative: -1 };
  const sentimentSum = events.reduce((s, e) => s + (sentimentMap[e.sentiment || "neutral"]), 0);

  const typeCounts = events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "none";

  return {
    totalInteractions: interactions.length,
    sentimentScore: events.length > 0 ? Math.round((sentimentSum / events.length) * 50 + 50) : 50,
    avgGapDays: events.length > 1 ? Math.round((Date.now() - new Date(events[events.length - 1].timestamp).getTime()) / 86400000 / events.length) : 0,
    topActivityType: topType,
  };
}
