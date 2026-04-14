import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LeadScoreResult, PriorityTier } from "@/lib/engines/lead-scoring-engine";
import { PRIORITY_TIER_META } from "@/lib/engines/lead-scoring-engine";
import { Flame, TrendingUp, AlertTriangle, RotateCcw, Star, Target } from "lucide-react";

interface Props {
  scores: LeadScoreResult[];
}

const DashCard = ({ icon: Icon, label, value, sublabel, accent, pulse }: {
  icon: typeof Flame; label: string; value: string | number; sublabel?: string; accent: string; pulse?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative rounded-2xl border border-border/40 bg-card p-4 overflow-hidden group hover:border-border/60 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", accent)}>
        <Icon className="h-4.5 w-4.5" />
        {pulse && (
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[hsl(var(--urgency-critical))]">
            <span className="absolute inset-0 rounded-full bg-[hsl(var(--urgency-critical))] animate-ping" />
          </span>
        )}
      </div>
    </div>
    <p className="font-display text-2xl font-bold text-foreground leading-none mt-3">{value}</p>
    <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    {sublabel && <p className="text-[9px] text-muted-foreground/60 mt-0.5">{sublabel}</p>}
  </motion.div>
);

export const LeadScoringDashboard = ({ scores }: Props) => {
  const active = scores.filter(s => s.priorityTier !== "low-priority");
  const critical = scores.filter(s => s.priorityTier === "critical-now").length;
  const high = scores.filter(s => s.priorityTier === "high-priority").length;
  const atRisk = scores.filter(s => s.staleRisk > 50).length;
  const recovery = scores.filter(s => s.recoveryPotential > 50).length;
  const boardroom = scores.filter(s => s.boardroomWorthy).length;
  const avgConversion = active.length > 0
    ? Math.round(active.reduce((s, r) => s + r.priorityScore, 0) / active.length)
    : 0;

  // Priority distribution
  const tiers: PriorityTier[] = ["critical-now", "high-priority", "active-watch", "nurture", "recovery-candidate", "low-priority"];
  const distribution = tiers.map(t => ({
    tier: t,
    count: scores.filter(s => s.priorityTier === t).length,
    meta: PRIORITY_TIER_META[t],
  }));
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <DashCard icon={Flame} label="Critical Now" value={critical} accent="bg-[hsl(var(--urgency-critical))]/10 text-[hsl(var(--urgency-critical))]" pulse={critical > 0} />
        <DashCard icon={TrendingUp} label="High Priority" value={high} accent="bg-[hsl(var(--urgency-high))]/10 text-[hsl(var(--urgency-high))]" />
        <DashCard icon={Target} label="Avg Score" value={avgConversion} sublabel="active leads" accent="bg-primary/10 text-primary" />
        <DashCard icon={AlertTriangle} label="At Risk" value={atRisk} sublabel="stale risk >50%" accent="bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" />
        <DashCard icon={RotateCcw} label="Recovery" value={recovery} sublabel="potential >50%" accent="bg-accent/10 text-accent" />
        <DashCard icon={Star} label="Boardroom" value={boardroom} sublabel="strategic leads" accent="bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" pulse={boardroom > 0} />
      </div>

      {/* Priority Distribution Bar */}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <p className="text-[11px] font-semibold text-muted-foreground mb-3">Priority Distribution</p>
        <div className="flex items-end gap-1.5 h-12">
          {distribution.map(d => (
            <div key={d.tier} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max(4, (d.count / maxCount) * 48)}px`,
                  backgroundColor: d.meta.color,
                  opacity: d.count > 0 ? 0.8 : 0.15,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {distribution.map(d => (
            <div key={d.tier} className="flex-1 text-center">
              <p className="text-[8px] text-muted-foreground truncate">{d.meta.label}</p>
              <p className="text-[10px] font-bold text-foreground">{d.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
