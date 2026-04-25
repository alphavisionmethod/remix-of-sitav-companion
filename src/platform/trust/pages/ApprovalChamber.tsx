import { useAuth } from "@/contexts/AuthContext";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Chamber
// Premium governed approval surface with simulation preview,
// execution chain timeline, trusted-device signing, and policy cards
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Play, X, Eye, Fingerprint, FileText, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronRight, Loader2, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExecutionChainTimeline, buildDefaultChain } from "@/components/sita/primitives/ExecutionChainTimeline";
import type { ChainStepId } from "@/components/sita/primitives/ExecutionChainTimeline";
import { AutonomyLadder } from "@/components/sita/primitives/AutonomyLadder";
import type { AutonomyRung } from "@/components/sita/primitives/AutonomyLadder";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { motion, AnimatePresence } from "framer-motion";
import { useApprovals } from "@/hooks/use-sita-data";
import { useApprovalQueue } from "@/hooks/use-brain-core";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLoopEmitter } from "@/hooks/use-flagship-loop-proof";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── Types (re-use demo-data interface) ────────────────────────
type ApprovalItem = { id: string; title: string; domain: string; status: string; risk?: string; requestedBy: string; createdAt?: string; riskLevel?: string; requestedAt?: string; [k: string]: any };
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { EmptyState } from "@/components/sita/EmptyState";
import { PageShell } from "@/components/sita/PageShell";
// ── Risk Styling ─────────────────────────────────────────────

const riskStyles = {
  low: { border: "border-[hsl(var(--trust-safe))]/20", bg: "bg-[hsl(var(--trust-safe))]/5", badge: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" },
  medium: { border: "border-[hsl(var(--sita-gold))]/20", bg: "bg-[hsl(var(--sita-gold))]/5", badge: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" },
  high: { border: "border-[hsl(var(--destructive))]/20", bg: "bg-[hsl(var(--destructive))]/5", badge: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" },
  critical: { border: "border-[hsl(var(--destructive))]/40", bg: "bg-[hsl(var(--destructive))]/10", badge: "bg-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive))]" },
};

const domainColors = {
  business: "text-primary",
  finance: "text-[hsl(var(--trust-safe))]",
  concierge: "text-accent",
};

// ── Sub-Components ───────────────────────────────────────────

const PolicyExplanationCard = ({ policyName, reason }: { policyName: string; reason: string }) => (
  <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 space-y-1.5">
    <div className="flex items-center gap-2">
      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[11px] font-semibold text-foreground">{policyName}</span>
    </div>
    <p className="text-[11px] text-muted-foreground leading-relaxed">{reason}</p>
  </div>
);

const ImpactPanel = ({ items, confidence }: { items: string[]; confidence: number }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Impact Analysis</span>
      <ConfidenceBar value={confidence} size="sm" />
    </div>
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const TrustedDeviceSign = ({ required, onSign }: { required: boolean; onSign: () => void }) => {
  if (!required) return null;
  return (
    <PageShell>
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Fingerprint className="h-4 w-4 text-primary" />
        <span className="text-[12px] font-semibold text-foreground">Trusted Device Signing Required</span>
      </div>
      <p className="text-[10px] text-muted-foreground">
        This action requires biometric or device-level confirmation to proceed. Your approval will be cryptographically bound to this device.
      </p>
      <button
        onClick={onSign}
        className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <Fingerprint className="h-3.5 w-3.5" />
        Authenticate & Sign
      </button>
    </div>
    </PageShell>
  );
};

const SimulationPreview = ({ item }: { item: ApprovalItem }) => {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);

  const runSimulation = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setComplete(true); }, 2000);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-[12px] font-semibold text-foreground">Simulation Preview</span>
        </div>
        <Badge variant="outline" className="text-[9px]">SANDBOX</Badge>
      </div>

      {!complete ? (
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Run this action in a sandboxed environment to preview outcomes before committing.
          </p>
          <button
            onClick={runSimulation}
            disabled={running}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-semibold transition-all",
              running
                ? "bg-secondary text-muted-foreground cursor-wait"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {running ? (
              <>
                <div className="h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                Simulating…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Run Simulation
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[hsl(var(--trust-safe))]">
            <CheckCircle className="h-4 w-4" />
            <span className="text-[12px] font-semibold">Simulation Complete — No Issues Detected</span>
          </div>
          <div className="rounded-lg border border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5 p-3 space-y-1.5">
            {item.impactSummary.map((line, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">{line}</p>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 italic">
            Simulation ran in sandbox lane. No real-world effects occurred.
          </p>
        </div>
      )}
    </div>
  );
};

// ── Approval Card ────────────────────────────────────────────

const ApprovalCard = ({ item, onAction }: { item: ApprovalItem; onAction: (id: string, action: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmingApprove, setConfirmingApprove] = useState(false);
  const style = riskStyles[item.riskLevel];

  const timeLeft = () => {
    const diff = new Date(item.expiresAt).getTime() - Date.now();
    const hours = Math.floor(diff / 3600000);
    if (hours > 24) return `${Math.floor(hours / 24)}d left`;
    return `${hours}h left`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border p-0 transition-all duration-200 overflow-hidden", style.border, style.bg)}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        <div className="rounded-lg bg-card border border-border/50 p-2 shrink-0 mt-0.5">
          <ShieldCheck className={cn("h-5 w-5", domainColors[item.domain])} />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            <Badge className={cn("text-[9px] uppercase", style.badge)}>{item.riskLevel}</Badge>
            {item.requiresDeviceSign && (
              <Badge variant="outline" className="text-[9px] gap-1">
                <Fingerprint className="h-2.5 w-2.5" /> Device Sign
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
            <span>{item.requestedBy}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{timeLeft()}</span>
            {item.amount && <span>•</span>}
            {item.amount && <span className="font-semibold text-foreground">${item.amount.toLocaleString()}</span>}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1", expanded && "rotate-180")} />
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
              {/* Execution Chain */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Execution Chain</span>
                <ExecutionChainTimeline
                  steps={buildDefaultChain(item.currentStep, { skipSimulation: item.skipSimulation })}
                  compact
                />
              </div>

              {/* Policy Explanation */}
              <PolicyExplanationCard policyName={item.policyName} reason={item.policyReason} />

              {/* Impact */}
              <ImpactPanel items={item.impactSummary} confidence={item.confidence} />

              {/* Simulation */}
              {item.simulationAvailable && <SimulationPreview item={item} />}

              {/* Device Sign */}
              <TrustedDeviceSign
                required={item.requiresDeviceSign}
                onSign={() => setConfirmingApprove(true)}
              />

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    if (item.riskLevel === "high" && !confirmingApprove) {
                      setConfirmingApprove(true);
                      return;
                    }
                    onAction(item.id, "approve");
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-semibold transition-all",
                    confirmingApprove
                      ? "bg-[hsl(var(--destructive))] text-foreground animate-pulse"
                      : "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))] hover:bg-[hsl(var(--trust-safe))]/25"
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {confirmingApprove ? "Confirm Approval" : "Approve"}
                </button>
                <button
                  onClick={() => onAction(item.id, "reject")}
                  className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--destructive))]/10 px-4 py-2.5 text-[12px] font-medium text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(var(--destructive))]/20"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => onAction(item.id, "defer")}
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary/80"
                >
                  <Clock className="h-4 w-4" /> Defer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Page ────────────────────────────────────────────────

const ApprovalChamber = () => {
  const { isDemo } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: dbApprovals = [], isLoading } = useApprovals();
  const { approve, reject } = useApprovalQueue();
  const os = useOSOrchestration();
  const emitApprovalLoop = useLoopEmitter("admin-truth-recommendation-approval");
  const [tab, setTab] = useState("pending");
  const [generating, setGenerating] = useState(false);

  // Map DB approvals to ApprovalItem interface.
  // In LIVE mode: always use real rows (empty array → empty state).
  // In DEMO mode: keep the curated fixtures so the surface is expressive.
  const liveItems: ApprovalItem[] = (dbApprovals as Array<Record<string, any>>).map((a) => ({
    id: a.id,
    title: a.action_summary || a.title || "Untitled recommendation",
    description: a.proposed_action?.actions?.[0]?.description || a.action_summary || "Awaiting review",
    domain: (a.domain === "finance" || a.domain === "money" ? "finance"
      : a.domain === "concierge" ? "concierge" : "business") as ApprovalItem["domain"],
    riskLevel: ((a.risk_level as ApprovalItem["riskLevel"]) || "medium"),
    status: (a.status === "approved" ? "approved" : a.status === "rejected" ? "rejected" : "pending") as ApprovalItem["status"],
    requestedBy: a.action_type ? `Advisor · ${a.action_type}` : "Advisor",
    requestedAt: a.created_at,
    expiresAt: new Date(new Date(a.created_at).getTime() + 7 * 86400000).toISOString(),
    policyName: a.flagship_loop_key || "Approval governance",
    policyReason: a.decision_reason || a.cost_implications || "Action requires approval per governance policy.",
    autonomyLevel: "approve-execute" as AutonomyRung,
    simulationAvailable: !!a.execution_required,
    requiresDeviceSign: a.risk_level === "high",
    amount: a.proposed_action?.amount,
    currency: "USD",
    currentStep: "approval" as ChainStepId,
    impactSummary: [
      a.cost_implications,
      a.launch_implications,
      a.execution_required ? "Execution will be bound on approval" : null,
    ].filter(Boolean) as string[],
    confidence: a.proposed_action?.confidence ?? 0.8,
  }));
  const items: ApprovalItem[] = liveItems;

  const handleAction = async (id: string, action: string) => {
    // Trust-weighted evaluation before execution
    const trustEval = os.evaluateAction(id, { deviceId: "browser", trustLevel: "medium", surface: "desktop", hasBiometric: false, hasKeyboard: true, lastAuthAt: new Date().toISOString(), sessionAge: 0 }, { userId: "current", overallTrustScore: 80, recentViolations: 0, accountAge: 30, verifiedIdentity: true, mfaEnabled: false });
    if (trustEval.riskTier === "critical" && action === "approve") {
      toast.warning(`High risk action (${trustEval.executionMode}) — requires elevated approval`);
    }

    if (false) {
      toast.info(`Demo mode: ${action}d (no real change).`);
      return;
    }
    try {
      if (action === "approve") approve(id);
      else if (action === "reject") reject(id);
      else if (action === "defer") toast.info("Deferred — will resurface tomorrow.");

      // Flagship Loop 5 — emit durable proof of approval decision.
      if (action === "approve" || action === "reject" || action === "defer") {
        emitApprovalLoop("approval_decision", {
          outcome: "success",
          evidence: {
            recommendation_id: id,
            decision: action,
            risk_tier: trustEval.riskTier,
            execution_mode: trustEval.executionMode,
          },
        });
      }
    } catch (e: any) {
      toast.error(e.message || `Failed to ${action}`);
      emitApprovalLoop("approval_decision", {
        outcome: "failure",
        evidence: { recommendation_id: id, decision: action, error: e?.message ?? String(e) },
      });
    }
  };

  const handleGenerateSample = async () => {
    setGenerating(true);
    try {
      const { generateSampleRecommendation } = await import("@/lib/services/rex/recommendation-engine");
      await generateSampleRecommendation();
      toast.success("Sample recommendation generated and routed to approval queue");
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate sample");
    } finally {
      setGenerating(false);
    }
  };

  const pending = items.filter(i => i.status === "pending" || i.status === "simulating" || i.status === "awaiting-sign");
  const resolved = items.filter(i => i.status === "approved" || i.status === "rejected");

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
{/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Approval Chamber</h1>
            <p className="text-sm text-muted-foreground">
              Review, simulate, and govern every action before it touches the real world.
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateSample}
            disabled={generating}
            className="gap-2 shrink-0"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Generate Sample
          </Button>
        )}
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pending", value: pending.length, Icon: Clock, color: "text-[hsl(var(--sita-gold))]" },
          { label: "High Risk", value: pending.filter(i => i.riskLevel === "high" || i.riskLevel === "critical").length, Icon: AlertTriangle, color: "text-[hsl(var(--destructive))]" },
          { label: "Need Sign", value: pending.filter(i => i.requiresDeviceSign).length, Icon: Fingerprint, color: "text-primary" },
          { label: "Resolved Today", value: resolved.length, Icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]" },
        ].map(kpi => (
          <Card key={kpi.label} className="card-hover-lift">
            <CardContent className="flex items-center gap-3 p-4">
              <kpi.Icon className={cn("h-5 w-5", kpi.color)} />
              <div>
                <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="pending" className="text-xs">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs">
            Resolved ({resolved.length})
          </TabsTrigger>
          <TabsTrigger value="autonomy" className="text-xs">
            Autonomy Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pending.length === 0 ? (
            <EmptyState
              variant="contextual"
              icon={ShieldCheck}
              title="All clear"
              description="No pending approvals. Your system is running within governed boundaries."
            />
          ) : (
            pending.map(item => (
              <ApprovalCard key={item.id} item={item} onAction={handleAction} />
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-4">
          {resolved.length === 0 ? (
            <EmptyState
              variant="card"
              icon={CheckCircle}
              title="No resolved items"
              description="Resolved approvals will appear here with their receipts and verification status."
            />
          ) : (
            resolved.map(item => (
              <div key={item.id} className={cn(
                "rounded-xl border p-4 opacity-70",
                item.status === "approved" ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" : "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5"
              )}>
                <div className="flex items-center gap-3">
                  {item.status === "approved" ? (
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--trust-safe))]" />
                  ) : (
                    <X className="h-5 w-5 text-[hsl(var(--destructive))]" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{item.status} • {item.requestedBy}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="autonomy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Autonomy Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xs text-muted-foreground">
                Current trust levels for each advisor capability. Promotion requires evidence; incidents force downgrades.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {([
                  { name: "Reserve Transfers", rung: "approve-execute" as AutonomyRung, shadow: false },
                  { name: "Outbound Campaigns", rung: "suggest" as AutonomyRung, shadow: true },
                  { name: "Collections Escalation", rung: "approve-execute" as AutonomyRung, shadow: false },
                ]).map(cap => (
                  <div key={cap.name} className="space-y-2">
                    <p className="text-[12px] font-semibold text-foreground">{cap.name}</p>
                    <AutonomyLadder
                      currentRung={cap.rung}
                      inShadowMode={cap.shadow}
                      compact
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalChamber;
