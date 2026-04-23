// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Presence Orb (Phase A)
// ═══════════════════════════════════════════════════════════════
// Cinematic, draggable holographic orb that lives at the shell
// level. Visualises Sita's presence state from the HUD bus.
//
// Visual states:
//   idle      → slow breathing glow
//   listening → fast double-ring pulse + audio waveform
//   thinking  → orbiting particles
//   speaking  → reactive equaliser
//   muted     → dimmed, no animation
//
// Implementation notes:
//   • Pure CSS + framer-motion (no WebGL) so it works on every
//     runtime tier without an extra dep. Phase F can promote to
//     a shader on Tier 1/2 if we want.
//   • Honors prefers-reduced-motion via existing useReducedMotion.
//   • Position persists in localStorage (per device).
//   • Tap to open the existing Personal Brain voice route.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSitaHud, type SitaPresenceState } from "./sita-hud-bus";

const POS_KEY = "sita_hud_orb_pos_v1";
const ORB_SIZE = 88;
const EDGE = 16;

interface StoredPos { x: number; y: number; }

function readStoredPos(): StoredPos | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredPos;
    if (typeof p?.x !== "number" || typeof p?.y !== "number") return null;
    return p;
  } catch { return null; }
}

function writeStoredPos(p: StoredPos) {
  try { window.localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function defaultPos(): StoredPos {
  if (typeof window === "undefined") return { x: 100, y: 100 };
  return {
    x: window.innerWidth - ORB_SIZE - EDGE - 8,
    y: window.innerHeight - ORB_SIZE - EDGE - 96, // above dock
  };
}

function clampToViewport(p: StoredPos): StoredPos {
  if (typeof window === "undefined") return p;
  const maxX = Math.max(EDGE, window.innerWidth - ORB_SIZE - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - ORB_SIZE - EDGE);
  return {
    x: Math.min(Math.max(EDGE, p.x), maxX),
    y: Math.min(Math.max(EDGE, p.y), maxY),
  };
}

const STATE_LABEL: Record<SitaPresenceState, string> = {
  idle: "Sita ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  muted: "Sita muted",
};

export function SitaPresenceOrb() {
  const reduced = useReducedMotion();
  const hud = useSitaHud();
  const navigate = useNavigate();

  const initial = clampToViewport(readStoredPos() ?? defaultPos());
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);

  const [hover, setHover] = useState(false);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);

  // Re-clamp on viewport resize.
  useEffect(() => {
    const onResize = () => {
      const p = clampToViewport({ x: x.get(), y: y.get() });
      animate(x, p.x, { duration: 0.2 });
      animate(y, p.y, { duration: 0.2 });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [x, y]);

  const handleTap = useCallback(() => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    // Open the canonical voice surface (Phase B will replace with shell modal).
    navigate("/personal-brain/voice-settings");
  }, [navigate]);

  const presence: SitaPresenceState = hud.presence;
  const intensity = Math.min(1, Math.max(0, hud.level));

  // Color by state — all via design tokens (HSL).
  const ringColor = {
    idle: "hsl(var(--primary) / 0.35)",
    listening: "hsl(var(--primary) / 0.7)",
    thinking: "hsl(265 65% 65% / 0.55)",
    speaking: "hsl(190 70% 55% / 0.6)",
    muted: "hsl(var(--muted-foreground) / 0.3)",
  }[presence];

  const coreGlow = {
    idle: "hsl(var(--primary) / 0.45)",
    listening: "hsl(var(--primary) / 0.85)",
    thinking: "hsl(265 70% 65% / 0.75)",
    speaking: "hsl(190 75% 60% / 0.8)",
    muted: "hsl(var(--muted-foreground) / 0.35)",
  }[presence];

  return (
    <motion.div
      className="fixed z-[60] select-none touch-none"
      style={{ x, y, width: ORB_SIZE, height: ORB_SIZE }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => { draggingRef.current = true; dragMovedRef.current = false; }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) + Math.abs(info.offset.y) > 6) dragMovedRef.current = true;
      }}
      onDragEnd={() => {
        draggingRef.current = false;
        const next = clampToViewport({ x: x.get(), y: y.get() });
        animate(x, next.x, { type: "spring", stiffness: 280, damping: 28 });
        animate(y, next.y, { type: "spring", stiffness: 280, damping: 28 });
        writeStoredPos(next);
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      {/* Outer pulse ring (listening) */}
      {presence === "listening" && !reduced && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${ringColor} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: ringColor }}
            animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
          />
        </>
      )}

      {/* Idle slow-breathing halo */}
      {presence === "idle" && !reduced && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${ringColor} 0%, transparent 65%)` }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.15, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Speaking — soft expanding wash driven by audio level */}
      {presence === "speaking" && !reduced && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${coreGlow} 0%, transparent 70%)` }}
          animate={{ scale: 1 + 0.25 * intensity, opacity: 0.5 + 0.4 * intensity }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
      )}

      {/* Thinking — orbiting particles */}
      {presence === "thinking" && !reduced && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          {[0, 120, 240].map((deg) => (
            <span
              key={deg}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-primary/80 shadow-[0_0_10px_hsl(var(--primary)/0.8)]"
              style={{
                transform: `rotate(${deg}deg) translateY(-${ORB_SIZE / 2 - 2}px)`,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Core */}
      <motion.button
        type="button"
        aria-label={`${STATE_LABEL[presence]}. Open Sita.`}
        onClick={handleTap}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative h-full w-full rounded-full",
          "border border-white/15 backdrop-blur-2xl",
          "flex items-center justify-center",
          "shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.55),inset_0_1px_0_rgba(255,255,255,0.18)]",
          "transition-colors",
          presence === "muted" ? "bg-muted/30" : "bg-background/30 hover:bg-background/40",
        )}
        style={{
          backgroundImage:
            presence === "muted"
              ? undefined
              : `radial-gradient(circle at 30% 25%, ${coreGlow} 0%, transparent 60%)`,
        }}
      >
        {/* Inner glass dot */}
        <span
          className="pointer-events-none absolute inset-3 rounded-full opacity-80"
          style={{
            background:
              presence === "muted"
                ? "radial-gradient(circle at 35% 30%, hsl(var(--muted-foreground)/0.25) 0%, transparent 70%)"
                : `radial-gradient(circle at 35% 30%, ${coreGlow} 0%, transparent 75%)`,
            filter: "blur(2px)",
          }}
        />

        {/* Icon — only shown when not animating waves */}
        {(presence === "idle" || presence === "muted") && (
          <span className="relative">
            {presence === "muted" ? (
              <MicOff className="h-7 w-7 text-muted-foreground" />
            ) : (
              <Sparkles className="h-7 w-7 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
            )}
          </span>
        )}

        {/* Listening — live mic + audio bars */}
        {presence === "listening" && (
          <span className="relative flex items-end gap-[3px] h-7">
            <Mic className="absolute -top-1 left-1/2 -translate-x-1/2 h-3 w-3 text-primary-foreground/90" />
            {[0.4, 0.8, 1.0, 0.6, 0.3].map((mult, i) => {
              const h = 6 + Math.round(intensity * 18 * mult) + (i % 2 ? 2 : 0);
              return (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full bg-primary-foreground/85"
                  animate={reduced ? {} : { height: [h * 0.5, h, h * 0.6] }}
                  transition={{ duration: 0.45 + i * 0.05, repeat: Infinity, ease: "easeInOut" }}
                  style={{ height: h }}
                />
              );
            })}
          </span>
        )}

        {/* Speaking — soft equaliser */}
        {presence === "speaking" && (
          <span className="relative flex items-end gap-[3px] h-8">
            {[0.5, 0.9, 0.6, 1.0, 0.7, 0.4].map((mult, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-cyan-200/90"
                animate={reduced ? {} : { height: [4, 8 + 14 * mult, 4] }}
                transition={{ duration: 0.55 + i * 0.04, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </span>
        )}

        {/* Thinking — three dots */}
        {presence === "thinking" && (
          <span className="relative flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={reduced ? {} : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </span>
        )}
      </motion.button>

      {/* Hover label */}
      <AnimatePresence>
        {hover && !draggingRef.current && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-background/70 px-3 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur-md shadow-lg"
          >
            {STATE_LABEL[presence]}
            {hud.transcript ? <span className="ml-2 text-muted-foreground">· {truncate(hud.transcript, 36)}</span> : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1)}…`;
}
