// ═══════════════════════════════════════════════════════════════
// SITA OS — Adaptive Visual System
// Wallpaper-aware color extraction + time-of-day toning
// UI surfaces subtly tint to match the current wallpaper
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { getWallpaperTheme, getWallpaperId } from "@/platform/sita/hooks/use-wallpaper";

interface HSL { h: number; s: number; l: number }

/** Extract HSL values from gradient/preview strings */
function extractHSLFromGradient(gradientStr: string): HSL[] {
  const matches = gradientStr.matchAll(/hsl\((\d+[\s_]\d+%[\s_]\d+%)/g);
  const results: HSL[] = [];
  for (const m of matches) {
    const parts = m[1].replace(/_/g, " ").split(/\s+/).map(s => parseInt(s));
    if (parts.length >= 3) {
      results.push({ h: parts[0], s: parts[1], l: parts[2] });
    }
  }
  return results;
}

/** Get dominant hue from wallpaper theme */
function getDominantColor(wallpaperId: string): HSL {
  const theme = getWallpaperTheme();
  
  // Try gradient first (Tailwind classes with HSL), then preview
  const source = theme.preview || theme.gradient;
  const colors = extractHSLFromGradient(source);
  
  if (colors.length > 0) {
    // Weight toward the first (dominant) color
    return colors[0];
  }
  
  // Fallback: brand purple
  return { h: 265, s: 55, l: 58 };
}

/** Time-of-day tone modulation */
function getTimeModulation(): { tempShift: number; satMod: number; lightMod: number; label: string } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) {
    // Morning — warm gold tint
    return { tempShift: -230, satMod: 1.1, lightMod: 1.05, label: "morning" };
  } else if (hour >= 9 && hour < 17) {
    // Afternoon — neutral
    return { tempShift: 0, satMod: 1.0, lightMod: 1.0, label: "afternoon" };
  } else if (hour >= 17 && hour < 21) {
    // Evening — warm amber
    return { tempShift: -240, satMod: 0.9, lightMod: 0.95, label: "evening" };
  } else {
    // Night — cool blue
    return { tempShift: -55, satMod: 0.7, lightMod: 0.9, label: "night" };
  }
}

/** Apply adaptive CSS custom properties to :root */
function applyAdaptiveColors() {
  const wallpaperId = getWallpaperId();
  const dominant = getDominantColor(wallpaperId);
  const timeMod = getTimeModulation();
  
  const root = document.documentElement;
  
  // Adaptive accent — wallpaper dominant hue with time modulation
  const accentH = (dominant.h + timeMod.tempShift + 360) % 360;
  const accentS = Math.min(100, Math.round(dominant.s * timeMod.satMod));
  const accentL = Math.min(100, Math.round(dominant.l * timeMod.lightMod));
  
  root.style.setProperty("--adaptive-accent", `${dominant.h} ${Math.round(dominant.s * 0.6)}% ${Math.round(dominant.l * 0.8)}%`);
  root.style.setProperty("--adaptive-surface", `${dominant.h} ${Math.round(dominant.s * 0.15)}% ${Math.round(dominant.l * 0.15)}%`);
  root.style.setProperty("--adaptive-glow", `${dominant.h} ${Math.round(dominant.s * 0.8)}% ${Math.round(dominant.l * 1.1)}%`);
  root.style.setProperty("--adaptive-tint", `${dominant.h} ${Math.round(dominant.s * 0.1)}% 50%`);
  
  // Time-based ambient warmth
  root.style.setProperty("--time-warmth", timeMod.label);
  root.style.setProperty("--time-hue-shift", `${timeMod.tempShift}`);
  root.style.setProperty("--time-saturation", `${timeMod.satMod}`);
  
  // Surface tint overlay — very subtle
  const tintOpacity = wallpaperId === "auto" ? 0.03 : 0.05;
  root.style.setProperty("--surface-tint", `hsl(${dominant.h} ${Math.round(dominant.s * 0.4)}% ${Math.round(dominant.l * 0.6)}% / ${tintOpacity})`);
}

/** Hook to wire adaptive visuals into ShellLayout */
export function useAdaptiveVisuals() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const lastWallpaper = useRef<string>("");
  
  useEffect(() => {
    // Initial application
    applyAdaptiveColors();
    lastWallpaper.current = getWallpaperId();
    
    // Poll for wallpaper changes + time-of-day shifts every 30s
    intervalRef.current = setInterval(() => {
      const currentId = getWallpaperId();
      if (currentId !== lastWallpaper.current) {
        lastWallpaper.current = currentId;
      }
      applyAdaptiveColors();
    }, 30_000);
    
    // Listen for storage events (wallpaper change from settings)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sita-wallpaper") {
        applyAdaptiveColors();
      }
    };
    window.addEventListener("storage", onStorage);
    
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
}
