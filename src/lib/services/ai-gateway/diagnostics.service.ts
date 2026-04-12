// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Degraded State Diagnostics Service
// Aggregates provider health, budget, fallbacks, and capability gaps
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

export interface DegradedDiagnostic {
  id: string;
  category: "missing_key" | "rate_limited" | "provider_failure" | "budget_fallback" | "invalid_structured" | "unavailable_capability" | "provider_degraded";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  provider?: string;
  capability?: string;
  timestamp: string;
}

export async function getDegradedDiagnostics(): Promise<DegradedDiagnostic[]> {
  const diagnostics: DegradedDiagnostic[] = [];

  const [
    { data: providers },
    { data: health },
    { data: fallbacks },
    { data: alerts },
    { data: receipts },
    { data: routing },
  ] = await Promise.all([
    fromDynamicTable("ai_provider_registry").select("*"),
    fromDynamicTable("ai_provider_health").select("*"),
    fromDynamicTable("ai_fallback_events").select("*").order("created_at", { ascending: false }).limit(50),
    fromDynamicTable("ai_budget_alerts").select("*").in("alert_state", ["warning", "critical"]).order("created_at", { ascending: false }).limit(20),
    fromDynamicTable("ai_receipt_records").select("*").order("created_at", { ascending: false }).limit(100),
    fromDynamicTable("ai_capability_routing").select("*").eq("is_active", true),
  ]);

  // Missing keys — providers with secret_env_name but no health record or inactive
  (providers ?? []).forEach(p => {
    if (p.secret_env_name && !p.is_active) {
      diagnostics.push({
        id: `missing-key-${p.id}`,
        category: "missing_key",
        severity: "critical",
        title: `Provider "${p.display_name}" inactive — possible missing key`,
        description: `Secret env: ${p.secret_env_name}. Provider is registered but not active.`,
        provider: p.provider_key,
        timestamp: p.updated_at,
      });
    }
  });

  // Provider health issues
  (health ?? []).forEach(h => {
    if (h.health_state === "degraded" || h.health_state === "unavailable") {
      diagnostics.push({
        id: `health-${h.id}`,
        category: "provider_degraded",
        severity: h.health_state === "unavailable" ? "critical" : "high",
        title: `Provider "${h.provider}" is ${h.health_state}`,
        description: h.failure_reason ?? h.incident_description ?? `Error rate: ${((h.error_rate ?? 0) * 100).toFixed(1)}%`,
        provider: h.provider,
        timestamp: h.updated_at,
      });
    }
    if (h.rate_limit_pressure != null && h.rate_limit_pressure > 0.7) {
      diagnostics.push({
        id: `rate-limit-${h.id}`,
        category: "rate_limited",
        severity: h.rate_limit_pressure > 0.9 ? "critical" : "high",
        title: `Provider "${h.provider}" rate limit pressure: ${(h.rate_limit_pressure * 100).toFixed(0)}%`,
        description: `Rate limit pressure is high. Requests may be throttled.`,
        provider: h.provider,
        timestamp: h.updated_at,
      });
    }
  });

  // Budget-triggered fallbacks from fallback events
  (fallbacks ?? []).forEach(f => {
    if (f.fallback_reason.includes("budget") || f.fallback_reason.includes("cost")) {
      diagnostics.push({
        id: `budget-fb-${f.id}`,
        category: "budget_fallback",
        severity: "medium",
        title: `Budget fallback: ${f.capability_key}`,
        description: `Reason: ${f.fallback_reason}. Result: ${f.result_state}`,
        capability: f.capability_key,
        timestamp: f.created_at,
      });
    } else {
      diagnostics.push({
        id: `fallback-${f.id}`,
        category: "provider_failure",
        severity: f.result_state === "fallback_failed" ? "critical" : "medium",
        title: `Fallback event: ${f.capability_key}`,
        description: `Reason: ${f.fallback_reason}. Result: ${f.result_state}`,
        capability: f.capability_key,
        provider: f.primary_provider_id ?? undefined,
        timestamp: f.created_at,
      });
    }
  });

  // Budget alerts
  (alerts ?? []).forEach(a => {
    diagnostics.push({
      id: `budget-alert-${a.id}`,
      category: "budget_fallback",
      severity: a.alert_state === "critical" ? "critical" : "high",
      title: `Budget ${a.alert_state}: ${a.scope_type}${a.scope_ref ? ` · ${a.scope_ref}` : ""}`,
      description: `${a.threshold_percent}% threshold hit. Observed: $${a.observed_cost_usd}. Period: ${a.period_class}`,
      timestamp: a.created_at,
    });
  });

  // Invalid structured outputs from receipt records
  (receipts ?? []).forEach(r => {
    if (r.structured_output_valid === false) {
      diagnostics.push({
        id: `struct-${r.id}`,
        category: "invalid_structured",
        severity: "medium",
        title: `Invalid structured output: ${r.capability_key}`,
        description: r.degraded_reason ?? "Structured output validation failed",
        capability: r.capability_key,
        timestamp: r.created_at,
      });
    }
    if (r.degraded_reason && r.mode === "demo") {
      diagnostics.push({
        id: `degraded-${r.id}`,
        category: "unavailable_capability",
        severity: "high",
        title: `Degraded to demo: ${r.capability_key}`,
        description: r.degraded_reason,
        capability: r.capability_key,
        timestamp: r.created_at,
      });
    }
  });

  // Capabilities with no fallback
  (routing ?? []).forEach(r => {
    if (!r.fallback_model_id && !r.fallback_provider_id && !r.can_fallback_to_demo && !r.can_fallback_to_unavailable) {
      diagnostics.push({
        id: `no-fallback-${r.id}`,
        category: "unavailable_capability",
        severity: "low",
        title: `No fallback configured: ${r.capability_key}`,
        description: "This capability has no fallback model, provider, or demo degradation path.",
        capability: r.capability_key,
        timestamp: r.updated_at,
      });
    }
  });

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  diagnostics.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return diagnostics;
}

