import { supabase } from "@/integrations/supabase/client";
import { generateCalendarDemoEvents } from "@/lib/mock-data/calendar";

export async function fetchCalendarEvents() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return generateCalendarDemoEvents();

  const { data, error } = await supabase.from("events").select("*").eq("user_id", user.id).order("start_time", { ascending: true });
  if (error || !data || data.length === 0) return generateCalendarDemoEvents();

  return data.map((e: any) => ({
    id: e.id, title: e.title, date: e.start_time ? new Date(e.start_time).toISOString().slice(0, 10) : "",
    time: e.start_time ? new Date(e.start_time).toTimeString().slice(0, 5) : "",
    category: e.category || "general", domain: e.category || "general",
    priority: e.priority || "normal",
  }));
}
