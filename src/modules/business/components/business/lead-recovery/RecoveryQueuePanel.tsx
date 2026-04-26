// ═══════════════════════════════════════════════════════════════
// Lead Recovery — Queue Navigation Panel
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import {
  Layers, MailX, Clock, FileX, TrendingDown, UserX, CalendarX,
  GitBranch, ArrowRightLeft, VolumeX, PhoneMissed, RotateCcw, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecoveryCandidate } from "@/domains/business";
import { RECOVERY_QUEUES, getQueueCounts, getQueueValueAtRisk } from "@/domains/engines/lead-recovery-engine";

const QUEUE_ICONS: Record<string, typeof Layers> = {
  layers: Layers, "mail-x": MailX, clock: Clock, "file-x": FileX,
  "trending-down": TrendingDown, "user-x": UserX, "calendar-x": CalendarX,
  "git-branch": GitBranch, "arrow-right-left": ArrowRightLeft,
  "volume-x": VolumeX, "phone-missed": PhoneMissed, "rotate-ccw": RotateCcw, crown: Crown,
};

interface Props {
  candidates: RecoveryCandidate[];
  activeQueue: string;
  onSelectQueue: (key: string) => void;
}

export function RecoveryQueuePanel({ candidates, activeQueue, onSelectQueue }: Props) {
  const counts = getQueueCounts(candidates);
  const values = getQueueValueAtRisk(candidates);

  return (
    <div className="space-y-1 p-2">
      <p className="text-[9px] uppercase tracking-widest text-[hsl(0_0%_40%)] font-semibold px-2 mb-2">Recovery Queues</p>
      {RECOVERY_QUEUES.map((q, i) => {
        const Icon = QUEUE_ICONS[q.icon] || Layers;
        const count = counts[q.key] || 0;
        const value = values[q.key] || 0;
        const isActive = activeQueue === q.key;
        const hasUrgent = q.key !== "all" && candidates.some(c =>
          (c.queueKey === q.key || q.failureModes.includes(c.failureMode)) && c.urgency === "act_today"
        );

        return (
          <motion.button
            key={q.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelectQueue(q.key)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all group",
              isActive
                ? "bg-[hsl(265_55%_58%/0.12)] border border-[hsl(265_55%_58%/0.3)]"
                : "border border-transparent hover:bg-[hsl(0_0%_100%/0.04)]"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-[hsl(265_55%_70%)]" : "text-[hsl(0_0%_40%)]")} />
            <span className={cn("text-[11px] font-medium flex-1 truncate", isActive ? "text-[hsl(265_55%_80%)]" : "text-[hsl(0_0%_60%)] group-hover:text-[hsl(0_0%_80%)]")}>
              {q.label}
            </span>
            <div className="flex items-center gap-1.5">
              {hasUrgent && (
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(0_70%_55%)] animate-pulse" />
              )}
              {count > 0 && (
                <span className={cn(
                  "text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                  isActive ? "bg-[hsl(265_55%_58%/0.25)] text-[hsl(265_55%_80%)]" : "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]"
                )}>
                  {count}
                </span>
              )}
            </div>
          </motion.button>
        );
      })}

      {/* Value summary */}
      <div className="mt-4 mx-2 rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
        <p className="text-[9px] uppercase tracking-wider text-[hsl(0_0%_40%)] mb-1">Total Value at Risk</p>
        <p className="text-lg font-bold text-[hsl(38_85%_58%)] font-display tabular-nums">
          ${(values.all / 1000).toFixed(0)}K
        </p>
        <p className="text-[9px] text-[hsl(0_0%_40%)] mt-1">{candidates.length} recoverable leads</p>
      </div>
    </div>
  );
}
