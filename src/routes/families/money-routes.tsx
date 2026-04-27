import { Route } from "react-router-dom";
import { lazy } from "react";

const MoneyCenter = lazy(() => import("@/pages/MoneyCenter"));
const MoneyOnboarding = lazy(() => import("@/pages/MoneyOnboarding"));

export function getMoneyRoutes() {
  return (
    <>
      <Route path="/money/onboarding" element={<MoneyOnboarding />} />
      <Route path="/money" element={<MoneyCenter />} />
      <Route path="/money/overview" element={<MoneyCenter />} />
      <Route path="/money/bills" element={<MoneyCenter />} />
      <Route path="/money/subscriptions" element={<MoneyCenter />} />
      <Route path="/money/reserves" element={<MoneyCenter />} />
      <Route path="/money/cash-timing" element={<MoneyCenter />} />
      <Route path="/money/receivables" element={<MoneyCenter />} />
      <Route path="/money/investment-office" element={<MoneyCenter />} />
      <Route path="/money/tax" element={<MoneyCenter />} />
      <Route path="/money/approvals" element={<MoneyCenter />} />
      <Route path="/money/proof" element={<MoneyCenter />} />
      <Route path="/money/files" element={<MoneyCenter />} />
      <Route path="/money/boardroom" element={<MoneyCenter />} />
      <Route path="/money/settings" element={<MoneyCenter />} />
      <Route path="/money/net-worth" element={<MoneyCenter />} />
      <Route path="/money/debt-credit" element={<MoneyCenter />} />
      <Route path="/money/budgets" element={<MoneyCenter />} />
      <Route path="/money/transactions" element={<MoneyCenter />} />
      <Route path="/money/household" element={<MoneyCenter />} />
      <Route path="/money/health" element={<MoneyCenter />} />
      <Route path="/money/advisors" element={<MoneyCenter />} />
      <Route path="/money/scenarios" element={<MoneyCenter />} />
      <Route path="/money/stress-radar" element={<MoneyCenter />} />
      <Route path="/money/life-impact" element={<MoneyCenter />} />
      <Route path="/money/modes" element={<MoneyCenter />} />
      <Route path="/money/allocator" element={<MoneyCenter />} />
      <Route path="/money/trust-graph" element={<MoneyCenter />} />
      <Route path="/money/opportunity-cost" element={<MoneyCenter />} />
      <Route path="/money/rituals" element={<MoneyCenter />} />
      <Route path="/money/peace-score" element={<MoneyCenter />} />
      <Route path="/money/boundaries" element={<MoneyCenter />} />
      <Route path="/money/spending-pulse" element={<MoneyCenter />} />
      <Route path="/money/reconciliation" element={<MoneyCenter />} />
      <Route path="/money/automations" element={<MoneyCenter />} />
    </>
  );
}
