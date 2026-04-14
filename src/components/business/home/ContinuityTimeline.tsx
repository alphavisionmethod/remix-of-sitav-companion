import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, AlertTriangle,
  CheckCircle, Clock, TrendingUp, RefreshCw, Zap
} from "lucide-react";

interface TimelineEntry {
  id: string;
  timestamp: string;
  description: string;
  severity: "positive" | "negative" | "neutral" | "urgent";
  before?: string;
  after?: string;
}

const SEVERITY_CONFIG = {
  positive: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  negative: { icon: ArrowDownRight, color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  neutral: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  urgent: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
};

const DEMO_TIMELINE: TimelineEntry[] = [
  { id: "t1", timestamp: "2h ago", description: "2 deals moved into late-stage proposal review", severity: "positive", before: "Discovery", after: "Proposal" },
  { id: "t2", timestamp: "4h ago", description: "Atlas Corp has gone 9 days without follow-up", severity: "urgent" },
  { id: "t3", timestamp: "6h ago", description: "Collections pressure increased — 3 invoices crossed expected timing", severity: "negative", before: "Current", after: "Overdue" },
  { id: "t4", timestamp: "8h ago", description: "Support backlog improved after triage session", severity: "positive", before: "12 open", after: "5 open" },
  { id: "t5", timestamp: "Yesterday", description: "A previously medium-priority lead is now urgent based on engagement spike", severity: "urgent", before: "Medium", after: "Urgent" },
  { id: "t6", timestamp: "Yesterday", description: "Recovered $8,400 from late payment — Meridian account", severity: "positive" },
  { id: "t7", timestamp: "2 days ago", description: "New high-value lead from referral added to pipeline", severity: "neutral" },
];

export function ContinuityTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-2xl p-5 border border-border/20"
      style={{ background: "hsl(var(--card) / 0.5)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock size={14} className="text-foreground/40" />
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-foreground/40">What Changed</span>
        <span className="text-[9px] text-muted-foreground ml-auto">Since last review</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border/20" />

        <div className="space-y-1">
          {DEMO_TIMELINE.map((entry, i) => {
            const config = SEVERITY_CONFIG[entry.severity];
            const Icon = config.icon;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="relative flex gap-3 py-2 pl-1 group"
              >
                {/* Dot */}
                <div className={`relative z-10 mt-1 w-[22px] h-[22px] rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={10} className={config.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-foreground/75 leading-relaxed">{entry.description}</p>
                    <span className="text-[9px] text-muted-foreground/50 shrink-0 mt-0.5">{entry.timestamp}</span>
                  </div>
                  {entry.before && entry.after && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">{entry.before}</span>
                      <ArrowUpRight size={8} className="text-muted-foreground/40" />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>{entry.after}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
