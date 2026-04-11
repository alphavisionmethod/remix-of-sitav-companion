// ═══════════════════════════════════════════════════════════════
// SITA OS — Floating Window (NovaOS composited surface)
// Draggable glassmorphic window with traffic-light controls + snap + resize
// Mac-level smooth dragging with lerp interpolation + inertia
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS, TRAFFIC_LIGHTS, NOVA_MOTION, NOVA_SHADOWS } from "@/lib/design-system/nova-os";
import { detectSnapZone, getSnapRect, SNAP_CONFIG, type SnapZone } from "@/lib/design-system/snap-zones";
import { lerpPosition, type DragState } from "@/lib/engine/compositor-sim";

interface FloatingWindowProps {
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  width?: number;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  isFocused?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const DRAG_SMOOTHING = 0.25;
const INERTIA_FRICTION = 0.92;
const INERTIA_THRESHOLD = 0.5;

export function FloatingWindow({
  title,
  children,
  initialPosition = { x: 120, y: 80 },
  width = 500,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  isFocused = true,
  className,
  style,
}: FloatingWindowProps) {
  const [pos, setPos] = useState(initialPosition);
  const [size, setSize] = useState({ width, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const [snappedTo, setSnappedTo] = useState<SnapZone>(null);
  const [preSnapState, setPreSnapState] = useState<{ x: number; y: number; width: number } | null>(null);

  const dragRef = useRef<DragState>({
    active: false,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
  });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef(initialPosition);
  const lastPointer = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Lerp animation loop during drag
  useEffect(() => {
    if (!isDragging) return;

    const animate = () => {
      const nx = lerpPosition(currentPos.current.x, targetPos.current.x, DRAG_SMOOTHING);
      const ny = lerpPosition(currentPos.current.y, targetPos.current.y, DRAG_SMOOTHING);

      // Track velocity as delta per frame
      dragRef.current.velocityX = nx - currentPos.current.x;
      dragRef.current.velocityY = ny - currentPos.current.y;

      currentPos.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [isDragging]);

  // Inertia animation after release
  const runInertia = useCallback(() => {
    const ds = dragRef.current;

    const animate = () => {
      ds.velocityX *= INERTIA_FRICTION;
      ds.velocityY *= INERTIA_FRICTION;

      if (Math.abs(ds.velocityX) < INERTIA_THRESHOLD && Math.abs(ds.velocityY) < INERTIA_THRESHOLD) {
        return;
      }

      currentPos.current.x += ds.velocityX;
      currentPos.current.y += ds.velocityY;

      // Boundary clamp
      currentPos.current.x = Math.max(0, Math.min(window.innerWidth - 100, currentPos.current.x));
      currentPos.current.y = Math.max(0, Math.min(window.innerHeight - 50, currentPos.current.y));

      setPos({ ...currentPos.current });
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onFocus?.();
    cancelAnimationFrame(rafId.current);

    dragRef.current.active = true;
    dragRef.current.offsetX = e.clientX - currentPos.current.x;
    dragRef.current.offsetY = e.clientY - currentPos.current.y;
    dragRef.current.velocityX = 0;
    dragRef.current.velocityY = 0;

    lastPointer.current = { x: e.clientX, y: e.clientY };
    targetPos.current = { ...currentPos.current };

    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (snappedTo) {
      setSnappedTo(null);
      if (preSnapState) {
        dragRef.current.offsetX = preSnapState.width / 2;
        dragRef.current.offsetY = 20;
        const newX = e.clientX - preSnapState.width / 2;
        currentPos.current = { x: newX, y: e.clientY - 20 };
        targetPos.current = { ...currentPos.current };
        setSize({ width: preSnapState.width, height: 0 });
      }
    }
  }, [onFocus, snappedTo, preSnapState]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    // Update target (lerp loop will smoothly follow)
    targetPos.current = {
      x: e.clientX - dragRef.current.offsetX,
      y: e.clientY - dragRef.current.offsetY,
    };
    lastPointer.current = { x: e.clientX, y: e.clientY };

    const zone = detectSnapZone(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
    setSnapZone(zone);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current.active = false;
    cancelAnimationFrame(rafId.current);

    if (snapZone) {
      setPreSnapState({ x: currentPos.current.x, y: currentPos.current.y, width: size.width });
      const rect = getSnapRect(snapZone, window.innerWidth, window.innerHeight);
      currentPos.current = { x: rect.x, y: rect.y };
      setPos({ x: rect.x, y: rect.y });
      setSize({ width: rect.width, height: rect.height });
      setSnappedTo(snapZone);
    } else {
      // Apply inertia
      runInertia();
    }
    setSnapZone(null);
  }, [snapZone, size.width, runInertia]);

  const handleDoubleClickTitle = useCallback(() => {
    if (snappedTo) {
      if (preSnapState) {
        currentPos.current = { x: preSnapState.x, y: preSnapState.y };
        setPos({ x: preSnapState.x, y: preSnapState.y });
        setSize({ width: preSnapState.width, height: 0 });
      }
      setSnappedTo(null);
      setPreSnapState(null);
    } else {
      const rect = getSnapRect("top", window.innerWidth, window.innerHeight);
      setPreSnapState({ x: pos.x, y: pos.y, width: size.width });
      currentPos.current = { x: rect.x, y: rect.y };
      setPos({ x: rect.x, y: rect.y });
      setSize({ width: rect.width, height: rect.height });
      setSnappedTo("top");
    }
  }, [snappedTo, preSnapState, pos, size.width]);

  // Resize handlers
  const handleResizeDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFocus?.();
    setIsResizing(true);
    const el = e.currentTarget.closest("[data-floating-window]") as HTMLElement;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: el?.offsetWidth ?? size.width, h: el?.offsetHeight ?? 300 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [onFocus, size.width]);

  const handleResizeMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    const dw = e.clientX - resizeStart.current.x;
    const dh = e.clientY - resizeStart.current.y;
    setSize({
      width: Math.max(MIN_WIDTH, resizeStart.current.w + dw),
      height: Math.max(MIN_HEIGHT, resizeStart.current.h + dh),
    });
  }, [isResizing]);

  const handleResizeUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const snapPreview = snapZone ? getSnapRect(snapZone, window.innerWidth, window.innerHeight) : null;

  return (
    <>
      {/* Snap zone preview overlay */}
      {isDragging && snapPreview && (
        <div
          className="fixed rounded-xl bg-[hsl(210_80%_60%)] pointer-events-none transition-all duration-150"
          style={{
            left: snapPreview.x,
            top: snapPreview.y,
            width: snapPreview.width,
            height: snapPreview.height,
            opacity: SNAP_CONFIG.previewOpacity,
            zIndex: DEPTH_LAYERS.windows - 1,
            borderRadius: SNAP_CONFIG.previewRadius,
          }}
        />
      )}

      <motion.div
        data-floating-window
        initial={NOVA_MOTION.window.enter.initial}
        animate={NOVA_MOTION.window.enter.animate}
        exit={NOVA_MOTION.window.exit.exit}
        transition={{ duration: NOVA_MOTION.duration.standard, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "absolute rounded-2xl overflow-hidden",
          "backdrop-blur-2xl transition-[opacity,box-shadow,border-color] duration-200",
          isFocused
            ? "bg-[hsl(0_0%_100%/0.70)] dark:bg-[hsl(0_0%_0%/0.60)] border border-[hsl(0_0%_100%/0.35)] dark:border-[hsl(0_0%_100%/0.15)] shadow-2xl shadow-[hsl(0_0%_0%/0.3)]"
            : "bg-[hsl(0_0%_100%/0.60)] dark:bg-[hsl(0_0%_0%/0.50)] border border-[hsl(0_0%_100%/0.20)] dark:border-[hsl(0_0%_100%/0.08)] shadow-lg shadow-[hsl(0_0%_0%/0.15)] opacity-[0.85]",
          isDragging ? "cursor-grabbing" : "",
          className
        )}
        style={{
          left: pos.x,
          top: pos.y,
          width: size.width,
          height: size.height || undefined,
          zIndex: DEPTH_LAYERS.windows,
          willChange: "transform",
          transition: isDragging || isResizing ? "none" : `left ${SNAP_CONFIG.animationDuration}s ease, top ${SNAP_CONFIG.animationDuration}s ease, width ${SNAP_CONFIG.animationDuration}s ease, height ${SNAP_CONFIG.animationDuration}s ease`,
          ...style,
        }}
        onPointerDown={() => onFocus?.()}
      >
        {/* Title bar — draggable */}
        <div
          className={cn(
            "h-10 flex items-center px-3 gap-2 select-none",
            "border-b border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)]",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClickTitle}
        >
          {/* Traffic lights */}
          <div
            className="flex items-center gap-1.5"
            onMouseEnter={() => setIsHoveringControls(true)}
            onMouseLeave={() => setIsHoveringControls(false)}
          >
            <button
              onClick={onClose}
              className={cn(
                "w-3 h-3 rounded-full transition-colors flex items-center justify-center",
                isHoveringControls ? TRAFFIC_LIGHTS.close : TRAFFIC_LIGHTS.inactive
              )}
              aria-label="Close"
            >
              {isHoveringControls && (
                <span className="text-[8px] font-bold text-[hsl(0_0%_0%/0.5)] leading-none">✕</span>
              )}
            </button>
            <button
              onClick={onMinimize}
              className={cn(
                "w-3 h-3 rounded-full transition-colors flex items-center justify-center",
                isHoveringControls ? TRAFFIC_LIGHTS.minimize : TRAFFIC_LIGHTS.inactive
              )}
              aria-label="Minimize"
            >
              {isHoveringControls && (
                <span className="text-[8px] font-bold text-[hsl(0_0%_0%/0.5)] leading-none">−</span>
              )}
            </button>
            <button
              onClick={onMaximize}
              className={cn(
                "w-3 h-3 rounded-full transition-colors flex items-center justify-center",
                isHoveringControls ? TRAFFIC_LIGHTS.maximize : TRAFFIC_LIGHTS.inactive
              )}
              aria-label="Maximize"
            >
              {isHoveringControls && (
                <span className="text-[8px] font-bold text-[hsl(0_0%_0%/0.5)] leading-none">⤢</span>
              )}
            </button>
          </div>

          {/* Title */}
          <span className="ml-2 text-[13px] font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)] truncate flex-1 text-center">
            {title}
          </span>

          {/* Spacer for symmetry */}
          <div className="w-[52px]" />
        </div>

        {/* Content */}
        <div className="overflow-auto" style={{ maxHeight: size.height ? size.height - 40 : undefined }}>
          {children}
        </div>

        {/* Resize handle — bottom-right corner */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
        >
          <svg
            className="w-3 h-3 absolute bottom-0.5 right-0.5 text-[hsl(0_0%_50%/0.4)] group-hover:text-[hsl(0_0%_50%/0.7)] transition-colors"
            viewBox="0 0 10 10"
            fill="none"
          >
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" />
            <line x1="9" y1="4" x2="4" y2="9" stroke="currentColor" strokeWidth="1.2" />
            <line x1="9" y1="7" x2="7" y2="9" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
      </motion.div>
    </>
  );
}
