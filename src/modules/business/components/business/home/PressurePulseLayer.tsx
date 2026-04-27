import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Headphones, Receipt,
  Settings, Calendar, ArrowRight, ShoppingCart,
  FileText, Layers, Package, Clock as ClockIcon
} from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

interface PressureDomain {
  id: string;
  label: string;
  icon: React.ElementType;
  value: number;
  interpretation: string;
  trend: number[]; // mini sparkline
}

const MODE_PRESSURES: Record<string, PressureDomain[]> = {
  service: [
    { id: "lead", label: "Leads", icon: Users, value: 0.45, interpretation: "Steady — matching capacity", trend: [40, 42, 38, 45, 43, 45] },
    { id: "pipeline", label: "Pipeline", icon: TrendingUp, value: 0.72, interpretation: "Growing — 3 deals stalling", trend: [55, 60, 65, 68, 70, 72] },
    { id: "support", label: "Support", icon: Headphones, value: 0.58, interpretation: "Moderate — 2 escalations", trend: [50, 52, 55, 54, 57, 58] },
    { id: "collections", label: "Collections", icon: Receipt, value: 0.68, interpretation: "Elevated — 4 past timing", trend: [45, 50, 55, 60, 65, 68] },
    { id: "operations", label: "Operations", icon: Settings, value: 0.35, interpretation: "Low — flowing well", trend: [40, 38, 36, 35, 34, 35] },
    { id: "schedule", label: "Schedule", icon: Calendar, value: 0.42, interpretation: "Normal — 1 gap tomorrow", trend: [45, 44, 43, 42, 43, 42] },
  ],
  ecommerce: [
    { id: "orders", label: "Orders", icon: ShoppingCart, value: 0.55, interpretation: "Strong volume today", trend: [40, 45, 48, 50, 53, 55] },
    { id: "carts", label: "Cart Recovery", icon: Package, value: 0.65, interpretation: "3 high-value recoverable", trend: [50, 55, 58, 60, 63, 65] },
    { id: "support", label: "Support", icon: Headphones, value: 0.72, interpretation: "Queue growing — 4 pending", trend: [55, 60, 65, 68, 70, 72] },
    { id: "retention", label: "Retention", icon: Users, value: 0.38, interpretation: "Healthy repeat rate", trend: [42, 40, 39, 38, 38, 38] },
    { id: "fulfillment", label: "Fulfillment", icon: Layers, value: 0.42, interpretation: "On track — 2 delayed", trend: [45, 44, 43, 42, 42, 42] },
    { id: "returns", label: "Returns", icon: Receipt, value: 0.28, interpretation: "Below average — good", trend: [35, 33, 30, 29, 28, 28] },
  ],
  "employee-based": [
    { id: "workload", label: "Workload", icon: Users, value: 0.78, interpretation: "Near capacity — 92%", trend: [60, 65, 70, 74, 76, 78] },
    { id: "handoffs", label: "Handoffs", icon: Layers, value: 0.62, interpretation: "2 blocked transfers", trend: [45, 50, 55, 58, 60, 62] },
    { id: "overdue", label: "Overdue", icon: ClockIcon, value: 0.55, interpretation: "6 assignments late", trend: [40, 45, 48, 50, 53, 55] },
    { id: "pipeline", label: "Pipeline", icon: TrendingUp, value: 0.45, interpretation: "Steady execution flow", trend: [48, 47, 46, 45, 45, 45] },
    { id: "support", label: "Support", icon: Headphones, value: 0.35, interpretation: "Low queue depth", trend: [40, 38, 37, 36, 35, 35] },
    { id: "schedule", label: "Coverage", icon: Calendar, value: 0.48, interpretation: "1 shift gap detected", trend: [50, 49, 48, 48, 48, 48] },
  ],
  "brick-and-mortar": [
    { id: "traffic", label: "Traffic", icon: Users, value: 0.62, interpretation: "12% above forecast", trend: [45, 48, 52, 55, 58, 62] },
    { id: "staff", label: "Staffing", icon: Layers, value: 0.42, interpretation: "Adequate — 1 gap", trend: [48, 46, 44, 43, 42, 42] },
    { id: "inventory", label: "Inventory", icon: Package, value: 0.52, interpretation: "3 low-stock SKUs", trend: [40, 44, 48, 50, 51, 52] },
    { id: "support", label: "Service", icon: Headphones, value: 0.38, interpretation: "Wait times normal", trend: [42, 40, 39, 38, 38, 38] },
    { id: "sales", label: "Sales", icon: Receipt, value: 0.55, interpretation: "Meeting daily target", trend: [45, 48, 50, 52, 54, 55] },
    { id: "schedule", label: "Schedule", icon: Calendar, value: 0.35, interpretation: "All shifts covered", trend: [38, 37, 36, 35, 35, 35] },
  ],
  "appointment-based": [
    { id: "bookings", label: "Bookings", icon: Calendar, value: 0.55, interpretation: "15% above average", trend: [42, 45, 48, 50, 53, 55] },
    { id: "noshow", label: "No-Shows", icon: ClockIcon, value: 0.62, interpretation: "Trending up — watch", trend: [35, 38, 42, 48, 55, 62] },
    { id: "prep", label: "Prep", icon: FileText, value: 0.38, interpretation: "1 complex case pending", trend: [45, 42, 40, 39, 38, 38] },
    { id: "waitlist", label: "Waitlist", icon: Users, value: 0.45, interpretation: "3 waiting for slots", trend: [40, 42, 43, 44, 44, 45] },
    { id: "support", label: "Support", icon: Headphones, value: 0.28, interpretation: "Low — resolved quickly", trend: [35, 32, 30, 29, 28, 28] },
    { id: "revenue", label: "Revenue", icon: Receipt, value: 0.42, interpretation: "On track for target", trend: [38, 39, 40, 41, 42, 42] },
  ],
  agency: [
    { id: "utilization", label: "Utilization", icon: Users, value: 0.72, interpretation: "Approaching fragile zone", trend: [60, 64, 68, 70, 71, 72] },
    { id: "delivery", label: "Delivery", icon: Layers, value: 0.65, interpretation: "1 project at risk", trend: [45, 50, 55, 58, 62, 65] },
    { id: "pipeline", label: "Pipeline", icon: TrendingUp, value: 0.48, interpretation: "1 new pitch opportunity", trend: [52, 50, 49, 48, 48, 48] },
    { id: "renewals", label: "Renewals", icon: Receipt, value: 0.58, interpretation: "2 approaching window", trend: [40, 44, 48, 52, 55, 58] },
    { id: "support", label: "Client Sat", icon: Headphones, value: 0.35, interpretation: "4.2/5 — stable", trend: [38, 37, 36, 35, 35, 35] },
    { id: "scope", label: "Scope Risk", icon: Settings, value: 0.68, interpretation: "Acme 40% over", trend: [35, 40, 48, 55, 62, 68] },
  ],
};

function getSeverityColor(value: number): string {
  if (value >= 0.7) return "0 72% 55%";
  if (value >= 0.5) return "38 85% 55%";
  return "152 55% 48%";
}

function MiniTrendLine({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 40;
  const h = 16;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={`hsl(${color})`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function PressureGauge({ domain, delay }: { domain: PressureDomain; delay: number }) {
  const sevColor = getSeverityColor(domain.value);
  const Icon = domain.icon;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const arcLen = 0.75;
  const dashLen = domain.value * circumference * arcLen;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-card/40 border border-border/20 hover:border-border/40 transition-all hover:bg-card/60 cursor-default"
    >
      <div className="relative w-[60px] h-[60px]">
        <svg viewBox="0 0 70 70" className="w-full h-full" style={{ transform: "rotate(135deg)" }}>
          <circle cx="35" cy="35" r={radius} fill="none" strokeWidth="4" className="stroke-muted/10"
            strokeDasharray={`${circumference * arcLen} ${circumference * (1 - arcLen)}`}
            strokeLinecap="round"
          />
          <motion.circle
            cx="35" cy="35" r={radius} fill="none" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            initial={{ strokeDashoffset: dashLen }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
            style={{ stroke: `hsl(${sevColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={12} className="text-foreground/40 mb-0.5" />
          <span className="text-[11px] font-bold font-mono text-foreground/75">{Math.round(domain.value * 100)}</span>
        </div>
      </div>
      <span className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider">{domain.label}</span>
      <MiniTrendLine values={domain.trend} color={sevColor} />
      <p className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-2 max-w-[100px]">{domain.interpretation}</p>
    </motion.div>
  );
}

export function PressurePulseLayer() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const pressures = MODE_PRESSURES[primaryMode] || MODE_PRESSURES.service;

  // Find highest pressure for interconnection insight
  const sorted = [...pressures].sort((a, b) => b.value - a.value);
  const topTwo = sorted.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl p-4 border border-border/20 h-full flex flex-col"
      style={{ background: "hsl(var(--card) / 0.4)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: `hsl(${getSeverityColor(sorted[0].value)})` }} />
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-foreground/40">Pressure & Pulse</span>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 flex-1">
        {pressures.map((d, i) => (
          <PressureGauge key={d.id} domain={d} delay={0.3 + i * 0.05} />
        ))}
      </div>

      {/* Interconnection insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-3 flex items-center gap-2 p-2.5 rounded-lg border"
        style={{
          background: `hsl(${getSeverityColor(topTwo[0].value)} / 0.04)`,
          borderColor: `hsl(${getSeverityColor(topTwo[0].value)} / 0.1)`,
        }}
      >
        <ArrowRight size={10} style={{ color: `hsl(${getSeverityColor(topTwo[0].value)} / 0.7)` }} className="shrink-0" />
        <p className="text-[9px] leading-relaxed" style={{ color: `hsl(${getSeverityColor(topTwo[0].value)} / 0.7)` }}>
          <span className="font-semibold">{topTwo[0].label}</span> + <span className="font-semibold">{topTwo[1].label}</span> pressure connected — monitor for compounding risk.
        </p>
      </motion.div>
    </motion.div>
  );
}
