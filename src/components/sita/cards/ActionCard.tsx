import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

interface ActionCardProps {
  title: string;
  description: string;
  accentColor?: string;
  onApprove?: () => void;
  onDismiss?: () => void;
  badge?: ReactNode;
  className?: string;
}

export function ActionCard({ title, description, accentColor = "hsl(265 55% 58%)", onApprove, onDismiss, badge, className }: ActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] overflow-hidden",
        "shadow-[0_1px_4px_hsl(0_0%_0%/0.06)]",
        className
      )}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accentColor }} />

      <div className="pl-5 pr-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_90%)] truncate")}>{title}</h4>
              {badge}
            </div>
            <p className={cn(SITA_TYPE.timelineMeta, "line-clamp-2")}>{description}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onApprove && (
              <button onClick={onApprove} className="p-1.5 rounded-lg bg-[hsl(152_55%_48%/0.12)] hover:bg-[hsl(152_55%_48%/0.20)] text-[hsl(152_55%_48%)] transition-colors">
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            {onDismiss && (
              <button onClick={onDismiss} className="p-1.5 rounded-lg bg-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_50%)] transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
