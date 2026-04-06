// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Account Summary Service
// Aggregates all financial accounts into a unified view
// ═══════════════════════════════════════════════════════════════

import type { FinancialAccount, AccountSummary, AccountType } from "@/packages/finance-contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface AccountsByType {
  type: AccountType;
  accounts: FinancialAccount[];
  totalBalanceCents: number;
  count: number;
}

export function buildAccountSummary(accounts: FinancialAccount[]): AccountSummary {
  const assets = accounts.filter(a => ["checking", "savings", "investment", "retirement"].includes(a.type));
  const liabilities = accounts.filter(a => ["credit", "loan"].includes(a.type));

  return {
    totalAssets: assets.reduce((s, a) => s + a.balanceCents, 0),
    totalLiabilities: liabilities.reduce((s, a) => s + Math.abs(a.balanceCents), 0),
    netWorth: assets.reduce((s, a) => s + a.balanceCents, 0) - liabilities.reduce((s, a) => s + Math.abs(a.balanceCents), 0),
    accounts,
    lastUpdated: new Date().toISOString(),
  };
}

export function groupAccountsByType(accounts: FinancialAccount[]): AccountsByType[] {
  const typeMap = new Map<AccountType, FinancialAccount[]>();
  for (const a of accounts) {
    const list = typeMap.get(a.type) || [];
    list.push(a);
    typeMap.set(a.type, list);
  }
  return Array.from(typeMap.entries()).map(([type, accts]) => ({
    type,
    accounts: accts,
    totalBalanceCents: accts.reduce((s, a) => s + a.balanceCents, 0),
    count: accts.length,
  }));
}

export function detectStaleAccounts(accounts: FinancialAccount[], thresholdHours: number = 24): FinancialAccount[] {
  const cutoff = Date.now() - thresholdHours * 3600000;
  return accounts.filter(a => a.isActive && new Date(a.lastSyncedAt).getTime() < cutoff);
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "finance-os/account-summary";

function _serializeState(): Record<string, unknown> {
  return {
    typeMap: Array.from(typeMap.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.typeMap) { typeMap.clear(); (state.typeMap as any[]).forEach(([k, v]: any) => typeMap.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}