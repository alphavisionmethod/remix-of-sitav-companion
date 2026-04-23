// ═══════════════════════════════════════════════════════════════
// Personal Brain — Animated voice orb (Phase 4)
// ═══════════════════════════════════════════════════════════════
// Visual indicator with 4 states: idle, listening, thinking, speaking.
// Pure presentation — controlled by parent.
// ═══════════════════════════════════════════════════════════════

import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type VoiceOrbState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceOrbProps {
  state: VoiceOrbState;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  ariaLabel?: string;
}

const SIZE_MAP = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-32 w-32",
};

const ICON_SIZE_MAP = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function VoiceOrb({
  state,
  size = "lg",
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  ariaLabel = "Voice input",
}: VoiceOrbProps) {
  const interactive = Boolean(onClick || onPointerDown);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={state === "listening"}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      disabled={!interactive}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all",
        SIZE_MAP[size],
        state === "idle" && "bg-primary/10 text-primary hover:bg-primary/20",
        state === "listening" && "bg-primary text-primary-foreground shadow-lg shadow-primary/40",
        state === "thinking" && "bg-muted text-muted-foreground",
        state === "speaking" && "bg-accent text-accent-foreground",
        interactive && "cursor-pointer",
      )}
    >
      {/* Pulse rings for listening state */}
      {state === "listening" && (
        <>
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <span className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
        </>
      )}
      {/* Bouncing dots for thinking */}
      {state === "thinking" && (
        <span className="absolute inset-0 flex items-center justify-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
        </span>
      )}
      {/* Equalizer for speaking */}
      {state === "speaking" && (
        <span className="absolute inset-0 flex items-end justify-center gap-1 pb-3">
          <span className="h-2 w-1 animate-pulse rounded-full bg-current" />
          <span className="h-4 w-1 animate-pulse rounded-full bg-current [animation-delay:-0.2s]" />
          <span className="h-3 w-1 animate-pulse rounded-full bg-current [animation-delay:-0.4s]" />
          <span className="h-5 w-1 animate-pulse rounded-full bg-current [animation-delay:-0.1s]" />
          <span className="h-2 w-1 animate-pulse rounded-full bg-current [animation-delay:-0.3s]" />
        </span>
      )}
      {state !== "thinking" && state !== "speaking" && (
        <Mic className={cn("relative", ICON_SIZE_MAP[size])} />
      )}
    </button>
  );
}