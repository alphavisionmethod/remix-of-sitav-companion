import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, RotateCcw, ArrowUpRight, Zap, Clock,
  Sparkles, DollarSign, ChevronRight
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";

interface Opportunity {
  id: string;
  name: string;
  value: number;
  stage: string;
  momentum: "advancing" | "stalled" | "cooling";
  daysInStage: number;
}

interface RecoveryCandidate {
  id: string;
  name: string;
  estimatedValue: number;
  signal: string;
  likelihood: number;
}

const DEMO_OPPS: Opportunity[] = [
  { id: "o1", name: "Atlas Corp Enterprise", value: 36000, stage: "Proposal Sent", momentum: "advancing", daysInStage: 2 },
  { id: "o2", name: "Meridian Annual Contract", value: 12000, stage: "Negotiation", momentum: "advancing", daysInStage: 4 },
  { id: "o3", name: "Apex Solutions Upgrade", value: 8400, stage: "Discovery", momentum: "stalled", daysInStage: 11 },
  { id: "o4", name: "Nova Digital Retainer", value: 24000, stage: "Proposal Review", momentum: "cooling", daysInStage: 8 },
];

const DEMO_RECOVERY: RecoveryCandidate[] = [
  { id: "r1", name: "Pinnacle Health Group", estimatedValue: 15000, signal: "Revisited pricing page 3x this week", likelihood: 0.72 },
  { id: "r2", name: "Metro Design Studio", estimatedValue: 6800, signal: "Replied to re-engagement email", likelihood: 0.58 },
  { id: "r3", name: "Coastal Ventures", estimatedValue: 9200, signal: "Downloaded case study yesterday", likelihood: 0.45 },
];

const MOMENTUM_STYLES = {
  advancing: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: ArrowUpRight, label: "Advancing" },
  stalled: { color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock, label: "Stalled" },
  cooling: { color: "text-red-400", bg: "bg-red-500/10", icon: TrendingUp, label: "Cooling" },
};

export function OpportunityRecoveryLayer() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  const totalPipelineValue = DEMO_OPPS.reduce((s, o) => s + o.value, 0);
  const totalRecoveryValue = DEMO_RECOVERY.reduce((s, r) => s + r.estimatedValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* Active Opportunities */}
      <div className="rounded-2xl p-5 border border-border/20" style={{ background: "hsl(var(--card) / 0.5)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground/80">Active Opportunities</h3>
              <span className="text-[10px] text-muted-foreground">{DEMO_OPPS.length} in pipeline</span>
            </div>
          </div>
          <span className="text-lg font-bold font-mono text-emerald-400">${(totalPipelineValue / 1000).toFixed(0)}K</span>
        </div>

        <div className="space-y-2">
          {DEMO_OPPS.map((opp, i) => {
            const m = MOMENTUM_STYLES[opp.momentum];
            const MIcon = m.icon;
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-card/30 border border-border/10 hover:border-border/30 transition-colors cursor-pointer group"
              >
                <div className={`w-6 h-6 rounded-md ${m.bg} flex items-center justify-center shrink-0`}>
                  <MIcon size={12} className={m.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground/80 truncate">{opp.name}</p>
                  <p className="text-[10px] text-muted-foreground">{opp.stage} · {opp.daysInStage}d</p>
                </div>
                <span className="text-xs font-bold font-mono text-foreground/60">${(opp.value / 1000).toFixed(0)}K</span>
                <ChevronRight size={12} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recovery Candidates */}
      <div className="rounded-2xl p-5 border border-border/20" style={{ background: "hsl(var(--card) / 0.5)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <RotateCcw size={14} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground/80">Recovery Candidates</h3>
              <span className="text-[10px] text-muted-foreground">{DEMO_RECOVERY.length} with signals</span>
            </div>
          </div>
          <span className="text-lg font-bold font-mono text-violet-400">${(totalRecoveryValue / 1000).toFixed(0)}K</span>
        </div>

        <div className="space-y-2">
          {DEMO_RECOVERY.map((rc, i) => (
            <motion.div
              key={rc.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="p-3 rounded-xl bg-card/30 border border-border/10 hover:border-violet-500/15 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs font-medium text-foreground/80">{rc.name}</p>
                <span className="text-xs font-bold font-mono text-violet-400/80">${(rc.estimatedValue / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={10} className="text-violet-400/60 shrink-0" />
                <p className="text-[10px] text-muted-foreground flex-1">{rc.signal}</p>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/10">
                  <span className="text-[9px] font-mono text-violet-400">{Math.round(rc.likelihood * 100)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10">
          <p className="text-[10px] text-violet-400/70">
            <span className="font-semibold">Insight:</span> 2 strong recovery candidates detected based on recent engagement. Timely outreach could recover <span className="font-bold">${(totalRecoveryValue * 0.6 / 1000).toFixed(0)}K</span> in value.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
