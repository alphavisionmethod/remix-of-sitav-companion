// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Center (FCC04)
// Knowledge & repair playbooks, incident patterns, auto-heal
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Play, Search, Plus, Shield, Zap, AlertTriangle, CheckCircle2,
  Clock, Server, Terminal, Users, Gauge, Brain, RotateCcw, Activity,
  FileText, ChevronRight, Hash, Wrench
} from "lucide-react";
import { founderOrchestrator, type RunbookRecord, type AgentClass } from "@/lib/services/founder-orchestrator";

const DOMAIN_COLORS: Record<string, string> = {
  ops: "text-sita-gold", security: "text-destructive", sync: "text-primary",
  reliability: "text-trust-safe", performance: "text-orange-400", auth: "text-destructive",
  storage: "text-accent", general: "text-muted-foreground",
};

const SEVERITY_BADGES: Record<string, string> = {
  low: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
  medium: "bg-sita-gold/10 text-sita-gold border-sita-gold/20",
  high: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const DEMO_RUNBOOKS: Omit<RunbookRecord, "id" | "created_at">[] = [
  {
    title: "Sync Queue Backlog Recovery",
    description: "Automated procedure for recovering from sync queue backlogs exceeding threshold",
    domain: "sync", severity: "high",
    trigger_conditions: [{ type: "metric", pattern: "sync_queue_depth > 10000" }, { type: "duration", pattern: "> 15 minutes" }],
    steps: [
      { order: 1, action: "Pause incoming sync requests", agentClass: "ops" as AgentClass, automate: true },
      { order: 2, action: "Analyze queue composition by type", agentClass: "ops" as AgentClass, automate: true },
      { order: 3, action: "Drain stale entries (> 1h old)", agentClass: "ops" as AgentClass, automate: true },
      { order: 4, action: "Scale worker pool 2x", agentClass: "ops" as AgentClass, automate: true },
      { order: 5, action: "Resume and monitor for 10 min", agentClass: "ops" as AgentClass, automate: true },
      { order: 6, action: "If unresolved, escalate to human", agentClass: "support" as AgentClass, automate: false },
    ],
    agent_assignments: [{ agentClass: "ops" as AgentClass, role: "executor" }],
    auto_heal_enabled: true,
    auto_heal_config: { max_auto_runs: 3, cooldown_minutes: 30 },
    tags: ["sync", "queue", "backlog", "auto-heal"],
    execution_count: 14,
    last_executed_at: new Date(Date.now() - 86400000).toISOString(),
    last_execution_result: { status: "success", steps_completed: "all", duration_ms: 4200 },
    incident_patterns: [{ pattern: "Spike after bulk import", frequency: 8 }, { pattern: "Deploy-correlated", frequency: 3 }],
    status: "active",
  },
  {
    title: "Auth Service Health Check & Repair",
    description: "Diagnose and repair authentication service degradation",
    domain: "auth", severity: "critical",
    trigger_conditions: [{ type: "metric", pattern: "auth_error_rate > 5%" }, { type: "alert", pattern: "auth_service_degraded" }],
    steps: [
      { order: 1, action: "Check auth service health endpoint", agentClass: "ops" as AgentClass, automate: true },
      { order: 2, action: "Verify JWT signing key validity", agentClass: "security" as AgentClass, automate: true },
      { order: 3, action: "Check database connection pool", agentClass: "ops" as AgentClass, automate: true },
      { order: 4, action: "Review recent auth config changes", agentClass: "security" as AgentClass, automate: false },
      { order: 5, action: "Restart auth workers if needed", agentClass: "ops" as AgentClass, automate: true },
    ],
    agent_assignments: [{ agentClass: "security" as AgentClass, role: "lead" }, { agentClass: "ops" as AgentClass, role: "executor" }],
    auto_heal_enabled: false,
    auto_heal_config: {},
    tags: ["auth", "critical", "health-check"],
    execution_count: 3,
    last_executed_at: new Date(Date.now() - 604800000).toISOString(),
    last_execution_result: { status: "success", steps_completed: "all", duration_ms: 8400 },
    incident_patterns: [{ pattern: "Post-deploy regression", frequency: 2 }],
    status: "active",
  },
  {
    title: "Storage Corruption Detection & Repair",
    description: "Scan for and repair corrupted objects in cloud storage",
    domain: "storage", severity: "high",
    trigger_conditions: [{ type: "metric", pattern: "checksum_mismatch_count > 0" }],
    steps: [
      { order: 1, action: "Run integrity scan on affected bucket", agentClass: "ops" as AgentClass, automate: true },
      { order: 2, action: "Identify corrupted objects", agentClass: "ops" as AgentClass, automate: true },
      { order: 3, action: "Attempt repair from redundant copies", agentClass: "ops" as AgentClass, automate: true },
      { order: 4, action: "Notify affected users", agentClass: "support" as AgentClass, automate: false },
      { order: 5, action: "Generate repair report", agentClass: "ops" as AgentClass, automate: true },
    ],
    agent_assignments: [{ agentClass: "ops" as AgentClass, role: "executor" }],
    auto_heal_enabled: true,
    auto_heal_config: { max_auto_runs: 1, cooldown_minutes: 120 },
    tags: ["storage", "corruption", "repair"],
    execution_count: 7,
    last_executed_at: new Date(Date.now() - 259200000).toISOString(),
    last_execution_result: { status: "success", steps_completed: "4/5", duration_ms: 12000 },
    incident_patterns: [{ pattern: "Hardware failure cascade", frequency: 1 }],
    status: "active",
  },
  {
    title: "Performance Regression Triage",
    description: "Investigate and address performance regressions after deploys",
    domain: "performance", severity: "medium",
    trigger_conditions: [{ type: "metric", pattern: "p99_latency_increase > 20%" }],
    steps: [
      { order: 1, action: "Compare build performance profiles", agentClass: "performance" as AgentClass, automate: true },
      { order: 2, action: "Identify hot paths and allocations", agentClass: "performance" as AgentClass, automate: true },
      { order: 3, action: "Generate optimization candidates", agentClass: "dev" as AgentClass, automate: true },
      { order: 4, action: "Review and approve patches", agentClass: "dev" as AgentClass, automate: false },
    ],
    agent_assignments: [{ agentClass: "performance" as AgentClass, role: "lead" }, { agentClass: "dev" as AgentClass, role: "implementer" }],
    auto_heal_enabled: false,
    auto_heal_config: {},
    tags: ["performance", "regression", "latency"],
    execution_count: 9,
    last_executed_at: new Date(Date.now() - 172800000).toISOString(),
    last_execution_result: { status: "success", steps_completed: "all", duration_ms: 6700 },
    incident_patterns: [{ pattern: "Bundle size increase", frequency: 5 }, { pattern: "N+1 query", frequency: 3 }],
    status: "active",
  },
];

export default function FCC04RunbookCenter() {
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const [runbooks, setRunbooks] = useState<RunbookRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRunbook, setSelectedRunbook] = useState<RunbookRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (isDemo) {
        const demo = DEMO_RUNBOOKS.map((r, i) => ({ ...r, id: `demo-${i}`, created_at: new Date(Date.now() - i * 86400000).toISOString() })) as RunbookRecord[];
        setRunbooks(demo);
      } else if (user) {
        const data = await founderOrchestrator.getRunbooks(user.id);
        setRunbooks(data);
      }
    }
    load();
  }, [user, isDemo]);

  const filtered = runbooks.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.domain.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleExecute(rb: RunbookRecord) {
    if (isDemo) {
      toast({ title: "Runbook Executed", description: `${rb.title} completed successfully (demo)` });
      return;
    }
    const result = await founderOrchestrator.executeRunbook(rb.id);
    toast({ title: result.success ? "Runbook Executed" : "Execution Failed", description: result.result });
  }

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={BookOpen}
        title="Runbook Center"
        subtitle="Operational playbooks, auto-heal procedures, and incident pattern memory"
        accent="trust"
      >
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Runbook
        </Button>
      </AdminPageHeader>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search runbooks by name, domain, or tag…"
          className="pl-10 bg-white/[0.03] border-white/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Runbook List */}
        <div className="xl:col-span-1 space-y-3">
          {filtered.map((rb, i) => {
            const isSelected = selectedRunbook?.id === rb.id;
            return (
              <motion.div key={rb.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card
                  onClick={() => setSelectedRunbook(rb)}
                  className={`cursor-pointer transition-all ${isSelected ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg bg-white/[0.05] ${DOMAIN_COLORS[rb.domain] || "text-muted-foreground"}`}>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{rb.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className={`text-[9px] ${SEVERITY_BADGES[rb.severity] || ""}`}>{rb.severity}</Badge>
                          <Badge variant="outline" className="text-[9px]">{rb.domain}</Badge>
                          {rb.auto_heal_enabled && (
                            <Badge variant="outline" className="text-[9px] text-trust-safe border-trust-safe/20">auto-heal</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {rb.execution_count} runs • Last: {rb.last_executed_at ? new Date(rb.last_executed_at).toLocaleDateString() : "never"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">No runbooks found</CardContent>
            </Card>
          )}
        </div>

        {/* Runbook Detail */}
        <div className="xl:col-span-2">
          <AnimatePresence mode="wait">
            {selectedRunbook ? (
              <motion.div key={selectedRunbook.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{selectedRunbook.title}</CardTitle>
                      <Button size="sm" className="gap-1.5" onClick={() => handleExecute(selectedRunbook)}>
                        <Play className="h-3.5 w-3.5" /> Execute
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedRunbook.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedRunbook.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground">
                          <Hash className="h-2.5 w-2.5 inline mr-0.5" />{tag}
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Trigger Conditions */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Trigger Conditions
                      </p>
                      <div className="space-y-1">
                        {(selectedRunbook.trigger_conditions as any[]).map((tc, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-white/[0.02] border border-white/5">
                            <Badge variant="outline" className="text-[9px]">{tc.type}</Badge>
                            <span className="font-mono text-muted-foreground">{tc.pattern}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5" /> Execution Steps
                      </p>
                      <div className="space-y-1">
                        {(selectedRunbook.steps as any[]).map((step, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs p-2.5 rounded bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-muted-foreground w-5">{step.order}.</span>
                            <span className="flex-1">{step.action}</span>
                            <Badge variant="outline" className="text-[9px]">{step.agentClass}</Badge>
                            {step.automate ? (
                              <Badge variant="outline" className="text-[9px] text-trust-safe border-trust-safe/20">auto</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] text-sita-gold border-sita-gold/20">manual</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Incident Patterns */}
                    {(selectedRunbook.incident_patterns as any[]).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5" /> Known Incident Patterns
                        </p>
                        <div className="space-y-1">
                          {(selectedRunbook.incident_patterns as any[]).map((ip, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-white/[0.02] border border-white/5">
                              <Brain className="h-3 w-3 text-primary" />
                              <span className="flex-1">{ip.pattern}</span>
                              <span className="text-muted-foreground">{ip.frequency}× seen</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Last Execution */}
                    {selectedRunbook.last_execution_result && (
                      <div className="p-3 rounded-lg bg-trust-safe/5 border border-trust-safe/10">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-trust-safe" />
                          <span className="font-medium">Last run: {(selectedRunbook.last_execution_result as any).status}</span>
                          <span className="text-muted-foreground ml-auto">{((selectedRunbook.last_execution_result as any).duration_ms / 1000).toFixed(1)}s</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p>Select a runbook to view details and execute</p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
