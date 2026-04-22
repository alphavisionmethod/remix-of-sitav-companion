import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { BarChart3, Calendar, CheckCircle, Clock, ChevronRight, Target } from "lucide-react";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEMO_SESSIONS } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function BoardroomHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["boardroom-sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("boardroom_sessions")
        .select("*, boardroom_decisions(id)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return DEMO_SESSIONS;
      return data.map((s: Record<string, any>) => ({
        ...s,
        decisions_count: s.boardroom_decisions?.length || 0,
      }));
    },
  });

  const completed = sessions.filter((s: Record<string, any>) => s.status === "completed").length;
  const active = sessions.filter((s: Record<string, any>) => s.status === "active").length;
  const avgConfidence = sessions.length > 0
    ? Math.round(sessions.reduce((a: number,  s: Record<string, any>) => a + (s.confidence_score || 0), 0) / sessions.length)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-6 max-w-7xl mx-auto">
<SitaPageHeader
        title="Boardroom History"
        subtitle="Past sessions, decisions, and confidence trends"
        actions={<SitaButton variant="primary" onClick={() => navigate("/boardroom/replay")}><BarChart3 className="h-4 w-4" /> New Session</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Sessions" value={sessions.length} icon={Calendar} />
        <KPITile label="Completed" value={completed} icon={CheckCircle} />
        <KPITile label="Active" value={active} icon={Clock} />
        <KPITile label="Avg Confidence" value={`${avgConfidence}%`} icon={Target} />
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <EmptyState icon={BarChart3} title="No sessions yet" description="Start a boardroom session to see history here" />
        ) : (
          sessions.map((session: Record<string, any>) => (
            <SitaCard key={session.id} className="p-4 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate("/boardroom/replay")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{session.title || "Untitled Session"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px]">{session.session_type}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(session.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{session.decisions_count} decisions</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <ConfidenceBar value={session.confidence_score || 0} size="sm" />
                  </div>
                  <Badge variant={session.status === "completed" ? "default" : "secondary"} className={cn("text-[9px] capitalize", session.status === "completed" && "bg-trust-safe/10 text-trust-safe border-trust-safe/20")}>
                    {session.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </SitaCard>
          ))
        )}
      </div>
    </motion.div>
  );
}
