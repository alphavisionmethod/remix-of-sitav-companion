import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, AlertTriangle,
  CheckCircle, Clock, TrendingUp, RefreshCw, Zap
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

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

const MODE_TIMELINE: Record<string, TimelineEntry[]> = {
  service: [
    { id: "t1", timestamp: "2h ago", description: "2 deals moved into late-stage proposal review", severity: "positive", before: "Discovery", after: "Proposal" },
    { id: "t2", timestamp: "4h ago", description: "Atlas Corp has gone 9 days without follow-up", severity: "urgent" },
    { id: "t3", timestamp: "6h ago", description: "Collections pressure increased — 3 invoices crossed expected timing", severity: "negative", before: "Current", after: "Overdue" },
    { id: "t4", timestamp: "8h ago", description: "Support backlog improved after triage session", severity: "positive", before: "12 open", after: "5 open" },
    { id: "t5", timestamp: "Yesterday", description: "A previously medium-priority lead is now urgent based on engagement spike", severity: "urgent", before: "Medium", after: "Urgent" },
    { id: "t6", timestamp: "Yesterday", description: "Recovered $8,400 from late payment — Meridian account", severity: "positive" },
    { id: "t7", timestamp: "2 days ago", description: "New high-value lead from referral added to pipeline", severity: "neutral" },
  ],
  ecommerce: [
    { id: "t1", timestamp: "1h ago", description: "3 high-value carts abandoned — recovery emails queued", severity: "urgent" },
    { id: "t2", timestamp: "3h ago", description: "Daily order volume exceeded forecast by 18%", severity: "positive", before: "Forecast: 72", after: "Actual: 86" },
    { id: "t3", timestamp: "5h ago", description: "Support ticket from repeat buyer escalated — refund risk", severity: "negative" },
    { id: "t4", timestamp: "6h ago", description: "Repeat purchase campaign sent to 42 eligible customers", severity: "neutral" },
    { id: "t5", timestamp: "Yesterday", description: "2 product reviews flagged — potential quality issue on SKU-1847", severity: "urgent" },
    { id: "t6", timestamp: "Yesterday", description: "Subscription renewal rate improved to 78%", severity: "positive", before: "72%", after: "78%" },
    { id: "t7", timestamp: "2 days ago", description: "Inventory restock completed for 5 low-stock items", severity: "positive" },
  ],
  "employee-based": [
    { id: "t1", timestamp: "1h ago", description: "Jordan T. reassigned 2 tasks to reduce overload", severity: "positive", before: "8 active", after: "6 active" },
    { id: "t2", timestamp: "3h ago", description: "Client deliverable handoff blocked — approval pending from Sarah", severity: "urgent" },
    { id: "t3", timestamp: "5h ago", description: "Team utilization crossed 90% threshold", severity: "negative", before: "87%", after: "92%" },
    { id: "t4", timestamp: "Yesterday", description: "3 overdue assignments completed after priority shuffle", severity: "positive" },
    { id: "t5", timestamp: "Yesterday", description: "New project intake paused due to capacity constraints", severity: "neutral" },
    { id: "t6", timestamp: "2 days ago", description: "Performance review completed for 2 team members", severity: "positive" },
  ],
  "brick-and-mortar": [
    { id: "t1", timestamp: "2h ago", description: "Walk-in traffic 12% above forecast for this time slot", severity: "positive" },
    { id: "t2", timestamp: "4h ago", description: "Evening shift coverage gap detected for tomorrow", severity: "urgent" },
    { id: "t3", timestamp: "6h ago", description: "3 inventory items dropped below reorder threshold", severity: "negative", before: "In Stock", after: "Low Stock" },
    { id: "t4", timestamp: "Yesterday", description: "Daily revenue target exceeded by $420", severity: "positive" },
    { id: "t5", timestamp: "Yesterday", description: "Staff training completion rate improved", severity: "positive", before: "65%", after: "82%" },
    { id: "t6", timestamp: "2 days ago", description: "Customer complaint resolved — loyalty credit applied", severity: "neutral" },
  ],
  "appointment-based": [
    { id: "t1", timestamp: "1h ago", description: "2 appointments confirmed for tomorrow's high-risk slots", severity: "positive" },
    { id: "t2", timestamp: "3h ago", description: "No-show rate trending up — 3 missed in last 48h", severity: "negative", before: "5%", after: "12%" },
    { id: "t3", timestamp: "5h ago", description: "New booking from premium referral source", severity: "positive" },
    { id: "t4", timestamp: "Yesterday", description: "Prep reminder system caught 1 complex case needing advance review", severity: "neutral" },
    { id: "t5", timestamp: "Yesterday", description: "Booking momentum strong — 15% above weekly average", severity: "positive" },
    { id: "t6", timestamp: "2 days ago", description: "Waitlist position filled after cancellation", severity: "positive" },
  ],
  agency: [
    { id: "t1", timestamp: "2h ago", description: "Client portfolio review completed — 2 accounts approaching renewal", severity: "neutral" },
    { id: "t2", timestamp: "4h ago", description: "New pitch opportunity added to pipeline from networking event", severity: "positive" },
    { id: "t3", timestamp: "6h ago", description: "Delivery milestone missed on Acme project — scope creep flagged", severity: "negative", before: "On Track", after: "At Risk" },
    { id: "t4", timestamp: "Yesterday", description: "Utilization rebalanced across creative and strategy teams", severity: "positive" },
    { id: "t5", timestamp: "Yesterday", description: "Client satisfaction survey results: 4.2/5 average", severity: "positive" },
    { id: "t6", timestamp: "2 days ago", description: "Retainer upsell conversation initiated with top-3 client", severity: "neutral" },
  ],
};

export function ContinuityTimeline() {
  const { primaryMode } = useBusinessProfile();
  const timeline = MODE_TIMELINE[primaryMode] || MODE_TIMELINE.service;

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
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border/20" />

        <div className="space-y-1">
          {timeline.map((entry, i) => {
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
                <div className={`relative z-10 mt-1 w-[22px] h-[22px] rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={10} className={config.color} />
                </div>

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
