import { supabase } from "@/integrations/supabase/client";
import { generateCalendarDemoEvents } from "@/lib/mock-data/calendar";

export async function fetchCalendarEvents(year: number, month: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return generateCalendarDemoEvents(year, month);

  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0).toISOString();

  const { data, error } = await supabase.from("events").select("*").eq("user_id", user.id)
    .gte("start_time", startDate).lte("start_time", endDate).order("start_time", { ascending: true });
  if (error || !data || data.length === 0) return generateCalendarDemoEvents(year, month);

  return data.map((e: any) => ({
    id: e.id, title: e.title,
    date: e.start_time ? new Date(e.start_time).toISOString().slice(0, 10) : "",
    type: "booking" as const, status: e.status || "confirmed",
    provider: e.location || undefined,
  }));
}
