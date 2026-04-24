// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Reflection / Journal client (Phase G)
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SitaJournalEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  summary: { headline?: string; details?: string } & Record<string, unknown>;
  lessons: Array<{ id?: string; text: string; category?: string }>;
  wins: Array<{ id?: string; text: string }>;
  blockers: Array<{ id?: string; text: string; severity?: "low" | "med" | "high" }>;
  created_at: string;
}

export async function listRecentJournal(userId: string, days = 14): Promise<SitaJournalEntry[]> {
  const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("sita_journal_entries" as never)
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", since)
    .order("entry_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SitaJournalEntry[];
}