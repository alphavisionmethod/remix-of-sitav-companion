// ═══════════════════════════════════════════════════════════════
// SITA OS — Tasks & Workflows Center
// Unified task + workflow execution workspace with kanban,
// queue, dependency, and assigned views.
// ═══════════════════════════════════════════════════════════════

import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { useState, useMemo } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  ListTodo, Plus, Search, Calendar, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Users, RotateCcw, Filter, Workflow, ChevronRight, Eye,
  GitBranch, Kanban, ListOrdered, Target, Flame, Pause, Play,
} from "lucide-react";
// ── Demo Data ──────────────────────────────────────────────────
type TaskPriority = "critical" | "high" | "medium" | "low";
type TaskStatus = "todo" | "in-progress" | "waiting" | "blocked" | "done" | "cancelled";
type TaskDomain = "personal" | "business" | "household" | "finance" | "operations";

interface DemoTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  domain: TaskDomain;
  assignee?: string;
  dueDate?: string;
  recurring?: boolean;
  blockedBy?: string;
  waitingOn?: string;
  workflowId?: string;
  proofLinked?: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEMO_TASKS: DemoTask[] = [
  { id: "t1", title: "Review Q2 budget proposal", description: "Finance team submitted updated budget with 12% increase", status: "todo", priority: "high", domain: "finance", dueDate: "2026-04-10", createdAt: "2026-04-07T10:00:00Z", updatedAt: "2026-04-07T10:00:00Z" },
  { id: "t2", title: "Follow up with Apex Corp lead", description: "Last contact 5 days ago — needs reply", status: "in-progress", priority: "high", domain: "business", assignee: "You", dueDate: "2026-04-09", createdAt: "2026-04-04T09:00:00Z", updatedAt: "2026-04-08T14:00:00Z" },
  { id: "t3", title: "Schedule plumber for kitchen leak", description: "Kitchen faucet dripping since Tuesday", status: "waiting", priority: "medium", domain: "household", waitingOn: "Plumber callback", createdAt: "2026-04-06T08:00:00Z", updatedAt: "2026-04-07T16:00:00Z" },
  { id: "t4", title: "Prepare investor deck", description: "Series A update for board meeting", status: "blocked", priority: "critical", domain: "business", blockedBy: "Waiting on financials from CFO", dueDate: "2026-04-12", createdAt: "2026-04-01T09:00:00Z", updatedAt: "2026-04-08T11:00:00Z" },
  { id: "t5", title: "Weekly grocery run", description: "Regular household groceries", status: "todo", priority: "low", domain: "household", recurring: true, dueDate: "2026-04-10", createdAt: "2026-04-07T06:00:00Z", updatedAt: "2026-04-07T06:00:00Z" },
  { id: "t6", title: "Renew car insurance", description: "Policy expires in 3 days", status: "todo", priority: "critical", domain: "personal", dueDate: "2026-04-11", createdAt: "2026-04-05T09:00:00Z", updatedAt: "2026-04-05T09:00:00Z" },
  { id: "t7", title: "Send invoice to Delta Inc", description: "Project milestone 3 completed", status: "done", priority: "medium", domain: "business", proofLinked: true, createdAt: "2026-04-02T10:00:00Z", updatedAt: "2026-04-08T09:00:00Z" },
  { id: "t8", title: "Review employee onboarding docs", description: "New hire starting Monday", status: "in-progress", priority: "medium", domain: "operations", assignee: "HR Team", dueDate: "2026-04-11", createdAt: "2026-04-06T14:00:00Z", updatedAt: "2026-04-08T15:00:00Z" },
  { id: "t9", title: "Morning meditation", description: "Daily routine — 15 min", status: "done", priority: "low", domain: "personal", recurring: true, createdAt: "2026-04-09T06:30:00Z", updatedAt: "2026-04-09T06:45:00Z" },
  { id: "t10", title: "Pay electricity bill", description: "Due date approaching", status: "todo", priority: "high", domain: "finance", dueDate: "2026-04-10", createdAt: "2026-04-03T10:00:00Z", updatedAt: "2026-04-03T10:00:00Z" },
  { id: "t11", title: "Client presentation dry run", description: "Practice with team before Thursday pitch", status: "todo", priority: "high", domain: "business", dueDate: "2026-04-09", createdAt: "2026-04-07T11:00:00Z", updatedAt: "2026-04-07T11:00:00Z" },
  { id: "t12", title: "Update CRM contact records", description: "Batch update from conference contacts", status: "in-progress", priority: "low", domain: "operations", workflowId: "wf-1", createdAt: "2026-04-08T13:00:00Z", updatedAt: "2026-04-09T08:00:00Z" },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border/30",
};

const STATUS_COLUMNS: { key: TaskStatus; label: string; icon: React.ElementType }[] = [
  { key: "todo", label: "To Do", icon: ListTodo },
  { key: "in-progress", label: "In Progress", icon: Play },
  { key: "waiting", label: "Waiting On", icon: Pause },
  { key: "blocked", label: "Blocked", icon: AlertTriangle },
  { key: "done", label: "Done", icon: CheckCircle2 },
];

const DOMAIN_COLORS: Record<TaskDomain, string> = {
  personal: "bg-violet-500/15 text-violet-400",
  business: "bg-blue-500/15 text-blue-400",
  household: "bg-emerald-500/15 text-emerald-400",
  finance: "bg-amber-500/15 text-amber-400",
  operations: "bg-cyan-500/15 text-cyan-400",
};

export default function TasksWorkflowsCenter() {
  const { user , isDemo} = useAuth();
  const os = useOSOrchestration();
  const interfaceState = useAdaptiveInterface();
  const attentionStack = os.hydrated ? os.getAttentionStack() : { critical: [], active: [], queued: [], deferred: [] };
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<DemoTask | null>(null);

  // Supabase queries for live mode
  const { data: liveWorkflows } = useQuery({
    queryKey: ["workflow_runs", user?.id],
    enabled: !!user && !false,
    queryFn: async () => {
      const { data } = await fromTable("workflow_runs").select("*, workflows(name, trigger_event)").order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const tasks: DemoTask[] = useMemo(() => {
    return []; // Live mode would pull from a tasks table
  }, [false]);

  const filtered = useMemo(() => {
    let result = tasks;
    if (search) result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (domainFilter !== "all") result = result.filter(t => t.domain === domainFilter);
    return result;
  }, [tasks, search, domainFilter]);

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done" && t.status !== "cancelled");
  const todayTasks = tasks.filter(t => t.status !== "done" && t.status !== "cancelled");
  const blockedCount = tasks.filter(t => t.status === "blocked").length;
  const waitingCount = tasks.filter(t => t.status === "waiting").length;
  const recurringCount = tasks.filter(t => t.recurring).length;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
<SitaPageHeader
        icon={<ListTodo className="h-6 w-6" />}
        title="Tasks & Workflows"
        subtitle="Your action engine — tasks, queues, dependencies, and workflows"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-48 bg-card/30" />
          </div>
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Task</Button>
        </div>
      </SitaPageHeader>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Active", value: todayTasks.length, icon: ListTodo, color: "text-primary" },
          { label: "Overdue", value: overdue.length, icon: AlertTriangle, color: "text-destructive" },
          { label: "Blocked", value: blockedCount, icon: AlertTriangle, color: "text-amber-400" },
          { label: "Waiting On", value: waitingCount, icon: Clock, color: "text-muted-foreground" },
          { label: "Recurring", value: recurringCount, icon: RotateCcw, color: "text-emerald-400" },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-card border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={cn("h-5 w-5", kpi.color)} />
              <div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Domain filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {["all", "personal", "business", "household", "finance", "operations"].map(d => (
          <button key={d} onClick={() => setDomainFilter(d)} className={cn("px-2.5 py-1 text-xs rounded-md transition-colors capitalize", domainFilter === d ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{d}</button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><ListTodo className="h-4 w-4 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="board"><Kanban className="h-4 w-4 mr-1.5" />Board</TabsTrigger>
          <TabsTrigger value="queue"><ListOrdered className="h-4 w-4 mr-1.5" />Queue</TabsTrigger>
          <TabsTrigger value="dependencies"><GitBranch className="h-4 w-4 mr-1.5" />Dependencies</TabsTrigger>
          <TabsTrigger value="assigned"><Users className="h-4 w-4 mr-1.5" />Assigned</TabsTrigger>
          <TabsTrigger value="workflows"><Workflow className="h-4 w-4 mr-1.5" />Workflows</TabsTrigger>
          <TabsTrigger value="review"><Eye className="h-4 w-4 mr-1.5" />Review</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="flex gap-4">
            {/* Task list */}
            <div className="flex-1 space-y-2">
              {overdue.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">⚠ Overdue</h3>
                  {overdue.map(task => <TaskCard key={task.id} task={task} selected={selectedTask?.id === task.id} onClick={() => setSelectedTask(task)} />)}
                </div>
              )}
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">All Tasks</h3>
              {filtered.filter(t => t.status !== "done").map(task => (
                <TaskCard key={task.id} task={task} selected={selectedTask?.id === task.id} onClick={() => setSelectedTask(task)} />
              ))}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selectedTask && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="w-80 shrink-0 hidden lg:block">
                  <TaskDetailPanel task={selectedTask} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* BOARD TAB — Kanban */}
        <TabsContent value="board" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {STATUS_COLUMNS.map(col => {
              const colTasks = filtered.filter(t => t.status === col.key);
              return (
                <div key={col.key} className="space-y-2">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <col.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{col.label}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">{colTasks.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {colTasks.map(task => (
                      <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className="bg-card/60 border-border/30 hover:border-border/50 transition-colors cursor-pointer" onClick={() => setSelectedTask(task)}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2 mb-1.5">
                              <Badge variant="outline" className={cn("text-[9px] px-1 shrink-0", PRIORITY_COLORS[task.priority])}>{task.priority}</Badge>
                              <Badge variant="outline" className={cn("text-[9px] px-1 shrink-0", DOMAIN_COLORS[task.domain])}>{task.domain}</Badge>
                            </div>
                            <p className="text-xs font-medium line-clamp-2">{task.title}</p>
                            {task.dueDate && (
                              <p className={cn("text-[10px] mt-1", new Date(task.dueDate) < new Date() ? "text-destructive" : "text-muted-foreground")}>
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* QUEUE TAB */}
        <TabsContent value="queue" className="mt-4 space-y-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Execution Queue</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {filtered.filter(t => t.status === "todo" || t.status === "in-progress").sort((a, b) => {
                const p = { critical: 0, high: 1, medium: 2, low: 3 };
                return p[a.priority] - p[b.priority];
              }).map((task, i) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/30">
                  <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                  <Badge variant="outline" className={cn("text-[9px] shrink-0", PRIORITY_COLORS[task.priority])}>{task.priority}</Badge>
                  <span className="text-sm font-medium flex-1 truncate">{task.title}</span>
                  <Badge variant="outline" className={cn("text-[9px]", DOMAIN_COLORS[task.domain])}>{task.domain}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEPENDENCIES TAB */}
        <TabsContent value="dependencies" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4" /> Dependency Map</CardTitle></CardHeader>
            <CardContent>
              {tasks.filter(t => t.blockedBy || t.waitingOn).length === 0 ? (
                <p className="text-sm text-muted-foreground">No blocked or waiting tasks. All clear!</p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.blockedBy).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-amber-400">Blocked by: {task.blockedBy}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px]">{task.status}</Badge>
                    </div>
                  ))}
                  {tasks.filter(t => t.waitingOn).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/20">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Waiting on: {task.waitingOn}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px]">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSIGNED TAB */}
        <TabsContent value="assigned" className="mt-4 space-y-4">
          {["You", "HR Team", "Unassigned"].map(assignee => {
            const assigneeTasks = filtered.filter(t => (t.assignee || "Unassigned") === assignee && t.status !== "done");
            if (assigneeTasks.length === 0) return null;
            return (
              <Card key={assignee}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" /> {assignee}
                    <Badge variant="outline" className="ml-2 text-[10px]">{assigneeTasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {assigneeTasks.map(task => <TaskCard key={task.id} task={task} selected={false} onClick={() => setSelectedTask(task)} compact />)}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* WORKFLOWS TAB — surfaces existing WorkflowsCenter data */}
        <TabsContent value="workflows" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Workflow className="h-4 w-4" /> Active Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[{ name: "Invoice Approval Pipeline", status: "running", step: "3/5", trigger: "event" },
                  { name: "New Lead Nurture Sequence", status: "completed", step: "5/5", trigger: "webhook" },
                  { name: "Quarterly Report Generation", status: "pending", step: "0/4", trigger: "schedule" },
                ].map((wf, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/30">
                    <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", wf.status === "running" ? "bg-primary animate-pulse" : wf.status === "completed" ? "bg-emerald-500" : "bg-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{wf.name}</p>
                      <p className="text-xs text-muted-foreground">Step {wf.step} · {wf.trigger} trigger</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{wf.status}</Badge>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEW TAB */}
        <TabsContent value="review" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Weekly Task Review</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <h4 className="text-xs font-semibold text-destructive mb-2">Stale Tasks ({tasks.filter(t => t.status !== "done" && new Date(t.updatedAt) < new Date(Date.now() - 7 * 86400000)).length})</h4>
                  {tasks.filter(t => t.status !== "done" && new Date(t.updatedAt) < new Date(Date.now() - 7 * 86400000)).map(t => (
                    <p key={t.id} className="text-xs text-muted-foreground">• {t.title}</p>
                  ))}
                  {tasks.filter(t => t.status !== "done" && new Date(t.updatedAt) < new Date(Date.now() - 7 * 86400000)).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No stale tasks — great!</p>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-400 mb-2">Completed This Week ({tasks.filter(t => t.status === "done").length})</h4>
                  {tasks.filter(t => t.status === "done").map(t => (
                    <p key={t.id} className="text-xs text-muted-foreground">✓ {t.title}</p>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="text-xs font-semibold text-primary mb-2">Recurring Active ({recurringCount})</h4>
                  {tasks.filter(t => t.recurring).map(t => (
                    <p key={t.id} className="text-xs text-muted-foreground">↻ {t.title}</p>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Start Weekly Reset</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────
function TaskCard({ task, selected, onClick, compact }: { task: DemoTask; selected: boolean; onClick: () => void; compact?: boolean }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all border-border/30 hover:border-border/50",
        selected && "border-primary/40 bg-primary/5",
        isOverdue && "border-destructive/30 bg-destructive/5"
      )}
      onClick={onClick}
    >
      <CardContent className={cn("flex items-center gap-3", compact ? "p-3" : "p-4")}>
        <CheckCircle2 className={cn("h-4 w-4 shrink-0", task.status === "done" ? "text-emerald-500" : "text-muted-foreground/40")} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge variant="outline" className={cn("text-[9px] px-1", PRIORITY_COLORS[task.priority])}>{task.priority}</Badge>
            <Badge variant="outline" className={cn("text-[9px] px-1", DOMAIN_COLORS[task.domain])}>{task.domain}</Badge>
            {task.recurring && <RotateCcw className="h-2.5 w-2.5 text-muted-foreground" />}
            {task.proofLinked && <Badge variant="outline" className="text-[9px] px-1 border-emerald-500/30 text-emerald-400">✓ Proof</Badge>}
          </div>
          <p className={cn("text-sm font-medium truncate", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</p>
          {!compact && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
        </div>
        {task.dueDate && (
          <span className={cn("text-[10px] shrink-0", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}

function TaskDetailPanel({ task }: { task: DemoTask }) {
  return (
    <Card className="border-border/40 bg-card">
      <CardContent className="p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("text-[10px]", PRIORITY_COLORS[task.priority])}>{task.priority}</Badge>
            <Badge variant="outline" className={cn("text-[10px]", DOMAIN_COLORS[task.domain])}>{task.domain}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{task.status}</Badge>
          </div>
          <h3 className="text-base font-semibold">{task.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
        </div>

        <div className="space-y-2 text-sm">
          {task.assignee && (
            <div className="flex justify-between"><span className="text-muted-foreground">Assignee</span><span>{task.assignee}</span></div>
          )}
          {task.dueDate && (
            <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span className={new Date(task.dueDate) < new Date() ? "text-destructive" : ""}>{new Date(task.dueDate).toLocaleDateString()}</span></div>
          )}
          {task.blockedBy && (
            <div className="flex justify-between"><span className="text-muted-foreground">Blocked by</span><span className="text-amber-400 text-xs">{task.blockedBy}</span></div>
          )}
          {task.waitingOn && (
            <div className="flex justify-between"><span className="text-muted-foreground">Waiting on</span><span className="text-xs">{task.waitingOn}</span></div>
          )}
          {task.recurring && (
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline" className="text-[10px]"><RotateCcw className="h-2 w-2 mr-0.5" />Recurring</Badge></div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 text-xs">Mark Complete</Button>
          <Button size="sm" variant="outline" className="text-xs">Edit</Button>
        </div>

        {task.proofLinked && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400">Proof receipt linked</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
