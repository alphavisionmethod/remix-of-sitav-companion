// ═══════════════════════════════════════════════════════════════
// Adaptive KPI Dashboard
// A dedicated KPI view that adapts entirely to business archetype,
// showing relevant metrics with identity-aware styling.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, BarChart3, Activity,
  Target, Zap, Shield, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { useDataMode } from "@/contexts/DataModeContext";

interface KPIMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  sparkline?: number[];
  target?: string;
  status: "on-track" | "at-risk" | "behind" | "exceeding";
}

// Demo KPI data per archetype
const KPIS: Record<string, KPIMetric[]> = {
  ecommerce: [
    { id: "conversion", label: "Conversion Rate", value: "3.2%", change: "+0.4%", changeType: "positive", sparkline: [2.8, 2.9, 3.0, 2.8, 3.1, 3.2], target: "3.5%", status: "on-track" },
    { id: "aov", label: "Average Order Value", value: "$87.50", change: "+$4.20", changeType: "positive", sparkline: [82, 83, 85, 84, 86, 87.5], target: "$90", status: "on-track" },
    { id: "cart-abandon", label: "Cart Abandonment", value: "68%", change: "-2.1%", changeType: "positive", sparkline: [72, 71, 70, 69, 69, 68], target: "65%", status: "at-risk" },
    { id: "repeat", label: "Repeat Purchase Rate", value: "24%", change: "+1.8%", changeType: "positive", sparkline: [20, 21, 22, 22, 23, 24], target: "30%", status: "behind" },
    { id: "cltv", label: "Customer LTV", value: "$342", change: "+$18", changeType: "positive", sparkline: [310, 315, 320, 325, 335, 342], target: "$400", status: "on-track" },
    { id: "returns", label: "Return Rate", value: "4.8%", change: "-0.3%", changeType: "positive", sparkline: [5.5, 5.3, 5.1, 5.0, 4.9, 4.8], target: "<5%", status: "exceeding" },
    { id: "campaign-roi", label: "Campaign ROI", value: "3.4x", change: "+0.2x", changeType: "positive", sparkline: [2.8, 3.0, 3.1, 3.2, 3.3, 3.4], target: "3x", status: "exceeding" },
    { id: "support-load", label: "Support Load", value: "142", change: "+12", changeType: "negative", sparkline: [120, 125, 130, 128, 135, 142], target: "<120", status: "behind" },
  ],
  service: [
    { id: "pipeline", label: "Pipeline Value", value: "$184K", change: "+$22K", changeType: "positive", sparkline: [140, 150, 155, 162, 170, 184], target: "$200K", status: "on-track" },
    { id: "close-rate", label: "Proposal Close Rate", value: "38%", change: "+3%", changeType: "positive", sparkline: [32, 33, 35, 35, 37, 38], target: "40%", status: "on-track" },
    { id: "avg-job", label: "Avg Job Value", value: "$4,200", change: "+$300", changeType: "positive", sparkline: [3500, 3700, 3900, 3800, 4000, 4200], target: "$4,500", status: "on-track" },
    { id: "retention", label: "Client Retention", value: "89%", change: "+2%", changeType: "positive", sparkline: [85, 86, 87, 87, 88, 89], target: "90%", status: "on-track" },
    { id: "invoice-aging", label: "Invoice Aging (Avg)", value: "18 days", change: "-3 days", changeType: "positive", sparkline: [25, 23, 22, 20, 19, 18], target: "15 days", status: "at-risk" },
    { id: "delivery", label: "On-Time Delivery", value: "92%", change: "+1%", changeType: "positive", sparkline: [88, 89, 90, 90, 91, 92], target: "95%", status: "at-risk" },
    { id: "followup", label: "Follow-up Rate", value: "78%", change: "-2%", changeType: "negative", sparkline: [82, 81, 80, 79, 79, 78], target: "85%", status: "behind" },
    { id: "scheduling", label: "Booking Fill Rate", value: "71%", change: "+4%", changeType: "positive", sparkline: [62, 64, 66, 67, 69, 71], target: "80%", status: "at-risk" },
  ],
  "brick-and-mortar": [
    { id: "traffic", label: "Daily Traffic", value: "234", change: "+18", changeType: "positive", sparkline: [200, 210, 215, 220, 228, 234], target: "250", status: "on-track" },
    { id: "repeat-visits", label: "Repeat Visit Rate", value: "42%", change: "+3%", changeType: "positive", sparkline: [36, 37, 38, 39, 41, 42], target: "45%", status: "on-track" },
    { id: "staff-util", label: "Staff Utilization", value: "82%", change: "+1%", changeType: "positive", sparkline: [78, 79, 80, 80, 81, 82], target: "85%", status: "on-track" },
    { id: "no-show", label: "No-Show Rate", value: "8%", change: "-1%", changeType: "positive", sparkline: [12, 11, 10, 9, 9, 8], target: "<5%", status: "at-risk" },
    { id: "satisfaction", label: "Satisfaction Score", value: "4.6", change: "+0.1", changeType: "positive", sparkline: [4.3, 4.4, 4.4, 4.5, 4.5, 4.6], target: "4.8", status: "on-track" },
    { id: "revenue-loc", label: "Revenue / Location", value: "$12.4K", change: "+$800", changeType: "positive", sparkline: [10.5, 11.0, 11.2, 11.5, 12.0, 12.4], target: "$15K", status: "at-risk" },
  ],
  "employee-based": [
    { id: "completion", label: "Task Completion Rate", value: "87%", change: "+2%", changeType: "positive", sparkline: [82, 83, 84, 85, 86, 87], target: "90%", status: "on-track" },
    { id: "resolution", label: "Avg Resolution Time", value: "4.2h", change: "-0.5h", changeType: "positive", sparkline: [5.5, 5.2, 4.9, 4.7, 4.4, 4.2], target: "4h", status: "on-track" },
    { id: "utilization", label: "Utilization", value: "78%", change: "+3%", changeType: "positive", sparkline: [72, 73, 74, 75, 77, 78], target: "80%", status: "on-track" },
    { id: "handoff", label: "Handoff Success", value: "91%", change: "+1%", changeType: "positive", sparkline: [88, 88, 89, 90, 90, 91], target: "95%", status: "at-risk" },
    { id: "overdue", label: "Overdue Tasks", value: "14", change: "-3", changeType: "positive", sparkline: [22, 20, 18, 17, 16, 14], target: "<10", status: "at-risk" },
    { id: "quality", label: "Quality Score", value: "8.4", change: "+0.2", changeType: "positive", sparkline: [7.8, 7.9, 8.0, 8.1, 8.3, 8.4], target: "9.0", status: "on-track" },
  ],
  agency: [
    { id: "pipeline", label: "Pipeline Value", value: "$420K", change: "+$35K", changeType: "positive", sparkline: [350, 365, 380, 390, 400, 420], target: "$500K", status: "on-track" },
    { id: "satisfaction", label: "Client Satisfaction", value: "4.7", change: "+0.1", changeType: "positive", sparkline: [4.4, 4.5, 4.5, 4.6, 4.6, 4.7], target: "4.8", status: "on-track" },
    { id: "utilization", label: "Billable Utilization", value: "72%", change: "+2%", changeType: "positive", sparkline: [66, 67, 68, 69, 71, 72], target: "75%", status: "on-track" },
    { id: "margin", label: "Project Margin", value: "42%", change: "+1%", changeType: "positive", sparkline: [38, 39, 40, 40, 41, 42], target: "45%", status: "on-track" },
    { id: "revenue-client", label: "Revenue / Client", value: "$18K", change: "+$1.2K", changeType: "positive", sparkline: [14, 15, 16, 16.5, 17, 18], target: "$20K", status: "on-track" },
    { id: "win-rate", label: "Proposal Win Rate", value: "34%", change: "+2%", changeType: "positive", sparkline: [28, 29, 30, 31, 33, 34], target: "35%", status: "on-track" },
    { id: "retention", label: "Client Retention", value: "88%", change: "+1%", changeType: "positive", sparkline: [84, 85, 86, 86, 87, 88], target: "90%", status: "at-risk" },
    { id: "concentration", label: "Revenue Concentration", value: "28%", change: "-2%", changeType: "positive", sparkline: [35, 33, 32, 31, 29, 28], target: "<25%", status: "at-risk" },
  ],
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "exceeding": { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Exceeding" },
  "on-track": { bg: "bg-sky-500/10", text: "text-sky-400", label: "On Track" },
  "at-risk": { bg: "bg-amber-500/10", text: "text-amber-400", label: "At Risk" },
  "behind": { bg: "bg-red-500/10", text: "text-red-400", label: "Behind" },
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdaptiveKPIDashboard() {
  const { isDemoMode } = useDataMode();
  const { primaryMode, adaptations } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const kpis = KPIS[primaryMode] || KPIS.service;

  const statusCounts = kpis.reduce((acc, k) => {
    acc[k.status] = (acc[k.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[16px] font-bold text-foreground/90 flex items-center gap-2">
            <BarChart3 size={16} style={{ color: `hsl(${identity.accentColor})` }} />
            KPI Dashboard
          </h1>
          <p className="text-[11px] text-foreground/40 mt-0.5">
            {adaptations.kpis.length} key metrics tracked for{" "}
            <span style={{ color: `hsl(${identity.accentColor})` }} className="font-semibold">
              {identity.tagline}
            </span>
          </p>
        </div>

        {/* Status summary pills */}
        <div className="flex items-center gap-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const style = STATUS_STYLES[status];
            return (
              <span
                key={status}
                className={cn(
                  "text-[9px] font-medium px-2 py-0.5 rounded-full",
                  style?.bg, style?.text
                )}
              >
                {count} {style?.label}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => {
          const status = STATUS_STYLES[kpi.status] || STATUS_STYLES["on-track"];
          const ChangeIcon = kpi.changeType === "positive" ? TrendingUp : kpi.changeType === "negative" ? TrendingDown : Minus;

          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 hover:bg-[hsl(0_0%_100%/0.04)] transition-colors group"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/30">
                  {kpi.label}
                </span>
                <span className={cn("text-[8px] font-medium px-1.5 py-0.5 rounded-full", status.bg, status.text)}>
                  {status.label}
                </span>
              </div>

              {/* Value + sparkline */}
              <div className="flex items-end justify-between mb-2">
                <span className="text-[22px] font-bold text-foreground/85 leading-none">
                  {kpi.value}
                </span>
                {kpi.sparkline && (
                  <MiniSparkline
                    data={kpi.sparkline}
                    color={kpi.changeType === "positive" ? "hsl(152 55% 48%)" : kpi.changeType === "negative" ? "hsl(0 72% 51%)" : "hsl(0 0% 50%)"}
                  />
                )}
              </div>

              {/* Change + target */}
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px] font-semibold flex items-center gap-0.5",
                  kpi.changeType === "positive" && "text-[hsl(var(--trust-safe))]",
                  kpi.changeType === "negative" && "text-[hsl(var(--destructive))]",
                  kpi.changeType === "neutral" && "text-foreground/40"
                )}>
                  <ChangeIcon size={10} />
                  {kpi.change}
                </span>
                {kpi.target && (
                  <span className="text-[9px] text-foreground/25 flex items-center gap-0.5">
                    <Target size={8} />
                    {kpi.target}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cross-domain finance signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity size={12} style={{ color: `hsl(${identity.accentColor})` }} />
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25">
            Finance Signal Emphasis
          </span>
        </div>
        <p className="text-[11px] text-foreground/50 mb-2">{adaptations.boardroom.focusAreas.join(" · ")}</p>
        <div className="flex flex-wrap gap-1.5">
          {adaptations.kpis.map((kpi) => (
            <span
              key={kpi}
              className="text-[9px] px-2 py-0.5 rounded-full font-medium border"
              style={{
                backgroundColor: `hsl(${identity.accentColor} / 0.08)`,
                color: `hsl(${identity.accentColor})`,
                borderColor: `hsl(${identity.accentColor} / 0.15)`,
              }}
            >
              {kpi}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
