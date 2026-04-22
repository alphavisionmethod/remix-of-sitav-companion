// ═══════════════════════════════════════════════════════════════
// SITA OS — Program Management Board (FCC06)
// Objectives → Milestones → Tasks with cross-cutting progress
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  Target, CheckCircle2, Clock, AlertTriangle, Play, Users, Brain,
  ChevronDown, ChevronRight, Zap, Shield, Gauge, Terminal, GitBranch,
  Flag, BarChart3, Link2, XCircle
} from "lucide-react";

interface Objective {
  id: string;
  title: string;
  owner: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "active" | "completed" | "blocked" | "planned";
  milestones: Milestone[];
  releaseTarget: string;
  riskScore: number;
  confidenceScore: number;
}

interface Milestone {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "pending" | "blocked";
  tasks: Task[];
  dueDate: string;
}

interface Task {
  id: string;
  title: string;
  owner: string;
  status: "completed" | "in_progress" | "pending" | "blocked" | "failed";
  risk: "low" | "medium" | "high";
  confidence: number;
  dependencies: string[];
  evidence: string[];
}

const DEMO_OBJECTIVES: Objective[] = [
  {
    id: "obj-1",
    title: "Achieve 99.9% cloud sync reliability",
    owner: "Reliability Ops",
    priority: "critical",
    status: "active",
    releaseTarget: "v2.15.0",
    riskScore: 35,
    confidenceScore: 72,
    milestones: [
      {
        id: "ms-1a", title: "Root Cause Analysis", status: "completed", dueDate: "2026-04-10",
        tasks: [
          { id: "t1", title: "Analyze sync failure logs (14d window)", owner: "Ops Agent", status: "completed", risk: "low", confidence: 0.95, dependencies: [], evidence: ["Log analysis report"] },
          { id: "t2", title: "Identify top 5 failure modes", owner: "Ops Agent", status: "completed", risk: "low", confidence: 0.92, dependencies: ["t1"], evidence: ["Failure mode ranking"] },
          { id: "t3", title: "Cross-device stress test results", owner: "QA Agent", status: "completed", risk: "medium", confidence: 0.88, dependencies: ["t1"], evidence: ["Stress test report: 12 devices"] },
        ],
      },
      {
        id: "ms-1b", title: "Fix Implementation", status: "in_progress", dueDate: "2026-04-18",
        tasks: [
          { id: "t4", title: "Implement exponential backoff retry", owner: "Dev Agent", status: "completed", risk: "medium", confidence: 0.85, dependencies: ["t2"], evidence: ["PR #427 merged"] },
          { id: "t5", title: "Fix upload finalization timeout", owner: "Dev Agent", status: "in_progress", risk: "high", confidence: 0.7, dependencies: ["t2"], evidence: [] },
          { id: "t6", title: "Add conflict resolution for concurrent edits", owner: "Dev Agent", status: "pending", risk: "high", confidence: 0.65, dependencies: ["t5"], evidence: [] },
        ],
      },
      {
        id: "ms-1c", title: "Validation & Rollout", status: "pending", dueDate: "2026-04-25",
        tasks: [
          { id: "t7", title: "Staging validation (72h soak)", owner: "QA Agent", status: "pending", risk: "medium", confidence: 0.8, dependencies: ["t4", "t5", "t6"], evidence: [] },
          { id: "t8", title: "Canary deployment (5%)", owner: "Ops Agent", status: "pending", risk: "medium", confidence: 0.85, dependencies: ["t7"], evidence: [] },
        ],
      },
    ],
  },
  {
    id: "obj-2",
    title: "Reduce beta crash rate by 25%",
    owner: "Product Build",
    priority: "high",
    status: "active",
    releaseTarget: "v2.15.0",
    riskScore: 22,
    confidenceScore: 81,
    milestones: [
      {
        id: "ms-2a", title: "Crash Analysis", status: "completed", dueDate: "2026-04-08",
        tasks: [
          { id: "t9", title: "Aggregate crash reports by category", owner: "Support Agent", status: "completed", risk: "low", confidence: 0.95, dependencies: [], evidence: ["Crash digest Q2W1"] },
          { id: "t10", title: "Identify top crash signatures", owner: "Dev Agent", status: "completed", risk: "low", confidence: 0.9, dependencies: ["t9"], evidence: ["Top 10 crash list"] },
        ],
      },
      {
        id: "ms-2b", title: "Patch & Test", status: "in_progress", dueDate: "2026-04-20",
        tasks: [
          { id: "t11", title: "Fix null pointer in workspace restore", owner: "Dev Agent", status: "completed", risk: "medium", confidence: 0.88, dependencies: ["t10"], evidence: ["PR #431"] },
          { id: "t12", title: "Fix race condition in device mesh", owner: "Dev Agent", status: "in_progress", risk: "high", confidence: 0.72, dependencies: ["t10"], evidence: [] },
          { id: "t13", title: "Regression test all fixes", owner: "QA Agent", status: "pending", risk: "medium", confidence: 0.85, dependencies: ["t11", "t12"], evidence: [] },
        ],
      },
    ],
  },
  {
    id: "obj-3",
    title: "Complete Q2 security audit",
    owner: "Security Trust",
    priority: "high",
    status: "active",
    releaseTarget: "v2.15.0",
    riskScore: 15,
    confidenceScore: 88,
    milestones: [
      {
        id: "ms-3a", title: "Automated Scans", status: "completed", dueDate: "2026-04-05",
        tasks: [
          { id: "t14", title: "Dependency vulnerability scan", owner: "Security Agent", status: "completed", risk: "low", confidence: 0.98, dependencies: [], evidence: ["0 critical CVEs"] },
          { id: "t15", title: "Auth flow penetration test", owner: "Security Agent", status: "completed", risk: "medium", confidence: 0.92, dependencies: [], evidence: ["Pen-test report"] },
        ],
      },
      {
        id: "ms-3b", title: "Manual Review", status: "in_progress", dueDate: "2026-04-22",
        tasks: [
          { id: "t16", title: "Admin RBAC privilege review", owner: "Security Engineer", status: "completed", risk: "high", confidence: 0.9, dependencies: ["t14"], evidence: ["RBAC audit doc"] },
          { id: "t17", title: "Storage encryption validation", owner: "Security Agent", status: "in_progress", risk: "medium", confidence: 0.85, dependencies: [], evidence: [] },
        ],
      },
    ],
  },
];

const STATUS_ICONS: Record<string, React.ElementType> = {
  completed: CheckCircle2, in_progress: Play, pending: Clock, blocked: AlertTriangle, failed: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-trust-safe", in_progress: "text-sita-gold", pending: "text-muted-foreground", blocked: "text-destructive", failed: "text-destructive",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  medium: "bg-sita-gold/10 text-sita-gold border-sita-gold/20",
  low: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
};

function getObjectiveProgress(obj: Objective): number {
  const allTasks = obj.milestones.flatMap(m => m.tasks);
  if (allTasks.length === 0) return 0;
  return Math.round((allTasks.filter(t => t.status === "completed").length / allTasks.length) * 100);
}

export default function FCC06ProgramManagementBoard() {
  const { isDemoMode } = useDataMode();
  const [expandedObj, setExpandedObj] = useState<Set<string>>(new Set(["obj-1"]));
  const [expandedMs, setExpandedMs] = useState<Set<string>>(new Set(["ms-1b"]));

  function toggleObj(id: string) {
    setExpandedObj(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleMs(id: string) {
    setExpandedMs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const allTasks = DEMO_OBJECTIVES.flatMap(o => o.milestones.flatMap(m => m.tasks));
  const totalCompleted = allTasks.filter(t => t.status === "completed").length;
  const totalBlocked = allTasks.filter(t => t.status === "blocked").length;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Target}
        title="Program Management Board"
        subtitle="Objectives → milestones → tasks — cross-cutting execution visibility"
        accent="accent"
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Objectives", value: DEMO_OBJECTIVES.length, color: "text-primary" },
          { label: "Total Tasks", value: allTasks.length, color: "text-foreground" },
          { label: "Completed", value: totalCompleted, color: "text-trust-safe" },
          { label: "In Progress", value: allTasks.filter(t => t.status === "in_progress").length, color: "text-sita-gold" },
          { label: "Blocked", value: totalBlocked, color: "text-destructive" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-white/10 bg-white/[0.03]">
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Objectives */}
      <div className="space-y-4">
        {DEMO_OBJECTIVES.map((obj, oi) => {
          const expanded = expandedObj.has(obj.id);
          const progress = getObjectiveProgress(obj);
          return (
            <motion.div key={obj.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: oi * 0.08 }}>
              <Card className="border-white/10 bg-white/[0.02]">
                {/* Objective Header */}
                <button onClick={() => toggleObj(obj.id)} className="w-full p-4 flex items-center gap-3 text-left">
                  {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <Flag className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{obj.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[9px] ${PRIORITY_COLORS[obj.priority]}`}>{obj.priority}</Badge>
                      <span className="text-[10px] text-muted-foreground">{obj.owner}</span>
                      <span className="text-[10px] text-muted-foreground">• {obj.releaseTarget}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-medium">{progress}%</p>
                      <p className="text-[9px] text-muted-foreground">confidence: {obj.confidenceScore}%</p>
                    </div>
                    <Progress value={progress} className="h-1.5 w-20" />
                  </div>
                </button>

                {/* Milestones */}
                {expanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {obj.milestones.map((ms, mi) => {
                      const msExpanded = expandedMs.has(ms.id);
                      const msCompleted = ms.tasks.filter(t => t.status === "completed").length;
                      const StatusIcon = STATUS_ICONS[ms.status] || Clock;
                      return (
                        <div key={ms.id} className="border border-white/5 rounded-lg">
                          <button onClick={() => toggleMs(ms.id)} className="w-full p-3 flex items-center gap-3 text-left">
                            {msExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                            <StatusIcon className={`h-4 w-4 ${STATUS_COLORS[ms.status]}`} />
                            <span className="text-xs font-medium flex-1">{ms.title}</span>
                            <span className="text-[10px] text-muted-foreground">{msCompleted}/{ms.tasks.length} tasks</span>
                            <span className="text-[10px] text-muted-foreground">Due: {ms.dueDate}</span>
                          </button>
                          {msExpanded && (
                            <div className="px-3 pb-3 space-y-1.5">
                              {ms.tasks.map(t => {
                                const TIcon = STATUS_ICONS[t.status] || Clock;
                                return (
                                  <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded bg-white/[0.02] border border-white/5 text-xs">
                                    <TIcon className={`h-3.5 w-3.5 shrink-0 ${STATUS_COLORS[t.status]}`} />
                                    <span className="flex-1 min-w-0">{t.title}</span>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{t.owner}</span>
                                    <Badge variant="outline" className={`text-[9px] ${t.risk === "high" ? "text-destructive" : t.risk === "medium" ? "text-sita-gold" : "text-trust-safe"}`}>{t.risk}</Badge>
                                    <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(t.confidence * 100)}%</span>
                                    {t.dependencies.length > 0 && <Link2 className="h-3 w-3 text-muted-foreground/50" />}
                                    {t.evidence.length > 0 && <CheckCircle2 className="h-3 w-3 text-trust-safe/50" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
