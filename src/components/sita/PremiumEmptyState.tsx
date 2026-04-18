// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Empty State
// 7 variants, domain-aware accents, CardEntrance animation
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DOMAIN_ATMOSPHERE, SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import type { DomainId } from "@/components/sita/shell/DomainAppShell";
import type { LucideIcon } from "lucide-react";
import { 
  Sparkles, CloudOff, ShieldAlert, Lock, SearchX, Ban,
  ArrowRight
} from "lucide-react";

export type EmptyStateVariant = 
  | "first-use" | "no-data" | "disconnected" 
  | "degraded" | "blocked" | "no-results" | "no-permission"
  | "demo-preview" | "connect-to-activate";

interface EmptyStateAction {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

interface PremiumEmptyStateProps {
  variant: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  tip?: string;
  domain?: DomainId;
  className?: string;
}

const VARIANT_DEFAULTS: Record<EmptyStateVariant, { icon: LucideIcon; tone: string }> = {
  "first-use":           { icon: Sparkles,   tone: "Welcome" },
  "no-data":             { icon: SearchX,    tone: "Nothing here yet" },
  "disconnected":        { icon: CloudOff,   tone: "Connection lost" },
  "degraded":            { icon: ShieldAlert,tone: "Limited functionality" },
  "blocked":             { icon: Ban,        tone: "Access restricted" },
  "no-results":          { icon: SearchX,    tone: "No matches" },
  "no-permission":       { icon: Lock,       tone: "Permission required" },
  "demo-preview":        { icon: Sparkles,   tone: "Demo preview" },
  "connect-to-activate": { icon: CloudOff,   tone: "Connect to activate" },
};

export function PremiumEmptyState({ variant, icon, title, description, actions, tip, domain = "business", className }: PremiumEmptyStateProps) {
  const atmo = DOMAIN_ATMOSPHERE[domain];
  const defaults = VARIANT_DEFAULTS[variant];
  const Icon = icon || defaults.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-8 max-w-md mx-auto",
        className
      )}
    >
      {/* Icon with domain glow */}
      <div
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: `linear-gradient(135deg, ${atmo.accentFrom} / 0.12, ${atmo.accentTo} / 0.06)`,
          borderRadius: atmo.cardRadius,
        }}
      >
        <Icon className="h-7 w-7" style={{ color: atmo.accentFrom }} />
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${atmo.accentFrom} / 0.10`,
            borderRadius: atmo.cardRadius,
          }}
        />
      </div>

      {/* Title */}
      <h3 className={cn(SITA_TYPE.pageTitle, "text-[hsl(0_0%_90%)] mb-2")}>{title}</h3>
      
      {/* Description */}
      <p className="text-[13px] text-[hsl(0_0%_55%)] leading-relaxed mb-6 max-w-xs">{description}</p>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {actions.map((action, i) => {
            const ActionIcon = action.icon;
            const isPrimary = action.variant !== "secondary";
            return (
              <button
                key={i}
                onClick={action.onClick}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-all",
                  isPrimary
                    ? "text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_80%)] hover:bg-[hsl(0_0%_100%/0.10)]"
                )}
                style={isPrimary ? {
                  background: `linear-gradient(135deg, ${atmo.accentFrom}, ${atmo.accentTo})`,
                } : undefined}
              >
                {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Tip */}
      {tip && (
        <p className="mt-6 text-[11px] text-[hsl(0_0%_40%)] flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" style={{ color: `${atmo.accentFrom}` }} />
          {tip}
        </p>
      )}
    </motion.div>
  );
}
