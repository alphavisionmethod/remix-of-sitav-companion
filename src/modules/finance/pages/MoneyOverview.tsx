import { useAuth } from "@/contexts/AuthContext";
import { FinanceCreditCard } from "@/modules/finance/components/finance/FinanceCreditCard";
import { FinanceMoneyFlow } from "@/modules/finance/components/finance/FinanceMoneyFlow";
import { FinanceQuickTransfer } from "@/modules/finance/components/finance/FinanceQuickTransfer";
import { FinanceRecentTransactions } from "@/modules/finance/components/finance/FinanceRecentTransactions";
import { FinanceStatCards } from "@/modules/finance/components/finance/FinanceStatCards";
import { useBills, useSubscriptions, useInvoices } from "@/platform/sita/hooks/use-sita-data";
import { useFinancialAccounts, useMoneyKPIs } from "@/modules/business/hooks/use-domain-data";
import { DollarSign, Receipt, CreditCard } from "lucide-react";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useFinanceNavigation } from "@/modules/finance/contexts/FinanceNavigationContext";



const MoneyOverview = () => {
  const { navigateTo } = useFinanceNavigation();
  const { data: bills = [] } = useBills();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: invoices = [] } = useInvoices();
  const { data: accounts = [] } = useFinancialAccounts();
  const { data: kpis } = useMoneyKPIs();

  const hasLiveData = bills.length > 0 || subscriptions.length > 0 || invoices.length > 0 || accounts.length > 0;

  if (!hasLiveData) {
    return (
      <PremiumEmptyState
        variant="first-use"
        icon={DollarSign}
        title="Set up your financial command center"
        description="Add your first bill or subscription to unlock cash flow intelligence."
        actions={[
          { label: "Add a Bill", icon: Receipt, onClick: () => navigateTo("bills") },
          { label: "Track Subscription", icon: CreditCard, onClick: () => navigateTo("subscriptions"), variant: "secondary" as const },
        ]}
        tip="The money advisor detects waste and protects your runway automatically"
        domain="finance"
      />
    );
  }

  return (
    <div className="min-h-full bg-[#0a0a12] p-5 -m-4 rounded-2xl">
      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <FinanceCreditCard />
          <FinanceQuickTransfer />
        </div>

        {/* Center column */}
        <div className="space-y-4">
          <FinanceMoneyFlow />
          <FinanceRecentTransactions />
        </div>

        {/* Right column */}
        <div>
          <FinanceStatCards />
        </div>
      </div>
    </div>
  );
};

export default MoneyOverview;
