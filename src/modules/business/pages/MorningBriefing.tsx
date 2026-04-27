import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, AlertTriangle, TrendingUp, Clock, CheckCircle, Users,
  Calendar, Target, Phone, Zap, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useMorningBriefing } from "@/platform/operations/hooks/use-operational-rituals";

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
  const {
    greeting,
    dateLabel,
    priorities,
    metrics,
    schedule,
    overnight,
    isLoading,
    isError,
    isEmpty,
  } = useMorningBriefing();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(38_85%_58%)] to-[hsl(25_80%_50%)] flex items-center justify-center shadow-lg">
            <Sun size={24} className="text-[hsl(0_0%_100%)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{greeting}</h1>
            <p className="text-xs text-foreground/40">Here's what needs your attention today — {dateLabel}</p>
          </div>
        </div>
        <PageTruthBanner />
      </motion.div>

      {isError && (
        <EmptyStateCard
          icon={AlertTriangle}
          title="Couldn't assemble your briefing"
          description="One of the data sources behind the morning briefing failed to load. Try again or check your connection."
        />
      )}

      {isLoading && !isError && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      )}

      {!isLoading && !isError && isEmpty && (
        <EmptyStateCard
          icon={Sun}
          title="Nothing to brief on yet"
          description="Add contacts, tasks, or schedule a few appointments and your morning briefing will start surfacing what needs attention."
          ctaLabel="Open CRM"
          ctaPath="/business/crm"
        />
      )}

      {!isLoading && !isError && !isEmpty && (
        <>
          {/* Metrics snapshot */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto">
            {metrics.map((m) => (
              <div key={m.key} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground/30">{m.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-foreground/90">{m.value}</span>
                  {m.delta && (
                    <span className={cn("text-[10px] font-semibold", m.positive ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--destructive))]")}>{m.delta}</span>
                  )}
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
            {priorities.filter(i => !dismissed.has(i.id)).map((item, idx) => (
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
            {priorities.filter(i => !dismissed.has(i.id)).length === 0 && (
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
              {overnight.length === 0 ? (
                <p className="text-[10px] text-foreground/30 px-1 py-2">Nothing recorded in the last 18 hours.</p>
              ) : overnight.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.03 }}
                  className="flex items-center gap-3 rounded-lg bg-[hsl(0_0%_100%/0.02)] p-2.5"
                >
                  <Zap size={12} className="text-foreground/30 shrink-0" />
                  <span className="text-[10px] text-foreground/60 flex-1">{c.description}</span>
                  <span className="text-[9px] text-foreground/20 shrink-0">{new Date(c.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
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
            {schedule.length === 0 ? (
              <p className="text-[10px] text-foreground/30 px-1 py-2">Nothing scheduled today.</p>
            ) : schedule.map((s, idx) => (
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
        </>
      )}
    </div>
  );
}
