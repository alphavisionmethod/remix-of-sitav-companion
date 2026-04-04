// ═══════════════════════════════════════════════════════════════
// SITA OS — Timeline Calendar Service
// Unified timeline aggregation, calendar sync, event correlation
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts";

export type TimelineEventType = "booking" | "payment" | "task" | "notification" | "milestone" | "connector-sync" | "workflow" | "system" | "custom";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  domain: DomainId;
  start: string;
  end?: string;
  allDay: boolean;
  userId: string;
  entityId?: string;
  entityType?: string;
  sourceService: string;
  importance: "critical" | "high" | "normal" | "low";
  color?: string;
  icon?: string;
  actionUrl?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CalendarView {
  date: string;
  events: TimelineEvent[];
  dayScore: number;
  busySlots: { start: string; end: string }[];
  freeSlots: { start: string; end: string }[];
}

export interface TimelineCorrelation {
  eventIds: string[];
  correlationType: "causal" | "temporal" | "entity-linked" | "workflow";
  description: string;
  confidence: number;
}

export class TimelineCalendarService {
  private events: Map<string, TimelineEvent> = new Map();
  private correlations: TimelineCorrelation[] = [];

  addEvent(event: Omit<TimelineEvent, "id" | "createdAt">): TimelineEvent {
    const full: TimelineEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.events.set(full.id, full);
    this.detectCorrelations(full);
    return full;
  }

  removeEvent(id: string): boolean {
    return this.events.delete(id);
  }

  getEventsForDate(userId: string, date: string): TimelineEvent[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return Array.from(this.events.values())
      .filter(e => e.userId === userId && e.start >= dayStart.toISOString() && e.start <= dayEnd.toISOString())
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  getEventsForRange(userId: string, from: string, to: string): TimelineEvent[] {
    return Array.from(this.events.values())
      .filter(e => e.userId === userId && e.start >= from && e.start <= to)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  getCalendarView(userId: string, date: string): CalendarView {
    const events = this.getEventsForDate(userId, date);
    const busySlots = events
      .filter(e => !e.allDay && e.end)
      .map(e => ({ start: e.start, end: e.end! }));

    // Calculate free slots between 8am-6pm
    const freeSlots: { start: string; end: string }[] = [];
    const d = new Date(date);
    d.setHours(8, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0);

    let cursor = d.toISOString();
    for (const slot of busySlots.sort((a, b) => a.start.localeCompare(b.start))) {
      if (slot.start > cursor) freeSlots.push({ start: cursor, end: slot.start });
      cursor = slot.end > cursor ? slot.end : cursor;
    }
    if (cursor < dayEnd.toISOString()) freeSlots.push({ start: cursor, end: dayEnd.toISOString() });

    return {
      date,
      events,
      dayScore: Math.max(0, 100 - events.length * 10),
      busySlots,
      freeSlots,
    };
  }

  getUpcoming(userId: string, limit: number = 10): TimelineEvent[] {
    const now = new Date().toISOString();
    return Array.from(this.events.values())
      .filter(e => e.userId === userId && e.start >= now)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, limit);
  }

  getCorrelations(eventId: string): TimelineCorrelation[] {
    return this.correlations.filter(c => c.eventIds.includes(eventId));
  }

  getEventsByEntity(entityId: string): TimelineEvent[] {
    return Array.from(this.events.values()).filter(e => e.entityId === entityId);
  }

  private detectCorrelations(event: TimelineEvent): void {
    if (!event.entityId) return;
    const related = Array.from(this.events.values()).filter(e =>
      e.id !== event.id && e.entityId === event.entityId
    );
    if (related.length > 0) {
      this.correlations.push({
        eventIds: [event.id, ...related.map(r => r.id)],
        correlationType: "entity-linked",
        description: `Events linked to entity ${event.entityId}`,
        confidence: 0.9,
      });
    }
  }
}

export function createTimelineCalendar(): TimelineCalendarService {
  return new TimelineCalendarService();
}
