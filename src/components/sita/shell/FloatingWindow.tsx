// ═══════════════════════════════════════════════════════════════
// SITA OS — Floating Window (NovaOS composited surface)
// Draggable glassmorphic window with traffic-light controls + snap + resize
// Enhanced: accent strip, app icon, origin morph, toolbar slot, dual shadows
// + error boundary, sounds, minimize-to-dock, occlusion, throttling,
//   dynamic drag shadows, progressive crossfade, perf instrumentation
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect, useMemo, useDeferredValue, type ReactNode } from "react";
import { SoundEngine } from "@/platform/runtime/sound-engine";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS, TRAFFIC_LIGHTS, NOVA_MOTION } from "@/platform/design-system/nova-os";
import { APP_SHADOWS, APP_ACCENTS, APP_CHROME, APP_TYPE } from "@/platform/design-system/app-window-system";
import { detectSnapZone, getSnapRect, SNAP_CONFIG, type SnapZone } from "@/platform/design-system/snap-zones";
import { lerpPosition, type DragState } from "@/lib/engine/compositor-sim";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalmEngine } from "@/contexts/CalmEngineContext";
import { WindowErrorBoundary } from "./WindowErrorBoundary";
import { WindowPerformanceMonitor } from "@/platform/nova-sdk/kernel/window-perf";
import {
  findMagneticEdges,
  applyMagneticSnap,
  applyEdgeBounce,
  trackShake,
  clearShakeState,
  computeAlignmentGuides,
  type PhysicsWindow,
  type AlignmentGuide,
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
  onPiP?: () => void;
  onFocus?: () => void;
  onPositionChange?: (pos: { x: number; y: number }, width: number) => void;
  isFocused?: boolean;
  isOccluded?: boolean;
  isMaximized?: boolean;
  siblingWindows?: SiblingWindow[];
  className?: string;
  style?: React.CSSProperties;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const DEFAULT_WINDOW_HEIGHT = 480;
const DRAG_SMOOTHING = 0.55;
const INERTIA_FRICTION = 0.85;
const INERTIA_THRESHOLD = 0.8;
const MAGNETIC_RANGE = 12;
const MAGNETIC_STRENGTH = 0.1;

// ── Throttled content wrapper for unfocused windows ──────────

function ThrottledContent({ children, active }: { children: ReactNode; active: boolean }) {
  const deferred = useDeferredValue(children);
  return (
    <div style={{ contentVisibility: active ? "visible" : "auto" }}>
      {active ? children : deferred}
    </div>
  );
}

// ── Edge-to-viewport distance labels (design-tool style) ─────
const EDGE_THRESHOLD = 120;

function EdgeDistanceLabels({
  pos,
  size,
  vw,
  vh,
}: {
  pos: { x: number; y: number };
  size: { width: number; height: number };
  vw: number;
  vh: number;
}) {
  const distLeft = Math.round(pos.x);
  const distRight = Math.round(vw - (pos.x + size.width));
  const distTop = Math.round(pos.y);
  const distBottom = Math.round(vh - (pos.y + size.height));

  const edges: Array<{
    dist: number;
    x1: number; y1: number; x2: number; y2: number;
    labelX: number; labelY: number;
  }> = [];

  // Left edge
  if (distLeft >= 0 && distLeft < EDGE_THRESHOLD) {
    const midY = pos.y + size.height / 2;
    edges.push({ dist: distLeft, x1: 0, y1: midY, x2: pos.x, y2: midY, labelX: pos.x / 2, labelY: midY });
  }
  // Right edge
  if (distRight >= 0 && distRight < EDGE_THRESHOLD) {
    const midY = pos.y + size.height / 2;
    const wx = pos.x + size.width;
    edges.push({ dist: distRight, x1: wx, y1: midY, x2: vw, y2: midY, labelX: wx + distRight / 2, labelY: midY });
  }
  // Top edge
  if (distTop >= 0 && distTop < EDGE_THRESHOLD) {
    const midX = pos.x + size.width / 2;
    edges.push({ dist: distTop, x1: midX, y1: 0, x2: midX, y2: pos.y, labelX: midX, labelY: pos.y / 2 });
  }
  // Bottom edge
  if (distBottom >= 0 && distBottom < EDGE_THRESHOLD) {
    const midX = pos.x + size.width / 2;
    const wy = pos.y + size.height;
    edges.push({ dist: distBottom, x1: midX, y1: wy, x2: midX, y2: vh, labelX: midX, labelY: wy + distBottom / 2 });
  }

  if (edges.length === 0) return null;

  return (
    <svg
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: DEPTH_LAYERS.windows + 2, width: "100vw", height: "100vh" }}
    >
      {edges.map((e, i) => {
        const opacity = Math.max(0.2, 1 - e.dist / EDGE_THRESHOLD);
        const label = `${e.dist}px`;
        const labelW = label.length * 6.4 + 10;
        return (
          <g key={i} opacity={opacity}>
            <line
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="hsl(210, 80%, 60%)"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.6"
            />
            <rect
              x={e.labelX - labelW / 2}
              y={e.labelY - 8}
              width={labelW}
              height={16}
              rx="4"
              fill="hsl(0, 0%, 0%)"
              fillOpacity="0.7"
            />
            <text
              x={e.labelX}
              y={e.labelY + 4}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="500"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

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
  onPiP,
  onFocus,
  onPositionChange,
  isFocused = true,
  isOccluded = false,
  isMaximized = false,
  siblingWindows = [],
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
  const [magnetSnapped, setMagnetSnapped] = useState(false);
  const [alignGuides, setAlignGuides] = useState<AlignmentGuide[]>([]);
  const [dragElevation, setDragElevation] = useState(0);
  const [isMinimizing, setIsMinimizing] = useState(false);

  const accentGradient = appAccent || (windowId ? APP_ACCENTS[windowId] : undefined) || APP_ACCENTS.default;

  // Progressive content loading — show skeleton shimmer for 150ms then crossfade + sound
  useEffect(() => {
    if (windowId) {
      WindowPerformanceMonitor.markWindowRequested(windowId);
    }
    SoundEngine.windowOpen();
    const timer = setTimeout(() => {
      setShowContent(true);
      if (windowId) WindowPerformanceMonitor.markWindowFirstFrame(windowId);
    }, 150);
    return () => clearTimeout(timer);
  }, [windowId]);

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
    : { ...NOVA_MOTION.window.enter.initial, scale: 0.96, opacity: 0, filter: "blur(6px)" };

  const morphAnimate = originRect
    ? { x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }
    : { ...NOVA_MOTION.window.enter.animate, scale: 1, opacity: 1, filter: "blur(0px)" };

  const morphTransition = originRect
    ? { type: "spring" as const, stiffness: 220, damping: 20, mass: 0.7 }
    : { type: "spring" as const, stiffness: 200, damping: 18, mass: 0.6 };

  // Minimize-to-dock exit variant
  const minimizeExit = useMemo(() => ({
    y: window.innerHeight - 80,
    scale: 0.2,
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  }), []);

  const exitVariant = isMinimizing
    ? minimizeExit
    : NOVA_MOTION.window.exit.exit;

  // Lerp animation loop during drag
  useEffect(() => {
    if (!isDragging) return;

    const animate = () => {
      const nx = lerpPosition(currentPos.current.x, targetPos.current.x, DRAG_SMOOTHING);
      const ny = lerpPosition(currentPos.current.y, targetPos.current.y, DRAG_SMOOTHING);

      dragRef.current.velocityX = nx - currentPos.current.x;
      dragRef.current.velocityY = ny - currentPos.current.y;

      // Dynamic elevation based on velocity
      const speed = Math.sqrt(
        dragRef.current.velocityX ** 2 + dragRef.current.velocityY ** 2
      );
      setDragElevation(Math.min(1, speed / 15));

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
    if (isMaximized) return; // Prevent drag when maximized
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
    setDragElevation(0);
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

    // Perf instrumentation
    WindowPerformanceMonitor.recordDragSample(e.timeStamp);

    let tx = e.clientX - dragRef.current.offsetX;
    let ty = e.clientY - dragRef.current.offsetY;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ww = size.width;
    const wh = size.height || 300;
    const wid = windowId || "unknown";

    // ── Inter-window magnetic docking ──
    const draggingPhysics: PhysicsWindow = { id: wid, x: tx, y: ty, width: ww, height: wh };
    const others: PhysicsWindow[] = siblingWindows
      .filter(sw => sw.id !== wid)
      .map(sw => ({ id: sw.id, x: sw.x, y: sw.y, width: sw.width, height: sw.height }));

    if (others.length > 0) {
      const edges = findMagneticEdges(draggingPhysics, others);
      if (edges.length > 0) {
        const snapped = applyMagneticSnap({ x: tx, y: ty }, edges);
        tx = snapped.x;
        ty = snapped.y;
        setMagnetSnapped(snapped.snapped);
        const snappedPhysics = { ...draggingPhysics, x: tx, y: ty };
        setAlignGuides(snapped.snapped ? computeAlignmentGuides(snappedPhysics, others, edges) : []);
      } else {
        setMagnetSnapped(false);
        setAlignGuides([]);
      }
    }

    // ── Screen-edge magnetic pull ──
    if (tx < MAGNETIC_RANGE) tx += (0 - tx) * MAGNETIC_STRENGTH;
    if (tx + ww > vw - MAGNETIC_RANGE) tx += (vw - ww - tx) * MAGNETIC_STRENGTH;
    if (ty < MAGNETIC_RANGE) ty += (0 - ty) * MAGNETIC_STRENGTH;
    if (ty > vh - MAGNETIC_RANGE - 50) ty += (vh - 50 - ty) * MAGNETIC_STRENGTH;

    // ── Shake-to-minimize detection ──
    if (windowId) {
      const shook = trackShake(windowId, e.clientX);
      if (shook) {
        setIsDragging(false);
        setDragElevation(0);
        dragRef.current.active = false;
        cancelAnimationFrame(rafId.current);
        SoundEngine.windowMinimize(e.clientX);
        setIsMinimizing(true);
        setTimeout(() => onMinimize?.(), 220);
        return;
      }
    }

    targetPos.current = { x: tx, y: ty };
    lastPointer.current = { x: e.clientX, y: e.clientY };

    const zone = detectSnapZone(e.clientX, e.clientY, vw, vh);
    setSnapZone(zone);
  }, [isDragging, size.width, size.height, windowId, siblingWindows, onMinimize]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragElevation(0);
    dragRef.current.active = false;
    setMagnetSnapped(false);
    setAlignGuides([]);
    cancelAnimationFrame(rafId.current);

    if (windowId) clearShakeState(windowId);

    if (snapZone) {
      setPreSnapState({ x: currentPos.current.x, y: currentPos.current.y, width: size.width });
      const rect = getSnapRect(snapZone, window.innerWidth, window.innerHeight);
      currentPos.current = { x: rect.x, y: rect.y };
      setPos({ x: rect.x, y: rect.y });
      setSize({ width: rect.width, height: rect.height });
      setSnappedTo(snapZone);
      SoundEngine.snap(rect.x + rect.width / 2);
      onPositionChange?.({ x: rect.x, y: rect.y }, rect.width);
    } else {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bounce = applyEdgeBounce(
        currentPos.current,
        { vx: dragRef.current.velocityX, vy: dragRef.current.velocityY },
        { width: size.width, height: size.height || 300 },
        { width: vw, height: vh }
      );

      if (bounce.bounced) {
        currentPos.current = { x: bounce.x, y: bounce.y };
        dragRef.current.velocityX = bounce.vx;
        dragRef.current.velocityY = bounce.vy;
        setPos({ x: bounce.x, y: bounce.y });
      }

      runInertia();
      onPositionChange?.(currentPos.current, size.width);
    }
    setSnapZone(null);
  }, [snapZone, size.width, size.height, runInertia, windowId]);

  const handleDoubleClickTitle = useCallback(() => {
    // Double-click title toggles maximize via the prop callback
    if (onMaximize) {
      onMaximize();
      return;
    }
    // Fallback: internal snap toggle
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
      SoundEngine.windowMaximize();
    }
  }, [onMaximize, snappedTo, preSnapState, pos, size.width]);

  // Close with sound
  const handleClose = useCallback(() => {
    SoundEngine.windowClose();
    onClose?.();
  }, [onClose]);

  // Minimize with sound + dock animation
  const handleMinimize = useCallback(() => {
    SoundEngine.windowMinimize();
    setIsMinimizing(true);
    setTimeout(() => onMinimize?.(), 220);
  }, [onMinimize]);

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

  // Dynamic shadow during drag — interpolates between normal and elevated
  const dynamicShadow = isDragging && dragElevation > 0.05
    ? `0 ${2 + dragElevation * 8}px ${10 + dragElevation * 30}px hsl(0 0% 0% / ${0.15 + dragElevation * 0.12}), 0 ${16 + dragElevation * 20}px ${48 + dragElevation * 40}px hsl(0 0% 0% / ${0.20 + dragElevation * 0.15})`
    : undefined;

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

      {/* Edge-to-viewport distance labels */}
      {isDragging && (
        <EdgeDistanceLabels
          pos={pos}
          size={{ width: size.width, height: size.height || 300 }}
          vw={window.innerWidth}
          vh={window.innerHeight}
        />
      )}

      {/* Magnetic alignment guides */}
      {isDragging && alignGuides.length > 0 && (
        <svg
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: DEPTH_LAYERS.windows + 1, width: "100vw", height: "100vh" }}
        >
          <defs>
            <filter id="guide-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {alignGuides.map((g, i) =>
            g.axis === "x" ? (
              <g key={`ag-${i}`}>
                <line
                  x1={g.position} y1={g.start} x2={g.position} y2={g.end}
                  stroke="hsl(210, 80%, 60%)" strokeWidth="3" opacity="0.15"
                  filter="url(#guide-glow)"
                />
                <line
                  x1={g.position} y1={g.start} x2={g.position} y2={g.end}
                  stroke="hsl(210, 80%, 60%)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7"
                >
                  <animate attributeName="opacity" values="0.3;0.9;0.7" dur="0.3s" repeatCount="1" />
                  <animate attributeName="stroke-width" values="3;1;1" dur="0.3s" repeatCount="1" />
                </line>
              </g>
            ) : (
              <g key={`ag-${i}`}>
                <line
                  x1={g.start} y1={g.position} x2={g.end} y2={g.position}
                  stroke="hsl(210, 80%, 60%)" strokeWidth="3" opacity="0.15"
                  filter="url(#guide-glow)"
                />
                <line
                  x1={g.start} y1={g.position} x2={g.end} y2={g.position}
                  stroke="hsl(210, 80%, 60%)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7"
                >
                  <animate attributeName="opacity" values="0.3;0.9;0.7" dur="0.3s" repeatCount="1" />
                  <animate attributeName="stroke-width" values="3;1;1" dur="0.3s" repeatCount="1" />
                </line>
              </g>
            )
          )}
          {alignGuides.map((g, i) => {
            const pts = g.axis === "x"
              ? [{ cx: g.position, cy: g.start }, { cx: g.position, cy: g.end }]
              : [{ cx: g.start, cy: g.position }, { cx: g.end, cy: g.position }];
            return pts.map((p, j) => (
              <circle
                key={`dot-${i}-${j}`}
                cx={p.cx} cy={p.cy} r="2"
                fill="hsl(210, 80%, 60%)" opacity="0.5"
              >
                <animate attributeName="r" values="4;2;2" dur="0.3s" repeatCount="1" />
                <animate attributeName="opacity" values="0.9;0.5;0.5" dur="0.3s" repeatCount="1" />
              </circle>
            ));
          })}
          {alignGuides.map((g, i) => {
            const mid = g.axis === "x"
              ? { x: g.position + 6, y: (g.start + g.end) / 2 }
              : { x: (g.start + g.end) / 2, y: g.position - 6 };
            const label = `${g.distance}px`;
            return (
              <g key={`dist-${i}`}>
                <rect
                  x={mid.x - label.length * 3.2 - 4}
                  y={mid.y - 7}
                  width={label.length * 6.4 + 8}
                  height={14}
                  rx="4"
                  fill="hsl(210, 80%, 15%)"
                  fillOpacity="0.85"
                  stroke="hsl(210, 80%, 60%)"
                  strokeWidth="0.5"
                  strokeOpacity="0.4"
                >
                  <animate attributeName="fill-opacity" values="0;0.85" dur="0.2s" repeatCount="1" />
                </rect>
                <text
                  x={mid.x}
                  y={mid.y + 3.5}
                  textAnchor="middle"
                  fill="hsl(210, 80%, 70%)"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="500"
                >
                  {label}
                  <animate attributeName="opacity" values="0;1" dur="0.2s" repeatCount="1" />
                </text>
              </g>
            );
          })}
        </svg>
      )}

      <motion.div
        data-floating-window
        initial={morphInitial}
        animate={morphAnimate}
        exit={exitVariant}
        transition={morphTransition}
        onAnimationComplete={() => {
          if (windowId) WindowPerformanceMonitor.markWindowAnimComplete(windowId);
        }}
        className={cn(
          isMaximized ? "fixed inset-0 flex flex-col" : "absolute overflow-hidden",
          !isMaximized && "overflow-hidden",
          "backdrop-blur-2xl transition-[box-shadow,border-color,filter] duration-100",
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
          magnetSnapped && "ring-2 ring-[hsl(210_80%_60%/0.4)]",
          isDragging ? "cursor-grabbing" : "",
          isMaximized && "!rounded-none",
          className
        )}
        style={{
          ...(isMaximized
            ? { left: 0, top: 0, width: "100vw", height: "100vh", zIndex: DEPTH_LAYERS.windows + 10, borderRadius: 0 }
            : {
                ...(isDragging
                  ? { left: 0, top: 0, transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }
                  : { left: pos.x, top: pos.y }),
                width: size.width,
                height: size.height || DEFAULT_WINDOW_HEIGHT,
                zIndex: DEPTH_LAYERS.windows,
                borderRadius: APP_CHROME.cornerRadius,
              }),
          willChange: isDragging ? "transform" : "auto",
          opacity: attentionOpacity,
          filter: isFocused
            ? `saturate(${attentionSaturation})`
            : `saturate(${attentionSaturation * 0.85}) brightness(0.97)`,
          transition: isDragging || isResizing
            ? "box-shadow 0.12s, filter 0.12s"
            : `left ${SNAP_CONFIG.animationDuration}s ease, top ${SNAP_CONFIG.animationDuration}s ease, width ${SNAP_CONFIG.animationDuration}s ease, height ${SNAP_CONFIG.animationDuration}s ease, box-shadow 0.12s, filter 0.12s`,
          ...(dynamicShadow ? { boxShadow: dynamicShadow } : {}),
          ...style,
        }}
        onPointerDown={() => onFocus?.()}
      >
        {/* ── Accent strip — more visible ── */}
        <div className={cn("h-[2.5px] w-full bg-gradient-to-r", accentGradient)} style={{ boxShadow: "0 1px 6px hsl(265 55% 58% / 0.15)" }} />

        {/* ── Title bar — draggable, with subtle gradient ── */}
        <div
          className={cn(
            "flex items-center px-3 gap-2 select-none",
            isDragging ? "cursor-grabbing" : (isMaximized ? "cursor-default" : "cursor-grab")
          )}
          style={{
            height: titleBarHeight,
            borderBottom: "0.5px solid hsl(0 0% 50% / 0.08)",
            background: isFocused
              ? "linear-gradient(180deg, hsl(0 0% 100% / 0.04) 0%, transparent 100%)"
              : "transparent",
          }}
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
              onClick={handleClose}
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
              onClick={handleMinimize}
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

          {/* PiP button + Spacer for symmetry */}
          <div className="w-[52px] flex items-center justify-end gap-1">
            {onPiP && (
              <button
                onClick={onPiP}
                className="w-4 h-4 rounded flex items-center justify-center text-[hsl(0_0%_50%/0.4)] hover:text-[hsl(0_0%_50%/0.8)] transition-colors"
                aria-label="Picture in Picture"
                title="Picture in Picture"
              >
                <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="1" y="1" width="12" height="10" rx="1.5" />
                  <rect x="7" y="5" width="5" height="4" rx="1" fill="currentColor" opacity="0.3" />
                </svg>
              </button>
            )}
          </div>
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

        {/* ── Content with progressive crossfade + error boundary + occlusion + throttling ── */}
        <div className={cn("overflow-auto", isMaximized && "flex-1")} style={{ maxHeight: isMaximized ? undefined : ((size.height || DEFAULT_WINDOW_HEIGHT) - totalChromeH - APP_CHROME.accentStripHeight) }}>
          {isOccluded ? (
            // Fully occluded — render minimal placeholder to save CPU
            <div style={{ minHeight: 100 }} />
          ) : (
            <WindowErrorBoundary windowId={windowId} title={title} onClose={onClose}>
              <ThrottledContent active={isFocused}>
                <AnimatePresence mode="wait">
                  {showContent ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.12 }}
                    >
                      {children}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="p-4 space-y-3"
                    >
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className={cn("h-1 w-1/4 rounded-full bg-gradient-to-r opacity-20 mt-2", accentGradient)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </ThrottledContent>
            </WindowErrorBoundary>
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
