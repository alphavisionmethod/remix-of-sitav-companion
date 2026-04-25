// ============================================================
// SITA OS — Boardroom Explainability Panel
// Answerable questions: Why, What, Who, How
// ============================================================

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, ChevronDown, ChevronRight, Brain, Database,
  AlertTriangle, Users, TrendingUp, Shield, XCircle,
} from "lucide-react";

interface Props {
  scope: string;
}

interface ExplainableQuestion {
  id: string;
  question: string;
  icon: typeof HelpCircle;
  answer: string;
  sources: string[];
  confidence: number;
  category: "why" | "what" | "who" | "how";
}

const QUESTIONS: ExplainableQuestion[] = [
  {
    id: "q1", question: "Why was this recommended?", icon: Brain, category: "why",
    answer: "The phased collections approach was recommended because historical data shows 91% recovery rate for segmented outreach versus 76% for immediate full contact. TechCorp's status as a top-5 client ($45K/yr revenue) makes relationship preservation critical. The Revenue and CRM advisors reached consensus after analyzing 4 prior collection cycles.",
    sources: ["Invoice aging report (95% confidence)", "CRM relationship scoring (78%)", "Historical recovery analysis (85%)"],
    confidence: 78,
  },
  {
    id: "q2", question: "Which data points drove this?", icon: Database, category: "what",
    answer: "Three primary data points: (1) Invoice aging showing $18.5K across 3 accounts with TechCorp at 45+ days, (2) Bank balance confirming reserves at $7,200 vs $10,000 target, (3) CRM data showing TechCorp as top-5 client. Secondary signals include prior payment patterns and client interaction frequency.",
    sources: ["QuickBooks invoice data", "Bank connector balance", "CRM engagement metrics", "Payment history analysis"],
    confidence: 85,
  },
  {
    id: "q3", question: "What assumptions were used?", icon: AlertTriangle, category: "what",
    answer: "Key assumptions: (1) TechCorp will respond within 5 business days (70% confidence — based on prior behavior), (2) Sarah Chen follows her typical 14-day payment delay pattern (60% confidence — limited data), (3) Client sentiment has not changed since last interaction 3 weeks ago (40% confidence — stale data).",
    sources: ["Payment pattern analysis", "CRM interaction log (stale)"],
    confidence: 60,
  },
  {
    id: "q4", question: "What is missing?", icon: XCircle, category: "what",
    answer: "Missing data: (1) TechCorp's current cash position — unknown, (2) Sarah Chen's full payment history — only 2 prior invoices available, (3) Impact of outreach timing on client renewal probability — not modeled, (4) Competitor actions that might affect client loyalty.",
    sources: ["Data gap analysis", "Model coverage report"],
    confidence: 50,
  },
  {
    id: "q5", question: "What changed since last review?", icon: TrendingUp, category: "what",
    answer: "Since the last session: (1) TechCorp invoice aged from 30 to 45+ days — now flagged critical, (2) Reserve buffer dropped from 82% to 72% of target, (3) NYC flight prices increased $120, narrowing the approval window. No changes in advisor consensus direction.",
    sources: ["Session diff analysis", "Signal change log"],
    confidence: 90,
  },
  {
    id: "q6", question: "Which advisors agreed or disagreed?", icon: Users, category: "who",
    answer: "Agreement: Revenue (72%), CRM (68%), Obligations (78%), Reserve (65%) all support collections action. Disagreement: Revenue prefers immediate full outreach; CRM prefers phased approach. Resolution: System recommends phased — supported by evidence that relationship preservation yields better long-term recovery.",
    sources: ["Advisor stance log", "Consensus engine output"],
    confidence: 82,
  },
  {
    id: "q7", question: "Why is confidence at this level?", icon: Shield, category: "how",
    answer: "Overall confidence is 72% because: verified data sources contribute strong base (95% + 99%), but inference layer (CRM scoring at 78%) and one assumption (TechCorp response timing at 70%) create uncertainty. The stale client sentiment data (40%) pulls the composite score down. Removing stale data would raise confidence to ~80%.",
    sources: ["Confidence decomposition engine", "Source quality matrix"],
    confidence: 72,
  },
  {
    id: "q8", question: "What would invalidate this recommendation?", icon: AlertTriangle, category: "how",
    answer: "This recommendation would be invalidated if: (1) TechCorp indicates intent to leave — relationship preservation strategy becomes irrelevant, (2) Any account files for bankruptcy — recovery approach must change entirely, (3) Reserves drop below 50% target — may require more aggressive immediate action, (4) New information shows client sentiment is negative.",
    sources: ["Invalidation scenario analysis", "Risk boundary engine"],
    confidence: 75,
  },
];

const categoryColors: Record<string, string> = {
  why: "hsl(280 50% 60%)",
  what: "hsl(200 60% 55%)",
  who: "hsl(38 85% 58%)",
  how: "hsl(152 55% 48%)",
};

const categoryLabels: Record<string, string> = {
  why: "Why",
  what: "What",
  who: "Who",
  how: "How",
};

export function BoardroomExplainability({ scope }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const filtered = activeCategory === "all"
    ? QUESTIONS
    : QUESTIONS.filter(q => q.category === activeCategory);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(240_50%_50%)] to-[hsl(240_50%_30%)] flex items-center justify-center">
          <HelpCircle size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[hsl(0_0%_100%/0.9)]">Explainability Center</p>
          <p className="text-[9px] text-[hsl(0_0%_100%/0.35)]">Ask the room — understand every recommendation</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5">
        {(["all", "why", "what", "who", "how"] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
              activeCategory === cat
                ? "bg-[hsl(280_50%_50%/0.15)] text-[hsl(280_50%_75%)] border border-[hsl(280_50%_50%/0.2)]"
                : "text-[hsl(0_0%_100%/0.35)] hover:text-[hsl(0_0%_100%/0.6)] border border-transparent",
            )}
          >
            {cat === "all" ? "All Questions" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {filtered.map((q, i) => {
          const Icon = q.icon;
          const isOpen = expanded === q.id;
          const catColor = categoryColors[q.category];

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : q.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all",
                  isOpen
                    ? "bg-[hsl(280_40%_50%/0.05)] border-[hsl(280_50%_50%/0.2)]"
                    : "bg-[hsl(0_0%_100%/0.02)] border-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.04)]",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${catColor}15` }}
                  >
                    <Icon size={14} style={{ color: catColor }} />
                  </div>
                  <p className="text-[13px] font-semibold text-[hsl(0_0%_100%/0.85)] flex-1">
                    {q.question}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{ color: catColor, backgroundColor: `${catColor}15` }}
                    >
                      {categoryLabels[q.category]}
                    </span>
                    <span className="text-[9px] text-[hsl(0_0%_100%/0.3)] tabular-nums">{q.confidence}%</span>
                    {isOpen ? <ChevronDown size={14} className="text-[hsl(0_0%_100%/0.3)]" /> : <ChevronRight size={14} className="text-[hsl(0_0%_100%/0.3)]" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pl-11 space-y-3">
                        <p className="text-[12px] text-[hsl(0_0%_100%/0.6)] leading-relaxed">
                          {q.answer}
                        </p>
                        <div className="rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] p-3">
                          <p className="text-[9px] font-bold uppercase text-[hsl(0_0%_100%/0.3)] mb-1.5">Supporting Sources</p>
                          {q.sources.map((s, j) => (
                            <p key={j} className="text-[10px] text-[hsl(280_50%_65%/0.7)] leading-relaxed">• {s}</p>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${q.confidence}%`,
                                backgroundColor: q.confidence >= 80 ? "hsl(var(--trust-safe))" : q.confidence >= 60 ? "hsl(var(--sita-gold))" : "hsl(var(--destructive))",
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-[hsl(0_0%_100%/0.35)]">Answer confidence: {q.confidence}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
