import { useState, useCallback, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SurfaceContextMenu } from "@/platform/sita/components/sita/shell/SurfaceContextMenu";

interface DraggableWidgetProps {
  id: string;
  position: { x: number; y: number };
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  dragConstraints?: React.RefObject<HTMLDivElement | null>;
}

const DRAG_THRESHOLD = 5; // px before a press becomes a drag

export function DraggableWidget({ id, position, onMove, onRemove, children, className, dragConstraints }: DraggableWidgetProps) {
  const [dragging, setDragging] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: position.x, y: position.y });
  const startRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
  const draggingRef = useRef(false);
  const passedThresholdRef = useRef(false);
  const rafRef = useRef(0);

  // Sync prop position into ref when not dragging
  useEffect(() => {
    if (!dragging) {
      posRef.current = { x: position.x, y: position.y };
    }
  }, [position.x, position.y, dragging]);

  const applyTransform = useCallback(() => {
    if (elRef.current) {
      elRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
    }
  }, []);

  // Clamp position to dragConstraints bounds; returns true if changed.
  const clampToBounds = useCallback(() => {
    if (!dragConstraints?.current || !elRef.current) return false;
    const parent = dragConstraints.current.getBoundingClientRect();
    const el = elRef.current.getBoundingClientRect();
    const w = el.width;
    const h = el.height;
    const nx = Math.max(0, Math.min(posRef.current.x, Math.max(0, parent.width - w)));
    const ny = Math.max(0, Math.min(posRef.current.y, Math.max(0, parent.height - h)));
    if (nx !== posRef.current.x || ny !== posRef.current.y) {
      posRef.current = { x: nx, y: ny };
      return true;
    }
    return false;
  }, [dragConstraints]);

  // Initial position + clamp on mount
  useEffect(() => {
    applyTransform();
    // After layout settles, clamp into desktop bounds
    const t = requestAnimationFrame(() => {
      if (clampToBounds()) {
        applyTransform();
        onMove(id, posRef.current.x, posRef.current.y);
      }
    });
    return () => cancelAnimationFrame(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-clamp on viewport resize
  useEffect(() => {
    const handler = () => {
      if (clampToBounds()) {
        applyTransform();
        onMove(id, posRef.current.x, posRef.current.y);
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [clampToBounds, applyTransform, id, onMove]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore non-primary buttons
    if (e.button !== 0) return;
    startRef.current = {
      px: e.clientX,
      py: e.clientY,
      ox: posRef.current.x,
      oy: posRef.current.y,
    };
    draggingRef.current = true;
    passedThresholdRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.px;
    const dy = e.clientY - startRef.current.py;

    if (!passedThresholdRef.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      passedThresholdRef.current = true;
      setDragging(true);
    }

    let nx = startRef.current.ox + dx;
    let ny = startRef.current.oy + dy;

    if (dragConstraints?.current && elRef.current) {
      const parent = dragConstraints.current.getBoundingClientRect();
      const el = elRef.current.getBoundingClientRect();
      nx = Math.max(0, Math.min(nx, Math.max(0, parent.width - el.width)));
      ny = Math.max(0, Math.min(ny, Math.max(0, parent.height - el.height)));
    }

    posRef.current = { x: nx, y: ny };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }, [dragConstraints, applyTransform]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const wasDragging = passedThresholdRef.current;
    draggingRef.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    if (wasDragging) {
      setDragging(false);
      onMove(id, posRef.current.x, posRef.current.y);
    }
    passedThresholdRef.current = false;
  }, [id, onMove]);

  // Suppress synthetic click after drag so child icons don't fire
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (passedThresholdRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  return (
    <div
      ref={elRef}
      style={{ position: "absolute", left: 0, top: 0, willChange: "transform" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      onContextMenu={(e) => e.stopPropagation()}
      className={cn(
        "group transition-shadow duration-200 touch-none select-none cursor-grab active:cursor-grabbing",
        dragging && "z-50 shadow-[0_0_30px_rgba(114,92,255,0.3)]",
        className
      )}
    >
      <SurfaceContextMenu surface="widget" widgetId={id}>
        <div className="relative">
          {/* Remove button — stops propagation so it never starts a drag */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            className={cn(
              "absolute -top-2.5 -right-2.5 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 border border-white/[0.15] text-white/40 hover:text-white hover:bg-red-500/90 hover:border-red-400/50 transition-all shadow-lg",
              dragging ? "opacity-0 pointer-events-none" : "opacity-60 group-hover:opacity-100 scale-100"
            )}
            title="Remove widget"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {children}
        </div>
      </SurfaceContextMenu>
    </div>
  );
}
