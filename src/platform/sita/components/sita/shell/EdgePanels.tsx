// ═══════════════════════════════════════════════════════════════
// NovaOS — Slide-from-Edge Modular Panels
// Weather, Quick Notes, System Monitor — pull from screen edges
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Cloud, Sun, CloudRain, Thermometer, Wind,
  StickyNote, Plus, Trash2,
  Cpu, MemoryStick, HardDrive, Activity,
  X, GripVertical,
} from "lucide-react";
import { ProcessTable } from "@/platform/nova-sdk/kernel/process-manager";
import { MemoryManager } from "@/platform/nova-sdk/kernel/memory-manager";
import { Compositor } from "@/platform/nova-sdk/kernel/compositor";
import { Scheduler } from "@/platform/nova-sdk/kernel/scheduler";

// ── Types ────────────────────────────────────────────────────

type PanelId = "weather" | "quicknotes" | "sysmonitor";
type EdgeSide = "left" | "right";

interface EdgePanelDef {
  id: PanelId;
  label: string;
  edge: EdgeSide;
  icon: typeof Cloud;
  width: number;
}

const PANELS: EdgePanelDef[] = [
  { id: "weather", label: "Weather", edge: "right", icon: Cloud, width: 280 },
  { id: "quicknotes", label: "Quick Notes", edge: "left", icon: StickyNote, width: 300 },
  { id: "sysmonitor", label: "System Monitor", edge: "right", icon: Activity, width: 320 },
];

const EDGE_TRIGGER = 8; // px from edge to show tab

// ── Weather Panel ────────────────────────────────────────────

function WeatherPanel() {
  const [temp] = useState(() => Math.round(18 + Math.random() * 12));
  const [humidity] = useState(() => Math.round(40 + Math.random() * 40));
  const [windSpeed] = useState(() => Math.round(5 + Math.random() * 20));
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;
  const condition = temp > 25 ? "Sunny" : temp > 18 ? "Partly Cloudy" : "Overcast";
  const WeatherIcon = temp > 25 ? Sun : temp > 18 ? Cloud : CloudRain;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Current conditions */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: isDay
              ? "linear-gradient(135deg, hsl(45 90% 55%), hsl(30 85% 50%))"
              : "linear-gradient(135deg, hsl(230 40% 30%), hsl(260 30% 20%))",
          }}
        >
          <WeatherIcon className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-3xl font-light text-[hsl(0_0%_95%)]">{temp}°</div>
          <div className="text-xs text-[hsl(0_0%_100%/0.5)]">{condition}</div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Thermometer, label: "Feels like", value: `${temp + 2}°` },
          { icon: Wind, label: "Wind", value: `${windSpeed} km/h` },
          { icon: CloudRain, label: "Humidity", value: `${humidity}%` },
          { icon: Sun, label: "UV Index", value: temp > 25 ? "High" : "Low" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 flex flex-col gap-1"
            style={{
              background: "hsl(0 0% 100% / 0.04)",
              border: "1px solid hsl(0 0% 100% / 0.06)",
            }}
          >
            <item.icon className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.3)]" />
            <span className="text-[10px] text-[hsl(0_0%_100%/0.4)]">{item.label}</span>
            <span className="text-sm font-medium text-[hsl(0_0%_100%/0.9)]">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Hourly forecast */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_100%/0.3)] mb-2 block">
          Next hours
        </span>
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 5 }, (_, i) => {
            const h = (hour + i + 1) % 24;
            const t = temp + Math.round((Math.random() - 0.5) * 4);
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg shrink-0"
                style={{ background: "hsl(0 0% 100% / 0.03)" }}
              >
                <span className="text-[10px] text-[hsl(0_0%_100%/0.4)]">{h}:00</span>
                <Cloud className="w-3 h-3 text-[hsl(0_0%_100%/0.3)]" />
                <span className="text-xs text-[hsl(0_0%_100%/0.8)]">{t}°</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Quick Notes Panel ────────────────────────────────────────

function QuickNotesPanel() {
  const [notes, setNotes] = useState<{ id: string; text: string; time: number }[]>(() => {
    try {
      const saved = localStorage.getItem("nova-edge-quicknotes");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [draft, setDraft] = useState("");

  const save = useCallback((updated: typeof notes) => {
    setNotes(updated);
    localStorage.setItem("nova-edge-quicknotes", JSON.stringify(updated));
  }, []);

  const addNote = useCallback(() => {
    if (!draft.trim()) return;
    save([{ id: crypto.randomUUID(), text: draft.trim(), time: Date.now() }, ...notes]);
    setDraft("");
  }, [draft, notes, save]);

  const removeNote = useCallback((id: string) => {
    save(notes.filter(n => n.id !== id));
  }, [notes, save]);

  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      {/* Input */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNote()}
          placeholder="Quick note..."
          className="flex-1 bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] rounded-lg px-3 py-2 text-xs text-[hsl(0_0%_100%/0.9)] placeholder:text-[hsl(0_0%_100%/0.3)] outline-none focus:border-[hsl(210_80%_60%/0.4)]"
        />
        <button
          onClick={addNote}
          className="w-8 h-8 rounded-lg bg-[hsl(210_80%_60%/0.2)] hover:bg-[hsl(210_80%_60%/0.3)] flex items-center justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[hsl(210_80%_60%)]" />
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
            <StickyNote className="w-8 h-8" />
            <span className="text-xs">No quick notes yet</span>
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="group flex items-start gap-2 rounded-lg p-2.5 transition-colors hover:bg-[hsl(0_0%_100%/0.04)]"
            style={{ border: "1px solid hsl(0 0% 100% / 0.04)" }}
          >
            <GripVertical className="w-3 h-3 text-[hsl(0_0%_100%/0.15)] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(0_0%_100%/0.8)] break-words">{note.text}</p>
              <span className="text-[9px] text-[hsl(0_0%_100%/0.25)]">
                {new Date(note.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <button
              onClick={() => removeNote(note.id)}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center hover:bg-[hsl(0_70%_55%/0.2)] transition-all"
            >
              <Trash2 className="w-3 h-3 text-[hsl(0_70%_55%/0.7)]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── System Monitor Panel ─────────────────────────────────────

function SystemMonitorPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  const processes = useMemo(() => ProcessTable.listProcesses(), [tick]);
  const memStats = useMemo(() => MemoryManager.getStats(), [tick]);
  const schedStats = useMemo(() => Scheduler.getStats(), [tick]);
  const compStats = useMemo(() => Compositor.getStats(), [tick]);

  const cpuUsage = useMemo(() => {
    if (processes.length === 0) return 3;
    return Math.min(95, processes.length * 12 + Math.round(Math.random() * 8));
  }, [tick, processes.length]);

  const memPercent = memStats.totalPages > 0
    ? Math.round((memStats.allocatedPages / Math.max(memStats.totalPages, memStats.allocatedPages + 256)) * 100)
    : 5;

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Gauges */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Cpu, label: "CPU", value: `${cpuUsage}%`, color: cpuUsage > 70 ? "0 70% 55%" : "130 55% 48%" },
          { icon: MemoryStick, label: "Memory", value: `${memPercent}%`, color: memPercent > 80 ? "0 70% 55%" : "210 80% 60%" },
          { icon: HardDrive, label: "Surfaces", value: `${compStats.totalSurfaces}`, color: "45 80% 55%" },
          { icon: Activity, label: "Processes", value: `${processes.length}`, color: "280 60% 60%" },
        ].map((g) => (
          <div
            key={g.label}
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 0% 100% / 0.06)" }}
          >
            <div className="flex items-center justify-between">
              <g.icon className="w-3.5 h-3.5" style={{ color: `hsl(${g.color})` }} />
              <span className="text-sm font-semibold text-[hsl(0_0%_95%)]">{g.value}</span>
            </div>
            <span className="text-[10px] text-[hsl(0_0%_100%/0.4)]">{g.label}</span>
            {/* Mini bar */}
            <div className="h-1 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${g.label === "CPU" ? cpuUsage : g.label === "Memory" ? memPercent : 50}%`,
                  background: `hsl(${g.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Process list */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_100%/0.3)] mb-2 block">
          Processes
        </span>
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto scrollbar-thin">
          {processes.length === 0 && (
            <span className="text-xs text-[hsl(0_0%_100%/0.3)] italic">No active processes</span>
          )}
          {processes.map((p) => (
            <div
              key={p.pid}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg"
              style={{ background: "hsl(0 0% 100% / 0.02)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: p.state === "running" ? "hsl(130 55% 48%)" : p.state === "ready" ? "hsl(45 80% 55%)" : "hsl(0 0% 40%)",
                  }}
                />
                <span className="text-[11px] text-[hsl(0_0%_100%/0.7)]">{p.appId}</span>
              </div>
              <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] font-mono">PID {p.pid}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduler */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_100%/0.3)] mb-1 block">
          Scheduler
        </span>
        <div className="flex gap-3 text-[10px] text-[hsl(0_0%_100%/0.4)]">
          <span>Ticks: <span className="text-[hsl(0_0%_100%/0.7)] font-mono">{schedStats.totalTicks}</span></span>
          <span>Scheduled: <span className="text-[hsl(0_0%_100%/0.7)] font-mono">{schedStats.scheduledCount}</span></span>
        </div>
      </div>
    </div>
  );
}

// ── Edge Tabs (hover triggers) ───────────────────────────────

function EdgeTab({
  panel,
  isActive,
  onClick,
  yOffset,
}: {
  panel: EdgePanelDef;
  isActive: boolean;
  onClick: () => void;
  yOffset: number;
}) {
  const isRight = panel.edge === "right";
  const Icon = panel.icon;

  return (
    <motion.button
      initial={{ opacity: 0, x: isRight ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRight ? 20 : -20 }}
      onClick={onClick}
      className={cn(
        "fixed z-[900] flex items-center gap-1.5 py-2 cursor-pointer transition-all duration-200",
        isRight ? "right-0 rounded-l-lg pl-2.5 pr-1.5" : "left-0 rounded-r-lg pr-2.5 pl-1.5",
        isActive
          ? "bg-[hsl(210_80%_60%/0.2)] border-[hsl(210_80%_60%/0.3)]"
          : "bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.1)] border-[hsl(0_0%_100%/0.08)]",
      )}
      style={{
        top: yOffset,
        border: "1px solid",
        borderColor: isActive ? "hsl(210 80% 60% / 0.3)" : "hsl(0 0% 100% / 0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        [isRight ? "borderRight" : "borderLeft"]: "none",
      }}
    >
      <Icon className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.5)]" />
      <span className="text-[10px] text-[hsl(0_0%_100%/0.5)] hidden sm:inline">{panel.label}</span>
    </motion.button>
  );
}

// ── Main Component ───────────────────────────────────────────

const PANEL_CONTENT: Record<PanelId, () => JSX.Element> = {
  weather: WeatherPanel,
  quicknotes: QuickNotesPanel,
  sysmonitor: SystemMonitorPanel,
};

export function EdgePanels() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [showTabs, setShowTabs] = useState(false);
  const tabTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show tabs when mouse is near any edge
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const nearEdge =
        e.clientX <= EDGE_TRIGGER ||
        e.clientX >= window.innerWidth - EDGE_TRIGGER;

      if (nearEdge && !activePanel) {
        if (tabTimer.current) clearTimeout(tabTimer.current);
        tabTimer.current = setTimeout(() => setShowTabs(true), 150);
      } else if (!nearEdge && !activePanel) {
        if (tabTimer.current) clearTimeout(tabTimer.current);
        // Keep tabs visible for a bit
        tabTimer.current = setTimeout(() => setShowTabs(false), 1200);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [activePanel]);

  const togglePanel = useCallback((id: PanelId) => {
    setActivePanel(prev => prev === id ? null : id);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const activeDef = activePanel ? PANELS.find(p => p.id === activePanel) : null;
  const PanelContent = activePanel ? PANEL_CONTENT[activePanel] : null;

  return (
    <>
      {/* Edge tabs */}
      <AnimatePresence>
        {(showTabs || activePanel) &&
          PANELS.map((panel, i) => {
            const baseY = panel.edge === "left" ? 200 : 160;
            const sameEdge = PANELS.filter(p => p.edge === panel.edge);
            const idx = sameEdge.indexOf(panel);
            return (
              <EdgeTab
                key={panel.id}
                panel={panel}
                isActive={activePanel === panel.id}
                onClick={() => togglePanel(panel.id)}
                yOffset={baseY + idx * 44}
              />
            );
          })
        }
      </AnimatePresence>

      {/* Panel drawer */}
      <AnimatePresence>
        {activePanel && activeDef && PanelContent && (
          <>
            {/* Backdrop */}
            <motion.div
              key="edge-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 z-[950]"
              style={{ background: "hsl(0 0% 0% / 0.15)" }}
            />

            {/* Panel */}
            <motion.div
              key={`edge-panel-${activePanel}`}
              initial={{ x: activeDef.edge === "right" ? activeDef.width + 20 : -(activeDef.width + 20), opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: activeDef.edge === "right" ? activeDef.width + 20 : -(activeDef.width + 20), opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed top-[48px] bottom-[88px] z-[960] flex flex-col overflow-hidden",
                activeDef.edge === "right" ? "right-1.5 rounded-xl" : "left-1.5 rounded-xl",
              )}
              style={{
                width: activeDef.width,
                background: "hsl(0 0% 8% / 0.85)",
                backdropFilter: "blur(40px) saturate(1.5)",
                WebkitBackdropFilter: "blur(40px) saturate(1.5)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
                boxShadow: "0 16px 48px hsl(0 0% 0% / 0.5), 0 4px 16px hsl(0 0% 0% / 0.3)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
                <div className="flex items-center gap-2">
                  <activeDef.icon className="w-4 h-4 text-[hsl(210_80%_60%/0.7)]" />
                  <span className="text-sm font-medium text-[hsl(0_0%_100%/0.8)]">{activeDef.label}</span>
                </div>
                <button
                  onClick={closePanel}
                  className="w-6 h-6 rounded-md hover:bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.4)]" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <PanelContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default EdgePanels;
