// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Empty State Component
// Canonical empty state with variants: default, card, contextual, cta
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { type LucideIcon, Inbox, Plus, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Action types ──────────────────────────────────────────────

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
}

// ── Props ─────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Visual variant */
  variant?: "default" | "card" | "contextual" | "cta";
  icon?: LucideIcon | React.ReactNode;
  title?: string;
  description?: string;
  className?: string;

  // Simple action (default & card variants)
  actionLabel?: string;
  onAction?: () => void;
  ctaPath?: string;
  /** Legacy: single action ReactNode (backward compat with primitives EmptyState) */
  action?: React.ReactNode;

  // Rich actions (contextual & cta variants)
  actions?: EmptyStateAction[];

  // Contextual variant extras
  tip?: string;

  // CTA variant extras
  mode?: "demo" | "live";
}

// ── Component ─────────────────────────────────────────────────

export function EmptyState({
  variant = "default",
  icon: iconProp = Inbox,
  title = "No data yet",
  description = "Data will appear here once you start using this feature.",
  className,
  actionLabel,
  onAction,
  ctaPath,
  action,
  actions = [],
  tip,
  mode,
}: EmptyStateProps) {
  // Resolve icon: accept LucideIcon component or ReactNode element
  const isIconComponent = typeof iconProp === "function";
  const IconComp = isIconComponent ? (iconProp as LucideIcon) : Inbox;
  const iconNode = !isIconComponent ? (iconProp as React.ReactNode) : null;

  if (variant === "card") return <CardVariant icon={IconComp} title={title} description={description} actionLabel={actionLabel} onAction={onAction} ctaPath={ctaPath} className={className} />;
  if (variant === "contextual") return <ContextualVariant icon={IconComp} title={title} description={description} tip={tip} actions={actions} className={className} />;
  if (variant === "cta") return <CTAVariant icon={IconComp} title={title} description={description} actions={actions} tip={tip} mode={mode} className={className} />;

  // Default variant
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="p-4 rounded-2xl bg-muted/30 mb-4">
        {iconNode ?? <IconComp className="h-8 w-8 text-muted-foreground/60" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {action ?? (actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      ))}
    </div>
  );
}

// ── Card variant ──────────────────────────────────────────────

function CardVariant({ icon: Icon, title, description, actionLabel, onAction, ctaPath, className }: {
  icon: LucideIcon; title: string; description: string;
  actionLabel?: string; onAction?: () => void; ctaPath?: string; className?: string;
}) {
  const navigate = useNavigate();
  return (
    <div role="status" className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 px-6 py-12 text-center", className)}>
      <div className="rounded-xl bg-primary/8 p-3 mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      {actionLabel && (
        <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={() => {
          if (onAction) onAction();
          else if (ctaPath) navigate(ctaPath);
        }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ── Contextual variant ────────────────────────────────────────

function ContextualVariant({ icon: Icon, title, description, tip, actions, className }: {
  icon: LucideIcon; title: string; description: string;
  tip?: string; actions: EmptyStateAction[]; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-border/50 bg-card/30", className)}
    >
      <div className="rounded-2xl bg-primary/5 p-4 mb-5">
        <Icon className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {tip && <p className="text-xs text-muted-foreground/70 italic mb-6">💡 {tip}</p>}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((action, i) => (
            action.to ? (
              <Link key={i} to={action.to} className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                {action.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button key={i} onClick={action.onClick} className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                {action.label} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── CTA variant ───────────────────────────────────────────────

function CTAVariant({ icon: Icon, title, description, actions, tip, mode, className }: {
  icon: LucideIcon; title: string; description: string;
  actions: EmptyStateAction[]; tip?: string; mode?: "demo" | "live"; className?: string;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("flex flex-col items-center text-center rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-secondary/20 to-transparent p-10 md:p-14", className)}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15"
      >
        <Icon className="h-8 w-8 text-primary" />
      </motion.div>

      <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions.map((action, i) => {
          const ActionIcon = action.icon || (i === 0 ? Plus : ArrowRight);
          const isPrimary = action.variant === "primary" || i === 0;
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { if (action.onClick) action.onClick(); else if (action.to) navigate(action.to); }}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                isPrimary ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "border border-border text-foreground hover:bg-secondary"
              }`}
            >
              <ActionIcon className="h-4 w-4" /> {action.label}
            </motion.button>
          );
        })}
      </div>

      {mode && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-4 text-[11px] text-muted-foreground/70 bg-secondary/40 rounded-lg px-3 py-1.5">
          {mode === "live" ? "This surface activates when real data flows in." : "You're viewing demo mode. Connect real data sources to see live results."}
        </motion.p>
      )}

      {tip && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
          <Sparkles className="h-3 w-3" /> {tip}
        </motion.p>
      )}
    </motion.div>
  );
}
