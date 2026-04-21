import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

interface TimelineEntry {
  id: string;
  type: "action" | "recommendation";
  summary: string;
  confidence: number;
  status: string;
  created_at: string;
  advisor_id?: string;
  domain?: string;
}

export const AdvisorTimelineView = ({ advisors }: { advisors: AdvisorConfig[] }) => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      const domains = [...new Set(advisors.map(a => a.domain))];

      const [actionsRes, recsRes] = await Promise.all([
        supabase
          .from("advisor_action_queue")
          .select("id, summary, confidence, status, created_at, advisor_id, domain")
          .in("domain", domains)
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("ai_workforce_recommendations")
          .select("id, summary, confidence, status, created_at, domain, role_key")
          .in("domain", domains)
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

      const actions: TimelineEntry[] = (actionsRes.data || []).map(a => ({
        id: a.id, type: "action" as const, summary: a.summary, confidence: Number(a.confidence) * 100,
        status: a.status, created_at: a.created_at, advisor_id: a.advisor_id, domain: a.domain,
      }));

      const recs: TimelineEntry[] = (recsRes.data || []).map(r => ({
        id: r.id, type: "recommendation" as const, summary: r.summary, confidence: Number(r.confidence) * 100,
        status: r.status, created_at: r.created_at, domain: r.domain,
      }));

      const merged = [...actions, ...recs].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 20);

      setEntries(merged);
      setLoading(false);
    };

    fetchTimeline();
  }, [advisors]);

  const getAdvisorForEntry = (entry: TimelineEntry) => {
    return advisors.find(a => a.advisorId === entry.advisor_id || a.domain === entry.domain) || advisors[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No advisor activity yet</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">Actions and recommendations will appear here</p>
      </div>
    );
  }

  return (
    <motion.div
      className="mt-4 relative"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50" />

      <div className="space-y-3">
        {entries.map((entry) => {
          const advisor = getAdvisorForEntry(entry);
          const StatusIcon = entry.status === "completed" || entry.status === "approved"
            ? CheckCircle
            : entry.status === "failed" ? AlertTriangle : Clock;

          return (
            <motion.div
              key={entry.id}
              variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
              className="flex items-start gap-3 pl-2 relative"
            >
              {/* Avatar on timeline */}
              <div className="relative z-10 bg-background rounded-full">
                <AdvisorPortrait domain={advisor.domain} name={advisor.name} status="active" size="sm" />
              </div>

              <div className="flex-1 rounded-lg border border-border/40 bg-card/80 p-3 hover:bg-card transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded",
                      entry.type === "action" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
                    )}>
                      {entry.type}
                    </span>
                    <StatusIcon className={cn(
                      "h-3 w-3",
                      entry.status === "completed" || entry.status === "approved" ? "text-[hsl(var(--trust-safe))]" :
                      entry.status === "failed" ? "text-destructive" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{entry.summary || "No summary"}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{advisor.name}</span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    entry.confidence >= 80 ? "text-[hsl(var(--trust-safe))]" : entry.confidence >= 60 ? "text-amber-500" : "text-orange-500"
                  )}>
                    {Math.round(entry.confidence)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
