import { useAuth } from "@/contexts/AuthContext";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Boardroom Experience
// Where advisor voices become one governed plan
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaMetric } from "@/platform/sita/components/sita/SitaCard";
import { PrepPack } from "@/platform/sita/components/sita/primitives/PrepPack";
import { ScenarioComparison } from "@/platform/sita/components/sita/primitives/ScenarioComparison";
import { ConfidenceBand } from "@/platform/sita/components/sita/primitives/ConfidenceBand";
import { ExecutionTracker } from "@/platform/sita/components/sita/primitives/ExecutionTracker";
import { VotingCard } from "@/platform/sita/components/sita/primitives/VotingCard";
import { EvidenceChain, type EvidenceNode } from "@/platform/sita/components/sita/primitives/EvidenceChain";
import { ScenarioFork } from "@/platform/sita/components/sita/primitives/ScenarioFork";
import { DecisionSeal } from "@/platform/sita/components/sita/primitives/DecisionSeal";
import { SentimentPulse } from "@/platform/sita/components/sita/primitives/SentimentPulse";
import { TrustDebtPanel, ExecutionDebtHeatmap, DragIndexRadar, ReadinessGauge, DelegationRegistryTable } from "@/platform/governance/components/governance";
import { KPITile, RiskCard, OpportunityCard, EmptyState, SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { StateBadge, StateStep } from "@/platform/sita/components/sita/StateBadge";
import { ConfidenceLadder } from "@/platform/sita/components/sita/AdvisorComponents";
import { WarRoomEntryCeremony } from "@/platform/sita/components/sita/WarRoomEntryCeremony";
import { WarRoomConfidenceRadar } from "@/platform/sita/components/sita/WarRoomConfidenceRadar";
import { WarRoomDisagreementTheater } from "@/platform/sita/components/sita/WarRoomDisagreementTheater";
import { WarRoomPresentation } from "@/platform/sita/components/sita/WarRoomPresentation";
import { useOSRuntime } from "@/platform/sita/hooks/useOSRuntime";
import { useOSOrchestration } from "@/platform/orchestration/hooks/useOSOrchestration";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPerspectiveConfig, type PerspectiveLevel } from "@/lib/advisor-protocol";
import {
  BarChart3, AlertTriangle, Shield, Clock, Sparkles, Brain, ChevronDown, ChevronUp,
  RefreshCw, FileCheck, Database, Hash, ArrowRight, CheckCircle, Lightbulb,
  Home, Briefcase, DollarSign, Zap, Activity, ShieldAlert, Eye, XCircle,
  Maximize2, Minimize2, ChevronLeft, ChevronRight, Pause, Play, Scale,
  GitCompare, Lock, Target, TrendingUp, MessageSquare, Calendar
} from "lucide-react";
import { useBoardroomPacket } from "@/platform/boardroom/hooks/use-boardroom";
import type { BoardroomSession, BoardroomDecision, StrategicInsight } from "@/packages/boardroom-contracts";
import { advisors, recommendations, synthesis, approvals, proofHistory } from "@/platform/advisors/hooks/useAdvisorMissionControl";
import type {
  BoardroomType, BoardroomPacket, BoardroomContentSection, MetricCardData,
  TableData, NarrativeData, AlertData, ActionItemData, ChartData, BOARDROOM_META
} from "@/lib/boardroom/types";
import { BOARDROOM_META as META } from "@/lib/boardroom/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ConfidenceEnvelope, ContradictionReport, GroundingReport } from "@/lib/no-hallucination/types";
import type { Receipt, TrustState, ExecutionEnvelope, BoardroomSection as ContractBoardroomSection, AdvisorTrack, Disagreement, DecisionRecord } from "@/packages/contracts";
import type { ProofPack } from "@/packages/proof-model";
import type { AdvisorConfig } from "@/packages/advisor-config";
import { cn } from "@/lib/utils";
import { useBoardroomData } from "@/platform/boardroom/hooks/use-boardroom-data";
import { useOpportunitySignals, usePriorityStacks, useDigestCompilations } from "@/hooks/useCAIData";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { BoardroomSeedSampleButton } from "@/platform/sita/components/sita/BoardroomSeedSampleButton";

// ── Section Renderers (preserved from original) ───────────────

const MetricCardGrid = ({ data, title }: { data: MetricCardData[]; title: string }) => {
  return (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <KPITile label={m.label} value={m.value} trend={m.trend} sub={m.trendValue || m.source} />
        </motion.div>
      ))}
    </div>
  </div>
  );
};

const TableSection = ({ data, title }: { data: TableData; title: string }) => (
  <SitaCard hover={false}>
    <SitaCardTitle sub={`Source: ${data.source}`}>{title}</SitaCardTitle>
    <div className="mt-3 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {data.columns.map(col => <TableHead key={col.key} className="text-[11px] font-semibold uppercase tracking-wider">{col.label}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, i) => (
            <TableRow key={i}>
              {data.columns.map(col => (
                <TableCell key={col.key} className="text-sm">
                  {(col.key === "status" || col.key === "priority" || col.key === "severity") ? (
                    <StatusBadge value={String(row[col.key])} />
                  ) : String(row[col.key] ?? "—")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </SitaCard>
);

const StatusBadge = ({ value }: { value: string }) => {
  const colors: Record<string, string> = {
    paid: "bg-primary/10 text-primary", overdue: "bg-destructive/10 text-destructive",
    pending: "bg-amber-500/10 text-amber-600", upcoming: "bg-blue-500/10 text-blue-600",
    scheduled: "bg-primary/10 text-primary", new: "bg-primary/10 text-primary",
    contacted: "bg-blue-500/10 text-blue-600", qualified: "bg-accent/10 text-accent",
    cooling: "bg-destructive/10 text-destructive", high: "bg-destructive/10 text-destructive",
    medium: "bg-amber-500/10 text-amber-600", low: "bg-blue-500/10 text-blue-600",
    "in-progress": "bg-blue-500/10 text-blue-600", open: "bg-destructive/10 text-destructive",
    resolved: "bg-primary/10 text-primary",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${colors[value] || "bg-secondary text-muted-foreground"}`}>{value}</span>;
};

const NarrativeBlock = ({ data, title }: { data: NarrativeData; title: string }) => (
  <SitaCard hover={false} glow>
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-accent/10 p-2.5 shrink-0"><Brain className="h-5 w-5 text-accent" /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <ConfidencePill value={data.confidence} />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{data.text}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {data.citations.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground">
              <Database className="h-2.5 w-2.5" />{c}
            </span>
          ))}
        </div>
      </div>
    </div>
  </SitaCard>
);

const AlertSection = ({ data, title }: { data: AlertData[]; title: string }) => (
  <div>
    <SitaSectionHeader title={title} />
    <div className="mt-3 space-y-2.5">
      {data.map((alert, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
          className={`rounded-xl border p-4 transition-all hover:shadow-card-hover ${
            alert.severity === "critical" ? "border-destructive/20 bg-destructive/5" :
            alert.severity === "warning" ? "border-amber-500/20 bg-amber-500/5" :
            "border-border bg-card"
          }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
              alert.severity === "critical" ? "text-destructive" : alert.severity === "warning" ? "text-amber-500" : "text-muted-foreground"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              {alert.suggestedAction && (
                <button className="mt-2 inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20 transition-colors">
                  {alert.suggestedAction} <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
            <span className="text-[9px] text-muted-foreground shrink-0">{alert.source}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const ActionListSection = ({ items }: { items: ActionItemData[] }) => (
  <SitaCard hover={false}>
    <SitaCardTitle sub={`${items.length} items sorted by priority`}>Action Items</SitaCardTitle>
    <div className="mt-4 space-y-2">
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5 hover:bg-secondary/50 transition-colors cursor-pointer group">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-xs font-bold text-primary-foreground shrink-0 ${
            item.priority === "critical" ? "bg-destructive" : item.priority === "high" ? "bg-amber-500" : "gradient-sita"
          }`}>{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{item.text}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {item.assignee && <span className="text-[10px] text-muted-foreground">{item.assignee}</span>}
              {item.dueDate && <span className="text-[10px] text-muted-foreground">· Due {item.dueDate}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${
              item.priority === "critical" ? "bg-destructive/10 text-destructive" :
              item.priority === "high" ? "bg-amber-500/10 text-amber-600" :
              "bg-secondary text-muted-foreground"
            }`}>{item.priority}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
        </motion.div>
      ))}
    </div>
  </SitaCard>
);

const ConfidencePill = ({ value }: { value: number }) => {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "bg-primary/10 text-primary" : pct >= 65 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}><Shield className="h-2.5 w-2.5" />{pct}%</span>;
};

// ── NEW: Advisor Voice Track ──────────────────────────────────

const AdvisorVoiceTrack = ({ type }: { type: BoardroomType }) => {
  const { isDemo } = useAuth();
  {
    return (
      <div className="space-y-3">
        <SitaSectionHeader title="Advisor Voices" subtitle="Connect advisors to see live perspectives" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
          <Brain className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No live advisors connected</p>
          <p className="text-xs text-muted-foreground mt-1">Advisor voices appear when real advisor sessions are active.</p>
        </div>
      </div>
    );
  }

  const relevantAdvisors = type === "financial-health" || type === "pipeline-review"
    ? advisors.filter(a => ["money", "treasury", "business", "sales", "risk"].includes(a.domain))
    : type === "household-ops"
    ? advisors.filter(a => ["concierge", "family", "calendar"].includes(a.domain))
    : advisors.slice(0, 5);

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Advisor Voices" subtitle="Each advisor's perspective on this review" />
      <div className="space-y-2">
        {relevantAdvisors.map((advisor, i) => {
          const rec = recommendations.find(r => r.advisorId === advisor.id);
          return (
            <motion.div key={advisor.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="group rounded-xl border border-border/60 bg-card/80 p-4 hover:border-primary/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{advisor.name}</p>
                    <div className={`h-2 w-2 rounded-full ${advisor.status === "active" ? "bg-trust-safe" : "bg-muted-foreground"}`} />
                    <span className={`text-[11px] font-mono ${advisor.confidence >= 0.85 ? "text-trust-safe" : advisor.confidence >= 0.65 ? "text-accent" : "text-muted-foreground"}`}>
                      {Math.round(advisor.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec?.title || advisor.topMove}</p>
                  {advisor.uncertainty && (
                    <p className="text-[11px] text-accent flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {advisor.uncertainty}
                    </p>
                  )}
                </div>
                {advisor.pendingApprovals > 0 && (
                  <Badge variant="outline" className="text-[9px] bg-trust-approval/10 text-trust-approval border-trust-approval/20 shrink-0">
                    {advisor.pendingApprovals} approval{advisor.pendingApprovals > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ── NEW: Disagreement Card ────────────────────────────────────

const DisagreementCards = () => {
  const { isDemo } = useAuth();
  return null;
  
  const disagreements = synthesis.filter(s => s.disagreements && s.disagreements.length > 0);
  if (disagreements.length === 0) return null;

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Visible Disagreements" subtitle="Where advisors see different paths" />
      {disagreements.map(s => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-accent/20 bg-accent/5 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">{s.title}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {s.participants.map(p => <Badge key={p.name} variant="outline" className="text-[9px]">{p.name}</Badge>)}
          </div>
          {s.disagreements?.map((d, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
              <AlertTriangle className="h-3 w-3 text-accent shrink-0 mt-0.5" /> {d}
            </p>
          ))}
          <p className="text-xs text-foreground mt-2 font-medium">Recommendation: {s.primaryRecommendation}</p>
        </motion.div>
      ))}
    </div>
  );
};

// ── NEW: Decision Memory Strip ────────────────────────────────

const DecisionMemoryStrip = () => {
  const { isDemo } = useAuth();
  return null;
  
  const decisions = proofHistory.filter(p => p.type === "approval" || p.type === "execution").slice(0, 5);

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Decision Memory" subtitle="Recent decisions and their outcomes" />
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {decisions.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="flex shrink-0 flex-col rounded-xl border border-border bg-card/80 p-3 min-w-[200px] max-w-[240px]"
          >
            <p className="text-xs font-semibold text-foreground truncate">{d.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{d.whatChanged}</p>
            <div className="flex items-center gap-2 mt-2">
              <TrustBadge level={d.outcome === "verified" ? "verified" : d.outcome === "executed" || d.outcome === "accepted" ? "safe" : "review"} size="sm" />
              <span className="text-[9px] text-muted-foreground">{d.createdAt}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── NEW: Carryover Panel ──────────────────────────────────────

const CarryoverPanel = () => {
  const unresolved = [
    { id: "c1", title: "Collection follow-up on Invoice #1042", domain: "Business", since: "2 weeks", impact: "high" },
    { id: "c2", title: "School enrollment decision", domain: "Concierge", since: "5 days", impact: "medium" },
    { id: "c3", title: "Reserve target shortfall", domain: "Money", since: "3 weeks", impact: "high" },
  ];

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Carryover / Unresolved" subtitle="Items carried forward from previous reviews" />
      <div className="space-y-2">
        {unresolved.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all hover:shadow-card-hover",
              item.impact === "high" ? "border-destructive/15 bg-destructive/3" : "border-border bg-card/50"
            )}
          >
            <RefreshCw className={cn("h-4 w-4 shrink-0", item.impact === "high" ? "text-destructive" : "text-muted-foreground")} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{item.domain}</span>
                <span className="text-[10px] text-muted-foreground">· Open {item.since}</span>
              </div>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold",
              item.impact === "high" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
            )}>{item.impact}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── NEW: Proof Summary Board ──────────────────────────────────

const ProofSummaryBoard = () => {
  const { isDemo } = useAuth();
  return null;
  
  const verified = proofHistory.filter(p => p.outcome === "verified").length;
  const executed = proofHistory.filter(p => p.outcome === "executed" || p.outcome === "accepted").length;
  const failed = proofHistory.filter(p => p.outcome === "rolled-back" || p.outcome === "rejected").length;

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Audit trail from this review period">Proof Summary</SitaCardTitle>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-trust-verified/5 border border-trust-verified/10 p-3 text-center">
          <p className="font-display text-lg font-bold text-trust-safe">{verified}</p>
          <p className="text-[10px] text-muted-foreground">Verified</p>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">{executed}</p>
          <p className="text-[10px] text-muted-foreground">Executed</p>
        </div>
        <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3 text-center">
          <p className="font-display text-lg font-bold text-destructive">{failed}</p>
          <p className="text-[10px] text-muted-foreground">Failed / Rolled Back</p>
        </div>
      </div>
    </SitaCard>
  );
};

// ── Confidence & Provenance ───────────────────────────────────

const PacketHeader = ({ packet, onRegenerate, variant }: { packet: BoardroomPacket; onRegenerate: () => void; variant?: string }) => {
  const meta = META[packet.type];
  const genTime = new Date(packet.generatedAt);
  const { isDemo } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card p-6" data-testid="boardroom-summary">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{meta.label}</h2>
            <p className="text-xs text-muted-foreground">{meta.purpose}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            data-testid="boardroom-mode-label"
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              isDemo ? "bg-accent/10 text-accent" : "bg-trust-safe/10 text-trust-safe"
            )}
          >
            {isDemo ? "Demo" : "Live"}
          </span>
          <ConfidencePill value={packet.confidence} />
          {variant && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary capitalize">
              {variant} View
            </span>
          )}
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {genTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
            <Hash className="h-3 w-3" />{packet.packetId}
          </span>
          <BoardroomSeedSampleButton />
          <button onClick={onRegenerate} data-testid="boardroom-refresh" className="rounded-lg bg-card border border-border p-1.5 hover:bg-secondary transition-colors" title="Regenerate">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/3 blur-3xl" />
    </div>
  );
};

const StaleWarnings = ({ warnings }: { warnings: string[] }) => {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <p className="text-xs font-semibold text-amber-600">Stale Data Detected</p>
      </div>
      <div className="space-y-1">{warnings.map((w, i) => <p key={i} className="text-[11px] text-amber-600/80">• {w}</p>)}</div>
    </div>
  );
};

const ContradictionMarkers = ({ report }: { report?: ContradictionReport }) => {
  if (!report || report.contradictions.length === 0) return null;
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="h-4 w-4 text-amber-500" />
        <p className="text-xs font-semibold text-amber-600">Data Contradictions</p>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">{report.contradictions.length}</span>
      </div>
      <div className="space-y-2">
        {report.contradictions.map((c, i) => (
          <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] ${c.severity === "material" ? "bg-destructive/5 border border-destructive/10" : "bg-secondary/40"}`}>
            <XCircle className={`h-3 w-3 mt-0.5 shrink-0 ${c.severity === "material" ? "text-destructive" : "text-amber-500"}`} />
            <div>
              <span className="font-semibold text-foreground">{c.field}</span>
              <span className="text-muted-foreground"> — {c.sourceA}: </span>
              <span className="font-mono text-foreground">{c.valueA}</span>
              <span className="text-muted-foreground"> vs {c.sourceB}: </span>
              <span className="font-mono text-foreground">{c.valueB}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConfidenceEnvelopePanel = ({ envelope }: { envelope?: ConfidenceEnvelope }) => {
  const [open, setOpen] = useState(false);
  if (!envelope) return null;
  const riskColors: Record<string, string> = { low: "bg-primary/10 text-primary", medium: "bg-amber-500/10 text-amber-600", high: "bg-destructive/10 text-destructive", "critical-truth": "bg-destructive/10 text-destructive" };
  return (
    <div className="rounded-xl border border-border bg-card/50">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/30 transition-colors rounded-xl">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Truth & Confidence Envelope</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskColors[envelope.riskClass]}`}>{envelope.riskClass}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-border px-4 pb-4 space-y-3 pt-3">
          {envelope.reasons.length > 0 && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Reasons</p>{envelope.reasons.map((r, i) => <p key={i} className="text-[11px] text-muted-foreground">• {r}</p>)}</div>}
          {envelope.missingInputs.length > 0 && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1">Missing Inputs</p><div className="flex flex-wrap gap-1">{envelope.missingInputs.map((m, i) => <span key={i} className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive">{m}</span>)}</div></div>}
          {envelope.staleInputs.length > 0 && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1">Stale Inputs</p><div className="flex flex-wrap gap-1">{envelope.staleInputs.map((s, i) => <span key={i} className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600">{s}</span>)}</div></div>}
        </motion.div>
      )}
    </div>
  );
};

const ProvenancePanel = ({ packet }: { packet: BoardroomPacket }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card/50">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-3.5 text-left hover:bg-secondary/30 transition-colors rounded-xl">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Provenance & Receipt</span>
          <span className="text-[10px] text-muted-foreground">{packet.dataSources.length} sources · {packet.receipt.generationTimeMs}ms</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-border px-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-2 mt-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Data Sources</p>
              <div className="space-y-1.5">
                {packet.dataSources.map(ds => (
                  <div key={ds.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                    <div><p className="text-xs font-medium text-foreground">{ds.name}</p><p className="text-[10px] text-muted-foreground">{ds.domain} · {ds.recordCount} records</p></div>
                    <span className="text-[10px] text-muted-foreground">{new Date(ds.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Generation Receipt</p>
              <div className="rounded-lg bg-secondary/30 p-3 space-y-1.5">
                <div className="flex justify-between"><span className="text-[11px] text-muted-foreground">Receipt ID</span><span className="text-[11px] font-mono text-foreground">{packet.receipt.receiptId}</span></div>
                <div className="flex justify-between"><span className="text-[11px] text-muted-foreground">Hash</span><span className="text-[11px] font-mono text-foreground">{packet.receipt.hash}</span></div>
                <div className="flex justify-between"><span className="text-[11px] text-muted-foreground">Time</span><span className="text-[11px] text-foreground">{packet.receipt.generationTimeMs}ms</span></div>
                <div className="flex justify-between"><span className="text-[11px] text-muted-foreground">Confidence</span><span className="text-[11px] text-foreground">{Math.round(packet.confidence * 100)}%</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const OpportunitiesGrid = ({ opportunities }: { opportunities: BoardroomPacket["opportunities"] }) => {
  if (opportunities.length === 0) return null;
  return (
    <div>
      <SitaSectionHeader title="Opportunities" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {opportunities.map((opp, i) => (
          <motion.div key={opp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <SitaCard hover={false} className="p-4" lane="action">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-accent/10 p-2"><Lightbulb className="h-4 w-4 text-accent" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{opp.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opp.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold text-accent">{opp.projectedValue}</span>
                    <ConfidencePill value={opp.confidence} />
                  </div>
                </div>
              </div>
            </SitaCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Section Dispatcher ────────────────────────────────────────

const RenderSection = ({ section }: { section: BoardroomContentSection }) => {
  switch (section.type) {
    case "metric-card": return <MetricCardGrid data={section.data as MetricCardData[]} title={section.title} />;
    case "table": return <TableSection data={section.data as TableData} title={section.title} />;
    case "narrative": return <NarrativeBlock data={section.data as NarrativeData} title={section.title} />;
    case "alert": return <AlertSection data={section.data as AlertData[]} title={section.title} />;
    case "action-list": return <ActionListSection items={section.data as ActionItemData[]} />;
    default: return null;
  }
};

// ── Packet View with Advisor Enhancements ─────────────────────

const PacketView = ({ type, perspective = "owner" }: { type: BoardroomType; perspective?: PerspectiveLevel }) => {
  const { isDemo } = useAuth();
  const { packet, isLoading, regenerate } = useBoardroomPacket(type);
  const config = getPerspectiveConfig(perspective);
  const {
    pendingApprovals,
    activeGoals,
    overdueTasks,
    recentProofs,
    notifications,
    recommendations,
    boardroomItems,
    decisionReceipts,
    unreadNotifications,
    newRecommendations,
  } = useBoardroomData();

  if (isLoading || !packet) return <div className="p-8 text-center text-muted-foreground">Generating boardroom packet…</div>;

  const filteredSections = packet.sections.filter(section => {
    if (section.type === "table" && !config.showDetailTables) return false;
    if (section.type === "metric-card") return config.showMetricCards;
    if (section.type === "narrative") return config.showNarratives;
    if (section.type === "alert") return config.showAlerts;
    if (section.type === "action-list") return config.showActionItems;
    return true;
  });

  const limitedSections = filteredSections.map(section => {
    if (section.type === "metric-card" && Array.isArray(section.data)) return { ...section, data: (section.data as MetricCardData[]).slice(0, config.maxMetrics) };
    if (section.type === "alert" && Array.isArray(section.data)) return { ...section, data: (section.data as AlertData[]).slice(0, config.maxAlerts) };
    if (section.type === "action-list" && Array.isArray(section.data)) return { ...section, data: (section.data as ActionItemData[]).slice(0, config.maxActionItems) };
    return section;
  });

  // ── Live-data presence flags (drives War Room visibility in live mode) ──
  const hasDisagreementData = boardroomItems.some(
    (i: any) => Array.isArray(i.advisor_summaries) && i.advisor_summaries.length >= 2
  );
  const hasReceipt = decisionReceipts.length > 0;
  const hasRecommendations = recommendations.length > 0;
  const hasApprovals = pendingApprovals.length > 0;
  const latestReceipt: any = decisionReceipts[0];

  // Build PrepPack data from real DB queries
  const prepPriorities = pendingApprovals.slice(0, 4).map((a: Record<string, any>) => ({
    title: a.title || a.summary || "Untitled approval",
    detail: a.summary || a.description || `${a.priority || "normal"} priority · ${a.domain || "general"}`,
    domain: (a.domain || "general") as "business" | "money" | "concierge" | "general",
    urgency: (a.priority === "high" || a.priority === "critical" ? "critical" : a.priority === "normal" ? "high" : "medium") as "critical" | "high" | "medium" | "low",
  }));

  const prepCarryovers = overdueTasks.slice(0, 4).map((t: Record<string, any>) => ({
    title: t.title,
    detail: t.due_at ? `Overdue since ${new Date(t.due_at).toLocaleDateString()}` : "No due date",
    domain: (t.domain || "general") as "business" | "money" | "concierge" | "general",
    urgency: (t.priority === "high" ? "high" : "medium") as "critical" | "high" | "medium" | "low",
  }));

  const prepDecisions = pendingApprovals.filter((a: Record<string, any>) => a.priority !== "high" && a.priority !== "critical").slice(0, 2).map((a: Record<string, any>) => ({
    title: a.title || a.summary || "Pending decision",
    detail: a.summary || a.description || "Ready for decision",
    domain: (a.domain || "general") as "business" | "money" | "concierge" | "general",
    urgency: "medium" as const,
  }));

  const whatChanged = [
    unreadNotifications > 0 ? `${unreadNotifications} unread notification${unreadNotifications === 1 ? "" : "s"}` : null,
    newRecommendations > 0 ? `${newRecommendations} new REX recommendation${newRecommendations === 1 ? "" : "s"}` : null,
    activeGoals.length > 0 ? `${activeGoals.length} active goals tracked` : null,
    hasApprovals ? `${pendingApprovals.length} approval${pendingApprovals.length === 1 ? "" : "s"} pending` : null,
    overdueTasks.length > 0 ? `${overdueTasks.length} overdue tasks need attention` : null,
    decisionReceipts.length > 0 ? `${decisionReceipts.length} sealed decision${decisionReceipts.length === 1 ? "" : "s"}` : null,
  ].filter(Boolean) as string[];

  return (
    <motion.div key={type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      <PacketHeader packet={packet} onRegenerate={regenerate} variant={config.label} />

      <StaleWarnings warnings={packet.staleDataWarnings} />
      {config.showContradictions && <ContradictionMarkers report={packet.contradictions} />}

      {/* ── Boardroom 2.0: Pre-Session Prep Pack (wired to DB) ── */}
      <PrepPack
        title={`Prep Pack — ${META[type].label}`}
        generatedAt={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        confidence={Math.round(packet.confidence * 100)}
        whatChanged={whatChanged}
        priorities={prepPriorities.length > 0 ? prepPriorities : [
          { title: "No pending priorities", detail: "All approvals resolved", domain: "general", urgency: "low" },
        ]}
        unresolvedFromLast={prepCarryovers}
        readyDecisions={prepDecisions}
      />

      {/* Executive Summary section */}
      {limitedSections.filter(s => s.type === "narrative").map(s => <RenderSection key={s.id} section={s} />)}

      {/* Advisor Voice Track — signature boardroom feature */}
      <AdvisorVoiceTrack type={type} />

      {/* Disagreement Cards */}
      <DisagreementCards />

      {/* ── Boardroom 2.0: Confidence Bands ── */}
      <ConfidenceBand
        title="Revenue Projection — Confidence Band"
        subtitle="Weekly revenue with 80% confidence intervals"
        confidenceLevel={80}
        points={[
          { label: "W1", value: 6800, low: 6200, high: 7400 },
          { label: "W2", value: 7200, low: 6500, high: 7900 },
          { label: "W3", value: 7900, low: 7000, high: 8800 },
          { label: "W4", value: 8420, low: 7600, high: 9200 },
          { label: "W5", value: 8800, low: 7800, high: 9800, isProjection: true },
          { label: "W6", value: 9200, low: 7500, high: 10900, isProjection: true },
        ]}
        unit="$"
      />

      {/* ── Boardroom 2.0: Scenario Comparison ── */}
      <ScenarioComparison
        title="Strategic Scenarios — What-If Analysis"
        scenarios={[
          {
            id: "aggressive", title: "Aggressive Growth", description: "Max outbound, hire contractor, push all proposals",
            confidence: 72, risk: "high",
            metrics: [
              { label: "Revenue", value: "$12.4K", delta: "+48%", trend: "up" },
              { label: "Cash Runway", value: "3.2 mo", delta: "-1.6", trend: "down" },
            ],
            pros: ["Fastest revenue growth", "Pipeline doubles in 30 days"],
            cons: ["Cash pressure increases", "Team bandwidth risk"],
          },
          {
            id: "balanced", title: "Balanced Execution", description: "Close existing deals, moderate outbound, hold hiring",
            confidence: 88, risk: "low", recommended: true,
            metrics: [
              { label: "Revenue", value: "$9.8K", delta: "+17%", trend: "up" },
              { label: "Cash Runway", value: "4.8 mo", delta: "—", trend: "flat" },
            ],
            pros: ["Sustainable growth", "Maintains cash safety", "Low risk"],
            cons: ["Slower pipeline expansion"],
          },
          {
            id: "conservative", title: "Cash Preservation", description: "Focus collections, cut waste, pause outbound",
            confidence: 94, risk: "low",
            metrics: [
              { label: "Revenue", value: "$8.2K", delta: "-2%", trend: "down" },
              { label: "Cash Runway", value: "6.1 mo", delta: "+1.3", trend: "up" },
            ],
            pros: ["Maximum cash safety", "Waste eliminated", "Reserve targets met"],
            cons: ["Pipeline stagnates", "Growth slows"],
          },
        ]}
      />

      {/* Metrics & data sections */}
      {limitedSections.filter(s => s.type !== "narrative").map(s => <RenderSection key={s.id} section={s} />)}

      {/* ── War Room: Confidence Radar (demo OR has recommendations to score) ── */}
      {hasRecommendations ? (
        <WarRoomConfidenceRadar
          advisors={
            false
              ? advisors.slice(0, 6).map(a => ({
                  name: a.name,
                  confidence: Math.round(a.confidence * 100),
                  domain: a.domain,
                  color: a.domain === "business" ? "hsl(210, 60%, 55%)" : a.domain === "money" || a.domain === "treasury" ? "hsl(152, 55%, 48%)" : a.domain === "concierge" || a.domain === "family" ? "hsl(280, 50%, 55%)" : "hsl(265, 55%, 58%)",
                }))
              : recommendations.slice(0, 6).map((r: any) => ({
                  name: (r.role_key || r.title || "advisor").toString().slice(0, 18),
                  confidence: Math.round((Number(r.confidence) || 0.5) * 100),
                  domain: r.domain || "general",
                  color: r.domain === "business" ? "hsl(210, 60%, 55%)" : r.domain === "money" ? "hsl(152, 55%, 48%)" : r.domain === "concierge" ? "hsl(280, 50%, 55%)" : "hsl(265, 55%, 58%)",
                }))
          }
        />
      ) : (
        <EmptyState
          icon={Brain}
          title="Confidence Radar"
          description="Live advisor confidence appears once REX recommendations are generated."
        />
      )}

      {/* ── War Room: Disagreement Theater (demo OR boardroom_items with multiple advisor_summaries) ── */}
      {false ? (
        <WarRoomDisagreementTheater
          topic="Growth vs. Cash Preservation Strategy"
          sideA={{
            name: "Business Advisor", domain: "Revenue Growth", color: "hsl(210, 60%, 55%)",
            position: "Push aggressive outbound — pipeline is healthy enough",
            reasoning: "Current conversion rate of 34% supports expansion. Three qualified leads are warming up.",
            confidence: 72,
            evidence: ["34% conversion rate trending up", "3 warm leads in pipeline", "Competitor just lost key accounts"],
          }}
          sideB={{
            name: "Money Advisor", domain: "Cash Safety", color: "hsl(152, 55%, 48%)",
            position: "Preserve cash — $5,400 overdue receivables create risk",
            reasoning: "With $5,400 overdue and 2 invoices at risk, expanding spend is premature until collections improve.",
            confidence: 85,
            evidence: ["$5,400 overdue receivables", "Reserve target at 78%", "Monthly burn exceeds comfortable threshold"],
          }}
          resolution="Balanced approach recommended: focus collections on overdue invoices while maintaining moderate outbound."
        />
      ) : hasDisagreementData ? (
        (() => {
          const item: any = boardroomItems.find((i: any) => Array.isArray(i.advisor_summaries) && i.advisor_summaries.length >= 2);
          const sums: any[] = item?.advisor_summaries || [];
          const a = sums[0] || {}; const b = sums[1] || {};
          return (
            <WarRoomDisagreementTheater
              topic={item?.title || "Boardroom Item"}
              sideA={{
                name: a.advisor || a.name || "Advisor A",
                domain: a.domain || item?.domain || "general",
                color: "hsl(210, 60%, 55%)",
                position: a.position || a.summary || "Position A",
                reasoning: a.reasoning || a.rationale || "—",
                confidence: Math.round((Number(a.confidence) || 0.6) * 100),
                evidence: Array.isArray(a.evidence) ? a.evidence : [],
              }}
              sideB={{
                name: b.advisor || b.name || "Advisor B",
                domain: b.domain || item?.domain || "general",
                color: "hsl(152, 55%, 48%)",
                position: b.position || b.summary || "Position B",
                reasoning: b.reasoning || b.rationale || "—",
                confidence: Math.round((Number(b.confidence) || 0.6) * 100),
                evidence: Array.isArray(b.evidence) ? b.evidence : [],
              }}
              resolution={item?.escalation_reason || "Awaiting owner decision."}
            />
          );
        })()
      ) : (
        <EmptyState
          icon={Scale}
          title="Disagreement Theater"
          description="Side-by-side advisor positions appear when a boardroom item has 2+ advisor summaries."
        />
      )}

      {/* ── War Room: Voting Card ── */}
      {false ? (
        <VotingCard
          question="Should we hire a contractor for the Q3 expansion project?"
          votes={[
            { advisorName: "Business", domain: "business", position: "for", confidence: 82, reasoning: "Revenue opportunity justifies cost" },
            { advisorName: "Money", domain: "finance", position: "against", confidence: 78, reasoning: "Cash runway too thin for new commitment" },
            { advisorName: "Strategy", domain: "strategy", position: "for", confidence: 71, reasoning: "Market window closing — act now" },
            { advisorName: "Risk", domain: "legal", position: "abstain", confidence: 60, reasoning: "Need more data on contractor terms" },
            { advisorName: "Concierge", domain: "concierge", position: "for", confidence: 65, reasoning: "Frees up owner time for family priorities" },
          ]}
        />
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="Voting Card"
          description="Live advisor voting appears when a boardroom item enters the vote stage."
        />
      )}

      {/* ── War Room: Sentiment Pulse ── */}
      {false ? (
        <SentimentPulse
          overallScore={0.42}
          sentiments={[
            { label: "Revenue Outlook", score: 0.65, source: "Pipeline analysis" },
            { label: "Cash Health", score: -0.15, source: "Cash flow model" },
            { label: "Client Sentiment", score: 0.55, source: "Communication analysis" },
            { label: "Operational Load", score: -0.35, source: "Task backlog" },
            { label: "Growth Momentum", score: 0.72, source: "Trend engine" },
          ]}
        />
      ) : (
        <EmptyState
          icon={Activity}
          title="Sentiment Pulse"
          description="Cross-domain sentiment will appear once signals are aggregated."
        />
      )}

      {/* ── War Room: Evidence Chain (demo OR latest decision receipt has proof_trail) ── */}
      {false ? (
        <EvidenceChain
          title="Revenue Growth Conclusion Chain"
          nodes={[
            { id: "1", label: "Stripe payment data — Q2 transactions", type: "source", confidence: 98, detail: "847 transactions, $12,450 total" },
            { id: "2", label: "CRM pipeline analysis", type: "source", confidence: 92, detail: "14 active opportunities, $42K total value" },
            { id: "3", label: "Revenue trend computed (+18% vs Q1)", type: "inference", confidence: 85, detail: "Based on Stripe + CRM cross-reference" },
            { id: "4", label: "Conversion rate validated against historical", type: "verification", confidence: 88 },
            { id: "5", label: "Owner confirmed $2.5K deal closed", type: "user-confirmed", confidence: 100, detail: "Manual confirmation on April 8" },
            { id: "6", label: "Balanced growth strategy recommended", type: "conclusion", confidence: 84, detail: "High confidence supported by verified data" },
          ]}
        />
      ) : hasReceipt && Array.isArray(latestReceipt?.proof_trail) && latestReceipt.proof_trail.length > 0 ? (
        <EvidenceChain
          title={latestReceipt?.approved_motion || "Decision Evidence Chain"}
          nodes={(latestReceipt.proof_trail as Array<Record<string, unknown>>).slice(0, 8).map((p, i) => ({
            id: String(p.id || i),
            label: String(p.label || p.title || `Step ${i + 1}`),
            type: ((p.type as EvidenceNode["type"]) || "source"),
            confidence: Math.round((Number(p.confidence) || 0.85) * 100),
            detail: (p.detail as string | undefined) || (p.summary as string | undefined),
          }))}
        />
      ) : (
        <EmptyState
          icon={Database}
          title="Evidence Chain"
          description="Source-to-conclusion lineage appears when a decision is sealed with proof_trail."
        />
      )}

      {/* ── War Room: Scenario Fork ── */}
      {false ? (
        <ScenarioFork
          titleA="Maintain Current Course"
          titleB="Accelerate Growth"
          recommendedScenario="A"
          metrics={[
            { label: "Monthly Revenue", valueA: "$8,420", valueB: "$12,400", delta: "+47%", direction: "up" },
            { label: "Cash Runway", valueA: "4.8 months", valueB: "3.2 months", delta: "-33%", direction: "down" },
            { label: "Team Bandwidth", valueA: "85%", valueB: "110%", delta: "+25%", direction: "down" },
            { label: "Customer Satisfaction", valueA: "94%", valueB: "87%", delta: "-7%", direction: "down" },
            { label: "Risk Score", valueA: "Low", valueB: "High", delta: "↑", direction: "down" },
          ]}
        />
      ) : (
        <EmptyState
          icon={GitCompare}
          title="Scenario Fork"
          description="Side-by-side scenario simulations appear when a boardroom item has simulation_state populated."
        />
      )}

      {/* ── War Room: Decision Seal (wired to latest boardroom_decision_receipts) ── */}
      {false ? (
        <DecisionSeal
          decision="Adopt balanced execution strategy for Q2"
          decidedBy="Owner (recommended by Business + Money Advisors)"
          timestamp={new Date().toLocaleString()}
          receiptHash="0x7a3f...e8b2c1d4"
          status="sealed"
        />
      ) : hasReceipt ? (
        <DecisionSeal
          decision={latestReceipt?.approved_motion || latestReceipt?.rationale_summary || "Sealed decision"}
          decidedBy="Owner"
          timestamp={latestReceipt?.created_at ? new Date(latestReceipt.created_at).toLocaleString() : "—"}
          receiptHash={`0x${String(latestReceipt?.id || "").replace(/-/g, "").slice(0, 16)}`}
          status="sealed"
        />
      ) : (
        <EmptyState
          icon={Lock}
          title="Decision Seal"
          description="The most recent sealed decision appears here once an approval ceremony completes."
        />
      )}

      {/* Confidence ladder */}
      {hasRecommendations ? (
        <div className="space-y-3">
          <SitaSectionHeader title="Confidence Ladder" subtitle="Advisor certainty levels for this review" />
          <SitaCard hover={false}>
            <ConfidenceLadder
              items={
                false
                  ? advisors.slice(0, 5).map(a => ({ label: a.name, confidence: a.confidence }))
                  : recommendations.slice(0, 5).map((r: any) => ({
                      label: (r.title || r.role_key || "recommendation").toString().slice(0, 32),
                      confidence: Number(r.confidence) || 0.5,
                    }))
              }
            />
          </SitaCard>
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="Confidence Ladder"
          description="Per-recommendation confidence levels appear when REX produces recommendations."
        />
      )}

      {/* Opportunities */}
      {config.showOpportunities && <OpportunitiesGrid opportunities={packet.opportunities} />}

      {/* Action Items */}
      {config.showActionItems && packet.actionItems.length > 0 && (
        <ActionListSection items={packet.actionItems.slice(0, config.maxActionItems)} />
      )}

      {/* Decision Memory & Carryover */}
      <DecisionMemoryStrip />
      <CarryoverPanel />

      {/* Proof Summary */}
      <ProofSummaryBoard />

      {/* ── Boardroom 2.0: Post-Session Execution Tracker (wired to DB) ── */}
      <ExecutionTracker
        sessionTitle="Weekly Business Review"
        sessionDate={new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        actions={overdueTasks.length > 0 ? overdueTasks.slice(0, 6).map((t: any, i: number) => ({
          id: t.id,
          title: t.title,
          assignee: t.assigned_to || "Owner",
          decidedAt: t.created_at ? new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
          dueBy: t.due_at ? new Date(t.due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
          status: t.status === "completed" ? "completed" as const : t.status === "blocked" ? "blocked" as const : t.due_at && new Date(t.due_at) < new Date() ? "overdue" as const : "pending" as const,
          domain: (t.domain === "business" || t.domain === "money" || t.domain === "concierge" ? t.domain : "business") as "business" | "money" | "concierge",
          progress: t.status === "completed" ? 100 : t.status === "in_progress" ? 50 : 0,
          proofGenerated: false,
        })) : []}
      />

      {/* Confidence Envelope & Provenance */}
      {config.showConfidenceEnvelope && <ConfidenceEnvelopePanel envelope={packet.confidenceEnvelope} />}
      {config.showProvenance && <ProvenancePanel packet={packet} />}

      {/* ── Phase 5: Twin Health Signals ── */}
      <BoardroomTwinPanel />

      {/* ── Phase 5: Boardroom Templates ── */}
      <BoardroomTemplatesPanel />

      {/* ── Phase 5: Quick Scenario Simulation ── */}
      <BoardroomScenarioPanel />
    </motion.div>
  );
};

// ── Phase 5: Digital Twin Health in Boardroom ─────────────────
const BoardroomTwinPanel = () => {
  const { engines } = useOSRuntime();
  const types = ["business", "money", "household"] as const;

  // Seed twins if needed
  for (const t of types) {
    if (!engines.twins.getTwin(t, "default-user")) {
      const twin = engines.twins.createTwin(t, "default-user");
      if (t === "business") {
        engines.twins.addSignal(twin.id, { category: "revenue_risk", severity: "warning", title: "Pipeline thinning", description: "Deal pipeline value dropped 18% this month", trend: "worsening", detectedAt: new Date().toISOString() });
        engines.twins.addBottleneck(twin.id, { area: "Follow-up", severity: "high", description: "4.2 day avg response time", impact: "Losing 15% warm leads", suggestedAction: "Enable auto follow-up", estimatedResolutionDays: 1 });
      }
      if (t === "money") {
        engines.twins.addSignal(twin.id, { category: "cash_pressure", severity: "warning", title: "Cash runway shortening", description: "4.8 months at current burn", trend: "worsening", detectedAt: new Date().toISOString() });
      }
      if (t === "household") {
        engines.twins.addSignal(twin.id, { category: "schedule_strain", severity: "info", title: "3 conflicts next week", description: "Over-scheduled", trend: "stable", detectedAt: new Date().toISOString() });
      }
    }
  }

  const unified = engines.twins.getUnifiedView("default-user");
  const twinMeta: Record<string, { label: string; color: string }> = {
    business: { label: "Business", color: "text-primary" },
    money: { label: "Money", color: "text-sita-gold" },
    household: { label: "Household", color: "text-trust-safe" },
  };

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Operating Twin Health" subtitle="Live signals from your digital twins" />
      <div className="grid gap-3 sm:grid-cols-3">
        {unified.twins.filter(t => t.type !== "unified" && t.type !== "operating").map(twin => {
          const meta = twinMeta[twin.type] || { label: twin.type, color: "text-foreground" };
          return (
            <SitaCard key={twin.id} hover={false} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${meta.color}`}>{meta.label} Twin</span>
                <span className={`text-lg font-bold font-display ${twin.healthScore >= 70 ? "text-trust-safe" : twin.healthScore >= 40 ? "text-accent" : "text-destructive"}`}>{twin.healthScore}</span>
              </div>
              <Progress value={twin.healthScore} className="h-1.5 mb-2" />
              <p className="text-[10px] text-muted-foreground">{twin.signals.length} signals · {twin.bottlenecks.length} bottlenecks</p>
              {twin.signals.filter(s => s.severity !== "info").slice(0, 1).map(s => (
                <div key={s.id} className="flex items-start gap-1.5 mt-2 text-[10px]">
                  <AlertTriangle className={`h-3 w-3 shrink-0 mt-0.5 ${s.severity === "critical" ? "text-destructive" : "text-accent"}`} />
                  <span className="text-muted-foreground">{s.title}</span>
                </div>
              ))}
            </SitaCard>
          );
        })}
      </div>
    </div>
  );
};

// ── Phase 5: Boardroom Session Templates ──────────────────────
const BoardroomTemplatesPanel = () => {
  const { engines } = useOSRuntime();
  const templates = engines.boardroom.getTemplates();

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Session Templates" subtitle="Start a structured boardroom session" />
      <div className="grid gap-2 sm:grid-cols-3">
        {templates.map(t => (
          <SitaCard key={t.id} hover className="p-3 cursor-pointer">
            <p className="text-sm font-semibold text-foreground">{t.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">{t.type}</span>
              <span className="text-[9px] text-muted-foreground">{t.frequency} · {t.defaultAgenda.length} items</span>
            </div>
          </SitaCard>
        ))}
      </div>
    </div>
  );
};

// ── Phase 5: Quick Scenario Simulation ────────────────────────
const BoardroomScenarioPanel = () => {
  const { engines } = useOSRuntime();
  const templates = engines.scenarios.getTemplates().slice(0, 3);

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Scenario Cards" subtitle="Simulate decisions before committing" />
      <div className="grid gap-2 sm:grid-cols-3">
        {templates.map(t => (
          <SitaCard key={t.id} hover className="p-3 cursor-pointer group">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-accent" />
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">{t.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent capitalize">{t.type.replace("_", " ")}</span>
              <span className="text-[9px] text-muted-foreground">{t.domain}</span>
            </div>
          </SitaCard>
        ))}
      </div>
    </div>
  );
};

// ── Tab Icons ─────────────────────────────────────────────────

const TAB_ICONS: Record<BoardroomType, React.ReactNode> = {
  "morning-briefing": <Sparkles className="h-3.5 w-3.5" />,
  "weekly-review": <BarChart3 className="h-3.5 w-3.5" />,
  "financial-health": <DollarSign className="h-3.5 w-3.5" />,
  "pipeline-review": <Briefcase className="h-3.5 w-3.5" />,
  "household-ops": <Home className="h-3.5 w-3.5" />,
  "opportunity-board": <Lightbulb className="h-3.5 w-3.5" />,
  "incident-review": <Activity className="h-3.5 w-3.5" />,
  "governance": <Scale className="h-3.5 w-3.5" />,
};

// ── Fullscreen Presentation Mode ──────────────────────────────

type PresentationMode = "executive" | "analyst" | "owner";

const FullscreenPresentation = ({ type, onExit }: { type: BoardroomType; onExit: () => void }) => {
  const { packet, isLoading } = useBoardroomPacket(type);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [presMode, setPresMode] = useState<PresentationMode>("executive");
  const SLIDE_DURATION = 30;

  const slides = packet?.sections ?? [];
  const totalSlides = slides.length;

  useEffect(() => {
    if (!autoAdvance) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        if (prev >= SLIDE_DURATION - 1) { setCurrentSlide(c => (c + 1) % totalSlides); return 0; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoAdvance, totalSlides]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setCurrentSlide(c => Math.min(c + 1, totalSlides - 1)); setElapsed(0); }
      if (e.key === "ArrowLeft") { setCurrentSlide(c => Math.max(c - 1, 0)); setElapsed(0); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [totalSlides, onExit]);

  const meta = META[type];

  if (isLoading || !packet) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Generating presentation…</p>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex flex-col bg-background">
      <div className="h-1 bg-secondary w-full"><motion.div className="h-full gradient-sita" style={{ width: `${(elapsed / SLIDE_DURATION) * 100}%` }} /></div>
      <div className="flex items-center justify-between px-6 py-3 border-b border-border glass">
        <div className="flex items-center gap-3">
          <div className="rounded-lg gradient-sita p-1.5"><BarChart3 className="h-4 w-4 text-primary-foreground" /></div>
          <div><p className="text-sm font-semibold text-foreground">{meta.label}</p><p className="text-[10px] text-muted-foreground">Slide {currentSlide + 1} of {totalSlides}</p></div>
        </div>
        <div className="flex items-center gap-2">
          {(["executive", "analyst", "owner"] as PresentationMode[]).map(m => (
            <button key={m} onClick={() => setPresMode(m)} className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${presMode === m ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>{m}</button>
          ))}
          <div className="h-4 w-px bg-border mx-1" />
          <button onClick={() => setAutoAdvance(!autoAdvance)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            {autoAdvance ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <ConfidencePill value={packet.confidence} />
          <button onClick={onExit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"><Minimize2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-8 lg:p-16">
        <AnimatePresence mode="wait">
          {slides[currentSlide] && (
            <motion.div key={currentSlide} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto">
              <RenderSection section={slides[currentSlide]} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between px-6 py-3 border-t border-border glass">
        <button onClick={() => { setCurrentSlide(c => Math.max(c - 1, 0)); setElapsed(0); }} disabled={currentSlide === 0} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => <button key={i} onClick={() => { setCurrentSlide(i); setElapsed(0); }} className={`h-2 rounded-full transition-all ${i === currentSlide ? "w-6 gradient-sita" : "w-2 bg-muted hover:bg-muted-foreground/30"}`} />)}
        </div>
        <button onClick={() => { setCurrentSlide(c => Math.min(c + 1, totalSlides - 1)); setElapsed(0); }} disabled={currentSlide === totalSlides - 1} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </motion.div>
  );
};

// ── Main Boardroom ────────────────────────────────────────────

const Boardroom = () => {
  const { isDemo } = useAuth();
  const os = useOSOrchestration();
  const signature = useExperienceSignature();
  const interfaceState = useAdaptiveInterface();
  const attentionStack = os.getAttentionStack();
  const currentMode = os.getCurrentMode();

  // Wire CAI historical data for real persistence
  const { data: caiOpportunities } = useOpportunitySignals({ limit: 10 });
  const { data: caiPriorities } = usePriorityStacks({ limit: 5 });
  const { data: caiDigests } = useDigestCompilations({ limit: 5 });

  const [activeType, setActiveType] = useState<BoardroomType>("morning-briefing");
  const [isPresenting, setIsPresenting] = useState(false);
  const [perspective, setPerspective] = useState<PerspectiveLevel>("owner");
  const [showCeremony, setShowCeremony] = useState(true);

  const tabs: { key: string; label: string }[] = [
    { key: "morning-briefing", label: "Morning Briefing" },
    { key: "weekly-review", label: "Weekly Review" },
    { key: "financial-health", label: "Financial Health" },
    { key: "pipeline-review", label: "Pipeline Review" },
    { key: "household-ops", label: "Household Ops" },
    { key: "opportunity-board", label: "Opportunities" },
    { key: "incident-review", label: "Incidents" },
    { key: "governance", label: "Governance" },
  ];

  return (
    <>
      <motion.div data-testid="boardroom-page" className="mx-auto max-w-7xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
<SitaPageHeader
          title="Boardroom"
          subtitle="Where advisor voices become one governed plan — not a dashboard, a deliberation artifact"
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                {(["executive", "analyst", "owner"] as PerspectiveLevel[]).map(p => (
                  <button key={p} onClick={() => setPerspective(p)} className={`px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${perspective === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>{p}</button>
                ))}
              </div>
              <button onClick={() => setIsPresenting(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                <Maximize2 className="h-3.5 w-3.5" /> Present
              </button>
            </div>
          }
        />

        <SitaTabs tabs={tabs} active={activeType} onChange={(k) => setActiveType(k as BoardroomType)} />

        <AnimatePresence mode="wait">
          {activeType === "governance" ? (
            <motion.div key="governance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <TrustDebtPanel />
                <ExecutionDebtHeatmap />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <DragIndexRadar entityScope={{ ownerId: "boardroom", visibility: "private" }} />
                <ReadinessGauge
                  input={{
                    proofCompleteness: { rate: 0.85, evidence: ["proof audit"] },
                    replaySafety: { rate: 0.78, evidence: ["replay scan"] },
                    rollbackReadiness: { rate: 0.72, evidence: ["rollback tests"] },
                    policyMaturity: { score: 0.80, evidence: ["policy rules"] },
                    errorRate: { rate: 0.04, evidence: ["error log"] },
                    approvalBehavior: { autoApprovalRate: 0.35, evidence: ["approval history"] },
                    connectorStability: { uptimeRate: 0.97, evidence: ["connector health"] },
                    observabilityQuality: { coverage: 0.82, evidence: ["SLO coverage"] },
                    supportBurden: { ticketRate: 0.12, evidence: ["ticket volume"] },
                    confidenceQuality: { avgConfidence: 0.88, evidence: ["calibration"] },
                  }}
                  entityScope={{ ownerId: "boardroom", visibility: "private" }}
                />
              </div>
              <DelegationRegistryTable />
            </motion.div>
          ) : (
            <PacketView key={activeType} type={activeType} perspective={perspective} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Entry Ceremony */}
      <AnimatePresence>
        {showCeremony && <WarRoomEntryCeremony boardroomType={activeType} onComplete={() => setShowCeremony(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isPresenting && <WarRoomPresentation type={activeType} onExit={() => setIsPresenting(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Boardroom;
