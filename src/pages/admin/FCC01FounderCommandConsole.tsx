// ═══════════════════════════════════════════════════════════════
// SITA OS — Founder Command Console (FCC01)
// Natural-language command interface for strategic directives
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Terminal, Send, Sparkles, Clock, CheckCircle2, AlertTriangle, XCircle,
  Zap, Shield, Gauge, Rocket, Users, DollarSign, Brain, ChevronRight,
  Play, RotateCcw, Target, TrendingUp
} from "lucide-react";
import { founderOrchestrator, type DirectiveRecord, type DirectiveDomain, type AgentClass } from "@/lib/services/founder-orchestrator";
import { SimulationPreview } from "@/platform/admin/components/admin/shells/SimulationPreview";

const DOMAIN_CONFIG: Record<DirectiveDomain, { icon: React.ElementType; color: string; label: string }> = {
  reliability: { icon: Shield, color: "text-trust-safe", label: "Reliability" },
  performance: { icon: Gauge, color: "text-sita-gold", label: "Performance" },
  security: { icon: Shield, color: "text-destructive", label: "Security" },
  rollout: { icon: Rocket, color: "text-primary", label: "Rollout" },
  ux: { icon: Users, color: "text-accent", label: "UX" },
  cost: { icon: DollarSign, color: "text-sita-gold", label: "Cost" },
  general: { icon: Brain, color: "text-muted-foreground", label: "General" },
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: "text-muted-foreground" },
  planning: { icon: Brain, color: "text-primary" },
  executing: { icon: Play, color: "text-sita-gold" },
  blocked: { icon: AlertTriangle, color: "text-destructive" },
  completed: { icon: CheckCircle2, color: "text-trust-safe" },
  failed: { icon: XCircle, color: "text-destructive" },
};

const AGENT_ICONS: Record<AgentClass, { icon: React.ElementType; label: string }> = {
  dev: { icon: Terminal, label: "Dev" },
  qa: { icon: CheckCircle2, label: "QA" },
  ops: { icon: Zap, label: "Ops" },
  security: { icon: Shield, label: "Security" },
  performance: { icon: Gauge, label: "Performance" },
  support: { icon: Users, label: "Support" },
  product: { icon: Target, label: "Product" },
};

export default function FCC01FounderCommandConsole() {
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const [commandText, setCommandText] = useState("");
  const [directives, setDirectives] = useState<DirectiveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDirective, setSelectedDirective] = useState<DirectiveRecord | null>(null);
  const suggestedCommands = founderOrchestrator.getSuggestedCommands();

  useEffect(() => {
    loadDirectives();
  }, [user]);

  async function loadDirectives() {
    if (!user && !isDemo) return;
    setLoading(true);
    if (isDemo) {
      setDirectives(getDemoDirectives());
    } else if (user) {
      const data = await founderOrchestrator.getDirectives(user.id);
      setDirectives(data);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!commandText.trim()) return;
    setSubmitting(true);
    if (isDemo) {
      const parsed = founderOrchestrator.parseDirective(commandText);
      const tasks = founderOrchestrator.decomposeToTaskGraph(commandText, parsed.domain);
      const demoDirective: DirectiveRecord = {
        id: `demo-${Date.now()}`,
        intent_text: commandText,
        domain_classification: parsed.domain,
        priority: parsed.priority,
        status: "planning",
        decomposed_plan: tasks,
        task_graph: {},
        outcome_summary: null,
        risk_assessment: { level: "medium", factors: [] },
        agent_assignments: founderOrchestrator.classifyAgentAssignment(tasks),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        started_at: null,
        completed_at: null,
      };
      setDirectives(prev => [demoDirective, ...prev]);
      setSelectedDirective(demoDirective);
      toast({ title: "Directive Created", description: `Decomposed into ${tasks.length} tasks across ${new Set(tasks.map(t => t.agentClass)).size} agent classes` });
    } else if (user) {
      const result = await founderOrchestrator.createDirective(user.id, commandText);
      if (result) {
        setDirectives(prev => [result, ...prev]);
        setSelectedDirective(result);
        toast({ title: "Directive Created", description: "Execution plan generated" });
      }
    }
    setCommandText("");
    setSubmitting(false);
  }

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Terminal}
        title="Founder Command Console"
        subtitle="Issue strategic directives — the AI CTO decomposes, assigns, and executes"
        accent="primary"
      />

      {/* Command Input */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-primary/20 bg-white/[0.03] backdrop-blur-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Sparkles className="h-4 w-4 text-sita-gold" />
              <span>What should the platform do next?</span>
            </div>
            <Textarea
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="e.g. Make cloud sync completely reliable across all devices..."
              className="min-h-[80px] bg-white/[0.02] border-white/10 text-foreground placeholder:text-muted-foreground/50 resize-none"
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleSubmit(); }}
            />
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {suggestedCommands.slice(0, 3).map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => setCommandText(cmd)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all"
                  >
                    {cmd.length > 50 ? cmd.slice(0, 50) + "…" : cmd}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!commandText.trim() || submitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Processing…" : "Execute"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="directives" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/10">
          <TabsTrigger value="directives">Active Directives</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="directives" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Directive List */}
            <div className="space-y-3">
              {loading ? (
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-8 text-center text-muted-foreground">Loading directives…</CardContent>
                </Card>
              ) : directives.length === 0 ? (
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Terminal className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>No directives yet. Issue your first command above.</p>
                  </CardContent>
                </Card>
              ) : (
                directives.map((d, i) => {
                  const domainCfg = DOMAIN_CONFIG[d.domain_classification] || DOMAIN_CONFIG.general;
                  const statusCfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending;
                  const DomainIcon = domainCfg.icon;
                  const StatusIcon = statusCfg.icon;
                  const isSelected = selectedDirective?.id === d.id;
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        onClick={() => setSelectedDirective(d)}
                        className={`cursor-pointer transition-all border ${isSelected ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 p-1.5 rounded-lg bg-white/[0.05] ${domainCfg.color}`}>
                              <DomainIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-2">{d.intent_text}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  <StatusIcon className={`h-3 w-3 ${statusCfg.color}`} />
                                  {d.status}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">{domainCfg.label}</Badge>
                                <Badge variant="outline" className="text-[10px]">{(d.decomposed_plan ?? []).length} tasks</Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Detail Panel */}
            <AnimatePresence mode="wait">
              {selectedDirective ? (
                <motion.div
                  key={selectedDirective.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <DirectiveDetail directive={selectedDirective} />
                </motion.div>
              ) : (
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>Select a directive to see its execution plan</p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="space-y-3">
                {directives.filter(d => d.status === "completed" || d.status === "failed").length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No completed directives yet</p>
                ) : (
                  directives.filter(d => d.status === "completed" || d.status === "failed").map(d => {
                    const StatusIcon = STATUS_CONFIG[d.status]?.icon || Clock;
                    return (
                      <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <StatusIcon className={`h-4 w-4 ${STATUS_CONFIG[d.status]?.color}`} />
                        <span className="text-sm flex-1">{d.intent_text}</span>
                        <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid gap-3">
            {suggestedCommands.map((cmd, i) => (
              <Card key={i} className="border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => setCommandText(cmd)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-sita-gold shrink-0" />
                  <span className="text-sm">{cmd}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 ml-auto shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="simulation">
          <SimulationPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DirectiveDetail({ directive }: { directive: DirectiveRecord }) {
  const tasks = directive.decomposed_plan ?? [];
  const assignments = directive.agent_assignments ?? [];
  const risk = ((directive.risk_assessment as { level?: string })?.level) || "low";
  const domainCfg = DOMAIN_CONFIG[directive.domain_classification] || DOMAIN_CONFIG.general;
  const DomainIcon = domainCfg.icon;

  const milestones = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const ms = (t as { milestone?: string }).milestone || "Tasks";
    milestones.set(ms, [...(milestones.get(ms) || []), t]);
  }

  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DomainIcon className={`h-5 w-5 ${domainCfg.color}`} />
          <CardTitle className="text-base">{directive.intent_text}</CardTitle>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-[10px]">{domainCfg.label}</Badge>
          <Badge variant="outline" className="text-[10px]">Priority: {directive.priority}</Badge>
          <Badge variant={risk === "high" || risk === "critical" ? "destructive" : "outline"} className="text-[10px]">
            Risk: {risk}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agent Assignments */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Agent Assignments</p>
          <div className="flex flex-wrap gap-2">
            {assignments.map(a => {
              const agentCfg = AGENT_ICONS[a.agentClass];
              const AgentIcon = agentCfg?.icon || Brain;
              return (
                <div key={a.agentClass} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                  <AgentIcon className="h-3 w-3 text-primary" />
                  <span>{agentCfg?.label || a.agentClass}</span>
                  <span className="text-muted-foreground">× {a.taskCount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Milestones */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Execution Plan ({tasks.length} tasks)</p>
          <div className="space-y-3">
            {Array.from(milestones.entries()).map(([ms, msTasks]) => (
              <div key={ms}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium">{ms}</span>
                  <span className="text-[10px] text-muted-foreground">({msTasks.length} tasks)</span>
                </div>
                <div className="ml-4 space-y-1">
                  {msTasks.map((t: any) => {
                    const agentCfg = AGENT_ICONS[t.agentClass as AgentClass];
                    const AgentIcon = agentCfg?.icon || Brain;
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-white/[0.02]">
                        <AgentIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="flex-1">{t.title}</span>
                        {t.requiresApproval && <Badge variant="outline" className="text-[9px] h-4">Approval</Badge>}
                        <span className="text-muted-foreground">{t.estimatedMinutes}m</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <Button size="sm" className="gap-1.5 flex-1">
            <Play className="h-3.5 w-3.5" /> Execute Plan
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Revise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getDemoDirectives(): DirectiveRecord[] {
  const cmds = [
    "Make cloud sync completely reliable across all devices",
    "Reduce crash rate in beta by 25% before next release",
    "Scan the platform for critical security risks",
  ];
  return cmds.map((cmd, i) => {
    const parsed = founderOrchestrator.parseDirective(cmd);
    const tasks = founderOrchestrator.decomposeToTaskGraph(cmd, parsed.domain);
    return {
      id: `demo-${i}`,
      intent_text: cmd,
      domain_classification: parsed.domain,
      priority: parsed.priority,
      status: i === 0 ? "executing" : i === 1 ? "planning" : "completed",
      decomposed_plan: tasks,
      task_graph: {},
      outcome_summary: i === 2 ? "3 critical issues found and patched" : null,
      risk_assessment: { level: i === 2 ? "high" : "medium", factors: [] },
      agent_assignments: founderOrchestrator.classifyAgentAssignment(tasks),
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date(Date.now() - i * 1800000).toISOString(),
      started_at: i === 0 ? new Date(Date.now() - 1800000).toISOString() : null,
      completed_at: i === 2 ? new Date(Date.now() - 900000).toISOString() : null,
    } as DirectiveRecord;
  });
}
