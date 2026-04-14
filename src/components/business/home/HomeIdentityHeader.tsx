import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer, getTimeAwareGreeting } from "@/lib/engines/business-identity-layers";
import { BusinessModeIndicator } from "@/components/business/adaptive/BusinessModeIndicator";

const TRUST_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  high: { label: "High Confidence", color: "152 55% 48%", icon: Shield },
  medium: { label: "Partial Confidence", color: "38 85% 58%", icon: AlertTriangle },
  low: { label: "Low Confidence", color: "0 72% 51%", icon: AlertTriangle },
};

const CONTEXTUAL_SUMMARIES: Record<string, string[]> = {
  ecommerce: [
    "Conversion stable, repeat-purchase opportunity high, support queue elevated.",
    "Cart recovery active — 3 high-value carts still recoverable this session.",
    "Order volume trending up 18% this week. Retention signals strong.",
  ],
  service: [
    "Proposal activity rising, collections pressure moderate, follow-through slipping.",
    "3 proposals aging past day 5 — win rate drops 40% after day 7.",
    "Pipeline healthy but execution backlog growing. Prioritize delivery today.",
  ],
  "brick-and-mortar": [
    "Foot traffic above forecast. Staff coverage adequate with 1 gap tomorrow.",
    "Daily operations smooth. 3 low-stock SKUs need reorder attention.",
    "Walk-in conversion strong this week. Schedule review recommended.",
  ],
  "employee-based": [
    "Execution pressure building across handoffs, approvals pending.",
    "6 assignments overdue across 3 team members. Rebalancing recommended.",
    "Team utilization at 92% — approaching capacity threshold.",
  ],
  "appointment-based": [
    "Today's schedule 85% confirmed. 2 slots with no-show risk elevated.",
    "Booking momentum strong — 15% above weekly average.",
    "Prep reminders sent. 1 complex appointment needs advance review.",
  ],
  agency: [
    "Client portfolio stable. 2 accounts approaching renewal window.",
    "Utilization balanced. New pitch opportunity in pipeline.",
    "Delivery milestones on track. 1 client project needs scope review.",
  ],
};

export function HomeIdentityHeader() {
  const { primaryMode, profile } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const greeting = getTimeAwareGreeting(primaryMode);
  const confidence = profile.profileConfidence;
  const trustLevel = confidence >= 0.7 ? "high" : confidence >= 0.4 ? "medium" : "low";
  const trust = TRUST_LABELS[trustLevel];
  const TrustIcon = trust.icon;

  const summaries = CONTEXTUAL_SUMMARIES[primaryMode] || CONTEXTUAL_SUMMARIES.service;
  const summaryIdx = Math.floor(Date.now() / 86400000) % summaries.length;
  const contextSummary = summaries[summaryIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.08) 0%, hsl(${identity.gradientPair[1]} / 0.04) 100%)`,
        border: `1px solid hsl(${identity.accentColor} / 0.12)`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: `hsl(${identity.accentColor})` }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <BusinessModeIndicator />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: `hsl(${trust.color} / 0.1)`, border: `1px solid hsl(${trust.color} / 0.15)` }}>
              <TrustIcon size={10} style={{ color: `hsl(${trust.color})` }} />
              <span className="text-[9px] font-medium" style={{ color: `hsl(${trust.color})` }}>{trust.label}</span>
            </div>
          </div>

          <h1 className="text-lg font-semibold text-foreground/90 font-[Space_Grotesk]">
            {greeting}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            {contextSummary}
          </p>
        </div>

        {/* Confidence ring */}
        <div className="hidden sm:flex flex-col items-center gap-1.5">
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className="stroke-muted/20" />
              <motion.circle
                cx="24" cy="24" r="20" fill="none" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${confidence * 125.6} 125.6`}
                initial={{ strokeDashoffset: 125.6 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ stroke: `hsl(${trust.color})` }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground/80 font-mono">
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Trust</span>
        </div>
      </div>
    </motion.div>
  );
}
