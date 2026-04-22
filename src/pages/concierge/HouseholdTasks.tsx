import { useAction } from "@/hooks/use-action";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { MemberAvatar } from "@/components/sita/HouseholdComponents";
import { ConciergeAdvisorInsightCard, ConciergePageWrapper } from "@/components/concierge";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, Clock, AlertTriangle, Home, Wrench, ShoppingCart, Car, FileText, Plus,
  Users, GraduationCap, Stethoscope, ArrowUpRight, RotateCcw, Sparkles, Shield, X, Trash2, Check
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";

type ViewFilter = "all" | "today" | "this-week" | "overdue" | "by-person" | "high-priority";

const priorityIcon: Record<string, typeof Home> = {
  high: AlertTriangle, medium: Clock, low: CheckSquare,
};

const statusConfig: Record<string, { label: string; class: string }> = {
  todo: { label: "To Do", class: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", class: "bg-primary/10 text-primary" },
  waiting: { label: "Waiting", class: "bg-amber-500/10 text-amber-600" },
  done: { label: "Done", class: "bg-chart-2/10 text-chart-2" },
  escalated: { label: "Escalated", class: "bg-destructive/10 text-destructive" },
};

const categoryIcon: Record<string, typeof Home> = {
  Errands: ShoppingCart, "Home Maintenance": Wrench, School: GraduationCap,
  Health: Stethoscope, Admin: FileText, Events: Home, Shopping: ShoppingCart,
  Vehicle: Car, General: Home,
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const HouseholdTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "General", priority: "medium", due_date: "", description: "", assigned_to: "" });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["concierge-tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await fromTable("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addTask = useAction("concierge", "task.create");

  const updateStatus = useAction("concierge", "status.update", {
    invalidateKeys: [["concierge-tasks"]],
  });

  const deleteTask = useAction("concierge", "task.delete", {
    invalidateKeys: [["concierge-tasks"]],
  });

  const now = new Date();
  const isOverdue = (d: string | null) => d && new Date(d) < now;
  const isToday = (d: string | null) => {
    if (!d) return false;
    const dt = new Date(d);
    return dt.toDateString() === now.toDateString();
  };
  const isThisWeek = (d: string | null) => {
    if (!d) return false;
    const dt = new Date(d);
    const diff = (dt.getTime() - now.getTime()) / 86400000;
    return diff >= -1 && diff <= 7;
  };

  const filtered = tasks.filter((t) => {
    if (t.status === "done" && filter !== "all") return false;
    if (filter === "overdue") return isOverdue(t.due_date) && t.status !== "done";
    if (filter === "today") return isToday(t.due_date);
    if (filter === "this-week") return isThisWeek(t.due_date);
    if (filter === "high-priority") return t.priority === "high";
    return true;
  });

  const sorted = filter === "by-person"
    ? [...filtered].sort((a, b) => (a.assigned_to || "").localeCompare(b.assigned_to || ""))
    : filtered;

  const openCount = tasks.filter(t => t.status !== "done").length;
  const overdueCount = tasks.filter(t => isOverdue(t.due_date) && t.status !== "done").length;
  const todayCount = tasks.filter(t => isToday(t.due_date)).length;
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
  const highCount = tasks.filter(t => t.priority === "high" && t.status !== "done").length;

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />
      <div className="flex items-center justify-between">
        <div />
        <button onClick={() => setShowAdd(true)} className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(265_55%_58%)] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[hsl(265_55%_52%)] transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Task
        </button>
      </div>

      {/* Add Task Panel */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5 micro-hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">New Task</h4>
                <button onClick={() => setShowAdd(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title *" className="col-span-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30">
                  {["General", "Errands", "Home Maintenance", "School", "Health", "Admin", "Events", "Shopping", "Vehicle"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30">
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })} placeholder="Assigned to" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Notes" rows={2} className="col-span-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => addTask.mutate({ title: newTask.title.trim(), category: newTask.category || "General", priority: newTask.priority, due_date: newTask.due_date || null, description: newTask.description || null, assigned_to: newTask.assigned_to || null, status: "todo" })} disabled={addTask.isPending || !newTask.title.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {addTask.isPending ? "Adding..." : "Add Task"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" variants={stagger} initial="hidden" animate="show">
        {[
          { label: "Total Open", value: String(openCount), icon: CheckSquare },
          { label: "Due Today", value: String(todayCount), icon: Clock },
          { label: "Overdue", value: String(overdueCount), icon: AlertTriangle, sub: overdueCount > 0 ? "Needs attention" : "All clear" },
          { label: "In Progress", value: String(inProgressCount), icon: Home },
          { label: "High Priority", value: String(highCount), icon: ArrowUpRight },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <KPITile label={kpi.label} value={kpi.value} icon={kpi.icon} sub={kpi.sub} />
          </motion.div>
        ))}
      </motion.div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Tasks", count: tasks.length },
          { key: "today", label: "Today", count: todayCount },
          { key: "this-week", label: "This Week" },
          { key: "overdue", label: "Overdue", count: overdueCount },
          { key: "by-person", label: "By Person" },
          { key: "high-priority", label: "High Priority", count: highCount },
        ]}
        active={filter}
        onChange={(k) => setFilter(k as ViewFilter)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
          ) : sorted.length === 0 ? (
            <EmptyState icon={CheckSquare} title="No tasks match this filter" description={tasks.length === 0 ? "Add your first household task to get started" : "Try a different filter"} />
          ) : (
            <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
              {sorted.map((t) => {
                const sc = statusConfig[t.status] || statusConfig.todo;
                const Icon = categoryIcon[t.category || "General"] || Home;
                const overdue = isOverdue(t.due_date) && t.status !== "done";
                return (
                  <motion.div key={t.id} variants={fadeUp} layout>
                    <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => updateStatus.mutate({ id: t.id, status: t.status === "done" ? "todo" : "done" })}
                          className={`h-5 w-5 mt-0.5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all cursor-pointer ${t.status === "done" ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary"}`}
                        >
                          {t.status === "done" && <Check className="h-3 w-3 text-primary-foreground" />}
                        </button>
                        <div className="rounded-xl bg-primary/8 p-2 shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                            {t.due_date && <span className={overdue ? "text-destructive font-medium" : ""}>{new Date(t.due_date).toLocaleDateString()}</span>}
                            <span className="rounded-md bg-secondary px-1.5 py-px text-[10px]">{t.category || "General"}</span>
                            {t.assigned_to && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />{t.assigned_to}
                              </span>
                            )}
                          </div>
                          {t.description && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{t.description}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${sc.class}`}>{sc.label}</span>
                          <TrustBadge level={t.priority === "high" ? "high-impact" : t.priority === "medium" ? "review" : "safe"} label={t.priority} size="sm" />
                          <div className="flex gap-1 mt-1">
                            {t.status !== "done" && t.status !== "in-progress" && (
                              <button onClick={() => updateStatus.mutate({ id: t.id, status: "in-progress" })} className="text-[10px] text-primary hover:underline">Start</button>
                            )}
                            <button onClick={() => deleteTask.mutate({ id: t.id })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
          {/* By Category Summary */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">By Category</h4>
            <div className="space-y-2">
              {["Errands", "Home Maintenance", "School", "Health", "Admin", "Events", "Shopping", "Vehicle", "General"].map((cat) => {
                const count = tasks.filter(t => (t.category || "General") === cat && t.status !== "done").length;
                if (count === 0) return null;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{cat}</span>
                    <span className="text-xs font-medium text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Task Advisor",
            message: overdueCount > 0
              ? `You have ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}. Focus on high-priority items first. ${highCount > 0 ? `${highCount} high-priority tasks need attention.` : ""}`
              : openCount > 0
              ? `${openCount} open tasks across your household. ${todayCount > 0 ? `${todayCount} due today.` : "Nothing urgent today."} Keep momentum going!`
              : "All tasks complete! Great job keeping your household organized.",
            linkedItems: tasks.filter(t => t.priority === "high" && t.status !== "done").slice(0, 3).map(t => t.title),
            confidence: "high",
          }} />
        </motion.div>
      </div>
    </ConciergePageWrapper>
  );
};

export default HouseholdTasks;
