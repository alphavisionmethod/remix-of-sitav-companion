// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Replay Center
// Search, queue, and manage workflow replays
// Wired to ReplayRecoveryEngine via useOSRuntime
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminPageHeader, TrustRibbon, StatusBadge } from "@/platform/sita/components/sita/admin";
import { useOSRuntime } from "@/hooks/useOSRuntime";
import { useRecoverySummary } from "@/hooks/use-mission-control-views";
import type { ReplayableWorkflowView } from "@/packages/contracts";
import { useReplayableWorkflows } from "@/hooks/use-domain-data";
import {
  RotateCcw, Search, Play, AlertTriangle, CheckCircle, Clock,
  ChevronRight, Shield, Zap, Eye,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function WorkflowReplayHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const recovery = useRecoverySummary();
  const { engines } = useOSRuntime();
  const replayEngineStats = useMemo(() => engines?.replay?.getStats() ?? { totalPackets: 0, totalRollbacks: 0, completedRollbacks: 0, failedRollbacks: 0, diagnosticBundles: 0 }, [engines]);

  const { data: replayableData = [] } = useReplayableWorkflows();
  // Engine-backed replayable workflows
  const replayable: ReplayableWorkflowView[] = useMemo(() => {
    return replayableData as ReplayableWorkflowView[];
  }, [replayableData]);

  const filtered = replayable.filter(w =>
    (filter === "all" || w.status === filter) &&
    (search === "" || w.name.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search))
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
<AdminPageHeader icon={RotateCcw} title="Workflow Replay Center" subtitle="Search, inspect, and safely replay failed or stuck workflows">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-5">
          {[
            { label: "Failed", value: replayable.filter(w => w.status === "failed").length, ok: false },
            { label: "Replayable", value: replayable.filter(w => w.status === "replayable").length, ok: true },
            { label: "Risky", value: replayable.filter(w => w.status === "risky").length, ok: false },
            { label: "Replay Queue", value: recovery.replayQueue, ok: true },
          ].map(m => (
            <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.ok ? "border-border bg-card/50" : "border-accent/20 bg-accent/5")}>
              <p className={cn("font-display text-lg font-bold", m.ok ? "text-foreground" : "text-accent")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-3">
          {[
            { label: "Replay Packets", value: replayEngineStats.totalPackets },
            { label: "Rollbacks", value: replayEngineStats.totalRollbacks },
            { label: "Completed", value: replayEngineStats.completedRollbacks },
            { label: "Diagnostics", value: replayEngineStats.diagnosticBundles },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-border/50 px-3 py-2 text-center bg-card/30">
              <p className="font-display text-sm font-bold text-muted-foreground">{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </AdminPageHeader>

      <TrustRibbon />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by workflow name or ID..." className="pl-10 h-9 text-xs" />
        </div>
        <div className="flex gap-1">
          {["all", "failed", "replayable", "risky", "completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all",
                filter === f ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((wf, i) => (
          <motion.div key={wf.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 rounded-xl border border-border bg-card/80 p-4 cursor-pointer hover:border-primary/20 hover:shadow-sm transition-all"
            onClick={() => navigate(`/mission/workflows/${wf.id}/replay`)}
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
              wf.status === "failed" ? "bg-destructive/10" : wf.status === "risky" ? "bg-accent/10" : wf.status === "completed" ? "bg-trust-verified/10" : "bg-primary/10"
            )}>
              {wf.status === "failed" ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
               wf.status === "risky" ? <Shield className="h-5 w-5 text-accent" /> :
               wf.status === "completed" ? <CheckCircle className="h-5 w-5 text-trust-safe" /> :
               <Play className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground truncate">{wf.name}</p>
                <StatusBadge status={wf.status} size="xs" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {wf.domain} · {wf.id} {wf.stuckReason ? `· ${wf.stuckReason}` : ""} {wf.replayCount > 0 ? `· Replayed ${wf.replayCount}x` : ""}
              </p>
            </div>
            <StatusBadge status={`${wf.riskLevel} risk`} size="xs" />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}