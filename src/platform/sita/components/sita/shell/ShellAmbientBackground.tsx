// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Ambient Background
// Shared living background with wallpaper theme support
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { getWallpaperTheme, getCustomWallpaperUrl, WALLPAPER_THEMES } from "@/hooks/use-wallpaper";
import logo from "@/assets/logo.webp";

export type AmbientMood = "serene" | "alert" | "warm" | "focus" | "night";

interface ShellAmbientBackgroundProps {
  mood?: AmbientMood;
  intensity?: "subtle" | "normal" | "vivid";
  className?: string;
  wallpaperId?: string;
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

// ── Image wallpaper IDs (rendered as photos) ──
const IMAGE_WALLPAPER_IDS = new Set(["nebula", "amber", "ocean", "aurora-photo", "rose"]);

// ── Constellation Layer ──────────────────────────────────────
interface Star { id: number; x: number; y: number; size: number; opacity: number; pulse: number; }

function ConstellationOverlay() {
  const reduced = useReducedMotion();
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      size: 1.5 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.15,
      pulse: 6 + Math.random() * 8,
    }));
  }, []);

  const connections = useMemo(() => {
    const conns: { from: number; to: number; opacity: number }[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) {
          conns.push({ from: i, to: j, opacity: (1 - dist / 30) * 0.06 });
        }
      }
    }
    return conns;
  }, [stars]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((c, i) => (
          <line
            key={i}
            x1={`${stars[c.from].x}%`}
            y1={`${stars[c.from].y}%`}
            x2={`${stars[c.to].x}%`}
            y2={`${stars[c.to].y}%`}
            stroke="white"
            strokeWidth="0.5"
            opacity={c.opacity}
          />
        ))}
      </svg>
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
            background: `radial-gradient(circle, rgba(255,255,255,${s.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${s.size * 3}px rgba(180,160,255,${s.opacity * 0.5})`,
          }}
          animate={reduced ? {} : {
            opacity: [s.opacity * 0.5, s.opacity, s.opacity * 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: s.pulse,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── SITA Hero Wallpaper — large glassmorphic logo ────────────
function SitaHeroWallpaper() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/wallpapers/sita-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <GlassLogo />
    </div>
  );
}

// ── Image-based wallpaper ──
function ImageWallpaper({ src }: { src: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${src}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-0 flex items-center justify-center">
        <GlassLogo />
      </div>
    </div>
  );
}

// ── Themed gradient wallpaper (CSS-only) ──
function GradientWallpaper({ theme }: { theme: { gradient: string; overlay?: string } }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className={cn("absolute inset-0 bg-gradient-to-br", theme.gradient)} />
      {theme.overlay && (
        <div className="absolute inset-0" style={{ background: theme.overlay }} />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <GlassLogo />
      </div>
    </div>
  );
}

// ── Shared glass logo component ──
function GlassLogo() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-center"
      >
        <div className="absolute w-[280px] h-[280px] rounded-full bg-[hsl(265,55%,50%,0.08)] blur-[60px]" />
        <div className="relative w-[200px] h-[200px] rounded-full border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl flex items-center justify-center shadow-[0_0_80px_rgba(114,92,255,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <img
            src={logo}
            alt="SITA"
            className="h-24 w-24 rounded-2xl drop-shadow-[0_0_40px_rgba(114,92,255,0.5)]"
          />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute top-[calc(50%+130px)] text-center"
      >
        <div className="text-lg tracking-[0.25em] uppercase font-light text-white/40">
          SITA OS
        </div>
        <div className="mt-1.5 text-sm tracking-[0.12em] text-white/20">
          Your sovereign operating environment
        </div>
      </motion.div>
    </>
  );
}

export function ShellAmbientBackground({
  mood,
  intensity = "normal",
  className,
  wallpaperId: wallpaperIdProp,
}: ShellAmbientBackgroundProps) {
  const reduced = useReducedMotion();
  const activeMood = mood ?? getAutoMood();
  const palette = MOOD_PALETTES[activeMood];
  const intensityScale = intensity === "subtle" ? 0.6 : intensity === "vivid" ? 1.4 : 1;

  // Listen for live wallpaper change events
  const [liveWallpaper, setLiveWallpaper] = useState<{ id: string; src?: string } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLiveWallpaper({ id: detail.id, src: detail.src });
    };
    window.addEventListener("nova-wallpaper-change", handler);
    return () => window.removeEventListener("nova-wallpaper-change", handler);
  }, []);

  const currentId = liveWallpaper?.id ?? wallpaperIdProp ?? getWallpaperTheme().id;
  const isSitaHero = currentId === "sita-hero";
  const isCustom = currentId === "custom";
  const isImageWp = IMAGE_WALLPAPER_IDS.has(currentId);
  const matchedTheme = WALLPAPER_THEMES.find(t => t.id === currentId);
  const isGradientTheme = !isSitaHero && !isCustom && !isImageWp && matchedTheme && currentId !== "auto";
  const showOrbs = currentId === "auto" || (!isSitaHero && !isCustom && !isImageWp && !isGradientTheme);

  const customUrl = isCustom ? getCustomWallpaperUrl() : "";
  const imageSrc = isImageWp && liveWallpaper?.src ? liveWallpaper.src : "";

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
      {/* SITA Hero branded wallpaper */}
      {isSitaHero && <SitaHeroWallpaper />}

      {/* Image-based wallpaper (from assets) */}
      {isImageWp && imageSrc && <ImageWallpaper src={imageSrc} />}

      {/* Custom URL wallpaper */}
      {isCustom && customUrl && <ImageWallpaper src={customUrl} />}

      {/* Gradient-themed wallpaper */}
      {isGradientTheme && matchedTheme && <GradientWallpaper theme={matchedTheme} />}

      {/* Gradient orbs (for auto mode) */}
      {showOrbs && palette.orbs.map((orb, i) => (
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
          animate={reduced ? {} : {
            x: [0, 15 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, 10 * (i % 2 === 0 ? -1 : 1), 0],
          }}
          transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Constellation overlay — vivid mode */}
      {intensity === "vivid" && !isSitaHero && <ConstellationOverlay />}

      {/* Floating particles */}
      {showOrbs && particles.map((p) => (
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
          animate={{ y: [0, -25, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Dot-grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Edge gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-white/[0.02]" />

      {/* Noise texture */}
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
