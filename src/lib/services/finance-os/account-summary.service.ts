// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Account Summary Service
// Aggregates all financial accounts into a unified view
// ═══════════════════════════════════════════════════════════════

import type { FinancialAccount, AccountSummary, AccountType } from "@/packages/finance-contracts";

import type { AccountsByType } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { AccountsByType };

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

