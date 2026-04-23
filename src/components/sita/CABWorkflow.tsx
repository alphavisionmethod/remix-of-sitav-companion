// ═══════════════════════════════════════════════════════════════
// SITA OS — Change Advisory Board (CAB) Workflow
// Change requests, risk assessment, approval chains, PIR tracking
// SOC 2 CC8.1 / ITIL Change Management compliant
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-engine";
import { toast } from "sonner";
import {
  FileText, AlertTriangle, CheckCircle, XCircle, Clock, Users,
  Shield, ChevronRight, ChevronDown, Download, Plus, Eye,
  ThumbsUp, ThumbsDown, MessageSquare, BarChart3, Target,
  Gauge, Calendar, GitBranch, Activity, Zap, Lock,
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Types ───────────────────────────────────────────────────────

type ChangeType = "standard" | "normal" | "emergency";
type ChangeStatus = "draft" | "submitted" | "risk-review" | "cab-review" | "approved" | "implementing" | "pir" | "closed" | "rejected";
type RiskLevel = "low" | "medium" | "high" | "critical";
type ApprovalDecision = "approved" | "rejected" | "pending" | "abstained";

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  type: ChangeType;
  status: ChangeStatus;
  priority: "P1" | "P2" | "P3" | "P4";
  requester: string;
  assignee: string;
  createdAt: number;
  scheduledAt: number | null;
  implementedAt: number | null;
  closedAt: number | null;
  // Risk Assessment
  riskLevel: RiskLevel;
  riskScore: number; // 1-25
  impactAreas: string[];
  rollbackPlan: string;
  testPlan: string;
  // Approvals
  approvals: Approval[];
  // PIR
  pir: PIR | null;
  tags: string[];
}

interface Approval {
  approver: string;
  role: string;
  decision: ApprovalDecision;
  comment: string;
  decidedAt: number | null;
}

interface PIR {
  successRating: number; // 1-5
  incidentsDuringChange: number;
  lessonsLearned: string[];
  followUpActions: string[];
  completedAt: number;
  reviewer: string;
}

// ── Mock Data ───────────────────────────────────────────────────

const CHANGES: ChangeRequest[] = [
  {
    id: "CR-2024-001", title: "Upgrade Agent Orchestrator to v2.5", description: "Major version upgrade for the agent orchestrator with new scheduling engine, improved memory management, and enhanced fault tolerance.",
    type: "normal", status: "cab-review", priority: "P2", requester: "platform@sita.os", assignee: "ai-ops@sita.os",
    createdAt: Date.now() - 172800000, scheduledAt: Date.now() + 604800000, implementedAt: null, closedAt: null,
    riskLevel: "high", riskScore: 16, impactAreas: ["Agent Fleet", "Self-Healing", "Task Queue", "Error Patrol"],
    rollbackPlan: "Revert to v2.4 container image. Restore agent state snapshots from pre-upgrade checkpoint. Estimated rollback: 5 minutes.",
    testPlan: "1. Deploy to staging environment\n2. Run full agent integration test suite\n3. Execute 1-hour canary with 10% traffic\n4. Monitor error rates and latency for 24 hours",
    approvals: [
      { approver: "security@sita.os", role: "Security Lead", decision: "approved", comment: "Security review passed. No new attack vectors.", decidedAt: Date.now() - 86400000 },
      { approver: "ai-ops@sita.os", role: "AI Operations", decision: "approved", comment: "Staging tests passed. Ready for CAB review.", decidedAt: Date.now() - 43200000 },
      { approver: "vp-eng@sita.os", role: "VP Engineering", decision: "pending", comment: "", decidedAt: null },
    ],
    pir: null, tags: ["infrastructure", "agents", "scheduled"],
  },
  {
    id: "CR-2024-002", title: "Enable Multi-Region Auth Failover", description: "Deploy active-active authentication across US-East and EU-West regions with automatic failover.",
    type: "normal", status: "approved", priority: "P1", requester: "security@sita.os", assignee: "platform@sita.os",
    createdAt: Date.now() - 604800000, scheduledAt: Date.now() + 259200000, implementedAt: null, closedAt: null,
    riskLevel: "high", riskScore: 20, impactAreas: ["Authentication", "Session Management", "User Data", "DNS"],
    rollbackPlan: "Disable EU-West auth cluster. Revert DNS to single-region. Drain EU sessions gracefully.",
    testPlan: "1. Verify token validation in both regions\n2. Simulate primary region failure\n3. Measure failover time (target: <3 min)\n4. Test session continuity across regions",
    approvals: [
      { approver: "security@sita.os", role: "Security Lead", decision: "approved", comment: "Critical for BCP compliance.", decidedAt: Date.now() - 432000000 },
      { approver: "platform@sita.os", role: "Platform Lead", decision: "approved", comment: "Infrastructure provisioned and tested.", decidedAt: Date.now() - 345600000 },
      { approver: "vp-eng@sita.os", role: "VP Engineering", decision: "approved", comment: "Approved — high priority for ISO readiness.", decidedAt: Date.now() - 259200000 },
    ],
    pir: null, tags: ["security", "infrastructure", "compliance"],
  },
  {
    id: "CR-2024-003", title: "Hotfix: Connector Health False Positives", description: "Emergency patch to fix Connector Health Agent generating false degradation alerts for Plaid integration.",
    type: "emergency", status: "closed", priority: "P1", requester: "ai-ops@sita.os", assignee: "ai-ops@sita.os",
    createdAt: Date.now() - 432000000, scheduledAt: null, implementedAt: Date.now() - 428400000, closedAt: Date.now() - 345600000,
    riskLevel: "low", riskScore: 4, impactAreas: ["Connector Health Agent", "Notification System"],
    rollbackPlan: "Revert agent configuration to previous threshold values.", testPlan: "Verify no false positives in 24-hour monitoring window.",
    approvals: [
      { approver: "ai-ops@sita.os", role: "AI Operations", decision: "approved", comment: "Emergency — bypassing standard CAB. Post-hoc review scheduled.", decidedAt: Date.now() - 430000000 },
    ],
    pir: {
      successRating: 4, incidentsDuringChange: 0,
      lessonsLearned: ["Threshold tuning should be data-driven with baseline calibration", "Add automated regression tests for alert thresholds"],
      followUpActions: ["Implement adaptive thresholds for all health agents", "Add alerting unit tests to CI pipeline"],
      completedAt: Date.now() - 345600000, reviewer: "ai-ops@sita.os",
    },
    tags: ["bugfix", "agents", "emergency"],
  },
  {
    id: "CR-2024-004", title: "Add Predictive Analysis ML Models", description: "Deploy new failure prediction models trained on 90 days of agent performance data.",
    type: "standard", status: "pir", priority: "P3", requester: "data@sita.os", assignee: "ai-ops@sita.os",
    createdAt: Date.now() - 1209600000, scheduledAt: Date.now() - 604800000, implementedAt: Date.now() - 518400000, closedAt: null,
    riskLevel: "medium", riskScore: 9, impactAreas: ["Predictive Analysis", "Self-Learning Engine"],
    rollbackPlan: "Disable new models, revert to statistical baseline predictions.",
    testPlan: "1. A/B test new vs. old models on historical data\n2. Validate precision/recall metrics\n3. 48-hour shadow mode before activation",
    approvals: [
      { approver: "data@sita.os", role: "Data Engineering", decision: "approved", comment: "Model validation passed.", decidedAt: Date.now() - 864000000 },
      { approver: "ai-ops@sita.os", role: "AI Operations", decision: "approved", comment: "Shadow mode results look good.", decidedAt: Date.now() - 691200000 },
    ],
    pir: {
      successRating: 5, incidentsDuringChange: 0,
      lessonsLearned: ["Shadow mode is essential for ML model deployments", "Model versioning should be automated"],
      followUpActions: ["Set up automated model retraining pipeline", "Add model drift detection"],
      completedAt: Date.now() - 259200000, reviewer: "data@sita.os",
    },
    tags: ["ml", "predictive", "improvement"],
  },
  {
    id: "CR-2024-005", title: "Database Schema Migration — Audit Tables", description: "Add new columns to audit_log and compliance_events tables for enhanced forensic tracking.",
    type: "normal", status: "risk-review", priority: "P2", requester: "compliance@sita.os", assignee: "dba@sita.os",
    createdAt: Date.now() - 86400000, scheduledAt: Date.now() + 1209600000, implementedAt: null, closedAt: null,
    riskLevel: "medium", riskScore: 12, impactAreas: ["Database", "Audit Log", "Compliance Dashboard", "Reporting"],
    rollbackPlan: "Run reverse migration script. Drop new columns. Restore from pre-migration backup if needed.",
    testPlan: "1. Run migration on staging DB clone\n2. Verify all existing queries still work\n3. Load test with 1M row inserts\n4. Validate data integrity checksums",
    approvals: [
      { approver: "dba@sita.os", role: "DBA Lead", decision: "pending", comment: "", decidedAt: null },
      { approver: "security@sita.os", role: "Security Lead", decision: "pending", comment: "", decidedAt: null },
      { approver: "vp-eng@sita.os", role: "VP Engineering", decision: "pending", comment: "", decidedAt: null },
    ],
    pir: null, tags: ["database", "compliance", "schema"],
  },
];

// ── Helpers ─────────────────────────────────────────────────────

const STATUS_FLOW: ChangeStatus[] = ["draft", "submitted", "risk-review", "cab-review", "approved", "implementing", "pir", "closed"];

const STATUS_META: Record<ChangeStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: "Draft", color: "text-muted-foreground bg-muted border-border", icon: FileText },
  submitted: { label: "Submitted", color: "text-primary bg-primary/10 border-primary/20", icon: FileText },
  "risk-review": { label: "Risk Review", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle },
  "cab-review": { label: "CAB Review", color: "text-primary bg-primary/10 border-primary/20", icon: Users },
  approved: { label: "Approved", color: "text-trust-safe bg-trust-safe/10 border-trust-safe/20", icon: CheckCircle },
  implementing: { label: "Implementing", color: "text-primary bg-primary/10 border-primary/20", icon: Activity },
  pir: { label: "PIR", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", icon: Eye },
  closed: { label: "Closed", color: "text-muted-foreground bg-muted border-border", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-destructive bg-destructive/10 border-destructive/20", icon: XCircle },
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "text-trust-safe bg-trust-safe/10 border-trust-safe/20",
  medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  high: "text-destructive bg-destructive/10 border-destructive/20",
  critical: "text-destructive bg-destructive/15 border-destructive/30",
};

const TYPE_COLORS: Record<ChangeType, string> = {
  standard: "text-muted-foreground",
  normal: "text-primary",
  emergency: "text-destructive",
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function daysAgo(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 86400000);
  return d === 0 ? "today" : `${d}d ago`;
}

// ── Sub-Components ──────────────────────────────────────────────

function ApprovalChain({ approvals }: { approvals: Approval[] }) {
  return (
    <div className="space-y-1.5">
      {approvals.map((a, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/20 p-2">
          {a.decision === "approved" ? <ThumbsUp className="h-3 w-3 text-trust-safe shrink-0" /> :
           a.decision === "rejected" ? <ThumbsDown className="h-3 w-3 text-destructive shrink-0" /> :
           a.decision === "abstained" ? <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0" /> :
           <Clock className="h-3 w-3 text-amber-500 shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-foreground">{a.approver}</span>
              <span className="text-[8px] text-muted-foreground">({a.role})</span>
            </div>
            {a.comment && <p className="text-[9px] text-muted-foreground mt-0.5">{a.comment}</p>}
          </div>
          <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border capitalize",
            a.decision === "approved" ? "text-trust-safe bg-trust-safe/10 border-trust-safe/20" :
            a.decision === "rejected" ? "text-destructive bg-destructive/10 border-destructive/20" :
            a.decision === "pending" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
            "text-muted-foreground bg-muted border-border"
          )}>{a.decision}</span>
        </div>
      ))}
    </div>
  );
}

function PIRSection({ pir }: { pir: PIR }) {
  return (
    <div className="space-y-2 rounded-lg border border-primary/15 bg-primary/3 p-3">
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Post-Implementation Review</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div><span className="text-muted-foreground">Success:</span> <span className="font-bold text-foreground">{"⭐".repeat(pir.successRating)}</span></div>
        <div><span className="text-muted-foreground">Incidents:</span> <span className={cn("font-bold", pir.incidentsDuringChange === 0 ? "text-trust-safe" : "text-destructive")}>{pir.incidentsDuringChange}</span></div>
        <div><span className="text-muted-foreground">Reviewer:</span> <span className="text-foreground">{pir.reviewer}</span></div>
      </div>
      {pir.lessonsLearned.length > 0 && (
        <div>
          <span className="text-[9px] text-muted-foreground font-semibold">Lessons Learned:</span>
          <ul className="mt-0.5 space-y-0.5">
            {pir.lessonsLearned.map((l, i) => <li key={i} className="text-[10px] text-foreground">• {l}</li>)}
          </ul>
        </div>
      )}
      {pir.followUpActions.length > 0 && (
        <div>
          <span className="text-[9px] text-muted-foreground font-semibold">Follow-Up Actions:</span>
          <ul className="mt-0.5 space-y-0.5">
            {pir.followUpActions.map((a, i) => <li key={i} className="text-[10px] text-foreground">→ {a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChangeRequestCard({ cr }: { cr: ChangeRequest }) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = STATUS_META[cr.status];
  const StatusIcon = statusMeta.icon;
  const approvedCount = cr.approvals.filter(a => a.decision === "approved").length;

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card/40 overflow-hidden"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", statusMeta.color.split(" ").slice(1).join(" "))}>
          <StatusIcon className={cn("h-4 w-4", statusMeta.color.split(" ")[0])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono text-muted-foreground">{cr.id}</span>
            <span className="text-xs font-bold text-foreground truncate">{cr.title}</span>
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border capitalize", RISK_COLORS[cr.riskLevel])}>{cr.riskLevel} risk</span>
            <span className={cn("text-[8px] font-semibold capitalize", TYPE_COLORS[cr.type])}>{cr.type}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[9px] text-muted-foreground">
            <span>{cr.priority}</span>
            <span>{cr.requester}</span>
            <span>{daysAgo(cr.createdAt)}</span>
            <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{approvedCount}/{cr.approvals.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border", statusMeta.color)}>{statusMeta.label}</span>
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="border-t border-border/30 bg-secondary/10 overflow-hidden"
          >
            <div className="p-3 space-y-3">
              {/* Description */}
              <p className="text-[11px] text-foreground">{cr.description}</p>

              {/* Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                <div><span className="text-muted-foreground">Created:</span> <span className="text-foreground">{formatDate(cr.createdAt)}</span></div>
                {cr.scheduledAt && <div><span className="text-muted-foreground">Scheduled:</span> <span className="text-foreground">{formatDate(cr.scheduledAt)}</span></div>}
                {cr.implementedAt && <div><span className="text-muted-foreground">Implemented:</span> <span className="text-foreground">{formatDate(cr.implementedAt)}</span></div>}
                {cr.closedAt && <div><span className="text-muted-foreground">Closed:</span> <span className="text-foreground">{formatDate(cr.closedAt)}</span></div>}
              </div>

              {/* Risk Assessment */}
              <div className="rounded-lg border border-border/30 bg-card/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Risk Assessment</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border ml-auto", RISK_COLORS[cr.riskLevel])}>
                    Score: {cr.riskScore}/25
                  </span>
                </div>
                <div className="text-[10px]">
                  <span className="text-muted-foreground">Impact Areas:</span>{" "}
                  <span className="text-foreground">{cr.impactAreas.join(", ")}</span>
                </div>
                <div className="text-[10px]">
                  <span className="text-muted-foreground">Rollback Plan:</span>{" "}
                  <span className="text-foreground">{cr.rollbackPlan}</span>
                </div>
                <div className="text-[10px]">
                  <span className="text-muted-foreground">Test Plan:</span>
                  <pre className="mt-1 text-foreground whitespace-pre-wrap font-sans">{cr.testPlan}</pre>
                </div>
              </div>

              {/* Approval Chain */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Approval Chain</span>
                </div>
                <ApprovalChain approvals={cr.approvals} />
              </div>

              {/* PIR */}
              {cr.pir && <PIRSection pir={cr.pir} />}

              {/* Tags */}
              <div className="flex gap-1 flex-wrap">
                {cr.tags.map(t => (
                  <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function CABWorkflow() {
  const { isDemoMode } = useDataMode();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = CHANGES;
    if (statusFilter !== "all") result = result.filter(c => c.status === statusFilter);
    if (typeFilter !== "all") result = result.filter(c => c.type === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) || c.requester.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [statusFilter, typeFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: (isDemoMode ? CHANGES : [] as typeof CHANGES).length,
    pending: (isDemoMode ? CHANGES : [] as typeof CHANGES).filter(c => ["submitted", "risk-review", "cab-review"].includes(c.status)).length,
    approved: (isDemoMode ? CHANGES : [] as typeof CHANGES).filter(c => c.status === "approved" || c.status === "implementing").length,
    closed: (isDemoMode ? CHANGES : [] as typeof CHANGES).filter(c => c.status === "closed").length,
    emergency: (isDemoMode ? CHANGES : [] as typeof CHANGES).filter(c => c.type === "emergency").length,
    avgRiskScore: Math.round((isDemoMode ? CHANGES : [] as typeof CHANGES).reduce((s, c) => s + c.riskScore, 0) / (isDemoMode ? CHANGES : [] as typeof CHANGES).length),
    pirComplete: (isDemoMode ? CHANGES : [] as typeof CHANGES).filter(c => c.pir !== null).length,
  }), []);

  const handleExport = () => {
    const headers = ["ID", "Title", "Type", "Status", "Priority", "Risk Level", "Risk Score", "Requester", "Assignee", "Created", "Impact Areas"];
    const rows = filtered.map(c => [
      c.id, c.title, c.type, c.status, c.priority, c.riskLevel,
      c.riskScore.toString(), c.requester, c.assignee,
      formatDate(c.createdAt), c.impactAreas.join("; "),
    ]);
    exportToCSV("sita_cab_changes", headers, rows);
    toast.success("CAB change log exported");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground font-display">Change Advisory Board</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              SOC 2 CC8.1 / ITIL compliant change management. Every system change goes through risk assessment,
              multi-level approval, and post-implementation review.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="text-[10px] h-7 gap-1 shrink-0">
            <Download className="h-3 w-3" />Export
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total Changes", value: stats.total, icon: FileText, color: "text-foreground" },
          { label: "Pending Review", value: stats.pending, icon: Clock, color: stats.pending > 0 ? "text-amber-500" : "text-trust-safe" },
          { label: "Approved/Implementing", value: stats.approved, icon: CheckCircle, color: "text-trust-safe" },
          { label: "PIR Complete", value: `${stats.pirComplete}/${stats.closed + stats.pirComplete > 0 ? (isDemoMode ? CHANGES : [] as typeof CHANGES).filter(c => c.pir !== null || c.status === "closed").length : 0}`, icon: Eye, color: "text-primary" },
          { label: "Emergency Changes", value: stats.emergency, icon: Zap, color: stats.emergency > 0 ? "text-destructive" : "text-muted-foreground" },
          { label: "Avg Risk Score", value: `${stats.avgRiskScore}/25`, icon: Gauge, color: stats.avgRiskScore > 15 ? "text-destructive" : stats.avgRiskScore > 10 ? "text-amber-500" : "text-trust-safe" },
          { label: "Closed", value: stats.closed, icon: Lock, color: "text-muted-foreground" },
          { label: "Approval Rate", value: "80%", icon: ThumbsUp, color: "text-trust-safe" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border/40 bg-card/40 p-2.5 flex items-center gap-2">
            <m.icon className={cn("h-3.5 w-3.5", m.color)} />
            <div>
              <p className={cn("font-display text-sm font-bold", m.color)}>{m.value}</p>
              <p className="text-[8px] text-muted-foreground">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Pipeline Visualization */}
      <div className="rounded-xl border border-border/30 bg-card/20 p-3">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Change Pipeline</span>
        <div className="flex items-center gap-1 mt-2 overflow-x-auto">
          {STATUS_FLOW.map((status, i) => {
            const count = (isDemoMode ? CHANGES : [] as typeof CHANGES).filter(c => c.status === status).length;
            const meta = STATUS_META[status];
            return (
              <div key={status} className="flex items-center">
                <button onClick={() => setStatusFilter(status === statusFilter ? "all" : status)}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-center transition-all min-w-[70px]",
                    statusFilter === status ? "ring-1 ring-primary/40" : "",
                    count > 0 ? "bg-card/60 border border-border/40" : "bg-secondary/20 border border-transparent"
                  )}
                >
                  <p className={cn("text-xs font-bold", count > 0 ? meta.color.split(" ")[0] : "text-muted-foreground/40")}>{count}</p>
                  <p className="text-[7px] text-muted-foreground capitalize">{meta.label}</p>
                </button>
                {i < STATUS_FLOW.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 mx-0.5 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, description, or requester..."
            className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-border/40 bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", "standard", "normal", "emergency"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn(
                "text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize",
                typeFilter === t ? "bg-primary/15 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground"
              )}
            >{t === "all" ? "All Types" : t}</button>
          ))}
        </div>
      </div>

      {/* Change Requests */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/20 p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No change requests match filters</p>
          </div>
        ) : (
          filtered.map((cr, i) => (
            <motion.div key={cr.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <ChangeRequestCard cr={cr} />
            </motion.div>
          ))
        )}
      </div>

      {/* Compliance Footer */}
      <div className="rounded-lg border border-border/30 bg-secondary/10 p-3">
        <p className="text-[9px] text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1 -mt-0.5" />
          Change management conforms to SOC 2 CC8.1 (Change Management), ITIL v4 Change Enablement,
          and ISO 27001 A.12.1.2 (Change Management). All changes require documented risk assessment,
          multi-level approval, and post-implementation review. Emergency changes require post-hoc CAB review within 48 hours.
        </p>
      </div>
    </div>
  );
}
