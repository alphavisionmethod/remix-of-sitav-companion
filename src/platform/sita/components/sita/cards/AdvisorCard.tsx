import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import type { ReactNode } from "react";

interface AdvisorCardProps {
  advisorName: string;
  insight: string;
  confidence?: number; // 0-100
  domain?: string;
  accentColor?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function AdvisorCard({ advisorName, insight, confidence, domain, accentColor = "hsl(265 55% 58%)", action, className }: AdvisorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 relative overflow-hidden",
        className
      )}
    >
      {/* Subtle domain glow */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 0%, ${accentColor} / 0.06, transparent 70%)` }} />

      <div className="relative flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor} / 0.20, ${accentColor} / 0.08)` }}>
          <Brain className="h-3.5 w-3.5" style={{ color: accentColor }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>{advisorName}</span>
            {domain && <span className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_45%)]")}>{domain}</span>}
          </div>
          <p className={cn("text-[12px] leading-relaxed text-[hsl(0_0%_65%)]")}>{insight}</p>

          <div className="flex items-center gap-3 mt-2.5">
            {confidence !== undefined && (
              <span className={cn(SITA_TYPE.microLabel, confidence >= 80 ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_0%_50%)]")}>
                {confidence}% confidence
              </span>
            )}
            {action && (
              <button onClick={action.onClick} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_80%)] transition-colors">
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
