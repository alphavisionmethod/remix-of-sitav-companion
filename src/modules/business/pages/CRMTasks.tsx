import React, { useState, useMemo } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCRMTasks, useCRMContacts, useCRMCompanies, useCRMOpportunities, useCreateTask, useUpdateTask } from "@/hooks/use-crm-data";
import {
  CheckCircle2, Circle, Clock, Plus, AlertTriangle, Calendar,
  Filter, Target, User, Building2, TrendingUp, Zap, ListTodo,
  ChevronDown, ChevronRight, Flag, MoreHorizontal
} from "lucide-react";
import { format, isPast, formatDistanceToNow, isToday, isTomorrow, isThisWeek, differenceInDays } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";

const PRIORITY_META: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  high: { color: "text-red-400", bg: "bg-red-500/10", icon: Flag },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Flag },
  low: { color: "text-muted-foreground", bg: "bg-muted/50", icon: Flag },
};

const TASK_TYPE_META: Record<string, { color: string; label: string }> = {
  "follow-up": { color: "text-blue-400", label: "Follow-Up" },
  meeting: { color: "text-purple-400", label: "Meeting" },
  call: { color: "text-green-400", label: "Call" },
  email: { color: "text-indigo-400", label: "Email" },
  proposal: { color: "text-pink-400", label: "Proposal" },
  review: { color: "text-orange-400", label: "Review" },
  other: { color: "text-muted-foreground", label: "Other" },
};

type FilterType = "all" | "pending" | "overdue" | "today" | "upcoming" | "completed";

const CRMTasks = () => {
  const { primaryMode } = useBusinessProfile();
  const { data: tasks = [] } = useCRMTasks();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const { data: opps = [] } = useCRMOpportunities();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [filter, setFilter] = useState<FilterType>("pending");
  const [showAdd, setShowAdd] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["overdue", "today", "upcoming"]));
  type TaskForm = { title: string; description: string; priority: string; due_date: string; task_type: string; contact_id: string; company_id: string; opportunity_id: string };
  const EMPTY_TASK_FORM: TaskForm = { title: "", description: "", priority: "medium", due_date: "", task_type: "follow-up", contact_id: "", company_id: "", opportunity_id: "" };
  const { draft, updateDraft, clearDraft } = useDraftAutosave<TaskForm>("business:crm:task:new", "business");
  const [form, setForm] = useState<TaskForm>(() => ({ ...EMPTY_TASK_FORM, ...draft }));
  React.useEffect(() => { updateDraft(form); }, [form, updateDraft]);

  const contactMap = useMemo(() => {
    const m: Record<string, string> = {};
    contacts.forEach(c => { m[c.id] = `${c.first_name} ${c.last_name}`; });
    return m;
  }, [contacts]);

  const companyMap = useMemo(() => {
    const m: Record<string, string> = {};
    companies.forEach(c => { m[c.id] = c.name; });
    return m;
  }, [companies]);

  const oppMap = useMemo(() => {
    const m: Record<string, string> = {};
    opps.forEach(o => { m[o.id] = o.title; });
    return m;
  }, [opps]);

  // Computed groups
  const overdue = useMemo(() => tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))), [tasks]);
  const todayTasks = useMemo(() => tasks.filter(t => t.status !== "completed" && t.due_date && isToday(new Date(t.due_date))), [tasks]);
  const upcoming = useMemo(() => tasks.filter(t => t.status !== "completed" && t.due_date && !isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))), [tasks]);
  const noDue = useMemo(() => tasks.filter(t => t.status !== "completed" && !t.due_date), [tasks]);
  const completed = useMemo(() => tasks.filter(t => t.status === "completed"), [tasks]);
  const pendingCount = tasks.filter(t => t.status !== "completed").length;

  const filtered = useMemo(() => {
    switch (filter) {
      case "overdue": return overdue;
      case "today": return todayTasks;
      case "upcoming": return upcoming;
      case "completed": return completed;
      case "pending": return [...overdue, ...todayTasks, ...upcoming, ...noDue];
      default: return tasks;
    }
  }, [filter, tasks, overdue, todayTasks, upcoming, completed, noDue]);

  // Stats
  const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;
  const highPriorityPending = tasks.filter(t => t.status !== "completed" && t.priority === "high").length;

  const toggleGroup = (g: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    try {
      await createTask.mutateAsync({
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        due_date: form.due_date || null,
        task_type: form.task_type,
        contact_id: form.contact_id || null,
        company_id: form.company_id || null,
        opportunity_id: form.opportunity_id || null,
      });
      toast.success("Task created");
      setShowAdd(false);
      setForm(EMPTY_TASK_FORM);
      clearDraft();
    } catch { toast.error("Failed to create task"); }
  };

  const toggleComplete = async (t: typeof tasks[0]) => {
    try {
      await updateTask.mutateAsync({
        id: t.id,
        updates: {
          status: t.status === "completed" ? "pending" : "completed",
          completed_at: t.status === "completed" ? null : new Date().toISOString()
        },
      });
      toast.success(t.status === "completed" ? "Reopened" : "Completed!");
    } catch { toast.error("Failed to update"); }
  };

  const dueDateLabel = (d: string) => {
    const date = new Date(d);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return `${differenceInDays(new Date(), date)}d overdue`;
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d");
  };

  const TaskItem = ({ t }: { t: typeof tasks[0] }) => {
    const isOverdue = t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date));
    const pri = PRIORITY_META[t.priority] || PRIORITY_META.medium;
    const typeMeta = TASK_TYPE_META[t.task_type] || TASK_TYPE_META.other;

    return (
      <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors group">
        <button onClick={() => toggleComplete(t)} className="shrink-0 mt-0.5">
          {t.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <Circle className={`h-5 w-5 ${isOverdue ? "text-red-400" : "text-muted-foreground"} hover:text-primary transition-colors`} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {t.title}
            </p>
            <pri.icon className={`h-3 w-3 ${pri.color}`} />
          </div>
          {t.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className={`text-[10px] ${typeMeta.color} border-current/20`}>{typeMeta.label}</Badge>
            {t.contact_id && contactMap[t.contact_id] && (
              <span className="text-[10px] text-primary flex items-center gap-0.5"><User className="h-2.5 w-2.5" />{contactMap[t.contact_id]}</span>
            )}
            {t.company_id && companyMap[t.company_id] && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{companyMap[t.company_id]}</span>
            )}
            {t.opportunity_id && oppMap[t.opportunity_id] && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" />{oppMap[t.opportunity_id]}</span>
            )}
          </div>
        </div>
        {t.due_date && (
          <span className={`text-xs shrink-0 flex items-center gap-1 ${isOverdue ? "text-red-400 font-medium" : isToday(new Date(t.due_date)) ? "text-primary font-medium" : "text-muted-foreground"}`}>
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
            <Calendar className="h-3 w-3" />
            {dueDateLabel(t.due_date)}
          </span>
        )}
      </div>
    );
  };

  const TaskGroup = ({ label, items, groupKey, icon: GIcon, color }: { label: string; items: typeof tasks; groupKey: string; icon: React.ElementType; color: string }) => {
    if (items.length === 0) return null;
    const isOpen = expandedGroups.has(groupKey);
    return (
      <div className="mb-3">
        <button
          className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md hover:bg-muted/20 transition-colors"
          onClick={() => toggleGroup(groupKey)}
        >
          {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          <GIcon className={`h-3.5 w-3.5 ${color}`} />
          <span className="text-xs font-semibold text-foreground">{label}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{items.length}</Badge>
        </button>
        {isOpen && (
          <div className="ml-2 border-l border-border/30 pl-2 mt-1">
            {items.map(t => <TaskItem key={t.id} t={t} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tasks & Follow-Through</h2>
          <p className="text-xs text-muted-foreground">
            {pendingCount} pending
            {overdue.length > 0 && <span className="text-red-400"> · {overdue.length} overdue</span>}
            {highPriorityPending > 0 && <span className="text-orange-400"> · {highPriorityPending} high priority</span>}
          </p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Task title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <div className="grid grid-cols-3 gap-2">
                <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.task_type} onChange={e => setForm(p => ({ ...p, task_type: e.target.value }))}>
                  {Object.entries(TASK_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {contacts.length > 0 && (
                  <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.contact_id} onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))}>
                    <option value="">Link contact...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                )}
                {opps.length > 0 && (
                  <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.opportunity_id} onChange={e => setForm(p => ({ ...p, opportunity_id: e.target.value }))}>
                    <option value="">Link deal...</option>
                    {opps.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                  </select>
                )}
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={createTask.isPending}>
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/50 p-3">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{pendingCount}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="border-border/50 bg-card/50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-lg font-bold text-foreground">{overdue.length}</p>
              <p className="text-[10px] text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
        <Card className="border-border/50 bg-card/50 p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-lg font-bold text-foreground">{todayTasks.length}</p>
              <p className="text-[10px] text-muted-foreground">Due Today</p>
            </div>
          </div>
        </Card>
        <Card className="border-border/50 bg-card/50 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-lg font-bold text-foreground">{completionRate}%</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          { key: "pending", label: "Active", count: pendingCount },
          { key: "overdue", label: "Overdue", count: overdue.length },
          { key: "today", label: "Today", count: todayTasks.length },
          { key: "upcoming", label: "Upcoming", count: upcoming.length },
          { key: "completed", label: "Done", count: completed.length },
          { key: "all", label: "All", count: tasks.length },
        ] as { key: FilterType; label: string; count: number }[]).map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? "secondary" : "ghost"}
            size="sm"
            className={`h-7 text-xs gap-1 ${f.key === "overdue" && f.count > 0 ? "text-red-400" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.count > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">{f.count}</Badge>}
          </Button>
        ))}
      </div>

      {/* Task List */}
      {filter === "pending" ? (
        <div>
          <TaskGroup label="Overdue" items={overdue} groupKey="overdue" icon={AlertTriangle} color="text-red-400" />
          <TaskGroup label="Today" items={todayTasks} groupKey="today" icon={Zap} color="text-yellow-400" />
          <TaskGroup label="Upcoming" items={upcoming} groupKey="upcoming" icon={Calendar} color="text-blue-400" />
          {noDue.length > 0 && <TaskGroup label="No Due Date" items={noDue} groupKey="nodue" icon={Clock} color="text-muted-foreground" />}
        </div>
      ) : (
        <div>
          {filtered.map(t => <TaskItem key={t.id} t={t} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {filter === "completed" ? "No Completed Tasks" : filter === "overdue" ? "No Overdue Tasks" : "No Tasks"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {tasks.length === 0 ? "Create your first task to start tracking follow-through" : "Nothing matches this filter"}
          </p>
          {tasks.length === 0 && (
            <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5" /> Create First Task
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CRMTasks;
