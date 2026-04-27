// ═══════════════════════════════════════════════════════════════
// SITA OS — Growth Advisor Board data hook
// Wires advisor_registry (revenue domain) + advisor_board_recommendations.
// Debates/clusters/whatChanged/invalidation are derived from rec metadata.
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface AdvisorBoardEntry {
  name: string;
  domain: string;
  icon: any;
  confidence: number;
  type: "neutral" | "warning" | "alert";
  stance: string;
  watching: string[];
  recommendation: string;
}

export interface DebateEntry {
  topic: string;
  disagreements: Array<{
    advisorA: string;
    advisorB: string;
    confidenceA: number;
    confidenceB: number;
    stanceA: string;
    stanceB: string;
    severity: string;
  }>;
  synthesis: string;
}

export interface ChangeEntry {
  advisor: string;
  change: string;
  reason: string;
  when: string;
}

export interface InvalidationEntry {
  advisor: string;
  condition: string;
  impact: string;
}

export interface ClusterEntry {
  theme: string;
  direction: "bullish" | "bearish" | "neutral";
  advisors: string[];
  avgConfidence: number;
}

export function useGrowthAdvisorBoard() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["growth-advisor-board", uid],
    queryFn: async (): Promise<{
      advisors: AdvisorBoardEntry[];
      debates: DebateEntry[];
      whatChanged: ChangeEntry[];
      invalidation: InvalidationEntry[];
      clusters: ClusterEntry[];
    }> => {
      const [advRes, recRes] = await Promise.all([
        fromTable("advisor_registry")
          .select("advisor_id, display_name, domain, capabilities, confidence_threshold, metadata")
          .eq("domain", "revenue"),
        uid
          ? fromTable("advisor_board_recommendations")
            .select("advisor_id, title, summary, urgency_score, confidence_score, business_impact_score, contributing_advisors, action_plan, created_at")
            .eq("user_id", uid!)
            .eq("status", "new")
            .order("urgency_score", { ascending: false })
            .limit(50)
          : Promise.resolve({ data: [] }),
      ]);

      const recs: any[] = (recRes as any).data ?? [];
      const recsByAdvisor = new Map<string, any[]>();
      recs.forEach((r) => {
        const list = recsByAdvisor.get(r.advisor_id) ?? [];
        list.push(r);
        recsByAdvisor.set(r.advisor_id, list);
      });

      const advisors: AdvisorBoardEntry[] = ((advRes as any).data ?? []).map((a: any) => {
        const advisorRecs = recsByAdvisor.get(a.advisor_id) ?? [];
        const top = advisorRecs[0];
        const confidence = top?.confidence_score ?? Number(a.confidence_threshold ?? 0.7);
        const urgency = top?.urgency_score ?? 0;
        const type: AdvisorBoardEntry["type"] = urgency >= 0.8 ? "alert" : urgency >= 0.5 ? "warning" : "neutral";
        return {
          name: a.display_name,
          domain: a.domain,
          icon: Sparkles,
          confidence: Number(confidence),
          type,
          stance: top?.summary ?? "Awaiting first signal in this domain.",
          watching: Array.isArray(a.capabilities) ? a.capabilities.slice(0, 3) : [],
          recommendation: top?.title ?? "No active recommendation",
        };
      });

      // Debates: pair recommendations with overlapping contributing_advisors
      const debates: DebateEntry[] = [];
      const whatChanged: ChangeEntry[] = recs.slice(0, 10).map((r) => ({
        advisor: r.advisor_id,
        change: r.title,
        reason: r.summary?.slice(0, 100) ?? "",
        when: new Date(r.created_at).toLocaleDateString(),
      }));
      const invalidation: InvalidationEntry[] = recs
        .filter((r) => r.action_plan?.invalidation_condition)
        .map((r) => ({
          advisor: r.advisor_id,
          condition: r.action_plan.invalidation_condition,
          impact: r.action_plan.invalidation_impact ?? "Recommendation would be revisited",
        }));
      const clusters: ClusterEntry[] = [];

      return { advisors, debates, whatChanged, invalidation, clusters };
    },
  });
}