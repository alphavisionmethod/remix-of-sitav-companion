// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding Step Header (canonical primitive)
// ═══════════════════════════════════════════════════════════════
// Title + subtitle + optional icon/microcopy used at the top of
// each ceremony screen.
// ═══════════════════════════════════════════════════════════════

import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface OnboardingStepHeaderProps {
  title: string;
  subtitle?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  chapter?: string;
  microcopy?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function OnboardingStepHeader({
  title,
  subtitle,
  icon: Icon,
  chapter,
  microcopy,
  align = "center",
  className = "",
}: OnboardingStepHeaderProps) {
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${alignment} mb-6 ${className}`}
    >
      {chapter && (
        <Badge className="bg-primary/10 text-primary text-[10px] mb-2">{chapter}</Badge>
      )}
      {Icon && (
        <Icon className={`h-7 w-7 text-primary mb-2 ${align === "center" ? "mx-auto" : ""}`} />
      )}
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      {microcopy && <p className="text-[11px] text-muted-foreground/70 mt-2">{microcopy}</p>}
    </motion.div>
  );
}

export default OnboardingStepHeader;
