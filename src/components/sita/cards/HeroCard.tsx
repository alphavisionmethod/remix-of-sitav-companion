import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface HeroCardProps {
  title: string;
  metric?: string;
  subtitle?: string;
  accentFrom?: string;
  accentTo?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function HeroCard({ title, metric, subtitle, accentFrom = "hsl(265 55% 58%)", accentTo = "hsl(285 50% 48%)", icon, children, className }: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative w-full rounded-2xl overflow-hidden",
        "bg-[hsl(0_0%_9%)] border border-[hsl(0_0%_100%/0.08)]",
        "shadow-[0_2px_8px_hsl(0_0%_0%/0.08),0_12px_32px_hsl(0_0%_0%/0.12)]",
        "p-6",
        className
      )}
    >
      {/* Accent gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, ${accentFrom}, ${accentTo})` }} />

      {/* Subtle radial glow */}
      <div className="absolute top-0 left-0 w-1/2 h-full pointer-events-none" style={{ background: `radial-gradient(ellipse at 20% 30%, ${accentFrom} / 0.06, transparent 60%)` }} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {icon && <span className="shrink-0">{icon}</span>}
            <h3 className={cn(SITA_TYPE.sectionTitle, "text-[hsl(0_0%_50%)]")}>{title}</h3>
          </div>
          {metric && (
            <p className={cn(SITA_TYPE.metricEmphasis, "text-[hsl(0_0%_95%)] mb-1")}>{metric}</p>
          )}
          {subtitle && (
            <p className={cn(SITA_TYPE.timelineMeta, "text-[hsl(0_0%_55%)]")}>{subtitle}</p>
          )}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </motion.div>
  );
}
