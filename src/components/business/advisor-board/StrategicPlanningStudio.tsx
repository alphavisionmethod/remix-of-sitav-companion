// ═══════════════════════════════════════════════════════════════
// SITA OS — Strategic Planning Studio
// OKRs, goals, milestones, timeline projections, strategy docs
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Calendar, TrendingUp, TrendingDown, Minus, FileText, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle2, Clock, Plus, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedConfidenceRing } from "./AnimatedConfidenceRing";
import { SparklineChart } from "./SparklineChart";
import type {
  StrategicGoal, Milestone, TimelineProjection, StrategyDocument, PlanningSnapshot,
  GoalStatus, MilestoneStatus,
} from "@/domains/engines/strategic-planning-engine";

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; icon: React.ElementType }> = {
  not_started: { label: "Not Started", color: "hsl(0 0% 50%)", icon: Clock },
  on_track: { label: "On Track", color: "hsl(152 55% 48%)", icon: CheckCircle2 },
  at_risk: { label: "At Risk", color: "hsl(38 85% 58%)", icon: AlertTriangle },
  behind: { label: "Behind", color: "hsl(0 72% 51%)", icon: TrendingDown },
  completed: { label: "Completed", color: "hsl(152 55% 48%)", icon: CheckCircle2 },
  paused: { label: "Paused", color: "hsl(0 0% 50%)", icon: Clock },
};

const MILESTONE_COLORS: Record<MilestoneStatus, string> = {
  upcoming: "hsl(200 80% 55%)", in_progress: "hsl(265 55% 58%)", completed: "hsl(152 55% 48%)", missed: "hsl(0 72% 51%)", deferred: "hsl(38 85% 58%)",
};

interface Props {
  snapshot: PlanningSnapshot;
  strategyDoc?: StrategyDocument;
  onUpdateGoalProgress: (goalId: string, progress: number) => void;
  onUpdateMilestone: (milestoneId: string, status: MilestoneStatus) => void;
  onGenerateStrategy: () => void;
}

export function StrategicPlanningStudio({ snapshot, strategyDoc, onUpdateGoalProgress, onUpdateMilestone, onGenerateStrategy }: Props) {
  const [view, setView] = useState<"goals" | "timeline" | "strategy">("goals");
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* ── Overview Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 text-center">
          <AnimatedConfidenceRing value={snapshot.overallProgress} size={48} strokeWidth={3.5} />
          <div className="text-[10px] text-muted-foreground mt-1">Overall Progress</div>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 text-center">
          <div className="text-2xl font-display font-bold text-[hsl(152_55%_48%)]">{snapshot.goalsOnTrack}</div>
          <div className="text-[10px] text-muted-foreground">On Track</div>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 text-center">
          <div className="text-2xl font-display font-bold text-[hsl(38_85%_58%)]">{snapshot.goalsAtRisk}</div>
          <div className="text-[10px] text-muted-foreground">At Risk</div>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 text-center">
          <div className="text-2xl font-display font-bold text-[hsl(0_72%_51%)]">{snapshot.goalsBehind}</div>
          <div className="text-[10px] text-muted-foreground">Behind</div>
        </div>
      </div>

      {/* ── Next Milestone Banner ─────────────────────── */}
      {snapshot.nextMilestone && (
        <div className="rounded-xl border border-[hsl(265_55%_58%/0.2)] bg-[hsl(265_55%_58%/0.05)] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(265_55%_58%/0.15)] flex items-center justify-center">
            <Target className="h-4 w-4 text-[hsl(265_55%_58%)]" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Next Milestone: {snapshot.nextMilestone.title}</div>
            <div className="text-[10px] text-muted-foreground">Due {snapshot.nextMilestone.targetDate} · {snapshot.nextMilestone.impact} impact</div>
          </div>
          <Badge variant="outline" className="text-[8px]" style={{ color: MILESTONE_COLORS[snapshot.nextMilestone.status] }}>
            {snapshot.nextMilestone.status}
          </Badge>
        </div>
      )}

      {/* ── View Toggle ───────────────────────────────── */}
      <div className="flex gap-2">
        <Button variant={view === "goals" ? "default" : "ghost"} size="sm" className="text-[10px] h-7" onClick={() => setView("goals")}>
          <Target className="h-3 w-3 mr-1" /> Goals & OKRs ({snapshot.goals.length})
        </Button>
        <Button variant={view === "timeline" ? "default" : "ghost"} size="sm" className="text-[10px] h-7" onClick={() => setView("timeline")}>
          <Calendar className="h-3 w-3 mr-1" /> Timeline
        </Button>
        <Button variant={view === "strategy" ? "default" : "ghost"} size="sm" className="text-[10px] h-7" onClick={() => setView("strategy")}>
          <FileText className="h-3 w-3 mr-1" /> Strategy Doc
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {view === "goals" && (
          <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {snapshot.goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                milestones={snapshot.milestones.filter(m => m.goalId === goal.id)}
                expanded={expandedGoal === goal.id}
                onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                onUpdateMilestone={onUpdateMilestone}
              />
            ))}
          </motion.div>
        )}

        {view === "timeline" && (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TimelineView projections={snapshot.projections} milestones={snapshot.milestones} />
          </motion.div>
        )}

        {view === "strategy" && (
          <motion.div key="strategy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {strategyDoc ? (
              <StrategyDocView doc={strategyDoc} />
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-xs text-muted-foreground mb-3">No strategy document generated yet</p>
                <Button size="sm" className="text-[10px]" onClick={onGenerateStrategy}>
                  <FileText className="h-3 w-3 mr-1" /> Generate Strategy Document
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────

function GoalCard({ goal, milestones, expanded, onToggle, onUpdateMilestone }: {
  goal: StrategicGoal;
  milestones: Milestone[];
  expanded: boolean;
  onToggle: () => void;
  onUpdateMilestone: (id: string, status: MilestoneStatus) => void;
}) {
  const config = STATUS_CONFIG[goal.status];
  const StatusIcon = config.icon;

  return (
    <motion.div layout className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-[hsl(0_0%_100%/0.03)] transition-colors" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <AnimatedConfidenceRing value={goal.progress} size={44} strokeWidth={3} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{goal.title}</span>
              <Badge variant="outline" className="text-[8px] h-4 px-1.5" style={{ color: config.color, borderColor: `${config.color}40` }}>
                <StatusIcon className="h-2.5 w-2.5 mr-0.5" /> {config.label}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{goal.description}</div>
            <div className="flex items-center gap-4 mt-1.5 text-[10px]">
              <span className="text-muted-foreground">
                {goal.unit === "$" ? `$${goal.currentValue.toLocaleString()}` : `${goal.currentValue}${goal.unit}`} / {goal.unit === "$" ? `$${goal.targetValue.toLocaleString()}` : `${goal.targetValue}${goal.unit}`}
              </span>
              <span className="text-muted-foreground/50">Due {goal.targetDate}</span>
              <span className="text-muted-foreground/50">{goal.keyResults.length} key results</span>
            </div>
          </div>
          <div className="shrink-0">
            {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground/30" /> : <ChevronRight className="h-4 w-4 text-muted-foreground/30" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-[hsl(0_0%_100%/0.06)] pt-3">
              {/* Advisor Insight */}
              {goal.advisorInsight && (
                <div className="rounded-lg bg-[hsl(265_55%_58%/0.06)] border border-[hsl(265_55%_58%/0.15)] p-3">
                  <div className="text-[10px] text-[hsl(265_55%_58%)]">💡 {goal.advisorInsight}</div>
                </div>
              )}

              {/* Key Results */}
              <div>
                <div className="text-[10px] font-medium text-muted-foreground mb-2">Key Results</div>
                <div className="space-y-2">
                  {goal.keyResults.map(kr => {
                    const krConfig = STATUS_CONFIG[kr.status];
                    return (
                      <div key={kr.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `${krConfig.color}15` }}>
                          <krConfig.icon className="h-3 w-3" style={{ color: krConfig.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-foreground truncate">{kr.title}</div>
                          <div className="h-1 rounded-full bg-[hsl(0_0%_100%/0.06)] mt-1 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${kr.progress}%`, backgroundColor: krConfig.color }} />
                          </div>
                        </div>
                        <span className="text-[9px] text-muted-foreground shrink-0">
                          {kr.currentValue}/{kr.targetValue} {kr.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestones */}
              {milestones.length > 0 && (
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground mb-2">Milestones</div>
                  <div className="space-y-1.5">
                    {milestones.map(ms => (
                      <div key={ms.id} className="flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MILESTONE_COLORS[ms.status] }} />
                        <span className="text-foreground flex-1 truncate">{ms.title}</span>
                        <span className="text-muted-foreground/50">{ms.targetDate}</span>
                        {ms.status === "upcoming" && (
                          <Button variant="ghost" size="sm" className="text-[8px] h-5 px-1.5" onClick={() => onUpdateMilestone(ms.id, "in_progress")}>Start</Button>
                        )}
                        {ms.status === "in_progress" && (
                          <Button variant="ghost" size="sm" className="text-[8px] h-5 px-1.5 text-[hsl(152_55%_48%)]" onClick={() => onUpdateMilestone(ms.id, "completed")}>Complete</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {goal.riskFactors.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {goal.riskFactors.map(risk => (
                    <Badge key={risk} variant="outline" className="text-[8px] text-[hsl(0_72%_51%)] border-[hsl(0_72%_51%/0.2)]">
                      <AlertTriangle className="h-2 w-2 mr-0.5" /> {risk}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TimelineView({ projections, milestones }: { projections: TimelineProjection[]; milestones: Milestone[] }) {
  const maxValue = Math.max(...projections.map(p => p.optimistic));
  const width = 700;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / (projections.length - 1)) * chartW;
  const yScale = (v: number) => padding.top + chartH - (v / maxValue) * chartH;

  const optimisticPath = projections.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.optimistic)}`).join(" ");
  const realisticPath = projections.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.realistic)}`).join(" ");
  const pessimisticPath = projections.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.pessimistic)}`).join(" ");
  const actualPoints = projections.filter(p => p.actual !== undefined);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <div className="text-xs font-display font-semibold text-foreground mb-3">Revenue Projection Timeline</div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => (
            <g key={pct}>
              <line x1={padding.left} y1={yScale(maxValue * pct)} x2={width - padding.right} y2={yScale(maxValue * pct)} stroke="hsl(0 0% 100% / 0.04)" />
              <text x={padding.left - 8} y={yScale(maxValue * pct) + 3} textAnchor="end" fill="hsl(0 0% 100% / 0.3)" fontSize="8">
                ${Math.round(maxValue * pct / 1000)}K
              </text>
            </g>
          ))}

          {/* Confidence band */}
          <path
            d={`${optimisticPath} ${projections.map((p, i) => `L ${xScale(projections.length - 1 - i)} ${yScale(projections[projections.length - 1 - i].pessimistic)}`).join(" ")} Z`}
            fill="hsl(265 55% 58% / 0.08)"
          />

          {/* Lines */}
          <path d={optimisticPath} fill="none" stroke="hsl(152 55% 48% / 0.4)" strokeWidth="1" strokeDasharray="4 2" />
          <path d={realisticPath} fill="none" stroke="hsl(265 55% 58%)" strokeWidth="2" />
          <path d={pessimisticPath} fill="none" stroke="hsl(0 72% 51% / 0.4)" strokeWidth="1" strokeDasharray="4 2" />

          {/* Actual points */}
          {actualPoints.map((p, i) => {
            const idx = projections.indexOf(p);
            return (
              <circle key={i} cx={xScale(idx)} cy={yScale(p.actual!)} r="4" fill="hsl(38 85% 58%)" stroke="hsl(0 0% 5%)" strokeWidth="2" />
            );
          })}

          {/* Month labels */}
          {projections.map((p, i) => (
            <text key={i} x={xScale(i)} y={height - 10} textAnchor="middle" fill="hsl(0 0% 100% / 0.3)" fontSize="8">
              {p.date.slice(5)}
            </text>
          ))}
        </svg>

        <div className="flex justify-center gap-6 mt-2 text-[9px]">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[hsl(152_55%_48%/0.4)]" /> Optimistic</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[hsl(265_55%_58%)]" /> Realistic</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[hsl(0_72%_51%/0.4)]" /> Pessimistic</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(38_85%_58%)]" /> Actual</span>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <div className="text-xs font-display font-semibold text-foreground mb-3">Milestone Timeline</div>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[hsl(0_0%_100%/0.08)]" />
          <div className="space-y-4">
            {milestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()).map(ms => (
              <div key={ms.id} className="flex items-start gap-3 pl-1">
                <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 z-10 bg-background" style={{ borderColor: MILESTONE_COLORS[ms.status] }}>
                  {ms.status === "completed" && <CheckCircle2 className="h-3 w-3" style={{ color: MILESTONE_COLORS[ms.status] }} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-foreground">{ms.title}</span>
                    <Badge variant="outline" className="text-[8px] h-4 px-1" style={{ color: MILESTONE_COLORS[ms.status] }}>{ms.status}</Badge>
                    <Badge variant="outline" className="text-[8px] h-4 px-1">{ms.impact}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{ms.description}</div>
                  <div className="text-[9px] text-muted-foreground/50 mt-0.5">
                    Target: {ms.targetDate}{ms.completedDate && ` · Completed: ${ms.completedDate}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyDocView({ doc }: { doc: StrategyDocument }) {
  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">{doc.title}</h2>
        <div className="text-[10px] text-muted-foreground">Generated {new Date(doc.generatedAt).toLocaleDateString()}</div>
      </div>

      {doc.sections.map((section, i) => (
        <div key={i}>
          <h3 className="text-sm font-display font-semibold text-foreground mb-2">{section.heading}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
          {section.dataPoints && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {section.dataPoints.map(dp => (
                <div key={dp.label} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2 text-center">
                  <div className="text-sm font-display font-bold text-[hsl(265_55%_58%)]">{dp.value}</div>
                  <div className="text-[9px] text-muted-foreground">{dp.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {doc.advisorContributions.length > 0 && (
        <div>
          <h3 className="text-sm font-display font-semibold text-foreground mb-2">Advisor Contributions</h3>
          <div className="space-y-2">
            {doc.advisorContributions.map((ac, i) => (
              <div key={i} className="rounded-lg bg-[hsl(265_55%_58%/0.05)] border border-[hsl(265_55%_58%/0.1)] p-3">
                <div className="text-[10px] font-medium text-[hsl(265_55%_58%)]">{ac.advisorName}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{ac.contribution}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
