// ═══════════════════════════════════════════════════════════════
// NovaOS — Mission Control (FlowSpace)
// macOS-grade zoomed-out overview of all open windows with
// physics-based spring animations, drag rearrange, desktop spaces
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import { cn } from "@/lib/utils";
import { Layers, Mail, FolderOpen, FileText, Monitor, Plus, Minus } from "lucide-react";
import { SoundEngine } from "@/platform/runtime/sound-engine";
import type { ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────

interface WindowInfo {
  id: string;
  title: string;
  component: ReactNode;
  position: { x: number; y: number };
  width?: number;
  zIndex: number;
  minimized?: boolean;
}

interface FlowItem {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  scale: number;
  targetScale: number;
  vs: number;
}

interface FlowSpaceProps {
  isOpen: boolean;
  windows: WindowInfo[];
  onSelectWindow: (id: string) => void;
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
}

// ── Physics Constants ────────────────────────────────────────

const STIFFNESS = 0.08;
const DAMPING = 0.85;
const REST_THRESHOLD = 0.3;
const CARD_W = 260;
const CARD_H = 170;
const GAP = 28;

// ── Virtual Desktop Spaces ───────────────────────────────────

const SPACES = [
  { id: "desktop-1", label: "Desktop 1", active: true },
  { id: "desktop-2", label: "Desktop 2", active: false },
];

// ── Suggested Apps ───────────────────────────────────────────

function getSuggestedApps(openIds: Set<string>) {
  const hour = new Date().getHours();
  const all = [
    { id: "mail", label: "Mail", icon: Mail, hours: [6, 7, 8, 9, 10, 11] },
    { id: "finder", label: "Finder", icon: FolderOpen, hours: [9, 10, 11, 12, 13, 14, 15, 16] },
    { id: "notes", label: "Notes", icon: FileText, hours: [12, 13, 14, 15, 16, 17, 18, 19, 20] },
  ];
  return all
    .filter(a => !openIds.has(a.id))
    .sort((a, b) => {
      const aMatch = a.hours.includes(hour) ? 0 : 1;
      const bMatch = b.hours.includes(hour) ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, 2);
}

// ── Grid Layout Calculator ───────────────────────────────────

function computeGrid(count: number, viewW: number, viewH: number, topOffset = 140, bottomOffset = 180) {
  if (count === 0) return [];
  const usableH = viewH - topOffset - bottomOffset;
  const cols = Math.min(count, Math.max(2, Math.floor((viewW - 80) / (CARD_W + GAP))));
  const rows = Math.ceil(count / cols);
  const totalW = cols * CARD_W + (cols - 1) * GAP;
  const totalH = rows * CARD_H + (rows - 1) * GAP;
  const offsetX = (viewW - totalW) / 2;
  const offsetY = topOffset + Math.max(0, (usableH - totalH) / 2);

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: offsetX + col * (CARD_W + GAP),
      y: offsetY + row * (CARD_H + GAP),
    });
  }
  return positions;
}

// ── Component ────────────────────────────────────────────────

export function FlowSpace({ isOpen, windows, onSelectWindow, onClose, onLaunchApp }: FlowSpaceProps) {
  const visibleWindows = useMemo(() => windows.filter(w => !w.minimized), [windows]);
  const minimizedWindows = useMemo(() => windows.filter(w => w.minimized), [windows]);
  const itemsRef = useRef<FlowItem[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [activeSpace, setActiveSpace] = useState("desktop-1");

  // Drag state
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; moved: boolean } | null>(null);

  // Initialize items when opening — with signature parallax zoom-out
  useEffect(() => {
    if (!isOpen) {
      setShow(false);
      return;
    }
    
    // Play signature boot sound on FlowSpace entry
    SoundEngine.boot();
    
    const t = setTimeout(() => setShow(true), 30);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sorted = [...visibleWindows].sort((a, b) => b.zIndex - a.zIndex);
    const targets = computeGrid(sorted.length, vw, vh);

    // Parallax zoom-out: windows start at their real positions and fly to grid
    itemsRef.current = sorted.map((w, i) => ({
      id: w.id,
      x: w.position.x + (w.width ?? 400) / 2 - CARD_W / 2,
      y: w.position.y,
      vx: 0,
      vy: 0,
      targetX: targets[i]?.x ?? vw / 2,
      targetY: targets[i]?.y ?? vh / 2,
      scale: 0.3, // Start smaller for zoom-out effect
      targetScale: 1,
      vs: 0,
    }));

    return () => clearTimeout(t);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update hover target scale
  useEffect(() => {
    for (const item of itemsRef.current) {
      item.targetScale = item.id === hoveredId ? 1.06 : 1;
    }
  }, [hoveredId]);

  // Physics loop
  useEffect(() => {
    if (!show) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    let frame = 0;
    const maxFrames = 150;

    const tick = () => {
      let allAtRest = true;
      for (const item of itemsRef.current) {
        item.vx += (item.targetX - item.x) * STIFFNESS;
        item.vx *= DAMPING;
        item.x += item.vx;

        item.vy += (item.targetY - item.y) * STIFFNESS;
        item.vy *= DAMPING;
        item.y += item.vy;

        item.vs += (item.targetScale - item.scale) * 0.12;
        item.vs *= 0.8;
        item.scale += item.vs;

        if (
          Math.abs(item.vx) > REST_THRESHOLD ||
          Math.abs(item.vy) > REST_THRESHOLD ||
          Math.abs(item.vs) > 0.002
        ) {
          allAtRest = false;
        }
      }

      setRenderTick(t => t + 1);
      frame++;

      if (!allAtRest && frame < maxFrames) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [show]);

  // Pointer move for drag
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current.moved = true;
    const item = itemsRef.current.find(i => i.id === dragRef.current!.id);
    if (item) {
      item.targetX = e.clientX - dragRef.current.offsetX;
      item.targetY = e.clientY - dragRef.current.offsetY;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(function tick() {
          let moving = false;
          for (const it of itemsRef.current) {
            it.vx += (it.targetX - it.x) * STIFFNESS;
            it.vx *= DAMPING;
            it.x += it.vx;
            it.vy += (it.targetY - it.y) * STIFFNESS;
            it.vy *= DAMPING;
            it.y += it.vy;
            it.vs += (it.targetScale - it.scale) * 0.12;
            it.vs *= 0.8;
            it.scale += it.vs;
            if (Math.abs(it.vx) > REST_THRESHOLD || Math.abs(it.vy) > REST_THRESHOLD) moving = true;
          }
          setRenderTick(t => t + 1);
          if (moving || dragRef.current) rafRef.current = requestAnimationFrame(tick);
          else rafRef.current = 0;
        });
      }
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Window map for lookup
  const windowMap = new Map(visibleWindows.map(w => [w.id, w]));
  const openIds = new Set(visibleWindows.map(w => w.id));
  const suggested = getSuggestedApps(openIds);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0"
          style={{ zIndex: DEPTH_LAYERS.overlay + 10 }}
          onClick={onClose}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={containerRef}
        >
          {/* Background — deep blur with grain */}
          <div
            className="absolute inset-0"
            style={{
              background: "hsl(0 0% 0% / 0.75)",
              backdropFilter: "blur(20px) saturate(1.5)",
              WebkitBackdropFilter: "blur(20px) saturate(1.5)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 30%, hsl(0 0% 0% / 0.5) 100%)",
            }}
          />

          {/* ── Desktop Spaces Strip (top) ───────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : -30 }}
            transition={{ delay: 0.05, duration: 0.35, type: "spring", stiffness: 200, damping: 25 }}
            className="relative z-20 flex items-center justify-center gap-3 pt-6 pb-2"
          >
            {SPACES.map(space => (
              <button
                key={space.id}
                onClick={(e) => { e.stopPropagation(); setActiveSpace(space.id); }}
                className={cn(
                  "relative rounded-lg overflow-hidden transition-all duration-300",
                  "border-2",
                  activeSpace === space.id
                    ? "border-[hsl(210_80%_60%/0.8)] shadow-[0_0_20px_hsl(210_80%_60%/0.25)]"
                    : "border-[hsl(0_0%_100%/0.12)] hover:border-[hsl(0_0%_100%/0.25)]",
                )}
                style={{ width: 140, height: 88 }}
              >
                {/* Mini desktop preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(260_40%_20%)] to-[hsl(280_30%_12%)] opacity-80" />
                {/* Show tiny window indicators */}
                {activeSpace === space.id && visibleWindows.slice(0, 3).map((w, i) => (
                  <div
                    key={w.id}
                    className="absolute rounded-sm bg-[hsl(0_0%_100%/0.15)]"
                    style={{
                      width: 30 + (i * 5),
                      height: 20,
                      left: 15 + i * 25,
                      top: 20 + i * 12,
                    }}
                  />
                ))}
                <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] text-[hsl(0_0%_100%/0.5)] font-medium">
                  {space.label}
                </span>
              </button>
            ))}
            {/* Add space button */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-[hsl(0_0%_100%/0.1)] hover:border-[hsl(0_0%_100%/0.25)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.3)]" />
            </button>
          </motion.div>

          {/* ── Title ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : -12 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative z-10 text-center pb-2"
          >
            <h2 className="text-sm font-medium text-[hsl(0_0%_100%/0.7)] tracking-wide">
              Mission Control
            </h2>
            <p className="text-[10px] text-[hsl(0_0%_100%/0.35)] mt-0.5">
              {windows.length > 0
                ? `${visibleWindows.length} open${minimizedWindows.length > 0 ? ` · ${minimizedWindows.length} minimized` : ""}`
                : "No windows — launch from the Dock"}
            </p>
          </motion.div>

          {/* ── Physics-driven window cards ────────────────── */}
          {visibleWindows.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.9 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative z-10 flex flex-col items-center justify-center h-[50vh]"
            >
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: "hsl(0 0% 100% / 0.04)",
                  backdropFilter: "blur(40px)",
                  border: "1px solid hsl(0 0% 100% / 0.06)",
                }}
              >
                <Layers className="h-12 w-12 text-[hsl(0_0%_100%/0.12)] mx-auto mb-3" />
                <p className="text-sm text-[hsl(0_0%_100%/0.3)] text-center">
                  No windows open
                </p>
                <p className="text-[10px] text-[hsl(0_0%_100%/0.2)] text-center mt-1">
                  Launch an app from the Dock below
                </p>
              </div>
            </motion.div>
          ) : (
            itemsRef.current.map((item) => {
              const win = windowMap.get(item.id);
              if (!win) return null;
              const maxZ = Math.max(...visibleWindows.map(w => w.zIndex));
              const isRecent = win.zIndex === maxZ;
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    transform: `translate3d(${item.x}px, ${item.y}px, 0) scale(${item.scale})`,
                    width: CARD_W,
                    height: CARD_H,
                    willChange: "transform",
                    zIndex: win.zIndex,
                  }}
                  onPointerEnter={() => setHoveredId(item.id)}
                  onPointerLeave={() => setHoveredId(null)}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragRef.current = {
                      id: item.id,
                      offsetX: e.clientX - item.x,
                      offsetY: e.clientY - item.y,
                      moved: false,
                    };
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!dragRef.current?.moved) {
                      onSelectWindow(item.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-xl overflow-hidden cursor-pointer transition-[border-color,box-shadow] duration-200",
                      isHovered
                        ? "border-[hsl(210_80%_60%/0.6)] shadow-[0_8px_40px_hsl(210_80%_60%/0.2),0_2px_8px_hsl(0_0%_0%/0.4)]"
                        : "border-[hsl(0_0%_100%/0.1)] shadow-[0_4px_24px_hsl(0_0%_0%/0.5),0_1px_4px_hsl(0_0%_0%/0.3)]",
                      isRecent && "flowspace-active-glow",
                    )}
                    style={{
                      background: "hsl(0 0% 100% / 0.06)",
                      backdropFilter: "blur(30px) saturate(1.5)",
                      WebkitBackdropFilter: "blur(30px) saturate(1.5)",
                      border: isHovered
                        ? "1px solid hsl(210 80% 60% / 0.6)"
                        : isRecent ? undefined : "1px solid hsl(0 0% 100% / 0.1)",
                    }}
                  >
                    {/* Most recent indicator */}
                    {isRecent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 z-20">
                        <span className="absolute inset-0 rounded-full bg-[hsl(210_80%_60%)] animate-ping opacity-30" />
                        <span className="absolute inset-0 rounded-full bg-[hsl(210_80%_60%)]" />
                      </div>
                    )}

                    {/* Close button on hover */}
                    {isHovered && (
                      <button
                        onClick={(e) => { e.stopPropagation(); /* close handled by parent */ }}
                        className="absolute top-2 left-2 z-20 w-3.5 h-3.5 rounded-full bg-[hsl(0_70%_55%)] hover:bg-[hsl(0_70%_45%)] flex items-center justify-center transition-colors"
                      >
                        <span className="text-[8px] text-white leading-none">×</span>
                      </button>
                    )}

                    {/* Mini preview — scaled down window content */}
                    <div className="w-full h-full overflow-hidden pointer-events-none">
                      <div className="origin-top-left" style={{ transform: "scale(0.38)", width: 680 }}>
                        <div className="h-10 flex items-center px-3 gap-2 border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)]">
                          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(0_70%_60%)]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(45_80%_55%)]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(130_55%_48%)]" />
                          <span className="ml-2 text-xs text-[hsl(0_0%_100%/0.5)]">{win.title}</span>
                        </div>
                        <div className="p-2 opacity-40">{win.component}</div>
                      </div>
                    </div>

                    {/* Title gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-gradient-to-t from-[hsl(0_0%_0%/0.8)] via-[hsl(0_0%_0%/0.4)] to-transparent">
                      <span className="text-[11px] font-medium text-[hsl(0_0%_100%/0.9)]">{win.title}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* ── Minimized windows strip ───────────────────── */}
          {minimizedWindows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="fixed bottom-40 left-0 right-0 z-10 flex justify-center gap-3"
            >
              <span className="text-[9px] uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.2)] self-center mr-1">
                Minimized
              </span>
              {minimizedWindows.map(w => (
                <button
                  key={w.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWindow(w.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                    "bg-[hsl(0_0%_100%/0.05)] border border-[hsl(0_0%_100%/0.08)]",
                    "hover:bg-[hsl(0_0%_100%/0.1)] hover:border-[hsl(210_80%_60%/0.3)]",
                  )}
                >
                  <Minus className="w-3 h-3 text-[hsl(45_80%_55%/0.6)]" />
                  <span className="text-[11px] text-[hsl(0_0%_100%/0.6)]">{w.title}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* ── Suggested apps ────────────────────────────── */}
          {suggested.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className={cn(
                "fixed left-0 right-0 z-10 flex justify-center gap-3",
                minimizedWindows.length > 0 ? "bottom-28" : "bottom-32",
              )}
            >
              <span className="text-[9px] uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.2)] self-center mr-1">
                Suggested
              </span>
              {suggested.map(app => (
                <button
                  key={app.id}
                  onClick={(e) => { e.stopPropagation(); onLaunchApp?.(app.id); onClose(); }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                    "bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)]",
                    "hover:bg-[hsl(0_0%_100%/0.1)] hover:border-[hsl(0_0%_100%/0.2)]",
                  )}
                >
                  <app.icon className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.4)]" />
                  <span className="text-[11px] text-[hsl(0_0%_100%/0.5)]">{app.label}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* ── Show Desktop button ───────────────────────── */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: show ? 0.6 : 0, y: show ? 0 : 16 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            whileHover={{ opacity: 1, scale: 1.04 }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className={cn(
              "fixed bottom-16 left-1/2 -translate-x-1/2 z-10",
              "flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer",
              "transition-all duration-200",
            )}
            style={{
              background: "hsl(0 0% 100% / 0.06)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
            }}
          >
            <Monitor className="w-4 h-4 text-[hsl(0_0%_100%/0.5)]" />
            <span className="text-xs text-[hsl(0_0%_100%/0.6)]">Show Desktop</span>
          </motion.button>

          {/* ── Footer hint ───────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-5 left-0 right-0 text-center text-[9px] text-[hsl(0_0%_100%/0.18)] tracking-[0.15em] uppercase z-10"
          >
            F3 · Click to focus · Drag to rearrange · Esc to exit
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FlowSpace;
