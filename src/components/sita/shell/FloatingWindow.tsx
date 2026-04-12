// ═══════════════════════════════════════════════════════════════
// SITA OS — Floating Window (NovaOS composited surface)
// Draggable glassmorphic window with traffic-light controls + snap + resize
// Enhanced: accent strip, app icon, origin morph, toolbar slot, dual shadows
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { SoundEngine } from "@/lib/sound-engine";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS, TRAFFIC_LIGHTS, NOVA_MOTION } from "@/lib/design-system/nova-os";
import { APP_SHADOWS, APP_ACCENTS, APP_CHROME, APP_TYPE } from "@/lib/design-system/app-window-system";
import { detectSnapZone, getSnapRect, SNAP_CONFIG, type SnapZone } from "@/lib/design-system/snap-zones";
import { lerpPosition, type DragState } from "@/lib/engine/compositor-sim";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalmEngine } from "@/contexts/CalmEngineContext";
import {
  findMagneticEdges,
  applyMagneticSnap,
  applyEdgeBounce,
  trackShake,
  clearShakeState,
  type PhysicsWindow,
} from "@/lib/services/window-physics";

export interface SiblingWindow {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FloatingWindowProps {
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  width?: number;
  windowId?: string;
  appIcon?: string;
  appAccent?: string;
  toolbar?: ReactNode;
  originRect?: { x: number; y: number; width: number; height: number };
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  isFocused?: boolean;
  siblingWindows?: SiblingWindow[];
  className?: string;
  style?: React.CSSProperties;

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const DRAG_SMOOTHING = 0.25;
const INERTIA_FRICTION = 0.92;
const INERTIA_THRESHOLD = 0.5;
const MAGNETIC_RANGE = 20;
const MAGNETIC_STRENGTH = 0.15;

export function FloatingWindow({
  title,
  children,
  initialPosition = { x: 120, y: 80 },
  width = 500,
  windowId,
  appIcon,
  appAccent,
  toolbar,
  originRect,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  isFocused = true,
  className,
  style,
}: FloatingWindowProps) {
  // Calm Engine attention
  const calm = useCalmEngine();
  const attention = windowId ? calm.windowAttention.get(windowId) : undefined;
  const attentionOpacity = attention?.opacity ?? (isFocused ? 1 : 0.85);
  const attentionSaturation = attention?.saturation ?? (isFocused ? 1 : 0.8);
  const [pos, setPos] = useState(initialPosition);
  const [size, setSize] = useState({ width, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const [snappedTo, setSnappedTo] = useState<SnapZone>(null);
  const [preSnapState, setPreSnapState] = useState<{ x: number; y: number; width: number } | null>(null);
  const [showContent, setShowContent] = useState(false);

  const accentGradient = appAccent || (windowId ? APP_ACCENTS[windowId] : undefined) || APP_ACCENTS.default;

  // Progressive content loading — show skeleton shimmer for 150ms + soft open sound
  useEffect(() => {
    SoundEngine.click();
    const timer = setTimeout(() => setShowContent(true), 150);
    return () => clearTimeout(timer);
  }, []);

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

  // Origin morph — "soft open" spring with blur-in
  const morphInitial = originRect
    ? {
        x: originRect.x - initialPosition.x,
        y: originRect.y - initialPosition.y,
        scale: Math.max(originRect.width / width, 0.15),
        opacity: 0,
        filter: "blur(8px)",
      }
    : { ...NOVA_MOTION.window.enter.initial, scale: 0.85, opacity: 0, filter: "blur(6px)" };

  const morphAnimate = originRect
    ? { x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }
    : { ...NOVA_MOTION.window.enter.animate, scale: 1, opacity: 1, filter: "blur(0px)" };

  const morphTransition = originRect
    ? { type: "spring" as const, stiffness: 220, damping: 20, mass: 0.7 }
    : { type: "spring" as const, stiffness: 200, damping: 18, mass: 0.6 };

  // Lerp animation loop during drag
  useEffect(() => {
    if (!isDragging) return;

    const animate = () => {
      const nx = lerpPosition(currentPos.current.x, targetPos.current.x, DRAG_SMOOTHING);
      const ny = lerpPosition(currentPos.current.y, targetPos.current.y, DRAG_SMOOTHING);

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

    let tx = e.clientX - dragRef.current.offsetX;
    let ty = e.clientY - dragRef.current.offsetY;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ww = size.width;

    if (tx < MAGNETIC_RANGE) tx += (0 - tx) * MAGNETIC_STRENGTH;
    if (tx + ww > vw - MAGNETIC_RANGE) tx += (vw - ww - tx) * MAGNETIC_STRENGTH;
    if (ty < MAGNETIC_RANGE) ty += (0 - ty) * MAGNETIC_STRENGTH;
    if (ty > vh - MAGNETIC_RANGE - 50) ty += (vh - 50 - ty) * MAGNETIC_STRENGTH;

    targetPos.current = { x: tx, y: ty };
    lastPointer.current = { x: e.clientX, y: e.clientY };

    const zone = detectSnapZone(e.clientX, e.clientY, vw, vh);
    setSnapZone(zone);
  }, [isDragging, size.width]);

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
      SoundEngine.approve(); // Snap sound feedback
    } else {
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

  const titleBarHeight = APP_CHROME.titleBarHeight;
  const totalChromeH = titleBarHeight + (toolbar ? APP_CHROME.toolbarHeight : 0);

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
        initial={morphInitial}
        animate={morphAnimate}
        exit={NOVA_MOTION.window.exit.exit}
        transition={morphTransition}
        className={cn(
          "absolute overflow-hidden",
          "backdrop-blur-2xl transition-[box-shadow,border-color,filter] duration-200",
          isFocused
            ? cn(
                "bg-[hsl(0_0%_100%/0.72)] dark:bg-[hsl(0_0%_0%/0.62)]",
                "border border-[hsl(0_0%_100%/0.35)] dark:border-[hsl(0_0%_100%/0.12)]",
                APP_SHADOWS.focused,
                APP_SHADOWS.innerGlow
              )
            : cn(
                "bg-[hsl(0_0%_100%/0.60)] dark:bg-[hsl(0_0%_0%/0.50)]",
                "border border-[hsl(0_0%_100%/0.20)] dark:border-[hsl(0_0%_100%/0.08)]",
                APP_SHADOWS.unfocused
              ),
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
          borderRadius: APP_CHROME.cornerRadius,
          opacity: attentionOpacity,
          filter: isFocused
            ? `saturate(${attentionSaturation})`
            : `saturate(${attentionSaturation * 0.85}) brightness(0.97)`,
          transition: isDragging || isResizing
            ? "box-shadow 0.2s, filter 0.3s"
            : `left ${SNAP_CONFIG.animationDuration}s ease, top ${SNAP_CONFIG.animationDuration}s ease, width ${SNAP_CONFIG.animationDuration}s ease, height ${SNAP_CONFIG.animationDuration}s ease, box-shadow 0.2s, filter 0.3s`,
          ...style,
        }}
        onPointerDown={() => onFocus?.()}
      >
        {/* ── Accent strip ── */}
        <div className={cn("h-[2px] w-full bg-gradient-to-r", accentGradient)} />

        {/* ── Title bar — draggable ── */}
        <div
          className={cn(
            "flex items-center px-3 gap-2 select-none",
            "border-b border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)]",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ height: titleBarHeight }}
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
                "w-3 h-3 rounded-full transition-all duration-100 flex items-center justify-center",
                isHoveringControls ? cn(TRAFFIC_LIGHTS.close, "scale-110") : TRAFFIC_LIGHTS.inactive
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
                "w-3 h-3 rounded-full transition-all duration-100 flex items-center justify-center",
                isHoveringControls ? cn(TRAFFIC_LIGHTS.minimize, "scale-110") : TRAFFIC_LIGHTS.inactive
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
                "w-3 h-3 rounded-full transition-all duration-100 flex items-center justify-center",
                isHoveringControls ? cn(TRAFFIC_LIGHTS.maximize, "scale-110") : TRAFFIC_LIGHTS.inactive
              )}
              aria-label="Maximize"
            >
              {isHoveringControls && (
                <span className="text-[8px] font-bold text-[hsl(0_0%_0%/0.5)] leading-none">⤢</span>
              )}
            </button>
          </div>

          {/* App icon + Title */}
          <div className="flex items-center gap-1.5 ml-2 flex-1 justify-center">
            {appIcon && (
              <span className="text-[14px] leading-none">{appIcon}</span>
            )}
            <span className={cn(APP_TYPE.body, "font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)] truncate")}>
              {title}
            </span>
          </div>

          {/* Spacer for symmetry */}
          <div className="w-[52px]" />
        </div>

        {/* ── Toolbar slot ── */}
        {toolbar && (
          <div
            className="flex items-center px-3 gap-2 border-b border-[hsl(0_0%_0%/0.04)] dark:border-[hsl(0_0%_100%/0.04)]"
            style={{ height: APP_CHROME.toolbarHeight }}
          >
            {toolbar}
          </div>
        )}

        {/* ── Content with progressive loading ── */}
        <div className="overflow-auto" style={{ maxHeight: size.height ? size.height - totalChromeH - APP_CHROME.accentStripHeight : undefined }}>
          {showContent ? (
            children
          ) : (
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              {/* Accent-tinted skeleton bar */}
              <div className={cn("h-1 w-1/4 rounded-full bg-gradient-to-r opacity-20 mt-2", accentGradient)} />
            </div>
          )}
        </div>

        {/* ── Resize handle ── */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize group"
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
        >
          <svg
            className="w-3 h-3 absolute bottom-1 right-1 text-[hsl(0_0%_50%/0.3)] group-hover:text-[hsl(0_0%_50%/0.6)] transition-colors duration-100"
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
