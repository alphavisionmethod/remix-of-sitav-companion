// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Memory Service
// Per-advisor, per-user conversational memory & learned facts
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable} from "@/lib/supabase-helpers";

export interface AdvisorMemory {
  id: string;
  advisor_id: string;
  user_id: string;
  memory_type: "summary" | "fact" | "preference";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export class AdvisorMemoryService {
  async saveConversationSummary(advisorId: string, userId: string, summary: string, metadata?: Record<string, unknown>): Promise<void> {
    await fromDynamicTable("advisor_memories").insert({
      advisor_id: advisorId,
      user_id: userId,
      memory_type: "summary",
      content: summary,
      metadata: metadata ?? {},
    } as never);
  }

  async saveUserFact(advisorId: string, userId: string, fact: string, metadata?: Record<string, unknown>): Promise<void> {
    // Check for duplicate facts
    const existing = await this.getUserFacts(advisorId, userId);
    const isDuplicate = existing.some(m => m.content.toLowerCase() === fact.toLowerCase());
    if (isDuplicate) return;

    await fromDynamicTable("advisor_memories").insert({
      advisor_id: advisorId,
      user_id: userId,
      memory_type: "fact",
      content: fact,
      metadata: metadata ?? {},
    });
  }

  async saveUserPreference(advisorId: string, userId: string, preference: string): Promise<void> {
    await fromDynamicTable("advisor_memories").insert({
      advisor_id: advisorId,
      user_id: userId,
      memory_type: "preference",
      content: preference,
      metadata: {},
    });
  }

  async getRecentMemories(advisorId: string, userId: string, limit = 5): Promise<AdvisorMemory[]> {
    const { data } = await supabase
      .from("advisor_memories")
      .select("*")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("memory_type", "summary")
      .order("created_at", { ascending: false })
      .limit(limit);

    return (data as unknown as AdvisorMemory[]) ?? [];
  }

  async getUserFacts(advisorId: string, userId: string): Promise<AdvisorMemory[]> {
    const { data } = await supabase
      .from("advisor_memories")
      .select("*")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("memory_type", "fact")
      .order("created_at", { ascending: false })
      .limit(50);

    return (data as unknown as AdvisorMemory[]) ?? [];
  }

  async getUserPreferences(advisorId: string, userId: string): Promise<AdvisorMemory[]> {
    const { data } = await supabase
      .from("advisor_memories")
      .select("*")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("memory_type", "preference")
      .order("created_at", { ascending: false })
      .limit(20);

    return (data as unknown as AdvisorMemory[]) ?? [];
  }

  async getCrossAdvisorFacts(userId: string, excludeAdvisorId: string): Promise<AdvisorMemory[]> {
    const { data } = await supabase
      .from("advisor_memories")
      .select("*")
      .eq("user_id", userId)
      .eq("memory_type", "fact")
      .neq("advisor_id", excludeAdvisorId)
      .order("created_at", { ascending: false })
      .limit(20);

    return (data as unknown as AdvisorMemory[]) ?? [];
  }

  async getMemoryCount(advisorId: string, userId: string): Promise<{ summaries: number; facts: number; preferences: number }> {
    const [s, f, p] = await Promise.all([
      fromDynamicTable("advisor_memories").select("id", { count: "exact", head: true }).eq("advisor_id", advisorId).eq("user_id", userId).eq("memory_type", "summary"),
      fromDynamicTable("advisor_memories").select("id", { count: "exact", head: true }).eq("advisor_id", advisorId).eq("user_id", userId).eq("memory_type", "fact"),
      fromDynamicTable("advisor_memories").select("id", { count: "exact", head: true }).eq("advisor_id", advisorId).eq("user_id", userId).eq("memory_type", "preference"),
    ]);
    return { summaries: s.count ?? 0, facts: f.count ?? 0, preferences: p.count ?? 0 };
  }
}

export const advisorMemoryService = new AdvisorMemoryService();

