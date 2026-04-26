import { motion } from "framer-motion";
import { Inbox, UserX, Zap, Star, AlertTriangle, RotateCcw, Flame, TrendingDown } from "lucide-react";
import type { LeadScoreResult } from "@/domains/business";
import type { InboxItem } from "./mock-inbox-data";
import { getInboxStats } from "./mock-inbox-data";

const KPICard = ({ icon: Icon, label, value, accent, pulse }: {
  icon: typeof Inbox; label: string; value: number; accent: string; pulse?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-3 overflow-hidden group hover:border-border/60 transition-all"
  >
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="h-5 w-5" />
      {pulse && (
        <span className="absolute top-2.5 left-12 h-2 w-2 rounded-full bg-[hsl(var(--urgency-critical))]">
          <span className="absolute inset-0 rounded-full bg-[hsl(var(--urgency-critical))] animate-ping" />
        </span>
      )}
    </div>
    <div>
      <p className="font-display text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  </motion.div>
);

interface Props {
  items: InboxItem[];
  scores?: LeadScoreResult[];
}

export const LeadInboxHeader = ({ items, scores }: Props) => {
  const stats = getInboxStats(items);
  const critical = scores?.filter(s => s.priorityTier === "critical-now").length ?? 0;
  const atRisk = scores?.filter(s => s.staleRisk > 50).length ?? 0;
  const recovery = scores?.filter(s => s.recoveryPotential > 50).length ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <KPICard icon={Inbox} label="New Arrivals" value={stats.newCount} accent="bg-primary/10 text-primary" pulse={stats.newCount > 0} />
      <KPICard icon={Flame} label="Critical Now" value={critical} accent="bg-[hsl(var(--urgency-critical))]/10 text-[hsl(var(--urgency-critical))]" pulse={critical > 0} />
      <KPICard icon={UserX} label="Unassigned" value={stats.unassigned} accent="bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" />
      <KPICard icon={Zap} label="Urgent" value={stats.urgent} accent="bg-[hsl(var(--urgency-high))]/10 text-[hsl(var(--urgency-high))]" />
      <KPICard icon={Star} label="High Quality" value={stats.highQuality} accent="bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" />
      <KPICard icon={TrendingDown} label="At Risk" value={atRisk} accent="bg-[hsl(var(--urgency-high))]/10 text-[hsl(var(--urgency-high))]" />
      <KPICard icon={RotateCcw} label="Recovery" value={recovery} accent="bg-accent/10 text-accent" />
      <KPICard icon={AlertTriangle} label="Incomplete" value={stats.incomplete} accent="bg-muted/50 text-muted-foreground" />
    </div>
  );
};
