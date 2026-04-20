// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Performance Analytics Panel
// Track advisor accuracy, value delivered, and trust evolution
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Trophy, TrendingUp, Zap, Target, Clock, ArrowUp, ArrowDown } from "lucide-react";
import type { PerformanceSnapshot, AdvisorPerformanceRecord } from "@/domains/engines/advisor-performance-engine";
import { getDisablementPolicy } from "@/lib/advisors/advisor-disablement-policy";
import { getAdvisorIdentity } from "@/lib/advisors/advisor-identity-registry";

interface Props {
  snapshot: PerformanceSnapshot;
}

export function AdvisorPerformancePanel({ snapshot }: Props) {
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorPerformanceRecord | null>(null);

  return (
    <div className="space-y-4">
      {/* ── Summary KPIs ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={Target} label="Overall Accuracy" value={`${(snapshot.overallAccuracy * 100).toFixed(0)}%`} sub={`${snapshot.totalRecommendations} recommendations`} color="hsl(152 55% 48%)" />
        <SummaryCard icon={TrendingUp} label="Value Delivered" value={`$${(snapshot.totalValueDelivered / 1000).toFixed(0)}K`} sub="Total verified impact" color="hsl(38 85% 58%)" />
        <SummaryCard icon={Trophy} label="Best Performer" value={snapshot.bestPerformer?.displayName ?? "—"} sub={`${((snapshot.bestPerformer?.accuracyRate ?? 0) * 100).toFixed(0)}% accuracy`} color="hsl(265 55% 58%)" />
        <SummaryCard icon={Clock} label="Avg Response" value={`${snapshot.avgResponseTime}s`} sub="Time to recommendation" color="hsl(200 80% 55%)" />
      </div>

      {/* ── Weekly Trend Chart ────────────────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Weekly Performance Trend</h3>
        <div className="flex items-end gap-2 h-24">
          {snapshot.weeklyTrend.map((w, i) => {
            const maxValue = Math.max(...snapshot.weeklyTrend.map(t => t.value));
            const barHeight = maxValue > 0 ? (w.value / maxValue) * 100 : 0;
            return (
              <div key={w.week} className="flex-1 flex flex-col items-center">
                <span className="text-[9px] text-muted-foreground mb-1">{(w.accuracy * 100).toFixed(0)}%</span>
                <motion.div className="w-full rounded-t-md bg-gradient-to-t from-[hsl(265_55%_58%/0.3)] to-[hsl(265_55%_58%/0.6)]" initial={{ height: 0 }} animate={{ height: `${barHeight}%` }} transition={{ delay: i * 0.08, duration: 0.5 }} />
                <span className="text-[8px] text-muted-foreground mt-1">{w.week}</span>
                <span className="text-[8px] text-muted-foreground">${(w.value / 1000).toFixed(0)}K</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Advisor Leaderboard ──────────────────────── */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Advisor Leaderboard</h3>
        <div className="space-y-2">
          {[...snapshot.advisors].sort((a, b) => b.accuracyRate - a.accuracyRate).map((advisor, i) => (
            <motion.button key={advisor.advisorId} onClick={() => setSelectedAdvisor(selectedAdvisor?.advisorId === advisor.advisorId ? null : advisor)} className={`w-full rounded-lg p-3 transition-all text-left ${selectedAdvisor?.advisorId === advisor.advisorId ? "bg-[hsl(265_55%_58%/0.08)] border border-[hsl(265_55%_58%/0.2)]" : "bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.04)]"}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(265_55%_58%/0.12)] flex items-center justify-center text-[10px] font-bold text-[hsl(265_55%_58%)]">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium text-foreground">{advisor.displayName}</p>
                    <TrendBadge trend={advisor.trend} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {advisor.totalRecommendations} recs · {advisor.executedActions} executed · ${(advisor.valueDelivered / 1000).toFixed(0)}K value
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-foreground">{(advisor.accuracyRate * 100).toFixed(0)}%</p>
                  <TrustBar level={advisor.trustLevel} />
                </div>
              </div>

              {/* Expanded Detail */}
              {selectedAdvisor?.advisorId === advisor.advisorId && (
                <motion.div className="mt-3 pt-3 border-t border-[hsl(0_0%_100%/0.06)] space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  {/* Specialty Scores */}
                  <div>
                    <h4 className="text-[10px] text-muted-foreground mb-2">Specialty Performance</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(advisor.specialtyScore).map(([domain, score]) => (
                        <div key={domain} className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-20 truncate">{domain.replace(/-/g, " ")}</span>
                          <div className="flex-1 h-1.5 bg-[hsl(0_0%_100%/0.05)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[hsl(265_55%_58%/0.5)]" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-[9px] text-foreground w-8 text-right">{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-[10px] text-emerald-400 mb-1">Strengths</h4>
                      {advisor.topStrengths.map(s => (
                        <p key={s} className="text-[9px] text-muted-foreground">✓ {s}</p>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-[10px] text-amber-400 mb-1">Growth Areas</h4>
                      {advisor.topWeaknesses.map(w => (
                        <p key={w} className="text-[9px] text-muted-foreground">△ {w}</p>
                      ))}
                    </div>
                  </div>

                  {/* Weekly History */}
                  <div>
                    <h4 className="text-[10px] text-muted-foreground mb-1">Weekly History</h4>
                    <div className="flex items-end gap-1 h-12">
                      {advisor.weeklyHistory.map((w, wi) => {
                        const max = Math.max(...advisor.weeklyHistory.map(h => h.volume));
                        return (
                          <div key={wi} className="flex-1 flex flex-col items-center">
                            <motion.div className="w-full rounded-t-sm bg-[hsl(38_85%_58%/0.4)]" initial={{ height: 0 }} animate={{ height: `${max > 0 ? (w.volume / max) * 100 : 0}%` }} transition={{ delay: wi * 0.05 }} />
                            <span className="text-[7px] text-muted-foreground mt-0.5">{w.week}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }: { icon: typeof BarChart3; label: string; value: string; sub: string; color: string }) {
  return (
    <motion.div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-display font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

function TrendBadge({ trend }: { trend: "improving" | "stable" | "declining" }) {
  if (trend === "improving") return <span className="flex items-center gap-0.5 text-[9px] text-emerald-400"><ArrowUp className="h-2.5 w-2.5" />improving</span>;
  if (trend === "declining") return <span className="flex items-center gap-0.5 text-[9px] text-red-400"><ArrowDown className="h-2.5 w-2.5" />declining</span>;
  return <span className="text-[9px] text-muted-foreground">stable</span>;
}

function TrustBar({ level }: { level: number }) {
  const color = level > 85 ? "bg-emerald-400" : level > 70 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <div className="w-10 h-1.5 bg-[hsl(0_0%_100%/0.05)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-[8px] text-muted-foreground">{level}</span>
    </div>
  );
}
