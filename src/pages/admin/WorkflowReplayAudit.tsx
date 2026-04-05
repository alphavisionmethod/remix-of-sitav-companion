import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Play, CheckCircle, XCircle, Clock, User, ArrowRight, Eye, Search, Hash, Layers, Shield, RefreshCw, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WorkflowRun {
  id: string;
  workflowName: string;
  status: "completed" | "failed" | "running" | "rolled-back";
  startedAt: string;
  completedAt?: string;
  actor: string;
  steps: WorkflowStep[];
  receiptId?: string;
  rollbackRef?: string;
  branchPath: string;
}

interface WorkflowStep {
  name: string;
  status: "completed" | "failed" | "skipped" | "pending";
  type: "action" | "approval" | "decision" | "event" | "check";
  actor?: string;
  timestamp: string;
  duration?: string;
  output?: string;
  receiptRef?: string;
}

const RUNS: WorkflowRun[] = [
  {
    id: "WF-RUN-001", workflowName: "Invoice Approval & Payment", status: "completed", startedAt: "2h ago", completedAt: "1h 45m ago", actor: "owner", receiptId: "REC-W001", branchPath: "standard → approved → paid",
    steps: [
      { name: "Invoice submitted", status: "completed", type: "event", timestamp: "2h ago", actor: "system" },
      { name: "Validation check", status: "completed", type: "check", timestamp: "2h ago", duration: "0.3s", output: "Valid: amount=$450, vendor=trusted" },
      { name: "Policy evaluation", status: "completed", type: "decision", timestamp: "1h 58m ago", duration: "0.1s", output: "Route: manual approval (amount > $100)" },
      { name: "Owner approval", status: "completed", type: "approval", timestamp: "1h 50m ago", actor: "owner", receiptRef: "REC-A012" },
      { name: "Payment execution", status: "completed", type: "action", timestamp: "1h 48m ago", duration: "2.1s", output: "Payment confirmed via Stripe" },
      { name: "Receipt generation", status: "completed", type: "event", timestamp: "1h 47m ago", receiptRef: "REC-P042" },
      { name: "Audit log entry", status: "completed", type: "event", timestamp: "1h 47m ago" },
    ],
  },
  {
    id: "WF-RUN-002", workflowName: "Connector Re-authentication", status: "failed", startedAt: "6h ago", actor: "system", branchPath: "detect → notify → timeout",
    steps: [
      { name: "Staleness detected", status: "completed", type: "event", timestamp: "6h ago", output: "Google Calendar: 4h stale" },
      { name: "Re-auth notification sent", status: "completed", type: "action", timestamp: "5h 55m ago" },
      { name: "User re-auth", status: "failed", type: "approval", timestamp: "—", output: "Timeout: no response in 4h" },
      { name: "Escalation", status: "skipped", type: "action", timestamp: "—" },
    ],
  },
  {
    id: "WF-RUN-003", workflowName: "AI Model Downgrade", status: "completed", startedAt: "12h ago", completedAt: "12h ago", actor: "model_router", receiptId: "REC-W003", branchPath: "detect → downgrade → verify",
    steps: [
      { name: "Latency threshold breached", status: "completed", type: "event", timestamp: "12h ago", output: "p95 > 8s for 15min" },
      { name: "Fallback model selected", status: "completed", type: "decision", timestamp: "12h ago", output: "gpt-4 → gpt-4o-mini" },
      { name: "Model swap executed", status: "completed", type: "action", timestamp: "12h ago", duration: "0.5s" },
      { name: "Post-swap verification", status: "completed", type: "check", timestamp: "11h 58m ago", output: "Latency normalized: p95 = 1.8s" },
      { name: "Cost ledger updated", status: "completed", type: "event", timestamp: "11h 58m ago" },
    ],
  },
  {
    id: "WF-RUN-004", workflowName: "Bulk Lead Import", status: "rolled-back", startedAt: "1d ago", actor: "owner", rollbackRef: "RB-001", branchPath: "import → validate → rollback",
    steps: [
      { name: "CSV uploaded", status: "completed", type: "event", timestamp: "1d ago", output: "142 records" },
      { name: "Validation", status: "completed", type: "check", timestamp: "1d ago", output: "12 duplicate emails detected" },
      { name: "Import executed", status: "completed", type: "action", timestamp: "1d ago", output: "130 records imported" },
      { name: "Owner review", status: "completed", type: "approval", timestamp: "23h ago", actor: "owner", output: "Rejected: wrong segment mapping" },
      { name: "Rollback executed", status: "completed", type: "action", timestamp: "23h ago", duration: "1.2s", output: "130 records removed" },
    ],
  },
];

const STEP_ICONS: Record<string, { icon: typeof CheckCircle; color: string }> = {
  action: { icon: Play, color: "text-blue-400" },
  approval: { icon: Shield, color: "text-purple-400" },
  decision: { icon: GitBranch, color: "text-amber-400" },
  event: { icon: Layers, color: "text-muted-foreground" },
  check: { icon: FileCheck, color: "text-emerald-400" },
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-emerald-400", failed: "text-red-400", running: "text-blue-400", "rolled-back": "text-amber-400", skipped: "text-muted-foreground", pending: "text-muted-foreground",
};

export default function WorkflowReplayAudit() {
  const [tab, setTab] = useState("runs");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>("WF-RUN-001");

  const filtered = RUNS.filter(r => !search || r.workflowName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Workflow Replay & Audit</h1>
        <p className="text-sm text-muted-foreground">Event sequence reconstruction, branch visibility, actor history, and receipt references</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Runs", value: RUNS.length },
          { label: "Completed", value: RUNS.filter(r => r.status === "completed").length, color: "text-emerald-400" },
          { label: "Failed", value: RUNS.filter(r => r.status === "failed").length, color: "text-red-400" },
          { label: "Rolled Back", value: RUNS.filter(r => r.status === "rolled-back").length, color: "text-amber-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50"><CardContent className="p-3 text-center">
            <p className={cn("text-xl font-bold", k.color || "text-foreground")}>{k.value}</p>
            <p className="text-[9px] text-muted-foreground">{k.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search workflows..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map((run, idx) => {
          const isExpanded = expanded === run.id;
          return (
            <motion.div key={run.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Card className={cn("bg-card/50 border-border/50 hover:border-primary/20 transition-colors cursor-pointer", isExpanded && "border-primary/30")} onClick={() => setExpanded(isExpanded ? null : run.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className={cn("w-4 h-4", STATUS_COLORS[run.status])} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">{run.id}</span>
                          <Badge variant="outline" className={cn("text-[9px] capitalize", STATUS_COLORS[run.status])}>{run.status}</Badge>
                          {run.receiptId && <Badge variant="outline" className="text-[8px]">{run.receiptId}</Badge>}
                          {run.rollbackRef && <Badge variant="outline" className="text-[8px] text-amber-400">Rollback: {run.rollbackRef}</Badge>}
                        </div>
                        <p className="text-sm font-medium text-foreground mt-0.5">{run.workflowName}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span><User className="w-3 h-3 inline mr-0.5" />{run.actor}</span>
                          <span><Clock className="w-3 h-3 inline mr-0.5" />{run.startedAt}</span>
                          <span className="font-mono">{run.branchPath}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{run.steps.length} steps</p>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-border/30">
                      <div className="space-y-2">
                        {run.steps.map((step, si) => {
                          const stepCfg = STEP_ICONS[step.type];
                          const SIcon = stepCfg.icon;
                          return (
                            <div key={si} className="flex items-start gap-3 relative">
                              {si < run.steps.length - 1 && <div className="absolute left-[9px] top-6 w-px h-[calc(100%)] bg-border/30" />}
                              <div className={cn("p-1 rounded-md flex-shrink-0 z-10", step.status === "completed" ? "bg-emerald-500/10" : step.status === "failed" ? "bg-red-500/10" : "bg-muted/30")}>
                                <SIcon className={cn("w-3 h-3", STATUS_COLORS[step.status])} />
                              </div>
                              <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-medium text-foreground">{step.name}</p>
                                  <Badge variant="outline" className="text-[8px]">{step.type}</Badge>
                                  {step.actor && <span className="text-[10px] text-muted-foreground">{step.actor}</span>}
                                  {step.duration && <span className="text-[10px] text-muted-foreground">{step.duration}</span>}
                                  {step.receiptRef && <Badge variant="outline" className="text-[8px] text-primary">{step.receiptRef}</Badge>}
                                </div>
                                {step.output && <p className="text-[10px] text-muted-foreground mt-0.5">{step.output}</p>}
                                <p className="text-[9px] text-muted-foreground">{step.timestamp}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-[10px] h-7"><RefreshCw className="w-3 h-3 mr-1" />Replay</Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-7"><Eye className="w-3 h-3 mr-1" />Full Trace</Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
