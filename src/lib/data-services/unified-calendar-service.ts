// SITA OS — Unified Calendar Data Service
// Aggregates events from calendar_events, appointments, and crm_tasks

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface UnifiedCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // ISO datetime
  endTime?: string;
  domain: "personal" | "business" | "household" | "finance" | "concierge";
  eventType: "meeting" | "task" | "reminder" | "appointment" | "deadline" | "travel";
  source: "manual" | "appointment" | "crm" | "demo";
  sourceId?: string;
  location?: string;
  priority?: string;
  notes?: string;
  color?: string;
  status?: string;
  recurring?: string;
}

// ── Demo data ──────────────────────────────────────────────
function generateDemoEvents(year: number, month: number): UnifiedCalendarEvent[] {
  const events: UnifiedCalendarEvent[] = [];
  const base = new Date(year, month, 1);

  const templates: Omit<UnifiedCalendarEvent, "id" | "date">[] = [
    { title: "Strategy Review", domain: "business", eventType: "meeting", source: "demo", color: "hsl(var(--primary))", startTime: "09:00", endTime: "10:00" },
    { title: "Dentist Appointment", domain: "concierge", eventType: "appointment", source: "demo", color: "hsl(38 85% 58%)", startTime: "14:30", endTime: "15:30", location: "Dr. Smith Clinic" },
    { title: "Tax Filing Deadline", domain: "finance", eventType: "deadline", source: "demo", color: "hsl(152 55% 48%)", priority: "high" },
    { title: "Portfolio Rebalance", domain: "finance", eventType: "task", source: "demo", color: "hsl(152 55% 48%)", startTime: "11:00", endTime: "11:30" },
    { title: "Board Meeting", domain: "business", eventType: "meeting", source: "demo", color: "hsl(var(--primary))", startTime: "15:00", endTime: "17:00", location: "Boardroom A" },
    { title: "Grocery Pickup", domain: "household", eventType: "task", source: "demo", color: "hsl(38 85% 58%)", startTime: "18:00", endTime: "18:30" },
    { title: "Investor Call", domain: "business", eventType: "meeting", source: "demo", color: "hsl(var(--primary))", startTime: "10:00", endTime: "11:00" },
    { title: "Car Service", domain: "concierge", eventType: "appointment", source: "demo", color: "hsl(38 85% 58%)", startTime: "08:00", endTime: "09:00", location: "AutoCenter" },
    { title: "Invoice Due", domain: "finance", eventType: "deadline", source: "demo", color: "hsl(152 55% 48%)", priority: "high" },
    { title: "Team Standup", domain: "business", eventType: "meeting", source: "demo", color: "hsl(var(--primary))", startTime: "09:00", endTime: "09:15", recurring: "daily" },
  ];

  for (let i = 0; i < templates.length; i++) {
    const day = 2 + i * 3;
    if (day > 28) break;
    const d = new Date(base);
    d.setDate(day);
    events.push({
      ...templates[i],
      id: `demo-cal-${i}`,
      date: d.toISOString().slice(0, 10),
    });
  }
  return events;
}

// ── Fetch from calendar_events table ────────────────────────
async function fetchCalendarEventsFromDB(userId: string, startDate: string, endDate: string): Promise<UnifiedCalendarEvent[]> {
  const { data, error } = await fromTable("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date", { ascending: true });

  if (error || !data) return [];

  return data.map((e: any): UnifiedCalendarEvent => ({
    id: e.id,
    title: e.title,
    date: e.event_date,
    startTime: e.start_time || undefined,
    endTime: e.end_time || undefined,
    domain: e.domain || "personal",
    eventType: e.event_type || "meeting",
    source: "manual",
    sourceId: e.source_id || undefined,
    location: e.location || undefined,
    priority: e.priority || "medium",
    notes: e.notes || undefined,
    color: e.color || undefined,
    status: "confirmed",
    recurring: e.recurring || undefined,
  }));
}

// ── Fetch from appointments table (concierge) ───────────────
async function fetchAppointmentsAsEvents(userId: string, startDate: string, endDate: string): Promise<UnifiedCalendarEvent[]> {
  const { data, error } = await fromTable("appointments")
    .select("*")
    .eq("user_id", userId)
    .gte("appointment_date", startDate)
    .lte("appointment_date", endDate)
    .order("appointment_date", { ascending: true });

  if (error || !data) return [];

  return data.map((a: any): UnifiedCalendarEvent => ({
    id: `apt-${a.id}`,
    title: a.title,
    date: a.appointment_date ? a.appointment_date.slice(0, 10) : "",
    startTime: a.appointment_date || undefined,
    domain: "concierge",
    eventType: "appointment",
    source: "appointment",
    sourceId: a.id,
    location: a.location || undefined,
    priority: "medium",
    notes: a.notes || undefined,
    color: "hsl(38 85% 58%)",
    status: a.status || "confirmed",
  }));
}

// ── Main fetch function ─────────────────────────────────────
export type CalendarSource = "personal" | "business" | "finance" | "concierge" | "household";

export async function fetchUnifiedCalendarEvents(
  year: number,
  month: number,
  enabledSources: CalendarSource[],
  isDemo: boolean
): Promise<UnifiedCalendarEvent[]> {
  if (isDemo) return generateDemoEvents(year, month);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return generateDemoEvents(year, month);

  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  const promises: Promise<UnifiedCalendarEvent[]>[] = [
    fetchCalendarEventsFromDB(user.id, startDate, endDate),
  ];

  if (enabledSources.includes("concierge")) {
    promises.push(fetchAppointmentsAsEvents(user.id, startDate, endDate));
  }

  const results = await Promise.all(promises);
  const allEvents = results.flat();

  // Filter by enabled sources
  return allEvents.filter(e => enabledSources.includes(e.domain));
}
