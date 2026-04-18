// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel UI Theme System
// Semantic color tokens, spacing scale, typography, and
// theme switching for the view-tree widget toolkit
// ═══════════════════════════════════════════════════════════════

import type { Color } from "./software-rasterizer";

// ── Semantic Color Tokens ───────────────────────────────────

export interface ThemeColors {
  /** Primary brand color */
  primary: Color;
  primaryForeground: Color;

  /** Secondary accent */
  secondary: Color;
  secondaryForeground: Color;

  /** Backgrounds */
  background: Color;
  surface: Color;
  surfaceRaised: Color;

  /** Text */
  foreground: Color;
  foregroundMuted: Color;
  foregroundSubtle: Color;

  /** Borders */
  border: Color;
  borderFocused: Color;

  /** Status */
  success: Color;
  successForeground: Color;
  warning: Color;
  warningForeground: Color;
  error: Color;
  errorForeground: Color;
  info: Color;
  infoForeground: Color;

  /** Interactive states */
  hoverOverlay: Color;   // semi-transparent overlay
  pressOverlay: Color;
  disabledOverlay: Color;
}

// ── Spacing Scale ───────────────────────────────────────────

export interface ThemeSpacing {
  xxs: number;  // 2
  xs: number;   // 4
  sm: number;   // 8
  md: number;   // 12
  lg: number;   // 16
  xl: number;   // 24
  xxl: number;  // 32
  xxxl: number; // 48
}

// ── Typography ──────────────────────────────────────────────

export interface ThemeTypography {
  fontFamily: string;
  sizes: {
    caption: number;   // 10
    small: number;     // 12
    body: number;      // 14
    subtitle: number;  // 16
    title: number;     // 20
    heading: number;   // 24
    display: number;   // 32
  };
  weights: {
    normal: string;
    medium: string;
    bold: string;
  };
  lineHeights: {
    tight: number;     // 1.2
    normal: number;    // 1.5
    relaxed: number;   // 1.75
  };
}

// ── Border Radii ────────────────────────────────────────────

export interface ThemeRadii {
  none: number;   // 0
  sm: number;     // 4
  md: number;     // 6
  lg: number;     // 8
  xl: number;     // 12
  xxl: number;    // 16
  full: number;   // 9999
}

// ── Shadows ─────────────────────────────────────────────────

export interface ThemeShadowDef {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: Color;
}

export interface ThemeShadows {
  sm: ThemeShadowDef;
  md: ThemeShadowDef;
  lg: ThemeShadowDef;
  xl: ThemeShadowDef;
}

// ── Complete Theme ──────────────────────────────────────────

export interface UITheme {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  radii: ThemeRadii;
  shadows: ThemeShadows;
}

// ═════════════════════════════════════════════════════════════
// Built-in Themes
// ═════════════════════════════════════════════════════════════

const SHARED_SPACING: ThemeSpacing = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
};

const SHARED_TYPOGRAPHY: ThemeTypography = {
  fontFamily: "Inter, system-ui, sans-serif",
  sizes: { caption: 10, small: 12, body: 14, subtitle: 16, title: 20, heading: 24, display: 32 },
  weights: { normal: "400", medium: "500", bold: "700" },
  lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
};

const SHARED_RADII: ThemeRadii = {
  none: 0, sm: 4, md: 6, lg: 8, xl: 12, xxl: 16, full: 9999,
};

export const LIGHT_THEME: UITheme = {
  id: "light",
  name: "Light",
  isDark: false,
  colors: {
    primary:             { r: 59,  g: 130, b: 246, a: 255 },
    primaryForeground:   { r: 255, g: 255, b: 255, a: 255 },
    secondary:           { r: 100, g: 116, b: 139, a: 255 },
    secondaryForeground: { r: 255, g: 255, b: 255, a: 255 },
    background:          { r: 255, g: 255, b: 255, a: 255 },
    surface:             { r: 248, g: 250, b: 252, a: 255 },
    surfaceRaised:       { r: 255, g: 255, b: 255, a: 255 },
    foreground:          { r: 15,  g: 23,  b: 42,  a: 255 },
    foregroundMuted:     { r: 100, g: 116, b: 139, a: 255 },
    foregroundSubtle:    { r: 148, g: 163, b: 184, a: 255 },
    border:              { r: 226, g: 232, b: 240, a: 255 },
    borderFocused:       { r: 59,  g: 130, b: 246, a: 255 },
    success:             { r: 34,  g: 197, b: 94,  a: 255 },
    successForeground:   { r: 255, g: 255, b: 255, a: 255 },
    warning:             { r: 245, g: 158, b: 11,  a: 255 },
    warningForeground:   { r: 255, g: 255, b: 255, a: 255 },
    error:               { r: 239, g: 68,  b: 68,  a: 255 },
    errorForeground:     { r: 255, g: 255, b: 255, a: 255 },
    info:                { r: 59,  g: 130, b: 246, a: 255 },
    infoForeground:      { r: 255, g: 255, b: 255, a: 255 },
    hoverOverlay:        { r: 0,   g: 0,   b: 0,   a: 13  },
    pressOverlay:        { r: 0,   g: 0,   b: 0,   a: 26  },
    disabledOverlay:     { r: 255, g: 255, b: 255, a: 128 },
  },
  spacing: SHARED_SPACING,
  typography: SHARED_TYPOGRAPHY,
  radii: SHARED_RADII,
  shadows: {
    sm: { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: { r: 0, g: 0, b: 0, a: 13 } },
    md: { offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: { r: 0, g: 0, b: 0, a: 26 } },
    lg: { offsetX: 0, offsetY: 10, blur: 15, spread: -3, color: { r: 0, g: 0, b: 0, a: 26 } },
    xl: { offsetX: 0, offsetY: 20, blur: 25, spread: -5, color: { r: 0, g: 0, b: 0, a: 38 } },
  },
};

export const DARK_THEME: UITheme = {
  id: "dark",
  name: "Dark",
  isDark: true,
  colors: {
    primary:             { r: 96,  g: 165, b: 250, a: 255 },
    primaryForeground:   { r: 15,  g: 23,  b: 42,  a: 255 },
    secondary:           { r: 148, g: 163, b: 184, a: 255 },
    secondaryForeground: { r: 15,  g: 23,  b: 42,  a: 255 },
    background:          { r: 15,  g: 23,  b: 42,  a: 255 },
    surface:             { r: 30,  g: 41,  b: 59,  a: 255 },
    surfaceRaised:       { r: 51,  g: 65,  b: 85,  a: 255 },
    foreground:          { r: 248, g: 250, b: 252, a: 255 },
    foregroundMuted:     { r: 148, g: 163, b: 184, a: 255 },
    foregroundSubtle:    { r: 100, g: 116, b: 139, a: 255 },
    border:              { r: 51,  g: 65,  b: 85,  a: 255 },
    borderFocused:       { r: 96,  g: 165, b: 250, a: 255 },
    success:             { r: 74,  g: 222, b: 128, a: 255 },
    successForeground:   { r: 15,  g: 23,  b: 42,  a: 255 },
    warning:             { r: 251, g: 191, b: 36,  a: 255 },
    warningForeground:   { r: 15,  g: 23,  b: 42,  a: 255 },
    error:               { r: 248, g: 113, b: 113, a: 255 },
    errorForeground:     { r: 15,  g: 23,  b: 42,  a: 255 },
    info:                { r: 96,  g: 165, b: 250, a: 255 },
    infoForeground:      { r: 15,  g: 23,  b: 42,  a: 255 },
    hoverOverlay:        { r: 255, g: 255, b: 255, a: 13  },
    pressOverlay:        { r: 255, g: 255, b: 255, a: 26  },
    disabledOverlay:     { r: 0,   g: 0,   b: 0,   a: 128 },
  },
  spacing: SHARED_SPACING,
  typography: SHARED_TYPOGRAPHY,
  radii: SHARED_RADII,
  shadows: {
    sm: { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: { r: 0, g: 0, b: 0, a: 38 } },
    md: { offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: { r: 0, g: 0, b: 0, a: 51 } },
    lg: { offsetX: 0, offsetY: 10, blur: 15, spread: -3, color: { r: 0, g: 0, b: 0, a: 64 } },
    xl: { offsetX: 0, offsetY: 20, blur: 25, spread: -5, color: { r: 0, g: 0, b: 0, a: 77 } },
  },
};

// ═════════════════════════════════════════════════════════════
// Theme Manager
// ═════════════════════════════════════════════════════════════

export type ThemeChangeListener = (theme: UITheme) => void;

export class ThemeManager {
  private _themes = new Map<string, UITheme>();
  private _active: UITheme;
  private _listeners: ThemeChangeListener[] = [];

  constructor(initial?: UITheme) {
    this._active = initial ?? DARK_THEME;
    this._themes.set(LIGHT_THEME.id, LIGHT_THEME);
    this._themes.set(DARK_THEME.id, DARK_THEME);
    if (initial && initial.id !== "light" && initial.id !== "dark") {
      this._themes.set(initial.id, initial);
    }
  }

  get active(): UITheme { return this._active; }
  get isDark(): boolean { return this._active.isDark; }

  /** Register a custom theme */
  register(theme: UITheme): void {
    this._themes.set(theme.id, theme);
  }

  /** Switch active theme by id */
  setTheme(id: string): boolean {
    const theme = this._themes.get(id);
    if (!theme) return false;
    this._active = theme;
    for (const listener of this._listeners) listener(theme);
    return true;
  }

  /** Toggle between light and dark */
  toggleDarkMode(): void {
    this.setTheme(this._active.isDark ? "light" : "dark");
  }

  /** Create a derived theme by overriding specific tokens */
  derive(baseId: string, overrides: Partial<UITheme> & { id: string; name: string }): UITheme {
    const base = this._themes.get(baseId) ?? DARK_THEME;
    const derived: UITheme = {
      ...base,
      ...overrides,
      colors: { ...base.colors, ...overrides.colors },
      spacing: { ...base.spacing, ...overrides.spacing },
      typography: { ...base.typography, ...overrides.typography },
      radii: { ...base.radii, ...overrides.radii },
      shadows: { ...base.shadows, ...overrides.shadows },
    };
    this._themes.set(derived.id, derived);
    return derived;
  }

  /** Subscribe to theme changes */
  onChange(listener: ThemeChangeListener): () => void {
    this._listeners.push(listener);
    return () => {
      const idx = this._listeners.indexOf(listener);
      if (idx >= 0) this._listeners.splice(idx, 1);
    };
  }

  /** List all registered theme ids */
  listThemes(): string[] {
    return [...this._themes.keys()];
  }

  /** Get a theme by id without activating it */
  getTheme(id: string): UITheme | undefined {
    return this._themes.get(id);
  }

  /** Resolve a semantic color from the active theme */
  color<K extends keyof ThemeColors>(key: K): Color {
    return this._active.colors[key];
  }

  /** Resolve spacing from the active theme */
  space<K extends keyof ThemeSpacing>(key: K): number {
    return this._active.spacing[key];
  }

  /** Resolve font size from the active theme */
  fontSize<K extends keyof ThemeTypography["sizes"]>(key: K): number {
    return this._active.typography.sizes[key];
  }

  /** Resolve border radius from the active theme */
  radius<K extends keyof ThemeRadii>(key: K): number {
    return this._active.radii[key];
  }
}
