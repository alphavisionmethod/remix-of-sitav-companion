// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Identity Layers
// Visual tone, accent colors, layout density, copy style, and
// personality that adapt per business archetype to make the OS
// feel custom-built for each user's operating reality.
// ═══════════════════════════════════════════════════════════════

import type { ProfileArchetype, ArchetypeWeights } from "./business-profile-engine";

// ── Identity Layer Types ──────────────────────────────────────

export interface BusinessIdentityLayer {
  /** HSL accent color for this mode */
  accentColor: string;
  /** Gradient pair for hero surfaces */
  gradientPair: [string, string];
  /** Icon representing this mode */
  modeIcon: string;
  /** Dashboard density: compact shows more data, spacious is calmer */
  layoutDensity: "compact" | "balanced" | "spacious";
  /** Card border style */
  cardStyle: "sharp" | "rounded" | "glassmorphic";
  /** Quick action density */
  quickActionCount: number;
  /** Stat card style */
  statCardVariant: "minimal" | "rich" | "cinematic";
  /** Copy/tone */
  tone: IdentityTone;
  /** Welcome greeting template */
  welcomeGreeting: string;
  /** Mode tagline */
  tagline: string;
  /** Empty state encouragement */
  emptyStateMessage: string;
  /** Dashboard rhythm — how often to pulse updates */
  pulseInterval: "realtime" | "frequent" | "calm";
  /** Primary surface emphasis */
  surfaceEmphasis: SurfaceEmphasis;
}

export interface IdentityTone {
  formality: "casual" | "professional" | "executive";
  urgencyLevel: "calm" | "active" | "intense";
  actionVerbs: string[];
  statusWords: Record<string, string>;
  encouragement: string;
}

export interface SurfaceEmphasis {
  /** What type of visual to prioritize in hero slots */
  heroType: "chart" | "queue" | "calendar" | "pipeline" | "grid";
  /** Whether to show timeline-first or metrics-first */
  leadWith: "metrics" | "timeline" | "actions" | "status";
  /** Number of stat cards in header row */
  headerStatCount: number;
  /** Show mini-advisor chip in header */
  showAdvisorChip: boolean;
  /** Show mode indicator badge */
  showModeBadge: boolean;
}

// ── Identity Definitions ──────────────────────────────────────

const IDENTITY_LAYERS: Record<string, BusinessIdentityLayer> = {
  ecommerce: {
    accentColor: "38 85% 58%",
    gradientPair: ["38 85% 58%", "25 90% 50%"],
    modeIcon: "ShoppingCart",
    layoutDensity: "compact",
    cardStyle: "sharp",
    quickActionCount: 6,
    statCardVariant: "cinematic",
    tone: {
      formality: "casual",
      urgencyLevel: "active",
      actionVerbs: ["Recover", "Convert", "Retain", "Boost", "Track", "Launch"],
      statusWords: { good: "Converting", warning: "Leaking", critical: "Hemorrhaging" },
      encouragement: "Every recovered cart is revenue found.",
    },
    welcomeGreeting: "Let's see what's selling today",
    tagline: "E-Commerce Command Center",
    emptyStateMessage: "Connect your store to start tracking orders, carts, and customer lifetime value.",
    pulseInterval: "realtime",
    surfaceEmphasis: {
      heroType: "chart",
      leadWith: "metrics",
      headerStatCount: 5,
      showAdvisorChip: true,
      showModeBadge: true,
    },
  },

  service: {
    accentColor: "217 80% 55%",
    gradientPair: ["217 80% 55%", "230 65% 45%"],
    modeIcon: "Briefcase",
    layoutDensity: "balanced",
    cardStyle: "glassmorphic",
    quickActionCount: 5,
    statCardVariant: "rich",
    tone: {
      formality: "professional",
      urgencyLevel: "active",
      actionVerbs: ["Follow up", "Propose", "Schedule", "Deliver", "Invoice", "Close"],
      statusWords: { good: "On Track", warning: "Stalling", critical: "Overdue" },
      encouragement: "Consistent follow-through wins the deal.",
    },
    welcomeGreeting: "Here's your pipeline today",
    tagline: "Service Business Hub",
    emptyStateMessage: "Add your first client or lead to get started with intelligent pipeline management.",
    pulseInterval: "frequent",
    surfaceEmphasis: {
      heroType: "pipeline",
      leadWith: "actions",
      headerStatCount: 4,
      showAdvisorChip: true,
      showModeBadge: true,
    },
  },

  "brick-and-mortar": {
    accentColor: "25 75% 50%",
    gradientPair: ["25 75% 50%", "15 80% 45%"],
    modeIcon: "Building2",
    layoutDensity: "spacious",
    cardStyle: "rounded",
    quickActionCount: 4,
    statCardVariant: "rich",
    tone: {
      formality: "casual",
      urgencyLevel: "calm",
      actionVerbs: ["Check in", "Schedule", "Follow up", "Restock", "Staff", "Review"],
      statusWords: { good: "Smooth", warning: "Attention Needed", critical: "Urgent" },
      encouragement: "Every repeat visit builds your reputation.",
    },
    welcomeGreeting: "Good morning — here's today's schedule",
    tagline: "Local Business Operations",
    emptyStateMessage: "Set up your location and schedule to start managing walk-ins, appointments, and staff.",
    pulseInterval: "calm",
    surfaceEmphasis: {
      heroType: "calendar",
      leadWith: "timeline",
      headerStatCount: 4,
      showAdvisorChip: false,
      showModeBadge: true,
    },
  },

  "employee-based": {
    accentColor: "152 55% 48%",
    gradientPair: ["152 55% 48%", "165 50% 40%"],
    modeIcon: "Users",
    layoutDensity: "compact",
    cardStyle: "sharp",
    quickActionCount: 5,
    statCardVariant: "minimal",
    tone: {
      formality: "professional",
      urgencyLevel: "intense",
      actionVerbs: ["Assign", "Escalate", "Rebalance", "Inspect", "Clear", "Delegate"],
      statusWords: { good: "Flowing", warning: "Bottlenecked", critical: "Blocked" },
      encouragement: "Balanced workloads mean happier teams.",
    },
    welcomeGreeting: "Team status and assignments",
    tagline: "Team Operations Center",
    emptyStateMessage: "Add team members and assignments to start tracking workload and accountability.",
    pulseInterval: "frequent",
    surfaceEmphasis: {
      heroType: "queue",
      leadWith: "status",
      headerStatCount: 5,
      showAdvisorChip: true,
      showModeBadge: true,
    },
  },

  "appointment-based": {
    accentColor: "280 55% 58%",
    gradientPair: ["280 55% 58%", "265 55% 50%"],
    modeIcon: "Calendar",
    layoutDensity: "balanced",
    cardStyle: "rounded",
    quickActionCount: 4,
    statCardVariant: "rich",
    tone: {
      formality: "professional",
      urgencyLevel: "active",
      actionVerbs: ["Book", "Confirm", "Prep", "Remind", "Follow up", "Reschedule"],
      statusWords: { good: "Confirmed", warning: "Unconfirmed", critical: "No-Show Risk" },
      encouragement: "Every confirmed slot is predictable revenue.",
    },
    welcomeGreeting: "Today's appointments and prep",
    tagline: "Appointment Intelligence",
    emptyStateMessage: "Connect your calendar or add your first appointment to get prep reminders and no-show detection.",
    pulseInterval: "frequent",
    surfaceEmphasis: {
      heroType: "calendar",
      leadWith: "timeline",
      headerStatCount: 4,
      showAdvisorChip: true,
      showModeBadge: true,
    },
  },

  agency: {
    accentColor: "265 55% 58%",
    gradientPair: ["265 55% 58%", "280 50% 48%"],
    modeIcon: "Crown",
    layoutDensity: "balanced",
    cardStyle: "glassmorphic",
    quickActionCount: 5,
    statCardVariant: "cinematic",
    tone: {
      formality: "executive",
      urgencyLevel: "active",
      actionVerbs: ["Pitch", "Onboard", "Deliver", "Expand", "Retain", "Renew"],
      statusWords: { good: "Thriving", warning: "At Risk", critical: "Churn Risk" },
      encouragement: "Client trust compounds with every delivered promise.",
    },
    welcomeGreeting: "Client portfolio and pipeline health",
    tagline: "Agency Command Center",
    emptyStateMessage: "Add your first client or project to unlock pipeline intelligence and utilization tracking.",
    pulseInterval: "frequent",
    surfaceEmphasis: {
      heroType: "pipeline",
      leadWith: "metrics",
      headerStatCount: 5,
      showAdvisorChip: true,
      showModeBadge: true,
    },
  },

  "professional-practice": {
    accentColor: "200 60% 50%",
    gradientPair: ["200 60% 50%", "210 55% 42%"],
    modeIcon: "Shield",
    layoutDensity: "spacious",
    cardStyle: "glassmorphic",
    quickActionCount: 4,
    statCardVariant: "rich",
    tone: {
      formality: "executive",
      urgencyLevel: "calm",
      actionVerbs: ["Consult", "Advise", "Bill", "Review", "Schedule", "Follow up"],
      statusWords: { good: "Steady", warning: "Attention", critical: "Overdue" },
      encouragement: "Your expertise deserves efficient operations.",
    },
    welcomeGreeting: "Practice overview and schedule",
    tagline: "Professional Practice Hub",
    emptyStateMessage: "Set up your practice profile to start managing clients, billing, and scheduling.",
    pulseInterval: "calm",
    surfaceEmphasis: {
      heroType: "calendar",
      leadWith: "actions",
      headerStatCount: 4,
      showAdvisorChip: false,
      showModeBadge: true,
    },
  },

  "multi-location": {
    accentColor: "45 90% 55%",
    gradientPair: ["45 90% 55%", "38 85% 48%"],
    modeIcon: "MapPin",
    layoutDensity: "compact",
    cardStyle: "sharp",
    quickActionCount: 6,
    statCardVariant: "cinematic",
    tone: {
      formality: "professional",
      urgencyLevel: "intense",
      actionVerbs: ["Compare", "Staff", "Escalate", "Optimize", "Monitor", "Expand"],
      statusWords: { good: "All Green", warning: "Location Alert", critical: "Multi-Site Issue" },
      encouragement: "Consistency across locations builds trust at scale.",
    },
    welcomeGreeting: "Multi-location status overview",
    tagline: "Multi-Location Command",
    emptyStateMessage: "Add your locations to start comparing performance and managing staff across sites.",
    pulseInterval: "realtime",
    surfaceEmphasis: {
      heroType: "grid",
      leadWith: "status",
      headerStatCount: 5,
      showAdvisorChip: true,
      showModeBadge: true,
    },
  },

  membership: {
    accentColor: "340 60% 55%",
    gradientPair: ["340 60% 55%", "350 55% 48%"],
    modeIcon: "Heart",
    layoutDensity: "balanced",
    cardStyle: "glassmorphic",
    quickActionCount: 5,
    statCardVariant: "rich",
    tone: {
      formality: "casual",
      urgencyLevel: "active",
      actionVerbs: ["Retain", "Engage", "Renew", "Onboard", "Upsell", "Nurture"],
      statusWords: { good: "Growing", warning: "Churn Risk", critical: "Declining" },
      encouragement: "Every retained member is compounding revenue.",
    },
    welcomeGreeting: "Membership health and engagement",
    tagline: "Membership & Subscription HQ",
    emptyStateMessage: "Add members or connect your subscription platform to track retention and engagement.",
    pulseInterval: "frequent",
    surfaceEmphasis: {
      heroType: "chart",
      leadWith: "metrics",
      headerStatCount: 5,
      showAdvisorChip: true,
      showModeBadge: true,
    },
  },
};

// ── Default / fallback ────────────────────────────────────────

const DEFAULT_LAYER: BusinessIdentityLayer = IDENTITY_LAYERS.service;

// ── Public API ────────────────────────────────────────────────

export function getIdentityLayer(primaryMode: ProfileArchetype): BusinessIdentityLayer {
  return IDENTITY_LAYERS[primaryMode] || DEFAULT_LAYER;
}

/**
 * For hybrid businesses, blend identity from multiple weighted modes.
 * Returns the dominant identity with blended accent and tone.
 */
export function getBlendedIdentity(
  weights: ArchetypeWeights,
  primaryMode: ProfileArchetype
): BusinessIdentityLayer {
  const primary = getIdentityLayer(primaryMode);

  // Get secondary mode if weight > 0.2
  const sorted = (Object.entries(weights) as [ProfileArchetype, number][])
    .filter(([k]) => k !== primaryMode)
    .sort((a, b) => b[1] - a[1]);

  const secondary = sorted[0];
  if (!secondary || secondary[1] < 0.2) return primary;

  const secondaryLayer = getIdentityLayer(secondary[0]);

  // Blend: use primary identity but mix in secondary action verbs and surface hints
  return {
    ...primary,
    tone: {
      ...primary.tone,
      actionVerbs: [
        ...primary.tone.actionVerbs.slice(0, 4),
        ...secondaryLayer.tone.actionVerbs.slice(0, 2),
      ],
    },
    tagline: `${primary.tagline} · ${secondaryLayer.tagline.split(" ")[0]} Hybrid`,
  };
}

/**
 * Get contextual status word based on identity tone
 */
export function getStatusWord(
  primaryMode: ProfileArchetype,
  level: "good" | "warning" | "critical"
): string {
  const layer = getIdentityLayer(primaryMode);
  return layer.tone.statusWords[level] || level;
}

/**
 * Get time-aware greeting
 */
export function getTimeAwareGreeting(primaryMode: ProfileArchetype): string {
  const hour = new Date().getHours();
  const layer = getIdentityLayer(primaryMode);
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${timeGreeting} — ${layer.welcomeGreeting}`;
}

/**
 * CSS custom properties for identity injection into components
 */
export function getIdentityCSSVars(primaryMode: ProfileArchetype): Record<string, string> {
  const layer = getIdentityLayer(primaryMode);
  return {
    "--business-accent": layer.accentColor,
    "--business-gradient-from": layer.gradientPair[0],
    "--business-gradient-to": layer.gradientPair[1],
  };
}
