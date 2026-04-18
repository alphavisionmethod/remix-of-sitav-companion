// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Surface Grammar
// Visual semantics shared across all AI surfaces
// ═══════════════════════════════════════════════════════════════

import type { AIState, LaunchLevel } from "./ai-state-types";

// ── Trust Badge Config ─────────────────────────────────────────
export interface TrustBadgeConfig {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  className: string;
}

export const STATE_BADGE_CONFIG: Record<AIState, TrustBadgeConfig> = {
  idle: { label: "Ready", variant: "outline", className: "text-muted-foreground" },
  loading: { label: "Thinking…", variant: "outline", className: "animate-pulse text-muted-foreground" },
  streaming: { label: "Responding…", variant: "outline", className: "animate-pulse text-primary" },
  success_real: { label: "AI Response", variant: "default", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  success_partial: { label: "Partial", variant: "secondary", className: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  success_demo_governed: { label: "Demo", variant: "outline", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  degraded_provider_unavailable: { label: "Provider Down", variant: "destructive", className: "" },
  degraded_budget_limited: { label: "Budget Limited", variant: "secondary", className: "bg-amber-500/20 text-amber-300" },
  degraded_fallback_used: { label: "Fallback Used", variant: "secondary", className: "bg-amber-500/20 text-amber-300" },
  degraded_config_missing: { label: "Not Configured", variant: "outline", className: "text-muted-foreground" },
  unavailable_capability: { label: "Unavailable", variant: "outline", className: "text-muted-foreground" },
  unavailable_launch_gated: { label: "Coming Soon", variant: "outline", className: "text-muted-foreground" },
  blocked_budget: { label: "Budget Exceeded", variant: "destructive", className: "" },
  blocked_config: { label: "Not Configured", variant: "outline", className: "text-muted-foreground" },
  validation_failed: { label: "Validation Error", variant: "destructive", className: "" },
  rate_limited: { label: "Rate Limited", variant: "secondary", className: "bg-amber-500/20 text-amber-300" },
  payment_required: { label: "Credits Needed", variant: "destructive", className: "" },
  error: { label: "Error", variant: "destructive", className: "" },
};

export const LAUNCH_LEVEL_CONFIG: Record<LaunchLevel, TrustBadgeConfig> = {
  real: { label: "Real AI", variant: "default", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  partial: { label: "Partial AI", variant: "secondary", className: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  demo_governed: { label: "Demo Mode", variant: "outline", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  internal_only: { label: "Internal Only", variant: "outline", className: "text-muted-foreground" },
  unavailable: { label: "Unavailable", variant: "outline", className: "text-muted-foreground" },
  planned: { label: "Planned", variant: "outline", className: "text-muted-foreground" },
};

// ── User-facing degraded messages ──────────────────────────────
export const DEGRADED_MESSAGES: Record<string, { title: string; description: string; action?: string }> = {
  no_api_key: {
    title: "AI Not Configured",
    description: "AI services require provider configuration. Contact your administrator.",
    action: "Configure AI",
  },
  budget_exceeded: {
    title: "AI Budget Exceeded",
    description: "Your AI usage has reached the configured budget limit for this period.",
    action: "View Budget",
  },
  rate_limited: {
    title: "Too Many Requests",
    description: "AI services are temporarily rate-limited. Please wait a moment.",
  },
  payment_required: {
    title: "Credits Exhausted",
    description: "AI credits have been used up. Add funds to continue using AI features.",
    action: "Add Funds",
  },
  provider_unavailable: {
    title: "AI Temporarily Unavailable",
    description: "The AI provider is experiencing issues. We'll retry automatically.",
  },
  config_missing: {
    title: "Not Yet Configured",
    description: "This AI capability hasn't been configured yet.",
    action: "Setup Guide",
  },
  launch_gated: {
    title: "Coming Soon",
    description: "This AI feature is not yet available. Stay tuned for updates.",
  },
};

// ── Freshness helpers ──────────────────────────────────────────
export function formatFreshness(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "generated just now";
  if (mins < 60) return `generated ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `generated ${hours}h ago`;
  return `generated ${Math.floor(hours / 24)}d ago`;
}

export function isStale(timestamp: string, maxAgeMinutes = 30): boolean {
  return Date.now() - new Date(timestamp).getTime() > maxAgeMinutes * 60000;
}
