// ═══════════════════════════════════════════════════════════════
// SITA OS — Typed Action Registry
// Canonical registry for all command palette actions
// ═══════════════════════════════════════════════════════════════

import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";

export interface ActionEntry {
  id: string;
  label: string;
  sublabel?: string;
  icon: string; // lucide icon name (resolved at render time)
  category: "action" | "navigate" | "advisor" | "capture" | "system" | "simulate" | "explain";
  domain?: string;
  keywords: string[];
  path?: string;
  riskLevel?: "low" | "medium" | "high";
  requiredPermission?: string;
  profiles?: DeploymentProfileKey[];
  sensitivity?: "public" | "internal" | "restricted";
  analyticsEvent?: string;
}

// ── Simulation Commands ─────────────────────────────────────────

export const SIMULATION_ACTIONS: ActionEntry[] = [
  {
    id: "sim-business",
    label: "Run Business Simulation",
    sublabel: "Test a business decision before committing",
    icon: "Briefcase",
    category: "simulate",
    domain: "business",
    keywords: ["simulate", "business", "what if", "test", "scenario", "decision"],
    path: "/simulation?domain=business",
    sensitivity: "public",
  },
  {
    id: "sim-finance",
    label: "Run Finance Scenario",
    sublabel: "Model debt, investment, or budget changes",
    icon: "DollarSign",
    category: "simulate",
    domain: "finance",
    keywords: ["simulate", "finance", "money", "debt", "invest", "budget", "scenario"],
    path: "/simulation?domain=finance",
    sensitivity: "public",
  },
  {
    id: "sim-concierge",
    label: "Run Life Simulation",
    sublabel: "Model scheduling and delegation changes",
    icon: "Headphones",
    category: "simulate",
    domain: "concierge",
    keywords: ["simulate", "life", "concierge", "schedule", "delegate", "scenario"],
    path: "/simulation?domain=concierge",
    sensitivity: "public",
  },
  {
    id: "sim-test-decision",
    label: "Test a Decision",
    sublabel: "Pressure-test before you commit",
    icon: "FlaskConical",
    category: "simulate",
    keywords: ["test", "decision", "simulate", "what if", "try", "sandbox"],
    path: "/simulation",
    sensitivity: "public",
  },
  {
    id: "sim-compare",
    label: "Compare Scenarios",
    sublabel: "Side-by-side scenario comparison",
    icon: "ArrowLeftRight",
    category: "simulate",
    keywords: ["compare", "scenarios", "side by side", "versus"],
    path: "/simulation?compare=true",
    sensitivity: "public",
  },
];

// ── Explainability Commands ─────────────────────────────────────

export const EXPLAINABILITY_ACTIONS: ActionEntry[] = [
  {
    id: "exp-why-recommended",
    label: "Why Was This Recommended?",
    sublabel: "Understand the reasoning behind a suggestion",
    icon: "HelpCircle",
    category: "explain",
    keywords: ["why", "explain", "recommended", "reasoning", "rationale"],
    sensitivity: "public",
  },
  {
    id: "exp-recent-reasoning",
    label: "Show Recent Reasoning",
    sublabel: "View reasoning history for recent decisions",
    icon: "History",
    category: "explain",
    keywords: ["reasoning", "history", "recent", "explain", "decisions"],
    sensitivity: "public",
  },
  {
    id: "exp-view-explanation",
    label: "View Explanation History",
    sublabel: "Browse all explainability entries",
    icon: "ScrollText",
    category: "explain",
    keywords: ["explanation", "history", "browse", "explainability", "all"],
    sensitivity: "public",
  },
];

// ── Intent Detection Patterns ───────────────────────────────────

export const INTENT_PATTERNS = {
  simulate: [
    /^what if\b/i,
    /^test\b/i,
    /^simulate\b/i,
    /^scenario\b/i,
    /^model\b/i,
    /^run (?:a )?sim/i,
    /^pressure.?test/i,
  ],
  explain: [
    /^why\b/i,
    /^explain\b/i,
    /^reasoning\b/i,
    /^how was\b/i,
    /^what made\b/i,
    /^show (?:me )?(?:the )?reason/i,
  ],
} as const;

export function detectIntent(query: string): "simulate" | "explain" | null {
  for (const pattern of INTENT_PATTERNS.simulate) {
    if (pattern.test(query.trim())) return "simulate";
  }
  for (const pattern of INTENT_PATTERNS.explain) {
    if (pattern.test(query.trim())) return "explain";
  }
  return null;
}

/** Get all extended action entries for command palette */
export function getExtendedActions(): ActionEntry[] {
  return [...SIMULATION_ACTIONS, ...EXPLAINABILITY_ACTIONS];
}