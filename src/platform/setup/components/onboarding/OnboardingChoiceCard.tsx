// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding Choice Card (canonical primitive)
// ═══════════════════════════════════════════════════════════════
// Selectable option card for depth, tone, and category choices.
// Supports single-select (radio-like) and multi-select (toggle).
// ═══════════════════════════════════════════════════════════════

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface OnboardingChoiceCardProps {
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  recommended?: boolean;
  meta?: string;
  className?: string;
}

export function OnboardingChoiceCard({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
  badge,
  recommended = false,
  meta,
  className = "",
}: OnboardingChoiceCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full p-4 rounded-xl border text-left transition-all ${
        selected
          ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-sm shadow-primary/5"
          : recommended
            ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
            : "bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/80"
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg transition-colors ${selected ? "bg-primary/20" : "bg-muted"}`}>
            <Icon className={`h-4 w-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${selected ? "text-foreground" : "text-foreground/80"}`}>
              {label}
            </p>
            {recommended && (
              <Badge className="bg-primary/10 text-primary text-[8px]">Recommended</Badge>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {meta && <span className="text-[10px] text-muted-foreground">{meta}</span>}
          {badge && <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px]">{badge}</Badge>}
          {selected && <Check className="h-4 w-4 text-primary" />}
        </div>
      </div>
    </motion.button>
  );
}

export default OnboardingChoiceCard;
