// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Probability Lab data hook
// Wires scenarios (scenario_type='event_probability') for the
// Investment Event Probability Lab.
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export type Sentiment = "bullish" | "bearish" | "neutral";

export interface ScenarioBranch {
  label: string;
  probability: number;
  impact: string;
  sentiment: Sentiment;
}

export interface EventProbability {
  id: string;
  title: string;
  catalystDate: string;
  probability: number;
  previousProbability: number;
  trend: "rising" | "falling" | "flat";
  confidence: number;
  sleeveExposure: number;
  branches: ScenarioBranch[];
}

function pickSentiment(raw?: string): Sentiment {
  if (raw === "bullish" || raw === "bearish") return raw;
  return "neutral";
}

export function useEventProbabilities() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["event-probabilities", uid],
    enabled: !!uid,
    queryFn: async (): Promise<EventProbability[]> => {
      const { data = [] } = await fromTable("scenarios")
        .select("id, name, inputs, outputs, updated_at, created_at")
        .eq("user_id", uid!)
        .eq("scenario_type", "event_probability")
        .order("updated_at", { ascending: false })
        .limit(20);

      return (data ?? []).map((s: any): EventProbability => {
        const o = s.outputs ?? {};
        const i = s.inputs ?? {};
        const prob = clamp(Number(o.probability ?? 0), 0, 100);
        const prev = clamp(Number(o.previous_probability ?? prob), 0, 100);
        const trend: EventProbability["trend"] = prob > prev + 1 ? "rising" : prob < prev - 1 ? "falling" : "flat";
        const branches: ScenarioBranch[] = Array.isArray(o.branches)
          ? o.branches.map((b: any) => ({
              label: String(b.label ?? "Branch"),
              probability: clamp(Number(b.probability ?? 0), 0, 100),
              impact: String(b.impact ?? ""),
              sentiment: pickSentiment(b.sentiment),
            }))
          : [];
        return {
          id: s.id,
          title: s.name,
          catalystDate: i.catalyst_date ?? "TBD",
          probability: prob,
          previousProbability: prev,
          trend,
          confidence: clamp(Number(o.confidence ?? 0), 0, 100),
          sleeveExposure: clamp(Number(o.sleeve_exposure ?? 0), 0, 100),
          branches,
        };
      });
    },
  });
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
