import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon, CheckCircle, Clock, AlertTriangle, FileText, ArrowRight,
  Target, Calendar, TrendingUp, Star, Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

const INCOMPLETE_TASKS = [
  { id: "1", title: "Send revised proposal to DataFlow", priority: "high", age: "Created today" },
  { id: "2", title: "Review support ticket #892", priority: "medium", age: "2 hours ago" },
  { id: "3", title: "Follow up on Apex Corp payment", priority: "high", age: "Overdue by 1 day" },
];

const COMPLETED_TODAY = [
  { id: "1", title: "Closed deal with NovaTech — $18,500", type: "win" },
  { id: "2", title: "Resolved 4 support tickets", type: "support" },
  { id: "3", title: "Sent 6 follow-up emails", type: "comms" },
  { id: "4", title: "Updated pipeline for Q2 forecast", type: "planning" },
];

const STALE_ITEMS = [
  { id: "1", title: "Draft proposal for MegaCorp — untouched 5 days", entity: "MegaCorp" },
  { id: "2", title: "Lead from trade show — no follow-up yet", entity: "Trade Show Lead" },
];

const TOMORROW_PREP = [
  { id: "1", time: "9:00 AM", title: "Team standup", prep: "Review overnight metrics" },
  { id: "2", time: "11:00 AM", title: "Client demo — BlueStar", prep: "Prepare demo environment" },
  { id: "3", time: "2:00 PM", title: "Quarterly review", prep: "Pull Q1 numbers" },
];

const DAY_STATS = [
  { label: "Tasks Completed", value: "12", icon: CheckCircle },
  { label: "Deals Advanced", value: "3", icon: TrendingUp },
  { label: "Emails Sent", value: "24", icon: Inbox },
  { label: "Revenue Closed", value: "$18.5K", icon: Star },
];

const priorityColors: Record<string, string> = {
  high: "text-[hsl(var(--destructive))]",
  medium: "text-[hsl(var(--sita-gold))]",
  low: "text-foreground/40",
};

export default function EndOfDayClosure() {
  const [deferred, setDeferred] = useState<Set<string>>(new Set());

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(280_50%_45%)] flex items-center justify-center shadow-lg">
          <Moon size={24} className="text-[hsl(0_0%_100%)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">End of Day</h1>
          <p className="text-xs text-foreground/40">Wrap up, review what happened, and prepare for tomorrow</p>
        </div>
      </motion.div>

      {/* Day stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-3">
        {DAY_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 flex items-center gap-3">
            <s.icon size={16} className="text-[hsl(var(--trust-safe))] shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground/90">{s.value}</p>
              <p className="text-[9px] text-foreground/30">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 gap-5">
        {/* Left: Completed + Stale */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-[hsl(var(--trust-safe))]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Completed Today</h2>
            </div>
            <div className="space-y-1.5">
              {COMPLETED_TODAY.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-2.5">
                  <CheckCircle size={12} className="text-[hsl(var(--trust-safe))] shrink-0" />
                  <span className="text-[11px] text-foreground/70">{c.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[hsl(var(--sita-gold))]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Getting Stale</h2>
            </div>
            <div className="space-y-1.5">
              {STALE_ITEMS.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--sita-gold))]/15 bg-[hsl(var(--sita-gold))]/5 p-2.5">
                  <AlertTriangle size={12} className="text-[hsl(var(--sita-gold))] shrink-0" />
                  <span className="text-[11px] text-foreground/60 flex-1">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Incomplete + Tomorrow */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-[hsl(var(--destructive))]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Still Open</h2>
            </div>
            <div className="space-y-1.5">
              {INCOMPLETE_TASKS.filter(t => !deferred.has(t.id)).map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2.5">
                  <AlertTriangle size={12} className={cn("shrink-0", priorityColors[t.priority])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground/70 truncate">{t.title}</p>
                    <p className="text-[9px] text-foreground/25">{t.age}</p>
                  </div>
                  <button
                    onClick={() => setDeferred(prev => new Set(prev).add(t.id))}
                    className="text-[9px] px-2 py-1 rounded bg-[hsl(0_0%_100%/0.05)] text-foreground/40 hover:text-foreground/60 transition-colors"
                  >
                    Defer →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-[hsl(var(--sita-purple))]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Tomorrow's Prep</h2>
            </div>
            <div className="space-y-1.5">
              {TOMORROW_PREP.map((p) => (
                <div key={p.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-foreground/25 w-14">{p.time}</span>
                    <span className="text-[11px] font-medium text-foreground/70">{p.title}</span>
                  </div>
                  <p className="text-[9px] text-foreground/30 mt-1 ml-16">↳ {p.prep}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
