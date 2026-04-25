// ═══════════════════════════════════════════════════════════════
// Advisor Configuration Panel — Toggle, tune, and scope advisors
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Zap, Shield, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { Slider } from "@/components/ui/slider";

type FocusMode = "risk" | "growth" | "execution" | "strategic";

const FOCUS_OPTIONS: { id: FocusMode; label: string; icon: React.ElementType; color: string }[] = [
  { id: "risk", label: "Risk", icon: Shield, color: "hsl(0 72% 51%)" },
  { id: "growth", label: "Growth", icon: TrendingUp, color: "hsl(var(--trust-safe))" },
  { id: "execution", label: "Execution", icon: Zap, color: "hsl(var(--sita-gold))" },
  { id: "strategic", label: "Strategic", icon: Target, color: "hsl(var(--sita-purple))" },
];

interface AdvisorState {
  id: string;
  active: boolean;
  opinionation: number;
  focus: FocusMode;
}

export default function AdvisorConfigPanel() {
  const { adaptations, primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [advisorStates, setAdvisorStates] = useState<AdvisorState[]>(() =>
    adaptations.advisors.map(a => ({
      id: a.id,
      active: a.affinityScore > 0.3,
      opinionation: 50,
      focus: "execution" as FocusMode,
    }))
  );

  const toggleActive = (id: string) => {
    setAdvisorStates(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const setOpinionation = (id: string, val: number) => {
    setAdvisorStates(prev => prev.map(a => a.id === id ? { ...a, opinionation: val } : a));
  };

  const setFocus = (id: string, focus: FocusMode) => {
    setAdvisorStates(prev => prev.map(a => a.id === id ? { ...a, focus } : a));
  };

  const activeCount = advisorStates.filter(a => a.active).length;

  return (
    <div className="p-5 space-y-5 max-w-3xl">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${identity.accentColor} / 0.1)` }}>
            <Bot size={18} style={{ color: `hsl(${identity.accentColor})` }} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-foreground/70">{activeCount} Active Advisors</p>
            <p className="text-[10px] text-foreground/30">{adaptations.advisors.length} available for your profile</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-foreground/25 uppercase tracking-wider">Profile</p>
          <p className="text-[11px] font-semibold" style={{ color: `hsl(${identity.accentColor})` }}>{identity.tagline}</p>
        </div>
      </motion.div>

      {/* Advisor cards */}
      <div className="space-y-2">
        {adaptations.advisors.map((advisor, i) => {
          const state = advisorStates.find(a => a.id === advisor.id);
          if (!state) return null;
          const isExpanded = expandedId === advisor.id;

          return (
            <motion.div
              key={advisor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                state.active
                  ? "border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.03)]"
                  : "border-[hsl(0_0%_100%/0.05)] bg-[hsl(0_0%_100%/0.01)] opacity-50"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : advisor.id)}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{ backgroundColor: `hsl(${advisor.accent} / 0.15)`, color: `hsl(${advisor.accent})` }}
                >
                  {advisor.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-foreground/70 truncate">{advisor.name}</span>
                    <span className="text-[8px] text-foreground/25 tabular-nums">{Math.round(advisor.affinityScore * 100)}% match</span>
                  </div>
                  <p className="text-[9px] text-foreground/30 truncate">{advisor.specialty}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleActive(advisor.id); }}
                  className="shrink-0"
                >
                  {state.active ? (
                    <ToggleRight size={22} className="text-[hsl(var(--trust-safe))]" />
                  ) : (
                    <ToggleLeft size={22} className="text-foreground/20" />
                  )}
                </button>
                {isExpanded ? <ChevronUp size={14} className="text-foreground/20" /> : <ChevronDown size={14} className="text-foreground/20" />}
              </div>

              {/* Expanded config */}
              <AnimatePresence>
                {isExpanded && state.active && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-[hsl(0_0%_100%/0.05)] pt-3">
                      {/* Opinionation slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-foreground/40">Opinionation Level</span>
                          <span className="text-[10px] font-semibold text-foreground/50">
                            {state.opinionation < 30 ? "Conservative" : state.opinionation < 70 ? "Balanced" : "Assertive"}
                          </span>
                        </div>
                        <Slider
                          value={[state.opinionation]}
                          onValueChange={([v]) => setOpinionation(advisor.id, v)}
                          max={100}
                          step={10}
                        />
                        <div className="flex justify-between text-[8px] text-foreground/20">
                          <span>Conservative</span>
                          <span>Assertive</span>
                        </div>
                      </div>

                      {/* Focus selector */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-foreground/40">Emphasis Focus</span>
                        <div className="flex gap-1.5">
                          {FOCUS_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = state.focus === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => setFocus(advisor.id, opt.id)}
                                className={cn(
                                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all border",
                                  isSelected
                                    ? "border-foreground/15 bg-foreground/5 text-foreground/70"
                                    : "border-transparent text-foreground/25 hover:text-foreground/45"
                                )}
                              >
                                <Icon size={10} />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
