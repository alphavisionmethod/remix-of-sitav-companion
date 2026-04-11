// ═══════════════════════════════════════════════════════════════
// NovaOS — FlowSpace
// Physics-based spatial overview — the signature feature
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEPTH_LAYERS } from "@/lib/design-system/nova-os";
import { cn } from "@/lib/utils";
import { Layers, Mail, FolderOpen, FileText, Monitor } from "lucide-react";
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
  vs: number; // velocity for scale
}

interface FlowSpaceProps {
  isOpen: boolean;
  windows: WindowInfo[];
  onSelectWindow: (id: string) => void;
  onClose: () => void;
}

// ── Physics Constants ────────────────────────────────────────

const STIFFNESS = 0.08;
const DAMPING = 0.85;
const REST_THRESHOLD = 0.3;
const CARD_W = 240;
const CARD_H = 160;
const GAP = 24;

// ── Suggested Apps (time-of-day heuristic) ───────────────────

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

function computeGrid(count: number, viewW: number, viewH: number) {
  const cols = Math.min(count, Math.max(2, Math.floor((viewW - 80) / (CARD_W + GAP))));
  const rows = Math.ceil(count / cols);
  const totalW = cols * CARD_W + (cols - 1) * GAP;
  const totalH = rows * CARD_H + (rows - 1) * GAP;
  const offsetX = (viewW - totalW) / 2;
  const offsetY = (viewH - totalH) / 2 - 20;

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

export function FlowSpace({ isOpen, windows, onSelectWindow, onClose }: FlowSpaceProps) {
  const visibleWindows = windows.filter(w => !w.minimized);
  const itemsRef = useRef<FlowItem[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  // Drag state
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // Initialize items when opening
  useEffect(() => {
    if (!isOpen) {
      setShow(false);
      return;
    }
    // Small delay for entrance
    const t = setTimeout(() => setShow(true), 30);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sorted = [...visibleWindows].sort((a, b) => b.zIndex - a.zIndex); // most recent first
    const targets = computeGrid(sorted.length, vw, vh);

    itemsRef.current = sorted.map((w, i) => ({
      id: w.id,
      x: w.position.x + (w.width ?? 400) / 2 - CARD_W / 2, // start from real position
      y: w.position.y,
      vx: 0,
      vy: 0,
      targetX: targets[i]?.x ?? vw / 2,
      targetY: targets[i]?.y ?? vh / 2,
      scale: 0.5,
      targetScale: 1,
      vs: 0,
    }));

    return () => clearTimeout(t);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update hover target scale
  useEffect(() => {
    for (const item of itemsRef.current) {
      item.targetScale = item.id === hoveredId ? 1.08 : 1;
    }
  }, [hoveredId]);

  // Physics loop
  useEffect(() => {
    if (!show) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    let frame = 0;
    const maxFrames = 120; // 2s max

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
    const item = itemsRef.current.find(i => i.id === dragRef.current!.id);
    if (item) {
      item.targetX = e.clientX - dragRef.current.offsetX;
      item.targetY = e.clientY - dragRef.current.offsetY;
      // Restart physics
      rafRef.current = rafRef.current || requestAnimationFrame(function tick() {
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
          transition={{ duration: 0.25 }}
          className="fixed inset-0"
          style={{ zIndex: DEPTH_LAYERS.overlay + 10 }}
          onClick={onClose}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={containerRef}
        >
          {/* Scrim + vignette */}
          <div className="absolute inset-0 bg-[hsl(0_0%_0%/0.72)]" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.4) 100%)",
            }}
          />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative z-10 pt-16 text-center"
          >
            <h2 className="text-base font-medium text-[hsl(0_0%_100%/0.85)] tracking-wide">
              FlowSpace
            </h2>
            <p className="text-[11px] text-[hsl(0_0%_100%/0.4)] mt-1">
              {visibleWindows.length > 0
                ? `${visibleWindows.length} open · sorted by recency`
                : "No windows — launch from the Dock"}
            </p>
          </motion.div>

          {/* Physics-driven window cards */}
          {visibleWindows.length === 0 ? (
            <div className="relative z-10 flex flex-col items-center justify-center h-[60vh]">
              <Layers className="h-14 w-14 text-[hsl(0_0%_100%/0.15)] mb-4" />
              <p className="text-sm text-[hsl(0_0%_100%/0.3)]">
                No windows open — launch an app from the Dock
              </p>
            </div>
          ) : (
            itemsRef.current.map((item) => {
              const win = windowMap.get(item.id);
              if (!win) return null;
              const isRecent = win.zIndex === Math.max(...visibleWindows.map(w => w.zIndex));
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
                  }}
                  onPointerEnter={() => setHoveredId(item.id)}
                  onPointerLeave={() => setHoveredId(null)}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragRef.current = {
                      id: item.id,
                      offsetX: e.clientX - item.x,
                      offsetY: e.clientY - item.y,
                    };
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!dragRef.current) {
                      onSelectWindow(item.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-xl overflow-hidden cursor-pointer",
                      "bg-[hsl(0_0%_100%/0.08)] backdrop-blur-lg",
                      "border border-[hsl(0_0%_100%/0.12)]",
                      "shadow-[0_4px_20px_hsl(0_0%_0%/0.4),0_1px_4px_hsl(0_0%_0%/0.3)]",
                      "transition-[border-color,box-shadow] duration-200",
                      isHovered && "border-[hsl(210_80%_60%/0.6)] shadow-[0_4px_30px_hsl(210_80%_60%/0.2),0_1px_4px_hsl(0_0%_0%/0.3)]",
                    )}
                  >
                    {/* Recent indicator pulse */}
                    {isRecent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 z-20">
                        <span className="absolute inset-0 rounded-full bg-[hsl(210_80%_60%)] animate-ping opacity-40" />
                        <span className="absolute inset-0 rounded-full bg-[hsl(210_80%_60%)]" />
                      </div>
                    )}

                    {/* Mini preview */}
                    <div className="w-full h-full overflow-hidden pointer-events-none">
                      <div className="origin-top-left" style={{ transform: "scale(0.4)", width: 600 }}>
                        {/* Title bar */}
                        <div className="h-10 flex items-center px-3 gap-2 border-b border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.05)]">
                          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(0_70%_60%)]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(45_80%_55%)]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(130_55%_48%)]" />
                          <span className="ml-2 text-xs text-[hsl(0_0%_100%/0.6)]">{win.title}</span>
                        </div>
                        <div className="p-2 opacity-50">{win.component}</div>
                      </div>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-[hsl(0_0%_0%/0.7)] to-transparent">
                      <span className="text-xs font-medium text-[hsl(0_0%_100%/0.9)]">{win.title}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Suggested apps row */}
          {suggested.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className="fixed bottom-24 left-0 right-0 z-10 flex justify-center gap-4"
            >
              <span className="text-[10px] uppercase tracking-widest text-[hsl(0_0%_100%/0.25)] self-center mr-2">
                Suggested
              </span>
              {suggested.map(app => (
                <button
                  key={app.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.1)]",
                    "hover:bg-[hsl(0_0%_100%/0.12)] hover:border-[hsl(210_80%_60%/0.3)]",
                    "transition-all duration-200 cursor-pointer"
                  )}
                >
                  <app.icon className="w-4 h-4 text-[hsl(0_0%_100%/0.5)]" />
                  <span className="text-xs text-[hsl(0_0%_100%/0.7)]">{app.label}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Desktop card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: show ? 0.7 : 0, y: show ? 0 : 16 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "fixed bottom-36 left-1/2 -translate-x-1/2 z-10",
              "flex items-center gap-2 px-5 py-2.5 rounded-xl",
              "bg-[hsl(0_0%_100%/0.05)] border border-[hsl(0_0%_100%/0.08)]",
              "hover:bg-[hsl(0_0%_100%/0.1)] hover:opacity-100",
              "transition-all duration-200 cursor-pointer"
            )}
          >
            <Monitor className="w-4 h-4 text-[hsl(0_0%_100%/0.5)]" />
            <span className="text-xs text-[hsl(0_0%_100%/0.6)]">Show Desktop</span>
          </motion.button>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-8 left-0 right-0 text-center text-[10px] text-[hsl(0_0%_100%/0.2)] tracking-wider uppercase z-10"
          >
            F3 · Click to focus · Drag to rearrange · Esc to exit
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FlowSpace;
