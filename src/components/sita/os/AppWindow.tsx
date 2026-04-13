import React, { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOSWindowContext, type OSWindow } from "./WindowContext";

// ═══════════════════════════════════════════════════════════════
// SITA OS — App Window
// Premium glassmorphic draggable window with traffic-light controls
// ═══════════════════════════════════════════════════════════════

interface AppWindowProps {
  window: OSWindow;
}

export function AppWindow({ window: win }: AppWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition } =
    useOSWindowContext();

  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Pointer-based drag (header only) ──────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (win.isMaximized) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: win.position.x,
        originY: win.position.y,
      };
      setIsDragging(true);
      focusWindow(win.id);
    },
    [win.isMaximized, win.position, win.id, focusWindow]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      updateWindowPosition(win.id, {
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      });
    },
    [win.id, updateWindowPosition]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

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

  const isFocused = true; // In compositor, topmost is focused — could extend later

  return (
    <motion.div
      key={win.id}
      initial={{ scale: 0.96, opacity: 0, filter: "blur(8px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      exit={{ scale: 0.98, opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "absolute flex flex-col overflow-hidden pointer-events-auto",
        "rounded-xl border border-white/[0.08]",
        "bg-background/80 backdrop-blur-xl",
        isFocused
          ? "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_20px_40px_hsl(0_0%_0%/0.18)]"
          : "shadow-[0_2px_4px_hsl(0_0%_0%/0.05),0_12px_28px_hsl(0_0%_0%/0.10)]",
        win.isMaximized && "!inset-0 !w-full !h-full !rounded-none"
      )}
      style={{
        zIndex: win.zIndex,
        ...(win.isMaximized
          ? {}
          : {
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
            }),
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* ── Title bar ──────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center h-10 px-3 gap-2 select-none shrink-0",
          "border-b border-white/[0.06]",
          "bg-background/40",
          !win.isMaximized && "cursor-grab",
          isDragging && "cursor-grabbing"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
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
        </span>

        {/* Spacer to balance traffic lights */}
        <div className="w-[52px]" />
      </div>

      {/* ── Window body ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {win.component}
      </div>
    </motion.div>
  );
}
