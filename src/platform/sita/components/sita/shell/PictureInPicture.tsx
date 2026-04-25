// ═══════════════════════════════════════════════════════════════
// SITA OS — Picture-in-Picture Mini Player
// Always-on-top draggable mini-view for any window
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Play, Pause, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import { APP_ACCENTS } from "@/platform/design-system/app-window-system";

export interface PiPWindow {
  id: string;
  title: string;
  type: "music" | "generic";
  data?: {
    trackName?: string;
    artist?: string;
    albumArt?: string;
    isPlaying?: boolean;
  };
}

interface PictureInPictureProps {
  windows: PiPWindow[];
  onClose: (id: string) => void;
  onExpand: (id: string) => void;
}

const PIP_SIZE = { width: 220, height: 140 };
const EDGE_SNAP = 12;

function PiPCard({ pip, index, onClose, onExpand }: {
  pip: PiPWindow; index: number;
  onClose: (id: string) => void; onExpand: (id: string) => void;
}) {
  const [pos, setPos] = useState({ x: window.innerWidth - PIP_SIZE.width - 16, y: 80 + index * (PIP_SIZE.height + 12) });
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(pip.data?.isPlaying ?? true);
  const dragOffset = useRef({ x: 0, y: 0 });
  const accent = APP_ACCENTS[pip.id] || APP_ACCENTS.default;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to nearest edge
    setPos(prev => {
      const vw = window.innerWidth;
      const snapLeft = prev.x < vw / 2;
      return {
        x: snapLeft ? EDGE_SNAP : vw - PIP_SIZE.width - EDGE_SNAP,
        y: Math.max(40, Math.min(window.innerHeight - PIP_SIZE.height - 16, prev.y)),
      };
    });
  }, [isDragging]);

  return (
    <motion.div
      className={cn("fixed overflow-hidden cursor-grab", isDragging && "cursor-grabbing")}
      style={{
        left: pos.x,
        top: pos.y,
        width: PIP_SIZE.width,
        height: PIP_SIZE.height,
        zIndex: DEPTH_LAYERS.menuBar + 30,
        background: "hsl(0 0% 10% / 0.88)",
        backdropFilter: "blur(30px) saturate(1.5)",
        borderRadius: 14,
        border: "1px solid hsl(0 0% 100% / 0.1)",
        boxShadow: "0 12px 40px hsl(0 0% 0% / 0.4)",
        transition: isDragging ? "none" : "left 0.3s ease, top 0.3s ease",
      }}
      initial={{ opacity: 0, scale: 0.5, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Accent strip */}
      <div className={cn("h-[2px] w-full bg-gradient-to-r", accent)} />

      {/* Controls */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 z-10">
        <button
          onClick={() => onExpand(pip.id)}
          className="p-1 rounded bg-[hsl(0_0%_100%/0.1)] hover:bg-[hsl(0_0%_100%/0.2)] transition-colors"
        >
          <Maximize2 className="h-2.5 w-2.5 text-[hsl(0_0%_100%/0.7)]" />
        </button>
        <button
          onClick={() => onClose(pip.id)}
          className="p-1 rounded bg-[hsl(0_0%_100%/0.1)] hover:bg-[hsl(0_80%_50%/0.3)] transition-colors"
        >
          <X className="h-2.5 w-2.5 text-[hsl(0_0%_100%/0.7)]" />
        </button>
      </div>

      {/* Content */}
      {pip.type === "music" ? (
        <div className="flex flex-col items-center justify-center h-full pt-2 pb-3 px-3">
          {/* Album art placeholder */}
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[hsl(270_60%_50%)] to-[hsl(210_70%_50%)] flex items-center justify-center mb-2 shadow-lg">
            <span className="text-2xl">🎵</span>
          </div>
          <span className="text-[11px] font-medium text-[hsl(0_0%_100%/0.9)] truncate max-w-full">
            {pip.data?.trackName || "Now Playing"}
          </span>
          <span className="text-[9px] text-[hsl(0_0%_100%/0.4)] truncate max-w-full">
            {pip.data?.artist || "Unknown Artist"}
          </span>
          {/* Playback controls */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-7 h-7 rounded-full bg-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.2)] flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 text-[hsl(0_0%_100%/0.9)]" />
              ) : (
                <Play className="h-3 w-3 text-[hsl(0_0%_100%/0.9)] ml-0.5" />
              )}
            </button>
            <button className="w-5 h-5 rounded-full hover:bg-[hsl(0_0%_100%/0.1)] flex items-center justify-center transition-colors">
              <SkipForward className="h-3 w-3 text-[hsl(0_0%_100%/0.5)]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full pt-2 px-3">
          <span className="text-2xl mb-2">📱</span>
          <span className="text-[11px] font-medium text-[hsl(0_0%_100%/0.8)]">{pip.title}</span>
          <span className="text-[9px] text-[hsl(0_0%_100%/0.3)] mt-1">Picture in Picture</span>
        </div>
      )}
    </motion.div>
  );
}

export function PictureInPicture({ windows, onClose, onExpand }: PictureInPictureProps) {
  return (
    <AnimatePresence>
      {windows.map((pip, i) => (
        <PiPCard key={pip.id} pip={pip} index={i} onClose={onClose} onExpand={onExpand} />
      ))}
    </AnimatePresence>
  );
}
