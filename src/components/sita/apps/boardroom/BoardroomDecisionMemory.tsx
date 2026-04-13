import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Hash, CheckCircle, AlertTriangle, Minus, TrendingUp, Award } from "lucide-react";
import { AnimatedProgressRing } from "@/components/sita/AnimatedProgressRing";

interface Decision {
  id: string;
  title: string;
  date: string;
  outcome: "positive" | "neutral" | "negative";
  receiptHash: string;
  recommendation: string;
  advisorPositions: string[];
  actualOutcome: string;
  outcomeScore: number; // 0-100 how well it matched prediction
}

const DECISIONS: Decision[] = [
  {
    id: "dec1", title: "Approved phased collections for Q1 receivables",
    date: "Mar 15, 2026", outcome: "positive", receiptHash: "0x4a2c…f8d1",
    recommendation: "Phased outreach to 4 overdue accounts segmented by relationship value",
    advisorPositions: ["Revenue: Immediate outreach preferred", "CRM: Phased approach for top clients"],
    actualOutcome: "Recovered $22,400 (94%) within 18 days. No client relationships damaged.",
    outcomeScore: 94,
  },
  {
    id: "dec2", title: "Deferred subscription audit by 2 weeks",
    date: "Mar 8, 2026", outcome: "neutral", receiptHash: "0x9e7b…a3c5",
    recommendation: "Review all subscriptions for redundancy and cost-saving",
    advisorPositions: ["Obligations: Immediate review needed", "Reserve: Can wait if no emergency"],
    actualOutcome: "Audit completed Mar 22. Found $127/mo in savings. No material impact from delay.",
    outcomeScore: 65,
  },
  {
    id: "dec3", title: "Rejected aggressive lead recovery campaign",
    date: "Feb 28, 2026", outcome: "positive", receiptHash: "0x1d5f…b2e8",
    recommendation: "Launch 3-email drip to 50 cold leads",
    advisorPositions: ["Growth: High volume approach", "CRM: Quality over quantity — only warm leads"],
    actualOutcome: "Chose targeted warm approach instead. 3 conversions from 12 contacts. Better ROI than projected mass approach.",
    outcomeScore: 88,
  },
  {
    id: "dec4", title: "Approved emergency reserve draw — $1,200",
    date: "Feb 20, 2026", outcome: "negative", receiptHash: "0x6c8a…d4f7",
    recommendation: "Emergency payment for tax advisor — unexpected filing complexity",
    advisorPositions: ["Reserve: Approve — within emergency threshold", "Obligations: Flag — reserve below 60% after draw"],
    actualOutcome: "Payment resolved issue but reserves dropped to $5,800. Took 6 weeks to recover buffer.",
    outcomeScore: 35,
  },
  {
    id: "dec5", title: "Approved travel package — London client visit",
    date: "Feb 10, 2026", outcome: "positive", receiptHash: "0x3f9e…c1b4",
    recommendation: "Full logistics package for 3-day London client engagement",
    advisorPositions: ["Travel: All systems green", "Revenue: High ROI potential — £45K deal"],
    actualOutcome: "Deal closed at £48K. Client upgraded to annual retainer. Travel investment fully justified.",
    outcomeScore: 96,
  },
];

const outcomeConfig = {
  positive: { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", label: "Positive", ringColor: "hsl(var(--trust-safe))" },
  neutral: { icon: Minus, color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", label: "Neutral", ringColor: "hsl(var(--sita-gold))" },
  negative: { icon: AlertTriangle, color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", label: "Negative", ringColor: "hsl(var(--destructive))" },
};

// Pattern detection stats
const positiveCount = DECISIONS.filter(d => d.outcome === "positive").length;
const totalCount = DECISIONS.length;
const avgScore = Math.round(DECISIONS.reduce((a, d) => a + d.outcomeScore, 0) / totalCount);

// Advisor accuracy mock
const ADVISOR_ACCURACY = [
  { name: "CRM Advisor", accuracy: 92, decisions: 4, emoji: "🤝" },
  { name: "Travel Advisor", accuracy: 96, decisions: 2, emoji: "✈️" },
  { name: "Revenue Advisor", accuracy: 78, decisions: 3, emoji: "📈" },
  { name: "Reserve Advisor", accuracy: 60, decisions: 3, emoji: "🏦" },
];

export function BoardroomDecisionMemory() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Pattern Detection Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.03)] p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[hsl(280_50%_50%/0.05)] blur-3xl pointer-events-none" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[hsl(280_50%_65%/0.5)] mb-3 flex items-center gap-1.5">
          <TrendingUp size={11} /> Decision Pattern Analysis
        </p>
        <div className="flex items-start gap-6 relative z-10">
          <AnimatedProgressRing
            value={positiveCount}
            max={totalCount}
            size={64}
            strokeWidth={5}
            label="Positive Rate"
            color="hsl(var(--trust-safe))"
          />
          <div className="flex-1">
            <p className="text-[13px] text-[hsl(0_0%_100%/0.7)] leading-relaxed" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Your decisions have been <span className="font-bold text-[hsl(var(--trust-safe))]">{Math.round(positiveCount / totalCount * 100)}% positive</span> this quarter.
              Average outcome alignment is <span className="font-bold text-[hsl(0_0%_100%/0.9)]">{avgScore}%</span>.
              {positiveCount >= 3 && " Strong decision-making pattern detected."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Advisor Accuracy Leaderboard */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3 flex items-center gap-1.5">
          <Award size={11} /> Advisor Accuracy Tracker
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ADVISOR_ACCURACY.sort((a, b) => b.accuracy - a.accuracy).map((adv, i) => (
            <motion.div
              key={adv.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 flex items-center gap-3",
                i === 0 && "border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5",
              )}
            >
              {i === 0 && <span className="text-[9px]">🏆</span>}
              <span className="text-base">{adv.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.7)] truncate">{adv.name}</p>
                <p className="text-[9px] text-[hsl(0_0%_100%/0.3)]">{adv.decisions} decisions</p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-bold tabular-nums",
                  adv.accuracy >= 80 ? "text-[hsl(var(--trust-safe))]" : adv.accuracy >= 60 ? "text-[hsl(var(--sita-gold))]" : "text-[hsl(var(--destructive))]",
                )}>
                  {adv.accuracy}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decision Archive Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)]">
          Decision Archive
        </p>
        <span className="text-[10px] text-[hsl(0_0%_100%/0.3)]">{DECISIONS.length} decisions recorded</span>
      </div>

      {/* Timeline with Outcome Arcs */}
      <div className="space-y-0">
        {DECISIONS.map((dec, i) => {
          const cfg = outcomeConfig[dec.outcome];
          const Icon = cfg.icon;
          const isOpen = expanded === dec.id;
          const isLast = i === DECISIONS.length - 1;

          return (
            <motion.div
              key={dec.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4"
            >
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", cfg.bg)}>
                  <Icon size={14} className={cfg.color} />
                </div>
                {!isLast && <div className="w-px flex-1 min-h-[16px] bg-[hsl(0_0%_100%/0.06)]" />}
              </div>

              {/* Content */}
              <div className={cn("flex-1 min-w-0 pb-4", isLast && "pb-0")}>
                <button
                  onClick={() => setExpanded(isOpen ? null : dec.id)}
                  className="w-full text-left rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 hover:bg-[hsl(0_0%_100%/0.04)] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[hsl(0_0%_100%/0.85)]">{dec.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[hsl(0_0%_100%/0.35)]">{dec.date}</span>
                        <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>
                          {cfg.label}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] text-[hsl(0_0%_100%/0.25)] font-mono">
                          <Hash size={9} /> {dec.receiptHash}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Outcome score arc */}
                      <AnimatedProgressRing
                        value={dec.outcomeScore}
                        size={36}
                        strokeWidth={3}
                        color={cfg.ringColor}
                      />
                      {isOpen ? <ChevronDown size={14} className="text-[hsl(0_0%_100%/0.3)]" /> : <ChevronRight size={14} className="text-[hsl(0_0%_100%/0.3)]" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3 overflow-hidden"
                      >
                        <div className="rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] p-3">
                          <p className="text-[9px] font-semibold uppercase text-[hsl(0_0%_100%/0.35)] mb-1">Original Recommendation</p>
                          <p className="text-[12px] text-[hsl(0_0%_100%/0.6)]">{dec.recommendation}</p>
                        </div>
                        <div className="rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] p-3">
                          <p className="text-[9px] font-semibold uppercase text-[hsl(0_0%_100%/0.35)] mb-1">Advisor Positions at Decision Time</p>
                          {dec.advisorPositions.map((pos) => (
                            <p key={pos} className="text-[11px] text-[hsl(0_0%_100%/0.5)] leading-relaxed">• {pos}</p>
                          ))}
                        </div>
                        <div className={cn("rounded-lg border p-3", cfg.bg, `border-${cfg.color}/20`)}>
                          <p className="text-[9px] font-semibold uppercase text-[hsl(0_0%_100%/0.35)] mb-1">Actual Outcome</p>
                          <p className="text-[12px] text-[hsl(0_0%_100%/0.7)]">{dec.actualOutcome}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
