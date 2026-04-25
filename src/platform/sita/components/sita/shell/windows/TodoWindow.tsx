import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Plus, Check, Trash2, Circle, CheckCircle2, ListTodo, Clock, AlertTriangle, Star } from "lucide-react";

type Priority = "low" | "medium" | "high" | "urgent";
type Category = "personal" | "work" | "urgent" | "errands";
type FilterTab = "all" | "active" | "completed";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: number;
  dueDate?: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-white/40",
  medium: "text-blue-400",
  high: "text-amber-400",
  urgent: "text-red-400",
};

const CATEGORY_BADGES: Record<Category, { label: string; color: string }> = {
  personal: { label: "Personal", color: "bg-violet-500/20 text-violet-300" },
  work: { label: "Work", color: "bg-blue-500/20 text-blue-300" },
  urgent: { label: "Urgent", color: "bg-red-500/20 text-red-300" },
  errands: { label: "Errands", color: "bg-emerald-500/20 text-emerald-300" },
};

const INITIAL_TODOS: TodoItem[] = [
  { id: "1", text: "Review quarterly financials", completed: false, priority: "high", category: "work", createdAt: Date.now() - 86400000 },
  { id: "2", text: "Schedule dentist appointment", completed: false, priority: "medium", category: "personal", createdAt: Date.now() - 172800000 },
  { id: "3", text: "Prepare board presentation", completed: false, priority: "urgent", category: "work", createdAt: Date.now() - 43200000 },
  { id: "4", text: "Pick up dry cleaning", completed: true, priority: "low", category: "errands", createdAt: Date.now() - 259200000 },
  { id: "5", text: "Update portfolio allocations", completed: false, priority: "high", category: "work", createdAt: Date.now() - 7200000 },
];

export function TodoWindow() {
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("work");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  const addTodo = useCallback(() => {
    if (!newText.trim()) return;
    setTodos(prev => [{
      id: crypto.randomUUID(),
      text: newText.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      createdAt: Date.now(),
    }, ...prev]);
    setNewText("");
  }, [newText, newCategory, newPriority]);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="flex flex-col h-full bg-[hsl(220,20%,6%)] text-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <ListTodo className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white/90">Tasks</h1>
            <p className="text-[11px] text-white/35">{activeCount} active · {completedCount} done</p>
          </div>
        </div>

        {/* Add task input */}
        <div className="flex gap-2 mb-3">
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="Add a task…"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/90 placeholder:text-white/25 outline-none focus:border-violet-500/40 transition"
          />
          <button
            onClick={addTodo}
            disabled={!newText.trim()}
            className="rounded-xl bg-violet-500/80 hover:bg-violet-500 disabled:opacity-30 px-3 py-2.5 transition"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Category + Priority selectors */}
        <div className="flex gap-2 mb-3">
          <div className="flex gap-1 flex-1">
            {(Object.keys(CATEGORY_BADGES) as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-medium transition",
                  newCategory === cat ? CATEGORY_BADGES[cat].color : "text-white/25 hover:text-white/50"
                )}
              >
                {CATEGORY_BADGES[cat].label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["low", "medium", "high", "urgent"] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center transition",
                  newPriority === p ? "bg-white/[0.1] ring-1 ring-white/20" : "hover:bg-white/[0.05]"
                )}
                title={p}
              >
                {p === "urgent" ? <AlertTriangle className={cn("h-3 w-3", PRIORITY_COLORS[p])} /> :
                 p === "high" ? <Star className={cn("h-3 w-3", PRIORITY_COLORS[p])} /> :
                 <Circle className={cn("h-3 w-3", PRIORITY_COLORS[p])} />}
              </button>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1">
          {(["all", "active", "completed"] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-medium transition capitalize",
                filter === tab ? "bg-white/[0.1] text-white/90" : "text-white/35 hover:text-white/60"
              )}
            >
              {tab}
              {tab === "active" && activeCount > 0 && (
                <span className="ml-1 text-[10px] text-violet-400">{activeCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/20">
            <CheckCircle2 className="h-12 w-12 mb-3 text-white/10" />
            <p className="text-sm font-medium">
              {filter === "completed" ? "No completed tasks" : filter === "active" ? "All caught up!" : "No tasks yet"}
            </p>
            <p className="text-xs mt-1 text-white/15">
              {filter === "all" ? "Add your first task above" : ""}
            </p>
          </div>
        ) : (
          filtered.map(todo => (
            <div
              key={todo.id}
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition hover:bg-white/[0.04]",
                todo.completed && "opacity-50"
              )}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="mt-0.5 shrink-0 transition"
              >
                {todo.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Circle className={cn("h-5 w-5", PRIORITY_COLORS[todo.priority])} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm text-white/80", todo.completed && "line-through text-white/40")}>
                  {todo.text}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md", CATEGORY_BADGES[todo.category].color)}>
                    {CATEGORY_BADGES[todo.category].label}
                  </span>
                  <span className="text-[10px] text-white/20 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(todo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400/60 hover:text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
