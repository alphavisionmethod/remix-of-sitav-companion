import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Cloud, BarChart3, Brain, CalendarDays, GripVertical, Plus, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Widget Registry ──────────────────────────────────────────

interface WidgetDef {
  id: string;
  label: string;
  icon: React.ElementType;
  minW: number;
  component: React.FC;
}

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-3xl font-light text-foreground tabular-nums">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {time.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
      </p>
    </div>
  );
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState({ temp: "22°", cond: "Partly Cloudy", loc: "Auto-detected" });
  useEffect(() => {
    // Simulated — would use a real weather API
    const temps = ["18°", "22°", "25°", "28°", "15°"];
    const conds = ["Sunny", "Partly Cloudy", "Overcast", "Light Rain", "Clear"];
    const i = Math.floor(Math.random() * temps.length);
    setWeather({ temp: temps[i], cond: conds[i], loc: Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace("_", " ") || "Local" });
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <Cloud className="h-6 w-6 text-primary/60" />
      <p className="text-2xl font-light text-foreground">{weather.temp}</p>
      <p className="text-[11px] text-muted-foreground">{weather.cond}</p>
      <p className="text-[10px] text-muted-foreground/50">{weather.loc}</p>
    </div>
  );
};

const QuickStatsWidget = () => (
  <div className="flex flex-col justify-center h-full gap-2 px-1">
    {[
      { label: "Pipeline", value: "$48.2K", color: "text-primary" },
      { label: "Due Today", value: "3 tasks", color: "text-foreground" },
      { label: "Approvals", value: "2 pending", color: "text-[hsl(var(--sita-gold))]" },
    ].map((s) => (
      <div key={s.label} className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{s.label}</span>
        <span className={cn("text-xs font-semibold", s.color)}>{s.value}</span>
      </div>
    ))}
  </div>
);

const MiniChatWidget = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2">
    <Brain className="h-5 w-5 text-primary/60" />
    <p className="text-[11px] text-muted-foreground text-center">Ask SITA Brain from the copilot bar below</p>
  </div>
);

const CalendarWidget = () => {
  const today = new Date();
  const events = [
    { time: "10:00", label: "Team standup" },
    { time: "14:30", label: "Client review" },
    { time: "16:00", label: "Strategy call" },
  ];
  return (
    <div className="flex flex-col h-full gap-1.5">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {today.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </p>
      {events.map((e) => (
        <div key={e.time} className="flex items-center gap-2">
          <span className="text-[10px] text-primary font-mono w-10">{e.time}</span>
          <span className="text-[11px] text-foreground">{e.label}</span>
        </div>
      ))}
    </div>
  );
};

const WIDGET_REGISTRY: WidgetDef[] = [
  { id: "clock", label: "Clock", icon: Clock, minW: 1, component: ClockWidget },
  { id: "weather", label: "Weather", icon: Cloud, minW: 1, component: WeatherWidget },
  { id: "stats", label: "Quick Stats", icon: BarChart3, minW: 1, component: QuickStatsWidget },
  { id: "brain", label: "Brain", icon: Brain, minW: 1, component: MiniChatWidget },
  { id: "calendar", label: "Calendar", icon: CalendarDays, minW: 1, component: CalendarWidget },
];

const DEFAULT_LAYOUT = ["clock", "weather", "stats", "calendar"];

// ── Widget Grid Component ───────────────────────────────────

export const WidgetGrid = () => {
  const [layout, setLayout] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sita-widget-layout") || "null") || DEFAULT_LAYOUT; } catch { return DEFAULT_LAYOUT; }
  });
  const [editing, setEditing] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const persist = useCallback((l: string[]) => {
    setLayout(l);
    localStorage.setItem("sita-widget-layout", JSON.stringify(l));
  }, []);

  const removeWidget = (id: string) => persist(layout.filter((w) => w !== id));
  const addWidget = (id: string) => { if (!layout.includes(id)) persist([...layout, id]); };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...layout];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    persist(next);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const available = WIDGET_REGISTRY.filter((w) => !layout.includes(w.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Widgets</h3>
        <button onClick={() => setEditing(!editing)} className={cn("rounded-lg p-1.5 transition-colors", editing ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {layout.map((wid, idx) => {
          const def = WIDGET_REGISTRY.find((w) => w.id === wid);
          if (!def) return null;
          const W = def.component;
          return (
            <motion.div
              key={wid}
              layout
              draggable={editing}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e as unknown, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative rounded-2xl border bg-card p-4 min-h-[120px] transition-all",
                editing && "border-dashed border-primary/30 cursor-grab",
                dragIdx === idx && "opacity-50"
              )}
            >
              {editing && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                  <button onClick={() => removeWidget(wid)} className="p-0.5 rounded hover:bg-destructive/10 transition-colors">
                    <X className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              )}
              <W />
            </motion.div>
          );
        })}

        {/* Add widget button */}
        {editing && available.length > 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-4 min-h-[120px] flex flex-col items-center justify-center gap-2">
            <Plus className="h-5 w-5 text-muted-foreground/30" />
            <p className="text-[10px] text-muted-foreground">Add widget</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {available.map((w) => (
                <button key={w.id} onClick={() => addWidget(w.id)} className="text-[9px] rounded-full border border-border bg-card px-2 py-0.5 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
