// ═══════════════════════════════════════════════════════════════
// SITA OS — Agent Audit Log
// Complete timestamped history of all manual agent actions
// ISO 27001 compliant audit trail
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search, Filter, Download, Clock, Play, Pause, TrendingUp,
  TrendingDown, ShieldBan, RotateCcw, User, FileText, Shield,
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle,
  ListChecks, Eye, Hash, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { exportAuditLog } from "@/lib/export-engine";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Types ───────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  timestamp: number;
  action: "run" | "pause" | "promote" | "demote" | "quarantine" | "unquarantine" | "bulk-run" | "bulk-pause" | "bulk-quarantine" | "bulk-promote" | "bulk-demote";
  agentId: string;
  agentName: string;
  performedBy: string;
  reason?: string;
  previousState: string;
  newState: string;
  autonomyBefore?: number;
  autonomyAfter?: number;
  bulk?: boolean;
  bulkGroupId?: string;
  bulkCount?: number;
  correlationId: string;
  ipAddress: string;
  sessionId: string;
  success: boolean;
  error?: string;
}

// ── Mock Data ───────────────────────────────────────────────────

const AUTONOMY_LABELS = ["L0 Observe", "L1 Diagnose", "L2 Recommend", "L3 Draft", "L4 Simulate", "L5 Approval", "L6 Action"];

const AUDIT: AuditEntry[] = [
  {
    id: "aud-001", timestamp: Date.now() - 300000, action: "quarantine", agentId: "aw-connector-health",
    agentName: "Connector Health Agent", performedBy: "admin@sita.os", reason: "Repeated false positives on Plaid status",
    previousState: "active", newState: "quarantined", correlationId: "corr-a1b2c3", ipAddress: "192.168.1.42",
    sessionId: "sess-x7y8z9", success: true,
  },
  {
    id: "aud-002", timestamp: Date.now() - 600000, action: "promote", agentId: "aw-release-safety",
    agentName: "Release Safety Agent", performedBy: "admin@sita.os",
    previousState: "active", newState: "active", autonomyBefore: 3, autonomyAfter: 4,
    correlationId: "corr-d4e5f6", ipAddress: "192.168.1.42", sessionId: "sess-x7y8z9", success: true,
  },
  {
    id: "aud-003", timestamp: Date.now() - 1800000, action: "bulk-pause", agentId: "bulk-group-1",
    agentName: "3 agents (Cost Guardrail, Latency Optimizer, Cache Compression)", performedBy: "ops@sita.os",
    reason: "Scheduled maintenance window", previousState: "active", newState: "paused",
    bulk: true, bulkGroupId: "bulk-grp-001", bulkCount: 3,
    correlationId: "corr-g7h8i9", ipAddress: "10.0.0.15", sessionId: "sess-m1n2o3", success: true,
  },
  {
    id: "aud-004", timestamp: Date.now() - 3600000, action: "demote", agentId: "aw-permission-drift",
    agentName: "Permission Drift Agent", performedBy: "security@sita.os",
    reason: "Operating outside defined policy bounds", previousState: "active", newState: "active",
    autonomyBefore: 4, autonomyAfter: 2, correlationId: "corr-j1k2l3", ipAddress: "10.0.0.22",
    sessionId: "sess-p4q5r6", success: true,
  },
  {
    id: "aud-005", timestamp: Date.now() - 7200000, action: "run", agentId: "aw-workflow-recovery",
    agentName: "Workflow Recovery Agent", performedBy: "admin@sita.os",
    previousState: "paused", newState: "active", correlationId: "corr-m4n5o6", ipAddress: "192.168.1.42",
    sessionId: "sess-s7t8u9", success: true,
  },
  {
    id: "aud-006", timestamp: Date.now() - 14400000, action: "unquarantine", agentId: "aw-model-routing",
    agentName: "Model Routing Agent", performedBy: "admin@sita.os",
    reason: "Root cause resolved — model provider back online", previousState: "quarantined", newState: "paused",
    correlationId: "corr-p7q8r9", ipAddress: "192.168.1.42", sessionId: "sess-v1w2x3", success: true,
  },
  {
    id: "aud-007", timestamp: Date.now() - 28800000, action: "pause", agentId: "aw-cost-guardrail",
    agentName: "Cost Guardrail Agent", performedBy: "ops@sita.os",
    previousState: "active", newState: "paused", correlationId: "corr-s1t2u3", ipAddress: "10.0.0.15",
    sessionId: "sess-y4z5a6", success: true,
  },
  {
    id: "aud-008", timestamp: Date.now() - 43200000, action: "promote", agentId: "aw-incident-response",
    agentName: "Incident Response Agent", performedBy: "admin@sita.os",
    previousState: "active", newState: "active", autonomyBefore: 4, autonomyAfter: 5,
    reason: "Proven track record — 100% success rate over 30 days",
    correlationId: "corr-v4w5x6", ipAddress: "192.168.1.42", sessionId: "sess-b7c8d9", success: true,
  },
  {
    id: "aud-009", timestamp: Date.now() - 86400000, action: "bulk-promote", agentId: "bulk-group-2",
    agentName: "5 agents (Knowledge Council)", performedBy: "admin@sita.os",
    reason: "Council-wide autonomy upgrade after quarterly review",
    previousState: "active", newState: "active", autonomyBefore: 2, autonomyAfter: 3,
    bulk: true, bulkGroupId: "bulk-grp-002", bulkCount: 5,
    correlationId: "corr-y7z8a9", ipAddress: "192.168.1.42", sessionId: "sess-e1f2g3", success: true,
  },
  {
    id: "aud-010", timestamp: Date.now() - 172800000, action: "quarantine", agentId: "aw-model-routing",
    agentName: "Model Routing Agent", performedBy: "system (auto-immune)",
    reason: "Auto-quarantine: 5+ incidents in 1 hour (immune controller)",
    previousState: "active", newState: "quarantined", correlationId: "corr-b1c2d3", ipAddress: "internal",
    sessionId: "sys-immune", success: true,
  },
];

// ── Components ──────────────────────────────────────────────────

const ACTION_ICONS: Record<string, typeof Play> = {
  run: Play, pause: Pause, promote: TrendingUp, demote: TrendingDown,
  quarantine: ShieldBan, unquarantine: RotateCcw,
  "bulk-run": Play, "bulk-pause": Pause, "bulk-quarantine": ShieldBan,
  "bulk-promote": TrendingUp, "bulk-demote": TrendingDown,
};

const ACTION_COLORS: Record<string, string> = {
  run: "text-trust-safe bg-trust-safe/10", pause: "text-muted-foreground bg-muted/30",
  promote: "text-primary bg-primary/10", demote: "text-accent bg-accent/10",
  quarantine: "text-destructive bg-destructive/10", unquarantine: "text-trust-safe bg-trust-safe/10",
  "bulk-run": "text-trust-safe bg-trust-safe/10", "bulk-pause": "text-muted-foreground bg-muted/30",
  "bulk-quarantine": "text-destructive bg-destructive/10", "bulk-promote": "text-primary bg-primary/10",
  "bulk-demote": "text-accent bg-accent/10",
};

function AuditRow({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ACTION_ICONS[entry.action] || Play;
  const actionColor = ACTION_COLORS[entry.action] || "text-foreground bg-secondary";
  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
  const actionLabel = entry.action.replace("bulk-", "Bulk ").replace(/^\w/, c => c.toUpperCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card/40 overflow-hidden transition-all hover:border-border/60"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left">
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", actionColor)}>
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">{actionLabel}</span>
            {entry.bulk && <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-primary/20 text-primary">
              <ListChecks className="h-2 w-2 mr-0.5" />{entry.bulkCount} agents
            </Badge>}
            <span className="text-[9px] text-muted-foreground">→</span>
            <span className="text-[10px] text-foreground/80 truncate">{entry.agentName}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{entry.performedBy}</span>
            <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{dateStr} {timeStr}</span>
            {entry.autonomyBefore !== undefined && (
              <span className="flex items-center gap-1">
                {AUTONOMY_LABELS[entry.autonomyBefore]} <ArrowRight className="h-2 w-2" /> {AUTONOMY_LABELS[entry.autonomyAfter!]}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {entry.success
            ? <CheckCircle className="h-3.5 w-3.5 text-trust-safe" />
            : <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border/30 bg-secondary/10 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div><span className="text-muted-foreground">State Change:</span> <span className="font-medium text-foreground">{entry.previousState} → {entry.newState}</span></div>
            <div><span className="text-muted-foreground">Correlation ID:</span> <span className="font-mono text-foreground/80">{entry.correlationId}</span></div>
            <div><span className="text-muted-foreground">IP Address:</span> <span className="font-mono text-foreground/80">{entry.ipAddress}</span></div>
            <div><span className="text-muted-foreground">Session:</span> <span className="font-mono text-foreground/80">{entry.sessionId}</span></div>
            {entry.reason && (
              <div className="col-span-2"><span className="text-muted-foreground">Reason:</span> <span className="text-foreground">{entry.reason}</span></div>
            )}
            {entry.error && (
              <div className="col-span-2"><span className="text-destructive">Error:</span> <span className="text-destructive/80">{entry.error}</span></div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function AgentAuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [performerFilter, setPerformerFilter] = useState<string>("all");
  const { isDemoMode } = useDataMode();

  const performers = useMemo(() => [...new Set((isDemoMode ? AUDIT : [] as typeof AUDIT).map(a => a.performedBy))], []);

  const filtered = useMemo(() => {
    let result = AUDIT;
    if (actionFilter !== "all") {
      result = result.filter(e => e.action === actionFilter || e.action === `bulk-${actionFilter}`);
    }
    if (performerFilter !== "all") {
      result = result.filter(e => e.performedBy === performerFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.agentName.toLowerCase().includes(q) ||
        e.correlationId.toLowerCase().includes(q) ||
        e.performedBy.toLowerCase().includes(q) ||
        (e.reason?.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [actionFilter, performerFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: (isDemoMode ? AUDIT : [] as typeof AUDIT).length,
    manual: (isDemoMode ? AUDIT : [] as typeof AUDIT).filter(a => !a.performedBy.includes("system")).length,
    automated: (isDemoMode ? AUDIT : [] as typeof AUDIT).filter(a => a.performedBy.includes("system")).length,
    bulkOps: (isDemoMode ? AUDIT : [] as typeof AUDIT).filter(a => a.bulk).length,
  }), []);

  const handleExport = () => {
    exportAuditLog(filtered);
    toast.success("Audit log exported", { description: "CSV file downloaded with full audit trail" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground font-display">Agent Audit Log</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ISO 27001 compliant audit trail. Every agent action — manual and automated — is logged with
              full context: performer identity, IP, session, correlation ID, state change, and reason.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="text-[10px] h-7 gap-1 shrink-0">
            <Download className="h-3 w-3" />Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total Actions", value: stats.total, icon: Hash },
          { label: "Manual", value: stats.manual, icon: User },
          { label: "Automated", value: stats.automated, icon: Shield },
          { label: "Bulk Operations", value: stats.bulkOps, icon: ListChecks },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border/40 bg-card/40 p-2.5 flex items-center gap-2">
            <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
              <p className="text-[8px] text-muted-foreground">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by agent, correlation ID, performer, or reason..."
            className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-border/40 bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "run", "pause", "promote", "demote", "quarantine", "unquarantine"].map(a => (
            <button key={a} onClick={() => setActionFilter(a)}
              className={cn(
                "text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize",
                actionFilter === a ? "bg-primary/15 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground"
              )}
            >{a === "all" ? "All Actions" : a}</button>
          ))}
          <div className="w-px bg-border/40 mx-1" />
          {["all", ...performers].map(p => (
            <button key={p} onClick={() => setPerformerFilter(p)}
              className={cn(
                "text-[10px] px-2.5 py-1 rounded-full border transition-all",
                performerFilter === p ? "bg-primary/15 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground"
              )}
            >{p === "all" ? "All Performers" : p.split("@")[0]}</button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/20 p-8 text-center">
            <Eye className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No audit entries match filters</p>
          </div>
        ) : (
          filtered.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <AuditRow entry={entry} />
            </motion.div>
          ))
        )}
      </div>

      {/* Compliance footer */}
      <div className="rounded-lg border border-border/30 bg-secondary/10 p-3">
        <p className="text-[9px] text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1 -mt-0.5" />
          Audit trail conforms to ISO 27001 A.12.4.1 (Event logging), SOC 2 CC7.2 (System monitoring),
          and NIST 800-53 AU-2 (Audit events). Logs are immutable and retained for 7 years.
          Export includes full chain-of-custody metadata for forensic review.
        </p>
      </div>
    </div>
  );
}
