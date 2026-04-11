// ═══════════════════════════════════════════════════════════════
// SITA OS — Floating Window (NovaOS composited surface)
// Draggable glassmorphic window with traffic-light controls
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS, TRAFFIC_LIGHTS, NOVA_MOTION, NOVA_SHADOWS } from "@/lib/design-system/nova-os";

interface FloatingWindowProps {
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  width?: number;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

export function FloatingWindow({
  title,
  children,
  initialPosition = { x: 120, y: 80 },
  width = 500,
  onClose,
  onMinimize,
  onMaximize,
  className,
}: FloatingWindowProps) {
  const [pos, setPos] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Don't drag from buttons
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...pos };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({ x: posStart.current.x + dx, y: posStart.current.y + dy });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <motion.div
      initial={NOVA_MOTION.window.enter.initial}
      animate={NOVA_MOTION.window.enter.animate}
      exit={NOVA_MOTION.window.exit.exit}
      transition={{ duration: NOVA_MOTION.duration.standard, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "absolute rounded-2xl overflow-hidden",
        "bg-[hsl(0_0%_100%/0.70)] dark:bg-[hsl(0_0%_0%/0.60)]",
        "backdrop-blur-2xl",
        "border border-[hsl(0_0%_100%/0.30)] dark:border-[hsl(0_0%_100%/0.10)]",
        NOVA_SHADOWS.window,
        isDragging ? "cursor-grabbing" : "",
        className
      )}
      style={{
        left: pos.x,
        top: pos.y,
        width,
        zIndex: DEPTH_LAYERS.windows,
        willChange: "transform",
      }}
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
      <div className="overflow-auto">
        {children}
      </div>
    </motion.div>
  );
}
