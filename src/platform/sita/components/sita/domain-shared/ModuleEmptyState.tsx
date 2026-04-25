// ═══════════════════════════════════════════════════════════════
// SITA OS — Beautiful Module Empty State
// Domain-aware, premium, with optional action
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { DomainId } from "@/components/sita/shell/DomainAppShell";

interface ModuleEmptyStateProps {
  domain: DomainId;
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const domainGradient: Record<DomainId, { from: string; to: string }> = {
  business: { from: "hsl(265 55% 58%)", to: "hsl(285 50% 48%)" },
  finance: { from: "hsl(152 55% 48%)", to: "hsl(165 50% 42%)" },
  concierge: { from: "hsl(285 55% 55%)", to: "hsl(310 50% 48%)" },
  files: { from: "hsl(220 15% 55%)", to: "hsl(230 15% 45%)" },
  trust: { from: "hsl(35 75% 55%)", to: "hsl(25 70% 48%)" },
};

export function ModuleEmptyState({ domain, icon: Icon, title, description, action, className }: ModuleEmptyStateProps) {
  const grad = domainGradient[domain];

  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-dashed border-[hsl(0_0%_100%/0.08)]", className)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: `linear-gradient(135deg, ${grad.from}20, ${grad.to}10)` }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <Icon className="h-7 w-7" style={{ color: grad.from }} />
      </motion.div>

      <h3 className="font-display text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed">{description}</p>

      {action && (
        <motion.button
          onClick={action.onClick}
          className="mt-5 rounded-lg px-5 py-2.5 text-sm font-medium text-[hsl(0_0%_100%/0.95)] transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
