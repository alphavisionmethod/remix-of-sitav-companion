// ═══════════════════════════════════════════════════════════════
// SITA OS — Main Guide + Advisor Council Experience
// Premium executive operating system — not a chatbot UI
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useApprovalQueue } from "@/hooks/use-brain-core";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaMetric, SitaButton } from "@/components/sita/SitaCard";
import { TrustBadge, type TrustLevel } from "@/components/sita/TrustBadge";
import { StateBadge, StateStep, type ExecutionState } from "@/components/sita/StateBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  AdvisorCard, RecommendationCard, SimulationCard, ApprovalCard,
  ProofCard, MemoryCard, SynthesisCard, ConfidenceLadder,
  BoardroomAdvisorCard, UncertaintyCard } from "@/components/sita/AdvisorComponents";
import { mockAdvisors, mockRecommendations, mockSimulations, mockApprovals, mockProofHistory, mockMemoryItems, mockSynthesis } from "@/hooks/useAdvisorMissionControl";
import { useStreamingChat } from "@/hooks/use-streaming-chat";
import {
  Brain, Users, GitCompare, Play, CheckCircle, FileText, Eye,
  BarChart3, Sparkles, ArrowRight, Shield, Clock, TrendingUp,
  AlertTriangle, Zap, ChevronRight, Lock, ArrowLeft, Scale,
  Briefcase, DollarSign, Headphones, Target, Hash, Workflow,
  RefreshCw, ShieldCheck, Lightbulb, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdvisorStatuses, STATE_COLORS, STATE_LABELS, type AdvisorLiveState } from "@/hooks/use-advisor-status";
import type { ApprovalRequest, ExecutionEnvelope, Receipt, TrustState, Opportunity } from "@/packages/contracts";
import type { AdvisorConfig, AdvisorId } from "@/packages/advisor-config";
import type { ProofPack, TypedReceipt } from "@/packages/proof-model";
import type { RefusalState, ContradictionReport } from "@/packages/policy-contracts";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";



// ── Operating Modes ─────────────────────────────────────────────

type CouncilMode = "daily-pulse" | "business" | "money" | "concierge" | "boardroom" | "executive";

const MODES: { id: CouncilMode; label: string; icon: React.ElementType; domains: string[] }[] = [
  { id: "daily-pulse", label: "Daily Pulse", icon: Sparkles, domains: ["all"] },
  { id: "business", label: "Business", icon: Briefcase, domains: ["business", "sales", "growth"] },
  { id: "money", label: "Money / Family Office", icon: DollarSign, domains: ["money", "treasury", "risk"] },
  { id: "concierge", label: "Concierge / Family", icon: Headphones, domains: ["concierge", "family", "calendar", "travel"] },
  { id: "boardroom", label: "Boardroom", icon: BarChart3, domains: ["boardroom"] },
  { id: "executive", label: "Executive", icon: Shield, domains: ["all"] },
];

// ── Trust State Pipeline ────────────────────────────────────────

const TRUST_PIPELINE: ExecutionState[] = [
  "proposed", "drafted", "simulated", "approval-requested", "approved", "executing", "completed", "verified"
];

// ── Main Guide Identity ─────────────────────────────────────────

const MainGuideHeader = ({ mode, onModeChange }: { mode: CouncilMode; onModeChange: (m: CouncilMode) => void }) => {
const totalApprovals = isDemoMode ? mockAdvisors.reduce((s, a) => s + a.pendingApprovals, 0) : 0;
  const activeAdvisors = isDemoMode ? mockAdvisors.filter(a => a.status === "active").length : 0;
  const highImpact = isDemoMode ? mockRecommendations.filter(r => r.impact === "high").length : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card"
    >
      <div className="relative z-10 p-6 pb-4">
        {/* Guide identity */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-trust-safe border-2 border-card" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Advisory Council</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeAdvisors} specialist advisors — observing, reasoning, ready to act
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {totalApprovals > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-trust-approval/10 border border-trust-approval/20 px-3 py-1.5">
                <Lock className="h-3.5 w-3.5 text-trust-approval" />
                <span className="text-xs font-semibold text-trust-approval">{totalApprovals} awaiting approval</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <MetricPill label="High-Impact Moves" value={highImpact} accent />
          <MetricPill label="Active Advisors" value={activeAdvisors} />
          <MetricPill label="Pending Approvals" value={totalApprovals} accent={totalApprovals > 0} />
          <MetricPill label="Simulations Ready" value={isDemoMode ? mockSimulations.length : 0} />
        </div>

        {/* Operating mode selector */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {MODES.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  mode === m.id
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Subtle background elements */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/3 blur-3xl" />
      <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-accent/3 blur-2xl" />
    </motion.div>
  );
};

const MetricPill = ({ label, value, accent }: { label: string; value: number; accent?: boolean }) => (
  <div className={cn("rounded-xl border px-3 py-2.5 text-center transition-all", accent ? "border-primary/20 bg-primary/5" : "border-border bg-card/50")}>
    <p className={cn("font-display text-lg font-bold", accent ? "text-primary" : "text-foreground")}>{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

// ── Advisor Council Grid ────────────────────────────────────────

const CouncilGrid = ({ mode }: { mode: CouncilMode }) => {
  const navigate = useNavigate();
const modeConfig = MODES.find(m => m.id === mode)!;
  const filtered = isDemoMode
    ? (modeConfig.domains.includes("all") ? mockAdvisors : mockAdvisors.filter(a => modeConfig.domains.includes(a.domain)))
    : [];

  const advisorIds = useMemo(() => filtered.map(a => a.id), [filtered]);
  const liveStatuses = useAdvisorStatuses(advisorIds);

  return (
    <div className="space-y-4">
      <SitaSectionHeader title="Your Advisors" subtitle={`${filtered.length} specialists in ${modeConfig.label} mode`} />

      {/* Live Status Strip */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {filtered.map(a => {
          const status = liveStatuses.get(a.id);
          return (
            <div key={a.id} className="flex shrink-0 items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-1.5 min-w-[140px]">
              <div className={cn("h-2 w-2 rounded-full shrink-0", STATE_COLORS[status?.state || "idle"])} />
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-foreground truncate">{a.name.split(" ")[0]}</p>
                <p className="text-[9px] text-muted-foreground truncate">{status?.detail || "Idle"}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((a, i) => {
          const status = liveStatuses.get(a.id);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="relative">
                <AdvisorCard advisor={a} onClick={() => navigate(`/advisors/${a.id}`)} />
                {/* Live status overlay */}
                {status && status.state !== "idle" && status.state !== "observing" && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-card/90 backdrop-blur-sm border border-border/50 px-2 py-1">
                    <div className={cn("h-1.5 w-1.5 rounded-full", STATE_COLORS[status.state])} />
                    <span className="text-[9px] text-muted-foreground">{STATE_LABELS[status.state]}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ── What Matters Now — Priority Recommendations ─────────────────

const WhatMattersNow = ({ mode }: { mode: CouncilMode }) => {
if (!isDemoMode) return null;
  
  const modeConfig = MODES.find(m => m.id === mode)!;
  const recs = modeConfig.domains.includes("all")
    ? mockRecommendations
    : mockRecommendations.filter(r => {
        const adv = mockAdvisors.find(a => a.id === r.advisorId);
        return adv && modeConfig.domains.includes(adv.domain);
      });
  const sorted = [...recs].sort((a, b) => {
    const impOrd = { high: 0, medium: 1, low: 2 };
    return (impOrd[a.impact] || 2) - (impOrd[b.impact] || 2);
  });

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="What Matters Now" subtitle="Priority recommendations from your council" />
      <div className="space-y-3">
        {sorted.slice(0, 5).map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <RecommendationCard rec={r} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Disagreement & Synthesis Cards ──────────────────────────────

const DisagreementPanel = () => {
if (!isDemoMode) return null;
  
  const disagreements = mockSynthesis.filter(s => s.disagreements && s.disagreements.length > 0);

  if (disagreements.length === 0 && mockSynthesis.length === 0) return null;

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Multi-Advisor Intelligence" subtitle="Where advisors agree, disagree, and synthesize" />
      
      {/* Disagreement highlight */}
      {disagreements.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-accent/20 bg-accent/5 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Visible Disagreements</p>
            <Badge variant="outline" className="text-[9px] bg-accent/10 text-accent border-accent/20">{disagreements.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Disagreement is a strength. These show where advisors see different paths — review and decide.
          </p>
      {disagreements.map(s => (
            <div key={s.id} className="rounded-lg bg-card/50 border border-border p-3 mb-2 last:mb-0">
              <p className="text-xs font-medium text-foreground mb-1">{s.title}</p>
              {s.disagreements?.map((d, i) => (
                <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5 mt-1">
                  <AlertTriangle className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                  {d}
                </p>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {/* Full synthesis cards */}
      <div className="space-y-3">
        {mockSynthesis.map(s => <SynthesisCard key={s.id} synthesis={s} />)}
      </div>
    </div>
  );
};

// ── Confidence Ladder Panel ─────────────────────────────────────

const ConfidencePanel = ({ mode }: { mode: CouncilMode }) => {
if (!isDemoMode) return null;
  
  const modeConfig = MODES.find(m => m.id === mode)!;
  const advisors = modeConfig.domains.includes("all")
    ? mockAdvisors
    : mockAdvisors.filter(a => modeConfig.domains.includes(a.domain));

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Confidence Ladder" subtitle="How certain each advisor is about their recommendations" />
      <SitaCard hover={false}>
        <ConfidenceLadder items={advisors.map(a => ({ label: a.name, confidence: a.confidence }))} />
      </SitaCard>
    </div>
  );
};

// ── Trust State Pipeline Visualization ──────────────────────────

const TrustPipelineStrip = () => {
if (!isDemoMode) return null;
  
  const states: { state: ExecutionState; count: number }[] = [
    { state: "proposed", count: 3 },
    { state: "simulated", count: 2 },
    { state: "approval-requested", count: mockApprovals.length },
    { state: "executing", count: 1 },
    { state: "completed", count: 5 },
    { state: "verified", count: 12 },
  ];

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Trust Pipeline" subtitle="All actions across the trust ladder" />
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {states.map(s => (
          <div key={s.state} className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-card/50 px-4 py-3 min-w-[100px]">
            <StateBadge state={s.state} size="sm" />
            <span className="font-display text-lg font-bold text-foreground">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── What Changed Panel ──────────────────────────────────────────

const WhatChangedPanel = () => {
if (!isDemoMode) return null;
  
  const recentProof = mockProofHistory.slice(0, 4);

  return (
    <div className="space-y-3">
      <SitaSectionHeader
        title="What Changed"
        subtitle="Recent actions, decisions, and verifications"
        action={<SitaButton variant="ghost" size="sm"><ArrowRight className="h-3 w-3 mr-1" />View all</SitaButton>}
      />
      <div className="space-y-2">
        {recentProof.map(p => <ProofCard key={p.id} item={p} />)}
      </div>
    </div>
  );
};

// ── Simulation Studio ───────────────────────────────────────────

const SimulationStudio = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-state-simulated/20 bg-state-simulated/5 p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-simulated/15">
          <GitCompare className="h-5 w-5 text-state-simulated" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground font-display">Simulation Studio</h2>
          <p className="text-xs text-muted-foreground">Compare scenarios, preview impact, decide with confidence</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Simulations appear when advisors identify decision points with multiple viable paths.
        Each scenario shows projected impact, risk, and confidence — so you choose, not the AI.
      </p>
    </motion.div>

    {mockSimulations.length > 0 ? (
      <div className="space-y-4">
        {mockSimulations.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <SimulationCard sim={s} />
          </motion.div>
        ))}
      </div>
    ) : (
      <EmptyState icon={Play} title="No simulations available" description="Simulations appear when advisors identify decision points" />
    )}
  </div>
);

// ── Approval Queue ──────────────────────────────────────────────

const ApprovalQueue = () => {
  const { user } = useAuth();
const { pendingApprovals, isLoading } = useApprovalQueue();

  // Use DB approvals if available, otherwise mock
  const approvals = (pendingApprovals.length > 0)
    ? pendingApprovals.map((a: Record<string, any>) => ({
        id: a.id,
        advisorId: "system",
        title: a.action_summary || "Pending Approval",
        description: a.decision_reason || "Awaiting your decision",
        type: a.action_type || "action",
        status: "pending" as const,
        impact: "medium" as const,
        requiresApproval: true,
      }))
    : mockApprovals;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-trust-approval/20 bg-trust-approval/5 p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trust-approval/15">
            <ShieldCheck className="h-5 w-5 text-trust-approval" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground font-display">Approval Queue</h2>
            <p className="text-xs text-muted-foreground">Actions that need your decision before execution</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Each shows what happens if approved, delayed, or rejected — with linked proof and policy context.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading approvals…</div>
      ) : approvals.length > 0 ? (
        <div className="space-y-4">
          {approvals.map((a: any, i: number) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <ApprovalCard approval={a} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={CheckCircle} title="All caught up" description="No approvals pending — your advisors are operating within policy" />
      )}
    </div>
  );
};

// ── Memory Transparency ─────────────────────────────────────────

const MemoryTransparency = () => {
  const { user } = useAuth();
const { data: dbMemory = [] } = useQuery({
    queryKey: ["advisor-memory", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await fromTable("user_memory").select("*").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  // Map DB memory to mock format, or use mocks
  const memoryItems = (dbMemory.length > 0)
    ? dbMemory.map((m: Record<string, any>) => ({
        id: m.id,
        type: m.memory_type || "learned",
        source: m.source || "System",
        content: m.content || m.key,
        learnedAt: m.created_at,
        confidence: m.confidence || 0.8,
        usedCount: 0,
      }))
    : mockMemoryItems;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-primary/5 p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground font-display">Why This Knows You</h2>
            <p className="text-xs text-muted-foreground">Everything your advisors learned, inferred, and use — fully transparent</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">You can correct or forget any item. Your memory, your control.</p>
      </motion.div>

      <div className="space-y-2">
        {memoryItems.map((m: any, i: number) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <MemoryCard item={m} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Proof & History ─────────────────────────────────────────────

const ProofHistory = () => {
return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-trust-verified/15 bg-trust-verified/5 p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trust-verified/15">
            <FileText className="h-5 w-5 text-trust-verified" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground font-display">Advisor Proof & History</h2>
            <p className="text-xs text-muted-foreground">Complete audit trail — every recommendation, action, and verification</p>
          </div>
        </div>
      </motion.div>

      {isDemoMode ? (
        <div className="space-y-2">
          {mockProofHistory.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <ProofCard item={p} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="No proof history yet" description="Actions and verifications will appear here as advisors operate in live mode" />
      )}
    </div>
  );
};

// ── Single Advisor Workspace ────────────────────────────────────

const SingleAdvisorView = ({ advisorId }: { advisorId: string }) => {
  const navigate = useNavigate();
const [activeSection, setActiveSection] = useState<"overview" | "simulations" | "history">("overview");

  if (!isDemoMode) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate("/advisors")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Council
        </button>
        <SitaCard className="p-8 text-center">
          <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-foreground mb-1">Advisor Not Available</h3>
          <p className="text-sm text-muted-foreground">Individual advisor profiles activate when real advisor data flows in. Switch to demo mode to preview.</p>
        </SitaCard>
      </div>
    );
  }

  const advisor = mockAdvisors.find(a => a.id === advisorId) || mockAdvisors[0];
  const recs = mockRecommendations.filter(r => r.advisorId === advisor.id);
  const proofs = mockProofHistory.filter(p => p.advisor === advisor.name);
  const memories = mockMemoryItems.filter(m => m.source.toLowerCase().includes(advisor.domain));

  const iconMap: Record<string, React.ElementType> = { Briefcase, DollarSign, Headphones, TrendingUp, Target, Shield, BarChart3, Brain };
  const Icon = iconMap[advisor.icon] || Brain;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/advisors")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Council
      </button>

      {/* Advisor Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card p-6"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-foreground font-display">{advisor.name}</h2>
              <div className={`h-2.5 w-2.5 rounded-full ${advisor.status === "active" ? "bg-trust-safe" : advisor.status === "degraded" ? "bg-trust-degraded" : "bg-muted-foreground"}`} />
              <span className="text-[10px] text-muted-foreground capitalize">{advisor.status}</span>
            </div>
            <p className="text-sm text-muted-foreground">{advisor.mission}</p>
            <p className="text-xs text-primary mt-1">{advisor.specialAbility}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-2xl font-bold text-foreground">{Math.round(advisor.confidence * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">confidence</p>
          </div>
        </div>

        {/* What it sees */}
        <div className="rounded-xl bg-secondary/30 border border-border p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground">What This Advisor Sees</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Data Sources", value: "6 connected" },
              { label: "Last Scan", value: "12 min ago" },
              { label: "Entities Tracked", value: advisor.domain === "money" ? "24 accounts" : advisor.domain === "business" ? "18 clients" : "12 tasks" },
              { label: "Memory Items", value: `${memories.length + 8} learned` },
            ].map((m, i) => (
              <div key={i}>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-xs font-medium text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence breakdown */}
        <div className="mt-4">
          <ConfidenceLadder items={[
            { label: "Overall Confidence", confidence: advisor.confidence },
            { label: "Data Freshness", confidence: 0.91 },
            { label: "Source Coverage", confidence: 0.85 },
            { label: "Memory Quality", confidence: 0.88 },
          ]} />
        </div>
      </motion.div>

      {/* Section tabs */}
      <div className="flex gap-1.5 border-b border-border pb-2">
        {(["overview", "simulations", "history"] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all",
              activeSection === s ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}>
            {s === "simulations" ? "Simulation Studio" : s}
          </button>
        ))}
      </div>

      {/* Uncertainty */}
      {activeSection === "overview" && advisor.uncertainty && (
        <UncertaintyCard title="Uncertainty Detected" description={advisor.uncertainty} sources={["Calendar sync", "School portal"]} suggestion="Verify in the relevant app" />
      )}

      {/* Trust pipeline for this advisor */}
      {activeSection === "overview" && (
        <>
          <SitaCard hover={false}>
            <SitaCardTitle sub="Current state of this advisor's actions">Trust Pipeline</SitaCardTitle>
            <div className="mt-3">
              <StateStep states={TRUST_PIPELINE} current={recs.length > 0 && recs[0].requiresApproval ? "approval-requested" : "proposed"} />
            </div>
          </SitaCard>

          {/* Recommendations */}
          <div className="space-y-3">
            <SitaSectionHeader title="Recommendations" subtitle={`${recs.length} active`} />
            {recs.length > 0 ? (
              recs.map(r => <RecommendationCard key={r.id} rec={r} />)
            ) : (
              <EmptyState icon={CheckCircle} title="All caught up" description="No recommendations right now" />
            )}
          </div>

          {/* Memory for this advisor */}
          {memories.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="What This Advisor Knows" subtitle="Memory items used for personalization" />
              <div className="space-y-2">
                {memories.slice(0, 4).map(m => <MemoryCard key={m.id} item={m} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Simulation Studio */}
      {activeSection === "simulations" && (
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-state-simulated/20 bg-state-simulated/5 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-simulated/15">
                <GitCompare className="h-5 w-5 text-state-simulated" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground font-display">Simulation Studio</h2>
                <p className="text-xs text-muted-foreground">Before/after projections for {advisor.name}'s recommendations</p>
              </div>
            </div>
          </motion.div>

          {/* Before / After Projections */}
          {recs.slice(0, 3).map((rec, i) => (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                </div>
                <Badge variant="outline" className={cn("text-[9px]",
                  rec.impact === "high" ? "bg-destructive/10 text-destructive border-destructive/20" :
                  "bg-accent/10 text-accent border-accent/20"
                )}>{rec.impact} impact</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Before */}
                <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current State</p>
                  {advisor.domain === "money" ? (
                    <>
                      <ProjectionRow label="Reserve Health" value="78%" />
                      <ProjectionRow label="Cash Position" value="$31,200" />
                      <ProjectionRow label="Risk Score" value="Medium" />
                    </>
                  ) : advisor.domain === "business" ? (
                    <>
                      <ProjectionRow label="Pipeline Value" value="$128K" />
                      <ProjectionRow label="Close Rate" value="24%" />
                      <ProjectionRow label="Aging Leads" value="5" />
                    </>
                  ) : (
                    <>
                      <ProjectionRow label="Open Tasks" value="8" />
                      <ProjectionRow label="Calendar Conflicts" value="2" />
                      <ProjectionRow label="Provider Score" value="3.8/5" />
                    </>
                  )}
                </div>

                {/* After */}
                <div className="rounded-lg border border-trust-safe/20 bg-trust-safe/5 p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-trust-safe">Projected After</p>
                  {advisor.domain === "money" ? (
                    <>
                      <ProjectionRow label="Reserve Health" value="85%" positive />
                      <ProjectionRow label="Cash Position" value="$30,400" />
                      <ProjectionRow label="Risk Score" value="Low" positive />
                    </>
                  ) : advisor.domain === "business" ? (
                    <>
                      <ProjectionRow label="Pipeline Value" value="$142K" positive />
                      <ProjectionRow label="Close Rate" value="28%" positive />
                      <ProjectionRow label="Aging Leads" value="3" positive />
                    </>
                  ) : (
                    <>
                      <ProjectionRow label="Open Tasks" value="5" positive />
                      <ProjectionRow label="Calendar Conflicts" value="0" positive />
                      <ProjectionRow label="Provider Score" value="4.2/5" positive />
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SitaButton variant="primary" size="sm">
                  <CheckCircle className="h-3 w-3 mr-1" /> Approve
                </SitaButton>
                <SitaButton variant="ghost" size="sm">
                  <GitCompare className="h-3 w-3 mr-1" /> Run Simulation
                </SitaButton>
              </div>
            </motion.div>
          ))}

          {recs.length === 0 && (
            <EmptyState icon={Play} title="No simulations available" description="Simulations appear when this advisor has active recommendations" />
          )}
        </div>
      )}

      {/* Proof trail */}
      {activeSection === "history" && (
        <div className="space-y-3">
          <SitaSectionHeader title="Proof & History" />
          <div className="space-y-2">
            {proofs.length > 0 ? (
              proofs.map(p => <ProofCard key={p.id} item={p} />)
            ) : (
              <EmptyState icon={FileText} title="No history yet" description="Actions will appear here as this advisor operates" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectionRow = ({ label, value, positive }: { label: string; value: string; positive?: boolean }) => (
  <div className="flex items-center justify-between">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className={cn("text-xs font-medium", positive ? "text-trust-safe" : "text-foreground")}>{value}</p>
  </div>
);

// ── Empty State ─────────────────────────────────────────────────

const EmptyState = ({ icon: IconComponent, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-10 text-center">
    <IconComponent className="h-8 w-8 text-muted-foreground/30 mb-3" />
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
  </div>
);

// ── Council Chat Panel ──────────────────────────────────────────

const ADVISOR_MODES: Record<CouncilMode, string> = {
  "daily-pulse": "general",
  "business": "business",
  "money": "money",
  "concierge": "concierge",
  "boardroom": "strategy",
  "executive": "general",
};

const CouncilChatPanel = ({ mode }: { mode: CouncilMode }) => {
  const { messages, isStreaming, error, send, stop, clear } = useStreamingChat();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    send(input, ADVISOR_MODES[mode] || "general");
    setInput("");
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-primary/5 p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground font-display">Ask Your Council</h2>
            <p className="text-xs text-muted-foreground">Chat with your advisors in {MODES.find(m => m.id === mode)?.label || "General"} mode</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="max-h-[400px] overflow-y-auto space-y-3 rounded-xl border border-border bg-card/30 p-4">
        {messages.length === 0 && !isStreaming && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Ask anything — your council advisors will respond based on your data and context.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("rounded-lg p-3 text-sm", m.role === "user" ? "bg-primary/10 ml-8" : "bg-secondary/50 mr-8")}>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">{m.role === "user" ? "You" : "Advisor"}</p>
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask your advisory council..."
          className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          disabled={isStreaming}
        />
        {isStreaming ? (
          <SitaButton variant="danger" size="sm" onClick={stop}>Stop</SitaButton>
        ) : (
          <SitaButton variant="primary" size="sm" onClick={handleSend}>Send</SitaButton>
        )}
        {messages.length > 0 && !isStreaming && (
          <SitaButton variant="ghost" size="sm" onClick={clear}>Clear</SitaButton>
        )}
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────

export default function AdvisorWorkspace() {
  const [mode, setMode] = useState<CouncilMode>("daily-pulse");
  const [activeTab, setActiveTab] = useState("council");
const params = useParams();
  const advisorId = params["*"];

  // If we have a specific advisor ID in the route, show single advisor
  if (advisorId && advisorId.length > 0 && advisorId !== "*") {
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
        <SingleAdvisorView advisorId={advisorId} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<MainGuideHeader mode={mode} onModeChange={setMode} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5 gap-0.5 flex-wrap">
          <TabsTrigger value="council" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Users className="h-3 w-3 mr-1.5" />Council
          </TabsTrigger>
          <TabsTrigger value="priorities" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Zap className="h-3 w-3 mr-1.5" />Priorities
          </TabsTrigger>
          <TabsTrigger value="compare" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <GitCompare className="h-3 w-3 mr-1.5" />Compare
          </TabsTrigger>
          <TabsTrigger value="simulations" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Play className="h-3 w-3 mr-1.5" />Simulations
            {isDemoMode && mockSimulations.length > 0 && <Badge className="ml-1 h-4 px-1 text-[9px] bg-state-simulated/20 text-state-simulated">{mockSimulations.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approvals" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1.5" />Approvals
            {isDemoMode && mockApprovals.length > 0 && <Badge className="ml-1 h-4 px-1 text-[9px] bg-trust-approval/20 text-trust-approval">{mockApprovals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="memory" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Eye className="h-3 w-3 mr-1.5" />Memory
          </TabsTrigger>
          <TabsTrigger value="proof" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <FileText className="h-3 w-3 mr-1.5" />Proof
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <MessageSquare className="h-3 w-3 mr-1.5" />Chat
          </TabsTrigger>
        </TabsList>

        <div className="mt-5">
          <TabsContent value="council">
            <div className="space-y-6">
              <CouncilGrid mode={mode} />
              <TrustPipelineStrip />
              <WhatChangedPanel />
            </div>
          </TabsContent>

          <TabsContent value="priorities">
            <div className="space-y-6">
              <WhatMattersNow mode={mode} />
              <ConfidencePanel mode={mode} />
            </div>
          </TabsContent>

          <TabsContent value="compare">
            <DisagreementPanel />
          </TabsContent>

          <TabsContent value="simulations">
            <SimulationStudio />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalQueue />
          </TabsContent>

          <TabsContent value="memory">
            <MemoryTransparency />
          </TabsContent>

          <TabsContent value="proof">
            <ProofHistory />
          </TabsContent>

          <TabsContent value="chat">
            <CouncilChatPanel mode={mode} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
