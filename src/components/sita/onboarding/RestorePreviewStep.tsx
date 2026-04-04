// ═══════════════════════════════════════════════════════════════
// SITA OS — Restore Preview Step
// Selective restore with environment preview and category cards
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Shield, Brain, Sparkles, Globe, Eye, Users,
  ChevronRight, Check, Calendar, Plug, Clock, Settings,
  Palette, Bell, SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RestorableCategory {
  id: string;
  label: string;
  icon: typeof Brain;
  description: string;
  itemCount: number;
  enabled: boolean;
}

interface RestorePreviewStepProps {
  displayName?: string;
  lastUsedDate?: string;
  lastDeviceName?: string;
  onRestore: (selectedCategories: string[]) => void;
  onStartFresh: () => void;
  onRestoreLater: () => void;
  onPrev: () => void;
}

const DEFAULT_CATEGORIES: RestorableCategory[] = [
  { id: "advisors", label: "Advisors & Configuration", icon: Brain, description: "Active advisors, priority levels, activity modes", itemCount: 6, enabled: true },
  { id: "trust", label: "Trust & Autonomy Settings", icon: Shield, description: "Trust levels, approval rules, permission boundaries", itemCount: 12, enabled: true },
  { id: "workspaces", label: "Boards & Workspaces", icon: Globe, description: "Boardroom layout, domain dashboards, custom views", itemCount: 4, enabled: true },
  { id: "desktop", label: "Desktop Layout", icon: Palette, description: "Theme, accent color, dock arrangement, home composition", itemCount: 8, enabled: true },
  { id: "connections", label: "Service Connections", icon: Plug, description: "Calendar, email, CRM, finance integrations", itemCount: 3, enabled: true },
  { id: "routines", label: "Routines & Rituals", icon: Calendar, description: "Morning pulse, weekly review, notification schedules", itemCount: 5, enabled: true },
  { id: "privacy", label: "Privacy Baseline", icon: Eye, description: "Permission choices, data access, proof preferences", itemCount: 7, enabled: true },
  { id: "household", label: "Household Graph", icon: Users, description: "Family members, roles, shared item permissions", itemCount: 0, enabled: false },
];

export function RestorePreviewStep({
  displayName,
  lastUsedDate,
  lastDeviceName,
  onRestore,
  onStartFresh,
  onRestoreLater,
  onPrev,
}: RestorePreviewStepProps) {
  const reduced = useReducedMotion();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [restoring, setRestoring] = useState(false);
  const [restored, setRestored] = useState(false);

  const toggleCategory = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const selectedCount = categories.filter(c => c.enabled).length;
  const totalItems = categories.filter(c => c.enabled).reduce((s, c) => s + c.itemCount, 0);

  const handleRestore = () => {
    setRestoring(true);
    // Simulate restore
    setTimeout(() => {
      setRestoring(false);
      setRestored(true);
      setTimeout(() => {
        onRestore(categories.filter(c => c.enabled).map(c => c.id));
      }, 800);
    }, 2000);
  };

  const anim = (delay: number) => reduced ? {} : {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  };

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div {...anim(0)}
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4"
        >
          <RotateCcw className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <motion.h2 {...anim(0.1)} className="font-display text-2xl font-bold text-foreground">
          {displayName ? `${displayName}'s environment found` : "Previous environment found"}
        </motion.h2>
        <motion.div {...anim(0.15)} className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
          {lastUsedDate && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Last used: {lastUsedDate}
            </span>
          )}
          {lastDeviceName && (
            <span className="flex items-center gap-1.5">
              <Settings className="h-3 w-3" /> {lastDeviceName}
            </span>
          )}
        </motion.div>
      </div>

      {/* Restoring state */}
      <AnimatePresence>
        {restoring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"
            >
              <RotateCcw className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="text-sm font-semibold text-foreground">Restoring your environment…</p>
            <p className="text-xs text-muted-foreground">Bringing back {totalItems} items from {selectedCount} categories</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restored state */}
      <AnimatePresence>
        {restored && !restoring && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--trust-safe))]/15"
            >
              <Check className="h-8 w-8 text-[hsl(var(--trust-safe))]" />
            </motion.div>
            <p className="text-sm font-semibold text-foreground">Your world is returning</p>
            <p className="text-xs text-muted-foreground">Environment restored successfully</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category selection */}
      {!restoring && !restored && (
        <>
          <motion.div {...anim(0.2)} className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-secondary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Choose what to restore</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{selectedCount} of {categories.length} selected · {totalItems} items</span>
              </div>
            </div>

            <div className="divide-y divide-border/30">
              {categories.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  {...anim(0.25 + i * 0.04)}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-secondary/20",
                    cat.enabled ? "bg-primary/3" : "opacity-60"
                  )}
                >
                  <div className={cn(
                    "rounded-lg p-2 transition-colors",
                    cat.enabled ? "bg-primary/10" : "bg-secondary"
                  )}>
                    <cat.icon className={cn("h-4 w-4", cat.enabled ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    <p className="text-[11px] text-muted-foreground">{cat.description}</p>
                  </div>
                  {cat.itemCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">{cat.itemCount} items</span>
                  )}
                  <div className={cn(
                    "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                    cat.enabled ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {cat.enabled && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div {...anim(0.5)} className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={onPrev} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Back
              </button>
              <button onClick={onStartFresh} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <SkipForward className="h-3 w-3" /> Start fresh
              </button>
              <button onClick={onRestoreLater} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Restore later
              </button>
            </div>
            <button
              onClick={handleRestore}
              disabled={selectedCount === 0}
              className={cn(
                "rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
                selectedCount > 0
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Restore environment <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
