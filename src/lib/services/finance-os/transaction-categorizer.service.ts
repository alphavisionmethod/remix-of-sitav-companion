// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Transaction Categorizer
// Rule-based auto-categorization engine
// ═══════════════════════════════════════════════════════════════

import type { TransactionRecord, CategorizedSpend } from "@/packages/finance-contracts";

import type { CategorizationRule } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { CategorizationRule };

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

