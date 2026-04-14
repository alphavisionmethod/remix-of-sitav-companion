import React from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Headphones, Receipt,
  Settings, Calendar, ArrowRight
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";

interface PressureDomain {
  id: string;
  label: string;
  icon: React.ElementType;
  value: number; // 0-1
  interpretation: string;
  connected?: string;
}

const DEMO_PRESSURES: PressureDomain[] = [
  { id: "lead", label: "Leads", icon: Users, value: 0.45, interpretation: "Steady — new leads matching capacity", connected: "pipeline" },
  { id: "pipeline", label: "Pipeline", icon: TrendingUp, value: 0.72, interpretation: "Growing — 3 deals stalling past stage 3", connected: "collections" },
  { id: "support", label: "Support", icon: Headphones, value: 0.58, interpretation: "Moderate — 2 escalations pending review" },
  { id: "collections", label: "Collections", icon: Receipt, value: 0.68, interpretation: "Elevated — 4 invoices past expected timing", connected: "pipeline" },
  { id: "operations", label: "Operations", icon: Settings, value: 0.35, interpretation: "Low — execution flowing well" },
  { id: "schedule", label: "Schedule", icon: Calendar, value: 0.42, interpretation: "Normal — 1 gap in tomorrow's coverage" },
];

function getSeverityColor(value: number): string {
  if (value >= 0.7) return "0 72% 55%";
  if (value >= 0.5) return "38 85% 55%";
  return "152 55% 48%";
}

function PressureGauge({ domain, delay }: { domain: PressureDomain; delay: number }) {
  const sevColor = getSeverityColor(domain.value);
  const Icon = domain.icon;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashLen = domain.value * circumference * 0.75; // 270deg arc

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/40 border border-border/30 hover:border-border/50 transition-colors"
    >
      <div className="relative w-[72px] h-[72px]">
        <svg viewBox="0 0 80 80" className="w-full h-full" style={{ transform: "rotate(135deg)" }}>
          <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="5" className="stroke-muted/15"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          <motion.circle
            cx="40" cy="40" r={radius} fill="none" strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            initial={{ strokeDashoffset: dashLen }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
            style={{ stroke: `hsl(${sevColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={14} className="text-foreground/50 mb-0.5" />
          <span className="text-sm font-bold font-mono text-foreground/80">
            {Math.round(domain.value * 100)}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">{domain.label}</span>
      <p className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2 max-w-[120px]">
        {domain.interpretation}
      </p>
    </motion.div>
  );
}

export function PressurePulseLayer() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl p-5 border border-border/20"
      style={{ background: "hsl(var(--card) / 0.5)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-foreground/40">Pressure & Pulse</span>
        <span className="text-[9px] text-muted-foreground ml-auto">Live synthesis</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {DEMO_PRESSURES.map((d, i) => (
          <PressureGauge key={d.id} domain={d} delay={0.3 + i * 0.06} />
        ))}
      </div>

      {/* Interconnection summary */}
      <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
        <ArrowRight size={12} className="text-amber-400 shrink-0" />
        <p className="text-[10px] text-amber-400/80">
          <span className="font-semibold">Pipeline pressure</span> + overdue follow-up = <span className="font-semibold">conversion leakage risk</span>. Collections pressure connected to stalled pipeline deals.
        </p>
      </div>
    </motion.div>
  );
}
