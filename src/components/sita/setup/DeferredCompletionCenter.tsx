// ═══════════════════════════════════════════════════════════════
// SITA OS — Deferred Completion Center
// Post-arrival hub for skipped setup items. Elegant, non-nagging.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, ChevronDown, ChevronRight, Check, Fingerprint,
  Plug, Sliders, Shield, Users, Bell, Brain, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface DeferredItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Clock;
  category: "security" | "connections" | "personalization" | "privacy";
  actionLabel: string;
  completed: boolean;
}

interface DeferredCompletionCenterProps {
  items: DeferredItem[];
  onItemAction: (itemId: string) => void;
  className?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: typeof Shield }> = {
  security: { label: "Security", icon: Shield },
  connections: { label: "Connections", icon: Plug },
  personalization: { label: "Personalization", icon: Sliders },
  privacy: { label: "Privacy", icon: Shield },
};

/**
 * Build default deferred items from setup state.
 */
export function buildDeferredItems(opts: {
  skippedBiometrics?: boolean;
  deferredConnections?: string[];
  skippedDeepPersonalization?: boolean;
  skippedRecoveryMethod?: boolean;
  skippedHousehold?: boolean;
  skippedNotificationTuning?: boolean;
}): DeferredItem[] {
  const items: DeferredItem[] = [];

  if (opts.skippedBiometrics) {
    items.push({
      id: "biometrics", label: "Biometric Authentication", description: "Add Face ID or fingerprint for faster, more secure access",
      icon: Fingerprint, category: "security", actionLabel: "Set up", completed: false,
    });
  }

  if (opts.skippedRecoveryMethod) {
    items.push({
      id: "recovery", label: "Recovery Method", description: "Add a backup way to access your account if you forget your password",
      icon: Shield, category: "security", actionLabel: "Configure", completed: false,
    });
  }

  if (opts.deferredConnections?.length) {
    for (const conn of opts.deferredConnections) {
      items.push({
        id: `conn-${conn}`, label: `Connect ${conn}`, description: `Link your ${conn} account for richer intelligence`,
        icon: Plug, category: "connections", actionLabel: "Connect", completed: false,
      });
    }
  }

  if (opts.skippedDeepPersonalization) {
    items.push({
      id: "deep-personalization", label: "Deep Personalization", description: "Help SITA understand your world in more detail",
      icon: Brain, category: "personalization", actionLabel: "Continue", completed: false,
    });
  }

  if (opts.skippedHousehold) {
    items.push({
      id: "household", label: "Household Members", description: "Add family or household members for coordination support",
      icon: Users, category: "personalization", actionLabel: "Set up", completed: false,
    });
  }

  if (opts.skippedNotificationTuning) {
    items.push({
      id: "notifications", label: "Notification Tuning", description: "Fine-tune when and how SITA communicates with you",
      icon: Bell, category: "personalization", actionLabel: "Tune", completed: false,
    });
  }

  return items;
}

export function DeferredCompletionCenter({ items, onItemAction, className }: DeferredCompletionCenterProps) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const pending = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  if (items.length === 0) return null;

  // Group by category
  const grouped = pending.reduce<Record<string, DeferredItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border border-border/60 bg-card overflow-hidden", className)}
    >
      {/* Header — clickable to expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 p-4 border-b border-border/40 bg-secondary/5 hover:bg-secondary/10 transition-colors text-left"
      >
        <div className="rounded-lg bg-[hsl(var(--sita-gold))]/10 p-1.5">
          <Clock className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Finish setup your way</h3>
          <p className="text-[10px] text-muted-foreground">
            {pending.length} item{pending.length !== 1 ? "s" : ""} available
            {completed.length > 0 && ` · ${completed.length} completed`}
          </p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {Object.entries(grouped).map(([category, catItems]) => {
                const meta = CATEGORY_META[category];
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      {meta && <meta.icon className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {meta?.label || category}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {catItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-secondary/20 transition-colors group">
                          <div className="rounded-lg bg-secondary/40 p-1.5">
                            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground">{item.description}</p>
                          </div>
                          <button
                            onClick={() => onItemAction(item.id)}
                            className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 opacity-70 group-hover:opacity-100"
                          >
                            {item.actionLabel} <ChevronRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Completed items */}
              {completed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-3 w-3 text-[hsl(var(--trust-safe))]" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
                  </div>
                  {completed.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-3 py-2 opacity-60">
                      <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
                      <span className="text-xs text-foreground line-through">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-muted-foreground text-center pt-1">
                No rush — these are available in Settings anytime
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
