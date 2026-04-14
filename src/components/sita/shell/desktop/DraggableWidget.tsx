import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  id: string;
  position: { x: number; y: number };
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  dragConstraints?: React.RefObject<HTMLDivElement | null>;
}

export function DraggableWidget({ id, position, onMove, onRemove, children, className, dragConstraints }: DraggableWidgetProps) {
  const [dragging, setDragging] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: position.x, y: position.y });
  const startRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
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

  // Initial position
  useEffect(() => { applyTransform(); }, [applyTransform]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { px: e.clientX, py: e.clientY, ox: posRef.current.x, oy: posRef.current.y };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.px;
    const dy = e.clientY - startRef.current.py;
    let nx = startRef.current.ox + dx;
    let ny = startRef.current.oy + dy;

    // Constrain to parent bounds
    if (dragConstraints?.current && elRef.current) {
      const parent = dragConstraints.current.getBoundingClientRect();
      const el = elRef.current.getBoundingClientRect();
      const w = el.width;
      const h = el.height;
      nx = Math.max(0, Math.min(nx, parent.width - w));
      ny = Math.max(0, Math.min(ny, parent.height - h));
    }

    posRef.current = { x: nx, y: ny };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }, [dragging, dragConstraints, applyTransform]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
    onMove(id, posRef.current.x, posRef.current.y);
  }, [dragging, id, onMove]);

  return (
    <div
      ref={elRef}
      style={{ position: "absolute", left: 0, top: 0, willChange: "transform" }}
      className={cn(
        "group transition-shadow duration-200",
        dragging && "z-50 shadow-[0_0_30px_rgba(114,92,255,0.3)]",
        className
      )}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-5 flex items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.1] opacity-60 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing touch-none select-none"
        title="Drag to move"
      >
        <GripHorizontal className="h-3.5 w-3.5 text-white/60 group-hover:text-white/80 pointer-events-none" />
      </div>
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        className={cn(
          "absolute -top-2.5 -right-2.5 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 border border-white/[0.15] text-white/40 hover:text-white hover:bg-red-500/90 hover:border-red-400/50 transition-all shadow-lg",
          dragging ? "opacity-0 pointer-events-none" : "opacity-60 group-hover:opacity-100 scale-100"
        )}
        title="Remove widget"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {/* Content — clicks don't trigger drag */}
      <div onPointerDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
