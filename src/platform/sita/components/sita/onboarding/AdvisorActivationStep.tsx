// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Activation Step (Phase 2.13)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, DollarSign, Briefcase, Users, Sparkles, TrendingUp,
  ChevronDown, Check, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SetupStageHeader, StageTransitionController } from "@/platform/sita/components/sita/setup";
import { getRecommendationReason } from "@/lib/setup/reflection-copy";

export interface AdvisorActivation {
  id: string;
  enabled: boolean;
  priority: string;
}

interface AdvisorActivationStepProps {
  advisors: AdvisorActivation[];
  onUpdate: (advisors: AdvisorActivation[]) => void;
  primaryUseMode: string;
  painPoints?: string[];
  householdNodes?: { name: string; role: string }[];
  onNext: () => void;
  onPrev: () => void;
}

const ADVISORS = [
  {
    id: "life", icon: Heart, title: "Life Advisor", color: "hsl(var(--trust-safe))",
    role: "Personal well-being & daily routines",
    when: "Morning pulse, daily planning, routine health",
    helps: "Task prioritization, habit tracking, stress management, personal goals",
    example: "\"Your morning routine has shifted 45 minutes later this week. Consider adjusting your alarm or evening habits.\"",
    osLocation: "Home Dashboard, Daily Pulse",
    recommendedFor: ["personal", "family", "full"],
  },
  {
    id: "money", icon: DollarSign, title: "Money Advisor", color: "hsl(var(--sita-gold))",
    role: "Financial intelligence & oversight",
    when: "Bill due dates, spending anomalies, savings opportunities",
    helps: "Cashflow analysis, budget health, bill calendar, subscription waste, tax estimation",
    example: "\"Unusual charge of $847 from a vendor you haven't used in 6 months. Review recommended.\"",
    osLocation: "Finance OS, Money Dashboard",
    recommendedFor: ["money", "business", "full"],
  },
  {
    id: "business", icon: Briefcase, title: "Business Advisor", color: "hsl(var(--primary))",
    role: "Revenue & client intelligence",
    when: "Pipeline changes, follow-up gaps, revenue shifts",
    helps: "CRM analysis, pipeline review, lead scoring, revenue forecasting, client health",
    example: "\"3 leads haven't been contacted in 14+ days. Callback queue prepared for your review.\"",
    osLocation: "Business OS, Boardroom",
    recommendedFor: ["business", "full"],
  },
  {
    id: "family", icon: Users, title: "Family Advisor", color: "hsl(265 55% 58%)",
    role: "Household coordination & harmony",
    when: "Schedule conflicts, shared task gaps, household rhythm",
    helps: "Calendar unification, shared responsibilities, household board, family schedules",
    example: "\"School pickup conflict detected for Thursday. Two family members are double-booked.\"",
    osLocation: "Concierge OS, Family Board",
    recommendedFor: ["family", "personal", "full"],
  },
  {
    id: "concierge", icon: Sparkles, title: "Concierge Advisor", color: "hsl(38 85% 58%)",
    role: "Logistics & life management",
    when: "Booking confirmations, errand optimization, travel prep",
    helps: "Task prioritization, booking scoring, conflict detection, itinerary building",
    example: "\"Your dentist appointment is tomorrow at 2pm. Traffic suggests leaving by 1:20pm.\"",
    osLocation: "Concierge OS, Task Center",
    recommendedFor: ["personal", "family", "full"],
  },
  {
    id: "growth", icon: TrendingUp, title: "Growth Advisor", color: "hsl(152 55% 48%)",
    role: "Strategic opportunities & cross-domain insights",
    when: "Pattern detection across domains, opportunity windows",
    helps: "Cross-domain opportunity detection, risk synthesis, strategic recommendations",
    example: "\"Your Q2 revenue growth + decreased expenses suggest you can increase your savings rate by 8%.\"",
    osLocation: "Boardroom, Executive Review",
    recommendedFor: ["business", "money", "full"],
  },
];

const OS_REGIONS = [
  { id: "business-os", label: "Business OS", x: 20, y: 15, advisors: ["business"] },
  { id: "finance-os", label: "Finance OS", x: 70, y: 15, advisors: ["money"] },
  { id: "concierge-os", label: "Concierge OS", x: 20, y: 55, advisors: ["concierge", "family"] },
  { id: "trust-center", label: "Trust Center", x: 70, y: 55, advisors: [] },
  { id: "boardroom", label: "Boardroom", x: 45, y: 85, advisors: ["growth", "life"] },
];

export function AdvisorActivationStep({ advisors, onUpdate, primaryUseMode, painPoints, householdNodes, onNext, onPrev }: AdvisorActivationStepProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getAdvisorState = (id: string) => advisors.find(a => a.id === id) || { id, enabled: false, priority: "normal" };

  const toggleAdvisor = (id: string) => {
    const existing = advisors.find(a => a.id === id);
    if (existing) {
      onUpdate(advisors.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    } else {
      onUpdate([...advisors, { id, enabled: true, priority: "normal" }]);
    }
  };

  const setPriority = (id: string, priority: string) => {
    const existing = advisors.find(a => a.id === id);
    if (existing) {
      onUpdate(advisors.map(a => a.id === id ? { ...a, priority } : a));
    } else {
      onUpdate([...advisors, { id, enabled: true, priority }]);
    }
  };

  const enabledAdvisors = advisors.filter(a => a.enabled);
  const canAdvance = enabledAdvisors.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Advisor cards */}
        <div className="lg:col-span-3 space-y-5">
          <SetupStageHeader
            icon={Shield}
            title="Meet your advisory team"
            subtitle="Choose who should be active from day one"
            align="left"
          />

          <div className="space-y-2.5">
            {ADVISORS.map((advisor, i) => {
              const state = getAdvisorState(advisor.id);
              const isRecommended = advisor.recommendedFor.includes(primaryUseMode);
              const whyText = getRecommendationReason("advisor", advisor.id, { primaryUseMode, painPoints, householdNodes });
              const isExpanded = expandedId === advisor.id;

              return (
                <motion.div
                  key={advisor.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    "rounded-xl border overflow-hidden transition-all duration-300",
                    state.enabled
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card hover:border-primary/20"
                  )}
                >
                  {/* Main row */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-xl p-2.5 transition-colors",
                        state.enabled ? "bg-primary/15" : "bg-secondary"
                      )} style={state.enabled ? { background: `${advisor.color}15` } : undefined}>
                        <advisor.icon className="h-5 w-5" style={{ color: state.enabled ? advisor.color : undefined }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{advisor.title}</p>
                          {isRecommended && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{advisor.role}</p>
                        {whyText && (
                          <p className="text-[10px] text-primary/70 mt-0.5">{whyText}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : advisor.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                        </button>
                        <button
                          onClick={() => toggleAdvisor(advisor.id)}
                          className={cn(
                            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                            state.enabled
                              ? "bg-primary/15 text-primary"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          {state.enabled ? "Active" : "Enable"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border/50 overflow-hidden"
                      >
                        <div className="p-4 space-y-3 bg-secondary/10">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">When it appears</p>
                              <p className="text-xs text-foreground">{advisor.when}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Where in OS</p>
                              <p className="text-xs text-foreground">{advisor.osLocation}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">What it helps with</p>
                            <p className="text-xs text-foreground">{advisor.helps}</p>
                          </div>
                          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Example recommendation</p>
                            <p className="text-xs text-foreground italic">{advisor.example}</p>
                          </div>

                          {/* Priority selector */}
                          {state.enabled && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Activity level</p>
                              <div className="flex gap-2">
                                {["quiet", "normal", "active"].map(p => (
                                  <button key={p}
                                    onClick={() => setPriority(advisor.id, p)}
                                    className={cn(
                                      "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all",
                                      state.priority === p
                                        ? "border-primary/40 bg-primary/8 text-primary"
                                        : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/20"
                                    )}
                                  >{p}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Refine later */}
          <p className="text-[10px] text-muted-foreground text-center">
            You can add, remove, or tune advisors anytime in Settings → Advisors.
          </p>

          {/* Navigation */}
          <StageTransitionController
            onPrev={onPrev}
            onNext={onNext}
            canAdvance={canAdvance}
            extra={
              enabledAdvisors.length > 0 ? (
                <span className="text-xs text-muted-foreground">{enabledAdvisors.length} advisor{enabledAdvisors.length !== 1 ? "s" : ""} active</span>
              ) : undefined
            }
          />
        </div>

        {/* Right: System map */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-8 rounded-2xl border border-border bg-card/50 p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">System map</h3>
              <p className="text-[10px] text-muted-foreground">Advisor presence across your OS</p>
            </div>

            {/* Map visualization */}
            <div className="relative h-64 rounded-xl bg-secondary/20 border border-border/50 overflow-hidden">
              {OS_REGIONS.map(region => {
                const regionAdvisors = region.advisors.filter(aId => advisors.find(a => a.id === aId && a.enabled));
                const isIlluminated = regionAdvisors.length > 0;

                return (
                  <motion.div
                    key={region.id}
                    animate={{
                      opacity: isIlluminated ? 1 : 0.4,
                      scale: isIlluminated ? 1 : 0.95,
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="absolute"
                    style={{ left: `${region.x}%`, top: `${region.y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className={cn(
                      "rounded-xl border px-4 py-3 text-center transition-all min-w-[100px]",
                      isIlluminated
                        ? "border-primary/30 bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border/30 bg-secondary/10"
                    )}>
                      <p className={cn("text-[10px] font-semibold", isIlluminated ? "text-foreground" : "text-muted-foreground")}>
                        {region.label}
                      </p>
                      {isIlluminated && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center gap-1 mt-1.5"
                        >
                          {regionAdvisors.map(aId => {
                            const adv = ADVISORS.find(a => a.id === aId);
                            if (!adv) return null;
                            return (
                              <div key={aId} className="h-4 w-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${adv.color}20` }}>
                                <adv.icon className="h-2.5 w-2.5" style={{ color: adv.color }} />
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <line x1="20" y1="15" x2="70" y2="15" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="2,2" />
                <line x1="20" y1="15" x2="20" y2="55" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="2,2" />
                <line x1="70" y1="15" x2="70" y2="55" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="2,2" />
                <line x1="20" y1="55" x2="45" y2="85" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="2,2" />
                <line x1="70" y1="55" x2="45" y2="85" stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="2,2" />
              </svg>
            </div>

            {/* Active advisors summary */}
            {enabledAdvisors.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active team</p>
                {enabledAdvisors.map(a => {
                  const adv = ADVISORS.find(ad => ad.id === a.id);
                  if (!adv) return null;
                  return (
                    <div key={a.id} className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: adv.color }} />
                      <span className="text-foreground font-medium">{adv.title}</span>
                      <span className="text-muted-foreground capitalize ml-auto">{a.priority}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
