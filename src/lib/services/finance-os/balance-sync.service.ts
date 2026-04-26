// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Balance Sync Service
// Reconciliation logic for connected accounts
// ═══════════════════════════════════════════════════════════════

import type { FinancialAccount } from "@/packages/finance-contracts";

import type { SyncResult, SyncHealthReport } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { SyncResult, SyncHealthReport };

export function reconcileBalance(account: FinancialAccount, newBalanceCents: number): SyncResult {
  const delta = newBalanceCents - account.balanceCents;
  const discrepancy = Math.abs(delta) > account.balanceCents * 0.1; // >10% change is flagged

  return {
    accountId: account.id,
    previousBalanceCents: account.balanceCents,
    newBalanceCents,
    deltaCents: delta,
    synced: true,
    syncedAt: new Date().toISOString(),
    discrepancy,
    discrepancyReason: discrepancy ? `Balance changed by ${((delta / account.balanceCents) * 100).toFixed(1)}%` : undefined,
  };
}

export function buildSyncHealthReport(accounts: FinancialAccount[]): SyncHealthReport {
  const now = Date.now();
  const syncAges = accounts.map(a => (now - new Date(a.lastSyncedAt).getTime()) / 60000);
  const stale = accounts.filter(a => (now - new Date(a.lastSyncedAt).getTime()) > 24 * 3600000);

  return {
    totalAccounts: accounts.length,
    synced: accounts.filter(a => a.isActive).length,
    failed: 0,
    stale: stale.length,
    avgSyncAgeMinutes: Math.round(syncAges.reduce((s, a) => s + a, 0) / (syncAges.length || 1)),
    overallHealth: stale.length > accounts.length * 0.5 ? "critical" : stale.length > 0 ? "degraded" : "healthy",
    generatedAt: new Date().toISOString(),
  };
}

