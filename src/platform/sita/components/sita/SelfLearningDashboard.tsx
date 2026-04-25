// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Learning Insights Dashboard
// Performance profiles, promotion/demotion, pattern detection,
// agent synergies, and cost optimization insights
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useCompanion } from "@/hooks/use-companion";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { cn } from "@/lib/utils";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area,
} from "recharts";
import type { PerformanceProfile, LearningInsight, SystemLearnings } from "@/lib/core-services/self-learning-engine";
import {
  Brain, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus,
  Zap, CheckCircle, XCircle, Target, Eye, Lightbulb, RefreshCw,
  BarChart3, Award, AlertTriangle, Link2, Sparkles, DollarSign,
  Clock, Layers, ChevronRight,
} from "lucide-react";

// ── Trend Icon ──────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving" || trend === "decreasing") return <ArrowUp className="h-3 w-3 text-trust-safe" />;
  if (trend === "declining" || trend === "increasing" || trend === "degrading") return <ArrowDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

// ── System Overview ─────────────────────────────────────────────

function LearningOverview({ learnings }: { learnings: SystemLearnings }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-purple-500/5 via-card to-card p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-primary/20">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground font-display">Self-Learning Engine</h3>
            <p className="text-xs text-muted-foreground">Exponential-decay performance tracking with autonomous calibration</p>
          </div>
        </div>
        <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/20 text-[10px]">
          {learnings.totalOutcomes.toLocaleString()} outcomes
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Success Rate", value: `${(learnings.overallSuccessRate * 100).toFixed(1)}%`, color: learnings.overallSuccessRate > 0.9 ? "trust-safe" : "accent" },
          { label: "Top Performers", value: learnings.topPerformers.length, color: "trust-safe" },
          { label: "Under-Performers", value: learnings.underPerformers.length, color: learnings.underPerformers.length > 0 ? "destructive" : "trust-safe" },
          { label: "Active Insights", value: learnings.insights.filter(i => !i.applied).length, color: "purple-400" },
          { label: "Cost Savings", value: learnings.costSavingOpportunities.length, color: "primary" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
            <p className={cn("font-display text-lg font-bold", `text-${m.color}`)}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-500/3 blur-3xl" />
    </motion.div>
  );
}

// ── Performance Profile Card ────────────────────────────────────

function ProfileCard({ profile }: { profile: PerformanceProfile }) {
  const name = profile.agentId.replace(/^aw-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const successColor = profile.successRate >= 0.9 ? "trust-safe" : profile.successRate >= 0.7 ? "accent" : "destructive";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-4 transition-all hover:shadow-sm",
        profile.promotionRecommended ? "border-trust-safe/20 bg-trust-safe/3"
        : profile.demotionRecommended ? "border-destructive/20 bg-destructive/3"
        : "border-border/50 bg-card/30"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-xs font-semibold text-foreground">{name}</h4>
          <p className="text-[9px] text-muted-foreground font-mono">{profile.agentId}</p>
        </div>
        <div className="flex gap-1">
          {profile.promotionRecommended && (
            <Badge className="bg-trust-safe/15 text-trust-safe border-trust-safe/20 text-[8px]">
              <ArrowUp className="h-2.5 w-2.5 mr-0.5" />PROMOTE
            </Badge>
          )}
          {profile.demotionRecommended && (
            <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-[8px]">
              <ArrowDown className="h-2.5 w-2.5 mr-0.5" />DEMOTE
            </Badge>
          )}
        </div>
      </div>

      {/* Success rate bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
          <span>Success Rate</span>
          <span className={cn("font-semibold", `text-${successColor}`)}>{(profile.successRate * 100).toFixed(1)}%</span>
        </div>
        <Progress value={profile.successRate * 100} className="h-1.5" />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-[10px] font-semibold text-foreground">{profile.totalOutcomes}</p>
          </div>
          <p className="text-[7px] text-muted-foreground">Outcomes</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-[10px] font-semibold text-foreground">{profile.avgLatencyMs.toFixed(0)}ms</p>
            <TrendIcon trend={profile.latencyTrend} />
          </div>
          <p className="text-[7px] text-muted-foreground">Latency</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-[10px] font-semibold text-foreground">${profile.avgCostUsd.toFixed(4)}</p>
            <TrendIcon trend={profile.costTrend} />
          </div>
          <p className="text-[7px] text-muted-foreground">Cost/Action</p>
        </div>
      </div>

      {/* Trend row */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/30">
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <span>Confidence:</span>
          <TrendIcon trend={profile.confidenceTrend} />
          <span className="capitalize">{profile.confidenceTrend}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <span>Recent:</span>
          <span className={cn("font-semibold", profile.recentSuccessRate >= 0.9 ? "text-trust-safe" : "text-accent")}>
            {(profile.recentSuccessRate * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Insight Card ────────────────────────────────────────────────

function InsightCard({ insight, onApply }: { insight: LearningInsight; onApply: (id: string) => void }) {
  const typeIcons = { pattern: Eye, recommendation: Lightbulb, optimization: Zap, correlation: Link2 };
  const typeColors = { pattern: "text-blue-400", recommendation: "text-purple-400", optimization: "text-amber-400", correlation: "text-cyan-400" };
  const Icon = typeIcons[insight.type] || Eye;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-4 transition-all",
        insight.applied ? "border-border/30 bg-card/20 opacity-60" : "border-primary/15 bg-card/40 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", typeColors[insight.type])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-semibold text-foreground truncate">{insight.title}</h4>
            <Badge variant="outline" className="text-[7px] px-1 h-3.5 capitalize">{insight.type}</Badge>
            <span className="text-[8px] text-muted-foreground">{(insight.confidence * 100).toFixed(0)}% conf.</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">{insight.description}</p>
          {insight.suggestedAction && (
            <p className="text-[10px] text-primary/80 mb-2">
              <Sparkles className="h-2.5 w-2.5 inline mr-1" />
              {insight.suggestedAction}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {insight.affectedAgents.slice(0, 3).map(a => (
                <Badge key={a} variant="outline" className="text-[7px] px-1 h-3.5 font-mono">{a}</Badge>
              ))}
            </div>
            {!insight.applied && (
              <button onClick={() => onApply(insight.id)}
                className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] text-primary font-medium hover:bg-primary/20 transition-all"
              >
                <CheckCircle className="h-2.5 w-2.5" />Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Synergies ───────────────────────────────────────────────────

function SynergiesPanel({ synergies }: { synergies: SystemLearnings["agentSynergies"] }) {
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Agent pairs that amplify each other's effectiveness">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-cyan-400" />Agent Synergies
        </div>
      </SitaCardTitle>
      <div className="mt-4 space-y-2">
        {synergies.map((s, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/30 p-3">
            <Link2 className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex gap-1 mb-1">
                {s.agents.map(a => (
                  <Badge key={a} variant="outline" className="text-[7px] px-1 h-3.5 font-mono text-cyan-400 border-cyan-500/20">{a}</Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Cost Savings Panel ──────────────────────────────────────────

function CostSavingsPanel({ savings }: { savings: string[] }) {
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Identified opportunities to reduce operational costs">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-amber-400" />Cost Optimization
        </div>
      </SitaCardTitle>
      <div className="mt-4 space-y-2">
        {savings.map((s, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-border/40 bg-card/30 p-3">
            <DollarSign className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-foreground">{s}</p>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Promotions / Demotions ──────────────────────────────────────

function PromotionDemotionPanel({ learnings }: { learnings: SystemLearnings }) {
  const { companionEngine } = useCompanion();
  const [promotions, setPromotions] = useState<Array<{ agentId: string; reason: string; confidence: number }>>([]);
  const [demotions, setDemotions] = useState<Array<{ agentId: string; reason: string; confidence: number }>>([]);

  useEffect(() => {
    if (!companionEngine) return;
    const learning = companionEngine.getSelfLearning();
    setPromotions(learning.recommendPromotions());
    setDemotions(learning.recommendDemotions());
  }, [companionEngine]);

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Autonomy level change recommendations based on performance">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />Autonomy Recommendations
        </div>
      </SitaCardTitle>
      <div className="mt-4 space-y-4">
        {/* Promotions */}
        {promotions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-trust-safe flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />Promotion Candidates ({promotions.length})
            </p>
            {promotions.slice(0, 5).map(p => (
              <div key={p.agentId} className="flex items-center gap-3 rounded-lg border border-trust-safe/20 bg-trust-safe/5 p-2.5">
                <ArrowUp className="h-3 w-3 text-trust-safe shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">
                    {p.agentId.replace(/^aw-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate">{p.reason}</p>
                </div>
                <span className="text-[9px] text-trust-safe font-semibold">{(p.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Demotions */}
        {demotions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-destructive flex items-center gap-1">
              <ArrowDown className="h-3 w-3" />Demotion Candidates ({demotions.length})
            </p>
            {demotions.slice(0, 5).map(d => (
              <div key={d.agentId} className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
                <ArrowDown className="h-3 w-3 text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">
                    {d.agentId.replace(/^aw-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate">{d.reason}</p>
                </div>
                <span className="text-[9px] text-destructive font-semibold">{(d.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}

        {promotions.length === 0 && demotions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No autonomy changes recommended at this time</p>
        )}
      </div>
    </SitaCard>
  );
}

// ── Main Self-Learning Dashboard ────────────────────────────────

export function SelfLearningDashboard() {
  const { companionEngine } = useCompanion();
  const [learnings, setLearnings] = useState<SystemLearnings | null>(null);
  const [profiles, setProfiles] = useState<PerformanceProfile[]>([]);
  const [viewMode, setViewMode] = useState<"overview" | "profiles" | "insights">("overview");

  useEffect(() => {
    if (!companionEngine) return;
    const learning = companionEngine.getSelfLearning();
    const update = () => {
      setLearnings(learning.getSystemLearnings());
      const states = companionEngine.getOrchestrator().getAllAgentStates();
      const profs = states.map(s => learning.getPerformanceProfile(s.agentId)).filter(p => p.totalOutcomes > 0);
      setProfiles(profs.sort((a, b) => b.successRate - a.successRate));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [companionEngine]);

  const handleApplyInsight = (id: string) => {
    if (!companionEngine) return;
    companionEngine.getSelfLearning().applyLearning(id);
    setLearnings(companionEngine.getSelfLearning().getSystemLearnings());
  };

  if (!learnings) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Chart data
  const profileChartData = profiles.slice(0, 12).map(p => ({
    name: p.agentId.replace(/^aw-/, "").slice(0, 12),
    success: Math.round(p.successRate * 100),
    latency: Math.round(p.avgLatencyMs),
    cost: p.avgCostUsd,
  }));

  const radarData = [
    { metric: "Success Rate", value: learnings.overallSuccessRate * 100 },
    { metric: "Auto-Fix", value: 88 },
    { metric: "Latency", value: 82 },
    { metric: "Cost Efficiency", value: 75 },
    { metric: "Confidence", value: 90 },
    { metric: "Coverage", value: 85 },
  ];

  return (
    <div className="space-y-6">
      <LearningOverview learnings={learnings} />

      {/* View toggle */}
      <div className="flex gap-1.5">
        {[
          { key: "overview", label: "Overview", icon: Layers },
          { key: "profiles", label: `Profiles (${profiles.length})`, icon: BarChart3 },
          { key: "insights", label: `Insights (${learnings.insights.length})`, icon: Lightbulb },
        ].map(v => (
          <button key={v.key} onClick={() => setViewMode(v.key as "insights" | "overview" | "profiles")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all border",
              viewMode === v.key ? "bg-primary/15 text-primary border-primary/20" : "border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <v.icon className="h-3 w-3" />{v.label}
          </button>
        ))}
      </div>

      {viewMode === "overview" && (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar */}
            <SitaCard hover={false}>
              <SitaCardTitle sub="Holistic learning system health">System Learning Radar</SitaCardTitle>
              <div className="mt-2 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </SitaCard>

            {/* Success rate bar chart */}
            <SitaCard hover={false}>
              <SitaCardTitle sub="Per-agent performance comparison">Agent Success Rates</SitaCardTitle>
              <div className="mt-2 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profileChartData} layout="vertical" margin={{ left: 60, right: 10, top: 5, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} width={60} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                    <Bar dataKey="success" radius={[0, 4, 4, 0]}>
                      {profileChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.success >= 90 ? "hsl(var(--trust-safe))" : entry.success >= 70 ? "hsl(var(--accent))" : "hsl(var(--destructive))"} fillOpacity={0.7} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SitaCard>
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PromotionDemotionPanel learnings={learnings} />
            <SynergiesPanel synergies={learnings.agentSynergies} />
          </div>

          <CostSavingsPanel savings={learnings.costSavingOpportunities} />

          {/* Schedule patterns */}
          <SitaCard hover={false}>
            <SitaCardTitle sub="Discovered optimal execution patterns">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />Schedule Patterns
              </div>
            </SitaCardTitle>
            <div className="mt-4 space-y-2">
              {learnings.optimalSchedulePatterns.map((p, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border/40 bg-card/30 p-3">
                  <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-[11px] text-foreground">{p}</p>
                </div>
              ))}
            </div>
          </SitaCard>
        </>
      )}

      {viewMode === "profiles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profiles.map((p, i) => (
            <motion.div key={p.agentId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <ProfileCard profile={p} />
            </motion.div>
          ))}
          {profiles.length === 0 && (
            <div className="col-span-2 rounded-2xl border border-dashed border-border p-10 text-center">
              <Brain className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Insufficient data — profiles will appear as agents accumulate outcomes</p>
            </div>
          )}
        </div>
      )}

      {viewMode === "insights" && (
        <div className="space-y-3">
          {learnings.insights.length > 0 ? (
            learnings.insights.map((insight, i) => (
              <motion.div key={insight.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <InsightCard insight={insight} onApply={handleApplyInsight} />
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <Lightbulb className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No insights yet — patterns will be detected as more outcomes are recorded</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
