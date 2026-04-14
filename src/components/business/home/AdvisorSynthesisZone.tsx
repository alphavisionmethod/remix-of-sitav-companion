import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Shield, AlertTriangle, ChevronRight,
  ArrowRight, Eye, Zap, MessageCircle
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";
import { getModuleAdaptation } from "@/lib/engines/business-module-adaptations";

type Stance = "confident" | "cautious" | "divided";

const STANCE_STYLES: Record<Stance, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  confident: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Confident", icon: Shield },
  cautious: { color: "text-amber-400", bg: "bg-amber-500/10", label: "Cautious", icon: AlertTriangle },
  divided: { color: "text-violet-400", bg: "bg-violet-500/10", label: "Divided", icon: MessageCircle },
};

const DEMO_SYNTHESIS = {
  stance: "cautious" as Stance,
  summary: "Primary focus should shift to follow-through and collections today. Opportunity flow remains healthy, but revenue conversion risk is increasing due to delayed execution. Near-term revenue protection outweighs new lead expansion in this review cycle.",
  actions: [
    { label: "Prioritize 2 overdue follow-ups tied to buying intent", priority: "high" as const },
    { label: "Review collections queue — 4 invoices approaching escalation", priority: "high" as const },
    { label: "Check Atlas Corp relationship health before drift deepens", priority: "medium" as const },
  ],
  caution: "Trust is partial due to incomplete support and scheduling data. Recommendations may under-weight operational pressure.",
  escalation: "Escalate the account concentration issue to Boardroom if no corrective action is taken today.",
};

export function AdvisorSynthesisZone() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const moduleConfig = getModuleAdaptation("overview", primaryMode);
  const stanceStyle = STANCE_STYLES[DEMO_SYNTHESIS.stance];
  const StanceIcon = stanceStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl overflow-hidden border border-border/20"
      style={{
        background: `linear-gradient(160deg, hsl(${identity.accentColor} / 0.04) 0%, hsl(var(--card) / 0.6) 40%)`,
      }}
    >
      <div className="p-5 space-y-4">
        {/* Advisor header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `hsl(${identity.accentColor} / 0.12)` }}
            >
              <Sparkles size={18} style={{ color: `hsl(${identity.accentColor})` }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground/85">{moduleConfig.advisorName}</h3>
              <p className="text-[10px] text-muted-foreground">{moduleConfig.advisorSpecialty}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${stanceStyle.bg}`}>
            <StanceIcon size={10} className={stanceStyle.color} />
            <span className={`text-[9px] font-semibold ${stanceStyle.color}`}>{stanceStyle.label}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-foreground/60 leading-relaxed">
          {DEMO_SYNTHESIS.summary}
        </p>

        {/* Recommended actions */}
        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-[0.12em] font-semibold text-foreground/30">Recommended Sequence</span>
          {DEMO_SYNTHESIS.actions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card/30 border border-border/10 hover:border-border/25 transition-colors cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                action.priority === "high" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/10 text-blue-400"
              }`}>
                {i + 1}
              </div>
              <p className="text-[11px] text-foreground/70 flex-1">{action.label}</p>
              <ChevronRight size={12} className="text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* Caution */}
        {DEMO_SYNTHESIS.caution && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle size={12} className="text-amber-400/70 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-400/60 leading-relaxed">{DEMO_SYNTHESIS.caution}</p>
          </div>
        )}

        {/* Escalation recommendation */}
        {DEMO_SYNTHESIS.escalation && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-border/15"
            style={{ background: `hsl(${identity.accentColor} / 0.04)` }}
          >
            <Zap size={12} className="mt-0.5 shrink-0" style={{ color: `hsl(${identity.accentColor} / 0.6)` }} />
            <p className="text-[10px] leading-relaxed" style={{ color: `hsl(${identity.accentColor} / 0.6)` }}>
              {DEMO_SYNTHESIS.escalation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
