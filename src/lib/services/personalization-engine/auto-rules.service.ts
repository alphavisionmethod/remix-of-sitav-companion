// ═══════════════════════════════════════════════════════════════
// SITA OS — Auto-Personalization Rules Engine
// Triggers automatic adaptations based on learned preferences
// ═══════════════════════════════════════════════════════════════

import type { InferredPattern } from "./behavioral-learning.service";

export type AutoRuleLevel = "suggest" | "draft" | "auto";

export interface AutoRule {
  id: string;
  name: string;
  description: string;
  domain: "display" | "notifications" | "dashboard" | "advisors" | "scheduling" | "financial" | "household";
  triggerDimension: string;
  triggerCondition: (patterns: InferredPattern[]) => boolean;
  action: string;
  level: AutoRuleLevel;
  confidenceThreshold: number;
  enabled: boolean;
  lastTriggered: number | null;
  overriddenByUser: boolean;
}

export interface RuleEvaluation {
  ruleId: string;
  triggered: boolean;
  action: string;
  level: AutoRuleLevel;
  confidence: number;
  appliedAutomatically: boolean;
}

const findPattern = (patterns: InferredPattern[], dimension: string): InferredPattern | undefined =>
  patterns.find((p) => p.dimension === dimension && !p.dismissed);

/** Built-in rule definitions */
const createDefaultRules = (): AutoRule[] => [
  {
    id: "calm-mode-evening",
    name: "Evening Calm Mode",
    description: "Switch to calm mode after 9 PM when user is consistently less active at night",
    domain: "display",
    triggerDimension: "schedule.quietHours",
    triggerCondition: (patterns) => {
      const p = findPattern(patterns, "schedule.quietHours");
      if (!p || p.confidence < 0.8) return false;
      const now = new Date().getHours();
      const quiet = p.inferredValue as { start: number; end: number };
      return now >= quiet.start || now < quiet.end;
    },
    action: "Enable calm display mode",
    level: "auto",
    confidenceThreshold: 0.8,
    enabled: true,
    lastTriggered: null,
    overriddenByUser: false,
  },
  {
    id: "mute-non-urgent-focus",
    name: "Focus Hours Mute",
    description: "Mute non-urgent notifications during detected focus hours",
    domain: "notifications",
    triggerDimension: "schedule.peakHours",
    triggerCondition: (patterns) => {
      const p = findPattern(patterns, "schedule.peakHours");
      if (!p || p.confidence < 0.85) return false;
      const now = new Date().getHours();
      const peak = p.inferredValue as string;
      return (peak === "morning" && now >= 6 && now < 12) ||
        (peak === "evening" && now >= 18 && now < 23);
    },
    action: "Mute non-urgent notifications during peak focus",
    level: "suggest",
    confidenceThreshold: 0.85,
    enabled: true,
    lastTriggered: null,
    overriddenByUser: false,
  },
  {
    id: "reorder-dashboard",
    name: "Dashboard Reorder",
    description: "Reorder dashboard surfaces based on actual usage frequency",
    domain: "dashboard",
    triggerDimension: "navigation.primarySurface",
    triggerCondition: (patterns) => {
      const p = findPattern(patterns, "navigation.primarySurface");
      return !!p && p.confidence >= 0.75;
    },
    action: "Move most-used surface to top of dashboard",
    level: "suggest",
    confidenceThreshold: 0.75,
    enabled: true,
    lastTriggered: null,
    overriddenByUser: false,
  },
  {
    id: "auto-approve-low-value",
    name: "Auto-Approve Small Amounts",
    description: "Automatically approve actions under the learned threshold",
    domain: "financial",
    triggerDimension: "trust.autoApproveThreshold",
    triggerCondition: (patterns) => {
      const p = findPattern(patterns, "trust.autoApproveThreshold");
      return !!p && p.confidence >= 0.85;
    },
    action: "Auto-approve actions under detected threshold",
    level: "draft",
    confidenceThreshold: 0.85,
    enabled: true,
    lastTriggered: null,
    overriddenByUser: false,
  },
  {
    id: "start-surface-redirect",
    name: "Session Start Surface",
    description: "Open preferred surface when user starts a new session",
    domain: "dashboard",
    triggerDimension: "navigation.firstSurface",
    triggerCondition: (patterns) => {
      const p = findPattern(patterns, "navigation.firstSurface");
      return !!p && p.confidence >= 0.8;
    },
    action: "Redirect to preferred start surface on login",
    level: "suggest",
    confidenceThreshold: 0.8,
    enabled: true,
    lastTriggered: null,
    overriddenByUser: false,
  },
  {
    id: "content-density-adapt",
    name: "Adaptive Content Density",
    description: "Adjust UI density based on scroll behavior patterns",
    domain: "display",
    triggerDimension: "display.contentDensity",
    triggerCondition: (patterns) => {
      const p = findPattern(patterns, "display.contentDensity");
      return !!p && p.confidence >= 0.7;
    },
    action: "Set content density to match browsing style",
    level: "auto",
    confidenceThreshold: 0.7,
    enabled: true,
    lastTriggered: null,
    overriddenByUser: false,
  },
  {
    id: "communication-style-adapt",
    name: "Communication Style",
    description: "Adapt advisor tone to match user's communication patterns",
    domain: "advisors",
    triggerDimension: "communication.style",
    triggerCondition: (patterns) => {
      const p = findPattern(patterns, "communication.style");
      return !!p && p.confidence >= 0.75;
    },
    action: "Match advisor communication style to user preference",
    level: "auto",
    confidenceThreshold: 0.75,
    enabled: true,
    lastTriggered: null,
    overriddenByUser: false,
  },
];

export class AutoRulesEngine {
  private rules: Map<string, AutoRule[]> = new Map();
  private autoPilot: Map<string, boolean> = new Map();

  /** Initialize rules for a user (or reset to defaults) */
  initRules(userId: string): AutoRule[] {
    const rules = createDefaultRules();
    this.rules.set(userId, rules);
    return rules;
  }

  /** Get all rules for a user */
  getRules(userId: string): AutoRule[] {
    if (!this.rules.has(userId)) this.initRules(userId);
    return this.rules.get(userId)!;
  }

  /** Toggle auto-pilot mode */
  setAutoPilot(userId: string, enabled: boolean): void {
    this.autoPilot.set(userId, enabled);
  }

  isAutoPilot(userId: string): boolean {
    return this.autoPilot.get(userId) ?? false;
  }

  /** Update a rule's level */
  setRuleLevel(userId: string, ruleId: string, level: AutoRuleLevel): void {
    const rules = this.getRules(userId);
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      rule.level = level;
      rule.overriddenByUser = true;
    }
  }

  /** Enable/disable a rule */
  setRuleEnabled(userId: string, ruleId: string, enabled: boolean): void {
    const rules = this.getRules(userId);
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) rule.enabled = enabled;
  }

  /** Evaluate all rules against current patterns */
  evaluate(userId: string, patterns: InferredPattern[]): RuleEvaluation[] {
    const rules = this.getRules(userId);
    const isAuto = this.isAutoPilot(userId);
    const results: RuleEvaluation[] = [];

    for (const rule of rules) {
      if (!rule.enabled || rule.overriddenByUser) continue;

      const triggered = rule.triggerCondition(patterns);
      const relevantPattern = patterns.find(
        (p) => p.dimension === rule.triggerDimension && !p.dismissed
      );
      const confidence = relevantPattern?.confidence ?? 0;

      if (triggered && confidence >= rule.confidenceThreshold) {
        const appliedAutomatically = isAuto && rule.level === "auto";
        rule.lastTriggered = Date.now();

        results.push({
          ruleId: rule.id,
          triggered: true,
          action: rule.action,
          level: rule.level,
          confidence,
          appliedAutomatically,
        });
      }
    }

    return results;
  }
}

export const createAutoRulesEngine = () => new AutoRulesEngine();

