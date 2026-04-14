import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRMTasks, useCRMContacts, useCreateTask, useUpdateTask } from "@/hooks/use-crm-data";
import { CheckCircle2, Circle, Clock, Plus, AlertTriangle, Calendar } from "lucide-react";
import { format, isPast, formatDistanceToNow } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const CRMTasks = () => {
  const { data: tasks = [] } = useCRMTasks();
  const { data: contacts = [] } = useCRMContacts();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("pending");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", due_date: "", task_type: "follow-up" });

  const contactMap = useMemo(() => {
    const m: Record<string, string> = {};
    contacts.forEach(c => { m[c.id] = `${c.first_name} ${c.last_name}`; });
    return m;
  }, [contacts]);

  const filtered = useMemo(() => {
    if (filter === "overdue") return tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
    if (filter === "completed") return tasks.filter(t => t.status === "completed");
    if (filter === "pending") return tasks.filter(t => t.status !== "completed");
    return tasks;
  }, [tasks, filter]);

  const overdue = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));

  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    try {
      await createTask.mutateAsync({ ...form, due_date: form.due_date || null } as any);
      toast.success("Task created");
      setShowAdd(false);
      setForm({ title: "", description: "", priority: "medium", due_date: "", task_type: "follow-up" });
    } catch { toast.error("Failed to create task"); }
  };

  const toggleComplete = async (t: typeof tasks[0]) => {
    try {
      await updateTask.mutateAsync({
        id: t.id,
        updates: { status: t.status === "completed" ? "pending" : "completed", completed_at: t.status === "completed" ? null : new Date().toISOString() } as any,
      });
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tasks & Follow-Through</h2>
          <p className="text-xs text-muted-foreground">
            {tasks.filter(t => t.status !== "completed").length} pending
            {overdue.length > 0 && <span className="text-red-400"> · {overdue.length} overdue</span>}
          </p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Task title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={createTask.isPending}>
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-1.5">
        {(["pending", "overdue", "completed", "all"] as const).map(f => (
          <Button key={f} variant={filter === f ? "secondary" : "ghost"} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(f)}>
            {f}{f === "overdue" && overdue.length > 0 ? ` (${overdue.length})` : ""}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5">
        {filtered.map(t => {
          const isOverdue = t.status !== "completed" && t.due_date && isPast(new Date(t.due_date));
          return (
            <Card key={t.id} className="border-border/40 bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <button onClick={() => toggleComplete(t)} className="shrink-0">
                  {t.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {t.contact_id && contactMap[t.contact_id] && <span className="text-primary">{contactMap[t.contact_id]}</span>}
                    <span className={`px-1.5 py-0.5 rounded ${t.priority === "high" ? "bg-red-500/10 text-red-400" : t.priority === "medium" ? "bg-yellow-500/10 text-yellow-400" : "bg-muted text-muted-foreground"}`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
                {t.due_date && (
                  <span className={`text-xs shrink-0 flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>
                    {isOverdue && <AlertTriangle className="h-3 w-3" />}
                    <Calendar className="h-3 w-3" />
                    {format(new Date(t.due_date), "MMM d")}
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{filter === "completed" ? "No completed tasks" : "No pending tasks"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMTasks;
