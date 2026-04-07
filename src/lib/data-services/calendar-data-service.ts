// SITA OS — Calendar Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/lib/hooks/useRealityProvider";

export interface CalendarEventItem {
  id: string; title: string; date: string; type: "booking" | "meeting" | "deadline" | "task";
  status: string; provider?: string;
}

function generateDemoCalendarEvents(year: number, month: number): CalendarEventItem[] {
  const events: CalendarEventItem[] = [];
  const base = new Date(year, month, 1);
  const titles = ["Strategy Review", "Investor Call", "Tax Filing Deadline", "Portfolio Rebalance", "Board Meeting", "Advisor Sync"];
  const types: CalendarEventItem["type"][] = ["meeting", "meeting", "deadline", "task", "meeting", "meeting"];
  for (let i = 0; i < 6; i++) {
    const day = 3 + i * 4;
    if (day > 28) break;
    const d = new Date(base); d.setDate(day);
    events.push({ id: `demo-ev-${i}`, title: titles[i], date: d.toISOString().slice(0, 10), type: types[i], status: "confirmed" });
  }
  return events;
}

export async function fetchCalendarEvents(year: number, month: number, mode: RealityModeKey = "real"): Promise<ModeAwareResult<CalendarEventItem[]>> {
  const demoEvents = generateDemoCalendarEvents(year, month);
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: demoEvents, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: demoEvents, emptyDefault: [] });
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0).toISOString();
  const { data, error } = await fromTable("events").select("*").eq("user_id", user.id)
    .gte("start_time", startDate).lte("start_time", endDate).order("start_time", { ascending: true });
  const mapped = (!error && data && data.length > 0) ? data.map((e: any): CalendarEventItem => ({
    id: e.id, title: e.title, date: e.start_time ? new Date(e.start_time).toISOString().slice(0, 10) : "",
    type: "booking", status: e.status || "confirmed", provider: e.location || undefined,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: demoEvents, emptyDefault: [] });
}
