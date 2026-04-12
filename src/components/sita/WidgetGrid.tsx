import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Cloud, BarChart3, Brain, CalendarDays, GripVertical, Plus, X, Settings, Droplets, Wind, Sun, Maximize2, Minimize2, Bell, AlertTriangle, Shield, Zap, DollarSign, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";


// ── Types ────────────────────────────────────────────────────

type WidgetSize = "small" | "medium" | "large";

interface WidgetDef {
  id: string;
  label: string;
  icon: React.ElementType;
  minW: number;
  component: React.FC<{ size: WidgetSize }>;
}

interface WidgetState {
  id: string;
  size: WidgetSize;
}

// ── Weather Types & Hook ─────────────────────────────────────

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  condition: string;
  icon: string;
  unit: string;
  hourly: { time: string; temp: number; icon: string }[];
  fetchedAt: string;
}

function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather(lat: number, lon: number) {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-weather?lat=${lat}&lon=${lon}`;
        const res = await fetch(url, {
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch weather");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Try geolocation, fallback to NYC
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(40.7128, -74.006),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(40.7128, -74.006);
    }

    // Refresh every 10 minutes
    const iv = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
          () => fetchWeather(40.7128, -74.006),
          { timeout: 5000 }
        );
      }
    }, 600_000);

    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  return { data, loading, error };
}

// ── Widgets ──────────────────────────────────────────────────

const ClockWidget: React.FC<{ size: WidgetSize }> = ({ size }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className={cn("font-light text-foreground tabular-nums", size === "large" ? "text-5xl" : size === "medium" ? "text-4xl" : "text-3xl")}>
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className={cn("text-muted-foreground mt-1", size === "large" ? "text-sm" : "text-xs")}>
        {time.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
      </p>
      {size !== "small" && (
        <p className="text-[10px] text-muted-foreground/50 mt-0.5">
          {time.toLocaleTimeString([], { second: "2-digit" }).split(":").pop()}s
        </p>
      )}
    </div>
  );
};

const WeatherWidget: React.FC<{ size: WidgetSize }> = ({ size }) => {
  const { data, loading, error } = useWeather();
  const loc = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace("_", " ") || "Local";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <Cloud className="h-6 w-6 text-primary/40 animate-pulse" />
        <p className="text-[11px] text-muted-foreground">Loading weather…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <Cloud className="h-6 w-6 text-destructive/60" />
        <p className="text-[11px] text-muted-foreground">Weather unavailable</p>
        <p className="text-[9px] text-muted-foreground/50">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-1">
      {/* Main temp + condition */}
      <div className="flex items-center justify-center gap-2 flex-1 min-h-0">
        <span className={cn(size === "large" ? "text-4xl" : size === "medium" ? "text-3xl" : "text-2xl")}>{data.icon}</span>
        <div className="flex flex-col items-start">
          <p className={cn("font-light text-foreground leading-none", size === "large" ? "text-4xl" : size === "medium" ? "text-3xl" : "text-2xl")}>
            {data.temp}{data.unit}
          </p>
          <p className={cn("text-muted-foreground", size === "large" ? "text-xs" : "text-[11px]")}>{data.condition}</p>
        </div>
      </div>

      {/* Detail row — medium & large */}
      {size !== "small" && (
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Droplets size={10} />{data.humidity}%</span>
          <span className="flex items-center gap-0.5"><Wind size={10} />{data.windSpeed} km/h</span>
          <span className="flex items-center gap-0.5"><Sun size={10} />UV {data.uvIndex}</span>
          <span>Feels {data.feelsLike}{data.unit}</span>
        </div>
      )}

      {/* Hourly forecast — large only */}
      {size === "large" && data.hourly.length > 0 && (
        <div className="flex gap-1 overflow-x-auto py-1 mt-1 border-t border-border/20">
          {data.hourly.slice(0, 8).map((h, i) => (
            <div key={i} className="flex flex-col items-center min-w-[36px] gap-0.5">
              <span className="text-[9px] text-muted-foreground font-mono">
                {new Date(h.time).getHours().toString().padStart(2, "0")}:00
              </span>
              <span className="text-sm">{h.icon}</span>
              <span className="text-[10px] text-foreground font-medium">{Math.round(h.temp)}°</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] text-muted-foreground/40 text-center">{loc}</p>
    </div>
  );
};

const QuickStatsWidget: React.FC<{ size: WidgetSize }> = ({ size }) => {
  const stats = [
    { label: "Pipeline", value: "$48.2K", color: "text-primary" },
    { label: "Due Today", value: "3 tasks", color: "text-foreground" },
    { label: "Approvals", value: "2 pending", color: "text-[hsl(var(--sita-gold))]" },
  ];
  const extra = [
    { label: "Revenue MTD", value: "$124K", color: "text-primary" },
    { label: "Open Invoices", value: "7", color: "text-foreground" },
  ];
  const items = size === "large" ? [...stats, ...extra] : stats;

  return (
    <div className="flex flex-col justify-center h-full gap-2 px-1">
      {items.map((s) => (
        <div key={s.label} className="flex items-center justify-between">
          <span className={cn("text-muted-foreground", size === "large" ? "text-xs" : "text-[11px]")}>{s.label}</span>
          <span className={cn("font-semibold", s.color, size === "large" ? "text-sm" : "text-xs")}>{s.value}</span>
        </div>
      ))}
    </div>
  );
};

const MiniChatWidget: React.FC<{ size: WidgetSize }> = ({ size }) => (
  <div className="flex flex-col items-center justify-center h-full gap-2">
    <Brain className={cn("text-primary/60", size === "large" ? "h-8 w-8" : "h-5 w-5")} />
    <p className={cn("text-muted-foreground text-center", size === "large" ? "text-xs" : "text-[11px]")}>
      Ask SITA Brain from the copilot bar below
    </p>
  </div>
);

const CalendarWidget: React.FC<{ size: WidgetSize }> = ({ size }) => {
  const today = new Date();
  const events = [
    { time: "10:00", label: "Team standup" },
    { time: "14:30", label: "Client review" },
    { time: "16:00", label: "Strategy call" },
    { time: "18:00", label: "Wrap-up sync" },
  ];
  const shown = size === "large" ? events : events.slice(0, 3);
  return (
    <div className="flex flex-col h-full gap-1.5">
      <p className={cn("font-semibold text-muted-foreground uppercase tracking-wider", size === "large" ? "text-xs" : "text-[10px]")}>
        {today.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </p>
      {shown.map((e) => (
        <div key={e.time} className="flex items-center gap-2">
          <span className={cn("text-primary font-mono", size === "large" ? "text-xs w-12" : "text-[10px] w-10")}>{e.time}</span>
          <span className={cn("text-foreground", size === "large" ? "text-xs" : "text-[11px]")}>{e.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── System Notifications Widget ─────────────────────────────

const SystemNotificationsWidget: React.FC<{ size: WidgetSize }> = ({ size }) => {
  const [alerts] = useState(() => [
    { id: 1, icon: "🔴", title: "High memory usage", detail: "87% — 3 processes consuming 4.2 GB", time: "2m ago", urgency: "critical" as const },
    { id: 2, icon: "🟠", title: "Kernel watchdog triggered", detail: "Service 'compositor' heartbeat delayed 120ms", time: "8m ago", urgency: "high" as const },
    { id: 3, icon: "🔵", title: "Scheduler rebalanced", detail: "MLFQ anti-starvation boost applied to 4 processes", time: "15m ago", urgency: "medium" as const },
    { id: 4, icon: "✅", title: "Filesystem integrity OK", detail: "Journal replay completed — 0 errors", time: "1h ago", urgency: "low" as const },
    { id: 5, icon: "🛡️", title: "Security ring audit passed", detail: "All syscalls within rate limits", time: "2h ago", urgency: "low" as const },
  ]);

  const urgencyColor = {
    critical: "bg-destructive/15 border-destructive/30 text-destructive",
    high: "bg-[hsl(35_80%_50%/0.12)] border-[hsl(35_80%_50%/0.25)] text-[hsl(35_80%_55%)]",
    medium: "bg-primary/10 border-primary/20 text-primary",
    low: "bg-[hsl(142_60%_45%/0.10)] border-[hsl(142_60%_45%/0.20)] text-[hsl(142_60%_50%)]",
  };

  const shown = size === "large" ? alerts : size === "medium" ? alerts.slice(0, 4) : alerts.slice(0, 3);
  const criticalCount = alerts.filter(a => a.urgency === "critical" || a.urgency === "high").length;

  return (
    <div className="flex flex-col h-full gap-1.5 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell className={cn("text-primary", size === "large" ? "h-4 w-4" : "h-3.5 w-3.5")} />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System Alerts</p>
        </div>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[9px] font-bold text-destructive">
            <AlertTriangle className="h-2.5 w-2.5" />{criticalCount}
          </span>
        )}
      </div>
      <div className="space-y-1 flex-1 overflow-y-auto">
        {shown.map(alert => (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-2 py-1.5 transition-colors",
              urgencyColor[alert.urgency]
            )}
          >
            <span className="text-[10px] mt-0.5 shrink-0">{alert.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium truncate", size === "large" ? "text-[11px]" : "text-[10px]")}>{alert.title}</p>
              {size !== "small" && (
                <p className="text-[9px] text-muted-foreground truncate">{alert.detail}</p>
              )}
            </div>
            <span className="text-[8px] text-muted-foreground shrink-0 mt-0.5">{alert.time}</span>
          </div>
        ))}
      </div>
      {size === "large" && (
        <div className="flex items-center gap-3 pt-1 border-t border-border/30">
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>All rings secure</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>CPU governor: performance</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Finance Pulse Widget ────────────────────────────────────

const FinancePulseWidget: React.FC<{ size: WidgetSize }> = ({ size }) => {
  const billsDue = [
    { id: 1, name: "Electric Bill", amount: 142, due: "Today", status: "due" as const },
    { id: 2, name: "Internet", amount: 89, due: "Today", status: "due" as const },
    { id: 3, name: "Insurance", amount: 320, due: "Tomorrow", status: "upcoming" as const },
    { id: 4, name: "Phone Plan", amount: 65, due: "In 3 days", status: "upcoming" as const },
  ];
  const totalDueToday = billsDue.filter(b => b.due === "Today").reduce((s, b) => s + b.amount, 0);
  const cashIn = 4200;
  const cashOut = 2930;
  const netFlow = cashIn - cashOut;

  const shown = size === "large" ? billsDue : size === "medium" ? billsDue.slice(0, 3) : billsDue.slice(0, 2);

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <DollarSign className={cn("text-[hsl(var(--sita-gold))]", size === "large" ? "h-4 w-4" : "h-3.5 w-3.5")} />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Finance Pulse</p>
        </div>
        <span className={cn(
          "text-[10px] font-bold rounded-full px-2 py-0.5",
          netFlow >= 0 ? "bg-[hsl(142_60%_45%/0.12)] text-[hsl(142_60%_50%)]" : "bg-destructive/12 text-destructive"
        )}>
          {netFlow >= 0 ? "+" : ""}{netFlow.toLocaleString()} net
        </span>
      </div>

      {/* Cash flow mini-bar */}
      {size !== "small" && (
        <div className="flex gap-2 text-[10px]">
          <div className="flex items-center gap-1 text-[hsl(142_60%_50%)]">
            <ArrowUpRight className="h-3 w-3" />${cashIn.toLocaleString()} in
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <ArrowDownRight className="h-3 w-3" />${cashOut.toLocaleString()} out
          </div>
        </div>
      )}

      {/* Bills list */}
      <div className="space-y-1 flex-1 overflow-y-auto">
        {shown.map(bill => (
          <div key={bill.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-2.5 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <CreditCard className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className={cn("font-medium truncate", size === "large" ? "text-[11px]" : "text-[10px]")}>{bill.name}</p>
                <p className="text-[8px] text-muted-foreground">{bill.due}</p>
              </div>
            </div>
            <span className={cn(
              "text-[11px] font-semibold shrink-0",
              bill.status === "due" ? "text-[hsl(var(--sita-gold))]" : "text-muted-foreground"
            )}>
              ${bill.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[9px]">
        <span className="text-muted-foreground">Due today: <strong className="text-foreground">${totalDueToday}</strong></span>
        {size === "large" && (
          <span className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-3 w-3" />Spending on track
          </span>
        )}
      </div>
    </div>
  );
};

const ActivityFeedWidget: React.FC<{ size: WidgetSize }> = ({ size }) => {
  const items = [
    { action: "Invoice #1042 sent", domain: "business", time: "2m ago", icon: "💼" },
    { action: "Bill payment scheduled", domain: "finance", time: "15m ago", icon: "💰" },
    { action: "Grocery delivery confirmed", domain: "concierge", time: "1h ago", icon: "🎯" },
    { action: "Lead qualified: Acme Corp", domain: "business", time: "2h ago", icon: "📊" },
    { action: "Subscription cancelled", domain: "finance", time: "3h ago", icon: "✂️" },
  ];
  const domainColors: Record<string, string> = {
    business: "bg-primary/10 text-primary",
    finance: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
    concierge: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  };
  const shown = size === "large" ? items : items.slice(0, 4);
  return (
    <div className="flex flex-col h-full gap-1.5 overflow-hidden">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Activity</p>
      {shown.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-[10px]">{item.icon}</span>
          <span className={cn("text-foreground truncate flex-1", size === "large" ? "text-[11px]" : "text-[10px]")}>{item.action}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-semibold", domainColors[item.domain] || "bg-secondary text-muted-foreground")}>
            {item.domain}
          </span>
          <span className="text-[8px] text-muted-foreground shrink-0">{item.time}</span>
        </div>
      ))}
    </div>
  );
};

// ── Registry ─────────────────────────────────────────────────

const WIDGET_REGISTRY: WidgetDef[] = [
  { id: "clock", label: "Clock", icon: Clock, minW: 1, component: ClockWidget },
  { id: "weather", label: "Weather", icon: Cloud, minW: 1, component: WeatherWidget },
  { id: "stats", label: "Quick Stats", icon: BarChart3, minW: 1, component: QuickStatsWidget },
  { id: "brain", label: "Brain", icon: Brain, minW: 1, component: MiniChatWidget },
  { id: "calendar", label: "Calendar", icon: CalendarDays, minW: 1, component: CalendarWidget },
  { id: "activity", label: "Activity Feed", icon: BarChart3, minW: 1, component: ActivityFeedWidget },
  { id: "notifications", label: "System Alerts", icon: Bell, minW: 1, component: SystemNotificationsWidget },
  { id: "finance", label: "Finance Pulse", icon: DollarSign, minW: 1, component: FinancePulseWidget },
];

const DEFAULT_LAYOUT: WidgetState[] = [
  { id: "clock", size: "small" },
  { id: "weather", size: "medium" },
  { id: "notifications", size: "medium" },
  { id: "finance", size: "medium" },
  { id: "calendar", size: "small" },
];

const SIZE_CLASSES: Record<WidgetSize, { grid: string; minH: string }> = {
  small:  { grid: "col-span-1", minH: "min-h-[120px]" },
  medium: { grid: "col-span-1 sm:col-span-2", minH: "min-h-[140px]" },
  large:  { grid: "col-span-1 sm:col-span-2 lg:col-span-3", minH: "min-h-[180px]" },
};

const SIZE_OPTIONS: WidgetSize[] = ["small", "medium", "large"];
const SIZE_ICONS: Record<WidgetSize, string> = { small: "S", medium: "M", large: "L" };

// ── Widget Grid Component ───────────────────────────────────

export const WidgetGrid = () => {
  const [layout, setLayout] = useState<WidgetState[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("sita-widget-layout-v2") || "null");
      if (Array.isArray(stored) && stored.length > 0 && typeof stored[0] === "object" && "size" in stored[0]) return stored;
      // Migrate from v1 (string[])
      const v1 = JSON.parse(localStorage.getItem("sita-widget-layout") || "null");
      if (Array.isArray(v1) && typeof v1[0] === "string") return v1.map((id: string) => ({ id, size: "small" as WidgetSize }));
      return DEFAULT_LAYOUT;
    } catch { return DEFAULT_LAYOUT; }
  });
  const [editing, setEditing] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const persist = useCallback((l: WidgetState[]) => {
    setLayout(l);
    localStorage.setItem("sita-widget-layout-v2", JSON.stringify(l));
  }, []);

  const removeWidget = (id: string) => persist(layout.filter((w) => w.id !== id));
  const addWidget = (id: string) => { if (!layout.find(w => w.id === id)) persist([...layout, { id, size: "small" }]); };
  const cycleSize = (id: string) => {
    persist(layout.map(w => {
      if (w.id !== id) return w;
      const idx = SIZE_OPTIONS.indexOf(w.size);
      return { ...w, size: SIZE_OPTIONS[(idx + 1) % SIZE_OPTIONS.length] };
    }));
  };

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

  const available = WIDGET_REGISTRY.filter((w) => !layout.find(l => l.id === w.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Widgets</h3>
        <button onClick={() => setEditing(!editing)} className={cn("rounded-lg p-1.5 transition-colors", editing ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {layout.map((ws, idx) => {
          const def = WIDGET_REGISTRY.find((w) => w.id === ws.id);
          if (!def) return null;
          const W = def.component;
          const sc = SIZE_CLASSES[ws.size];
          return (
            <motion.div
              key={ws.id}
              layout
              draggable={editing}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e as React.DragEvent, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative rounded-2xl border bg-card p-4 transition-all",
                sc.grid, sc.minH,
                editing && "border-dashed border-primary/30 cursor-grab",
                dragIdx === idx && "opacity-50"
              )}
            >
              {editing && (
                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                  {/* Size toggle */}
                  <button
                    onClick={() => cycleSize(ws.id)}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    title={`Size: ${ws.size} — click to cycle`}
                  >
                    {SIZE_OPTIONS.map(s => (
                      <span
                        key={s}
                        className={cn(
                          "text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-sm transition-colors",
                          ws.size === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        )}
                      >
                        {SIZE_ICONS[s]}
                      </span>
                    ))}
                  </button>
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                  <button onClick={() => removeWidget(ws.id)} className="p-0.5 rounded hover:bg-destructive/10 transition-colors">
                    <X className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              )}
              <W size={ws.size} />
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
