// ═══════════════════════════════════════════════════════════════
// SITA OS — Time Machine
// Immersive timeline with past decisions & future projections
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Clock, Rewind, FastForward, GitBranch, CheckCircle2,
  AlertCircle, Sparkles, ArrowRight, ChevronDown, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/sita/PageShell";

// ─── Demo Data ───
const PAST_DECISIONS = [
  {
    id: "d1", date: "2025-12-15", title: "Raised prices 20%",
    outcome: "positive", impact: "+$45K ARR, 2% churn increase",
    domain: "business", confidence: 89,
  },
  {
    id: "d2", date: "2026-01-08", title: "Hired marketing lead",
    outcome: "positive", impact: "3x lead volume in 60 days",
    domain: "business", confidence: 92,
  },
  {
    id: "d3", date: "2026-02-20", title: "Moved 40% to bonds",
    outcome: "neutral", impact: "Missed 8% equity rally, preserved capital",
    domain: "money", confidence: 74,
  },
  {
    id: "d4", date: "2026-03-10", title: "Launched new service tier",
    outcome: "positive", impact: "+12 enterprise clients",
    domain: "business", confidence: 85,
  },
  {
    id: "d5", date: "2026-04-01", title: "Cut SaaS subscriptions",
    outcome: "positive", impact: "Saved $2,400/mo",
    domain: "concierge", confidence: 95,
  },
];

const FUTURE_SCENARIOS = {
  best: { label: "Best Case", netWorth: "$1.85M", revenue: "$62K/mo", color: "hsl(var(--trust-safe))" },
  likely: { label: "Most Likely", netWorth: "$1.52M", revenue: "$48K/mo", color: "hsl(var(--sita-purple))" },
  worst: { label: "Worst Case", netWorth: "$1.18M", revenue: "$31K/mo", color: "hsl(var(--destructive))" },
};

const outcomeColors = {
  positive: "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe)/0.1)]",
  neutral: "text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold)/0.1)]",
  negative: "text-destructive bg-destructive/10",
};

const outcomeIcons = {
  positive: CheckCircle2,
  neutral: AlertCircle,
  negative: AlertCircle,
};

function TimelineNode({ decision, index, isSelected, onSelect }: {
  decision: typeof PAST_DECISIONS[0];
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = outcomeIcons[decision.outcome as keyof typeof outcomeIcons];

  return (
    <PageShell>
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12 }}
      className="relative flex items-start gap-4 group cursor-pointer"
      onClick={onSelect}
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <motion.div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
            isSelected
              ? "border-[hsl(var(--sita-purple))] bg-[hsl(var(--sita-purple)/0.15)] shadow-[0_0_20px_hsl(var(--sita-purple)/0.3)]"
              : "border-border bg-card hover:border-[hsl(var(--sita-purple)/0.4)]"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className={cn("h-4 w-4", outcomeColors[decision.outcome as keyof typeof outcomeColors].split(" ")[0])} />
        </motion.div>
        {index < PAST_DECISIONS.length - 1 && (
          <div className="w-px h-16 bg-gradient-to-b from-border to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <span className="text-[10px] text-muted-foreground font-mono">{decision.date}</span>
        <h4 className="text-sm font-semibold text-foreground mt-0.5">{decision.title}</h4>
        <div className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1", outcomeColors[decision.outcome as keyof typeof outcomeColors])}>
          {decision.impact}
        </div>

        {/* Expanded detail on select */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 rounded-xl bg-card/60 backdrop-blur border border-border/40 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Confidence:</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[hsl(var(--sita-purple))]"
                      initial={{ width: 0 }}
                      animate={{ width: `${decision.confidence}%` }}
                      transition={{ delay: 0.2 }}
                    />
                  </div>
                  <span className="font-mono text-foreground">{decision.confidence}%</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                  <GitBranch className="h-3 w-3" />
                  What if I chose differently?
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </PageShell>
  );
}

function FutureProjectionCone() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <FastForward className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
        6-Month Projection
      </h3>

      {/* Visual cone */}
      <div className="relative h-40 mb-4">
        <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
          {/* Cone shape */}
          <defs>
            <linearGradient id="cone-best" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--trust-safe))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--trust-safe))" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="cone-worst" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Cone fill */}
          <motion.path
            d="M10,60 Q75,55 150,30 Q225,10 290,5 L290,115 Q225,110 150,90 Q75,65 10,60 Z"
            fill="url(#cone-best)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          />

          {/* Best line */}
          <motion.path
            d="M10,60 Q75,55 150,30 Q225,10 290,5"
            fill="none"
            stroke="hsl(var(--trust-safe))"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          />

          {/* Likely line */}
          <motion.path
            d="M10,60 Q75,58 150,55 Q225,52 290,48"
            fill="none"
            stroke="hsl(var(--sita-purple))"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          />

          {/* Worst line */}
          <motion.path
            d="M10,60 Q75,65 150,90 Q225,110 290,115"
            fill="none"
            stroke="hsl(var(--destructive))"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1, duration: 1 }}
          />

          {/* Now marker */}
          <circle cx="10" cy="60" r="4" fill="hsl(var(--foreground))" />
          <text x="14" y="75" fontSize="8" fill="hsl(var(--muted-foreground))">Now</text>
        </svg>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(FUTURE_SCENARIOS).map(([key, scenario], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
            className="text-center p-3 rounded-xl bg-muted/30"
          >
            <div className="h-1 w-8 mx-auto rounded-full mb-2" style={{ background: scenario.color }} />
            <p className="text-[10px] text-muted-foreground">{scenario.label}</p>
            <p className="text-sm font-semibold font-mono text-foreground">{scenario.netWorth}</p>
            <p className="text-[10px] text-muted-foreground">{scenario.revenue}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function TimeMachinePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"past" | "future">("past");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: "hsl(var(--sita-purple) / 0.04)" }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--sita-purple))] to-[hsl(var(--sita-gold))] flex items-center justify-center">
              <Clock className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Time Machine</h1>
              <p className="text-xs text-muted-foreground">Replay decisions. Project your future.</p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 mt-4 bg-muted/30 rounded-xl p-1 w-fit">
            {(["past", "future"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                  view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v === "past" ? (
                  <span className="flex items-center gap-1"><Rewind className="h-3 w-3" /> Past Decisions</span>
                ) : (
                  <span className="flex items-center gap-1"><FastForward className="h-3 w-3" /> Future Projections</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === "past" ? (
            <motion.div key="past" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {PAST_DECISIONS.map((d, i) => (
                <TimelineNode
                  key={d.id}
                  decision={d}
                  index={i}
                  isSelected={selectedId === d.id}
                  onSelect={() => setSelectedId(selectedId === d.id ? null : d.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="future" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <FutureProjectionCone />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
