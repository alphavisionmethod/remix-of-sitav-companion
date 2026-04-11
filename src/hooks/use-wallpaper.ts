// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Wallpaper Themes
// Persists selected wallpaper in localStorage, provides getter
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";

export interface WallpaperTheme {
  id: string;
  name: string;
  category: "gradient" | "abstract" | "nature" | "minimal";
  gradient: string;
  /** CSS for optional overlay effects */
  overlay?: string;
  preview: string; // small CSS gradient for the picker thumbnail
}

const STORAGE_KEY = "sita-wallpaper";

export const WALLPAPER_THEMES: WallpaperTheme[] = [
  // ── Auto (time-based, default) ──
  {
    id: "auto",
    name: "Auto (Time of Day)",
    category: "gradient",
    gradient: "", // handled dynamically
    preview: "linear-gradient(135deg, hsl(35 80% 15%), hsl(265 30% 10%))",
  },

  // ── Gradients ──
  {
    id: "aurora",
    name: "Aurora Borealis",
    category: "gradient",
    gradient: "from-[hsl(160_60%_8%)] via-[hsl(200_50%_12%)] to-[hsl(280_40%_10%)]",
    preview: "linear-gradient(135deg, hsl(160 60% 8%), hsl(200 50% 12%), hsl(280 40% 10%))",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    category: "gradient",
    gradient: "from-[hsl(15_70%_14%)] via-[hsl(340_50%_12%)] to-[hsl(270_40%_8%)]",
    preview: "linear-gradient(135deg, hsl(15 70% 14%), hsl(340 50% 12%), hsl(270 40% 8%))",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    category: "gradient",
    gradient: "from-[hsl(210_60%_6%)] via-[hsl(230_50%_10%)] to-[hsl(200_40%_14%)]",
    preview: "linear-gradient(135deg, hsl(210 60% 6%), hsl(230 50% 10%), hsl(200 40% 14%))",
  },
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    category: "gradient",
    gradient: "from-[hsl(270_50%_8%)] via-[hsl(290_40%_12%)] to-[hsl(240_35%_6%)]",
    preview: "linear-gradient(135deg, hsl(270 50% 8%), hsl(290 40% 12%), hsl(240 35% 6%))",
  },

  // ── Abstract ──
  {
    id: "ember-flow",
    name: "Ember Flow",
    category: "abstract",
    gradient: "from-[hsl(0_50%_8%)] via-[hsl(30_60%_10%)] to-[hsl(350_40%_6%)]",
    overlay: "radial-gradient(ellipse at 30% 40%, hsl(20 70% 15% / 0.4), transparent 60%)",
    preview: "linear-gradient(135deg, hsl(0 50% 8%), hsl(30 60% 10%), hsl(350 40% 6%))",
  },
  {
    id: "nebula",
    name: "Nebula",
    category: "abstract",
    gradient: "from-[hsl(260_50%_6%)] via-[hsl(300_35%_10%)] to-[hsl(220_40%_8%)]",
    overlay: "radial-gradient(ellipse at 70% 30%, hsl(280 60% 20% / 0.3), transparent 50%), radial-gradient(ellipse at 20% 70%, hsl(220 50% 15% / 0.3), transparent 50%)",
    preview: "linear-gradient(135deg, hsl(260 50% 6%), hsl(300 35% 10%), hsl(220 40% 8%))",
  },
  {
    id: "liquid-silk",
    name: "Liquid Silk",
    category: "abstract",
    gradient: "from-[hsl(240_30%_5%)] via-[hsl(260_20%_10%)] to-[hsl(280_25%_7%)]",
    overlay: "radial-gradient(ellipse at 50% 50%, hsl(265 40% 14% / 0.35), transparent 60%)",
    preview: "linear-gradient(135deg, hsl(240 30% 5%), hsl(260 20% 10%), hsl(280 25% 7%))",
  },

  // ── Nature ──
  {
    id: "forest-dusk",
    name: "Forest at Dusk",
    category: "nature",
    gradient: "from-[hsl(140_40%_6%)] via-[hsl(160_30%_10%)] to-[hsl(180_25%_5%)]",
    preview: "linear-gradient(135deg, hsl(140 40% 6%), hsl(160 30% 10%), hsl(180 25% 5%))",
  },
  {
    id: "desert-twilight",
    name: "Desert Twilight",
    category: "nature",
    gradient: "from-[hsl(25_50%_10%)] via-[hsl(35_40%_14%)] to-[hsl(15_30%_8%)]",
    preview: "linear-gradient(135deg, hsl(25 50% 10%), hsl(35 40% 14%), hsl(15 30% 8%))",
  },
  {
    id: "mountain-dawn",
    name: "Mountain Dawn",
    category: "nature",
    gradient: "from-[hsl(200_30%_8%)] via-[hsl(30_40%_12%)] to-[hsl(220_25%_6%)]",
    preview: "linear-gradient(135deg, hsl(200 30% 8%), hsl(30 40% 12%), hsl(220 25% 6%))",
  },
  {
    id: "arctic-glow",
    name: "Arctic Glow",
    category: "nature",
    gradient: "from-[hsl(195_35%_8%)] via-[hsl(210_30%_12%)] to-[hsl(220_40%_6%)]",
    preview: "linear-gradient(135deg, hsl(195 35% 8%), hsl(210 30% 12%), hsl(220 40% 6%))",
  },

  // ── Minimal ──
  {
    id: "pure-dark",
    name: "Pure Dark",
    category: "minimal",
    gradient: "from-[hsl(0_0%_4%)] via-[hsl(0_0%_6%)] to-[hsl(0_0%_3%)]",
    preview: "linear-gradient(135deg, hsl(0 0% 4%), hsl(0 0% 6%), hsl(0 0% 3%))",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    category: "minimal",
    gradient: "from-[hsl(220_10%_8%)] via-[hsl(220_8%_10%)] to-[hsl(220_12%_6%)]",
    preview: "linear-gradient(135deg, hsl(220 10% 8%), hsl(220 8% 10%), hsl(220 12% 6%))",
  },
  {
    id: "slate-warmth",
    name: "Warm Slate",
    category: "minimal",
    gradient: "from-[hsl(30_10%_7%)] via-[hsl(25_8%_9%)] to-[hsl(20_6%_5%)]",
    preview: "linear-gradient(135deg, hsl(30 10% 7%), hsl(25 8% 9%), hsl(20 6% 5%))",
  },
];

export function getWallpaperId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "auto";
  } catch {
    return "auto";
  }
}

export function getWallpaperTheme(): WallpaperTheme {
  const id = getWallpaperId();
  return WALLPAPER_THEMES.find(t => t.id === id) ?? WALLPAPER_THEMES[0];
}

export function useWallpaper() {
  const [activeId, setActiveId] = useState(getWallpaperId);

  const setWallpaper = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setActiveId(id);
  }, []);

  const theme = WALLPAPER_THEMES.find(t => t.id === activeId) ?? WALLPAPER_THEMES[0];

  return { activeId, theme, setWallpaper, themes: WALLPAPER_THEMES };
}
