import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  KernelSubsystem,
  type Rect,
  type DamageRegion,
  type SnapZone,
  type WMWindow,
} from "@/lib/core-services/kernel";
import {
  Eye, EyeOff, Layers, Grid3X3, Square, Box,
  RotateCcw, Pause, Play, Settings2, Maximize2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────

interface OverlayLayer {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;        // hsl tailwind token
  enabled: boolean;
}

interface DamageRect extends Rect {
  source: string;
  age: number; // 0-1 for fade
}

interface SnapZoneOverlay {
  zone: SnapZone;
  bounds: Rect;
  active: boolean;
}

interface WindowBoundsOverlay {
  id: string;
  title: string;
  bounds: Rect;
  focused: boolean;
  state: string;
  zIndex: number;
}

// ── Simulated kernel data generator ───────────────────────────

function generateDemoData() {
  const damageRegions: DamageRect[] = [
    { x: 120, y: 80, width: 340, height: 180, source: "widget", age: 0.9 },
    { x: 600, y: 200, width: 220, height: 120, source: "animation", age: 0.6 },
    { x: 50, y: 400, width: 180, height: 90, source: "scroll", age: 0.3 },
    { x: 800, y: 100, width: 150, height: 300, source: "cursor", age: 1.0 },
    { x: 400, y: 350, width: 260, height: 140, source: "resize", age: 0.5 },
    { x: 200, y: 550, width: 320, height: 80, source: "theme", age: 0.2 },
  ];

  const snapZones: SnapZoneOverlay[] = [
    { zone: "left-half", bounds: { x: 0, y: 0, width: 480, height: 675 }, active: false },
    { zone: "right-half", bounds: { x: 480, y: 0, width: 480, height: 675 }, active: false },
    { zone: "top-left-quarter", bounds: { x: 0, y: 0, width: 480, height: 337 }, active: true },
    { zone: "top-right-quarter", bounds: { x: 480, y: 0, width: 480, height: 337 }, active: false },
    { zone: "bottom-left-quarter", bounds: { x: 0, y: 337, width: 480, height: 338 }, active: false },
    { zone: "bottom-right-quarter", bounds: { x: 480, y: 337, width: 480, height: 338 }, active: false },
  ];

  const windows: WindowBoundsOverlay[] = [
    { id: "win-1", title: "Terminal", bounds: { x: 40, y: 60, width: 400, height: 280 }, focused: false, state: "normal", zIndex: 1 },
    { id: "win-2", title: "Browser", bounds: { x: 200, y: 140, width: 500, height: 350 }, focused: true, state: "normal", zIndex: 3 },
    { id: "win-3", title: "Editor", bounds: { x: 500, y: 80, width: 380, height: 420 }, focused: false, state: "normal", zIndex: 2 },
    { id: "win-4", title: "Settings", bounds: { x: 100, y: 380, width: 300, height: 200 }, focused: false, state: "minimized", zIndex: 0 },
  ];

  return { damageRegions, snapZones, windows };
}

// ── Damage source color mapping ───────────────────────────────

const DAMAGE_COLORS: Record<string, string> = {
  widget:    "rgba(239, 68, 68, VAR)",   // red
  scroll:    "rgba(59, 130, 246, VAR)",   // blue
  animation: "rgba(168, 85, 247, VAR)",   // purple
  resize:    "rgba(245, 158, 11, VAR)",   // amber
  theme:     "rgba(16, 185, 129, VAR)",   // emerald
  cursor:    "rgba(236, 72, 153, VAR)",   // pink
  external:  "rgba(107, 114, 128, VAR)",  // gray
};

function getDamageColor(source: string, opacity: number): string {
  const template = DAMAGE_COLORS[source] ?? DAMAGE_COLORS.external;
  return template.replace("VAR", String(opacity));
}

// ── Scale factor for viewport ─────────────────────────────────
const VIEWPORT_W = 960;
const VIEWPORT_H = 675;
const SCREEN_W = 1920;
const SCREEN_H = 1080;
const SCALE_X = VIEWPORT_W / SCREEN_W;
const SCALE_Y = VIEWPORT_H / SCREEN_H;

function scaleRect(r: Rect): { left: number; top: number; width: number; height: number } {
  return {
    left: r.x * SCALE_X,
    top: r.y * SCALE_Y,
    width: r.width * SCALE_X,
    height: r.height * SCALE_Y,
  };
}

// ── Component ─────────────────────────────────────────────────

export function CompositorDebugOverlay() {
  const [layers, setLayers] = useState<OverlayLayer[]>([
    { id: "damage", label: "Damage Regions", icon: <Square className="h-3.5 w-3.5" />, color: "text-red-400", enabled: true },
    { id: "snap", label: "Snap Zones", icon: <Grid3X3 className="h-3.5 w-3.5" />, color: "text-blue-400", enabled: true },
    { id: "bounds", label: "Window Bounds", icon: <Box className="h-3.5 w-3.5" />, color: "text-emerald-400", enabled: true },
  ]);

  const [paused, setPaused] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [frameCount, setFrameCount] = useState(0);
  const [data, setData] = useState(generateDemoData);

  // Simulate frame ticks
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setFrameCount(c => c + 1);
      setData(prev => {
        // Animate damage regions — age them and occasionally add new ones
        const sources = ["widget", "scroll", "animation", "resize", "cursor", "theme"];
        const aged = prev.damageRegions
          .map(d => ({ ...d, age: d.age - 0.15 }))
          .filter(d => d.age > 0);

        // Randomly add 0-2 new damage rects
        const newCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < newCount; i++) {
          aged.push({
            x: Math.floor(Math.random() * 800) + 50,
            y: Math.floor(Math.random() * 500) + 50,
            width: Math.floor(Math.random() * 300) + 60,
            height: Math.floor(Math.random() * 200) + 40,
            source: sources[Math.floor(Math.random() * sources.length)],
            age: 1.0,
          });
        }

        // Randomly toggle a snap zone
        const snapZones = prev.snapZones.map(z => ({
          ...z,
          active: Math.random() > 0.85 ? !z.active : z.active,
        }));

        return { ...prev, damageRegions: aged, snapZones };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [paused]);

  const toggleLayer = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  }, []);

  const layerMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const l of layers) map[l.id] = l.enabled;
    return map;
  }, [layers]);

  const damageStats = useMemo(() => {
    const total = data.damageRegions.length;
    const totalPixels = data.damageRegions.reduce((a, d) => a + d.width * d.height, 0);
    const coverage = (totalPixels / (SCREEN_W * SCREEN_H) * 100).toFixed(1);
    const bySrc: Record<string, number> = {};
    for (const d of data.damageRegions) bySrc[d.source] = (bySrc[d.source] || 0) + 1;
    return { total, coverage, bySrc };
  }, [data.damageRegions]);

  return (
    <div className="relative w-full max-w-[960px] mx-auto">
      {/* ── Viewport Canvas ─────────────────────────────────── */}
      <div
        className="relative w-full rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm overflow-hidden"
        style={{ aspectRatio: `${VIEWPORT_W}/${VIEWPORT_H}` }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }} />

        {/* ── Snap Zone Overlays ──────────────────────────── */}
        <AnimatePresence>
          {layerMap.snap && data.snapZones.map(zone => {
            const { left, top, width, height } = scaleRect(zone.bounds);
            return (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute border-2 border-dashed rounded-md pointer-events-none",
                  zone.active
                    ? "border-blue-400/60 bg-blue-500/10"
                    : "border-blue-400/20 bg-blue-500/[0.03]"
                )}
                style={{ left, top, width, height }}
              >
                {showLabels && (
                  <span className={cn(
                    "absolute top-1 left-1.5 text-[9px] font-mono tracking-tight",
                    zone.active ? "text-blue-300" : "text-blue-400/40"
                  )}>
                    {zone.zone}
                  </span>
                )}
                {zone.active && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 rounded-md border border-blue-400/40 bg-blue-400/5"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Window Bounds Overlays ──────────────────────── */}
        <AnimatePresence>
          {layerMap.bounds && data.windows.map(win => {
            const { left, top, width, height } = scaleRect(win.bounds);
            const isMinimized = win.state === "minimized";
            return (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isMinimized ? 0.3 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "absolute rounded-md pointer-events-none",
                  win.focused
                    ? "border-2 border-emerald-400/70 bg-emerald-500/8 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "border border-emerald-400/30 bg-emerald-500/[0.03]",
                  isMinimized && "border-dashed"
                )}
                style={{ left, top, width, height, zIndex: win.zIndex }}
              >
                {/* Title bar */}
                <div className={cn(
                  "absolute -top-0.5 left-0 right-0 h-5 rounded-t-md flex items-center px-1.5 gap-1",
                  win.focused ? "bg-emerald-500/15" : "bg-emerald-500/5"
                )}>
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    win.focused ? "bg-emerald-400" : "bg-emerald-400/40"
                  )} />
                  {showLabels && (
                    <span className="text-[9px] font-mono text-emerald-300/80 truncate">
                      {win.title} <span className="text-emerald-400/40">z:{win.zIndex}</span>
                    </span>
                  )}
                </div>

                {/* Crosshair center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                  <div className="w-3 h-px bg-emerald-400" />
                  <div className="w-px h-3 bg-emerald-400 -mt-[7px] ml-[5px]" />
                </div>

                {/* Dimensions label */}
                {showLabels && (
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-emerald-400/50">
                    {win.bounds.width}×{win.bounds.height}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Damage Region Overlays ──────────────────────── */}
        <AnimatePresence>
          {layerMap.damage && data.damageRegions.map((dmg, i) => {
            const { left, top, width, height } = scaleRect(dmg);
            const fillColor = getDamageColor(dmg.source, dmg.age * 0.15);
            const borderColor = getDamageColor(dmg.source, dmg.age * 0.6);
            return (
              <motion.div
                key={`dmg-${i}-${dmg.x}-${dmg.y}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: dmg.age, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute rounded-sm pointer-events-none"
                style={{
                  left, top, width, height,
                  backgroundColor: fillColor,
                  border: `1px solid ${borderColor}`,
                  zIndex: 100,
                }}
              >
                {showLabels && dmg.age > 0.4 && (
                  <span className="absolute -top-3.5 left-0 text-[8px] font-mono whitespace-nowrap"
                    style={{ color: getDamageColor(dmg.source, 0.8) }}>
                    {dmg.source}
                  </span>
                )}
                {/* Diagonal hatch pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 3px,
                    ${getDamageColor(dmg.source, 0.1)} 3px,
                    ${getDamageColor(dmg.source, 0.1)} 4px
                  )`,
                }} />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Frame counter badge ─────────────────────────── */}
        <div className="absolute top-2 right-2 z-[200] flex items-center gap-1.5">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] font-mono border-border/40">
            Frame #{frameCount}
          </Badge>
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] font-mono border-border/40 text-muted-foreground">
            {SCREEN_W}×{SCREEN_H}
          </Badge>
        </div>
      </div>

      {/* ── Control Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Compositor Debug Layers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setPaused(!paused)}
                >
                  {paused
                    ? <Play className="h-3.5 w-3.5 text-emerald-400" />
                    : <Pause className="h-3.5 w-3.5 text-muted-foreground" />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => { setFrameCount(0); setData(generateDemoData()); }}
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Layer toggles */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 transition-all text-left",
                    layer.enabled
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/30 bg-transparent opacity-50"
                  )}
                >
                  <span className={layer.color}>{layer.icon}</span>
                  <span className="text-xs font-medium text-foreground">{layer.label}</span>
                  <Switch
                    checked={layer.enabled}
                    onCheckedChange={() => toggleLayer(layer.id)}
                    className="ml-auto scale-75"
                  />
                </button>
              ))}
            </div>

            {/* Labels toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 mb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Show labels</span>
              </div>
              <Switch checked={showLabels} onCheckedChange={setShowLabels} className="scale-75" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              <StatCard label="Damage Rects" value={String(damageStats.total)} color="text-red-400" />
              <StatCard label="Screen Dirty" value={`${damageStats.coverage}%`} color="text-amber-400" />
              <StatCard label="Snap Zones" value={String(data.snapZones.filter(z => z.active).length)} sublabel={`/ ${data.snapZones.length}`} color="text-blue-400" />
              <StatCard label="Windows" value={String(data.windows.filter(w => w.state !== "minimized").length)} sublabel={`/ ${data.windows.length}`} color="text-emerald-400" />
            </div>

            {/* Damage source breakdown */}
            {layerMap.damage && Object.keys(damageStats.bySrc).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(damageStats.bySrc).map(([src, count]) => (
                  <span
                    key={src}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono border border-border/30 bg-background/50"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getDamageColor(src, 0.8) }} />
                    {src}: {count}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel toggle */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="absolute -bottom-1 right-4 z-10 rounded-b-lg border border-t-0 border-border/40 bg-card/80 backdrop-blur-sm px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPanel ? "Hide Controls" : "Show Controls"}
      </button>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────

function StatCard({ label, value, sublabel, color }: {
  label: string;
  value: string;
  sublabel?: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border/30 bg-background/40 px-3 py-2">
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-lg font-semibold font-mono leading-none", color)}>
        {value}
        {sublabel && <span className="text-xs text-muted-foreground ml-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
