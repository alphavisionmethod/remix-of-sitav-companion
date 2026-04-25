// ═══════════════════════════════════════════════════════════════
// Profile Evolution Panel
// Shows detected shifts in business behavior and suggests
// profile reconfiguration — makes the OS feel alive.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles, X, ChevronRight, ArrowUpRight, Shield, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import {
  analyzeProfileEvolution,
  generateMockSignals,
  type EvolutionInsight,
} from "@/domains/engines/profile-evolution-engine";

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: React.ElementType }> = {
  significant: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: TrendingUp },
  notable: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: ArrowUpRight },
  info: { bg: "bg-muted/30", border: "border-border/50", icon: Eye },
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  drift: { label: "Drift Detected", color: "text-amber-400" },
  emergence: { label: "New Pattern", color: "text-emerald-400" },
  decline: { label: "Declining", color: "text-red-400" },
};

export default function ProfileEvolutionPanel() {
  const { profile, primaryMode, updateOverrides } = useBusinessProfile();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Generate mock signals for demo — in prod these come from actual usage tracking
  const insights = useMemo(() => {
    const signals = generateMockSignals(primaryMode);
    // Add some cross-mode signals to demonstrate drift detection
    const crossSignals = [
      ...signals,
      { id: "cross-1", category: "appointment_frequency" as const, value: 35, timestamp: new Date().toISOString(), source: "demo" },
      { id: "cross-2", category: "recurring_billing" as const, value: 25, timestamp: new Date().toISOString(), source: "demo" },
    ];
    return analyzeProfileEvolution(profile, crossSignals);
  }, [profile, primaryMode]);

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id) && !appliedIds.has(i.id));

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const handleApply = (insight: EvolutionInsight) => {
    updateOverrides(insight.suggestedWeightAdjustment);
    setAppliedIds(prev => new Set([...prev, insight.id]));
  };

  if (visibleInsights.length === 0) {
    return (
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Profile Evolution</h2>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border/50 bg-muted/20 p-8 text-center"
        >
          <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Your business profile is stable. We'll notify you when we detect meaningful shifts in your operating patterns.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Profile confidence: {Math.round(profile.profileConfidence * 100)}%
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Profile Evolution</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {visibleInsights.length} insight{visibleInsights.length !== 1 ? "s" : ""} detected
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Based on your recent activity, we've detected shifts in your business patterns.
        Review and apply suggestions to keep Business OS aligned with your reality.
      </p>

      <AnimatePresence mode="popLayout">
        {visibleInsights.map((insight, idx) => {
          const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;
          const typeInfo = TYPE_LABELS[insight.type] || TYPE_LABELS.drift;
          const Icon = insight.type === "decline" ? TrendingDown : style.icon;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={cn(
                "rounded-xl border p-4 space-y-3",
                style.bg,
                style.border,
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{insight.title}</span>
                      <span className={cn("text-[10px] font-mono uppercase tracking-wider", typeInfo.color)}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground/60">
                        {insight.severity}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(insight.id)}
                  className="p-1 rounded-md hover:bg-background/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.description}
              </p>

              {/* Suggestion */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-foreground/70 italic">
                  {insight.suggestion}
                </p>
                <button
                  onClick={() => handleApply(insight)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium transition-colors"
                >
                  Apply
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {appliedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-emerald-400/80 text-center pt-2"
        >
          ✓ {appliedIds.size} adjustment{appliedIds.size !== 1 ? "s" : ""} applied to your profile
        </motion.div>
      )}
    </div>
  );
}
