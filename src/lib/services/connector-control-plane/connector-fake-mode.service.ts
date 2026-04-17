// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Fake Mode Service
// Mock connector for development/demo + auto-fallback policy
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface FakeModeConfig {
  enabled: boolean;
  latencyMs: number;
  failureRate: number;
  connectors: string[];
}

let fakeConfig: FakeModeConfig = {
  enabled: false,
  latencyMs: 100,
  failureRate: 0,
  connectors: [],
};

// Sliding-window failure tracker — keyed by accountId
const FAILURE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const FAILURE_THRESHOLD = 3;
const failureLog = new Map<string, number[]>();

export function enableFakeMode(config?: Partial<FakeModeConfig>): FakeModeConfig {
  fakeConfig = { ...fakeConfig, enabled: true, ...config };
  return fakeConfig;
}

export function disableFakeMode(): void {
  fakeConfig.enabled = false;
}

export function isFakeModeEnabled(connectorId?: string): boolean {
  if (!fakeConfig.enabled) return false;
  if (connectorId && fakeConfig.connectors.length > 0) {
    return fakeConfig.connectors.includes(connectorId);
  }
  return true;
}

export function getFakeResponse(
  connectorId: string,
  action: string,
): { success: boolean; data: Record<string, unknown>; fake: true } {
  const shouldFail = Math.random() < fakeConfig.failureRate;
  return {
    success: !shouldFail,
    data: shouldFail
      ? { error: "Simulated failure", connectorId, action }
      : {
          connectorId,
          action,
          result: "synthetic-data",
          generatedAt: new Date().toISOString(),
          recordCount: Math.floor(Math.random() * 20) + 1,
        },
    fake: true,
  };
}

export function getFakeModeConfig(): FakeModeConfig {
  return { ...fakeConfig };
}

// ═══════════════════════════════════════════════════════════════
// Auto-fallback policy (Phase 22.1.C)
// ═══════════════════════════════════════════════════════════════

/**
 * Record a connector failure. After 3 failures within a 10-min sliding
 * window for the same account, auto-engage fake/degraded mode.
 */
export async function recordConnectorFailure(
  accountId: string,
  connectorType: string,
  errorMessage?: string,
): Promise<{ engaged: boolean; failureCount: number }> {
  const now = Date.now();
  const cutoff = now - FAILURE_WINDOW_MS;

  const recent = (failureLog.get(accountId) || []).filter((t) => t > cutoff);
  recent.push(now);
  failureLog.set(accountId, recent);

  if (recent.length >= FAILURE_THRESHOLD) {
    await engageFakeMode(accountId, connectorType, errorMessage);
    failureLog.delete(accountId);
    return { engaged: true, failureCount: recent.length };
  }

  return { engaged: false, failureCount: recent.length };
}

/**
 * Engage degraded/fake mode for a specific account.
 * Flips status, writes receipt, emits Phase-20 alert.
 */
export async function engageFakeMode(
  accountId: string,
  connectorType: string,
  reason?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Flip account → degraded
  await fromTable("connector_accounts")
    .update({ status: "degraded", demo_mode: true })
    .eq("id", accountId);

  // Write fallback receipt
  if (userId) {
    await fromTable("connector_receipts").insert({
      user_id: userId,
      account_id: accountId,
      event_type: "fallback_engaged",
      connector_type: connectorType,
      details: {
        reason: reason || `${FAILURE_THRESHOLD} failures in ${FAILURE_WINDOW_MS / 60000}min`,
        engaged_at: new Date().toISOString(),
        policy: "auto_3x10min",
      },
    });
  }

  // Emit Phase 20 alert (best-effort)
  try {
    await supabase.functions.invoke("alert-ingest", {
      body: {
        source: "connector-fake-mode",
        subsystem: "connectors",
        severity: "warning",
        title: `Connector ${connectorType} degraded`,
        description: `Auto-engaged fallback mode after ${FAILURE_THRESHOLD} failures in 10min for account ${accountId}.`,
        fingerprint: `connector-degraded:${accountId}`,
        metadata: { account_id: accountId, connector_type: connectorType, reason },
      },
    });
  } catch {
    // best-effort
  }

  // Update local mode
  fakeConfig = {
    ...fakeConfig,
    enabled: true,
    connectors: Array.from(new Set([...fakeConfig.connectors, connectorType])),
  };
}

/**
 * Manual override — disengage fake/degraded mode for an account.
 */
export async function disengageFakeMode(
  accountId: string,
  connectorType: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  await fromTable("connector_accounts")
    .update({ status: "connected", demo_mode: false })
    .eq("id", accountId);

  if (userId) {
    await fromTable("connector_receipts").insert({
      user_id: userId,
      account_id: accountId,
      event_type: "fallback_disengaged",
      connector_type: connectorType,
      details: { disengaged_at: new Date().toISOString(), source: "manual_admin_override" },
    });
  }

  failureLog.delete(accountId);
  fakeConfig = {
    ...fakeConfig,
    connectors: fakeConfig.connectors.filter((c) => c !== connectorType),
  };
}

export function getFailureCount(accountId: string): number {
  const cutoff = Date.now() - FAILURE_WINDOW_MS;
  return (failureLog.get(accountId) || []).filter((t) => t > cutoff).length;
}
