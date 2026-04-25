// ═══════════════════════════════════════════════════════════════
// SITA OS — Task Decomposition Graph (FCC02)
// Visual task tree: objective → milestones → tasks
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch, CheckCircle2, Clock, AlertTriangle, Play, Shield, Gauge,
  Terminal, Users, Target, Brain, Zap, XCircle, ChevronDown, ChevronRight
} from "lucide-react";
import { founderOrchestrator, type DirectiveRecord, type DecomposedTask, type AgentClass } from "@/lib/services/founder-orchestrator";

const RISK_COLORS = { low: "text-trust-safe", medium: "text-sita-gold", high: "text-orange-400", critical: "text-destructive" };
const STATUS_ICONS = {
  pending: Clock, in_progress: Play, completed: CheckCircle2, blocked: AlertTriangle, failed: XCircle,
};
const AGENT_CONFIG: Record<AgentClass, { icon: React.ElementType; color: string }> = {
  dev: { icon: Terminal, color: "bg-primary/20 text-primary" },
  qa: { icon: CheckCircle2, color: "bg-trust-safe/20 text-trust-safe" },
  ops: { icon: Zap, color: "bg-sita-gold/20 text-sita-gold" },
  security: { icon: Shield, color: "bg-destructive/20 text-destructive" },
  performance: { icon: Gauge, color: "bg-orange-400/20 text-orange-400" },
  support: { icon: Users, color: "bg-accent/20 text-accent" },
  product: { icon: Target, color: "bg-primary/20 text-primary" },
};

export default function FCC02TaskDecompositionGraph() {
  const { user, isDemo } = useAuth();
  const [directives, setDirectives] = useState<DirectiveRecord[]>([]);
  const [selected, setSelected] = useState<DirectiveRecord | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      if (isDemo) {
        const demo = getDemoDirectives();
        setDirectives(demo);
        setSelected(demo[0]);
      } else if (user) {
        const data = await founderOrchestrator.getDirectives(user.id);
        setDirectives(data);
        if (data.length > 0) setSelected(data[0]);
      }
    }
    load();
  }, [user, isDemo]);

  const tasks = (selected?.decomposed_plan || []) as DecomposedTask[];
  const milestoneMap = new Map<string, DecomposedTask[]>();
  for (const t of tasks) {
    const ms = t.milestone || "Tasks";
    milestoneMap.set(ms, [...(milestoneMap.get(ms) || []), t]);
  }
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  function toggleMilestone(ms: string) {
    setExpandedMilestones(prev => {
      const next = new Set(prev);
      next.has(ms) ? next.delete(ms) : next.add(ms);
      return next;
    });
  }

  // Auto-expand all on mount
  useEffect(() => {
    setExpandedMilestones(new Set(milestoneMap.keys()));
  }, [selected]);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={GitBranch}
        title="Task Decomposition Graph"
        subtitle="Visual execution plan — objectives, milestones, and task dependencies"
        accent="accent"
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Directive Selector */}
        <div className="xl:col-span-1 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Directives</p>
          {directives.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card
                onClick={() => setSelected(d)}
                className={`cursor-pointer transition-all text-sm ${selected?.id === d.id ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
              >
                <CardContent className="p-3">
                  <p className="line-clamp-2 text-xs">{d.intent_text}</p>
                  <div className="flex gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[9px]">{d.domain_classification}</Badge>
                    <Badge variant="outline" className="text-[9px]">{(d.decomposed_plan ?? []).length} tasks</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Task Graph */}
        <div className="xl:col-span-3 space-y-4">
          {selected ? (
            <>
              {/* Summary Bar */}
              <Card className="border-white/10 bg-white/[0.03]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{selected.intent_text}</p>
                    <span className="text-xs text-muted-foreground">{completedCount}/{tasks.length} tasks</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <div className="flex gap-4 mt-3">
                    {Object.entries(
                      tasks.reduce<Record<string, number>>((acc, t) => { acc[t.agentClass] = (acc[t.agentClass] || 0) + 1; return acc; }, {})
                    ).map(([cls, count]) => {
                      const cfg = AGENT_CONFIG[cls as AgentClass];
                      const Icon = cfg?.icon || Brain;
                      return (
                        <div key={cls} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon className="h-3 w-3" /> {cls}: {count}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <div className="space-y-3">
                {Array.from(milestoneMap.entries()).map(([ms, msTasks], i) => {
                  const expanded = expandedMilestones.has(ms);
                  const msCompleted = msTasks.filter(t => t.status === "completed").length;
                  const msProgress = Math.round((msCompleted / msTasks.length) * 100);
                  return (
                    <motion.div key={ms} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <Card className="border-white/10 bg-white/[0.02]">
                        <button
                          onClick={() => toggleMilestone(ms)}
                          className="w-full p-4 flex items-center gap-3 text-left"
                        >
                          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium flex-1">{ms}</span>
                          <span className="text-xs text-muted-foreground">{msCompleted}/{msTasks.length}</span>
                          <Progress value={msProgress} className="h-1 w-16" />
                        </button>
                        {expanded && (
                          <div className="px-4 pb-4 space-y-2">
                            {msTasks.map(t => {
                              const agentCfg = AGENT_CONFIG[t.agentClass];
                              const AgentIcon = agentCfg?.icon || Brain;
                              const StatusIcon = STATUS_ICONS[t.status] || Clock;
                              return (
                                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                  <StatusIcon className={`h-4 w-4 shrink-0 ${t.status === "completed" ? "text-trust-safe" : t.status === "blocked" ? "text-destructive" : "text-muted-foreground"}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium">{t.title}</p>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{t.description}</p>
                                  </div>
                                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${agentCfg?.color || ""}`}>
                                    <AgentIcon className="h-3 w-3" /> {t.agentClass}
                                  </div>
                                  <Badge variant="outline" className={`text-[9px] ${RISK_COLORS[t.risk]}`}>{t.risk}</Badge>
                                  <div className="text-[10px] text-muted-foreground w-10 text-right">{Math.round(t.confidence * 100)}%</div>
                                  {t.requiresApproval && <Shield className="h-3 w-3 text-sita-gold" />}
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
            </>
          ) : (
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-12 text-center text-muted-foreground">
                <GitBranch className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>Select a directive to view its task graph</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getDemoDirectives(): DirectiveRecord[] {
  const cmds = [
    "Make cloud sync completely reliable across all devices",
    "Reduce crash rate in beta by 25%",
    "Audit AI token spending and reduce cost by 20%",
  ];
  return cmds.map((cmd, i) => {
    const parsed = founderOrchestrator.parseDirective(cmd);
    const tasks = founderOrchestrator.decomposeToTaskGraph(cmd, parsed.domain);
    // Simulate some progress
    if (i === 0) { tasks[0].status = "completed"; tasks[1].status = "completed"; tasks[2].status = "in_progress"; }
    return {
      id: `demo-${i}`, intent_text: cmd, domain_classification: parsed.domain,
      priority: parsed.priority, status: i === 0 ? "executing" : "planning",
      decomposed_plan: tasks, task_graph: {}, outcome_summary: null,
      risk_assessment: { level: "medium" }, agent_assignments: founderOrchestrator.classifyAgentAssignment(tasks),
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date().toISOString(), started_at: null, completed_at: null,
    } as DirectiveRecord;
  });
}
