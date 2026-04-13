// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Wallpaper Themes
// macOS-inspired palettes with brand purple/gold accents
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";

export interface WallpaperTheme {
  id: string;
  name: string;
  category: "gradient" | "abstract" | "nature" | "minimal" | "custom";
  gradient: string;
  overlay?: string;
  preview: string;
}

const STORAGE_KEY = "sita-wallpaper";
const CUSTOM_URL_KEY = "sita-custom-wallpaper-url";

export const WALLPAPER_THEMES: WallpaperTheme[] = [
  // ── SITA Hero (default first boot) ──
  {
    id: "sita-hero",
    name: "SITA Hero",
    category: "gradient",
    gradient: "from-[hsl(230_60%_18%)] via-[hsl(260_50%_22%)] to-[hsl(280_45%_16%)]",
    overlay: "radial-gradient(ellipse at 50% 45%, hsl(265 60% 40% / 0.35), transparent 55%)",
    preview: "url('/wallpapers/sita-hero.png')",
  },

  // ── Auto (time-based) ──
  {
    id: "auto",
    name: "Auto (Time of Day)",
    category: "gradient",
    gradient: "",
    preview: "linear-gradient(135deg, hsl(265 55% 35%), hsl(38 85% 55%), hsl(265 40% 20%))",
  },

  // ── Gradients — vibrant macOS-style ──
  {
    id: "sita-brand",
    name: "SITA Brand",
    category: "gradient",
    gradient: "from-[hsl(265_55%_30%)] via-[hsl(280_50%_25%)] to-[hsl(38_70%_25%)]",
    overlay: "radial-gradient(ellipse at 60% 40%, hsl(265 60% 45% / 0.3), transparent 60%)",
    preview: "linear-gradient(135deg, hsl(265 55% 35%), hsl(280 50% 30%), hsl(38 70% 35%))",
  },
  {
    id: "aurora",
    name: "Aurora Borealis",
    category: "gradient",
    gradient: "from-[hsl(160_50%_18%)] via-[hsl(200_45%_22%)] to-[hsl(265_40%_20%)]",
    preview: "linear-gradient(135deg, hsl(160 50% 22%), hsl(200 45% 26%), hsl(265 40% 25%))",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    category: "gradient",
    gradient: "from-[hsl(15_65%_28%)] via-[hsl(340_50%_25%)] to-[hsl(270_45%_20%)]",
    preview: "linear-gradient(135deg, hsl(15 65% 32%), hsl(340 50% 28%), hsl(270 45% 24%))",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    category: "gradient",
    gradient: "from-[hsl(210_55%_16%)] via-[hsl(225_50%_22%)] to-[hsl(200_45%_26%)]",
    preview: "linear-gradient(135deg, hsl(210 55% 20%), hsl(225 50% 26%), hsl(200 45% 30%))",
  },
  {
    id: "midnight-purple",
    name: "Royal Purple",
    category: "gradient",
    gradient: "from-[hsl(265_50%_18%)] via-[hsl(280_45%_24%)] to-[hsl(240_40%_16%)]",
    preview: "linear-gradient(135deg, hsl(265 50% 22%), hsl(280 45% 28%), hsl(240 40% 20%))",
  },

  // ── NEW Premium Gradients ──
  {
    id: "cosmic-drift",
    name: "Cosmic Drift",
    category: "gradient",
    gradient: "from-[hsl(270_60%_12%)] via-[hsl(310_50%_18%)] to-[hsl(230_55%_14%)]",
    overlay: "radial-gradient(ellipse at 30% 50%, hsl(290 70% 40% / 0.25), transparent 55%), radial-gradient(ellipse at 75% 35%, hsl(220 60% 35% / 0.2), transparent 50%)",
    preview: "linear-gradient(135deg, hsl(270 60% 16%), hsl(310 50% 22%), hsl(230 55% 18%))",
  },
  {
    id: "emerald-night",
    name: "Emerald Night",
    category: "gradient",
    gradient: "from-[hsl(155_55%_10%)] via-[hsl(170_50%_16%)] to-[hsl(195_45%_12%)]",
    overlay: "radial-gradient(ellipse at 50% 40%, hsl(165 60% 28% / 0.3), transparent 55%)",
    preview: "linear-gradient(135deg, hsl(155 55% 14%), hsl(170 50% 20%), hsl(195 45% 16%))",
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    category: "gradient",
    gradient: "from-[hsl(30_70%_18%)] via-[hsl(15_75%_22%)] to-[hsl(350_60%_16%)]",
    overlay: "radial-gradient(ellipse at 40% 45%, hsl(25 80% 40% / 0.3), transparent 55%)",
    preview: "linear-gradient(135deg, hsl(30 70% 22%), hsl(15 75% 28%), hsl(350 60% 20%))",
  },
  {
    id: "midnight-city",
    name: "Midnight City",
    category: "gradient",
    gradient: "from-[hsl(220_30%_8%)] via-[hsl(235_25%_14%)] to-[hsl(250_20%_10%)]",
    overlay: "radial-gradient(ellipse at 55% 60%, hsl(230 35% 22% / 0.35), transparent 50%)",
    preview: "linear-gradient(135deg, hsl(220 30% 12%), hsl(235 25% 18%), hsl(250 20% 14%))",
  },
  {
    id: "lavender-haze",
    name: "Lavender Haze",
    category: "gradient",
    gradient: "from-[hsl(280_40%_16%)] via-[hsl(300_35%_20%)] to-[hsl(260_45%_14%)]",
    overlay: "radial-gradient(ellipse at 60% 40%, hsl(290 50% 35% / 0.25), transparent 55%)",
    preview: "linear-gradient(135deg, hsl(280 40% 20%), hsl(300 35% 26%), hsl(260 45% 18%))",
  },
  {
    id: "carbon-fiber",
    name: "Carbon Fiber",
    category: "minimal",
    gradient: "from-[hsl(0_0%_6%)] via-[hsl(0_0%_9%)] to-[hsl(0_0%_5%)]",
    overlay: "radial-gradient(ellipse at 50% 50%, hsl(0 0% 15% / 0.2), transparent 60%)",
    preview: "linear-gradient(135deg, hsl(0 0% 8%), hsl(0 0% 12%), hsl(0 0% 6%))",
  },

  // ── Abstract — richer, brighter ──
  {
    id: "ember-flow",
    name: "Ember Flow",
    category: "abstract",
    gradient: "from-[hsl(0_50%_18%)] via-[hsl(30_60%_22%)] to-[hsl(350_45%_16%)]",
    overlay: "radial-gradient(ellipse at 30% 40%, hsl(20 70% 30% / 0.4), transparent 60%)",
    preview: "linear-gradient(135deg, hsl(0 50% 22%), hsl(30 60% 28%), hsl(350 45% 20%))",
  },
  {
    id: "nebula",
    name: "Nebula",
    category: "abstract",
    gradient: "from-[hsl(260_50%_16%)] via-[hsl(300_40%_22%)] to-[hsl(220_45%_18%)]",
    overlay: "radial-gradient(ellipse at 70% 30%, hsl(280 60% 35% / 0.3), transparent 50%), radial-gradient(ellipse at 20% 70%, hsl(220 50% 30% / 0.3), transparent 50%)",
    preview: "linear-gradient(135deg, hsl(260 50% 20%), hsl(300 40% 26%), hsl(220 45% 22%))",
  },
  {
    id: "liquid-silk",
    name: "Liquid Silk",
    category: "abstract",
    gradient: "from-[hsl(240_30%_14%)] via-[hsl(260_25%_20%)] to-[hsl(280_30%_16%)]",
    overlay: "radial-gradient(ellipse at 50% 50%, hsl(265 40% 28% / 0.35), transparent 60%)",
    preview: "linear-gradient(135deg, hsl(240 30% 18%), hsl(260 25% 24%), hsl(280 30% 20%))",
  },

  // ── Nature ──
  {
    id: "forest-dusk",
    name: "Forest at Dusk",
    category: "nature",
    gradient: "from-[hsl(140_40%_14%)] via-[hsl(160_35%_20%)] to-[hsl(180_30%_12%)]",
    preview: "linear-gradient(135deg, hsl(140 40% 18%), hsl(160 35% 24%), hsl(180 30% 16%))",
  },
  {
    id: "desert-twilight",
    name: "Desert Twilight",
    category: "nature",
    gradient: "from-[hsl(25_50%_20%)] via-[hsl(35_45%_26%)] to-[hsl(15_35%_16%)]",
    preview: "linear-gradient(135deg, hsl(25 50% 24%), hsl(35 45% 30%), hsl(15 35% 20%))",
  },
  {
    id: "mountain-dawn",
    name: "Mountain Dawn",
    category: "nature",
    gradient: "from-[hsl(200_35%_18%)] via-[hsl(30_45%_24%)] to-[hsl(220_30%_14%)]",
    preview: "linear-gradient(135deg, hsl(200 35% 22%), hsl(30 45% 28%), hsl(220 30% 18%))",
  },
  {
    id: "arctic-glow",
    name: "Arctic Glow",
    category: "nature",
    gradient: "from-[hsl(195_40%_18%)] via-[hsl(210_35%_24%)] to-[hsl(220_45%_16%)]",
    preview: "linear-gradient(135deg, hsl(195 40% 22%), hsl(210 35% 28%), hsl(220 45% 20%))",
  },

  // ── Minimal ──
  {
    id: "pure-dark",
    name: "Pure Dark",
    category: "minimal",
    gradient: "from-[hsl(240_10%_8%)] via-[hsl(240_8%_10%)] to-[hsl(240_10%_6%)]",
    preview: "linear-gradient(135deg, hsl(240 10% 10%), hsl(240 8% 12%), hsl(240 10% 8%))",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    category: "minimal",
    gradient: "from-[hsl(220_12%_12%)] via-[hsl(220_10%_16%)] to-[hsl(220_14%_10%)]",
    preview: "linear-gradient(135deg, hsl(220 12% 14%), hsl(220 10% 18%), hsl(220 14% 12%))",
  },
  {
    id: "slate-warmth",
    name: "Warm Slate",
    category: "minimal",
    gradient: "from-[hsl(30_12%_12%)] via-[hsl(25_10%_16%)] to-[hsl(20_8%_10%)]",
    preview: "linear-gradient(135deg, hsl(30 12% 14%), hsl(25 10% 18%), hsl(20 8% 12%))",
  },
];

export function getCustomWallpaperUrl(): string {
  try {
    return localStorage.getItem(CUSTOM_URL_KEY) || "";
  } catch {
    return "";
  }
}

export function setCustomWallpaperUrl(url: string) {
  try {
    localStorage.setItem(CUSTOM_URL_KEY, url);
  } catch {}
}

export function getWallpaperId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "sita-hero";
  } catch {
    return "sita-hero";
  }
}

export function getWallpaperTheme(): WallpaperTheme {
  const id = getWallpaperId();
  return WALLPAPER_THEMES.find(t => t.id === id) ?? WALLPAPER_THEMES[0];
}

export function useWallpaper() {
  const [activeId, setActiveId] = useState(getWallpaperId);
  const [customUrl, setCustomUrlState] = useState(getCustomWallpaperUrl);

  const setWallpaper = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setActiveId(id);
  }, []);

  const setCustomUrl = useCallback((url: string) => {
    setCustomWallpaperUrl(url);
    setCustomUrlState(url);
  }, []);

  const theme = WALLPAPER_THEMES.find(t => t.id === activeId) ?? WALLPAPER_THEMES[0];

  return { activeId, theme, setWallpaper, themes: WALLPAPER_THEMES, customUrl, setCustomUrl };
}
