// Phase 7 — legacy path now re-exports the canonical module.
// Real implementation lives at src/modules/finance/pages/MoneyApprovals.tsx.
// Kept as a re-export so existing imports (FinanceAppShell, router) keep working.
export { default } from "@/modules/finance/pages/MoneyApprovals";
