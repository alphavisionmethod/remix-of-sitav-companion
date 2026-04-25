import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer, getTimeAwareGreeting } from "@/domains/engines/business-identity-layers";
import { BusinessModeIndicator } from "@/modules/business/components/business/adaptive/BusinessModeIndicator";

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

// Mini sparkline data per mode
const SPARKLINE_DATA: Record<string, { label: string; values: number[]; trend: "up" | "down" | "flat"; current: string }[]> = {
  ecommerce: [
    { label: "Revenue", values: [42, 48, 45, 52, 56, 61, 58], trend: "up", current: "$12.4K" },
    { label: "Orders", values: [38, 42, 35, 47, 44, 51, 48], trend: "up", current: "86" },
    { label: "Conversion", values: [3.1, 3.4, 3.2, 3.6, 3.5, 3.8, 3.7], trend: "up", current: "3.8%" },
  ],
  service: [
    { label: "Pipeline", values: [35, 38, 42, 40, 44, 42, 48], trend: "up", current: "$42.8K" },
    { label: "Proposals", values: [4, 3, 5, 4, 6, 5, 7], trend: "up", current: "7 active" },
    { label: "Win Rate", values: [32, 35, 30, 34, 36, 33, 34], trend: "flat", current: "34%" },
  ],
  "employee-based": [
    { label: "Utilization", values: [85, 88, 90, 87, 91, 92, 89], trend: "up", current: "92%" },
    { label: "Completion", values: [82, 84, 80, 86, 85, 87, 88], trend: "up", current: "87%" },
    { label: "Overdue", values: [8, 6, 9, 7, 5, 6, 4], trend: "down", current: "4" },
  ],
  "brick-and-mortar": [
    { label: "Revenue", values: [3.5, 3.8, 4.0, 3.6, 4.1, 4.2, 3.9], trend: "up", current: "$4.2K" },
    { label: "Walk-Ins", values: [35, 38, 42, 40, 44, 47, 43], trend: "up", current: "47" },
    { label: "Coverage", values: [90, 92, 88, 94, 91, 94, 93], trend: "flat", current: "94%" },
  ],
};

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 24;
  const w = 56;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={`hsl(${color})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={w} cy={parseFloat(points.split(" ").pop()?.split(",")[1] || "0")} r="2" fill={`hsl(${color})`} />
    </svg>
  );
}

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_COLORS = { up: "152 55% 48%", down: "0 72% 55%", flat: "217 80% 55%" };

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

  const sparklines = SPARKLINE_DATA[primaryMode] || SPARKLINE_DATA.service;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.08) 0%, hsl(${identity.gradientPair[1]} / 0.03) 100%)`,
        border: `1px solid hsl(${identity.accentColor} / 0.12)`,
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] opacity-15 pointer-events-none" style={{ background: `hsl(${identity.accentColor})` }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[80px] opacity-8 pointer-events-none" style={{ background: `hsl(${identity.gradientPair[1]})` }} />

      <div className="relative p-6 space-y-4">
        {/* Top row: mode + trust */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <BusinessModeIndicator />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: `hsl(${trust.color} / 0.1)`, border: `1px solid hsl(${trust.color} / 0.15)` }}>
              <TrustIcon size={10} style={{ color: `hsl(${trust.color})` }} />
              <span className="text-[9px] font-medium" style={{ color: `hsl(${trust.color})` }}>{trust.label}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/5 border border-border/20">
              <Activity size={9} className="text-foreground/40" />
              <span className="text-[9px] text-foreground/40">Live</span>
            </div>
          </div>

          {/* Confidence ring */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="19" fill="none" strokeWidth="2.5" className="stroke-muted/15" />
                <motion.circle
                  cx="24" cy="24" r="19" fill="none" strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${confidence * 119.4} 119.4`}
                  initial={{ strokeDashoffset: 119.4 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ stroke: `hsl(${trust.color})` }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/70 font-mono">
                {Math.round(confidence * 100)}
              </span>
            </div>
          </div>
        </div>

        {/* Greeting + summary */}
        <div>
          <h1 className="text-xl font-bold text-foreground/90 font-[Space_Grotesk] mb-1">{greeting}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{contextSummary}</p>
        </div>

        {/* Sparkline KPI strip */}
        <div className="grid grid-cols-3 gap-3">
          {sparklines.map((s, i) => {
            const TrendIcon = TREND_ICONS[s.trend];
            const trendColor = TREND_COLORS[s.trend];
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-border/15"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">{s.label}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-base font-bold font-mono text-foreground/80">{s.current}</span>
                    <TrendIcon size={10} style={{ color: `hsl(${trendColor})` }} />
                  </div>
                </div>
                <MiniSparkline values={s.values} color={identity.accentColor} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
