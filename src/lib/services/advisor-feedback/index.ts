// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Feedback & Correction Service
// Captures corrections, ratings, and synthesizes anti-patterns
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface FeedbackRecord {
  id: string;
  advisor_id: string;
  user_id: string;
  message_id: string | null;
  feedback_type: "correction" | "rating";
  original_response: string | null;
  corrected_response: string | null;
  rating: number | null;
  category: string;
  comment: string | null;
  created_at: string;
}

export class AdvisorFeedbackService {
  async recordCorrection(
    advisorId: string,
    userId: string,
    originalResponse: string,
    correction: string,
    category: string = "general"
  ): Promise<void> {
    await fromTable("advisor_feedback").insert({
      advisor_id: advisorId,
      user_id: userId,
      feedback_type: "correction",
      original_response: originalResponse,
      corrected_response: correction,
      category,
    });
  }

  async recordRating(
    advisorId: string,
    userId: string,
    messageId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    await fromTable("advisor_feedback").insert({
      advisor_id: advisorId,
      user_id: userId,
      message_id: messageId,
      feedback_type: "rating",
      rating: Math.max(1, Math.min(5, rating)),
      comment: comment ?? null,
    });
  }

  async getCorrections(advisorId: string, userId: string, limit = 10): Promise<FeedbackRecord[]> {
    const { data } = await supabase
      .from("advisor_feedback")
      .select("*")
      .eq("advisor_id", advisorId)
      .eq("user_id", userId)
      .eq("feedback_type", "correction")
      .order("created_at", { ascending: false })
      .limit(limit);

    return (data as unknown as FeedbackRecord[]) ?? [];
  }

  async getAdvisorScore(advisorId: string, userId: string): Promise<{ avgRating: number; totalRatings: number; correctionCount: number }> {
    const [ratings, corrections] = await Promise.all([
      supabase
        .from("advisor_feedback")
        .select("rating")
        .eq("advisor_id", advisorId)
        .eq("user_id", userId)
        .eq("feedback_type", "rating")
        .not("rating", "is", null)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("advisor_feedback")
        .select("id", { count: "exact", head: true })
        .eq("advisor_id", advisorId)
        .eq("user_id", userId)
        .eq("feedback_type", "correction"),
    ]);

    const ratingValues = ((ratings.data as unknown as { rating: number }[]) ?? []).map(r => r.rating);
    const avg = ratingValues.length > 0 ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : 0;

    return {
      avgRating: Math.round(avg * 10) / 10,
      totalRatings: ratingValues.length,
      correctionCount: corrections.count ?? 0,
    };
  }

  /**
   * Builds anti-pattern guardrails from recent corrections to inject into system prompt.
   */
  async buildCorrectionGuardrails(advisorId: string, userId: string): Promise<string> {
    const corrections = await this.getCorrections(advisorId, userId, 8);
    if (corrections.length === 0) return "";

    const lines = corrections.map(c => {
      const orig = (c.original_response ?? "").slice(0, 100);
      const fixed = (c.corrected_response ?? "").slice(0, 100);
      return `- AVOID: "${orig}..." → PREFER: "${fixed}..."`;
    });

    return `\n\n## Past Corrections (learn from these)\n${lines.join("\n")}`;
  }
}

export const advisorFeedbackService = new AdvisorFeedbackService();

