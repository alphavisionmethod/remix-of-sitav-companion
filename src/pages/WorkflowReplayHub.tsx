// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Replay Hub
// Search, queue, and manage workflow replays
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRecoverySummary } from "@/hooks/use-mission-control-views";
import {
  RotateCcw, Search, Play, AlertTriangle, CheckCircle, Clock,
  Filter, ChevronRight, Shield, Zap, Eye,
} from "lucide-react";

interface ReplayableWorkflow {
  id: string;
  name: string;
  domain: string;
  status: "replayable" | "failed" | "risky" | "completed";
  failedAt?: string;
  stuckReason?: string;
  replayCount: number;
  lastReplay?: string;
  riskLevel: "low" | "medium" | "high";
}

const mockReplayable: ReplayableWorkflow[] = [
  { id: "wf-001", name: "Invoice Payment — Acme Corp", domain: "finance", status: "failed", failedAt: new Date(Date.now() - 3600000).toISOString(), stuckReason: "Connector timeout", replayCount: 0, riskLevel: "medium" },
  { id: "wf-002", name: "Lead Follow-up — Enterprise Deal", domain: "business", status: "replayable", replayCount: 1, lastReplay: new Date(Date.now() - 7200000).toISOString(), riskLevel: "low" },
  { id: "wf-003", name: "Grocery Reorder — Weekly Supplies", domain: "concierge", status: "risky", stuckReason: "Payment method expired", replayCount: 0, riskLevel: "high" },
  { id: "wf-004", name: "Customer Health Check — Q1 Batch", domain: "business", status: "completed", replayCount: 2, lastReplay: new Date(Date.now() - 86400000).toISOString(), riskLevel: "low" },
  { id: "wf-005", name: "Budget Reconciliation — March", domain: "finance", status: "replayable", replayCount: 0, riskLevel: "medium" },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  failed: { bg: "bg-destructive/10", text: "text-destructive", label: "Failed" },
  replayable: { bg: "bg-primary/10", text: "text-primary", label: "Ready to Replay" },
  risky: { bg: "bg-accent/10", text: "text-accent", label: "Risky" },
  completed: { bg: "bg-trust-verified/10", text: "text-trust-safe", label: "Completed" },
};

export default function WorkflowReplayHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const recovery = useRecoverySummary();

  const filtered = mockReplayable.filter(w =>
    (filter === "all" || w.status === filter) &&
    (search === "" || w.name.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search))
  );

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <RotateCcw className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Workflow Replay Center</h1>
            <p className="text-sm text-muted-foreground">Search, inspect, and safely replay failed or stuck workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Failed", value: mockReplayable.filter(w => w.status === "failed").length, accent: true },
            { label: "Replayable", value: mockReplayable.filter(w => w.status === "replayable").length },
            { label: "Risky", value: mockReplayable.filter(w => w.status === "risky").length, accent: true },
            { label: "Replay Queue", value: recovery.replayQueue },
          ].map(m => (
            <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.accent ? "border-accent/20 bg-accent/5" : "border-border bg-card/50")}>
              <p className={cn("font-display text-lg font-bold", m.accent ? "text-accent" : "text-foreground")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search & Filters */}
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

      {/* Workflow List */}
      <div className="space-y-2">
        {filtered.map((wf, i) => {
          const s = statusStyles[wf.status];
          return (
            <motion.div key={wf.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card/80 p-4 cursor-pointer hover:border-primary/20 hover:shadow-sm transition-all"
              onClick={() => navigate(`/mission/workflows/${wf.id}/replay`)}
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.bg)}>
                {wf.status === "failed" ? <AlertTriangle className={cn("h-5 w-5", s.text)} /> :
                 wf.status === "risky" ? <Shield className={cn("h-5 w-5", s.text)} /> :
                 wf.status === "completed" ? <CheckCircle className={cn("h-5 w-5", s.text)} /> :
                 <Play className={cn("h-5 w-5", s.text)} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">{wf.name}</p>
                  <Badge variant="outline" className={cn("text-[9px]", s.bg, s.text)}>{s.label}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {wf.domain} · {wf.id} {wf.stuckReason ? `· ${wf.stuckReason}` : ""} {wf.replayCount > 0 ? `· Replayed ${wf.replayCount}x` : ""}
                </p>
              </div>
              <Badge variant="outline" className={cn("text-[9px]",
                wf.riskLevel === "high" ? "bg-destructive/10 text-destructive" :
                wf.riskLevel === "medium" ? "bg-accent/10 text-accent" : ""
              )}>{wf.riskLevel} risk</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
