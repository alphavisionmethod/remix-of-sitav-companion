// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Transaction Categorizer
// Rule-based auto-categorization engine
// ═══════════════════════════════════════════════════════════════

import type { TransactionRecord, CategorizedSpend } from "@/packages/finance-contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface CategorizationRule {
  id: string;
  pattern: string;
  category: string;
  subcategory?: string;
  priority: number;
}

const DEFAULT_RULES: CategorizationRule[] = [
  { id: "r-1", pattern: "grocery|whole foods|trader joe|kroger|safeway", category: "Groceries", priority: 10 },
  { id: "r-2", pattern: "uber|lyft|taxi|parking", category: "Transportation", priority: 10 },
  { id: "r-3", pattern: "netflix|spotify|hulu|disney|hbo", category: "Entertainment", subcategory: "Streaming", priority: 10 },
  { id: "r-4", pattern: "amazon|walmart|target", category: "Shopping", priority: 5 },
  { id: "r-5", pattern: "restaurant|cafe|coffee|starbucks|doordash|grubhub", category: "Dining", priority: 10 },
  { id: "r-6", pattern: "electric|gas|water|internet|phone|verizon|att", category: "Utilities", priority: 10 },
  { id: "r-7", pattern: "mortgage|rent", category: "Housing", priority: 10 },
  { id: "r-8", pattern: "insurance|geico|state farm|allstate", category: "Insurance", priority: 10 },
];

export function categorizeTransaction(tx: TransactionRecord, rules: CategorizationRule[] = DEFAULT_RULES): TransactionRecord {
  const desc = (tx.description + " " + (tx.merchantName || "")).toLowerCase();
  const matchedRule = rules
    .sort((a, b) => b.priority - a.priority)
    .find(r => new RegExp(r.pattern, "i").test(desc));

  if (matchedRule) {
    return { ...tx, category: matchedRule.category, subcategory: matchedRule.subcategory, categorizedBy: "rule" };
  }
  return { ...tx, category: tx.category || "Uncategorized", categorizedBy: "rule" };
}

export function aggregateSpend(transactions: TransactionRecord[]): CategorizedSpend[] {
  const debits = transactions.filter(t => t.type === "debit");
  const total = debits.reduce((s, t) => s + Math.abs(t.amountCents), 0);
  const byCategory = new Map<string, { total: number; count: number }>();

  for (const t of debits) {
    const cat = t.category || "Uncategorized";
    const existing = byCategory.get(cat) || { total: 0, count: 0 };
    existing.total += Math.abs(t.amountCents);
    existing.count += 1;
    byCategory.set(cat, existing);
  }

  return Array.from(byCategory.entries()).map(([category, data]) => ({
    category,
    totalCents: data.total,
    transactionCount: data.count,
    percentOfTotal: total > 0 ? Math.round((data.total / total) * 100) : 0,
    trend: "stable" as const,
    trendPercent: 0,
  })).sort((a, b) => b.totalCents - a.totalCents);
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "finance-os/transaction-categorizer";

function _serializeState(): Record<string, unknown> {
  return {
    byCategory: Array.from(byCategory.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.byCategory) { byCategory.clear(); (state.byCategory as any[]).forEach(([k, v]: any) => byCategory.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}