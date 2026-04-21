import React, { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DemoAppId } from "./demo-data";

export interface DemoWindow {
  id: string;
  appId: DemoAppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

/* Dock rect for minimize-to-dock animation target */
export interface DockRect { x: number; y: number; w: number; h: number }

interface Props {
  windows: DemoWindow[];
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  renderContent: (appId: DemoAppId) => React.ReactNode;
  dockRect?: DockRect | null;
}

export function DemoWindowManager({ windows, onClose, onFocus, onMinimize, onMaximize, renderContent, dockRect }: Props) {
  return (
    <AnimatePresence>
      {windows.filter((w) => !w.minimized).map((win) => (
        <DemoFloatingWindow key={win.id} win={win} onClose={onClose}
          onFocus={onFocus} onMinimize={onMinimize} onMaximize={onMaximize}
          dockRect={dockRect}>
          {renderContent(win.appId)}
        </DemoFloatingWindow>
      ))}
    </AnimatePresence>
  );
}

/* ---------- Resize handle ---------- */
type ResizeDir = "e" | "s" | "se";
const RESIZE_CURSORS: Record<ResizeDir, string> = { e: "ew-resize", s: "ns-resize", se: "nwse-resize" };
const MIN_W = 320;
const MIN_H = 200;

function ResizeHandle({ dir, onResizeStart }: { dir: ResizeDir; onResizeStart: (dir: ResizeDir, e: React.PointerEvent) => void }) {
  const isCorner = dir === "se";
  return (
    <div
      onPointerDown={(e) => { e.stopPropagation(); onResizeStart(dir, e); }}
      className="absolute touch-none"
      style={{
        cursor: RESIZE_CURSORS[dir],
        ...(dir === "e" ? { right: -4, top: 10, bottom: 10, width: 12 } : {}),
        ...(dir === "s" ? { bottom: -4, left: 10, right: 10, height: 12 } : {}),
        ...(isCorner ? { right: -4, bottom: -4, width: 20, height: 20 } : {}),
      }}
    >
      {isCorner && (
        <svg width="10" height="10" className="absolute bottom-1 right-1 text-white/20">
          <line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" strokeWidth="1" />
          <line x1="4" y1="10" x2="10" y2="4" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}

/* ---------- Floating Window ---------- */
function DemoFloatingWindow({ win, onClose, onFocus, onMinimize, onMaximize, children, dockRect }: {
  win: DemoWindow; children: React.ReactNode; dockRect?: DockRect | null;
  onClose: (id: string) => void; onFocus: (id: string) => void;
  onMinimize: (id: string) => void; onMaximize: (id: string) => void;
}) {
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const [size, setSize] = useState({ w: win.w, h: win.h });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const inertiaRaf = useRef<number>(0);

  /* --- Unified pointer drag (mouse + touch) --- */
  const startDrag = useCallback((clientX: number, clientY: number) => {
    dragging.current = true;
    offset.current = { x: clientX - pos.x, y: clientY - pos.y };
    lastPointer.current = { x: clientX, y: clientY, t: Date.now() };
    velocity.current = { x: 0, y: 0 };
    cancelAnimationFrame(inertiaRaf.current);
    onFocus(win.id);
  }, [pos, win.id, onFocus]);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current) return;
    const now = Date.now();
    const dt = Math.max(now - lastPointer.current.t, 1);
    velocity.current = {
      x: (clientX - lastPointer.current.x) / dt * 16,
      y: (clientY - lastPointer.current.y) / dt * 16,
    };
    lastPointer.current = { x: clientX, y: clientY, t: now };
    setPos({ x: clientX - offset.current.x, y: clientY - offset.current.y });
  }, []);

  const endDrag = useCallback(() => {
    dragging.current = false;
    // Inertia
    const vx = velocity.current.x;
    const vy = velocity.current.y;
    if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
      let cvx = vx;
      let cvy = vy;
      const decay = 0.92;
      const step = () => {
        cvx *= decay;
        cvy *= decay;
        if (Math.abs(cvx) < 0.1 && Math.abs(cvy) < 0.1) return;
        setPos((p) => ({ x: p.x + cvx, y: p.y + cvy }));
        inertiaRaf.current = requestAnimationFrame(step);
      };
      inertiaRaf.current = requestAnimationFrame(step);
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startDrag(e.clientX, e.clientY);
  }, [startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    moveDrag(e.clientX, e.clientY);
  }, [moveDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    endDrag();
  }, [endDrag]);

  /* --- Resize --- */
  const resizeStart = useRef<{ dir: ResizeDir; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const onResizeStart = useCallback((dir: ResizeDir, e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeStart.current = { dir, startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };
    onFocus(win.id);

    const onMove = (ev: PointerEvent) => {
      if (!resizeStart.current) return;
      const rs = resizeStart.current;
      const dx = ev.clientX - rs.startX;
      const dy = ev.clientY - rs.startY;
      setSize({
        w: Math.max(MIN_W, rs.dir !== "s" ? rs.startW + dx : rs.startW),
        h: Math.max(MIN_H, rs.dir !== "e" ? rs.startH + dy : rs.startH),
      });
    };
    const onUp = () => {
      resizeStart.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [size, win.id, onFocus]);

  // Cleanup inertia on unmount
  useEffect(() => () => cancelAnimationFrame(inertiaRaf.current), []);

  const isMax = win.maximized;

  /* Minimize-to-dock exit target */
  const dockTarget = dockRect
    ? { x: dockRect.x + dockRect.w / 2 - size.w / 2, y: dockRect.y, scale: 0.05 }
    : { x: pos.x, y: pos.y + 100, scale: 0.85 };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        zIndex: win.z,
      }}
      exit={{
        scale: dockTarget.scale,
        opacity: 0,
        x: dockTarget.x - pos.x,
        y: dockTarget.y - pos.y,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 28,
        zIndex: { duration: 0.15 },
      }}
      className="absolute will-change-transform"
      style={{
        left: isMax ? 0 : pos.x,
        top: isMax ? 28 : pos.y,
        width: isMax ? "100%" : size.w,
        height: isMax ? "calc(100% - 28px - 72px)" : size.h,
        zIndex: win.z,
      }}
      onPointerDown={() => onFocus(win.id)}
    >
      <div className="w-full h-full rounded-xl overflow-hidden border border-white/[0.12] shadow-2xl flex flex-col"
        style={{
          background: "linear-gradient(180deg, rgba(22,22,32,0.92), rgba(16,16,24,0.88))",
          backdropFilter: "blur(50px) saturate(1.4)",
          WebkitBackdropFilter: "blur(50px) saturate(1.4)",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5), 0 0 1px 0 rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.06)",
        }}>
        {/* Title bar — touch-friendly 44px hit target */}
        <div
          className="h-11 shrink-0 flex items-center px-3 gap-2 border-b border-white/[0.06] cursor-grab select-none touch-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex gap-2">
            <button onClick={() => onClose(win.id)} className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all active:scale-90 shadow-[0_0_4px_rgba(255,95,87,0.3)]" />
            <button onClick={() => onMinimize(win.id)} className="w-3.5 h-3.5 rounded-full bg-[#febc2e] hover:brightness-110 transition-all active:scale-90 shadow-[0_0_4px_rgba(254,188,46,0.3)]" />
            <button onClick={() => onMaximize(win.id)} className="w-3.5 h-3.5 rounded-full bg-[#28c840] hover:brightness-110 transition-all active:scale-90 shadow-[0_0_4px_rgba(40,200,64,0.3)]" />
          </div>
          <span className="flex-1 text-center text-[11px] text-white/50 font-semibold tracking-wide truncate">{win.title}</span>
          <div className="w-14" />
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto overscroll-contain">{children}</div>
      </div>
      {/* Resize handles */}
      {!isMax && (
        <>
          <ResizeHandle dir="e" onResizeStart={onResizeStart} />
          <ResizeHandle dir="s" onResizeStart={onResizeStart} />
          <ResizeHandle dir="se" onResizeStart={onResizeStart} />
        </>
      )}
    </motion.div>
  );
}