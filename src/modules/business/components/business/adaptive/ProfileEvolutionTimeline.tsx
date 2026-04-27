// ═══════════════════════════════════════════════════════════════
// Profile Evolution Timeline — Visual timeline + enhanced suggestions
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, TrendingUp, TrendingDown, Sparkles, X, ChevronRight,
  ArrowUpRight, Shield, Eye, Zap, PartyPopper, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import {
  analyzeProfileEvolution,
  generateMockSignals,
  type EvolutionInsight,
} from "@/domains/engines/profile-evolution-engine";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";
import { useDataMode } from "@/contexts/DataModeContext";

const ARCHETYPE_LABELS: Record<string, string> = {
  ecommerce: "E-Commerce", "brick-and-mortar": "Brick & Mortar", service: "Service",
  "employee-based": "Team Ops", "appointment-based": "Appointments", agency: "Agency",
  "professional-practice": "Professional", hybrid: "Hybrid", "multi-location": "Multi-Location",
  "product-service": "Product+Service", membership: "Membership", marketplace: "Marketplace",
};

// Mock timeline data
const TIMELINE = [
  { date: "Jan", mode: "service" as ProfileArchetype, confidence: 0.45 },
  { date: "Feb", mode: "service" as ProfileArchetype, confidence: 0.52 },
  { date: "Mar", mode: "service" as ProfileArchetype, confidence: 0.58 },
  { date: "Apr", mode: "service" as ProfileArchetype, confidence: 0.65 },
  { date: "May", mode: "service" as ProfileArchetype, confidence: 0.61 },
  { date: "Jun", mode: "service" as ProfileArchetype, confidence: 0.70 },
  { date: "Jul", mode: "service" as ProfileArchetype, confidence: 0.68 },
  { date: "Aug", mode: "service" as ProfileArchetype, confidence: 0.75 },
];

export default function ProfileEvolutionTimeline() {
  const { isDemoMode } = useDataMode();
  const { profile, primaryMode, updateOverrides } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const insights = useMemo(() => {
    const signals = generateMockSignals(primaryMode);
    const crossSignals = [
      ...signals,
      { id: "cross-1", category: "appointment_frequency" as const, value: 35, timestamp: new Date().toISOString(), source: "demo" },
      { id: "cross-2", category: "recurring_billing" as const, value: 25, timestamp: new Date().toISOString(), source: "demo" },
    ];
    return analyzeProfileEvolution(profile, crossSignals);
  }, [profile, primaryMode]);

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id) && !appliedIds.has(i.id));

  const handleApply = (insight: EvolutionInsight) => {
    updateOverrides(insight.suggestedWeightAdjustment);
    setAppliedIds(prev => new Set([...prev, insight.id]));
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  // Generate timeline with current mode
  const timeline = (isDemoMode ? TIMELINE : [] as typeof TIMELINE).map(t => ({ ...t, mode: primaryMode }));

  return (
    <div className="p-5 space-y-5 max-w-3xl">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="rounded-2xl bg-[hsl(0_0%_8%/0.95)] border border-[hsl(var(--trust-safe))]/20 p-8 text-center backdrop-blur-xl">
              <PartyPopper size={40} className="text-[hsl(var(--sita-gold))] mx-auto mb-3" />
              <p className="text-[14px] font-bold text-foreground/80">Profile Updated!</p>
              <p className="text-[11px] text-foreground/40 mt-1">Your Business OS is adapting to your new reality</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual timeline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-foreground/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30">Profile Evolution Timeline</span>
          </div>
          <span className="text-[9px] text-foreground/20">Demo data</span>
        </div>

        {/* Sparkline chart */}
        <div className="relative h-[100px] flex items-end gap-1">
          {timeline.map((point, i) => {
            const height = point.confidence * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="w-full rounded-t-md relative group cursor-pointer"
                  style={{
                    background: `linear-gradient(to top, hsl(${identity.accentColor} / 0.4), hsl(${identity.accentColor} / 0.15))`,
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-bold text-foreground/50 bg-[hsl(0_0%_8%)] px-1.5 py-0.5 rounded border border-[hsl(0_0%_100%/0.1)] whitespace-nowrap">
                      {Math.round(point.confidence * 100)}%
                    </span>
                  </div>
                </motion.div>
                <span className="text-[8px] text-foreground/20">{point.date}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(0_0%_100%/0.04)]">
          <span className="text-[9px] text-foreground/25">
            Mode: <span style={{ color: `hsl(${identity.accentColor})` }} className="font-semibold">{ARCHETYPE_LABELS[primaryMode]}</span>
          </span>
          <span className="text-[9px] text-foreground/25">
            Current confidence: <span className="font-semibold text-foreground/50">{Math.round(profile.profileConfidence * 100)}%</span>
          </span>
        </div>
      </motion.div>

      {/* Insights */}
      {visibleInsights.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: `hsl(${identity.accentColor})` }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30">
              Detected Shifts ({visibleInsights.length})
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {visibleInsights.map((insight, idx) => {
              const isPreviewing = previewId === insight.id;
              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.06 }}
                  className={cn(
                    "rounded-xl border p-4 transition-all",
                    insight.severity === "significant"
                      ? "border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5"
                      : "border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)]"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {insight.type === "decline" ? (
                        <TrendingDown size={14} className="text-[hsl(var(--destructive))]" />
                      ) : (
                        <TrendingUp size={14} className="text-[hsl(var(--trust-safe))]" />
                      )}
                      <span className="text-[12px] font-semibold text-foreground/70">{insight.title}</span>
                      <span className={cn(
                        "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                        insight.type === "drift" ? "bg-amber-500/10 text-amber-400" : insight.type === "emergence" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {insight.type}
                      </span>
                    </div>
                    <button onClick={() => setDismissedIds(prev => new Set([...prev, insight.id]))} className="p-1 rounded-md hover:bg-[hsl(0_0%_100%/0.05)]">
                      <X size={12} className="text-foreground/20" />
                    </button>
                  </div>

                  <p className="text-[10px] text-foreground/40 mb-3">{insight.description}</p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewId(isPreviewing ? null : insight.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] text-foreground/40 hover:text-foreground/60 transition-colors"
                    >
                      <Eye size={10} />
                      {isPreviewing ? "Hide Preview" : "Preview Change"}
                    </button>
                    <button
                      onClick={() => handleApply(insight)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-medium bg-[hsl(var(--sita-purple))]/15 text-[hsl(var(--sita-purple))] hover:bg-[hsl(var(--sita-purple))]/25 transition-colors"
                    >
                      Apply <ChevronRight size={10} />
                    </button>
                  </div>

                  {/* Preview panel */}
                  <AnimatePresence>
                    {isPreviewing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-[hsl(0_0%_100%/0.05)]"
                      >
                        <p className="text-[9px] text-foreground/30 mb-2">If applied, these would change:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(insight.suggestedWeightAdjustment).map(([arch, val]) => (
                            <div key={arch} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2 text-center">
                              <p className="text-[9px] text-foreground/40">{ARCHETYPE_LABELS[arch] || arch}</p>
                              <p className="text-[11px] font-bold text-foreground/60">{Math.round((val || 0) * 100)}%</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-8 text-center"
        >
          <Shield size={28} className="text-foreground/15 mx-auto mb-3" />
          <p className="text-[12px] text-foreground/40 font-medium">Profile is Stable</p>
          <p className="text-[10px] text-foreground/25 mt-1 max-w-[300px] mx-auto">
            No significant shifts detected. We'll notify you when your business patterns evolve.
          </p>
        </motion.div>
      )}

      {appliedIds.size > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <span className="text-[10px] text-[hsl(var(--trust-safe))]">
            ✓ {appliedIds.size} profile adjustment{appliedIds.size !== 1 ? "s" : ""} applied
          </span>
        </motion.div>
      )}
    </div>
  );
}
