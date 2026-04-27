import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Shield, AlertTriangle, ChevronRight,
  ArrowRight, Eye, Zap, MessageCircle
} from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { generateHomeAdvisors, detectAdvisorDisagreements } from "@/domains/engines/business-advisor-engine";
import { ModuleAdvisorPanel } from "@/modules/business/components/business/advisor-board/ModuleAdvisorPanel";

type Stance = "confident" | "cautious" | "divided";

const STANCE_STYLES: Record<Stance, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  confident: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Confident", icon: Shield },
  cautious: { color: "text-amber-400", bg: "bg-amber-500/10", label: "Cautious", icon: AlertTriangle },
  divided: { color: "text-violet-400", bg: "bg-violet-500/10", label: "Divided", icon: MessageCircle },
};

interface AdvisorSynthesis {
  stance: Stance;
  summary: string;
  actions: { label: string; priority: "high" | "medium" }[];
  caution: string;
  escalation: string;
}

const MODE_SYNTHESIS: Record<string, AdvisorSynthesis> = {
  service: {
    stance: "cautious",
    summary: "Primary focus should shift to follow-through and collections today. Opportunity flow remains healthy, but revenue conversion risk is increasing due to delayed execution. Near-term revenue protection outweighs new lead expansion in this review cycle.",
    actions: [
      { label: "Prioritize 2 overdue follow-ups tied to buying intent", priority: "high" },
      { label: "Review collections queue — 4 invoices approaching escalation", priority: "high" },
      { label: "Check Atlas Corp relationship health before drift deepens", priority: "medium" },
    ],
    caution: "Trust is partial due to incomplete support and scheduling data. Recommendations may under-weight operational pressure.",
    escalation: "Escalate the account concentration issue to Boardroom if no corrective action is taken today.",
  },
  ecommerce: {
    stance: "confident",
    summary: "Conversion metrics are strong and order volume is ahead of forecast. Primary attention should go to cart recovery and support queue clearance — both directly protect today's revenue. Retention signals are healthy but the support backlog could erode repeat-purchase likelihood.",
    actions: [
      { label: "Recover 3 high-value abandoned carts before session timeout", priority: "high" },
      { label: "Clear support queue — 4 tickets from repeat buyers at risk", priority: "high" },
      { label: "Review inventory alerts for restock before stockout impact", priority: "medium" },
    ],
    caution: "Cart recovery window is time-sensitive — prioritize within the next 2 hours for maximum conversion.",
    escalation: "If support queue exceeds 12 pending tickets, escalate to Boardroom for resource allocation review.",
  },
  "employee-based": {
    stance: "cautious",
    summary: "Team capacity is approaching critical threshold at 92%. The blocked handoffs are creating cascade risk across delivery timelines. Immediate focus should be on unblocking approvals and rebalancing workload before accepting new intake.",
    actions: [
      { label: "Clear 2 blocked handoffs — client SLA at risk", priority: "high" },
      { label: "Rebalance Jordan T.'s workload — 3 overdue items", priority: "high" },
      { label: "Pause new project intake until utilization drops below 85%", priority: "medium" },
    ],
    caution: "Workload data may not reflect informal task sharing. Verify with team leads before major rebalancing.",
    escalation: "If capacity remains above 90% for 3 consecutive days, escalate staffing review to Boardroom.",
  },
  "brick-and-mortar": {
    stance: "confident",
    summary: "Daily operations are performing well with traffic above forecast. The primary risk is tomorrow's staffing gap and low-stock inventory items. Revenue trajectory is positive — focus on sustaining momentum through operational readiness.",
    actions: [
      { label: "Fill tomorrow's evening shift coverage gap", priority: "high" },
      { label: "Initiate reorder for 3 low-stock high-demand SKUs", priority: "high" },
      { label: "Review walk-in conversion data to identify training wins", priority: "medium" },
    ],
    caution: "Foot traffic forecast accuracy has been ±15% recently. Staff scheduling should maintain buffer.",
    escalation: "No items currently warrant Boardroom review. Monitor inventory trends for potential strategic restock decision.",
  },
  "appointment-based": {
    stance: "cautious",
    summary: "Booking momentum is strong but no-show rate is trending upward. Focus on confirmation and prep for tomorrow's complex appointments. The waitlist system is effectively capturing cancellations, but proactive outreach could reduce gaps further.",
    actions: [
      { label: "Send confirmation reminders for tomorrow's high-value slots", priority: "high" },
      { label: "Review prep materials for 1 complex appointment flagged", priority: "high" },
      { label: "Analyze no-show pattern — 3 missed in 48h above baseline", priority: "medium" },
    ],
    caution: "No-show data is small sample — may be noise rather than trend. Monitor for 1 more week before policy changes.",
    escalation: "If no-show rate exceeds 15% for a full week, escalate cancellation/deposit policy review to Boardroom.",
  },
  agency: {
    stance: "divided",
    summary: "Client portfolio is stable but the scope creep on the Acme project is creating delivery risk. Meanwhile, the new pitch opportunity and upcoming renewals represent growth potential. The team is split on whether to prioritize defensive (delivery) or offensive (new business) actions this week.",
    actions: [
      { label: "Address Acme scope creep — re-scope or renegotiate this week", priority: "high" },
      { label: "Prepare renewal proposals for 2 accounts approaching window", priority: "high" },
      { label: "Allocate time for new pitch opportunity from networking event", priority: "medium" },
    ],
    caution: "Creative team utilization is balanced but fragile — adding the new pitch without resolving Acme will overshoot capacity.",
    escalation: "Acme delivery risk should go to Boardroom if scope discussion doesn't resolve within 5 business days.",
  },
};

export function AdvisorSynthesisZone() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const moduleConfig = getModuleAdaptation("overview", primaryMode);
  const synthesis = MODE_SYNTHESIS[primaryMode] || MODE_SYNTHESIS.service;
  const stanceStyle = STANCE_STYLES[synthesis.stance];
  const StanceIcon = stanceStyle.icon;
  const homeAdvisors = useMemo(() => generateHomeAdvisors(), []);
  const disagreements = useMemo(() => detectAdvisorDisagreements(homeAdvisors), [homeAdvisors]);

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
        <p className="text-xs text-foreground/60 leading-relaxed">{synthesis.summary}</p>

        {/* Recommended actions */}
        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-[0.12em] font-semibold text-foreground/30">Recommended Sequence</span>
          {synthesis.actions.map((action, i) => (
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
        {synthesis.caution && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle size={12} className="text-amber-400/70 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-400/60 leading-relaxed">{synthesis.caution}</p>
          </div>
        )}

        {/* Escalation recommendation */}
        {synthesis.escalation && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-border/15"
            style={{ background: `hsl(${identity.accentColor} / 0.04)` }}
          >
            <Zap size={12} className="mt-0.5 shrink-0" style={{ color: `hsl(${identity.accentColor} / 0.6)` }} />
            <p className="text-[10px] leading-relaxed" style={{ color: `hsl(${identity.accentColor} / 0.6)` }}>
              {synthesis.escalation}
            </p>
          </div>
        )}
        {/* Multi-Advisor Intelligence Panel */}
        <div className="border-t border-border/10 pt-4">
          <ModuleAdvisorPanel
            advisors={homeAdvisors}
            title="Business Home Advisors"
            defaultExpanded={false}
            compact
          />
        </div>
      </div>
    </motion.div>
  );
}
