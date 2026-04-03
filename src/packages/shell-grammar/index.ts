// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Grammar
// Primitives for consistent OS shell behavior
// ═══════════════════════════════════════════════════════════════

// ── Frame ────────────────────────────────────────────────────

export type ShellFrame = "full" | "compact" | "minimal" | "immersive";

export interface FrameConfig {
  topBar: boolean;
  sidebar: boolean;
  commandPalette: boolean;
  fab: boolean;
  notificationPanel: boolean;
}

export const FRAME_CONFIGS: Record<ShellFrame, FrameConfig> = {
  full: { topBar: true, sidebar: true, commandPalette: true, fab: true, notificationPanel: true },
  compact: { topBar: true, sidebar: true, commandPalette: true, fab: false, notificationPanel: true },
  minimal: { topBar: true, sidebar: false, commandPalette: true, fab: false, notificationPanel: false },
  immersive: { topBar: false, sidebar: false, commandPalette: false, fab: false, notificationPanel: false },
};

// ── Navigation ───────────────────────────────────────────────

export type NavigationSection = "home" | "business" | "money" | "concierge" | "files" | "advisors" | "boardroom" | "workflows" | "proof" | "store" | "admin";

export interface NavigationItem {
  id: string;
  section: NavigationSection;
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  requiredPack?: string;
  adminOnly?: boolean;
}

// ── Lanes ────────────────────────────────────────────────────

export type LaneLayout = "single" | "dual" | "triple" | "sidebar-detail";

export interface LaneConfig {
  layout: LaneLayout;
  primaryWidth: string;
  detailWidth?: string;
  auxiliaryWidth?: string;
}

export const LANE_CONFIGS: Record<LaneLayout, LaneConfig> = {
  single: { layout: "single", primaryWidth: "100%" },
  dual: { layout: "dual", primaryWidth: "60%", detailWidth: "40%" },
  triple: { layout: "triple", primaryWidth: "40%", detailWidth: "35%", auxiliaryWidth: "25%" },
  "sidebar-detail": { layout: "sidebar-detail", primaryWidth: "320px", detailWidth: "1fr" },
};

// ── Density ──────────────────────────────────────────────────

export type DensityMode = "calm" | "standard" | "analyst";

export interface DensityConfig {
  cardPadding: string;
  gap: string;
  fontSize: string;
  showMetrics: boolean;
  showSecondaryInfo: boolean;
  maxCardsPerRow: number;
}

export const DENSITY_CONFIGS: Record<DensityMode, DensityConfig> = {
  calm: { cardPadding: "1.5rem", gap: "1.5rem", fontSize: "0.875rem", showMetrics: false, showSecondaryInfo: false, maxCardsPerRow: 2 },
  standard: { cardPadding: "1rem", gap: "1rem", fontSize: "0.8125rem", showMetrics: true, showSecondaryInfo: true, maxCardsPerRow: 3 },
  analyst: { cardPadding: "0.75rem", gap: "0.75rem", fontSize: "0.75rem", showMetrics: true, showSecondaryInfo: true, maxCardsPerRow: 4 },
};

// ── Modes ────────────────────────────────────────────────────

export type DisplayMode = "calm" | "standard" | "focus" | "analyst" | "presentation";

export interface ModeConfig {
  density: DensityMode;
  frame: ShellFrame;
  animations: boolean;
  showConfidence: boolean;
  showProof: boolean;
}

export const MODE_CONFIGS: Record<DisplayMode, ModeConfig> = {
  calm: { density: "calm", frame: "compact", animations: true, showConfidence: false, showProof: false },
  standard: { density: "standard", frame: "full", animations: true, showConfidence: true, showProof: true },
  focus: { density: "standard", frame: "minimal", animations: false, showConfidence: true, showProof: true },
  analyst: { density: "analyst", frame: "full", animations: false, showConfidence: true, showProof: true },
  presentation: { density: "calm", frame: "immersive", animations: true, showConfidence: false, showProof: false },
};

// ── Contexts ─────────────────────────────────────────────────

export type DomainContext = "business" | "money" | "concierge" | "boardroom" | "admin" | "neutral";

export interface ContextTheme {
  accentColor: string;
  icon: string;
  label: string;
}

export const CONTEXT_THEMES: Record<DomainContext, ContextTheme> = {
  business: { accentColor: "primary", icon: "briefcase", label: "Business" },
  money: { accentColor: "trust-safe", icon: "dollar-sign", label: "Money" },
  concierge: { accentColor: "accent", icon: "home", label: "Concierge" },
  boardroom: { accentColor: "primary", icon: "presentation", label: "Boardroom" },
  admin: { accentColor: "muted-foreground", icon: "settings", label: "Admin" },
  neutral: { accentColor: "foreground", icon: "circle", label: "" },
};
