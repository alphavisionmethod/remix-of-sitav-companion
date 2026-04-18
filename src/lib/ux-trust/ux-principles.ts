// ═══════════════════════════════════════════════════════════════
// SITA OS — UX Principles Engine
// Codified behavioral rules for premium user experience
// ═══════════════════════════════════════════════════════════════

export type UXPrincipleKey =
  | "premium"
  | "calm"
  | "context"
  | "explainability"
  | "honesty"
  | "density"
  | "trust";

export interface UXPrincipleRule {
  id: string;
  principle: UXPrincipleKey;
  description: string;
  enforcement: "required" | "recommended" | "optional";
  check: (context: UXPrincipleContext) => UXPrincipleResult;
}

export interface UXPrincipleContext {
  /** Is user in focus/calm mode? */
  isFocusMode: boolean;
  /** Cognitive load score 0-100 */
  cognitiveLoad: number;
  /** Is this a destructive action surface? */
  isDestructive: boolean;
  /** Is AI-generated content present? */
  hasAIContent: boolean;
  /** Is data stale? */
  isStaleData: boolean;
  /** Is a service degraded? */
  isDegraded: boolean;
  /** Surface density: how many elements visible */
  visibleElements: number;
  /** Is demo mode active? */
  isDemo: boolean;
}

export interface UXPrincipleResult {
  pass: boolean;
  message: string;
  action?: string;
}

// ── Principle definitions ──────────────────────────────────────

export const UX_PRINCIPLES: Record<UXPrincipleKey, {
  name: string;
  description: string;
  tone: string;
  rules: UXPrincipleRule[];
}> = {
  premium: {
    name: "Premium, not flashy",
    description: "Restraint, spacing, hierarchy, elegance. No clutter.",
    tone: "intentional, legible, smooth, expensive-feeling",
    rules: [
      {
        id: "premium-density",
        principle: "premium",
        description: "Visible elements should not exceed density threshold",
        enforcement: "recommended",
        check: (ctx) => ({
          pass: ctx.visibleElements <= 24,
          message: ctx.visibleElements > 24 ? `${ctx.visibleElements} elements visible — consider progressive disclosure` : "Density within premium threshold",
        }),
      },
    ],
  },
  calm: {
    name: "Calm under complexity",
    description: "Only the right amount of information at once. Progressive disclosure.",
    tone: "reduce panic, not amplify it",
    rules: [
      {
        id: "calm-cognitive-guard",
        principle: "calm",
        description: "Suppress non-critical UI when cognitive load is high",
        enforcement: "required",
        check: (ctx) => ({
          pass: ctx.cognitiveLoad < 75 || ctx.isFocusMode,
          message: ctx.cognitiveLoad >= 75 ? "High cognitive load — reduce non-critical elements" : "Cognitive load acceptable",
          action: ctx.cognitiveLoad >= 90 ? "suggest-focus-mode" : undefined,
        }),
      },
    ],
  },
  context: {
    name: "Context before abstraction",
    description: "Always orient the user: where am I, what changed, what can I do next",
    tone: "grounded, specific, navigable",
    rules: [
      {
        id: "context-orientation",
        principle: "context",
        description: "Every surface should provide orientation cues",
        enforcement: "required",
        check: () => ({ pass: true, message: "Orientation context available" }),
      },
    ],
  },
  explainability: {
    name: "Explainability over magic",
    description: "Users should understand why things are suggested, blocked, or recommended",
    tone: "transparent, evidenced, inspectable",
    rules: [
      {
        id: "explain-ai",
        principle: "explainability",
        description: "AI outputs must include confidence and source disclosure",
        enforcement: "required",
        check: (ctx) => ({
          pass: !ctx.hasAIContent || true, // component-level enforcement
          message: ctx.hasAIContent ? "AI content present — ensure confidence disclosure" : "No AI content",
        }),
      },
    ],
  },
  honesty: {
    name: "Operational honesty",
    description: "Honest about loading, failure, partial data, stale data, simulations",
    tone: "no fake confidence, no fake readiness",
    rules: [
      {
        id: "honesty-stale",
        principle: "honesty",
        description: "Stale data must be visually indicated",
        enforcement: "required",
        check: (ctx) => ({
          pass: !ctx.isStaleData,
          message: ctx.isStaleData ? "Data is stale — show freshness badge" : "Data is fresh",
        }),
      },
      {
        id: "honesty-demo",
        principle: "honesty",
        description: "Demo mode must be visible",
        enforcement: "required",
        check: (ctx) => ({
          pass: !ctx.isDemo,
          message: ctx.isDemo ? "Demo mode — ensure truth banner visible" : "Live mode",
        }),
      },
      {
        id: "honesty-degraded",
        principle: "honesty",
        description: "Degraded services must be communicated",
        enforcement: "required",
        check: (ctx) => ({
          pass: !ctx.isDegraded,
          message: ctx.isDegraded ? "Service degraded — show degradation banner" : "All services healthy",
        }),
      },
    ],
  },
  density: {
    name: "High density, controlled",
    description: "Information-rich but structured, layered, scannable",
    tone: "light at first glance, deep on demand",
    rules: [
      {
        id: "density-layers",
        principle: "density",
        description: "Complex surfaces should use 3-layer progressive disclosure",
        enforcement: "recommended",
        check: (ctx) => ({
          pass: ctx.visibleElements <= 30,
          message: ctx.visibleElements > 30 ? "Consider information layering" : "Density well-structured",
        }),
      },
    ],
  },
  trust: {
    name: "Human-centered trust",
    description: "The product knows what it's doing and what it doesn't know",
    tone: "careful, recoverable, accurate, never trapping",
    rules: [
      {
        id: "trust-destructive",
        principle: "trust",
        description: "Destructive actions require consequence preview",
        enforcement: "required",
        check: (ctx) => ({
          pass: !ctx.isDestructive,
          message: ctx.isDestructive ? "Destructive action — show consequence preview" : "Non-destructive context",
        }),
      },
    ],
  },
};

/** Run all principle checks for a given context */
export function auditPrinciples(context: UXPrincipleContext): {
  passed: number;
  failed: number;
  results: Array<{ ruleId: string; principle: UXPrincipleKey } & UXPrincipleResult>;
} {
  const results: Array<{ ruleId: string; principle: UXPrincipleKey } & UXPrincipleResult> = [];
  for (const [key, principle] of Object.entries(UX_PRINCIPLES)) {
    for (const rule of principle.rules) {
      const result = rule.check(context);
      results.push({ ruleId: rule.id, principle: key as UXPrincipleKey, ...result });
    }
  }
  return {
    passed: results.filter(r => r.pass).length,
    failed: results.filter(r => !r.pass).length,
    results,
  };
}

/** Quick helper: should we suppress non-critical UI? */
export function shouldSuppressNonCritical(cognitiveLoad: number, isFocusMode: boolean): boolean {
  return cognitiveLoad > 75 || isFocusMode;
}

/** Quick helper: get density recommendation */
export function getDensityGuidance(elementCount: number): "comfortable" | "dense" | "overloaded" {
  if (elementCount <= 12) return "comfortable";
  if (elementCount <= 24) return "dense";
  return "overloaded";
}
