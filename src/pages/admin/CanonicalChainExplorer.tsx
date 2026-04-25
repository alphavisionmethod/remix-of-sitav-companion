import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  Link2, Zap, Shield, CheckCircle, Play, FileText, Database, ArrowRight,
  GitBranch, RotateCcw, Clock, Eye, AlertTriangle, RefreshCw
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

type StepStatus = "verified" | "pending" | "failed" | "skipped";
const stepStatusConfig: Record<StepStatus, { color: string; bg: string }> = {
  verified: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  pending: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  failed: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  skipped: { color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
};

interface ChainStep {
  label: string;
  icon: typeof Zap;
  status: StepStatus;
  detail: string;
  ref?: string;
  timestamp?: string;
}

interface Chain {
  id: string;
  capability: string;
  actionId: string;
  actor: string;
  replayable: boolean;
  rollbackable: boolean;
  steps: ChainStep[];
}

const CHAINS: Chain[] = [
  {
    id: "chain-1", capability: "approval.create", actionId: "act-4401", actor: "admin@sita.os", replayable: true, rollbackable: true,
    steps: [
      { label: "Trigger", icon: Zap, status: "verified", detail: "User initiated approval request from ApprovalChamber", ref: "trg-001", timestamp: "2026-04-05T10:20:00Z" },
      { label: "Policy Evaluation", icon: Shield, status: "verified", detail: "policy-engine evaluated 3 rules — all passed. Decision: auto-approve path blocked, requires council.", ref: "pol-dec-882", timestamp: "2026-04-05T10:20:01Z" },
      { label: "Approval Branch", icon: GitBranch, status: "verified", detail: "Routed to council-approval branch. 2/3 council members approved within 12m.", ref: "apr-882", timestamp: "2026-04-05T10:32:00Z" },
      { label: "Execution", icon: Play, status: "verified", detail: "executor-service applied approval. Target: policy pol-42 activation.", ref: "exec-ref-220", timestamp: "2026-04-05T10:32:05Z" },
      { label: "Event Emission", icon: Database, status: "verified", detail: "3 events emitted: approval.completed, policy.activated, audit.entry.created", ref: "evt-batch-55", timestamp: "2026-04-05T10:32:06Z" },
      { label: "Receipt", icon: FileText, status: "verified", detail: "Receipt generated with full lineage hash chain. Integrity: valid.", ref: "rcpt-901", timestamp: "2026-04-05T10:32:07Z" },
      { label: "Projection Update", icon: Eye, status: "verified", detail: "boardroom-summary, policy-registry projections updated. Lag: <200ms.", timestamp: "2026-04-05T10:32:07Z" },
    ],
  },
  {
    id: "chain-2", capability: "connector.refresh", actionId: "act-4402", actor: "system", replayable: true, rollbackable: false,
    steps: [
      { label: "Trigger", icon: Zap, status: "verified", detail: "Scheduled sync trigger for connector conn-7 (Google Calendar)", timestamp: "2026-04-05T10:21:00Z" },
      { label: "Policy Evaluation", icon: Shield, status: "verified", detail: "Connector refresh policy passed — within rate limit, no blocked domains", ref: "pol-dec-883", timestamp: "2026-04-05T10:21:01Z" },
      { label: "Approval Branch", icon: GitBranch, status: "skipped", detail: "No approval required for automated connector refresh" },
      { label: "Execution", icon: Play, status: "verified", detail: "Connector sync executed — 47 events fetched, 3 new entries", ref: "exec-ref-221", timestamp: "2026-04-05T10:21:15Z" },
      { label: "Event Emission", icon: Database, status: "verified", detail: "connector.synced event emitted", ref: "evt-442", timestamp: "2026-04-05T10:21:16Z" },
      { label: "Receipt", icon: FileText, status: "verified", detail: "Sync receipt generated", ref: "rcpt-902", timestamp: "2026-04-05T10:21:16Z" },
      { label: "Projection Update", icon: Eye, status: "pending", detail: "calendar-projection update in progress — lag 1.2s" },
    ],
  },
  {
    id: "chain-3", capability: "user.role.update", actionId: "act-4403", actor: "admin@sita.os", replayable: true, rollbackable: true,
    steps: [
      { label: "Trigger", icon: Zap, status: "verified", detail: "Admin initiated role change for user u-18: member → admin", timestamp: "2026-04-05T10:18:00Z" },
      { label: "Policy Evaluation", icon: Shield, status: "verified", detail: "Role elevation policy requires council approval for admin role", ref: "pol-dec-884", timestamp: "2026-04-05T10:18:01Z" },
      { label: "Approval Branch", icon: GitBranch, status: "pending", detail: "Council approval pending — 1/2 approvals received, awaiting second", ref: "apr-pending-44" },
      { label: "Execution", icon: Play, status: "pending", detail: "Blocked — awaiting approval completion" },
      { label: "Event Emission", icon: Database, status: "pending", detail: "Waiting for execution" },
      { label: "Receipt", icon: FileText, status: "pending", detail: "Waiting for execution" },
      { label: "Projection Update", icon: Eye, status: "pending", detail: "Waiting for execution" },
    ],
  },
];

const CanonicalChainExplorer = () => {
  const [selectedChainId, setSelectedChainId] = useState(CHAINS[0].id);
  const selectedChain = CHAINS.find(c => c.id === selectedChainId)!;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" /> Canonical Chain Explorer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Trace any action end-to-end: trigger → policy → approval → execution → event → receipt → projection</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      {/* Chain selector */}
      <div className="flex gap-2 flex-wrap">
        {CHAINS.map(c => (
          <Button key={c.id} variant={c.id === selectedChainId ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setSelectedChainId(c.id)}>
            {c.capability} <span className="ml-1 opacity-60">({c.actionId})</span>
          </Button>
        ))}
      </div>

      {/* Chain metadata */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{selectedChain.capability}</h2>
                <p className="text-[10px] text-muted-foreground">Action: {selectedChain.actionId} · Actor: {selectedChain.actor}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[9px] ${selectedChain.replayable ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground"}`}>
                  <Play className="h-2.5 w-2.5 mr-0.5" /> {selectedChain.replayable ? "Replayable" : "Not Replayable"}
                </Badge>
                <Badge variant="outline" className={`text-[9px] ${selectedChain.rollbackable ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground"}`}>
                  <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> {selectedChain.rollbackable ? "Rollbackable" : "Not Rollbackable"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chain steps */}
      <div className="space-y-1">
        {selectedChain.steps.map((step, i) => {
          const sc = stepStatusConfig[step.status];
          const StepIcon = step.icon;
          const isLast = i === selectedChain.steps.length - 1;
          return (
            <motion.div key={i} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.05 }}>
              <div className="flex items-stretch gap-3">
                {/* Vertical connector line */}
                <div className="flex flex-col items-center w-8 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${sc.bg}`}>
                    <StepIcon className={`h-3.5 w-3.5 ${sc.color}`} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border min-h-[16px]" />}
                </div>
                {/* Step content */}
                <Card className={`flex-1 mb-1 ${step.status === "failed" ? "border-red-500/30" : ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{step.label}</span>
                        <Badge variant="outline" className={`text-[9px] ${sc.color} ${sc.bg}`}>{step.status}</Badge>
                      </div>
                      {step.timestamp && <span className="text-[9px] text-muted-foreground">{new Date(step.timestamp).toLocaleTimeString()}</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{step.detail}</p>
                    {step.ref && <p className="text-[9px] text-muted-foreground mt-1">Ref: <span className="font-mono text-primary">{step.ref}</span></p>}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="text-xs"><Play className="h-3 w-3 mr-1" /> Replay Chain</Button>
        {selectedChain.rollbackable && <Button variant="outline" size="sm" className="text-xs"><RotateCcw className="h-3 w-3 mr-1" /> Rollback</Button>}
        <Button variant="outline" size="sm" className="text-xs"><FileText className="h-3 w-3 mr-1" /> Export Evidence</Button>
      </div>
    </div>
  );
};

export default CanonicalChainExplorer;
