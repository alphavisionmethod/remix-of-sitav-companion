// ═══════════════════════════════════════════════════════════════
// SITA OS — Decision Journal Panel
// Track strategic decisions, outcomes, and lessons learned
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, Clock, XCircle, TrendingUp, ChevronDown, ChevronUp, Lightbulb, DollarSign, Filter } from "lucide-react";
import type { DecisionJournalSnapshot, DecisionEntry, DecisionCategory } from "@/domains/engines/decision-journal-engine";

interface Props {
  snapshot: DecisionJournalSnapshot;
  decisions: DecisionEntry[];
  onUpdateOutcome: (id: string, outcome: "successful" | "partially_successful" | "failed", actualOutcome: string, impact: number, lessons: string) => void;
}

const CATEGORY_COLORS: Record<DecisionCategory, string> = {
  revenue: "hsl(152 55% 48%)", cost: "hsl(38 85% 58%)", growth: "hsl(265 55% 58%)",
  risk: "hsl(0 72% 51%)", operations: "hsl(200 80% 55%)", client: "hsl(320 60% 55%)", strategy: "hsl(180 55% 45%)",
};

const OUTCOME_ICONS = {
  pending: Clock, successful: CheckCircle2, partially_successful: TrendingUp, failed: XCircle, superseded: Filter,
};

export function DecisionJournalPanel({ snapshot, decisions, onUpdateOutcome }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<DecisionCategory | "all">("all");

  const filtered = filterCat === "all" ? decisions : decisions.filter(d => d.category === filterCat);

  return (
    <div className="space-y-4">
      {/* ── Summary Strip ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Total Decisions" value={snapshot.totalDecisions.toString()} color="hsl(265 55% 58%)" />
        <StatCard icon={CheckCircle2} label="Success Rate" value={`${(snapshot.successRate * 100).toFixed(0)}%`} color="hsl(152 55% 48%)" />
        <StatCard icon={DollarSign} label="Total Impact" value={`$${(snapshot.totalImpact / 1000).toFixed(0)}K`} color="hsl(38 85% 58%)" />
        <StatCard icon={Clock} label="Pending Review" value={snapshot.pendingReview.length.toString()} color="hsl(200 80% 55%)" />
      </div>

      {/* ── Category Breakdown ──────────────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Decision Categories</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {snapshot.categoryBreakdown.map(cat => (
            <button key={cat.category} onClick={() => setFilterCat(filterCat === cat.category ? "all" : cat.category)} className={`rounded-lg p-2 text-left transition-all border ${filterCat === cat.category ? "border-[hsl(265_55%_58%/0.3)] bg-[hsl(265_55%_58%/0.08)]" : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)]"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] }} />
                <span className="text-[10px] text-foreground capitalize">{cat.category}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{cat.count}</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground">{(cat.successRate * 100).toFixed(0)}% success</span>
                <span className="text-[9px] text-muted-foreground">${(cat.impact / 1000).toFixed(0)}K</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Monthly Trend ────────────────────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Monthly Decision History</h3>
        <div className="flex items-end gap-3 h-20">
          {snapshot.monthlyHistory.map((m, i) => {
            const maxDec = Math.max(...snapshot.monthlyHistory.map(h => h.decisions));
            const barH = maxDec > 0 ? (m.decisions / maxDec) * 100 : 0;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center">
                <span className="text-[9px] text-muted-foreground mb-1">{m.decisions}</span>
                <motion.div className="w-full rounded-t-md" style={{ backgroundColor: m.successRate > 0.7 ? "hsl(152 55% 48% / 0.4)" : m.successRate > 0 ? "hsl(38 85% 58% / 0.4)" : "hsl(0 0% 50% / 0.2)" }} initial={{ height: 0 }} animate={{ height: `${barH}%` }} transition={{ delay: i * 0.08, duration: 0.5 }} />
                <span className="text-[8px] text-muted-foreground mt-1">{m.month}</span>
                {m.impact > 0 && <span className="text-[8px] text-emerald-400">${(m.impact / 1000).toFixed(0)}K</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Top Lessons ──────────────────────────────── */}
      {snapshot.topLessons.length > 0 && (
        <div className="rounded-xl border border-[hsl(38_85%_58%/0.15)] bg-[hsl(38_85%_58%/0.03)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
            <h3 className="text-xs font-semibold text-foreground">Key Lessons Learned</h3>
          </div>
          <div className="space-y-1.5">
            {snapshot.topLessons.map((lesson, i) => (
              <p key={i} className="text-[10px] text-muted-foreground flex items-start gap-2">
                <span className="text-[hsl(38_85%_58%)] mt-0.5">•</span>
                {lesson}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Decision Timeline ────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Decision Timeline</h3>
          {filterCat !== "all" && (
            <button onClick={() => setFilterCat("all")} className="text-[9px] text-[hsl(265_55%_58%)] hover:underline">Clear filter</button>
          )}
        </div>
        <AnimatePresence>
          {filtered.map((decision, i) => {
            const isExpanded = expandedId === decision.id;
            const OutcomeIcon = OUTCOME_ICONS[decision.outcome];
            return (
              <motion.div key={decision.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <button onClick={() => setExpandedId(isExpanded ? null : decision.id)} className="w-full p-3 text-left hover:bg-[hsl(0_0%_100%/0.03)] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${decision.outcome === "successful" ? "bg-emerald-500/10" : decision.outcome === "failed" ? "bg-red-500/10" : decision.outcome === "pending" ? "bg-blue-500/10" : "bg-amber-500/10"}`}>
                      <OutcomeIcon className={`h-3.5 w-3.5 ${decision.outcome === "successful" ? "text-emerald-400" : decision.outcome === "failed" ? "text-red-400" : decision.outcome === "pending" ? "text-blue-400" : "text-amber-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[11px] font-medium text-foreground">{decision.title}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize" style={{ backgroundColor: `${CATEGORY_COLORS[decision.category]}15`, color: CATEGORY_COLORS[decision.category] }}>{decision.category}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{decision.advisorName} · {decision.decidedAt}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {decision.impact > 0 && <span className="text-[10px] font-mono text-emerald-400">+${(decision.impact / 1000).toFixed(0)}K</span>}
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div className="px-3 pb-3 space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="border-t border-[hsl(0_0%_100%/0.06)] pt-3">
                        <p className="text-[10px] text-foreground">{decision.description}</p>
                      </div>

                      <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
                        <h4 className="text-[9px] text-muted-foreground mb-1">Rationale</h4>
                        <p className="text-[10px] text-foreground">{decision.rationale}</p>
                      </div>

                      <div>
                        <h4 className="text-[9px] text-muted-foreground mb-1">Alternatives Considered</h4>
                        {decision.alternatives.map((alt, ai) => (
                          <p key={ai} className="text-[10px] text-muted-foreground">• {alt}</p>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
                          <h4 className="text-[9px] text-muted-foreground mb-1">Expected</h4>
                          <p className="text-[10px] text-foreground">{decision.expectedOutcome}</p>
                        </div>
                        <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
                          <h4 className="text-[9px] text-muted-foreground mb-1">Actual</h4>
                          <p className="text-[10px] text-foreground">{decision.actualOutcome || "Pending review"}</p>
                        </div>
                      </div>

                      {decision.lessonsLearned && (
                        <div className="rounded-lg bg-[hsl(38_85%_58%/0.05)] border border-[hsl(38_85%_58%/0.1)] p-2">
                          <h4 className="text-[9px] text-[hsl(38_85%_58%)] mb-1">💡 Lesson Learned</h4>
                          <p className="text-[10px] text-foreground">{decision.lessonsLearned}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground">Confidence: {(decision.confidence * 100).toFixed(0)}%</span>
                        <div className="w-16 h-1.5 bg-[hsl(0_0%_100%/0.05)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[hsl(265_55%_58%/0.5)]" style={{ width: `${decision.confidence * 100}%` }} />
                        </div>
                        {decision.tags.map(tag => (
                          <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.05)] text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof BookOpen; label: string; value: string; color: string }) {
  return (
    <motion.div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-display font-bold text-foreground">{value}</p>
    </motion.div>
  );
}
