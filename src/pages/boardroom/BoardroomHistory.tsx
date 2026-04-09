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
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";



const DEMO_SESSIONS = [
  { id: "demo-1", title: "Weekly Executive Review", session_type: "weekly", status: "completed", confidence_score: 87, started_at: new Date(Date.now() - 86400000 * 2).toISOString(), completed_at: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(), decisions_count: 4 },
  { id: "demo-2", title: "Financial Health Check", session_type: "financial-health", status: "completed", confidence_score: 92, started_at: new Date(Date.now() - 86400000 * 5).toISOString(), completed_at: new Date(Date.now() - 86400000 * 5 + 1200000).toISOString(), decisions_count: 2 },
  { id: "demo-3", title: "Pipeline Review", session_type: "pipeline-review", status: "completed", confidence_score: 79, started_at: new Date(Date.now() - 86400000 * 9).toISOString(), completed_at: new Date(Date.now() - 86400000 * 9 + 2400000).toISOString(), decisions_count: 5 },
  { id: "demo-4", title: "Morning Briefing", session_type: "morning-briefing", status: "active", confidence_score: 81, started_at: new Date().toISOString(), completed_at: null, decisions_count: 0 },
];

export default function BoardroomHistory() {
  const { isDemoMode } = useDataMode();
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
      return data.map((s: any) => ({
        ...s,
        decisions_count: s.boardroom_decisions?.length || 0,
      }));
    },
  });

  const completed = sessions.filter((s: any) => s.status === "completed").length;
  const active = sessions.filter((s: any) => s.status === "active").length;
  const avgConfidence = sessions.length > 0
    ? Math.round(sessions.reduce((a: number, s: any) => a + (s.confidence_score || 0), 0) / sessions.length)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-6 max-w-7xl mx-auto">
      <DemoModeBadge />
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
          sessions.map((session: any) => (
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
