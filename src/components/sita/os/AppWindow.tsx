import React, { useRef, useCallback, useState, useEffect } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOSWindowContext, type OSWindow } from "./WindowContext";
import { SurfaceContextMenu } from "@/components/sita/shell/SurfaceContextMenu";

// ═══════════════════════════════════════════════════════════════
// SITA OS — App Window
// Premium glassmorphic draggable window with traffic-light controls
//
// Performance model (matches DraggableWidget):
//   • During drag we mutate a ref + apply translate3d directly via rAF
//     — NO React state churn → buttery smooth 60fps.
//   • State is committed once on pointerup so memory/persistence stays in sync.
// ═══════════════════════════════════════════════════════════════

// Viewport reserved space
const MENU_BAR_HEIGHT = 28; // SystemMenuBar h-7
const DOCK_RESERVED = 0;    // Dock auto-hides — no need to reserve

interface AppWindowProps {
  window: OSWindow;
}

export function AppWindow({ window: win }: AppWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition } =
    useOSWindowContext();

  const elRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: win.position.x, y: win.position.y });
  const startRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
  const draggingRef = useRef(false);
  const rafRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Keep ref in sync when external changes (e.g. cascade) come through
  useEffect(() => {
    if (!draggingRef.current) {
      posRef.current = { x: win.position.x, y: win.position.y };
    }
  }, [win.position.x, win.position.y]);

  const clampToViewport = useCallback((x: number, y: number) => {
    const w = win.size.width;
    const h = win.size.height;
    const maxX = Math.max(0, globalThis.innerWidth - w);
    const maxY = Math.max(MENU_BAR_HEIGHT, globalThis.innerHeight - DOCK_RESERVED - 40);
    return {
      x: Math.max(0, Math.min(x, maxX)),
      // allow dragging up to just under the menu bar
      y: Math.max(MENU_BAR_HEIGHT, Math.min(y, maxY)),
    };
  }, [win.size.width, win.size.height]);

  // ── Pointer-based drag (header only, GPU accelerated) ────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (win.isMaximized) return;
      if (e.button !== 0) return;
      // Don't start drag if clicking interactive child (traffic lights)
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      startRef.current = {
        px: e.clientX,
        py: e.clientY,
        ox: posRef.current.x,
        oy: posRef.current.y,
      };
      draggingRef.current = true;
      setIsDragging(true);
      focusWindow(win.id);
    },
    [win.isMaximized, win.id, focusWindow]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startRef.current.px;
      const dy = e.clientY - startRef.current.py;
      const next = clampToViewport(startRef.current.ox + dx, startRef.current.oy + dy);
      posRef.current = next;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (elRef.current) {
          // Override left/top with translate during drag for instant updates
          elRef.current.style.transform = `translate3d(${next.x - win.position.x}px, ${next.y - win.position.y}px, 0)`;
        }
      });
    },
    [clampToViewport, win.position.x, win.position.y]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
      cancelAnimationFrame(rafRef.current);

      // Reset transform offset and commit position to state
      if (elRef.current) elRef.current.style.transform = "";
      updateWindowPosition(win.id, posRef.current);
    },
    [win.id, updateWindowPosition]
  );

  // ── Re-clamp on viewport resize ──────────────────────────
  useEffect(() => {
    const handler = () => {
      if (win.isMaximized) return;
      const next = clampToViewport(posRef.current.x, posRef.current.y);
      if (next.x !== posRef.current.x || next.y !== posRef.current.y) {
        posRef.current = next;
        updateWindowPosition(win.id, next);
      }
    };
    globalThis.addEventListener("resize", handler);
    return () => globalThis.removeEventListener("resize", handler);
  }, [clampToViewport, win.id, win.isMaximized, updateWindowPosition]);

  // ── Traffic light button ──────────────────────────────────
  const TrafficLight = ({
    color,
    hoverColor,
    icon: Icon,
    onClick,
    label,
  }: {
    color: string;
    hoverColor: string;
    icon: React.ElementType;
    onClick: () => void;
    label: string;
  }) => (
    <button
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-3 h-3 rounded-full flex items-center justify-center transition-all duration-100",
        "group/btn",
        color
      )}
    >
      <Icon
        size={8}
        strokeWidth={2.5}
        className={cn(
          "opacity-0 group-hover/btn:opacity-100 transition-opacity",
          hoverColor
        )}
      />
    </button>
  );

  return (
    <div
      ref={elRef}
      key={win.id}
      className={cn(
        "absolute flex flex-col overflow-hidden pointer-events-auto",
        "rounded-xl border border-white/[0.08]",
        "bg-background/80 backdrop-blur-xl",
        "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_20px_40px_hsl(0_0%_0%/0.18)]",
        "animate-in fade-in zoom-in-95 duration-150",
        win.isMaximized && "!rounded-none"
      )}
      style={{
        zIndex: win.isPinned ? 9000 + win.zIndex : win.zIndex,
        willChange: isDragging ? "transform" : "auto",
        ...(win.isMaximized
          ? {
              left: 0,
              top: MENU_BAR_HEIGHT,
              width: "100vw",
              height: `calc(100vh - ${MENU_BAR_HEIGHT}px)`,
            }
          : {
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
            }),
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* ── Title bar (right-click → window menu) ──────────── */}
      <SurfaceContextMenu surface="app-window" window={win}>
        <div
          className={cn(
            "flex items-center h-10 px-3 gap-2 select-none shrink-0 touch-none",
            "border-b border-white/[0.06]",
            "bg-background/40",
            !win.isMaximized && "cursor-grab",
            isDragging && "cursor-grabbing"
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={() => maximizeWindow(win.id)}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 group">
            <TrafficLight
              color="bg-[hsl(0_72%_51%)]"
              hoverColor="text-[hsl(0_0%_15%)]"
              icon={X}
              onClick={() => closeWindow(win.id)}
              label="Close"
            />
            <TrafficLight
              color="bg-[hsl(45_93%_47%)]"
              hoverColor="text-[hsl(0_0%_15%)]"
              icon={Minus}
              onClick={() => minimizeWindow(win.id)}
              label="Minimize"
            />
            <TrafficLight
              color="bg-[hsl(142_71%_45%)]"
              hoverColor="text-[hsl(0_0%_15%)]"
              icon={win.isMaximized ? Square : Maximize2}
              onClick={() => maximizeWindow(win.id)}
              label="Maximize"
            />
          </div>

          {/* Title */}
          <span className="flex-1 text-center text-[13px] font-medium text-foreground/70 truncate pointer-events-none">
            {win.title}
            {win.isPinned && <span className="ml-2 text-[10px] text-primary">📌</span>}
          </span>

          {/* Spacer to balance traffic lights */}
          <div className="w-[52px]" />
        </div>
      </SurfaceContextMenu>

      {/* ── Window body (stops ctx propagation so desktop menu doesn't open) ── */}
      <div
        className="flex-1 overflow-y-auto"
        onContextMenu={(e) => e.stopPropagation()}
      >
        {win.component}
      </div>
    </div>
  );
}
