// ═══════════════════════════════════════════════════════════════
// SITA OS — Incident Detail Page
// Deep investigation: timeline, root cause, mitigation, rollback
// ═══════════════════════════════════════════════════════════════

import { useParams, useNavigate } from "react-router-dom";
import { useIncidentDetail } from "@/hooks/use-mission-control-views";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, AlertTriangle, Shield, Clock, CheckCircle, XCircle,
  RotateCcw, Users, GitBranch, Wifi, Activity, Eye, Loader2,
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const severityColor: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-accent/10 text-accent border-accent/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border",
};

const statusIcon: Record<string, React.ElementType> = {
  done: CheckCircle, in_progress: Loader2, pending: Clock,
};

export default function IncidentDetailPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const detail = useIncidentDetail(incidentId || "");

  if (!detail) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
<button onClick={() => navigate("/mission-control")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Mission Control
        </button>
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Incident not found</p>
          <p className="text-xs text-muted-foreground mt-1">Incident "{incidentId}" does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-5">
      <button onClick={() => navigate("/mission-control")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Mission Control
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className={cn("rounded-2xl border p-6",
          detail.severity === "critical" ? "border-destructive/20 bg-destructive/3" : "border-accent/15 bg-accent/3"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className={cn("text-[10px]", severityColor[detail.severity])}>{detail.severity}</Badge>
              <Badge variant="outline" className="text-[10px]">{detail.status}</Badge>
              {detail.ttc && <Badge variant="outline" className="text-[10px] bg-trust-verified/10 text-trust-safe">TTR: {detail.ttc}</Badge>}
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">{detail.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Affected: {detail.affectedModules.join(", ")} · {detail.impactedUsers} users impacted · Trust: {detail.trustImpact}
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5 text-center">
            <p className="font-display text-lg font-bold text-foreground">{detail.impactedUsers}</p>
            <p className="text-[9px] text-muted-foreground">Impacted Users</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5 text-center">
            <p className="font-display text-lg font-bold text-foreground">{detail.mitigationActions.filter(a => a.status === "done").length}/{detail.mitigationActions.length}</p>
            <p className="text-[9px] text-muted-foreground">Actions Complete</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5 text-center">
            <p className="font-display text-lg font-bold text-foreground">{detail.rollbackCandidates.length}</p>
            <p className="text-[9px] text-muted-foreground">Rollback Options</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5 text-center">
            <p className="font-display text-lg font-bold text-foreground">{detail.relatedWorkflows.length}</p>
            <p className="text-[9px] text-muted-foreground">Affected Workflows</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timeline */}
        <SitaCard hover={false}>
          <SitaCardTitle sub={`${detail.timeline.length} events`}>Incident Timeline</SitaCardTitle>
          <div className="mt-4 space-y-1 border-l-2 border-border/40 ml-3 pl-4">
            {detail.timeline.map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 py-2 relative"
              >
                <div className="absolute -left-[1.35rem] top-3 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary/50" />
                <div>
                  <p className="text-xs text-foreground">{entry.event}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(entry.time).toLocaleTimeString()} · {entry.actor}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </SitaCard>

        {/* Root Cause */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Working hypothesis">Root Cause Analysis</SitaCardTitle>
          <div className="mt-4 rounded-xl bg-secondary/30 p-4">
            <p className="text-sm text-foreground leading-relaxed">{detail.rootCauseHypothesis}</p>
          </div>
          {detail.resolutionSummary && (
            <div className="mt-3 rounded-xl bg-trust-verified/5 border border-trust-verified/15 p-4">
              <p className="text-xs font-semibold text-trust-safe mb-1">Resolution</p>
              <p className="text-sm text-foreground">{detail.resolutionSummary}</p>
            </div>
          )}
        </SitaCard>

        {/* Mitigation Actions */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Recovery steps">Mitigation Actions</SitaCardTitle>
          <div className="mt-4 space-y-2">
            {detail.mitigationActions.map((action, i) => {
              const Icon = statusIcon[action.status] || Clock;
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/20 px-3 py-2.5">
                  <Icon className={cn("h-4 w-4 shrink-0",
                    action.status === "done" ? "text-trust-safe" : action.status === "in_progress" ? "text-primary animate-spin" : "text-muted-foreground"
                  )} />
                  <span className="text-xs text-foreground flex-1">{action.label}</span>
                  <Badge variant="outline" className={cn("text-[9px]",
                    action.status === "done" ? "bg-trust-verified/10 text-trust-safe" :
                    action.status === "in_progress" ? "bg-primary/10 text-primary" : ""
                  )}>{action.status}</Badge>
                </div>
              );
            })}
          </div>
        </SitaCard>

        {/* Rollback Candidates */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Available recovery paths">Rollback Candidates</SitaCardTitle>
          <div className="mt-4 space-y-2">
            {detail.rollbackCandidates.length > 0 ? detail.rollbackCandidates.map(rb => (
              <div key={rb.id} className="flex items-center justify-between rounded-xl border border-border bg-card/80 p-3">
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{rb.label}</p>
                    <p className="text-[10px] text-muted-foreground">Risk: {rb.risk}</p>
                  </div>
                </div>
                <button className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] text-primary hover:bg-primary/10 transition-colors">
                  Execute
                </button>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-xs text-muted-foreground">No rollback candidates available</p>
              </div>
            )}
          </div>
        </SitaCard>
      </div>
    </div>
  );
}
