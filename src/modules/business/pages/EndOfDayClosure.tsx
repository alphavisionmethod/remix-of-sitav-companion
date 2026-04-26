import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon, CheckCircle, Clock, AlertTriangle,
  Target, Calendar, TrendingUp, Star, Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useEndOfDayClosure } from "@/hooks/use-operational-rituals";

const STAT_ICONS: Record<string, typeof CheckCircle> = {
  "tasks-done": CheckCircle,
  "deals-advanced": TrendingUp,
  "comms": Inbox,
  "revenue": Star,
};

const priorityColors: Record<string, string> = {
  high: "text-[hsl(var(--destructive))]",
  medium: "text-[hsl(var(--sita-gold))]",
  low: "text-foreground/40",
};

export default function EndOfDayClosure() {
  const [deferred, setDeferred] = useState<Set<string>>(new Set());
  const {
    completed,
    stillOpen,
    stale,
    tomorrow,
    stats,
    isLoading,
    isError,
    isEmpty,
  } = useEndOfDayClosure();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(280_50%_45%)] flex items-center justify-center shadow-lg">
            <Moon size={24} className="text-[hsl(0_0%_100%)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">End of Day</h1>
            <p className="text-xs text-foreground/40">Wrap up, review what happened, and prepare for tomorrow</p>
          </div>
        </div>
        <PageTruthBanner />
      </motion.div>

      {isError && (
        <EmptyStateCard
          icon={AlertTriangle}
          title="Couldn't compile your closure"
          description="One of the data sources for the end-of-day report failed. Please retry."
        />
      )}

      {isLoading && !isError && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      )}

      {!isLoading && !isError && isEmpty && (
        <EmptyStateCard
          icon={Moon}
          title="No closure data yet"
          description="Once you complete tasks, log communications, or close deals today, this page will summarize what happened and what's still open."
          ctaLabel="Open CRM"
          ctaPath="/business/crm"
        />
      )}

      {!isLoading && !isError && !isEmpty && (
        <>
          {/* Day stats */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-3">
            {stats.map((s) => {
              const Icon = STAT_ICONS[s.key] ?? CheckCircle;
              return (
                <div key={s.key} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 flex items-center gap-3">
                  <Icon size={16} className="text-[hsl(var(--trust-safe))] shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-foreground/90">{s.value}</p>
                    <p className="text-[9px] text-foreground/30">{s.label}</p>
                  </div>
                </div>
              );
            })}
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
              {completed.length === 0 ? (
                <p className="text-[10px] text-foreground/30 px-1 py-2">No completions logged today yet.</p>
              ) : completed.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-2.5">
                  <CheckCircle size={12} className="text-[hsl(var(--trust-safe))] shrink-0" />
                  <span className="text-[11px] text-foreground/70 truncate">{c.title}</span>
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
              {stale.length === 0 ? (
                <p className="text-[10px] text-foreground/30 px-1 py-2">No stale opportunities — nice work.</p>
              ) : stale.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--sita-gold))]/15 bg-[hsl(var(--sita-gold))]/5 p-2.5">
                  <AlertTriangle size={12} className="text-[hsl(var(--sita-gold))] shrink-0" />
                  <span className="text-[11px] text-foreground/60 flex-1 truncate">{s.title}</span>
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
              {stillOpen.filter(t => !deferred.has(t.id)).length === 0 ? (
                <p className="text-[10px] text-foreground/30 px-1 py-2">All caught up — no open tasks.</p>
              ) : stillOpen.filter(t => !deferred.has(t.id)).map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2.5">
                  <AlertTriangle size={12} className={cn("shrink-0", priorityColors[t.priority])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground/70 truncate">{t.title}</p>
                    <p className="text-[9px] text-foreground/25">{t.ageLabel}</p>
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
              {tomorrow.length === 0 ? (
                <p className="text-[10px] text-foreground/30 px-1 py-2">Nothing on the calendar for tomorrow.</p>
              ) : tomorrow.map((p) => (
                <div key={p.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-foreground/25 w-14">{p.time}</span>
                    <span className="text-[11px] font-medium text-foreground/70 truncate">{p.title}</span>
                  </div>
                  <p className="text-[9px] text-foreground/30 mt-1 ml-16 line-clamp-2">↳ {p.prep}</p>
                </div>
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
