// ═══════════════════════════════════════════════════════════════
// Lead Recovery — Strategic Overview Dashboard
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { DollarSign, Target, Flame, TrendingUp, Shield, AlertTriangle, Crown, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecoveryCandidate } from "@/domains/engines/lead-recovery-engine";
import { getRecoveryStats, getTopPriorityRescues, FAILURE_MODE_META, SUCCESS_BAND_META } from "@/domains/engines/lead-recovery-engine";
import { AdvisorCard } from "@/platform/sita/components/sita/cards";

interface Props {
  candidates: RecoveryCandidate[];
}

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: typeof DollarSign; label: string; value: string; sub?: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_50%)] font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-[hsl(0_0%_90%)] font-display tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-[hsl(0_0%_45%)]">{sub}</p>}
    </motion.div>
  );
}

function PriorityCard({ candidate, index }: { candidate: RecoveryCandidate; index: number }) {
  const fm = FAILURE_MODE_META[candidate.failureMode];
  const sb = SUCCESS_BAND_META[candidate.successBand];
  const urgencyColors: Record<string, string> = {
    act_today: "hsl(0 70% 55%)",
    this_week: "hsl(38 85% 58%)",
    flexible: "hsl(0 0% 50%)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 hover:border-[hsl(265_55%_58%/0.3)] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[hsl(265_55%_58%/0.15)] flex items-center justify-center text-[10px] font-bold text-[hsl(265_55%_70%)]">
            {candidate.name.split(" ").map(w => w[0]).join("")}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">{candidate.name}</p>
            <p className="text-[10px] text-[hsl(0_0%_45%)]">{candidate.company}</p>
          </div>
        </div>
        {/* Score ring */}
        <div className="relative w-10 h-10">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke={sb.color} strokeWidth="3"
              strokeDasharray={`${candidate.recoveryScore * 0.94} 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[hsl(0_0%_85%)] tabular-nums">
            {candidate.recoveryScore}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${fm.color}20`, color: fm.color }}>
          {fm.label}
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${urgencyColors[candidate.urgency]}20`, color: urgencyColors[candidate.urgency] }}>
          {candidate.urgency === "act_today" ? "Act Today" : candidate.urgency === "this_week" ? "This Week" : "Flexible"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[hsl(38_85%_58%)] tabular-nums">${candidate.valueAtRisk.toLocaleString()}</span>
        <span className="text-[9px] text-[hsl(0_0%_45%)]">{candidate.daysSinceLastAction}d ago</span>
      </div>
    </motion.div>
  );
}

export function RecoveryOverview({ candidates }: Props) {
  const stats = getRecoveryStats(candidates);
  const topPriority = getTopPriorityRescues(candidates, 3);

  // Advisor insight
  const topCandidate = topPriority[0];
  const advisorInsight = topCandidate
    ? `${topCandidate.name} (${topCandidate.company}) is the highest-priority rescue at $${topCandidate.valueAtRisk.toLocaleString()} value at risk. ${topCandidate.advisorInsight.split('.')[0]}.`
    : "No active recovery candidates require immediate attention.";

  return (
    <div className="space-y-4">
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={Target} label="Recoverable Leads" value={String(stats.total)} sub={`${stats.strongChance} with good odds`} color="hsl(265 55% 58%)" />
        <MetricCard icon={DollarSign} label="Value at Risk" value={`$${(stats.totalValue / 1000).toFixed(0)}K`} sub={`$${(stats.totalValue).toLocaleString()} total`} color="hsl(38 85% 58%)" />
        <MetricCard icon={Flame} label="Act Today" value={String(stats.actToday)} sub="Time-sensitive rescues" color="hsl(0 70% 55%)" />
        <MetricCard icon={TrendingUp} label="Avg Recovery Score" value={`${stats.avgScore}%`} sub={stats.boardroom > 0 ? `${stats.boardroom} boardroom candidates` : "All manageable"} color="hsl(152 55% 48%)" />
      </div>

      {/* Top Priority Rescue */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-4 w-4 text-[hsl(38_85%_58%)]" />
          <h3 className="text-[12px] font-semibold text-[hsl(0_0%_70%)] uppercase tracking-wider">Top Priority Rescues</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topPriority.map((c, i) => (
            <PriorityCard key={c.id} candidate={c} index={i} />
          ))}
        </div>
      </div>

      {/* Recovery Queue Health Bar */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
          <span className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_50%)] font-medium">Queue Health</span>
        </div>
        <div className="flex gap-1 h-6 rounded-lg overflow-hidden">
          {[
            { label: "No Response", count: candidates.filter(c => c.failureMode === "no_response").length, color: "hsl(0 70% 55%)" },
            { label: "Missed Follow-up", count: candidates.filter(c => c.failureMode === "missed_followup").length, color: "hsl(38 85% 58%)" },
            { label: "Quote Abandoned", count: candidates.filter(c => c.failureMode === "quote_abandoned").length, color: "hsl(0 55% 50%)" },
            { label: "Owner Issues", count: candidates.filter(c => c.failureMode === "owner_dropped" || c.failureMode === "handoff_failure").length, color: "hsl(265 55% 58%)" },
            { label: "Appointments", count: candidates.filter(c => c.failureMode === "appointment_incomplete" || c.failureMode === "post_consult_drift").length, color: "hsl(152 55% 48%)" },
            { label: "Other", count: candidates.filter(c => ["lost_momentum", "silent_high_value", "callback_missed"].includes(c.failureMode)).length, color: "hsl(0 0% 40%)" },
          ].filter(s => s.count > 0).map(s => (
            <motion.div
              key={s.label}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              className="origin-left relative group"
              style={{ background: s.color, flex: s.count }}
              title={`${s.label}: ${s.count}`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[hsl(0_0%_14%)] text-[9px] text-[hsl(0_0%_80%)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[hsl(0_0%_100%/0.1)]">
                {s.label}: {s.count}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          {[
            { label: "No Response", color: "hsl(0 70% 55%)" },
            { label: "Missed Follow-up", color: "hsl(38 85% 58%)" },
            { label: "Quote Abandoned", color: "hsl(0 55% 50%)" },
            { label: "Owner Issues", color: "hsl(265 55% 58%)" },
            { label: "Appointments", color: "hsl(152 55% 48%)" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[9px] text-[hsl(0_0%_45%)]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advisor Summary */}
      <AdvisorCard
        advisorName="Recovery Intelligence"
        insight={advisorInsight}
        confidence={stats.avgScore}
        domain="business"
      />
    </div>
  );
}
