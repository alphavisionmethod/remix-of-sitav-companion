// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Command Center
// @canonical — Business domain autopilot dashboard.
// Not a command palette — this is a domain-specific admin surface.
// Consumer: AutopilotHub page only.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SitaPageHeader, SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { SitaTabs, KPITile } from "@/platform/sita/components/sita/SitaComponents";
import {
  Zap, Play, Pause, TrendingUp, DollarSign, Clock, Shield,
  CheckCircle, AlertTriangle, ArrowRight, Activity, Users,
  BarChart3, Brain, Target, Sparkles, XCircle, Eye, ChevronRight,
  RefreshCw, Settings, Bell
} from "lucide-react";
import { LiveAdvisorCard } from "@/platform/sita/components/sita/LiveAdvisorCard";
import type {
  AutopilotConfig, Playbook, PlaybookId, ActivityEvent,
  NextBestAction, BusinessDigitalTwin, AutopilotStats
} from "@/lib/domain-engines/autopilot-engine";
import {
  buildDashboard, activatePlaybook, pausePlaybook
} from "@/lib/domain-engines/autopilot-engine";

interface AutopilotCommandCenterProps {
  config: AutopilotConfig;
  onConfigUpdate: (config: AutopilotConfig) => void;
  onOpenWizard: () => void;
}

const fmtCents = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
const timeAgo = (ts: number) => {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

const statusIcon: Record<string, typeof CheckCircle> = {
  completed: CheckCircle, queued: Clock, running: RefreshCw,
  failed: XCircle, "approval-required": Shield, skipped: Eye,
};
const statusColor: Record<string, string> = {
  completed: "text-trust-safe", queued: "text-accent", running: "text-primary",
  failed: "text-destructive", "approval-required": "text-urgency-high", skipped: "text-muted-foreground",
};

// ── Sub-views ────────────────────────────────────────────────────

const PlaybooksView = ({ playbooks, onToggle }: { playbooks: Playbook[]; onToggle: (id: PlaybookId) => void }) => {
  const categories = ["recovery", "growth", "retention", "efficiency"] as const;
  const catLabels: Record<string, string> = { recovery: "💰 Recovery", growth: "🚀 Growth", retention: "🛡️ Retention", efficiency: "⚡ Efficiency" };

  return (
    <div className="space-y-6">
      {categories.map(cat => {
        const pbs = playbooks.filter(p => p.category === cat);
        if (!pbs.length) return null;
        return (
          <div key={cat} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{catLabels[cat]}</h3>
            {pbs.map((pb, i) => (
              <motion.div key={pb.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <SitaCard className="p-4" hover>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl shrink-0">{pb.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{pb.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          pb.status === "active" ? "bg-trust-safe/10 text-trust-safe" :
                          pb.status === "paused" ? "bg-urgency-high/10 text-urgency-high" :
                          "bg-secondary text-muted-foreground"
                        }`}>{pb.status}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground">
                        <span>{pb.metrics.totalActionsRun} actions</span>
                        <span>{pb.metrics.successRate}% success</span>
                        <span>${(pb.metrics.revenueRecovered + pb.metrics.revenueGenerated).toLocaleString()} impact</span>
                        <span>{pb.metrics.timeSavedHours}h saved</span>
                      </div>
                      {/* Step progress */}
                      <div className="flex gap-1 mt-2">
                        {pb.steps.map((s, si) => (
                          <div key={s.id} className={`h-1.5 flex-1 rounded-full ${s.enabled ? "bg-primary/30" : "bg-border"}`}>
                            <div className="h-full rounded-full bg-primary" style={{ width: pb.status === "active" ? `${Math.min(100, (si + 1) * 20)}%` : "0%" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => onToggle(pb.id)}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                        pb.status === "active" ? "bg-urgency-high/10 text-urgency-high hover:bg-urgency-high/20" :
                        "gradient-sita text-primary-foreground hover:opacity-90"
                      }`}>
                      {pb.status === "active" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Activate</>}
                    </button>
                  </div>
                </SitaCard>
              </motion.div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const ActivityFeedView = ({ events }: { events: ActivityEvent[] }) => (
  <div className="space-y-2">
    {events.map((ev, i) => {
      const Icon = statusIcon[ev.status] || Activity;
      return (
        <motion.div key={ev.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <SitaCard className={`p-4 ${ev.requiresAttention ? "border-urgency-high/30" : ""}`} hover>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 shrink-0 ${statusColor[ev.status]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{ev.entityName}</p>
                  {ev.requiresAttention && (
                    <span className="rounded-full bg-urgency-high/10 px-2 py-0.5 text-[9px] font-semibold text-urgency-high flex items-center gap-1">
                      <Bell className="h-2.5 w-2.5" /> Action needed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{timeAgo(ev.timestamp)}</span>
                  {ev.impact && (
                    <span className="text-[10px] font-medium text-primary">
                      {ev.impact.type === "revenue" ? fmtCents(ev.impact.value) : `${ev.impact.value}${ev.impact.unit}`}
                    </span>
                  )}
                  {ev.playbookId && <span className="text-[10px] text-muted-foreground/70 capitalize">{ev.playbookId.replace(/-/g, " ")}</span>}
                </div>
              </div>
              {ev.requiresAttention && (
                <button className="rounded-lg gradient-sita px-3 py-1 text-[10px] font-semibold text-primary-foreground shrink-0">
                  Review
                </button>
              )}
            </div>
          </SitaCard>
        </motion.div>
      );
    })}
  </div>
);

const NBAView = ({ actions }: { actions: NextBestAction[] }) => (
  <div className="space-y-3">
    {actions.map((nba, i) => (
      <motion.div key={nba.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
        <SitaCard className="p-5" hover>
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
              nba.urgency === "critical" ? "bg-destructive/10 text-destructive" :
              nba.urgency === "high" ? "bg-urgency-high/10 text-urgency-high" :
              "bg-accent/10 text-accent"
            }`}>
              {nba.confidence}%
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{nba.entityName}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${
                  nba.urgency === "critical" ? "bg-destructive/10 text-destructive" :
                  nba.urgency === "high" ? "bg-urgency-high/10 text-urgency-high" :
                  "bg-accent/10 text-accent"
                }`}>{nba.urgency}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground capitalize">{nba.actionType}</span>
              </div>
              <p className="text-sm text-foreground mt-1">{nba.description}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{nba.reasoning}</p>
              {/* Alternatives */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Alternatives:</span>
                {nba.alternativeActions.map((alt, ai) => (
                  <button key={ai} className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors capitalize">
                    {alt.type}: {alt.description.slice(0, 30)}…
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0 space-y-2">
              <p className="text-lg font-bold text-primary">${nba.expectedROI.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Expected ROI</p>
              <button className="rounded-xl gradient-sita px-4 py-1.5 text-[11px] font-semibold text-primary-foreground flex items-center gap-1 ml-auto">
                {nba.autoExecutable ? <><Zap className="h-3 w-3" /> Auto-Execute</> : <><ArrowRight className="h-3 w-3" /> Execute</>}
              </button>
            </div>
          </div>
        </SitaCard>
      </motion.div>
    ))}
  </div>
);

const DigitalTwinsView = ({ twins }: { twins: BusinessDigitalTwin[] }) => (
  <div className="space-y-3">
    {twins.map((twin, i) => (
      <motion.div key={twin.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
        <SitaCard className="p-5" hover>
          <div className="flex items-start gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
              twin.healthScore >= 70 ? "bg-trust-safe/10 text-trust-safe" :
              twin.healthScore >= 40 ? "bg-urgency-high/10 text-urgency-high" :
              "bg-destructive/10 text-destructive"
            }`}>
              {twin.healthScore}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{twin.entityName}</p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground capitalize">{twin.entityType}</span>
                {twin.predictedChurnRisk > 0.5 && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-semibold text-destructive">
                    {Math.round(twin.predictedChurnRisk * 100)}% churn risk
                  </span>
                )}
              </div>

              {/* Signal bars */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                {twin.signals.map((sig) => (
                  <div key={sig.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">{sig.name}</span>
                      <span className={`text-[10px] font-medium ${
                        sig.trend === "up" ? "text-trust-safe" : sig.trend === "down" ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        {sig.value} {sig.trend === "up" ? "↑" : sig.trend === "down" ? "↓" : "→"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border">
                      <div className={`h-full rounded-full transition-all ${
                        sig.value >= 70 ? "bg-trust-safe" : sig.value >= 40 ? "bg-accent" : "bg-destructive"
                      }`} style={{ width: `${sig.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended actions */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {twin.recommendedActions.slice(0, 3).map((a, ai) => (
                  <span key={ai} className="rounded-lg bg-primary/5 px-2 py-0.5 text-[10px] text-primary font-medium">{a}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-foreground">${twin.predictedRevenue30d.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">30d forecast</p>
            </div>
          </div>
        </SitaCard>
      </motion.div>
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────

const AutopilotCommandCenter = ({ config, onConfigUpdate, onOpenWizard }: AutopilotCommandCenterProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const dashboard = useMemo(() => buildDashboard(config), [config]);
  const [playbooks, setPlaybooks] = useState(dashboard.playbooks);

  const stats = useMemo(() => {
    const feed = dashboard.activityFeed;
    const activeCount = playbooks.filter(p => p.status === "active").length;
    const totalRecovered = playbooks.reduce((s, p) => s + p.metrics.revenueRecovered, 0);
    const totalGenerated = playbooks.reduce((s, p) => s + p.metrics.revenueGenerated, 0);
    const totalTime = playbooks.reduce((s, p) => s + p.metrics.timeSavedHours, 0);
    return {
      ...dashboard.stats,
      activePlaybooksCount: activeCount,
      totalRevenueRecovered: totalRecovered,
      totalRevenueGenerated: totalGenerated,
      totalTimeSavedHours: totalTime,
      healthScore: Math.min(100, 40 + activeCount * 10 + Math.round(totalRecovered / 1000)),
    };
  }, [playbooks, dashboard]);

  const handleTogglePlaybook = (id: PlaybookId) => {
    const pb = playbooks.find(p => p.id === id);
    if (!pb) return;
    const updated = pb.status === "active" ? pausePlaybook(playbooks, id) : activatePlaybook(playbooks, id);
    setPlaybooks(updated);
    const activeIds = updated.filter(p => p.status === "active").map(p => p.id);
    onConfigUpdate({ ...config, activePlaybooks: activeIds });
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "playbooks", label: "Playbooks" },
    { key: "activity", label: "Activity Feed" },
    { key: "nba", label: "Next Best Actions" },
    { key: "twins", label: "Digital Twins" },
  ];

  return (
    <div className="space-y-6">
      <SitaPageHeader
        title="Autopilot Command Center"
        subtitle="Your business runs automatically — monitor, approve, and optimize from one place"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={onOpenWizard} className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Settings className="h-3 w-3" /> Reconfigure
            </button>
            <span className="rounded-full bg-trust-safe/10 px-3 py-1 text-[10px] font-semibold text-trust-safe flex items-center gap-1">
              <Zap className="h-3 w-3" /> {stats.activePlaybooksCount} Active
            </span>
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Revenue Recovered" value={`$${stats.totalRevenueRecovered.toLocaleString()}`} sub="Autopilot collections" trend="up" icon={DollarSign} />
        <KPITile label="Revenue Generated" value={`$${stats.totalRevenueGenerated.toLocaleString()}`} sub="Upsells & reactivations" trend="up" icon={TrendingUp} />
        <KPITile label="Time Saved" value={`${stats.totalTimeSavedHours}h`} sub="Automated tasks" icon={Clock} />
        <KPITile label="Pending Approvals" value={String(stats.pendingApprovals)} sub="Need your review" icon={Shield} />
        <KPITile label="Health Score" value={`${stats.healthScore}/100`} sub={`${stats.streakDays}-day streak`} trend="up" icon={Activity} />
      </div>

      <SitaTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick approval cards */}
          {dashboard.activityFeed.filter(e => e.requiresAttention).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-urgency-high" /> Requires Your Attention
              </h3>
              {dashboard.activityFeed.filter(e => e.requiresAttention).map((ev, i) => {
                const Icon = statusIcon[ev.status] || Activity;
                return (
                  <motion.div key={ev.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <SitaCard className="p-4 border-urgency-high/20" hover>
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 shrink-0 ${statusColor[ev.status]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{ev.entityName}</p>
                          <p className="text-[11px] text-muted-foreground">{ev.description}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button className="rounded-lg bg-trust-safe/10 px-3 py-1 text-[10px] font-semibold text-trust-safe hover:bg-trust-safe/20">Approve</button>
                          <button className="rounded-lg bg-destructive/10 px-3 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/20">Dismiss</button>
                        </div>
                      </div>
                    </SitaCard>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Top NBA */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> Top Next Best Actions
            </h3>
            <NBAView actions={dashboard.nextBestActions.slice(0, 3)} />
          </div>

          {/* Recent activity */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent Activity
            </h3>
            <ActivityFeedView events={dashboard.activityFeed.slice(0, 5)} />
          </div>
        </div>
      )}

      {activeTab === "playbooks" && <PlaybooksView playbooks={playbooks} onToggle={handleTogglePlaybook} />}
      {activeTab === "activity" && <ActivityFeedView events={dashboard.activityFeed} />}
      {activeTab === "nba" && <NBAView actions={dashboard.nextBestActions} />}
      {activeTab === "twins" && <DigitalTwinsView twins={dashboard.digitalTwins} />}

      <LiveAdvisorCard
        advisor="business"
        intent="autopilot_intelligence"
        demoName="Autopilot AI"
        demoRole="Revenue Automation Intelligence"
        demoConfidence="High"
        demoRecommendation={`${stats.activePlaybooksCount} playbooks active. $${(stats.totalRevenueRecovered + stats.totalRevenueGenerated).toLocaleString()} total impact detected. Top priority: TechVentures $15K overdue — call recommended (78% confidence). ${stats.pendingApprovals} actions awaiting your approval.`}
        demoReasoning="Based on active playbook performance, next-best-action scoring, and digital twin health signals."
      />
    </div>
  );
};

export default AutopilotCommandCenter;
