import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, HelpCircle, CheckCircle, Database, Brain, Clock, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { ScenarioComparison, ConfidenceBand } from "@/platform/sita/components/sita/primitives";

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

const TIMELINE_WEEKS = [
  { week: "Week 1", events: ["Initial outreach sent", "TechCorp personal call"], recovery: "$2,400", confidence: 85 },
  { week: "Week 2", events: ["Follow-up reminders", "David Kim response expected"], recovery: "$8,200", confidence: 72 },
  { week: "Week 3", events: ["Escalation if no response", "Sarah Chen follow-up"], recovery: "$14,100", confidence: 60 },
  { week: "Week 4", events: ["Final recovery window", "Reserve buffer target met"], recovery: "$16,800", confidence: 52 },
];

// Simulation Contract data
const SIMULATION_CONTRACT = {
  computed: ["Current reserve balance ($7,200)", "Invoice aging days", "Recovery rate from historical data"],
  estimated: ["Client response timing", "Recovery probability by scenario", "Downstream reserve impact"],
  assumptionHeavy: ["Client sentiment (stale data)", "Competitive pressure on pricing"],
  blockedByMissing: ["Real-time CRM sentiment score", "TechCorp internal payment cycle data"],
};

const NOT_MODELED = [
  "External market conditions affecting client cash flow",
  "Potential new invoices arriving during recovery period",
  "Client internal budget cycle changes",
  "Impact of concurrent outreach from other vendors",
];

function RiskThermometer({ selectedScenario }: { selectedScenario: string }) {
  const riskLevel = selectedScenario === "immediate" ? 55 : selectedScenario === "phased" ? 25 : 80;
  const riskColor = riskLevel > 60 ? "hsl(0 80% 55%)" : riskLevel > 40 ? "hsl(40 90% 55%)" : "hsl(145 60% 50%)";

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.35)]">Risk Level</p>
      <div className="relative w-6 h-32 rounded-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ backgroundColor: riskColor }}
          initial={{ height: "0%" }}
          animate={{ height: `${riskLevel}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-[9px] font-bold text-[hsl(0_0%_100%/0.9)] tabular-nums">{riskLevel}%</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[8px] text-[hsl(0_0%_100%/0.25)]">HIGH</span>
        <div className="w-px h-16 bg-[hsl(0_0%_100%/0.06)]" />
        <span className="text-[8px] text-[hsl(0_0%_100%/0.25)]">LOW</span>
      </div>
    </div>
  );
}

// Simulation Contract Panel
function SimulationContractPanel() {
  const [expanded, setExpanded] = useState(false);

  const categories = [
    { key: "computed", label: "Computed", icon: Database, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", items: SIMULATION_CONTRACT.computed, desc: "Deterministic — calculated from verified data" },
    { key: "estimated", label: "Estimated", icon: Brain, color: "text-[hsl(280_50%_65%)]", bg: "bg-[hsl(280_50%_50%/0.1)]", items: SIMULATION_CONTRACT.estimated, desc: "Modeled from patterns and historical trends" },
    { key: "assumption", label: "Assumption-Heavy", icon: HelpCircle, color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", items: SIMULATION_CONTRACT.assumptionHeavy, desc: "Based on assumptions that may not hold" },
    { key: "blocked", label: "Blocked by Missing Data", icon: ShieldAlert, color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", items: SIMULATION_CONTRACT.blockedByMissing, desc: "Cannot compute — data source unavailable" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.03)] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-[hsl(280_50%_65%)]" />
          <span className="text-[11px] font-bold text-[hsl(0_0%_100%/0.85)]">Simulation Contract</span>
          <span className="text-[8px] text-[hsl(0_0%_100%/0.3)] ml-1">Anti-Hallucination Integrity</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[9px] font-semibold text-[hsl(280_50%_65%/0.6)] hover:text-[hsl(280_50%_75%)] transition-colors flex items-center gap-1"
        >
          {expanded ? <EyeOff size={10} /> : <Eye size={10} />}
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Summary dots */}
      <div className="flex items-center gap-3 mb-3">
        {categories.map(cat => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <span className={cn("w-2.5 h-2.5 rounded-full", cat.bg)} />
            <span className={cn("text-[9px] font-medium", cat.color)}>
              {cat.items.length} {cat.label.toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {categories.map(cat => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.key} className="rounded-lg border border-[hsl(0_0%_100%/0.05)] bg-[hsl(0_0%_100%/0.02)] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CatIcon size={12} className={cat.color} />
                    <span className={cn("text-[10px] font-bold", cat.color)}>{cat.label}</span>
                    <span className="text-[8px] text-[hsl(0_0%_100%/0.25)]">— {cat.desc}</span>
                  </div>
                  {cat.items.map((item, j) => (
                    <p key={j} className="text-[10px] text-[hsl(0_0%_100%/0.5)] leading-relaxed pl-5">• {item}</p>
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BoardroomSimulationView({ scope, onNavigate }: Props) {
  const [selectedScenario, setSelectedScenario] = useState("phased");
  const [showNotModeled, setShowNotModeled] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Simulation Contract */}
      <SimulationContractPanel />

      {/* What Happens Next Timeline */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-4">
          What Happens Next — Projected Timeline
        </p>
        <div className="flex gap-2">
          {TIMELINE_WEEKS.map((week, i) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex-1 relative"
            >
              {i < TIMELINE_WEEKS.length - 1 && (
                <motion.div
                  className="absolute top-4 right-0 w-full h-px bg-[hsl(280_50%_50%/0.2)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  style={{ transformOrigin: "left" }}
                />
              )}
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: `hsl(280, ${50 - i * 5}%, ${55 + i * 5}%)` }}
                    animate={i === 0 ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-bold text-[hsl(0_0%_100%/0.6)]">{week.week}</span>
                </div>
                {week.events.map((e, j) => (
                  <p key={j} className="text-[10px] text-[hsl(0_0%_100%/0.4)] leading-relaxed">• {e}</p>
                ))}
                <div className="mt-2 pt-2 border-t border-[hsl(0_0%_100%/0.05)]">
                  <p className="text-[11px] font-bold text-[hsl(var(--trust-safe))] tabular-nums">{week.recovery}</p>
                  <p className="text-[8px] text-[hsl(0_0%_100%/0.25)]">{week.confidence}% confidence</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scenario Comparison + Risk Thermometer */}
      <div className="flex gap-4">
        <div className="flex-1">
          <ScenarioComparison
            title="Collections Recovery — Scenario Analysis"
            scenarios={SCENARIOS}
            selectedId={selectedScenario}
          />
        </div>
        <RiskThermometer selectedScenario={selectedScenario} />
      </div>

      {/* Confidence Band */}
      <ConfidenceBand
        title="Projected Cash Recovery (Phased)"
        subtitle="4-week forecast with uncertainty bands"
        points={CONFIDENCE_POINTS}
        unit="$"
        confidenceLevel={78}
      />

      {/* What Is Not Modeled */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[hsl(var(--destructive))]/15 bg-[hsl(var(--destructive))]/3 p-4"
      >
        <button
          onClick={() => setShowNotModeled(!showNotModeled)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-[hsl(var(--destructive))]" />
            <span className="text-[11px] font-bold text-[hsl(var(--destructive))]">What Is Not Modeled</span>
            <span className="text-[9px] text-[hsl(0_0%_100%/0.3)]">{NOT_MODELED.length} exclusions</span>
          </div>
          <span className="text-[9px] text-[hsl(0_0%_100%/0.3)]">{showNotModeled ? "▲" : "▼"}</span>
        </button>
        <AnimatePresence>
          {showNotModeled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-1.5 overflow-hidden"
            >
              {NOT_MODELED.map((item, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-[11px] text-[hsl(0_0%_100%/0.5)] pl-5 leading-relaxed"
                >
                  • {item}
                </motion.p>
              ))}
              <p className="text-[9px] text-[hsl(var(--destructive))]/60 mt-2 italic pl-5">
                These factors are outside the simulation boundary and could affect actual outcomes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-start gap-3 relative overflow-hidden group"
            >
              <motion.div
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[hsl(280_50%_50%/0.2)] opacity-0 group-hover:opacity-100 pointer-events-none"
                animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] font-bold text-[hsl(280_50%_65%)] uppercase shrink-0 w-16 relative z-10">{d.domain}</span>
              <p className="text-[12px] text-[hsl(0_0%_100%/0.6)] relative z-10">{d.effect}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assumptions & Evidence Quality */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Assumptions & Evidence Quality
        </p>
        <div className="flex items-center gap-1.5 mb-3 px-1">
          {ASSUMPTIONS.map((a, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  a.type === "verified" ? "hsl(var(--trust-safe))"
                  : a.type === "assumption" ? "hsl(var(--sita-gold))"
                  : a.type === "inferred" ? "hsl(var(--sita-purple-light))"
                  : "hsl(var(--destructive))",
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08 }}
              title={`${a.label} (${a.confidence}%)`}
            />
          ))}
          <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] ml-2">
            {ASSUMPTIONS.filter(a => a.type === "verified").length}/{ASSUMPTIONS.length} verified
          </span>
        </div>
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
