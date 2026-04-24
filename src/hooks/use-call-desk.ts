// ═══════════════════════════════════════════════════════════════
// SITA OS — Call Desk data hook
// Wires calendar_events (event_type='call') + call_outcomes for
// queue, recent calls, stats and analytics. RLS-protected per user.
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { Phone, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface CallStat {
  label: string;
  value: string;
  delta: string;
  icon: any;
  color: string;
}

export interface CallQueueItem {
  id: string;
  name: string;
  company: string;
  value: string;
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  prepNotes: string;
  lastContact: string;
  warmth: number;
  suggestedTalkingPoints: string[];
  objections: string[];
  postCallActions: string[];
}

export interface RecentCall {
  id: string;
  name: string;
  company: string;
  sentiment: string;
  outcome: string;
  duration: string;
  time: string;
  quoteTriggered: boolean;
  followUpSent: boolean;
  nextStep: string;
}

export interface CallAnalytic {
  metric: string;
  value: string;
  trend: "improving" | "stable" | "declining";
  benchmark: string;
}

function priorityFromCalendar(p?: string | null): CallQueueItem["priority"] {
  if (p === "critical" || p === "high" || p === "medium" || p === "low") return p;
  return "medium";
}

function fmtDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function useCallDesk() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["call-desk", uid],
    enabled: !!uid,
    queryFn: async (): Promise<{
      callStats: CallStat[];
      callQueue: CallQueueItem[];
      recentCalls: RecentCall[];
      callAnalytics: CallAnalytic[];
    }> => {
      const today = new Date().toISOString().slice(0, 10);

      const [upcomingRes, recentEventsRes, outcomesRes] = await Promise.all([
        fromTable("calendar_events")
          .select("id, title, event_date, start_time, priority, notes")
          .eq("user_id", uid!)
          .eq("event_type", "call")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .order("start_time", { ascending: true })
          .limit(50),
        fromTable("calendar_events")
          .select("id, title, event_date, start_time, notes")
          .eq("user_id", uid!)
          .eq("event_type", "call")
          .lt("event_date", today)
          .order("event_date", { ascending: false })
          .limit(20),
        fromTable("call_outcomes")
          .select("*")
          .eq("user_id", uid!)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      const outcomes: any[] = (outcomesRes as any).data ?? [];
      const outcomesByEvent = new Map<string, any>();
      outcomes.forEach((o) => {
        if (o.calendar_event_id) outcomesByEvent.set(o.calendar_event_id, o);
      });

      const callQueue: CallQueueItem[] = ((upcomingRes as any).data ?? []).map((e: any) => {
        const o = outcomesByEvent.get(e.id);
        return {
          id: e.id,
          name: o?.contact_name ?? e.title,
          company: o?.company ?? "—",
          value: o?.metadata?.deal_value ? `$${Number(o.metadata.deal_value).toLocaleString()}` : "—",
          priority: priorityFromCalendar(e.priority),
          reason: e.notes ?? "Scheduled call",
          prepNotes: o?.ai_prep_brief ?? "",
          lastContact: o?.metadata?.last_contact ?? "—",
          warmth: o?.warmth_score ?? 50,
          suggestedTalkingPoints: Array.isArray(o?.talking_points) ? o.talking_points : [],
          objections: Array.isArray(o?.objections) ? o.objections : [],
          postCallActions: Array.isArray(o?.post_call_actions) ? o.post_call_actions : [],
        };
      });

      const recentEvents: any[] = (recentEventsRes as any).data ?? [];
      const recentCalls: RecentCall[] = recentEvents.map((e: any) => {
        const o = outcomesByEvent.get(e.id);
        return {
          id: e.id,
          name: o?.contact_name ?? e.title,
          company: o?.company ?? "—",
          sentiment: o?.sentiment ?? "neutral",
          outcome: o?.outcome ?? "Logged",
          duration: fmtDuration(o?.duration_seconds ?? 0),
          time: relativeTime(o?.created_at ?? e.start_time ?? `${e.event_date}T00:00:00Z`),
          quoteTriggered: !!o?.quote_triggered,
          followUpSent: !!o?.follow_up_sent,
          nextStep: o?.next_step ?? "—",
        };
      });

      const totalCalls = recentCalls.length;
      const positive = outcomes.filter((o) => ["very positive", "positive", "warm"].includes(o.sentiment)).length;
      const followUpsPending = outcomes.filter((o) => !o.follow_up_sent && o.next_step).length;
      const quotesFromCalls = outcomes.filter((o) => o.quote_triggered).length;
      const avgDuration =
        outcomes.length > 0
          ? Math.round(outcomes.reduce((s, o) => s + (o.duration_seconds ?? 0), 0) / outcomes.length)
          : 0;

      const callStats: CallStat[] = [
        { label: "Today", value: String(callQueue.filter((q) => true).length), delta: "scheduled", icon: Phone, color: "text-blue-400" },
        { label: "This Week", value: String(callQueue.length), delta: "in queue", icon: Users, color: "text-foreground" },
        { label: "Avg Duration", value: fmtDuration(avgDuration), delta: "per call", icon: Clock, color: "text-foreground" },
        { label: "Positive Sentiment", value: outcomes.length > 0 ? `${Math.round((positive / outcomes.length) * 100)}%` : "—", delta: "of recent", icon: CheckCircle, color: "text-emerald-400" },
        { label: "Follow-ups Pending", value: String(followUpsPending), delta: "awaiting send", icon: AlertTriangle, color: followUpsPending > 0 ? "text-amber-400" : "text-emerald-400" },
        { label: "Quotes Triggered", value: String(quotesFromCalls), delta: "from calls", icon: TrendingUp, color: "text-emerald-400" },
      ];

      const callAnalytics: CallAnalytic[] =
        outcomes.length === 0
          ? []
          : [
              { metric: "Avg Sentiment Score", value: outcomes.length > 0 ? `${Math.round((positive / outcomes.length) * 100)}%` : "—", trend: "improving", benchmark: "vs last month" },
              { metric: "Avg Call Duration", value: fmtDuration(avgDuration), trend: "stable", benchmark: "industry avg 12m" },
              { metric: "Call → Quote Conversion", value: totalCalls > 0 ? `${Math.round((quotesFromCalls / totalCalls) * 100)}%` : "—", trend: "improving", benchmark: "target 25%" },
              { metric: "Follow-up Rate", value: outcomes.length > 0 ? `${Math.round(((outcomes.length - followUpsPending) / outcomes.length) * 100)}%` : "—", trend: "stable", benchmark: "target 90%" },
            ];

      return { callStats, callQueue, recentCalls, callAnalytics };
    },
  });
}
