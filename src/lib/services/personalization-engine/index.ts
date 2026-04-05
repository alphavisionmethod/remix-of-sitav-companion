// ═══════════════════════════════════════════════════════════════
// SITA OS — Adaptive Personalization Engine
// Deep preference model with layered resolution:
//   explicit (user-set) > inferred (behavioral) > default
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export { BehavioralLearningEngine, createBehavioralLearningEngine } from "./behavioral-learning.service";
export type { BehavioralEvent, BehavioralEventType, InferredPattern } from "./behavioral-learning.service";

export { AutoRulesEngine, createAutoRulesEngine } from "./auto-rules.service";
export type { AutoRule, AutoRuleLevel, RuleEvaluation } from "./auto-rules.service";

// ─── Preference Dimensions ────────────────────────────────

export interface CommunicationPrefs {
  style: "direct" | "supportive" | "analytical" | "casual";
  explanationDepth: "minimal" | "balanced" | "detailed";
  reminderCadence: "minimal" | "gentle" | "persistent";
  notificationSensitivity: "all" | "important" | "critical" | "silent";
  advisorTone: "formal" | "friendly" | "professional";
  preferredChannel: "in-app" | "email" | "sms" | "push";
}

export interface DisplayPrefs {
  theme: "light" | "dark" | "system";
  density: "compact" | "comfortable" | "spacious";
  contentDensity: "minimal" | "balanced" | "detailed";
  animations: boolean;
  calmMode: boolean;
  focusMode: boolean;
  chartStyle: "visual" | "tabular" | "hybrid";
}

export interface WorkflowPrefs {
  automationComfort: "manual" | "growing" | "fully-automated";
  riskTolerance: "conservative" | "moderate" | "aggressive";
  decisionFormat: "recommended-action" | "pros-cons" | "options-only";
  reviewFrequency: "daily" | "weekly" | "biweekly" | "monthly";
  calendarIntensity: "light" | "moderate" | "packed";
}

export interface TrustPrefs {
  autoApproveThreshold: number;
  requireConfirmationAbove: number;
  trustLevel: "standard" | "careful" | "strict";
  riskVisibility: "always" | "on-demand" | "hidden";
  proofRequirement: "all" | "high-value" | "none";
}

export interface SchedulePrefs {
  peakHours: "morning" | "afternoon" | "evening" | "flexible";
  quietHoursStart: number;
  quietHoursEnd: number;
  preferredMeetingDays: string[];
  weeklyReviewDay: string;
  weeklyReviewTime: string;
}

export interface FinancialPrefs {
  safeToSpendBuffer: number;
  billPaymentTiming: "early" | "on-time" | "last-minute";
  savingsAutoTransfer: boolean;
  savingsAmount: number;
  spendingAlertThreshold: number;
  budgetViewStyle: "category" | "timeline" | "goal-based";
}

export interface HouseholdPrefs {
  groceryDay: string;
  taskAssignment: "shared" | "assigned" | "rotating";
  familyMeetingDay: string;
  familyMeetingTime: string;
  childCoordination: "alternating" | "primary" | "shared";
  lifePriority: "business-first" | "family-first" | "balanced" | "self-first";
}

export interface DomainPrefs {
  businessView: "pipeline" | "list" | "board";
  moneyView: "overview" | "detailed" | "goal-focused";
  conciergeView: "calendar" | "task-list" | "family-hub";
}

export interface UserPreferences {
  userId: string;
  communication: CommunicationPrefs;
  display: DisplayPrefs;
  workflow: WorkflowPrefs;
  trust: TrustPrefs;
  schedule: SchedulePrefs;
  financial: FinancialPrefs;
  household: HouseholdPrefs;
  domain: DomainPrefs;
  autoPilot: boolean;
  privacyMode: boolean;
  lastUpdated: string;
}

type PreferenceLayer = "explicit" | "inferred" | "default";

interface LayeredValue {
  value: unknown;
  layer: PreferenceLayer;
  updatedAt: string;
}

// ─── Default Preferences ──────────────────────────────────

export const DEFAULT_PREFERENCES: Omit<UserPreferences, "userId"> = {
  communication: {
    style: "supportive",
    explanationDepth: "balanced",
    reminderCadence: "gentle",
    notificationSensitivity: "important",
    advisorTone: "friendly",
    preferredChannel: "in-app",
  },
  display: {
    theme: "system",
    density: "comfortable",
    contentDensity: "balanced",
    animations: true,
    calmMode: false,
    focusMode: false,
    chartStyle: "visual",
  },
  workflow: {
    automationComfort: "growing",
    riskTolerance: "moderate",
    decisionFormat: "recommended-action",
    reviewFrequency: "weekly",
    calendarIntensity: "moderate",
  },
  trust: {
    autoApproveThreshold: 500,
    requireConfirmationAbove: 1000,
    trustLevel: "careful",
    riskVisibility: "always",
    proofRequirement: "high-value",
  },
  schedule: {
    peakHours: "morning",
    quietHoursStart: 22,
    quietHoursEnd: 6,
    preferredMeetingDays: ["tuesday", "wednesday", "thursday"],
    weeklyReviewDay: "sunday",
    weeklyReviewTime: "18:00",
  },
  financial: {
    safeToSpendBuffer: 500,
    billPaymentTiming: "early",
    savingsAutoTransfer: false,
    savingsAmount: 200,
    spendingAlertThreshold: 150,
    budgetViewStyle: "category",
  },
  household: {
    groceryDay: "sunday",
    taskAssignment: "shared",
    familyMeetingDay: "sunday",
    familyMeetingTime: "18:00",
    childCoordination: "alternating",
    lifePriority: "balanced",
  },
  domain: {
    businessView: "pipeline",
    moneyView: "overview",
    conciergeView: "calendar",
  },
  autoPilot: false,
  privacyMode: false,
  lastUpdated: new Date().toISOString(),
};

// ─── Engine ───────────────────────────────────────────────

export class PersonalizationEngineService {
  private explicit: Map<string, Map<string, LayeredValue>> = new Map();
  private inferred: Map<string, Map<string, LayeredValue>> = new Map();

  /** Get resolved preferences — explicit > inferred > default */
  getPreferences(userId: string): UserPreferences {
    const base = { ...DEFAULT_PREFERENCES, userId, lastUpdated: new Date().toISOString() };
    const explicitMap = this.explicit.get(userId);
    const inferredMap = this.inferred.get(userId);

    // Apply inferred first, then explicit on top
    if (inferredMap) this.applyLayer(base, inferredMap);
    if (explicitMap) this.applyLayer(base, explicitMap);

    return base as UserPreferences;
  }

  /** Set an explicit preference (user-initiated) */
  setExplicit(userId: string, path: string, value: unknown): void {
    if (!this.explicit.has(userId)) this.explicit.set(userId, new Map());
    this.explicit.get(userId)!.set(path, {
      value,
      layer: "explicit",
      updatedAt: new Date().toISOString(),
    });
  }

  /** Set an inferred preference (from behavioral learning) */
  setInferred(userId: string, path: string, value: unknown): void {
    if (!this.inferred.has(userId)) this.inferred.set(userId, new Map());
    this.inferred.get(userId)!.set(path, {
      value,
      layer: "inferred",
      updatedAt: new Date().toISOString(),
    });
  }

  /** Check if a preference was explicitly set */
  isExplicit(userId: string, path: string): boolean {
    return this.explicit.get(userId)?.has(path) ?? false;
  }

  /** Get the layer source for a preference */
  getLayer(userId: string, path: string): PreferenceLayer {
    if (this.explicit.get(userId)?.has(path)) return "explicit";
    if (this.inferred.get(userId)?.has(path)) return "inferred";
    return "default";
  }

  /** Export all explicit preferences for persistence */
  exportExplicit(userId: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const map = this.explicit.get(userId);
    if (map) map.forEach((v, k) => { result[k] = v.value; });
    return result;
  }

  /** Import explicit preferences from persistence */
  importExplicit(userId: string, data: Record<string, unknown>): void {
    if (!this.explicit.has(userId)) this.explicit.set(userId, new Map());
    const map = this.explicit.get(userId)!;
    for (const [k, v] of Object.entries(data)) {
      map.set(k, { value: v, layer: "explicit", updatedAt: new Date().toISOString() });
    }
  }

  /** Reset all preferences for a user */
  reset(userId: string): UserPreferences {
    this.explicit.delete(userId);
    this.inferred.delete(userId);
    return this.getPreferences(userId);
  }

  /** Apply a layer map to a base preferences object */
  private applyLayer(base: Record<string, unknown>, layerMap: Map<string, LayeredValue>): void {
    for (const [path, lv] of layerMap) {
      const parts = path.split(".");
      let target: Record<string, unknown> = base;
      for (let i = 0; i < parts.length - 1; i++) {
        if (typeof target[parts[i]] !== "object" || target[parts[i]] === null) {
          target[parts[i]] = {};
        }
        target = target[parts[i]] as Record<string, unknown>;
      }
      target[parts[parts.length - 1]] = lv.value;
    }
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("personalization-engine", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      explicit: Array.from(this.explicit.entries()),
      inferred: Array.from(this.inferred.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.explicit) this.explicit = new Map(state.explicit as any);
    if (state.inferred) this.inferred = new Map(state.inferred as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("personalization-engine");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createPersonalizationEngine = () => new PersonalizationEngineService();
