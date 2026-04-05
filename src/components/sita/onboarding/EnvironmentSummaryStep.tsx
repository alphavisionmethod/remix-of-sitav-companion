import { motion } from "framer-motion";
import { Check, Sparkles, ArrowLeft, ChevronRight, Shield, Brain, Briefcase, DollarSign, Headphones, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LifeRhythmData } from "./LifeRhythmStep";
import type { StressMapData } from "./StressSlippageStep";
import type { CommsContextData } from "./CommunicationsContextStep";
import type { PlanningStyleData } from "./PlanningStyleStep";

interface Props {
  displayName: string;
  trustLevel: string;
  primaryUseMode: string;
  enabledDomains: string[];
  activeAdvisors: { id: string; name: string; enabled: boolean }[];
  lifeRhythm?: LifeRhythmData;
  stressMap?: StressMapData;
  commsContext?: CommsContextData;
  planningStyle?: PlanningStyleData;
  connectedSystems: number;
  firstWinAction: string;
  onNext: () => void;
  onPrev: () => void;
}

const DOMAIN_META: Record<string, { icon: typeof Briefcase; label: string }> = {
  business: { icon: Briefcase, label: "Business" },
  money: { icon: DollarSign, label: "Money" },
  concierge: { icon: Headphones, label: "Concierge" },
  personal: { icon: Eye, label: "Personal" },
};

export const EnvironmentSummaryStep = ({ displayName, trustLevel, primaryUseMode, enabledDomains, activeAdvisors, lifeRhythm, stressMap, commsContext, planningStyle, connectedSystems, firstWinAction, onNext, onPrev }: Props) => {
  const enabledAdvisors = activeAdvisors.filter(a => a.enabled);

  // Reflective copy based on answers
  const reflections: string[] = [];
  if (stressMap && stressMap.heavierThanShould.includes("things-slipping")) {
    reflections.push("Since follow-up is where things slip, SITA is preparing stronger support there.");
  }
  if (lifeRhythm?.weekStructure === "chaotic") {
    reflections.push("Because your weeks are unpredictable, SITA will focus on flexible daily priorities.");
  }
  if (commsContext?.communicationStress === "overwhelming") {
    reflections.push("Communication support is set to active — summaries and triage will appear automatically.");
  }
  if (enabledDomains.includes("money")) {
    reflections.push("Because money clarity matters, your boardroom will emphasize bills, cash, and approvals.");
  }
  if (planningStyle?.focusPreference === "action") {
    reflections.push("Your desktop will lead with actions — what needs doing right now, front and center.");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--sita-gold))]/10 px-3 py-1 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--sita-gold))] uppercase tracking-wider">Environment Ready</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Your environment is ready, {displayName}</h2>
        <p className="text-sm text-muted-foreground mt-1">Here's what SITA has shaped around you</p>
      </div>

      <div className="space-y-4">
        {/* Reflective insights */}
        {reflections.length > 0 && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            {reflections.map((r, i) => (
              <p key={i} className="text-[11px] text-foreground/80 flex items-start gap-2">
                <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span>{r}</span>
              </p>
            ))}
          </div>
        )}

        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Domains */}
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Active Domains</p>
            <div className="space-y-1.5">
              {enabledDomains.map(d => {
                const meta = DOMAIN_META[d] || DOMAIN_META.personal;
                const Icon = meta.icon;
                return (
                  <div key={d} className="flex items-center gap-2">
                    <Icon className="h-3 w-3 text-primary" />
                    <span className="text-xs text-foreground">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust */}
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Trust Mode</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
              <span className="text-sm font-medium text-foreground capitalize">{trustLevel}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {trustLevel === "open" ? "SITA acts freely within rules" : trustLevel === "guarded" ? "Approval needed for most actions" : "Balanced autonomy with oversight"}
            </p>
          </div>

          {/* Advisors */}
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Active Advisors</p>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{enabledAdvisors.length} advisors</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              {enabledAdvisors.slice(0, 3).map(a => a.name).join(", ")}
            </p>
          </div>

          {/* Connections */}
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Connected</p>
            <p className="text-sm font-medium text-foreground">{connectedSystems} systems</p>
            <p className="text-[10px] text-muted-foreground mt-1">More can be added anytime</p>
          </div>
        </div>

        {/* First win */}
        {firstWinAction && (
          <div className="rounded-xl border border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5 p-3">
            <p className="text-[9px] text-[hsl(var(--sita-gold))] font-semibold uppercase tracking-wider mb-1">First Win</p>
            <p className="text-sm text-foreground">{firstWinAction}</p>
          </div>
        )}

        {/* Planning & rhythm */}
        {(planningStyle || lifeRhythm) && (
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Your Style</p>
            <div className="space-y-1">
              {planningStyle?.viewPreference && (
                <p className="text-[11px] text-muted-foreground">View: <span className="text-foreground capitalize">{planningStyle.viewPreference}</span></p>
              )}
              {planningStyle?.focusPreference && (
                <p className="text-[11px] text-muted-foreground">Focus: <span className="text-foreground capitalize">{planningStyle.focusPreference}</span></p>
              )}
              {lifeRhythm?.planningHorizon && (
                <p className="text-[11px] text-muted-foreground">Horizon: <span className="text-foreground capitalize">{lifeRhythm.planningHorizon}</span></p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={onPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" /> Review
        </button>
        <button onClick={onNext}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
          Enter SITA <ChevronRight className="inline h-4 w-4 ml-1" />
        </button>
      </div>
    </motion.div>
  );
};
