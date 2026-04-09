import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shield, Sparkles, BarChart3, Home, Activity, MessageCircle, Compass, Clock, Gauge, Layout, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { generateReflections, type ReflectionInput } from "@/lib/setup/reflection-copy";

interface SetupSnapshot {
  displayName: string;
  role: string;
  enabledDomains: string[];
  trustLevel: string;
  aiStyle: string;
  painPoints?: string[];
  protectionPriorities?: string[];
  presenceStyle?: string;
  rituals?: string[];
  homeComposition?: string;
  // Enhanced fields
  operatingContext?: string;
  supportNeedPrimary?: string;
  lifeRhythm?: { weekStructure?: string; planningHorizon?: string; planningSupport?: string[] };
  stressMap?: { heavierThanShould?: string[]; affectedFirst?: string[] };
  commsContext?: { communicationStress?: string; supportNeeds?: string[] };
  planningStyle?: { viewPreference?: string; focusPreference?: string };
  desktopDensity?: string;
}

interface LearningPanelProps {
  state: SetupSnapshot;
}

const CONTEXT_LABELS: Record<string, string> = {
  "getting-control": "Getting in control",
  "managing-many": "Managing many moving parts",
  "rebuilding": "Rebuilding structure",
  "growing": "Growing / scaling",
  "maintaining": "Maintaining what works",
  "transition": "In transition",
  "mixed": "Mixed season",
};

const DENSITY_LABELS: Record<string, string> = {
  calm: "Calm & minimal",
  balanced: "Balanced",
  dense: "Dense command center",
};

export function LearningPanel({ state }: LearningPanelProps) {
  const insights = useMemo(() => {
    const items: { icon: typeof Brain; label: string; value: string }[] = [];

    // Active advisors
    const advisorCount = state.enabledDomains.length + 1;
    items.push({ icon: Brain, label: "Active Advisors", value: `${advisorCount} advisor${advisorCount !== 1 ? "s" : ""}` });

    // Trust mode
    const trustLabels: Record<string, string> = { open: "Open — Act freely", balanced: "Balanced — Ask first", guarded: "Guarded — Full control" };
    items.push({ icon: Shield, label: "Trust Mode", value: trustLabels[state.trustLevel] || "Not set" });

    // Operating context
    if (state.operatingContext && CONTEXT_LABELS[state.operatingContext]) {
      items.push({ icon: Compass, label: "Current Season", value: CONTEXT_LABELS[state.operatingContext] });
    }

    // Detected priorities
    if (state.painPoints && state.painPoints.length > 0) {
      items.push({ icon: Activity, label: "Detected Priorities", value: state.painPoints.slice(0, 2).join(", ") });
    }

    // Stress load
    if (state.stressMap?.heavierThanShould && state.stressMap.heavierThanShould.length > 0) {
      const count = state.stressMap.heavierThanShould.length;
      items.push({ icon: Gauge, label: "Stress Load", value: `${count} pressure area${count !== 1 ? "s" : ""} detected` });
    }

    // Life rhythm
    if (state.lifeRhythm?.planningHorizon) {
      const rhythmLabels: Record<string, string> = { today: "Day-by-day", "this-week": "Week-at-a-glance", "this-month": "Monthly cadence", "long-term": "Long-term view" };
      items.push({ icon: Clock, label: "Planning Rhythm", value: rhythmLabels[state.lifeRhythm.planningHorizon] || state.lifeRhythm.planningHorizon });
    }

    // Likely workflows
    const workflows: string[] = [];
    if (state.enabledDomains.includes("business")) workflows.push("Lead follow-up");
    if (state.enabledDomains.includes("money")) workflows.push("Bill tracking");
    if (state.enabledDomains.includes("concierge")) workflows.push("Calendar sync");
    if (workflows.length > 0) {
      items.push({ icon: Sparkles, label: "Likely First Workflows", value: workflows.join(", ") });
    }

    // Planning style
    if (state.planningStyle?.viewPreference) {
      items.push({ icon: Layout, label: "View Style", value: `${state.planningStyle.viewPreference} · ${state.planningStyle.focusPreference || "default"}` });
    }

    // Communications
    if (state.commsContext?.communicationStress) {
      const commsLabels: Record<string, string> = { none: "Low comm stress", some: "Moderate comm load", often: "High comm pressure", overwhelming: "Very high comm pressure" };
      items.push({ icon: Radio, label: "Comms Load", value: commsLabels[state.commsContext.communicationStress] || state.commsContext.communicationStress });
    }

    // Desktop shape
    if (state.homeComposition) {
      const shapes: Record<string, string> = { calm: "Calm dashboard", business: "Business-first", family: "Family-first", money: "Money-first", command: "Full command center" };
      items.push({ icon: Home, label: "Desktop Shape", value: shapes[state.homeComposition] || state.homeComposition });
    }

    // Desktop density
    if (state.desktopDensity && DENSITY_LABELS[state.desktopDensity]) {
      items.push({ icon: Gauge, label: "Desktop Density", value: DENSITY_LABELS[state.desktopDensity] });
    }

    // Rituals
    if (state.rituals && state.rituals.length > 0) {
      items.push({ icon: BarChart3, label: "Rhythm", value: `${state.rituals.length} ritual${state.rituals.length !== 1 ? "s" : ""} active` });
    }

    return items;
  }, [state]);

  const reflections = useMemo(() => {
    const input: ReflectionInput = {
      trustLevel: state.trustLevel,
      presenceStyle: state.presenceStyle,
      primaryUseMode: state.role,
      painPoints: state.painPoints,
      rituals: state.rituals,
      householdNodes: state.homeComposition ? [{ name: "member", role: state.homeComposition }] : undefined,
    };
    return generateReflections(input).slice(0, 2);
  }, [state]);

  // Domain confidence
  const domainConfidence = useMemo(() => {
    const domains = state.enabledDomains;
    return domains.map(d => {
      const hasSignal = d === "business" ? (state.painPoints?.length > 0) :
        d === "money" ? (state.protectionPriorities?.length > 0) :
        !!state.homeComposition;
      return { domain: d, confident: hasSignal };
    });
  }, [state]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-72 shrink-0 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-4 hidden lg:block"
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your OS is learning you
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {insights.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-secondary/30 p-3 space-y-1"
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</span>
            </div>
            <p className="text-xs text-foreground font-medium">{item.value}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Domain confidence badges */}
      {domainConfidence.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Domain Confidence</p>
          {domainConfidence.map(dc => (
            <div key={dc.domain} className="flex items-center justify-between">
              <span className="text-[10px] text-foreground capitalize">{dc.domain}</span>
              <span className={cn("text-[9px] font-medium rounded-full px-1.5 py-0.5",
                dc.confident ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" : "bg-muted text-muted-foreground"
              )}>
                {dc.confident ? "Good signal" : "Still learning"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reflection copy */}
      {reflections.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-3 w-3 text-primary/60" />
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">What SITA understands</p>
          </div>
          {reflections.map(r => (
            <p key={r.category} className="text-[10px] text-foreground/70 leading-relaxed">{r.text}</p>
          ))}
        </div>
      )}

      {insights.length === 0 && reflections.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Make your first choices to see SITA learn…
        </p>
      )}
    </motion.div>
  );
}
