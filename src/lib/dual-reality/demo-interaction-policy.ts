// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Interaction Policy
// Governs what interactions are allowed in demo mode:
// beautiful flows, believable experiences, safe boundaries
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "./reality-mode-registry";
import { evaluateDemoPolicy, type SideEffectCategory } from "./demo-policy-engine";

export type InteractionType =
  | "view"           // Read-only viewing
  | "navigate"       // Route navigation
  | "search"         // Search/filter
  | "sort"           // Sort/organize
  | "expand"         // Expand/collapse
  | "select"         // Select items
  | "approve_demo"   // Demo approval flow
  | "create_demo"    // Demo create flow
  | "edit_demo"      // Demo edit flow
  | "delete_demo"    // Demo delete flow
  | "ai_chat"        // AI conversation
  | "ai_summary"     // AI summary generation
  | "connector_test" // Connector test flow
  | "export_demo"    // Demo export flow
  | "notification"   // Notification interaction
  | "boardroom"      // Boardroom interaction
  | "approval_flow"  // Full approval workflow
  | "settings_view"  // Settings viewing (no persist)
  | "pulse_view"     // Daily pulse interaction
  ;

export interface DemoInteractionRule {
  interactionType: InteractionType;
  allowedInDemo: boolean;
  sideEffectCategory: SideEffectCategory | null;
  uiResponse: "full" | "simulated" | "preview_only" | "blocked_with_message";
  blockMessage?: string;
  writesToDemoStore: boolean;
  requiresScenarioContext: boolean;
}

const INTERACTION_RULES: Record<InteractionType, DemoInteractionRule> = {
  view: { interactionType: "view", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: false },
  navigate: { interactionType: "navigate", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: false },
  search: { interactionType: "search", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: false },
  sort: { interactionType: "sort", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: false },
  expand: { interactionType: "expand", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: false },
  select: { interactionType: "select", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: false },
  approve_demo: { interactionType: "approve_demo", allowedInDemo: true, sideEffectCategory: "approval_execute", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: true },
  create_demo: { interactionType: "create_demo", allowedInDemo: true, sideEffectCategory: "data_mutation", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: true },
  edit_demo: { interactionType: "edit_demo", allowedInDemo: true, sideEffectCategory: "data_mutation", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: true },
  delete_demo: { interactionType: "delete_demo", allowedInDemo: true, sideEffectCategory: "data_mutation", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: true },
  ai_chat: { interactionType: "ai_chat", allowedInDemo: true, sideEffectCategory: "ai_inference", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: false },
  ai_summary: { interactionType: "ai_summary", allowedInDemo: true, sideEffectCategory: "ai_inference", uiResponse: "simulated", writesToDemoStore: false, requiresScenarioContext: false },
  connector_test: { interactionType: "connector_test", allowedInDemo: true, sideEffectCategory: "connector_write", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: true },
  export_demo: { interactionType: "export_demo", allowedInDemo: true, sideEffectCategory: "external_write", uiResponse: "preview_only", writesToDemoStore: false, requiresScenarioContext: false },
  notification: { interactionType: "notification", allowedInDemo: true, sideEffectCategory: "notification", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: false },
  boardroom: { interactionType: "boardroom", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: true },
  approval_flow: { interactionType: "approval_flow", allowedInDemo: true, sideEffectCategory: "approval_execute", uiResponse: "simulated", writesToDemoStore: true, requiresScenarioContext: true },
  settings_view: { interactionType: "settings_view", allowedInDemo: true, sideEffectCategory: null, uiResponse: "preview_only", blockMessage: "Settings changes are preview-only in demo mode", writesToDemoStore: false, requiresScenarioContext: false },
  pulse_view: { interactionType: "pulse_view", allowedInDemo: true, sideEffectCategory: null, uiResponse: "full", writesToDemoStore: false, requiresScenarioContext: true },
};

export interface InteractionEvaluation {
  allowed: boolean;
  interactionType: InteractionType;
  uiResponse: DemoInteractionRule["uiResponse"];
  message?: string;
  writesToDemoStore: boolean;
  receiptRequired: boolean;
}

/**
 * Evaluate whether a demo interaction is allowed and how the UI should respond
 */
export function evaluateInteraction(
  mode: RealityModeKey,
  interactionType: InteractionType,
  opts?: { scenarioId?: string }
): InteractionEvaluation {
  // Real mode: everything allowed normally
  if (mode === "real") {
    return { allowed: true, interactionType, uiResponse: "full", writesToDemoStore: false, receiptRequired: false };
  }

  const rule = INTERACTION_RULES[interactionType];
  if (!rule) {
    return { allowed: false, interactionType, uiResponse: "blocked_with_message", message: "Unknown interaction type", writesToDemoStore: false, receiptRequired: true };
  }

  // Check side-effect policy if applicable
  if (rule.sideEffectCategory) {
    const policy = evaluateDemoPolicy(mode, rule.sideEffectCategory, opts);
    if (!policy.allowed) {
      return {
        allowed: false,
        interactionType,
        uiResponse: "blocked_with_message",
        message: policy.reason,
        writesToDemoStore: false,
        receiptRequired: true,
      };
    }
  }

  return {
    allowed: rule.allowedInDemo,
    interactionType,
    uiResponse: rule.uiResponse,
    message: rule.blockMessage,
    writesToDemoStore: rule.writesToDemoStore,
    receiptRequired: rule.sideEffectCategory !== null,
  };
}

/**
 * Get all interaction rules for documentation/admin viewing
 */
export function getAllInteractionRules(): DemoInteractionRule[] {
  return Object.values(INTERACTION_RULES);
}

/**
 * Check if an interaction writes to demo stores
 */
export function interactionWritesToDemo(interactionType: InteractionType): boolean {
  return INTERACTION_RULES[interactionType]?.writesToDemoStore ?? false;
}
