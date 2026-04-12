// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Knowledge Base Service
// Per-advisor persistent knowledge store with relevance matching
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

export interface KnowledgeArticle {
  id: string;
  advisor_id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
  confidence: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AddKnowledgeInput {
  title: string;
  content: string;
  tags: string[];
  source?: string;
  confidence?: number;
}

export class AdvisorKnowledgeService {
  async addKnowledge(advisorId: string, userId: string, input: AddKnowledgeInput): Promise<KnowledgeArticle | null> {
    const { data, error } = await db.from("advisor_knowledge")
      .insert({
        advisor_id: advisorId,
        user_id: userId,
        title: input.title,
        content: input.content,
        tags: input.tags,
        source: input.source ?? "manual",
        confidence: input.confidence ?? 0.5,
        status: "active",
      })
      .select()
      .single();

    if (error) { console.error("addKnowledge error:", error); return null; }
    return data as unknown as KnowledgeArticle;
  }

  async getRelevantKnowledge(advisorId: string, userId: string, query: string, limit = 10): Promise<KnowledgeArticle[]> {
    // Keyword-based relevance: extract words, match against tags and title
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const { data, error } = await db.from("advisor_knowledge")
      .select("*")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("confidence", { ascending: false })
      .limit(50);

    if (error || !data) return [];

    // Score each article by keyword overlap
    const scored = (data as unknown as KnowledgeArticle[]).map(article => {
      const titleLower = article.title.toLowerCase();
      const contentLower = article.content.toLowerCase().slice(0, 500);
      const tagStr = article.tags.join(" ").toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (tagStr.includes(kw)) score += 3;
        if (titleLower.includes(kw)) score += 2;
        if (contentLower.includes(kw)) score += 1;
      }
      score += article.confidence * 2;
      return { article, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.article);
  }

  async getAllKnowledge(advisorId: string, userId: string): Promise<KnowledgeArticle[]> {
    const { data } = await db.from("advisor_knowledge")
      .select("*")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("confidence", { ascending: false });

    return (data as unknown as KnowledgeArticle[]) ?? [];
  }

  async promoteKnowledge(id: string): Promise<void> {
    await fromDynamicTable("advisor_knowledge").update({ confidence: 1.0 }).eq("id", id);
  }

  async deprecateKnowledge(id: string): Promise<void> {
    await fromDynamicTable("advisor_knowledge").update({ status: "deprecated" }).eq("id", id);
  }

  async seedFromCapabilities(advisorId: string, userId: string, capabilities: string[], description: string): Promise<void> {
    const existing = await this.getAllKnowledge(advisorId, userId);
    if (existing.length > 0) return; // Already seeded

    await this.addKnowledge(advisorId, userId, {
      title: `${advisorId} Core Capabilities`,
      content: `This advisor specializes in: ${capabilities.join(", ")}. ${description}`,
      tags: capabilities,
      source: "seed",
      confidence: 0.9,
    });
  }
}

export const advisorKnowledgeService = new AdvisorKnowledgeService();

