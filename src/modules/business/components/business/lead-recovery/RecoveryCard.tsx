// ═══════════════════════════════════════════════════════════════
// Lead Recovery — Recovery Candidate Card
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Phone, Mail, Linkedin, MessageSquare, ChevronRight, Crown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecoveryCandidate } from "@/domains/business";
import { FAILURE_MODE_META, SUCCESS_BAND_META, RECOVERY_PATH_META } from "@/domains/engines/lead-recovery-engine";

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail, phone: Phone, linkedin: Linkedin, sms: MessageSquare,
};

interface Props {
  candidate: RecoveryCandidate;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export function RecoveryCard({ candidate: c, isSelected, onSelect, index }: Props) {
  const fm = FAILURE_MODE_META[c.failureMode];
  const sb = SUCCESS_BAND_META[c.successBand];
  const rp = RECOVERY_PATH_META[c.recommendedPath];
  const ChannelIcon = CHANNEL_ICONS[c.suggestedChannel] || Mail;

  const urgencyBarColor = c.urgency === "act_today" ? "hsl(0 70% 55%)" : c.urgency === "this_week" ? "hsl(38 85% 58%)" : "hsl(0 0% 30%)";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onSelect}
      className={cn(
        "w-full flex items-stretch rounded-xl text-left transition-all group overflow-hidden",
        isSelected
          ? "bg-[hsl(265_55%_58%/0.1)] border border-[hsl(265_55%_58%/0.3)] shadow-[0_0_20px_hsl(265_55%_58%/0.08)]"
          : "bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] hover:bg-[hsl(0_0%_100%/0.05)] hover:border-[hsl(0_0%_100%/0.1)]"
      )}
    >
      {/* Urgency bar */}
      <div className="w-1 shrink-0 rounded-l-xl" style={{ background: urgencyBarColor }} />

      <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
        {/* Avatar with score ring */}
        <div className="relative shrink-0">
          <div className="w-10 h-10">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={sb.color} strokeWidth="2.5"
                strokeDasharray={`${c.recoveryScore * 0.94} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-bold text-[hsl(0_0%_85%)] bg-[hsl(0_0%_9%)] rounded-full w-6 h-6 flex items-center justify-center tabular-nums">
                {c.name.split(" ").map(w => w[0]).join("")}
              </span>
            </div>
          </div>
          {c.boardroomCandidate && (
            <Crown className="absolute -top-1 -right-1 h-3 w-3 text-[hsl(38_85%_58%)]" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[12px] font-semibold text-[hsl(0_0%_85%)] truncate">{c.name}</p>
            <ChannelIcon className="h-3 w-3 text-[hsl(0_0%_40%)] shrink-0" />
          </div>
          <p className="text-[10px] text-[hsl(0_0%_45%)] truncate">{c.company} · {c.daysSinceLastAction}d ago</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${fm.color}15`, color: fm.color }}>
              {fm.label}
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium bg-[hsl(265_55%_58%/0.1)] text-[hsl(265_55%_70%)]">
              {rp.label}
            </span>
          </div>
        </div>

        {/* Value & action */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[12px] font-bold text-[hsl(38_85%_58%)] tabular-nums">${c.valueAtRisk.toLocaleString()}</span>
          <span className="text-[8px] font-medium" style={{ color: sb.color }}>{sb.label}</span>
          <ChevronRight className="h-3 w-3 text-[hsl(0_0%_30%)] group-hover:text-[hsl(0_0%_50%)] transition-colors" />
        </div>
      </div>
    </motion.button>
  );
}
