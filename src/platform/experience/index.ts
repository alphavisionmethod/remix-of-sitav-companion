// ═══════════════════════════════════════════════════════════════
// SITA OS — Experience Layer — Barrel Export
// ═══════════════════════════════════════════════════════════════

// Phase 1 — Core Contracts
export { OS_APP_EXPERIENCE_CONTRACT, SHELL_OWNED_SURFACES, APP_OWNED_SURFACES, SHARED_SYSTEM_SURFACES, MERGE_RULES, CONTEXT_HANDOFFS } from "./os-app-experience-contract";
export type { ExperienceLayer, SurfaceOwnership, MergeRule, ContextHandoff } from "./os-app-experience-contract";

export { VISUAL_TIERS, VISUAL_TIER_COUNT, getVisualTier, getAllTierIds } from "./visual-tier-system";
export type { VisualTierId, VisualTier, ChromeIntensity, SurfaceDensity, MotionProfile } from "./visual-tier-system";

export { SHELL_APP_MERGE_GRAMMAR, SHELL_APP_MERGE_RULES, EMBEDDING_RULES } from "./shell-app-merge-grammar";
export type { ShellMode, ShellAppMergeRule, EmbeddingRule } from "./shell-app-merge-grammar";

export { CHROME_SPECS, CHROME_SURFACE_COUNT, SHARED_CHROME_DEFAULTS } from "./window-chrome-grammar";
export type { ChromeSurface, ChromeSpec } from "./window-chrome-grammar";

export { STATE_VISUAL_MAP, STATE_VISUAL_COUNT, getStateVisual } from "./state-visual-grammar";
export type { StateVisualMapping, StateColorToken, StateAnimation, StateSurfaceTreatment } from "./state-visual-grammar";

export { TRUST_VISUAL_MAP, TRUST_VISUAL_COUNT, TRUST_PLACEMENT_RULES } from "./trust-visual-grammar";
export type { TrustVisualMapping } from "./trust-visual-grammar";

// Phase 2 — Supporting Contracts
export { DESIGN_TOKEN_BRIDGE } from "./design-token-bridge";
export { COMPONENT_TIER_MAP } from "./component-tier-map";
export { LAYOUT_MERGE_MAP } from "./layout-merge-map";
export { UNIFIED_MOTION_GRAMMAR } from "./motion-grammar";
export { NAVIGATION_MERGE_MAP } from "./navigation-merge-map";
export { NOTIFICATION_MERGE_MAP } from "./notification-merge-map";
export { COMMAND_SURFACE_MERGE_MAP } from "./command-surface-merge-map";
export { SETTINGS_MERGE_MAP } from "./settings-merge-map";
export { RESPONSIVE_COHERENCE_MAP } from "./responsive-coherence-map";
export { BRAND_SURFACE_POLICY } from "./brand-surface-policy";
export { WINDOW_APP_SURFACE_MAP } from "./window-app-surface-map";