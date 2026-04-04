import { SitaPageHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { MOCK_ACTIVITY_TIMELINE } from "@/lib/mock-data";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { StateBadge } from "@/components/sita/StateBadge";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const db: any = supabase;
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { motion } from "framer-motion";
import {
  Activity, Brain, Eye, CheckCircle, AlertTriangle, Clock, Sparkles, Shield,
  DollarSign, Briefcase, Users, Zap, ArrowRight, RotateCcw, XCircle, Bell
} from "lucide-react";

import { DEMO_ACTIVITY_TIMELINE } from "@/lib/demo-data";

const iconMap: Record<string, typeof Activity> = {
  "workflow.created": Zap, "workflow.executed": CheckCircle, "workflow.failed": XCircle,
  "workflow.approval_requested": Shield, "receipt.created": CheckCircle,
  "opportunity.detected": Sparkles, "connector.failed": AlertTriangle,
  "boardroom.generated": Brain, default: Activity,
};

const colorMap: Record<string, string> = {
  "workflow.created": "text-accent", "workflow.executed": "text-trust-verified",
  "workflow.failed": "text-urgency-critical", "workflow.approval_requested": "text-primary",
  "receipt.created": "text-trust-verified", "opportunity.detected": "text-accent",
  "connector.failed": "text-urgency-high", "boardroom.generated": "text-primary",
  default: "text-muted-foreground",
};

const borderMap: Record<string, string> = {
  "workflow.executed": "border-l-trust-verified",
  "workflow.failed": "border-l-urgency-critical",
  "workflow.approval_requested": "border-l-primary",
  "opportunity.detected": "border-l-accent",
  "connector.failed": "border-l-urgency-high",
  default: "border-l-muted",
};

<<<<<<< HEAD
=======
const ICON_LOOKUP: Record<string, typeof Activity> = {
  sparkles: Sparkles, check: CheckCircle, shield: Shield, eye: Eye,
  alert: AlertTriangle, brain: Brain, zap: Zap, users: Users,
  dollar: DollarSign, rotate: RotateCcw,
};

const demoTimeline = DEMO_ACTIVITY_TIMELINE.map(item => ({
  icon: ICON_LOOKUP[item.iconKey] || Activity,
  color: `text-${item.colorKey}`,
  title: item.title,
  subtitle: item.subtitle,
  time: item.time,
  type: item.type,
  border: `border-l-${item.borderKey}`,
}));
>>>>>>> 622190ca50c098af187c5feed1ffac931cae5666

const timeSince = (date: string) => {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const ActivityStream = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  const { data: liveEvents = [], isLoading } = useQuery({
    queryKey: ["events_stream", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await (db as any)
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const liveTimeline = (liveEvents as any[]).map((ev: any) => {
    const Icon = iconMap[ev.type] || iconMap.default;
    return {
      icon: Icon,
      color: colorMap[ev.type] || colorMap.default,
      title: ev.type.replace(/\./g, " → "),
      subtitle: JSON.stringify(ev.payload).slice(0, 100),
      time: timeSince(ev.created_at),
      type: ev.type.split(".")[0],
      border: borderMap[ev.type] || borderMap.default,
    };
  });

  const timeline = isDemoMode ? MOCK_ACTIVITY_TIMELINE : liveTimeline;

  return (
    <motion.div className="mx-auto max-w-4xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Activity Stream"
        subtitle="Everything SITA noticed, recommended, executed, and verified"
        actions={
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
            <div className={`h-2 w-2 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            {isDemoMode ? "Demo" : "Live"}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Events Today" value={isDemoMode ? 18 : (liveEvents as any[]).filter((e: any) => Date.now() - new Date(e.created_at).getTime() < 86400000).length} trend="up" icon={Activity} />
        <KPITile label="Processed" value={isDemoMode ? 14 : (liveEvents as any[]).filter((e: any) => e.processed).length} icon={CheckCircle} />
        <KPITile label="Pending" value={isDemoMode ? 4 : (liveEvents as any[]).filter((e: any) => !e.processed).length} icon={Clock} />
        <KPITile label="Sources" value={isDemoMode ? 5 : new Set((liveEvents as any[]).map((e: any) => e.source)).size} icon={Shield} />
      </div>

      {!isDemoMode && liveEvents.length > 0 && (
        <SitaCard hover={false} glow className="p-4 gradient-sita-subtle">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Recent Activity</p>
              <p className="text-xs text-muted-foreground">{liveEvents.length} events captured · {(liveEvents as any[]).filter((e: any) => e.processed).length} processed</p>
            </div>
          </div>
        </SitaCard>
      )}

      {isLoading && !isDemoMode ? (
        <SectionSkeleton cards={6} columns={1} />
      ) : timeline.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" description="Events will appear here as SITA processes actions, workflows, and integrations." />
      ) : (
        <div className="space-y-2">
          {timeline.map((event, i) => {
            const Icon = event.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
                <SitaCard hover className={`p-4 border-l-2 ${event.border}`}>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary p-2 shrink-0">
                      <Icon className={`h-4 w-4 ${event.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.subtitle}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">{event.time}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground capitalize bg-secondary rounded-md px-1.5 py-0.5 shrink-0">{event.type}</span>
                  </div>
                </SitaCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ActivityStream;
