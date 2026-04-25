import React, { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticTap, hapticHeavy } from "@/lib/utils/haptics";
import { useOSWindowContext, type OSWindow } from "./WindowContext";
import { SurfaceContextMenu } from "@/platform/sita/components/sita/shell/SurfaceContextMenu";
import { SnapGuideOverlay } from "@/platform/sita/components/sita/shell/SnapGuideOverlay";
import { useWindowSnap } from "@/hooks/useWindowSnap";
import { useWindowScrollSync } from "@/hooks/useWindowScrollSync";
import { useWindowKeyboardScroll } from "@/hooks/useWindowKeyboardScroll";

// ═══════════════════════════════════════════════════════════════
// SITA OS — App Window (Advanced)
//
// Premium glassmorphic draggable+resizable window with:
//   • GPU-accelerated drag via translate3d (60fps, zero React churn)
//   • 8-direction edge/corner resize handles
//   • Smooth snap-to-edge with size commit
//   • Animated minimize (scale-down to dock) / maximize / restore
//   • Min-size constraints and viewport clamping
//   • Double-click title bar to maximize/restore
// ═══════════════════════════════════════════════════════════════

const MENU_BAR_HEIGHT = 28;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const RESIZE_HANDLE_SIZE = 6;
const TOUCH_RESIZE_HANDLE_SIZE = 14;

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const EDGE_CURSORS: Record<ResizeEdge, string> = {
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
  ne: "nesw-resize", nw: "nwse-resize", se: "nwse-resize", sw: "nesw-resize",
};

interface AppWindowProps {
  window: OSWindow;
}

export function AppWindow({ window: win }: AppWindowProps) {
  const {
    closeWindow, minimizeWindow, maximizeWindow, focusWindow,
    updateWindowPosition, updateWindowGeometry,
  } = useOSWindowContext();

  const elRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: win.position.x, y: win.position.y });
  const sizeRef = useRef({ w: win.size.width, h: win.size.height });
  const dragStartRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
  const resizeStartRef = useRef({ px: 0, py: 0, ox: 0, oy: 0, ow: 0, oh: 0, edge: "" as ResizeEdge });
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);
  const rafRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [minimizeAnim, setMinimizeAnim] = useState<"idle" | "out" | "in">("idle");
  const [focusPulse, setFocusPulse] = useState(false);
  const [activeEdge, setActiveEdge] = useState<ResizeEdge | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const snap = useWindowSnap();

  // ── Scroll position sync during drag/resize ────────────────
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const { saveScroll, restoreScroll } = useWindowScrollSync(scrollBodyRef);

  // ── Keyboard scroll for focused window ─────────────────────
  const isFocused = useMemo(() => {
    // Highest zIndex among all windows — determined via context in parent
    return true; // will be gated by the hook checking document focus
  }, []);
  useWindowKeyboardScroll(scrollBodyRef, win.id);

  // Detect coarse pointer (touch) once
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Focus pulse helper
  const triggerFocusPulse = useCallback(() => {
    setFocusPulse(true);
    hapticTap();
    const t = setTimeout(() => setFocusPulse(false), 200);
    return () => clearTimeout(t);
  }, []);

  // Sync refs when external state changes (e.g. snap, cascade)
  useEffect(() => {
    if (!draggingRef.current && !resizingRef.current) {
      posRef.current = { x: win.position.x, y: win.position.y };
      sizeRef.current = { w: win.size.width, h: win.size.height };
    }
  }, [win.position.x, win.position.y, win.size.width, win.size.height]);

  // ── Viewport clamping ─────────────────────────────────────
  const clampPos = useCallback((x: number, y: number, w: number) => {
    const vw = globalThis.innerWidth;
    return {
      x: Math.max(-w + 120, Math.min(x, vw - 120)),
      y: Math.max(MENU_BAR_HEIGHT, Math.min(y, globalThis.innerHeight - 40)),
    };
  }, []);

  // ── DRAG (title bar) ──────────────────────────────────────
  const onDragPointerDown = useCallback((e: React.PointerEvent) => {
    if (win.isMaximized || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = { px: e.clientX, py: e.clientY, ox: posRef.current.x, oy: posRef.current.y };
    draggingRef.current = true;
    setIsDragging(true);
    saveScroll();
    focusWindow(win.id);
  }, [win.isMaximized, win.id, focusWindow, saveScroll]);

  const onDragPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.px;
    const dy = e.clientY - dragStartRef.current.py;
    const next = clampPos(dragStartRef.current.ox + dx, dragStartRef.current.oy + dy, sizeRef.current.w);
    posRef.current = next;
    snap.onDragMove(e.clientX, e.clientY);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${next.x - win.position.x}px, ${next.y - win.position.y}px, 0)`;
      }
    });
  }, [clampPos, win.position.x, win.position.y, snap]);

  const onDragPointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    cancelAnimationFrame(rafRef.current);
    if (elRef.current) elRef.current.style.transform = "";

    const snapResult = snap.onDragEnd(e.clientX, e.clientY);
    if (snapResult) {
      posRef.current = { x: snapResult.x, y: snapResult.y };
      sizeRef.current = { w: snapResult.width, h: snapResult.height };
      updateWindowGeometry(win.id, posRef.current, { width: snapResult.width, height: snapResult.height });
    } else {
      updateWindowPosition(win.id, posRef.current);
    }
    restoreScroll();
  }, [win.id, updateWindowPosition, updateWindowGeometry, snap, restoreScroll]);

  // ── RESIZE (edge/corner handles) ──────────────────────────
  const onResizePointerDown = useCallback((edge: ResizeEdge, e: React.PointerEvent) => {
    if (win.isMaximized || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeStartRef.current = {
      px: e.clientX, py: e.clientY,
      ox: posRef.current.x, oy: posRef.current.y,
      ow: sizeRef.current.w, oh: sizeRef.current.h,
      edge,
    };
    resizingRef.current = true;
    setIsResizing(true);
    setActiveEdge(edge);
    saveScroll();
    focusWindow(win.id);
  }, [win.isMaximized, win.id, focusWindow, saveScroll]);

  const onResizePointerMove = useCallback((e: React.PointerEvent) => {
    if (!resizingRef.current) return;
    const { px, py, ox, oy, ow, oh, edge } = resizeStartRef.current;
    const dx = e.clientX - px;
    const dy = e.clientY - py;

    let nx = ox, ny = oy, nw = ow, nh = oh;

    if (edge.includes("e")) nw = Math.max(MIN_WIDTH, ow + dx);
    if (edge.includes("s")) nh = Math.max(MIN_HEIGHT, oh + dy);
    if (edge.includes("w")) { nw = Math.max(MIN_WIDTH, ow - dx); nx = ox + (ow - nw); }
    if (edge.includes("n")) { nh = Math.max(MIN_HEIGHT, oh - dy); ny = oy + (oh - nh); }

    posRef.current = { x: nx, y: Math.max(MENU_BAR_HEIGHT, ny) };
    sizeRef.current = { w: nw, h: nh };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (elRef.current) {
        elRef.current.style.left = `${posRef.current.x}px`;
        elRef.current.style.top = `${posRef.current.y}px`;
        elRef.current.style.width = `${sizeRef.current.w}px`;
        elRef.current.style.height = `${sizeRef.current.h}px`;
      }
    });
  }, []);

  const onResizePointerUp = useCallback((e: React.PointerEvent) => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    setIsResizing(false);
    setActiveEdge(null);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    cancelAnimationFrame(rafRef.current);
    updateWindowGeometry(win.id, posRef.current, { width: sizeRef.current.w, height: sizeRef.current.h });
    restoreScroll();
  }, [win.id, updateWindowGeometry, restoreScroll]);

  // ── Re-clamp on viewport resize ───────────────────────────
  useEffect(() => {
    const handler = () => {
      if (win.isMaximized || draggingRef.current || resizingRef.current) return;
      const next = clampPos(posRef.current.x, posRef.current.y, sizeRef.current.w);
      if (next.x !== posRef.current.x || next.y !== posRef.current.y) {
        posRef.current = next;
        updateWindowPosition(win.id, next);
      }
    };
    globalThis.addEventListener("resize", handler);
    return () => globalThis.removeEventListener("resize", handler);
  }, [clampPos, win.id, win.isMaximized, updateWindowPosition]);

  // ── Minimize animation ────────────────────────────────────
  const handleMinimize = useCallback(() => {
    hapticHeavy();
    setMinimizeAnim("out");
    setTimeout(() => {
      minimizeWindow(win.id);
      setMinimizeAnim("idle");
    }, 250);
  }, [win.id, minimizeWindow]);

  // ── Resize handle component ───────────────────────────────
  const ResizeHandle = useCallback(({ edge }: { edge: ResizeEdge }) => {
    const isCorner = edge.length === 2;
    const handleSize = isTouch ? TOUCH_RESIZE_HANDLE_SIZE : RESIZE_HANDLE_SIZE;
    const sz = isCorner ? handleSize * 2.5 : handleSize;

    const style: React.CSSProperties = {
      position: "absolute",
      cursor: EDGE_CURSORS[edge],
      zIndex: 10,
    };

    // Position the handle
    if (edge === "n")  Object.assign(style, { top: 0, left: sz, right: sz, height: handleSize });
    if (edge === "s")  Object.assign(style, { bottom: 0, left: sz, right: sz, height: handleSize });
    if (edge === "e")  Object.assign(style, { right: 0, top: sz, bottom: sz, width: handleSize });
    if (edge === "w")  Object.assign(style, { left: 0, top: sz, bottom: sz, width: handleSize });
    if (edge === "nw") Object.assign(style, { top: 0, left: 0, width: sz, height: sz });
    if (edge === "ne") Object.assign(style, { top: 0, right: 0, width: sz, height: sz });
    if (edge === "sw") Object.assign(style, { bottom: 0, left: 0, width: sz, height: sz });
    if (edge === "se") Object.assign(style, { bottom: 0, right: 0, width: sz, height: sz });

    const isActive = activeEdge === edge;

    return (
      <div
        style={style}
        className="group/handle"
        onPointerDown={(e) => onResizePointerDown(edge, e)}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
      >
        {/* Visual feedback indicator */}
        {isCorner ? (
          <div
            className={cn(
              "absolute rounded-full transition-all duration-150",
              "w-1.5 h-1.5",
              edge === "nw" && "top-0.5 left-0.5",
              edge === "ne" && "top-0.5 right-0.5",
              edge === "sw" && "bottom-0.5 left-0.5",
              edge === "se" && "bottom-0.5 right-0.5",
              isActive
                ? "bg-primary/60 scale-150"
                : "bg-transparent group-hover/handle:bg-primary/40"
            )}
          />
        ) : (
          <div
            className={cn(
              "absolute transition-all duration-150",
              (edge === "n" || edge === "s")
                ? "left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                : "top-1/2 -translate-y-1/2 h-8 w-0.5 rounded-full",
              edge === "n" && "top-0",
              edge === "s" && "bottom-0",
              edge === "e" && "right-0",
              edge === "w" && "left-0",
              isActive
                ? "bg-primary/60"
                : "bg-transparent group-hover/handle:bg-primary/40"
            )}
          />
        )}
      </div>
    );
  }, [onResizePointerDown, onResizePointerMove, onResizePointerUp, isTouch, activeEdge]);

  // ── Traffic light button ──────────────────────────────────
  const TrafficLight = useMemo(() => {
    return function TL({ color, hoverColor, icon: Icon, onClick, label }: {
      color: string; hoverColor: string; icon: React.ElementType; onClick: () => void; label: string;
    }) {
      return (
        <button
          aria-label={label}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className={cn(
            "w-3 h-3 rounded-full flex items-center justify-center transition-all duration-100",
            "group/btn", color
          )}
        >
          <Icon size={8} strokeWidth={2.5} className={cn("opacity-0 group-hover/btn:opacity-100 transition-opacity", hoverColor)} />
        </button>
      );
    };
  }, []);

  // ── Compute animated style ────────────────────────────────
  const windowStyle: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = {
      zIndex: win.isPinned ? 9000 + win.zIndex : win.zIndex,
      willChange: isDragging || isResizing ? "transform, left, top, width, height" : "auto",
      transition: isDragging || isResizing ? "none" : "left 0.3s cubic-bezier(0.22,1,0.36,1), top 0.3s cubic-bezier(0.22,1,0.36,1), width 0.3s cubic-bezier(0.22,1,0.36,1), height 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease",
    };

    if (minimizeAnim === "out") {
      return {
        ...base,
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        transform: "scale(0.5) translateY(60vh)",
        opacity: 0,
        transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease",
        pointerEvents: "none" as const,
      };
    }

    if (win.isMaximized) {
      return {
        ...base,
        left: 0,
        top: MENU_BAR_HEIGHT,
        width: "100vw",
        height: `calc(100vh - ${MENU_BAR_HEIGHT}px)`,
      };
    }

    return {
      ...base,
      left: win.position.x,
      top: win.position.y,
      width: win.size.width,
      height: win.size.height,
    };
  }, [win, isDragging, isResizing, minimizeAnim]);

  return (
    <div
      ref={elRef}
      key={win.id}
      className={cn(
        "absolute flex flex-col overflow-hidden pointer-events-auto",
        "rounded-xl border border-white/[0.08]",
        "bg-background/80 backdrop-blur-xl",
        "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_20px_40px_hsl(0_0%_0%/0.18)]",
        minimizeAnim === "idle" && "animate-in fade-in zoom-in-95 duration-150",
        win.isMaximized && "!rounded-none",
        (isDragging || isResizing) && "os-window-interacting",
        "os-window-focused transition-shadow duration-200",
        focusPulse && "ring-2 ring-primary/30",
      )}
      style={windowStyle}
      onMouseDown={() => { focusWindow(win.id); triggerFocusPulse(); }}
    >
      {/* ── Resize handles (hidden when maximized) ─────────── */}
      {!win.isMaximized && (
        <>
          <ResizeHandle edge="n" />
          <ResizeHandle edge="s" />
          <ResizeHandle edge="e" />
          <ResizeHandle edge="w" />
          <ResizeHandle edge="nw" />
          <ResizeHandle edge="ne" />
          <ResizeHandle edge="sw" />
          <ResizeHandle edge="se" />
        </>
      )}

      {/* ── Title bar ──────────────────────────────────────── */}
      <SurfaceContextMenu surface="app-window" window={win}>
        <div
          className={cn(
            "flex items-center h-10 px-3 gap-2 select-none shrink-0 touch-none",
            "border-b border-white/[0.06]",
            "bg-background/40",
            !win.isMaximized && "cursor-grab",
            isDragging && "cursor-grabbing"
          )}
          onPointerDown={onDragPointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
          onPointerCancel={onDragPointerUp}
          onDoubleClick={() => maximizeWindow(win.id)}
        >
          <div className="flex items-center gap-1.5 group">
            <TrafficLight color="bg-[hsl(0_72%_51%)]" hoverColor="text-[hsl(0_0%_15%)]" icon={X} onClick={() => closeWindow(win.id)} label="Close" />
            <TrafficLight color="bg-[hsl(45_93%_47%)]" hoverColor="text-[hsl(0_0%_15%)]" icon={Minus} onClick={handleMinimize} label="Minimize" />
            <TrafficLight color="bg-[hsl(142_71%_45%)]" hoverColor="text-[hsl(0_0%_15%)]" icon={win.isMaximized ? Square : Maximize2} onClick={() => maximizeWindow(win.id)} label="Maximize" />
          </div>
          <span className="flex-1 text-center text-[13px] font-medium text-foreground/70 truncate pointer-events-none">
            {win.title}
            {win.isPinned && <span className="ml-2 text-[10px] text-primary">📌</span>}
          </span>
          <div className="w-[52px]" />
        </div>
      </SurfaceContextMenu>

      {/* ── Window body ────────────────────────────────────── */}
      <div
        ref={scrollBodyRef}
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden",
          "os-window-scrollable",
          (isDragging || isResizing) && "pointer-events-none select-none"
        )}
        onContextMenu={(e) => e.stopPropagation()}
      >
        {win.component}
      </div>

      {/* Snap guide overlay */}
      {isDragging && <SnapGuideOverlay guide={snap.snapGuide} />}
    </div>
  );
}
