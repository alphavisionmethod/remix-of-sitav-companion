// ═══════════════════════════════════════════════════════════════
// SITA OS — Catalyst Events data hook
// Wires calendar_events (domain='money') + risk_scenarios into the
// Investment Catalyst War Room timeline.
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface CatalystEvent {
  id: string;
  title: string;
  description: string;
  date: string;          // YYYY-MM-DD
  type: "macro" | "earnings" | "product" | "event" | "catalyst";
  impact: "low" | "medium" | "high";
  assets: string[];
  portfolioExposure: number; // 0-100
}

const CALENDAR_EVENT_TYPES = ["earnings", "macro", "catalyst", "product", "event"] as const;

function pickType(raw?: string | null): CatalystEvent["type"] {
  if (raw === "earnings" || raw === "macro" || raw === "product" || raw === "event" || raw === "catalyst") return raw;
  return "event";
}

function pickImpact(priority?: string | null, exposure = 0): CatalystEvent["impact"] {
  if (priority === "critical" || priority === "high" || exposure > 50) return "high";
  if (priority === "medium" || exposure > 20) return "medium";
  return "low";
}

export function useCatalystEvents() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["catalyst-events", uid],
    enabled: !!uid,
    queryFn: async (): Promise<CatalystEvent[]> => {
      const today = new Date().toISOString().slice(0, 10);
      const horizon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

      const [eventsRes, watchRes, scenariosRes] = await Promise.all([
        fromTable("calendar_events")
          .select("id, title, notes, event_date, event_type, priority")
          .eq("user_id", uid!)
          .eq("domain", "money")
          .in("event_type", CALENDAR_EVENT_TYPES as unknown as string[])
          .gte("event_date", today)
          .lte("event_date", horizon)
          .order("event_date", { ascending: true })
          .limit(60),
        fromTable("market_watchlist_items")
          .select("symbol, weight_pct")
          .eq("user_id", uid!),
        fromTable("risk_scenarios")
          .select("id, title, assets, impact_pct")
          .eq("user_id", uid!)
          .limit(50),
      ]);

      const watchlist: Map<string, number> = new Map(
        ((watchRes as any).data ?? []).map((w: any) => [String(w.symbol).toUpperCase(), Number(w.weight_pct ?? 0)]),
      );
      const scenarios: any[] = (scenariosRes as any).data ?? [];

      const events: CatalystEvent[] = ((eventsRes as any).data ?? []).map((e: any) => {
        const tags: string[] = Array.isArray(e.notes_tags)
          ? e.notes_tags
          : extractTickers(`${e.title ?? ""} ${e.notes ?? ""}`);
        const exposure = tags.reduce((s: number, sym: string) => s + (watchlist.get(sym.toUpperCase()) ?? 0), 0);
        const scenarioMatch = scenarios.find((s: any) =>
          Array.isArray(s.assets) && s.assets.some((a: string) => tags.includes(String(a).toUpperCase())),
        );
        const impact = pickImpact(e.priority, exposure);
        return {
          id: e.id,
          title: e.title,
          description: e.notes ?? scenarioMatch?.title ?? "Calendar catalyst",
          date: e.event_date,
          type: pickType(e.event_type),
          impact,
          assets: tags.slice(0, 4),
          portfolioExposure: Math.min(100, Math.round(exposure)),
        };
      });

      return events;
    },
  });
}

function extractTickers(text: string): string[] {
  const matches = text.match(/\b[A-Z]{2,5}\b/g) ?? [];
  return Array.from(new Set(matches));
}
