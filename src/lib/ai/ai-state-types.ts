// ═══════════════════════════════════════════════════════════════
// SITA OS — AI State Types
// Canonical state taxonomy for all AI surfaces
// ═══════════════════════════════════════════════════════════════

// ── AI Surface State ───────────────────────────────────────────
export const AI_STATES = [
  "idle",
  "loading",
  "streaming",
  "success_real",
  "success_partial",
  "success_demo_governed",
  "degraded_provider_unavailable",
  "degraded_budget_limited",
  "degraded_fallback_used",
  "degraded_config_missing",
  "unavailable_capability",
  "unavailable_launch_gated",
  "blocked_budget",
  "blocked_config",
  "validation_failed",
  "rate_limited",
  "payment_required",
  "error",
] as const;

export type AIState = typeof AI_STATES[number];

// ── Launch Honesty Levels ──────────────────────────────────────
export const LAUNCH_LEVELS = [
  "real", "partial", "demo_governed", "internal_only", "unavailable", "planned",
] as const;

export type LaunchLevel = typeof LAUNCH_LEVELS[number];

// ── AI Surface Categories ──────────────────────────────────────
export type AISurfaceCategory =
  | "conversational"   // advisor chat, chief-of-staff
  | "synthesis"        // boardroom summary, daily pulse
  | "utility"          // classification, extraction
  | "recommendation";  // suggest, flag, draft

// ── Request Intent ─────────────────────────────────────────────
export type AIRequestIntent =
  | "chat" | "summarize" | "classify" | "extract"
  | "recommend" | "draft" | "transform" | "generate" | "analyze";

// ── Surface Identifier ─────────────────────────────────────────
export type AISurface =
  | "web.advisor" | "web.boardroom" | "web.admin"
  | "web.pulse" | "web.utility"
  | "mobile.chat" | "mobile.pulse"
  | "desktop.command" | "watch.glance";

// ── Task Class ─────────────────────────────────────────────────
export type AITaskClass =
  | "premium_synthesis"
  | "balanced_assistant"
  | "cheap_utility"
  | "fallback_degraded";

// ── Request Contract ───────────────────────────────────────────
export interface AICapabilityRequest {
  capabilityKey: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  taskClass?: AITaskClass;
  surface?: AISurface;
  intent?: AIRequestIntent;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  traceRequested?: boolean;
  receiptRequested?: boolean;
}

// ── Response Envelope ──────────────────────────────────────────
export interface AIResponseEnvelope {
  status: AIState;
  mode: "real" | "demo" | "degraded" | "unavailable";
  capabilityKey: string;
  content: string;
  structuredOutput?: Record<string, unknown>;
  degradedReason?: string;
  launchHonestyClass?: LaunchLevel;
  providerUsed?: string;
  modelUsed?: string;
  receiptId?: string;
  usageSummary?: {
    inputTokens: number;
    outputTokens: number;
    costCents: number;
    latencyMs: number;
    cached: boolean;
  };
  fallbackOccurred: boolean;
  userFacingMessage?: string;
  timestamp: string;
}

// ── State classification helpers ───────────────────────────────
export function isSuccessState(state: AIState): boolean {
  return state.startsWith("success_");
}

export function isDegradedState(state: AIState): boolean {
  return state.startsWith("degraded_") || state.startsWith("blocked_");
}

export function isUnavailableState(state: AIState): boolean {
  return state.startsWith("unavailable_");
}

export function isLoadingState(state: AIState): boolean {
  return state === "loading" || state === "streaming";
}

export function isTerminalState(state: AIState): boolean {
  return !isLoadingState(state) && state !== "idle";
}

export function getModeFromState(state: AIState): AIResponseEnvelope["mode"] {
  if (state.startsWith("success_real")) return "real";
  if (state === "success_demo_governed") return "demo";
  if (state.startsWith("degraded_")) return "degraded";
  if (state.startsWith("unavailable_") || state.startsWith("blocked_")) return "unavailable";
  return "real";
}

// ── User-facing state labels ───────────────────────────────────
export const STATE_LABELS: Record<AIState, string> = {
  idle: "Ready",
  loading: "Thinking…",
  streaming: "Responding…",
  success_real: "AI Response",
  success_partial: "Partial Response",
  success_demo_governed: "Demo Response",
  degraded_provider_unavailable: "Provider Unavailable",
  degraded_budget_limited: "Budget Limited",
  degraded_fallback_used: "Fallback Used",
  degraded_config_missing: "Configuration Missing",
  unavailable_capability: "Not Available",
  unavailable_launch_gated: "Coming Soon",
  blocked_budget: "Budget Exceeded",
  blocked_config: "Not Configured",
  validation_failed: "Validation Error",
  rate_limited: "Rate Limited",
  payment_required: "Credits Exhausted",
  error: "Error",
};
