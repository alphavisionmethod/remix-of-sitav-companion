import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ChevronRight, ChevronDown, Eye, BarChart3, Shield, AlertTriangle,
  Lightbulb, Target, Clock, RefreshCw, HelpCircle, MessageSquare, ArrowRight,
  Zap, X, Check, Minus, TrendingUp, TrendingDown, Globe, FileText, Send
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import type { InvestmentAdvisor, AdvisorConfidenceLevel, AdvisorRecommendation } from "@/lib/investment-office/types";
import { ADVISOR_SYNTHESIS, INVESTMENT_ADVISORS } from "@/hooks/useInvestmentOfficeData";
import { ASK_ADVISOR_QUESTIONS, ASK_BOARD_QUESTIONS } from "@/lib/investment-office/mock-data";
import { useInvestmentDecisions } from "@/hooks/use-investment-office";
import { useDataMode } from "@/contexts/DataModeContext";

type ViewMode = "council" | "synthesis" | "debate" | "compare" | "ask-board";

const CONFIDENCE_COLORS: Record<AdvisorConfidenceLevel, string> = {
  "high": "text-[hsl(var(--trust-safe))]",
  "moderate": "text-[hsl(var(--trust-warn))]",
  "low": "text-destructive",
  "insufficient-signal": "text-muted-foreground",
};
const CONFIDENCE_BG: Record<AdvisorConfidenceLevel, string> = {
  "high": "bg-[hsl(var(--trust-safe))]/10",
  "moderate": "bg-[hsl(var(--trust-warn))]/10",
  "low": "bg-destructive/10",
  "insufficient-signal": "bg-secondary",
};
const REC_LABELS: Partial<Record<AdvisorRecommendation, string>> = {
  "observe": "Observe", "research-more": "Research More", "wait": "Wait",
  "watch-catalyst": "Watch Catalyst", "size-small": "Size Small", "reduce": "Reduce",
  "hedge": "Hedge", "avoid": "Avoid", "high-uncertainty": "High Uncertainty",
  "proceed-carefully": "Proceed Carefully", "execute-now": "Execute Now",
};

function ConfidenceBadge({ level }: { level: AdvisorConfidenceLevel }) {
  const pulseClass = level === "high" ? "animate-pulse-safe" : level === "moderate" ? "animate-pulse-warn" : level === "low" ? "animate-pulse-danger" : "";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${CONFIDENCE_BG[level]} ${CONFIDENCE_COLORS[level]} ${pulseClass}`}>
      {level.replace("-", " ")}
    </span>
  );
}

function RecommendationBadge({ rec }: { rec: AdvisorRecommendation }) {
  const isGreen = rec === "execute-now";
  const isYellow = rec === "watch-catalyst" || rec === "proceed-carefully" || rec === "observe";
  const isRed = rec === "avoid" || rec === "reduce";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold ${
      isGreen ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
      isRed ? "bg-destructive/10 text-destructive" :
      isYellow ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
      "bg-secondary text-muted-foreground"
    }`}>
      {REC_LABELS[rec] || rec}
    </span>
  );
}

function WatchStatusDot({ status }: { status: string }) {
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
      status === "alert" ? "bg-destructive" : status === "changing" ? "bg-[hsl(var(--trust-warn))]" : "bg-[hsl(var(--trust-safe))]"
    }`} />
  );
}

// ── Advisor Detail Panel (with Ask + Memo tabs) ──
function AdvisorDetailPanel({ advisor, onClose }: { advisor: InvestmentAdvisor; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "watches" | "horizons" | "history" | "beginner" | "ask" | "memo">("overview");
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const getQuestionResponse = (field: string): string | string[] => {
    switch (field) {
      case "currentInsight": return advisor.currentInsight;
      case "keyUncertainty": return advisor.keyUncertainty;
      case "beginnerExplanation": return advisor.beginnerExplanation;
      case "whatWouldChangeMind": return advisor.whatWouldChangeMind;
      case "portfolioAwareness": return advisor.portfolioAwareness;
      case "advancedAnalysis": return advisor.advancedAnalysis;
      default: return "";
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="fixed inset-y-0 right-0 w-full max-w-xl bg-card border-l border-border z-50 overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-4 flex items-center gap-3 z-10">
        <span className="text-2xl">{advisor.icon}</span>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">{advisor.name} — {advisor.title}</h2>
          <p className="text-[10px] text-muted-foreground">{advisor.mission}</p>
        </div>
        <button onClick={onClose} className="rounded-lg bg-secondary p-1.5 hover:bg-secondary/80 transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-1 flex-wrap">
        {(["overview", "watches", "horizons", "history", "beginner", "ask", "memo"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-medium capitalize transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{t === "ask" ? "Ask" : t === "memo" ? "Memo" : t}</button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {tab === "overview" && (
          <>
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 space-y-2">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Current Insight</p>
              <p className="text-sm text-foreground leading-relaxed">{advisor.currentInsight}</p>
              <div className="flex items-center gap-2 pt-1">
                <ConfidenceBadge level={advisor.confidenceLevel} />
                <RecommendationBadge rec={advisor.currentRecommendation} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Why This Matters</p>
              <p className="text-xs text-foreground leading-relaxed">{advisor.whyItCares}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><RefreshCw className="h-3 w-3" /> What Changed</p>
              {advisor.whatChanged.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                  <Zap className="h-3 w-3 text-accent shrink-0 mt-0.5" /><span>{c}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-3 space-y-1">
              <p className="text-[9px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider">Key Uncertainty</p>
              <p className="text-xs text-foreground">{advisor.keyUncertainty}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">What Would Change My Mind</p>
              {advisor.whatWouldChangeMind.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                  <AlertTriangle className="h-3 w-3 text-[hsl(var(--trust-warn))] shrink-0 mt-0.5" /><span>{w}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">What I Refuse to Conclude</p>
              {advisor.refusesToConclude.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground italic">
                  <Minus className="h-3 w-3 shrink-0 mt-0.5" /><span>{r}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Data Sources</p>
              <div className="flex flex-wrap gap-1">
                {advisor.dataSources.map(s => (
                  <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <p className="text-[9px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1"><Target className="h-3 w-3" /> Portfolio Awareness</p>
              <p className="text-xs text-foreground leading-relaxed">{advisor.portfolioAwareness}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Advanced Analysis</p>
              <p className="text-[11px] text-foreground leading-relaxed">{advisor.advancedAnalysis}</p>
            </div>
          </>
        )}

        {tab === "watches" && (
          <div className="space-y-2">
            {advisor.watches.map((w, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <WatchStatusDot status={w.status} />
                  <p className="text-xs font-semibold text-foreground">{w.label}</p>
                  <span className={`text-[8px] font-medium uppercase tracking-wider rounded-full px-1.5 py-0.5 ${
                    w.status === "alert" ? "bg-destructive/10 text-destructive" :
                    w.status === "changing" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
                    "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]"
                  }`}>{w.status}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{w.detail}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "horizons" && (
          <div className="space-y-3">
            {advisor.viewsByHorizon.map((v, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-foreground capitalize">{v.horizon.replace("-", " ")}</p>
                  <ConfidenceBadge level={v.confidence} />
                </div>
                <p className="text-xs text-foreground leading-relaxed">{v.view}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prior Views & Memory</p>
            {advisor.priorViews.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No prior views recorded yet</p>}
            {advisor.priorViews.map((pv, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{pv.date}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${pv.resolved ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" : "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"}`}>
                    {pv.resolved ? "Resolved" : "Open"}
                  </span>
                </div>
                <p className="text-xs text-foreground">{pv.view}</p>
                {pv.outcome && <p className="text-[10px] text-muted-foreground italic">Outcome: {pv.outcome}</p>}
              </div>
            ))}
            <div className="pt-2 space-y-1.5">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Invalidation Events</p>
              {advisor.invalidationEvents.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
                  <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" /><span>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "beginner" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 space-y-2">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">In Plain Language</p>
              <p className="text-sm text-foreground leading-relaxed">{advisor.beginnerExplanation}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">My Reasoning Style</p>
              <p className="text-xs text-foreground">{advisor.reasoningStyle}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Risk Sensitivity</p>
              <p className="text-xs text-foreground capitalize">{advisor.riskSensitivity} — I tend to be {advisor.riskSensitivity === "conservative" ? "cautious and protective" : advisor.riskSensitivity === "aggressive" ? "open to higher-risk opportunities" : "balanced between opportunity and protection"}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Time Focus</p>
              <p className="text-xs text-foreground capitalize">{advisor.timeHorizonFocus.replace("-", " ")} — I primarily think about what matters in the {advisor.timeHorizonFocus === "near-term" ? "next days to weeks" : advisor.timeHorizonFocus === "medium-term" ? "next weeks to months" : "next months to years"}</p>
            </div>
          </div>
        )}

        {/* ASK TAB — Interactive Q&A */}
        {tab === "ask" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1"><Send className="h-3 w-3" /> Ask {advisor.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Click a question to get {advisor.name}'s response from their current analysis.</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {ASK_ADVISOR_QUESTIONS.map(q => (
                <button key={q.id} onClick={() => setActiveQuestion(activeQuestion === q.id ? null : q.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    activeQuestion === q.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{q.icon}</span>
                    <span className="text-xs font-medium text-foreground">{q.label}</span>
                    <ChevronRight className={`h-3 w-3 text-muted-foreground ml-auto transition-transform ${activeQuestion === q.id ? "rotate-90" : ""}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Response */}
            <AnimatePresence mode="wait">
              {activeQuestion && (
                <motion.div key={activeQuestion} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{advisor.icon}</span>
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{advisor.name} responds</p>
                  </div>
                  {(() => {
                    const q = ASK_ADVISOR_QUESTIONS.find(q => q.id === activeQuestion);
                    if (!q) return null;
                    const response = getQuestionResponse(q.field);
                    if (Array.isArray(response)) {
                      return (
                        <div className="space-y-1.5">
                          {response.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" /><span>{r}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return <p className="text-sm text-foreground leading-relaxed">{response}</p>;
                  })()}
                  <div className="flex items-center gap-2 pt-1">
                    <ConfidenceBadge level={advisor.confidenceLevel} />
                    <span className="text-[9px] text-muted-foreground">Based on current analysis</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* MEMO TAB — Dossier-style intelligence brief */}
        {tab === "memo" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-bold text-foreground">{advisor.name} Intelligence Memo</p>
                <p className="text-[10px] text-muted-foreground">Long-form analysis brief · Updated {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Memo body — flowing document style */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5 prose-sm">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-xs text-foreground leading-relaxed">{advisor.currentInsight}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{advisor.whyItCares}</p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Detailed Analysis</h4>
                <p className="text-xs text-foreground leading-relaxed">{advisor.advancedAnalysis}</p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Portfolio Impact Assessment</h4>
                <p className="text-xs text-foreground leading-relaxed">{advisor.portfolioAwareness}</p>
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Time Horizon Views</h4>
                {advisor.viewsByHorizon.map((v, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-[10px] font-semibold text-primary capitalize">{v.horizon.replace("-", " ")} Outlook</p>
                    <p className="text-xs text-foreground leading-relaxed">{v.view}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Confidence: {v.confidence}</p>
                  </div>
                ))}
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Key Uncertainties & Risks</h4>
                <p className="text-xs text-foreground leading-relaxed mb-2">{advisor.keyUncertainty}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1">Invalidation Events</p>
                {advisor.invalidationEvents.map((e, i) => (
                  <p key={i} className="text-xs text-foreground leading-relaxed">• {e}</p>
                ))}
              </div>

              <hr className="border-border" />

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">What I Refuse to Conclude</h4>
                {advisor.refusesToConclude.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground italic leading-relaxed">• {r}</p>
                ))}
              </div>

              <div className="rounded-xl bg-secondary/30 p-3 mt-4">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Recommendation</p>
                <div className="flex items-center gap-2">
                  <RecommendationBadge rec={advisor.currentRecommendation} />
                  <ConfidenceBadge level={advisor.confidenceLevel} />
                  <span className="text-[10px] text-muted-foreground ml-auto">{advisor.confidence}% confidence</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Synthesis Panel ──
function SynthesisPanel() {
  const s = ADVISOR_SYNTHESIS;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Chief Investment Synthesis</h3>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">{s.overallConfidence}% confidence</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{s.summary}</p>
        <div className="flex gap-2">
          {s.waitingSmarter && <span className="rounded-full bg-[hsl(var(--trust-warn))]/10 px-2.5 py-0.5 text-[9px] font-medium text-[hsl(var(--trust-warn))]">Waiting is Smarter</span>}
          {s.actionJustified && <span className="rounded-full bg-[hsl(var(--trust-safe))]/10 px-2.5 py-0.5 text-[9px] font-medium text-[hsl(var(--trust-safe))]">Action Justified</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] font-semibold text-[hsl(var(--trust-safe))] uppercase tracking-wider flex items-center gap-1"><Check className="h-3 w-3" /> Where Advisors Align</p>
          {s.alignmentAreas.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <Check className="h-3 w-3 text-[hsl(var(--trust-safe))] shrink-0 mt-0.5" /><span>{a}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Strongest Opportunities</p>
          {s.strongestOpportunities.map((o, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <TrendingUp className="h-3 w-3 text-primary shrink-0 mt-0.5" /><span>{o}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Largest Risks</p>
          {s.largestRisks.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" /><span>{r}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3" /> Review Next</p>
          {s.reviewNext.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" /><span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Where Advisors Diverge</p>
        {s.divergenceAreas.map((d, i) => (
          <div key={i} className="rounded-2xl border border-[hsl(var(--trust-warn))]/20 bg-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">{d.topic}</h4>
            <div className="space-y-2">
              {d.positions.map(pos => {
                const adv = INVESTMENT_ADVISORS.find(a => a.id === pos.advisorId);
                return (
                  <div key={pos.advisorId} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{adv?.icon}</span>
                      <span className="text-[11px] font-semibold text-foreground">{adv?.name}</span>
                      <span className="text-[9px] text-muted-foreground">{adv?.title}</span>
                      <span className="ml-auto text-[9px] font-medium text-muted-foreground">{pos.confidence}%</span>
                    </div>
                    <p className="text-xs text-foreground font-medium">{pos.position}</p>
                    <p className="text-[10px] text-muted-foreground">{pos.reasoning}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ask the Board Panel ──
function AskBoardPanel() {
  const s = ADVISOR_SYNTHESIS;
  const [activeQ, setActiveQ] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Ask the Board</h3>
        </div>
        <p className="text-xs text-muted-foreground">Click a question to see what the entire advisor council thinks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ASK_BOARD_QUESTIONS.map(q => (
          <button key={q.id} onClick={() => setActiveQ(activeQ === q.id ? null : q.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              activeQ === q.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"
            }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{q.icon}</span>
              <span className="text-xs font-semibold text-foreground">{q.label}</span>
              <ChevronRight className={`h-3 w-3 text-muted-foreground ml-auto transition-transform ${activeQ === q.id ? "rotate-90" : ""}`} />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeQ && (
          <motion.div key={activeQ} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4">
            {activeQ === "bq1" && (
              <>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Board Summary</p>
                <p className="text-sm text-foreground leading-relaxed">{s.summary}</p>
                <div className="flex gap-2">
                  {s.waitingSmarter && <span className="rounded-full bg-[hsl(var(--trust-warn))]/10 px-2 py-0.5 text-[9px] text-[hsl(var(--trust-warn))]">Waiting is Smarter</span>}
                  {s.actionJustified && <span className="rounded-full bg-[hsl(var(--trust-safe))]/10 px-2 py-0.5 text-[9px] text-[hsl(var(--trust-safe))]">Action Justified</span>}
                </div>
                <div className="space-y-2 pt-2">
                  {INVESTMENT_ADVISORS.slice(0, 5).map(adv => (
                    <div key={adv.id} className="flex items-start gap-2 rounded-xl bg-secondary/20 p-2.5">
                      <span className="text-sm">{adv.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-foreground">{adv.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{adv.currentInsight}</p>
                      </div>
                      <ConfidenceBadge level={adv.confidenceLevel} />
                    </div>
                  ))}
                </div>
              </>
            )}
            {activeQ === "bq2" && (
              <>
                <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase tracking-wider">Top Disagreements</p>
                {s.divergenceAreas.map((d, i) => (
                  <div key={i} className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-secondary/10 p-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground">{d.topic}</p>
                    {d.positions.map(pos => {
                      const adv = INVESTMENT_ADVISORS.find(a => a.id === pos.advisorId);
                      return (
                        <div key={pos.advisorId} className="flex items-start gap-2 text-[10px]">
                          <span>{adv?.icon}</span>
                          <span className="text-foreground"><strong>{adv?.name}:</strong> {pos.position}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
            {activeQ === "bq3" && (
              <>
                <p className="text-[10px] font-semibold text-[hsl(var(--trust-safe))] uppercase tracking-wider">Where Advisors Align</p>
                {s.alignmentAreas.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <Check className="h-3 w-3 text-[hsl(var(--trust-safe))] shrink-0 mt-0.5" /><span>{a}</span>
                  </div>
                ))}
              </>
            )}
            {activeQ === "bq4" && (
              <>
                <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Strongest Arguments Against Action</p>
                {s.largestRisks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" /><span>{r}</span>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Compare Panel ──
function ComparePanel({ advisors }: { advisors: InvestmentAdvisor[] }) {
  const [leftId, setLeftId] = useState(advisors[0]?.id);
  const [rightId, setRightId] = useState(advisors[5]?.id || advisors[1]?.id);
  const left = advisors.find(a => a.id === leftId)!;
  const right = advisors.find(a => a.id === rightId)!;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select value={leftId} onChange={e => setLeftId(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground">
          {advisors.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} — {a.title}</option>)}
        </select>
        <span className="text-[10px] font-bold text-muted-foreground self-center">VS</span>
        <select value={rightId} onChange={e => setRightId(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground">
          {advisors.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} — {a.title}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[left, right].map(adv => (
          <div key={adv.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{adv.icon}</span>
              <div>
                <p className="text-xs font-bold text-foreground">{adv.name}</p>
                <p className="text-[9px] text-muted-foreground">{adv.title}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <ConfidenceBadge level={adv.confidenceLevel} />
              <RecommendationBadge rec={adv.currentRecommendation} />
            </div>
            <div className="rounded-xl bg-secondary/30 p-2.5">
              <p className="text-[10px] text-foreground leading-relaxed">{adv.currentInsight}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Risk Sensitivity</p>
              <p className="text-[10px] text-foreground capitalize">{adv.riskSensitivity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Time Focus</p>
              <p className="text-[10px] text-foreground capitalize">{adv.timeHorizonFocus.replace("-", " ")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Key Uncertainty</p>
              <p className="text-[10px] text-muted-foreground">{adv.keyUncertainty}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Portfolio Note</p>
              <p className="text-[10px] text-muted-foreground">{adv.portfolioAwareness}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function AdvisorBoard() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useInvestmentDecisions();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("council");
  const [selectedAdvisor, setSelectedAdvisor] = useState<InvestmentAdvisor | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <DemoModeBadge />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> Investment Advisor Council</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Multi-angle intelligence from a structured council of specialized advisors</p>
        </div>
        <button onClick={() => navigate("/investments/boardroom")}
          className="rounded-lg bg-secondary px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <Globe className="h-3 w-3" /> Boardroom
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          { id: "council", label: "Council View", icon: Brain },
          { id: "synthesis", label: "Chief Synthesis", icon: Lightbulb },
          { id: "debate", label: "Debate View", icon: MessageSquare },
          { id: "ask-board", label: "Ask the Board", icon: HelpCircle },
          { id: "compare", label: "Compare", icon: BarChart3 },
        ] as { id: ViewMode; label: string; icon: typeof Brain }[]).map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              view === v.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            <v.icon className="h-3.5 w-3.5" /> {v.label}
          </button>
        ))}
      </div>

      {/* Council View */}
      {view === "council" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INVESTMENT_ADVISORS.map((adv, i) => (
            <motion.div key={adv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedAdvisor(adv)}
              className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/20 transition-all cursor-pointer group">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{adv.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{adv.name}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">{adv.domain}</span>
                    <ConfidenceBadge level={adv.confidenceLevel} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{adv.mission.slice(0, 80)}…</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-foreground">{adv.confidence}%</p>
                  <RecommendationBadge rec={adv.currentRecommendation} />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-3">
                <p className="text-xs text-foreground leading-relaxed">{adv.currentInsight}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {adv.watches.slice(0, 4).map(w => (
                  <span key={w.label} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">
                    <WatchStatusDot status={w.status} /> {w.label}
                  </span>
                ))}
                {adv.watches.length > 4 && <span className="text-[9px] text-muted-foreground">+{adv.watches.length - 4} more</span>}
              </div>
              {adv.whatChanged.length > 0 && (
                <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                  <RefreshCw className="h-3 w-3 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{adv.whatChanged[0]}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                <span className="capitalize">{adv.riskSensitivity} risk · {adv.timeHorizonFocus.replace("-", " ")}</span>
                <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Full analysis <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${adv.confidence}%`, backgroundColor: adv.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {view === "synthesis" && <SynthesisPanel />}

      {view === "ask-board" && <AskBoardPanel />}

      {view === "debate" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 space-y-2">
            <p className="text-sm text-foreground leading-relaxed">{ADVISOR_SYNTHESIS.summary}</p>
          </div>
          {ADVISOR_SYNTHESIS.divergenceAreas.map((d, i) => (
            <div key={i} className="rounded-2xl border border-[hsl(var(--trust-warn))]/20 bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[hsl(var(--trust-warn))]" /> {d.topic}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {d.positions.map(pos => {
                  const adv = INVESTMENT_ADVISORS.find(a => a.id === pos.advisorId);
                  return (
                    <div key={pos.advisorId} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{adv?.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-foreground">{adv?.name}</p>
                          <p className="text-[9px] text-muted-foreground">{adv?.title}</p>
                        </div>
                      </div>
                      <p className="text-xs text-foreground font-medium leading-relaxed">{pos.position}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{pos.reasoning}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${pos.confidence}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-muted-foreground">{pos.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "compare" && <ComparePanel advisors={INVESTMENT_ADVISORS} />}

      <AnimatePresence>
        {selectedAdvisor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedAdvisor(null)}
              className="fixed inset-0 bg-black/40 z-40" />
            <AdvisorDetailPanel advisor={selectedAdvisor} onClose={() => setSelectedAdvisor(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
