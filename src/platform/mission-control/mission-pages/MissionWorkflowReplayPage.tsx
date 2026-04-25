// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Replay Detail
// Event sequence, policy path, receipts, verification, replay
// ═══════════════════════════════════════════════════════════════

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RotateCcw, ChevronLeft, CheckCircle, AlertTriangle, Shield,
  Workflow, Clock, FileCheck, Zap, Eye, Play, XCircle,
  ArrowRight, Lock, Wifi, Receipt,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface WorkflowEvent {
  id: string;
  step: number;
  type: "action" | "policy-check" | "approval" | "connector" | "receipt" | "verification" | "failure";
  title: string;
  timestamp: string;
  status: "completed" | "failed" | "skipped";
  details?: string;
}

const workflowData = {
  id: "wf-001",
  name: "Invoice Payment — Acme Corp",
  domain: "finance",
  status: "failed" as const,
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  failedAt: new Date(Date.now() - 3500000).toISOString(),
  failureReason: "Connector timeout after 3 retries — Plaid API returned 504",
  replayable: true,
  replayCount: 0,
  events: [
    { id: "e1", step: 1, type: "action" as const, title: "Invoice payment initiated", timestamp: new Date(Date.now() - 3600000).toISOString(), status: "completed" as const, details: "Amount: $4,200 to Acme Corp" },
    { id: "e2", step: 2, type: "policy-check" as const, title: "Spend policy evaluated", timestamp: new Date(Date.now() - 3595000).toISOString(), status: "completed" as const, details: "Within daily limit ($10K). Auto-approved." },
    { id: "e3", step: 3, type: "approval" as const, title: "Auto-approval granted", timestamp: new Date(Date.now() - 3590000).toISOString(), status: "completed" as const, details: "Policy: finance.auto-approve < $5K" },
    { id: "e4", step: 4, type: "receipt" as const, title: "Pre-execution receipt created", timestamp: new Date(Date.now() - 3585000).toISOString(), status: "completed" as const, details: "Receipt #RCP-8842" },
    { id: "e5", step: 5, type: "connector" as const, title: "Plaid payment execution", timestamp: new Date(Date.now() - 3580000).toISOString(), status: "failed" as const, details: "504 Gateway Timeout — 3 retries exhausted" },
    { id: "e6", step: 6, type: "verification" as const, title: "Post-condition verification", timestamp: new Date(Date.now() - 3500000).toISOString(), status: "skipped" as const, details: "Skipped due to connector failure" },
  ],
};

const typeIcons: Record<string, React.ElementType> = {
  action: Zap, "policy-check": Shield, approval: CheckCircle, connector: Wifi,
  receipt: Receipt, verification: FileCheck, failure: XCircle,
};

const typeColors: Record<string, string> = {
  action: "bg-primary/10 text-primary", "policy-check": "bg-primary/10 text-primary",
  approval: "bg-trust-verified/10 text-trust-safe", connector: "bg-accent/10 text-accent",
  receipt: "bg-sita-gold/10 text-sita-gold", verification: "bg-primary/10 text-primary",
  failure: "bg-destructive/10 text-destructive",
};

export default function MissionWorkflowReplayPage() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [simulating, setSimulating] = useState(false);
  const wf = workflowData; // In production: fetch by workflowId

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/workflow-replay")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 shadow-lg shadow-accent/10">
            <RotateCcw className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{wf.name}</h1>
            <p className="text-sm text-muted-foreground">Workflow Replay — {wf.domain}</p>
          </div>
          <Badge variant="outline" className="ml-auto bg-destructive/10 text-destructive text-xs">{wf.status}</Badge>
        </div>
      </motion.div>

      {/* Failure summary */}
      <SitaCard hover={false} className="border-destructive/15 bg-destructive/3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Failure Reason</p>
            <p className="text-xs text-muted-foreground mt-1">{wf.failureReason}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Failed at {new Date(wf.failedAt).toLocaleString()}</p>
          </div>
        </div>
      </SitaCard>

      {/* Event timeline */}
      <SitaSectionHeader title="Event Sequence" subtitle={`${wf.events.length} steps in this workflow`} />
      <div className="space-y-1">
        {wf.events.map((event, i) => {
          const Icon = typeIcons[event.type] || Zap;
          const color = typeColors[event.type] || "bg-secondary text-muted-foreground";
          return (
            <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={cn("flex items-start gap-3 rounded-xl p-4 transition-all",
                event.status === "failed" ? "border border-destructive/20 bg-destructive/5" :
                event.status === "skipped" ? "opacity-50" : "border border-border/30 bg-card/50"
              )}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {i < wf.events.length - 1 && <div className="w-px h-4 bg-border/50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono">Step {event.step}</span>
                    <p className="text-xs font-semibold text-foreground">{event.title}</p>
                    <Badge variant="outline" className={cn("text-[9px]",
                      event.status === "completed" ? "bg-trust-verified/10 text-trust-safe" :
                      event.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                    )}>{event.status}</Badge>
                  </div>
                  {event.details && <p className="text-[10px] text-muted-foreground">{event.details}</p>}
                  <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(event.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Replay controls */}
      <SitaCard hover={false} className="border-primary/10 bg-gradient-to-br from-primary/3 to-card">
        <SitaCardTitle sub="Replay this workflow from the failed step">Replay Controls</SitaCardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Replay will re-execute from Step 5 (Plaid payment execution)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Policy and approval state will be preserved from original run</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileCheck className="h-3.5 w-3.5" />
            <span>Post-replay verification will run automatically</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setSimulating(true)}
              className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            ><Eye className="h-3.5 w-3.5" /> Simulate First</button>
            <button className="flex items-center gap-2 rounded-xl bg-trust-verified/10 px-4 py-2.5 text-xs font-medium text-trust-safe hover:bg-trust-verified/20 transition-colors">
              <Play className="h-3.5 w-3.5" /> Replay Now
            </button>
          </div>
          {simulating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl border border-primary/15 bg-primary/5 p-4 mt-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-primary">Simulation Result</p>
              </div>
              <p className="text-[11px] text-muted-foreground">Simulated replay would succeed — Plaid API is now responding normally (avg 120ms). Estimated completion: 2.3s. No policy violations detected.</p>
            </motion.div>
          )}
        </div>
      </SitaCard>
    </div>
  );
}
