import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, HelpCircle, CheckCircle, Database, Brain, Clock } from "lucide-react";
import { ScenarioComparison, ConfidenceBand } from "@/components/sita/primitives";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onNavigate: (module: string) => void;
}

const SCENARIOS = [
  {
    id: "immediate",
    title: "Immediate Full Outreach",
    description: "Contact all 3 overdue accounts simultaneously with standard collection messaging",
    confidence: 62,
    risk: "medium" as const,
    metrics: [
      { label: "Expected Recovery", value: "$14,200", delta: "+76%", trend: "up" as const },
      { label: "Client Risk", value: "Moderate", delta: "−1 client", trend: "down" as const },
      { label: "Timeline", value: "7-14 days" },
    ],
    pros: ["Fastest cash recovery", "Simple execution", "Clear communication"],
    cons: ["Risk of losing TechCorp ($12.5K client)", "No relationship nuance", "One-size-fits-all tone"],
  },
  {
    id: "phased",
    title: "Phased Recovery (Recommended)",
    description: "Segment by relationship value. Personal outreach for top accounts, standard for others",
    confidence: 78,
    risk: "low" as const,
    metrics: [
      { label: "Expected Recovery", value: "$16,800", delta: "+91%", trend: "up" as const },
      { label: "Client Risk", value: "Low", delta: "0 clients", trend: "up" as const },
      { label: "Timeline", value: "10-21 days" },
    ],
    pros: ["Preserves TechCorp relationship", "Higher total recovery", "Tailored messaging"],
    cons: ["Slower execution", "More coordination required", "Requires CRM context review"],
    recommended: true,
  },
  {
    id: "defer",
    title: "Defer 14 Days",
    description: "Wait for natural payment cycle to complete before any outreach",
    confidence: 35,
    risk: "high" as const,
    metrics: [
      { label: "Expected Recovery", value: "$6,000", delta: "+32%", trend: "down" as const },
      { label: "Client Risk", value: "High", delta: "aging debt", trend: "down" as const },
      { label: "Timeline", value: "14-30 days" },
    ],
    pros: ["Zero effort", "No relationship friction"],
    cons: ["Debt ages further", "Reserve shortfall compounds", "Sends wrong signal"],
  },
];

const CONFIDENCE_POINTS = [
  { label: "Week 1", value: 7200, low: 6800, high: 7600 },
  { label: "Week 2", value: 9400, low: 8200, high: 10800, isProjection: true },
  { label: "Week 3", value: 12100, low: 9800, high: 14200, isProjection: true },
  { label: "Week 4", value: 14800, low: 11000, high: 18500, isProjection: true },
];

const ASSUMPTIONS = [
  { label: "TechCorp responds within 5 business days", type: "assumption" as const, confidence: 70, freshness: "Current" },
  { label: "Invoice #1035 — David Kim — last payment was 47 days late", type: "verified" as const, confidence: 95, freshness: "12 min ago" },
  { label: "Sarah Chen payment pattern: typically 14-day delay", type: "inferred" as const, confidence: 60, freshness: "2 days ago" },
  { label: "Current reserves: $7,200", type: "verified" as const, confidence: 99, freshness: "2 min ago" },
  { label: "Client sentiment data — last interaction 3 weeks ago", type: "stale" as const, confidence: 40, freshness: "3 weeks ago" },
];

const typeConfig = {
  verified: { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", label: "Verified" },
  assumption: { icon: HelpCircle, color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", label: "Assumption" },
  inferred: { icon: Brain, color: "text-[hsl(var(--sita-purple-light))]", bg: "bg-[hsl(var(--sita-purple))]/10", label: "Inferred" },
  stale: { icon: AlertTriangle, color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", label: "Stale Data" },
};

const freshnessColor = (f: string) => {
  if (f.includes("min") || f === "Current") return "text-[hsl(var(--trust-safe))]";
  if (f.includes("hour") || f.includes("day")) return "text-[hsl(var(--sita-gold))]";
  return "text-[hsl(var(--destructive))]";
};

const DOWNSTREAM = [
  { domain: "Finance", effect: "Reserve buffer restored to target within 3 weeks (phased scenario)" },
  { domain: "Business", effect: "CRM health maintained — no client downgrades expected" },
  { domain: "Concierge", effect: "No downstream impact on household or travel prep" },
];

export function BoardroomSimulationView({ scope, onNavigate }: Props) {
  return (
    <div className="p-6 space-y-6">
      {/* Scenario Comparison */}
      <ScenarioComparison
        title="Collections Recovery — Scenario Analysis"
        scenarios={SCENARIOS}
        selectedId="phased"
      />

      {/* Confidence Band */}
      <ConfidenceBand
        title="Projected Cash Recovery (Phased)"
        subtitle="4-week forecast with uncertainty bands"
        points={CONFIDENCE_POINTS}
        unit="$"
        confidenceLevel={78}
      />

      {/* Downstream Effects */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Downstream Effects
        </p>
        <div className="space-y-2">
          {DOWNSTREAM.map((d, i) => (
            <motion.div
              key={d.domain}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-start gap-3"
            >
              <span className="text-[10px] font-bold text-[hsl(280_50%_65%)] uppercase shrink-0 w-16">{d.domain}</span>
              <p className="text-[12px] text-[hsl(0_0%_100%/0.6)]">{d.effect}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assumptions with Freshness */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Assumptions & Evidence Quality
        </p>
        <div className="space-y-1.5">
          {ASSUMPTIONS.map((a, i) => {
            const cfg = typeConfig[a.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="rounded-lg border border-[hsl(0_0%_100%/0.05)] bg-[hsl(0_0%_100%/0.02)] p-3 flex items-center gap-3"
              >
                <div className={cn("flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold", cfg.bg, cfg.color)}>
                  <Icon size={10} />
                  {cfg.label}
                </div>
                <p className="text-[12px] text-[hsl(0_0%_100%/0.6)] flex-1">{a.label}</p>
                <span className={cn("text-[9px] shrink-0 flex items-center gap-1 font-medium", freshnessColor(a.freshness))}>
                  <Clock size={9} /> {a.freshness}
                </span>
                <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] tabular-nums shrink-0">{a.confidence}%</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
