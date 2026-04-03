// ═══════════════════════════════════════════════════════════════
// SITA OS — Design Tokens
// Canonical design values consumed by all surfaces
// ═══════════════════════════════════════════════════════════════

// ── Colors (HSL values matching index.css) ───────────────────

export const COLORS = {
  // Semantic palette
  primary: { h: 222, s: 47, l: 31 },
  primaryForeground: { h: 210, s: 40, l: 98 },
  secondary: { h: 210, s: 40, l: 96 },
  accent: { h: 38, s: 92, l: 50 },
  muted: { h: 210, s: 40, l: 96 },
  destructive: { h: 0, s: 84, l: 60 },

  // Trust states
  trustSafe: { h: 142, s: 71, l: 45 },
  trustReview: { h: 38, s: 92, l: 50 },
  trustVerified: { h: 142, s: 71, l: 45 },
  urgencyHigh: { h: 0, s: 84, l: 60 },
  urgencyMedium: { h: 38, s: 92, l: 50 },
} as const;

// ── Spacing ──────────────────────────────────────────────────

export const SPACING = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "0.75rem",   // 12px
  lg: "1rem",      // 16px
  xl: "1.5rem",    // 24px
  "2xl": "2rem",   // 32px
  "3xl": "3rem",   // 48px
  "4xl": "4rem",   // 64px
} as const;

// ── Typography ───────────────────────────────────────────────

export const TYPOGRAPHY = {
  fontFamily: {
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', monospace",
  },
  fontSize: {
    "2xs": "0.625rem",  // 10px
    xs: "0.6875rem",    // 11px
    sm: "0.75rem",      // 12px
    base: "0.875rem",   // 14px
    lg: "1rem",         // 16px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "2rem",      // 32px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ── Border Radius ────────────────────────────────────────────

export const RADIUS = {
  sm: "0.375rem",    // 6px
  md: "0.5rem",      // 8px
  lg: "0.75rem",     // 12px
  xl: "1rem",        // 16px
  "2xl": "1.25rem",  // 20px
  full: "9999px",
} as const;

// ── Shadows ──────────────────────────────────────────────────

export const SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
  premium: "0 10px 30px -10px hsl(222 47% 31% / 0.15)",
  card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
} as const;

// ── Motion ───────────────────────────────────────────────────

export const MOTION = {
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    deliberate: 0.6,
  },
  easing: {
    default: [0.4, 0, 0.2, 1],
    enter: [0, 0, 0.2, 1],
    exit: [0.4, 0, 1, 1],
    spring: { type: "spring", stiffness: 300, damping: 30 },
  },
  variants: {
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slideUp: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
    slideRight: { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } },
    scaleIn: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
  },
} as const;

// ── Trust States ─────────────────────────────────────────────

export const TRUST_STATES = {
  proposed: { color: "muted-foreground", label: "Proposed", icon: "circle" },
  drafted: { color: "primary", label: "Drafted", icon: "edit" },
  simulated: { color: "accent", label: "Simulated", icon: "play" },
  "approval-requested": { color: "accent", label: "Approval Requested", icon: "clock" },
  approved: { color: "trust-safe", label: "Approved", icon: "check" },
  executing: { color: "primary", label: "Executing", icon: "loader" },
  completed: { color: "trust-safe", label: "Completed", icon: "check-circle" },
  verified: { color: "trust-verified", label: "Verified", icon: "shield-check" },
  failed: { color: "destructive", label: "Failed", icon: "x-circle" },
  "rolled-back": { color: "accent", label: "Rolled Back", icon: "rotate-ccw" },
  escalated: { color: "destructive", label: "Escalated", icon: "alert-triangle" },
} as const;

// ── Workflow States ──────────────────────────────────────────

export const WORKFLOW_STATES = {
  pending: { color: "muted-foreground", label: "Pending" },
  running: { color: "primary", label: "Running" },
  "waiting-approval": { color: "accent", label: "Waiting Approval" },
  completed: { color: "trust-safe", label: "Completed" },
  failed: { color: "destructive", label: "Failed" },
  stuck: { color: "destructive", label: "Stuck" },
  "rolled-back": { color: "accent", label: "Rolled Back" },
} as const;

// ── Proof States ─────────────────────────────────────────────

export const PROOF_STATES = {
  generated: { color: "primary", label: "Generated" },
  verified: { color: "trust-verified", label: "Verified" },
  disputed: { color: "destructive", label: "Disputed" },
  archived: { color: "muted-foreground", label: "Archived" },
} as const;
