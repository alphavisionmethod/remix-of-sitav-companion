// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Flow Bridge
// Connects in-memory services to Supabase ambient tables
// Ensures UAO tables receive real data from runtime services
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

let bridgeUserId: string | null = null;

async function getBridgeUserId(): Promise<string | null> {
  if (bridgeUserId) return bridgeUserId;
  const { data: { user } } = await supabase.auth.getUser();
  bridgeUserId = user?.id ?? null;
  return bridgeUserId;
}

supabase.auth.onAuthStateChange(() => { bridgeUserId = null; });

// ── Generic insert helper ───────────────────────────────────
async function bridgeInsert(table: string, row: Record<string, unknown>): Promise<boolean> {
  const userId = await getBridgeUserId();
  if (!userId) return false;
  const { error } = await (supabase as any).from(table).insert({ ...row, user_id: userId });
  if (error) {
    console.warn(`[data-flow-bridge] ${table} insert failed:`, error.message);
    return false;
  }
  return true;
}

// ── Bridge: OS Event Log ────────────────────────────────────
export async function logOsEvent(eventType: string, source: string, payload: Record<string, unknown> = {}): Promise<void> {
  await bridgeInsert("os_event_log", { event_type: eventType, source, payload });
}

// ── Bridge: Audit Log ───────────────────────────────────────
export async function logAuditEvent(action: string, category: string, targetType: string, targetId: string, severity: string = "info", details: Record<string, unknown> = {}): Promise<void> {
  await bridgeInsert("audit_logs", { action, category, actor: "system", target_type: targetType, target_id: targetId, severity, details });
}

// ── Bridge: Connector Health ────────────────────────────────
export async function recordConnectorHealth(connectorKey: string, healthState: string, lastSyncAt: string | null, errorSummary: string | null = null): Promise<void> {
  await bridgeInsert("connector_health_records", {
    connector_key: connectorKey,
    health_state: healthState,
    last_sync_at: lastSyncAt,
    error_summary: errorSummary,
    checked_at: new Date().toISOString(),
  });
}

// ── Bridge: AI Usage Ledger ─────────────────────────────────
export async function recordAiUsage(capabilityKey: string, model: string, provider: string, inputTokens: number, outputTokens: number, latencyMs: number, estimatedCostUsd: number, status: string = "success"): Promise<void> {
  await bridgeInsert("ai_usage_ledger", {
    capability_key: capabilityKey,
    model,
    provider,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
    latency_ms: latencyMs,
    estimated_cost_usd: estimatedCostUsd,
    status,
  });
}

// ── Bridge: Incident ────────────────────────────────────────
export async function createIncident(title: string, description: string, severity: string, source: string): Promise<void> {
  await bridgeInsert("incidents", { title, description, severity, source, status: "open" });
}

// ── Bridge: SITA Receipt ────────────────────────────────────
export async function recordReceipt(receiptType: string, sourceService: string, payload: Record<string, unknown>): Promise<void> {
  await bridgeInsert("sita_receipts", {
    receipt_type: receiptType,
    source_service: sourceService,
    payload,
    created_at: new Date().toISOString(),
  });
}

// ── Bridge: Surface Context State ───────────────────────────
export async function updateSurfaceContext(surfaceKey: string, contextState: Record<string, unknown>): Promise<void> {
  const userId = await getBridgeUserId();
  if (!userId) return;
  await (supabase as any).from("surface_context_states").upsert({
    user_id: userId,
    surface_key: surfaceKey,
    context_state: contextState,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,surface_key" });
}

// ── Bridge: Presence State ──────────────────────────────────
export async function updatePresenceState(surface: string, status: string): Promise<void> {
  const userId = await getBridgeUserId();
  if (!userId) return;
  await (supabase as any).from("presence_states").upsert({
    user_id: userId,
    surface,
    status,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: "user_id,surface" });
}

// ── Master: Initialize all ambient flows ────────────────────
export async function initializeDataFlows(): Promise<void> {
  const userId = await getBridgeUserId();
  if (!userId) return;

  // Log OS boot event
  await logOsEvent("os_boot", "data_flow_bridge", { phase: "ambient_init" });

  // Set initial presence
  await updatePresenceState("web_desktop", "active");

  // Record initial surface context
  await updateSurfaceContext("web_desktop", {
    viewport: "desktop",
    colorScheme: "dark",
    initialized: true,
    bootedAt: new Date().toISOString(),
  });

  console.log("[data-flow-bridge] Ambient data flows initialized");
}
