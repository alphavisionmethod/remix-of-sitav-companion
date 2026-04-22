import React, { useState, useRef, useCallback, useEffect } from "react";
import { Star, Plus, TrendingUp, Pencil, X, Check, Eye, EyeOff, GripVertical } from "lucide-react";
import { CONCIERGE_DATA, BUSINESS_DATA } from "./demo-data";

// ────────── types ──────────
interface TaskItem { title: string; priority: string; done: boolean; visible: boolean }
interface KpiItem { label: string; value: string; trend: string; up: boolean; visible: boolean }
interface WidgetPos { id: string; x: number; y: number }

const WIDGET_IDS = ["today", "quickstats"] as const;
type WidgetId = (typeof WIDGET_IDS)[number];

const DEFAULT_POSITIONS: WidgetPos[] = [
  { id: "today", x: 24, y: 40 },
  { id: "quickstats", x: 24, y: 340 },
];

function loadPositions(): WidgetPos[] {
  try {
    const raw = localStorage.getItem("sita:demo-widget-positions");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_POSITIONS.map(p => ({ ...p }));
}
function savePositions(p: WidgetPos[]) {
  localStorage.setItem("sita:demo-widget-positions", JSON.stringify(p));
}

// ────────── draggable wrapper ──────────
function DraggableWidget({ pos, onMove, children, editMode }: {
  pos: WidgetPos; onMove: (id: string, x: number, y: number) => void; children: React.ReactNode; editMode: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!editMode) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editMode, pos.x, pos.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    onMove(pos.id, Math.max(0, e.clientX - offset.current.x), Math.max(0, e.clientY - offset.current.y));
  }, [onMove, pos.id]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  return (
    <div
      ref={ref}
      className="absolute"
      style={{ left: pos.x, top: pos.y, cursor: editMode ? "grab" : "default", zIndex: 10 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {editMode && (
        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center z-20">
          <GripVertical size={10} className="text-white/60" />
        </div>
      )}
      {children}
    </div>
  );
}

// ────────── Today widget ──────────
function TodayWidget() {
  const [tasks, setTasks] = useState<TaskItem[]>(
    CONCIERGE_DATA.tasks.map(t => ({ ...t, visible: true }))
  );
  const [editMode, setEditMode] = useState(false);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const priorityColor: Record<string, string> = {
    high: "bg-red-500/80 text-white",
    medium: "bg-amber-500/80 text-white",
    low: "bg-blue-400/80 text-white",
  };

  return (
    <div className="rounded-2xl p-4 w-64"
      style={{
        background: "rgba(20,20,30,0.65)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-amber-400" fill="currentColor" />
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Today</span>
        </div>
        <button
          onClick={() => setEditMode(e => !e)}
          className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          title={editMode ? "Done editing" : "Edit tasks"}
        >
          {editMode ? <Check size={10} className="text-emerald-400" /> : <Pencil size={10} className="text-white/70" />}
        </button>
      </div>
      <p className="text-[10px] text-white/40 mb-3">{dateStr}</p>
      <div className="space-y-2">
        {tasks.map((task, i) => {
          if (!task.visible && !editMode) return null;
          return (
          <div key={i} className="flex items-start gap-2 group" style={!task.visible ? { opacity: 0.35 } : undefined}>
            {editMode && (
              <button
                onClick={() => setTasks(prev => prev.map((t, j) => j === i ? { ...t, visible: !t.visible } : t))}
                className="mt-0.5 flex-shrink-0"
                title={task.visible ? "Hide task" : "Show task"}
              >
                {task.visible ? <Eye size={12} className="text-white/40" /> : <EyeOff size={12} className="text-white/25" />}
              </button>
            )}
            <button
              onClick={() => setTasks(prev => prev.map((t, j) => j === i ? { ...t, done: !t.done } : t))}
              className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                task.done ? "bg-green-500/80 border-green-400/60" : "border-white/30 hover:border-white/50"
              }`}
            >
              {task.done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-xs leading-snug ${task.done ? "text-white/30 line-through" : "text-white/80"}`}>
                {task.title}
              </p>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityColor[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke="rgba(52,211,153,0.8)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function QuickStatsWidget() {
  const [kpis, setKpis] = useState<KpiItem[]>(
    BUSINESS_DATA.kpis.map(k => ({ ...k, visible: true }))
  );
  const [editMode, setEditMode] = useState(false);
  const visibleKpis = editMode ? kpis : kpis.filter(k => k.visible);

  return (
    <div className="rounded-2xl p-4 w-64"
      style={{
        background: "rgba(20,20,30,0.65)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Quick Stats</span>
        </div>
        <button
          onClick={() => setEditMode(e => !e)}
          className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          title={editMode ? "Done editing" : "Edit KPIs"}
        >
          {editMode ? <Check size={10} className="text-emerald-400" /> : <Pencil size={10} className="text-white/70" />}
        </button>
      </div>
      <div className="space-y-3">
        {visibleKpis.map((kpi, i) => (
          <div key={kpi.label} className="flex items-center justify-between" style={!kpi.visible ? { opacity: 0.35 } : undefined}>
            {editMode && (
              <button
                onClick={() => setKpis(prev => prev.map(k => k.label === kpi.label ? { ...k, visible: !k.visible } : k))}
                className="mr-2 flex-shrink-0"
                title={kpi.visible ? "Hide KPI" : "Show KPI"}
              >
                {kpi.visible ? <Eye size={12} className="text-white/40" /> : <EyeOff size={12} className="text-white/25" />}
              </button>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/40">{kpi.label}</p>
              <p className="text-sm font-semibold text-white/90">{kpi.value}</p>
            </div>
            <span className={`text-[10px] ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>{kpi.trend}</span>
          </div>
        ))}
        <MiniSparkline data={BUSINESS_DATA.chartData} />
      </div>
    </div>
  );
}

export function DemoDesktopWidgets({ containerScale = 1 }: { containerScale?: number }) {
  const [positions, setPositions] = useState<WidgetPos[]>(loadPositions);
  const [editMode, setEditMode] = useState(false);

  const moveWidget = useCallback((id: string, x: number, y: number) => {
    setPositions(prev => {
      const next = prev.map(p => p.id === id ? { ...p, x, y } : p);
      savePositions(next);
      return next;
    });
  }, []);

  const resetPositions = useCallback(() => {
    const def = DEFAULT_POSITIONS.map(p => ({ ...p }));
    setPositions(def);
    savePositions(def);
  }, []);

  const todayPos = positions.find(p => p.id === "today") ?? DEFAULT_POSITIONS[0];
  const statsPos = positions.find(p => p.id === "quickstats") ?? DEFAULT_POSITIONS[1];

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Edit mode toggle */}
      <button
        onClick={() => setEditMode(e => !e)}
        className="absolute top-2 left-2 z-30 pointer-events-auto w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        title={editMode ? "Lock widgets" : "Arrange widgets"}
      >
        {editMode ? <Check size={12} className="text-emerald-400" /> : <GripVertical size={12} className="text-white/40" />}
      </button>
      {editMode && (
        <button
          onClick={resetPositions}
          className="absolute top-2 left-10 z-30 pointer-events-auto px-2 h-6 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-[10px] text-white/60"
        >
          Reset
        </button>
      )}

      <div className="pointer-events-auto">
        <DraggableWidget pos={todayPos} onMove={moveWidget} editMode={editMode}>
          <TodayWidget />
        </DraggableWidget>
        <DraggableWidget pos={statsPos} onMove={moveWidget} editMode={editMode}>
          <QuickStatsWidget />
        </DraggableWidget>
      </div>
    </div>
  );
}