// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Ambient Background
// Shared living background across Lock Screen, Desktop, Setup
// Responds to time-of-day, trust state, display mode, and wallpaper
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { SettingsService } from "@/lib/nova-sdk/services/settings-service";

export type AmbientMood = "serene" | "alert" | "warm" | "focus" | "night";

interface ShellAmbientBackgroundProps {
  mood?: AmbientMood;
  intensity?: "subtle" | "normal" | "vivid";
  className?: string;
}

const MOOD_PALETTES: Record<AmbientMood, { orbs: { color: string; x: string; y: string; size: number }[] }> = {
  serene: {
    orbs: [
      { color: "hsl(265 55% 58% / 0.09)", x: "25%", y: "20%", size: 650 },
      { color: "hsl(190 60% 50% / 0.06)", x: "70%", y: "65%", size: 550 },
      { color: "hsl(38 85% 58% / 0.04)", x: "50%", y: "85%", size: 450 },
      { color: "hsl(330 50% 55% / 0.03)", x: "85%", y: "25%", size: 350 },
    ],
  },
  alert: {
    orbs: [
      { color: "hsl(25 90% 55% / 0.09)", x: "30%", y: "25%", size: 600 },
      { color: "hsl(265 55% 58% / 0.07)", x: "65%", y: "60%", size: 520 },
      { color: "hsl(0 65% 52% / 0.04)", x: "80%", y: "20%", size: 380 },
      { color: "hsl(45 80% 55% / 0.03)", x: "15%", y: "75%", size: 320 },
    ],
  },
  warm: {
    orbs: [
      { color: "hsl(38 85% 58% / 0.09)", x: "35%", y: "30%", size: 630 },
      { color: "hsl(25 90% 55% / 0.06)", x: "60%", y: "70%", size: 500 },
      { color: "hsl(265 55% 58% / 0.04)", x: "20%", y: "80%", size: 420 },
      { color: "hsl(15 80% 50% / 0.03)", x: "80%", y: "40%", size: 350 },
    ],
  },
  focus: {
    orbs: [
      { color: "hsl(265 55% 58% / 0.06)", x: "50%", y: "40%", size: 750 },
      { color: "hsl(220 30% 50% / 0.04)", x: "30%", y: "70%", size: 450 },
      { color: "hsl(200 50% 45% / 0.03)", x: "75%", y: "25%", size: 350 },
    ],
  },
  night: {
    orbs: [
      { color: "hsl(240 40% 35% / 0.07)", x: "40%", y: "30%", size: 700 },
      { color: "hsl(265 55% 58% / 0.05)", x: "70%", y: "60%", size: 550 },
      { color: "hsl(220 50% 20% / 0.05)", x: "20%", y: "75%", size: 450 },
      { color: "hsl(280 40% 40% / 0.03)", x: "60%", y: "15%", size: 380 },
    ],
  },
};

function getAutoMood(): AmbientMood {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "warm";
  if (hour >= 12 && hour < 18) return "serene";
  if (hour >= 18 && hour < 21) return "warm";
  return "night";
}

export function ShellAmbientBackground({
  mood,
  intensity = "normal",
  className,
}: ShellAmbientBackgroundProps) {
  const reduced = useReducedMotion();
  const activeMood = mood ?? getAutoMood();
  const palette = MOOD_PALETTES[activeMood];
  const intensityScale = intensity === "subtle" ? 0.6 : intensity === "vivid" ? 1.4 : 1;

  // Wallpaper state — persisted via SettingsService
  const [wallpaper, setWallpaper] = useState<{ id: string; src: string }>(() => {
    // Read initial value from SettingsService
    try {
      const saved = SettingsService.get("appearance.wallpaper") as string | undefined;
      if (saved && saved !== "dynamic") {
        return { id: saved, src: "" }; // src will be set by the event
      }
    } catch {}
    return { id: "dynamic", src: "" };
  });

  // Listen for wallpaper change events from Settings
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setWallpaper({ id: detail.id, src: detail.src });
      }
    };
    window.addEventListener("nova-wallpaper-change", handler);

    // Also fire initial load from settings
    try {
      const saved = SettingsService.get("appearance.wallpaper") as string | undefined;
      if (saved && saved !== "dynamic") {
        // Import the wallpaper dynamically
        import(`../../../assets/wallpapers/${saved}.jpg`)
          .then(mod => setWallpaper({ id: saved, src: mod.default }))
          .catch(() => {});
      }
    } catch {}

    return () => window.removeEventListener("nova-wallpaper-change", handler);
  }, []);

  const showImage = wallpaper.id !== "dynamic" && wallpaper.src;

  const particles = useMemo(() => {
    if (reduced) return [];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      size: 1.5 + Math.random() * 2,
      opacity: 0.08 + Math.random() * 0.12,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 4,
    }));
  }, [reduced]);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none select-none", className)}
      aria-hidden="true"
    >
      {/* Wallpaper image layer */}
      <AnimatePresence mode="wait">
        {showImage && (
          <motion.div
            key={wallpaper.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src={wallpaper.src}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* Subtle vignette on top of wallpaper */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(0_0%_0%/0.4)_100%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient orbs — only shown for dynamic wallpaper or as subtle overlay */}
      {(!showImage || wallpaper.id === "dynamic") && palette.orbs.map((orb, i) => (
        <motion.div
          key={`${activeMood}-${i}`}
          className="absolute rounded-full"
          style={{
            width: orb.size * intensityScale,
            height: orb.size * intensityScale,
            left: orb.x,
            top: orb.y,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${60 + i * 20}px)`,
          }}
          animate={
            reduced
              ? {}
              : {
                  x: [0, 15 * (i % 2 === 0 ? 1 : -1), 0],
                  y: [0, 10 * (i % 2 === 0 ? -1 : 1), 0],
                }
          }
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles — only for dynamic */}
      {!showImage && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `hsl(265 55% 58% / ${p.opacity})`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
