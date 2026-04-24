// ═══════════════════════════════════════════════════════
// SITA OS — Kill Switch E2E Drill Helpers
//
// Thin client around the kill-switch-toggle / kill-switch-state
// edge functions for use inside Playwright drills. Designed to
// arm a sandbox/drill-only switch, observe state + audit + receipt
// emission, and disarm cleanly so degraded recovery can be verified.
// ═══════════════════════════════════════════════════════

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

/** Drill-only switch ID — never used by production logic. */
export const DRILL_SWITCH_ID = "KS-DRILL-E2E";

export interface DrillContext {
  client: SupabaseClient;
  email: string;
  userId: string;
  drillRunId: string;
}

export function hasKillSwitchDrillCredentials(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      process.env.E2E_ADMIN_EMAIL &&
      process.env.E2E_ADMIN_PASSWORD,
  );
}

export async function loginAsDrillAdmin(): Promise<DrillContext> {
  if (!hasKillSwitchDrillCredentials()) {
    throw new Error(
      "kill-switch drill requires VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD",
    );
  }
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = process.env.E2E_ADMIN_EMAIL!;
  const password = process.env.E2E_ADMIN_PASSWORD!;
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(`drill admin login failed: ${error?.message ?? "no user"}`);
  }
  return {
    client,
    email,
    userId: data.user.id,
    drillRunId: `drill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export async function armDrillSwitch(
  ctx: DrillContext,
  reason: string,
): Promise<{ ok: boolean; rowId?: string; raw: unknown }> {
  const { data, error } = await ctx.client.functions.invoke("kill-switch-toggle", {
    body: {
      switchId: DRILL_SWITCH_ID,
      enable: true,
      reason,
      severity: "moderate",
      expiresInMinutes: 5,
    },
  });
  if (error) {
    return { ok: false, raw: { error: error.message } };
  }
  const payload = (data ?? {}) as { ok?: boolean; rowId?: string };
  return { ok: !!payload.ok, rowId: payload.rowId, raw: payload };
}

export async function disarmDrillSwitch(
  ctx: DrillContext,
  reason: string,
): Promise<{ ok: boolean; raw: unknown }> {
  const { data, error } = await ctx.client.functions.invoke("kill-switch-toggle", {
    body: {
      switchId: DRILL_SWITCH_ID,
      enable: false,
      reason,
    },
  });
  if (error) return { ok: false, raw: { error: error.message } };
  const payload = (data ?? {}) as { ok?: boolean };
  return { ok: !!payload.ok, raw: payload };
}

export async function readDrillSwitchState(ctx: DrillContext): Promise<{
  enabled: boolean;
  reason: string | null;
  severity: string;
  expiresAt: string | null;
} | null> {
  const { data, error } = await ctx.client.functions.invoke("kill-switch-state", {
    body: {},
  });
  if (error) return null;
  const map = ((data ?? {}) as { switches?: Record<string, unknown> }).switches ?? {};
  const entry = map[DRILL_SWITCH_ID] as
    | { enabled: boolean; reason: string | null; severity: string; expiresAt: string | null }
    | undefined;
  return entry ?? null;
}

export async function readRecentAuditRows(
  ctx: DrillContext,
  windowSeconds = 120,
): Promise<Array<Record<string, unknown>>> {
  const sinceIso = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { data } = await ctx.client
    .from("kill_switch_audit_log")
    .select("id, switch_id, action, actor_user_id, reason, created_at")
    .eq("switch_id", DRILL_SWITCH_ID)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as Array<Record<string, unknown>>;
}

export async function readRecentReceiptRows(
  ctx: DrillContext,
  windowSeconds = 120,
): Promise<Array<Record<string, unknown>>> {
  const sinceIso = new Date(Date.now() - windowSeconds * 1000).toISOString();
  // Receipts table is the canonical proof surface; filter by user + window.
  const { data } = await ctx.client
    .from("receipts")
    .select("id, action, payload, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Array<Record<string, unknown>>;
}

export interface DrillReceipt {
  drillRunId: string;
  switchId: string;
  startedAt: string;
  finishedAt: string;
  armed: boolean;
  disarmed: boolean;
  stateObservedEnabled: boolean;
  stateObservedDisabled: boolean;
  auditRowsObserved: number;
  receiptsInWindow: number;
  degradedUiObserved: boolean;
  recoveryUiObserved: boolean;
  pass: boolean;
  notes: string[];
}

export function emptyDrillReceipt(runId: string): DrillReceipt {
  return {
    drillRunId: runId,
    switchId: DRILL_SWITCH_ID,
    startedAt: new Date().toISOString(),
    finishedAt: "",
    armed: false,
    disarmed: false,
    stateObservedEnabled: false,
    stateObservedDisabled: false,
    auditRowsObserved: 0,
    receiptsInWindow: 0,
    degradedUiObserved: false,
    recoveryUiObserved: false,
    pass: false,
    notes: [],
  };
}