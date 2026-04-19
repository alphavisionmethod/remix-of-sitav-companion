import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, AlertTriangle, TrendingUp, Clock, CheckCircle, Users,
  ArrowRight, Calendar, Target, Phone, Zap, ChevronRight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_ITEMS = [
  { id: "1", type: "overdue", label: "Follow up with Apex Corp — 3 days overdue", severity: "critical", entity: "Apex Corp", action: "Send follow-up" },
  { id: "2", type: "at-risk", label: "Deal with BlueStar losing momentum — no contact in 14 days", severity: "warning", entity: "BlueStar", action: "Schedule call" },
  { id: "3", type: "opportunity", label: "New lead from website — high intent score (87)", severity: "positive", entity: "New Lead", action: "Review & assign" },
  { id: "4", type: "renewal", label: "Contract renewal due in 5 days — GreenTech Solutions", severity: "warning", entity: "GreenTech", action: "Prepare renewal" },
];

const OVERNIGHT_CHANGES = [
  { id: "1", time: "11:42 PM", description: "New support ticket from VeloCorp — severity: high", icon: AlertTriangle },
  { id: "2", time: "6:15 AM", description: "Invoice #1042 paid — $4,200 received", icon: CheckCircle },
  { id: "3", time: "7:30 AM", description: "3 new leads captured from landing page", icon: Users },
  { id: "4", time: "8:01 AM", description: "Autopilot sent 12 follow-up emails overnight", icon: Zap },
];

const TODAY_SCHEDULE = [
  { id: "1", time: "9:00 AM", title: "Pipeline review", type: "internal" },
  { id: "2", time: "10:30 AM", title: "Call with DataFlow Inc.", type: "client" },
  { id: "3", time: "1:00 PM", title: "Proposal review — NovaTech", type: "internal" },
  { id: "4", time: "3:30 PM", title: "Quarterly planning sync", type: "internal" },
];

const METRICS_SNAPSHOT = [
  { label: "Open Deals", value: "23", change: "+2", positive: true },
  { label: "Pipeline Value", value: "$142K", change: "+$12K", positive: true },
  { label: "Overdue Tasks", value: "5", change: "+1", positive: false },
  { label: "Response Rate", value: "94%", change: "+3%", positive: true },
];

const sevClasses: Record<string, string> = {
  critical: "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5",
  warning: "border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5",
  positive: "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5",
};
const sevIcon: Record<string, string> = {
  critical: "text-[hsl(var(--destructive))]",
  warning: "text-[hsl(var(--sita-gold))]",
  positive: "text-[hsl(var(--trust-safe))]",
};

export default function MorningBriefing() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(38_85%_58%)] to-[hsl(25_80%_50%)] flex items-center justify-center shadow-lg">
          <Sun size={24} className="text-[hsl(0_0%_100%)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{greeting}</h1>
          <p className="text-xs text-foreground/40">Here's what needs your attention today — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      </motion.div>

      {/* Metrics snapshot */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto">
        {METRICS_SNAPSHOT.map((m) => (
          <div key={m.label} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground/30">{m.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-foreground/90">{m.value}</span>
              <span className={cn("text-[10px] font-semibold", m.positive ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--destructive))]")}>{m.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Priority Actions — 3 cols on md+ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-[hsl(var(--sita-gold))]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Priority Actions</h2>
          </div>
          <div className="space-y-2">
            {PRIORITY_ITEMS.filter(i => !dismissed.has(i.id)).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + idx * 0.04 }}
                className={cn("rounded-xl border p-3 flex items-center gap-3", sevClasses[item.severity])}
              >
                <AlertTriangle size={14} className={cn("shrink-0", sevIcon[item.severity])} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground/80 truncate">{item.label}</p>
                  <p className="text-[9px] text-foreground/30 mt-0.5">{item.entity}</p>
                </div>
                <button
                  onClick={() => setDismissed(prev => new Set(prev).add(item.id))}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(0_0%_100%/0.06)] text-[9px] font-semibold text-foreground/50 hover:bg-[hsl(0_0%_100%/0.1)] hover:text-foreground/70 transition-colors"
                >
                  {item.action} <ChevronRight size={10} />
                </button>
              </motion.div>
            ))}
            {PRIORITY_ITEMS.filter(i => !dismissed.has(i.id)).length === 0 && (
              <div className="rounded-xl border border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5 p-6 text-center">
                <CheckCircle size={20} className="text-[hsl(var(--trust-safe))] mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground/60">All caught up! No priority items.</p>
              </div>
            )}
          </div>

          {/* Overnight changes */}
          <div className="pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-foreground/30" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">While You Were Away</h2>
            </div>
            <div className="space-y-1.5">
              {OVERNIGHT_CHANGES.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.03 }}
                  className="flex items-center gap-3 rounded-lg bg-[hsl(0_0%_100%/0.02)] p-2.5"
                >
                  <c.icon size={12} className="text-foreground/30 shrink-0" />
                  <span className="text-[10px] text-foreground/60 flex-1">{c.description}</span>
                  <span className="text-[9px] text-foreground/20 shrink-0">{c.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Today's schedule — 2 cols */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[hsl(var(--sita-purple))]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Today's Schedule</h2>
          </div>
          <div className="space-y-1.5">
            {TODAY_SCHEDULE.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + idx * 0.04 }}
                className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 flex items-center gap-3"
              >
                <span className="text-[10px] font-mono text-foreground/30 w-16 shrink-0">{s.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground/70 truncate">{s.title}</p>
                </div>
                {s.type === "client" && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] font-semibold">CLIENT</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Quick-start tray */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-[hsl(var(--sita-gold))]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Quick Start</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Lead", icon: Users },
                { label: "Send Quote", icon: TrendingUp },
                { label: "Log Call", icon: Phone },
                { label: "New Task", icon: Target },
              ].map((q) => (
                <button
                  key={q.label}
                  className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2.5 flex items-center gap-2 text-[10px] font-medium text-foreground/50 hover:bg-[hsl(0_0%_100%/0.05)] hover:text-foreground/70 transition-colors"
                >
                  <q.icon size={12} /> {q.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
