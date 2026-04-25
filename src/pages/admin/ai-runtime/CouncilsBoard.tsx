// ═══════════════════════════════════════════════════════════════
// SITA OS — Councils Operator Board (Phase 4)
//
// Per-council aggregate view with pending escalation drilldown
// and supervisor-decision audit trail.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { OperatorActionPanel } from "@/admin/components/operator/OperatorActionPanel";
import { severityTone } from "@/platform/admin/components/admin/ai-runtime/_shared/status-tone-maps";
import { supabase } from "@/integrations/supabase/client";
import {
  loadCouncilSummaries,
  loadOpenEscalations,
  loadRecentSupervisorDecisions,
  type CouncilSummary,
  type CouncilEscalationRow,
} from "@/lib/internal-agents/runtime/internal-agent-registry";
import {
  resolveEscalation,
  escalateToMeta,
} from "@/lib/internal-agents/runtime/supervisor-actions";
import { ShieldAlert, ShieldCheck, Activity, Users, ArrowUp } from "lucide-react";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { Skeleton } from "@/components/primitives/feedback/Skeleton";

const COUNCIL_LABEL: Record<string, string> = {
  "product-build": "Product Build",
  "reliability-ops": "Reliability Ops",
  "security-trust": "Security Trust",
  "runtime-cost": "Runtime Cost",
  "architecture-governance": "Architecture",
  "knowledge-coordination": "Knowledge",
};

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

export default function CouncilsBoard() {
  const qc = useQueryClient();
  const [selectedEscId, setSelectedEscId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const { data: summaries } = useQuery({
    queryKey: ["council-summaries"],
    queryFn: loadCouncilSummaries,
    refetchInterval: 20_000,
  });

  const { data: escalations } = useQuery({
    queryKey: ["council-escalations"],
    queryFn: () => loadOpenEscalations(),
    refetchInterval: 15_000,
  });

  const { data: decisions } = useQuery({
    queryKey: ["supervisor-decisions"],
    queryFn: () => loadRecentSupervisorDecisions(20),
    refetchInterval: 30_000,
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("councils-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "council_escalations" },
        () => {
          qc.invalidateQueries({ queryKey: ["council-escalations"] });
          qc.invalidateQueries({ queryKey: ["council-summaries"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "supervisor_decisions" },
        () => qc.invalidateQueries({ queryKey: ["supervisor-decisions"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const selectedEsc = escalations?.find((e: any) => e.id === selectedEscId);

  const handleResolve = async (action: "approve" | "reject" | "dismiss") => {
    if (!selectedEsc) return;
    if (!resolution || resolution.length < 10) {
      toast.error("Resolution rationale required (≥ 10 chars)");
      return;
    }
    try {
      await resolveEscalation({
        supervisorKey: selectedEsc.target_supervisor,
        decisionType: action,
        targetEscalationId: selectedEsc.id,
        rationale: resolution,
        resolution: action,
      });
      toast.success(`Escalation ${action}d`);
      setSelectedEscId(null);
      setResolution("");
      qc.invalidateQueries({ queryKey: ["council-escalations"] });
    } catch (e) {
      toast.error(`Resolve failed`, { description: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleEscalateMeta = async () => {
    if (!selectedEsc) return;
    try {
      await escalateToMeta({
        supervisorKey: selectedEsc.target_supervisor,
        decisionType: "escalate_meta",
        targetEscalationId: selectedEsc.id,
        rationale: resolution || "Escalated to chief-of-staff for adjudication",
      });
      toast.success("Escalated to chief-of-staff");
      setSelectedEscId(null);
      setResolution("");
      qc.invalidateQueries({ queryKey: ["council-escalations"] });
    } catch (e) {
      toast.error("Escalate failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  const escByCouncil = new Map<string, CouncilEscalationRow[]>();
  (escalations ?? []).forEach((e: any) => {
    const arr = escByCouncil.get(e.source_council) ?? [];
    arr.push(e);
    escByCouncil.set(e.source_council, arr);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <AITruthDisclosure mode="live-gateway" to="/admin/ai-runtime" />
      </div>
      {/* Council panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(summaries ?? []).map((s) => (
          <CouncilPanel
            key={s.council}
            summary={s}
            openEsc={escByCouncil.get(s.council) ?? []}
            onSelectEsc={setSelectedEscId}
          />
        ))}
        {(!summaries || summaries.length === 0) && (
          <Card className="p-4 col-span-full space-y-2" aria-busy="true">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/5" />
          </Card>
        )}
      </div>

      {/* Open escalations queue */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
          <h3 className="text-xs font-semibold uppercase tracking-wide">
            Open escalations ({escalations?.length ?? 0})
          </h3>
        </div>
        <div className="space-y-1.5">
          {(escalations ?? []).map((e: any) => (
            <button
              key={e.id}
              onClick={() => setSelectedEscId(e.id)}
              className="w-full text-left p-2 rounded-md hover:bg-accent/50 border border-border/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={severityTone(e.severity)} size="xs">
                    {e.severity}
                  </StatusBadge>
                  <span className="text-xs font-medium">{e.source_agent_id}</span>
                  <span className="text-[10px] text-muted-foreground">→ {e.target_supervisor}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{relTime(e.created_at)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{e.escalation_reason}</p>
            </button>
          ))}
          {(escalations?.length ?? 0) === 0 && (
            <EmptyState
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No open escalations"
              description="All councils are within their autonomy envelope. New escalations appear here automatically as soon as a council requests supervisor input."
            />
          )}
          {(escalations?.length ?? 0) === 0 && (
            <OperatorActionPanel
              next={[{ label: "Open Trust Ladder", href: "/admin/ai-runtime?tab=trust-ladder" }]}
              evidence={[{ label: "Open Internal Agents", href: "/admin/ai-runtime?tab=internal-agents" }]}
            />
          )}
        </div>
      </Card>

      {/* Recent decisions */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wide">
            Recent supervisor decisions
          </h3>
        </div>
        <div className="space-y-1">
          {(decisions ?? []).map((d: any) => (
            <div key={d.id} className="text-[11px] flex items-center gap-2 py-1 border-b border-border/30 last:border-0">
              <StatusBadge tone="muted" size="xs">{d.decision_type}</StatusBadge>
              <span className="font-mono text-[10px]">{d.supervisor_key}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-mono text-[10px]">{d.target_agent_id ?? d.target_escalation_id ?? "—"}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{relTime(d.created_at)}</span>
            </div>
          ))}
          {(decisions?.length ?? 0) === 0 && (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No supervisor decisions in the recent window"
              description="Resolutions and meta-escalations from supervisors will be listed here as they happen, with the target agent or escalation ID and timing."
            />
          )}
        </div>
      </Card>

      {/* Resolution drawer */}
      {selectedEsc && (
        <Card className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[480px] p-3 shadow-lg border-primary/30 z-50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Resolve escalation</p>
              <p className="text-xs font-semibold">{selectedEsc.source_agent_id}</p>
              <StatusBadge tone={severityTone(selectedEsc.severity)} size="xs" className="mt-1">
                {selectedEsc.severity}
              </StatusBadge>
            </div>
            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setSelectedEscId(null)}>
              Cancel
            </Button>
          </div>
          <p className="text-[11px] mb-2">{selectedEsc.escalation_reason}</p>
          <Textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Resolution rationale (≥ 10 chars)…"
            className="text-xs h-16 mb-2"
          />
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" className="h-7 text-xs" onClick={() => handleResolve("approve")}>
              Approve
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleResolve("reject")}>
              Reject
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleResolve("dismiss")}>
              Dismiss
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs ml-auto" onClick={handleEscalateMeta}>
              <ArrowUp className="h-3 w-3 mr-1" /> Meta
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function CouncilPanel({
  summary,
  openEsc,
  onSelectEsc,
}: {
  summary: CouncilSummary;
  openEsc: any[];
  onSelectEsc: (id: string) => void;
}) {
  const healthTone =
    summary.errorAgents > 0 ? "border-destructive/40" :
    summary.openEscalations > 0 ? "border-amber-500/40" :
    "border-emerald-500/30";

  return (
    <Card className={`p-3 ${healthTone}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold">{COUNCIL_LABEL[summary.council] ?? summary.council}</h3>
        <StatusBadge tone="muted" size="xs">
          {summary.totalAgents} agents
        </StatusBadge>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <Stat icon={<Activity className="h-3 w-3" />} label="Active" value={summary.activeAgents} />
        <Stat icon={<Users className="h-3 w-3" />} label="Suspended" value={summary.suspendedAgents} />
        <Stat icon={<Activity className="h-3 w-3 text-sky-500" />} label="24h actions" value={summary.recentActions24h} />
        <Stat icon={<ShieldAlert className="h-3 w-3 text-amber-500" />} label="Open esc." value={summary.openEscalations} />
      </div>
      <div className="mt-2 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Avg trust</span>
          <span className="font-medium tabular-nums">{(summary.averageTrustScore * 100).toFixed(0)}%</span>
        </div>
      </div>
      {openEsc.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Pending</p>
          {openEsc.slice(0, 3).map((e) => (
            <button
              key={e.id}
              onClick={() => onSelectEsc(e.id)}
              className="w-full text-left text-[10px] hover:underline flex items-center gap-1"
            >
              <StatusBadge tone={severityTone(e.severity)} size="xs">
                {e.severity}
              </StatusBadge>
              <span className="truncate">{e.source_agent_id}</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium tabular-nums ml-auto">{value}</span>
    </div>
  );
}
