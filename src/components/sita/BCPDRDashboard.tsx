// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Continuity & Disaster Recovery Dashboard
// RPO/RTO management, failover procedures, DR test scheduling
// ISO 22301 / NIST 800-34 compliant
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-engine";
import { toast } from "sonner";
import {
  Shield, Clock, AlertTriangle, CheckCircle, Server, Database,
  Cloud, Wifi, RefreshCw, Play, Calendar, Target, Activity,
  FileText, Download, ChevronRight, ChevronDown, Zap, Lock,
  HardDrive, Globe, Users, Eye, Radio, RotateCcw, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Types ───────────────────────────────────────────────────────

interface RecoveryObjective {
  id: string;
  service: string;
  category: "critical" | "essential" | "important" | "non-critical";
  rpo: number;       // minutes
  rto: number;       // minutes
  actualRpo: number;
  actualRto: number;
  status: "met" | "at-risk" | "breached";
  lastTested: number;
  backupMethod: string;
  replicationLag: number; // seconds
}

interface FailoverProcedure {
  id: string;
  name: string;
  triggerCondition: string;
  type: "automatic" | "semi-automatic" | "manual";
  steps: string[];
  estimatedDuration: number; // minutes
  lastExecuted: number | null;
  lastTestResult: "passed" | "failed" | "partial" | "untested";
  owner: string;
  dependencies: string[];
  rollbackProcedure: string;
}

interface DRTest {
  id: string;
  name: string;
  type: "tabletop" | "walkthrough" | "simulation" | "full-failover" | "partial-failover";
  status: "scheduled" | "in-progress" | "completed" | "failed" | "cancelled";
  scheduledDate: number;
  completedDate?: number;
  duration?: number; // minutes
  participants: string[];
  findings: string[];
  rpoAchieved?: number;
  rtoAchieved?: number;
  score?: number; // 0-100
  nextScheduled?: number;
}

interface BCPMetrics {
  overallReadiness: number; // 0-100
  servicesProtected: number;
  totalServices: number;
  avgRpoCompliance: number;
  avgRtoCompliance: number;
  lastDRTest: number;
  nextDRTest: number;
  openFindings: number;
  failoverSuccess: number; // percentage
}

// ── Mock Data ───────────────────────────────────────────────────

const MOCK_OBJECTIVES: RecoveryObjective[] = [
  { id: "ro-1", service: "Authentication Service", category: "critical", rpo: 1, rto: 5, actualRpo: 0.5, actualRto: 3, status: "met", lastTested: Date.now() - 604800000, backupMethod: "Active-Active Multi-Region", replicationLag: 0.2 },
  { id: "ro-2", service: "Transaction Engine", category: "critical", rpo: 1, rto: 5, actualRpo: 0.8, actualRto: 4, status: "met", lastTested: Date.now() - 604800000, backupMethod: "Synchronous Replication", replicationLag: 0.5 },
  { id: "ro-3", service: "Agent Orchestrator", category: "critical", rpo: 5, rto: 15, actualRpo: 3, actualRto: 12, status: "met", lastTested: Date.now() - 1209600000, backupMethod: "Hot Standby", replicationLag: 1.2 },
  { id: "ro-4", service: "Document Store", category: "essential", rpo: 15, rto: 30, actualRpo: 10, actualRto: 25, status: "met", lastTested: Date.now() - 2592000000, backupMethod: "Cross-Region Backup", replicationLag: 5 },
  { id: "ro-5", service: "Notification Hub", category: "essential", rpo: 30, rto: 60, actualRpo: 20, actualRto: 45, status: "met", lastTested: Date.now() - 1814400000, backupMethod: "Warm Standby", replicationLag: 8 },
  { id: "ro-6", service: "Analytics Pipeline", category: "important", rpo: 60, rto: 120, actualRpo: 45, actualRto: 90, status: "met", lastTested: Date.now() - 2592000000, backupMethod: "Nightly Backup + WAL", replicationLag: 30 },
  { id: "ro-7", service: "Audit Log System", category: "critical", rpo: 0, rto: 10, actualRpo: 0, actualRto: 8, status: "met", lastTested: Date.now() - 604800000, backupMethod: "Immutable Append-Only + Geo-Replicated", replicationLag: 0.1 },
  { id: "ro-8", service: "File Storage (CDN)", category: "important", rpo: 60, rto: 120, actualRpo: 55, actualRto: 130, status: "at-risk", lastTested: Date.now() - 5184000000, backupMethod: "Multi-AZ Object Storage", replicationLag: 15 },
  { id: "ro-9", service: "Search Fabric", category: "essential", rpo: 15, rto: 30, actualRpo: 12, actualRto: 35, status: "at-risk", lastTested: Date.now() - 3456000000, backupMethod: "Index Snapshot + Rebuild", replicationLag: 10 },
  { id: "ro-10", service: "Email/SMS Gateway", category: "non-critical", rpo: 120, rto: 240, actualRpo: 60, actualRto: 180, status: "met", lastTested: Date.now() - 7776000000, backupMethod: "Provider Failover", replicationLag: 0 },
];

const MOCK_FAILOVER: FailoverProcedure[] = [
  {
    id: "fo-1", name: "Database Primary Failover", triggerCondition: "Primary DB unresponsive for >30s or replication lag >10s",
    type: "automatic", steps: [
      "Health monitor detects primary failure (30s timeout)",
      "Promote read replica to primary (automatic, ~15s)",
      "Update DNS/connection pooler to new primary",
      "Verify write capability on new primary",
      "Alert on-call engineer and log incident",
      "Begin backfill of any missed WAL segments",
    ],
    estimatedDuration: 2, lastExecuted: Date.now() - 2592000000, lastTestResult: "passed",
    owner: "Platform Engineering", dependencies: ["PostgreSQL Streaming Replication", "PgBouncer", "Route53"],
    rollbackProcedure: "Reverse DNS, demote new primary, restore from WAL backup",
  },
  {
    id: "fo-2", name: "Auth Service Regional Failover", triggerCondition: "Auth service error rate >5% or latency >2s for >60s",
    type: "automatic", steps: [
      "Load balancer health check fails (3 consecutive)",
      "Traffic shifted to secondary region via weighted DNS",
      "Session cache warmed from distributed store",
      "Verify token validation in secondary region",
      "Monitor error rates for 5 minutes",
    ],
    estimatedDuration: 3, lastExecuted: Date.now() - 5184000000, lastTestResult: "passed",
    owner: "Security Engineering", dependencies: ["Multi-Region Auth Cluster", "Redis Cluster", "CloudFlare"],
    rollbackProcedure: "Shift DNS weight back to primary region, drain secondary",
  },
  {
    id: "fo-3", name: "Agent Fleet Emergency Halt", triggerCondition: "3+ agents quarantined within 5 minutes or trust score <40%",
    type: "semi-automatic", steps: [
      "Circuit breaker triggers fleet-wide pause",
      "Snapshot current agent states and queues",
      "Notify on-call and security team",
      "Run diagnostic bundle on quarantined agents",
      "Human approves selective restart or full restart",
      "Gradual agent restart with monitoring",
    ],
    estimatedDuration: 15, lastExecuted: null, lastTestResult: "partial",
    owner: "AI Operations", dependencies: ["Agent Orchestrator", "Error Patrol", "Self-Healing Engine"],
    rollbackProcedure: "Restore agent states from snapshot, resume from queue checkpoint",
  },
  {
    id: "fo-4", name: "Full Site Disaster Recovery", triggerCondition: "Complete primary region outage or security breach requiring isolation",
    type: "manual", steps: [
      "Incident commander declares DR activation",
      "Activate secondary region infrastructure (pre-provisioned)",
      "Restore database from latest consistent snapshot",
      "Deploy latest verified application build",
      "Update global DNS to secondary region",
      "Verify all critical services operational",
      "Notify customers of service restoration",
      "Begin investigation and primary region assessment",
    ],
    estimatedDuration: 45, lastExecuted: null, lastTestResult: "untested",
    owner: "VP Engineering", dependencies: ["Secondary Region Infrastructure", "Backup Restoration Pipeline", "Global DNS"],
    rollbackProcedure: "Reverse DNS, validate primary region, gradual traffic shift back",
  },
];

const MOCK_DR_TESTS: DRTest[] = [
  {
    id: "dt-1", name: "Q1 Full DR Simulation", type: "simulation", status: "completed",
    scheduledDate: Date.now() - 7776000000, completedDate: Date.now() - 7776000000 + 14400000,
    duration: 240, participants: ["Platform Eng", "Security", "AI Ops", "Leadership"],
    findings: ["CDN failover took 130 min (target 120)", "Search index rebuild needs optimization"],
    rpoAchieved: 3, rtoAchieved: 25, score: 87,
  },
  {
    id: "dt-2", name: "Database Failover Drill", type: "partial-failover", status: "completed",
    scheduledDate: Date.now() - 2592000000, completedDate: Date.now() - 2592000000 + 3600000,
    duration: 60, participants: ["Platform Eng", "DBA"],
    findings: ["Failover completed in 1.8 min — within target"],
    rpoAchieved: 0.5, rtoAchieved: 1.8, score: 96,
  },
  {
    id: "dt-3", name: "Q2 Tabletop Exercise", type: "tabletop", status: "scheduled",
    scheduledDate: Date.now() + 1209600000,
    participants: ["All Engineering", "Legal", "Communications"],
    findings: [], nextScheduled: Date.now() + 1209600000,
  },
  {
    id: "dt-4", name: "Auth Regional Failover Test", type: "partial-failover", status: "scheduled",
    scheduledDate: Date.now() + 604800000,
    participants: ["Security Eng", "Platform Eng"],
    findings: [],
  },
  {
    id: "dt-5", name: "Agent Fleet Emergency Halt Drill", type: "walkthrough", status: "scheduled",
    scheduledDate: Date.now() + 2419200000,
    participants: ["AI Ops", "Security", "Leadership"],
    findings: [],
  },
];

const MOCK_METRICS: BCPMetrics = {
  overallReadiness: 89,
  servicesProtected: 9,
  totalServices: 10,
  avgRpoCompliance: 94,
  avgRtoCompliance: 91,
  lastDRTest: Date.now() - 2592000000,
  nextDRTest: Date.now() + 604800000,
  openFindings: 2,
  failoverSuccess: 95,
};

// ── Helpers ─────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)}s`;
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatDateShort(ts: number): string {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(ts: number): number {
  return Math.ceil((ts - Date.now()) / 86400000);
}

function daysAgo(ts: number): number {
  return Math.floor((Date.now() - ts) / 86400000);
}

const CATEGORY_COLORS: Record<string, string> = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  essential: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  important: "text-primary bg-primary/10 border-primary/20",
  "non-critical": "text-muted-foreground bg-secondary border-border",
};

const STATUS_COLORS: Record<string, string> = {
  met: "text-trust-safe",
  "at-risk": "text-amber-500",
  breached: "text-destructive",
};

// ── Sub-Components ──────────────────────────────────────────────

function RPOStatusDot({ status }: { status: string }) {
  return (
    <div className={cn("h-2 w-2 rounded-full", status === "met" ? "bg-trust-safe" : status === "at-risk" ? "bg-amber-500" : "bg-destructive")} />
  );
}

function ObjectiveRow({ obj }: { obj: RecoveryObjective }) {
  const [expanded, setExpanded] = useState(false);
  const rpoPercent = Math.min(100, (obj.actualRpo / obj.rpo) * 100);
  const rtoPercent = Math.min(100, (obj.actualRto / obj.rto) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card/40 overflow-hidden"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left">
        <RPOStatusDot status={obj.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">{obj.service}</span>
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border capitalize", CATEGORY_COLORS[obj.category])}>
              {obj.category}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
            <span>RPO: <span className={cn("font-semibold", STATUS_COLORS[obj.status])}>{formatDuration(obj.actualRpo)}</span>/{formatDuration(obj.rpo)}</span>
            <span>RTO: <span className={cn("font-semibold", STATUS_COLORS[obj.status])}>{formatDuration(obj.actualRto)}</span>/{formatDuration(obj.rto)}</span>
            <span>Lag: {obj.replicationLag}s</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] text-muted-foreground">{daysAgo(obj.lastTested)}d ago</span>
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="border-t border-border/30 bg-secondary/10 p-3 space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[9px] text-muted-foreground">RPO Compliance</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={rpoPercent} className="h-1.5 flex-1" />
                  <span className={cn("text-[10px] font-bold", rpoPercent <= 80 ? "text-trust-safe" : rpoPercent <= 100 ? "text-amber-500" : "text-destructive")}>{Math.round(rpoPercent)}%</span>
                </div>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground">RTO Compliance</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={rtoPercent} className="h-1.5 flex-1" />
                  <span className={cn("text-[10px] font-bold", rtoPercent <= 80 ? "text-trust-safe" : rtoPercent <= 100 ? "text-amber-500" : "text-destructive")}>{Math.round(rtoPercent)}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-muted-foreground">Backup Method:</span> <span className="text-foreground">{obj.backupMethod}</span></div>
              <div><span className="text-muted-foreground">Last Tested:</span> <span className="text-foreground">{formatDateShort(obj.lastTested)}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FailoverCard({ proc }: { proc: FailoverProcedure }) {
  const [expanded, setExpanded] = useState(false);
  const resultColors: Record<string, string> = {
    passed: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    partial: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    untested: "bg-muted text-muted-foreground border-border",
  };
  const typeColors: Record<string, string> = {
    automatic: "text-trust-safe",
    "semi-automatic": "text-amber-500",
    manual: "text-muted-foreground",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card/40 overflow-hidden"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">{proc.name}</span>
            <span className={cn("text-[8px] font-semibold capitalize", typeColors[proc.type])}>{proc.type}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{proc.triggerCondition}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border capitalize", resultColors[proc.lastTestResult])}>
            {proc.lastTestResult}
          </span>
          <span className="text-[9px] text-muted-foreground">~{formatDuration(proc.estimatedDuration)}</span>
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="border-t border-border/30 bg-secondary/10 p-3 space-y-3 overflow-hidden"
          >
            <div>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Procedure Steps</span>
              <ol className="mt-1.5 space-y-1">
                {proc.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px]">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">{i + 1}</span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-muted-foreground">Owner:</span> <span className="text-foreground">{proc.owner}</span></div>
              <div><span className="text-muted-foreground">Last Executed:</span> <span className="text-foreground">{proc.lastExecuted ? formatDateShort(proc.lastExecuted) : "Never"}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">Dependencies:</span> <span className="text-foreground">{proc.dependencies.join(", ")}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">Rollback:</span> <span className="text-foreground">{proc.rollbackProcedure}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DRTestCard({ test }: { test: DRTest }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, string> = {
    scheduled: "bg-primary/10 text-primary border-primary/20",
    "in-progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    completed: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    cancelled: "bg-muted text-muted-foreground border-border",
  };
  const typeIcons: Record<string, typeof Play> = {
    tabletop: FileText, walkthrough: Users, simulation: Activity,
    "full-failover": Zap, "partial-failover": RefreshCw,
  };
  const TypeIcon = typeIcons[test.type] || Activity;

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card/40 overflow-hidden"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">{test.name}</span>
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border capitalize", statusColors[test.status])}>
              {test.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
            <span className="capitalize">{test.type.replace("-", " ")}</span>
            <span>{formatDateShort(test.scheduledDate)}</span>
            {test.score !== undefined && <span className="font-semibold text-foreground">{test.score}/100</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {test.status === "scheduled" && (
            <span className="text-[9px] text-primary font-semibold">in {daysUntil(test.scheduledDate)}d</span>
          )}
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="border-t border-border/30 bg-secondary/10 p-3 space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-muted-foreground">Participants:</span> <span className="text-foreground">{test.participants.join(", ")}</span></div>
              {test.duration && <div><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{formatDuration(test.duration)}</span></div>}
              {test.rpoAchieved !== undefined && <div><span className="text-muted-foreground">RPO Achieved:</span> <span className="text-foreground">{formatDuration(test.rpoAchieved)}</span></div>}
              {test.rtoAchieved !== undefined && <div><span className="text-muted-foreground">RTO Achieved:</span> <span className="text-foreground">{formatDuration(test.rtoAchieved)}</span></div>}
            </div>
            {test.findings.length > 0 && (
              <div>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Findings</span>
                <ul className="mt-1 space-y-0.5">
                  {test.findings.map((f, i) => (
                    <li key={i} className="text-[10px] text-foreground flex items-start gap-1.5">
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function BCPDRDashboard() {
  const [activeView, setActiveView] = useState<"overview" | "objectives" | "failover" | "tests">("overview");

  const handleExport = () => {
  const { isDemoMode } = useDataMode();
    const headers = ["Service", "Category", "RPO Target (min)", "RPO Actual (min)", "RTO Target (min)", "RTO Actual (min)", "Status", "Backup Method", "Last Tested"];
    const rows = MOCK_OBJECTIVES.map(o => [
      o.service, o.category, o.rpo.toString(), o.actualRpo.toString(),
      o.rto.toString(), o.actualRto.toString(), o.status, o.backupMethod, formatDateShort(o.lastTested),
    ]);
    exportToCSV("sita_bcpdr_objectives", headers, rows);
    toast.success("BCP/DR report exported");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground font-display">Business Continuity & Disaster Recovery</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ISO 22301 / NIST 800-34 compliant BCP/DR management. Recovery objectives, failover procedures,
              and scheduled DR testing to ensure operational resilience.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="text-[10px] h-7 gap-1 shrink-0">
            <Download className="h-3 w-3" />Export
          </Button>
        </div>
      </motion.div>

      {/* View Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin">
        {[
          { key: "overview" as const, label: "Overview", icon: Gauge },
          { key: "objectives" as const, label: "RPO/RTO", icon: Target },
          { key: "failover" as const, label: "Failover", icon: Zap },
          { key: "tests" as const, label: "DR Tests", icon: Calendar },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveView(tab.key)}
            className={cn(
              "flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all",
              activeView === tab.key ? "bg-primary/10 text-primary border-primary/30 font-semibold" : "border-border/30 text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeView === "overview" && (
        <div className="space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Overall Readiness", value: `${MOCK_METRICS.overallReadiness}%`, icon: Gauge, color: MOCK_METRICS.overallReadiness >= 85 ? "text-trust-safe" : "text-amber-500" },
              { label: "Services Protected", value: `${MOCK_METRICS.servicesProtected}/${MOCK_METRICS.totalServices}`, icon: Server, color: "text-primary" },
              { label: "RPO Compliance", value: `${MOCK_METRICS.avgRpoCompliance}%`, icon: Clock, color: MOCK_METRICS.avgRpoCompliance >= 90 ? "text-trust-safe" : "text-amber-500" },
              { label: "RTO Compliance", value: `${MOCK_METRICS.avgRtoCompliance}%`, icon: Activity, color: MOCK_METRICS.avgRtoCompliance >= 90 ? "text-trust-safe" : "text-amber-500" },
              { label: "Failover Success", value: `${MOCK_METRICS.failoverSuccess}%`, icon: RefreshCw, color: "text-trust-safe" },
              { label: "Open Findings", value: MOCK_METRICS.openFindings.toString(), icon: AlertTriangle, color: MOCK_METRICS.openFindings > 0 ? "text-amber-500" : "text-trust-safe" },
              { label: "Last DR Test", value: `${daysAgo(MOCK_METRICS.lastDRTest)}d ago`, icon: CheckCircle, color: daysAgo(MOCK_METRICS.lastDRTest) > 90 ? "text-destructive" : "text-foreground" },
              { label: "Next DR Test", value: `in ${daysUntil(MOCK_METRICS.nextDRTest)}d`, icon: Calendar, color: "text-primary" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-border/40 bg-card/40 p-3 flex items-center gap-2.5">
                <m.icon className={cn("h-4 w-4 shrink-0", m.color)} />
                <div>
                  <p className={cn("font-display text-sm font-bold", m.color)}>{m.value}</p>
                  <p className="text-[8px] text-muted-foreground">{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Critical Services Quick View */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Critical Services Status</span>
            {(isDemoMode ? MOCK_OBJECTIVES : [] as typeof MOCK_OBJECTIVES).filter(o => o.category === "critical").map(o => (
              <div key={o.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/30 p-2.5">
                <RPOStatusDot status={o.status} />
                <span className="text-xs font-medium text-foreground flex-1">{o.service}</span>
                <span className="text-[9px] text-muted-foreground">RPO {formatDuration(o.actualRpo)}/{formatDuration(o.rpo)}</span>
                <span className="text-[9px] text-muted-foreground">RTO {formatDuration(o.actualRto)}/{formatDuration(o.rto)}</span>
                <span className="text-[9px] text-muted-foreground">Lag {o.replicationLag}s</span>
              </div>
            ))}
          </div>

          {/* Upcoming Tests */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Upcoming DR Tests</span>
            {(isDemoMode ? MOCK_DR_TESTS : [] as typeof MOCK_DR_TESTS).filter(t => t.status === "scheduled").map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border border-primary/15 bg-primary/3 p-2.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground flex-1">{t.name}</span>
                <span className="text-[9px] text-primary font-semibold">in {daysUntil(t.scheduledDate)} days</span>
                <span className="text-[9px] text-muted-foreground capitalize">{t.type.replace("-", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RPO/RTO Objectives */}
      {activeView === "objectives" && (
        <div className="space-y-2">
          {(isDemoMode ? MOCK_OBJECTIVES : [] as typeof MOCK_OBJECTIVES).map(obj => <ObjectiveRow key={obj.id} obj={obj} />)}
        </div>
      )}

      {/* Failover Procedures */}
      {activeView === "failover" && (
        <div className="space-y-2">
          {(isDemoMode ? MOCK_FAILOVER : [] as typeof MOCK_FAILOVER).map(proc => <FailoverCard key={proc.id} proc={proc} />)}
        </div>
      )}

      {/* DR Tests */}
      {activeView === "tests" && (
        <div className="space-y-2">
          {(isDemoMode ? MOCK_DR_TESTS : [] as typeof MOCK_DR_TESTS).map(test => <DRTestCard key={test.id} test={test} />)}
        </div>
      )}

      {/* Compliance Footer */}
      <div className="rounded-lg border border-border/30 bg-secondary/10 p-3">
        <p className="text-[9px] text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1 -mt-0.5" />
          BCP/DR program conforms to ISO 22301 (Business Continuity), NIST 800-34 (Contingency Planning),
          and SOC 2 A1.2 (Recovery). DR tests are scheduled quarterly with results retained for 7 years.
          All failover procedures include documented rollback plans and post-incident review requirements.
        </p>
      </div>
    </div>
  );
}
