import { CenterPageShell, CenterSection } from "@/components/sita/CenterPageShell";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { isMoneyOnboardingComplete } from "@/components/sita/money-onboarding";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTabSelector } from "@/components/sita/MobileTabSelector";

import MoneyOverview from "./money/MoneyOverview";
import BillsWorkspace from "./money/BillsWorkspace";
import SubscriptionsWaste from "./money/SubscriptionsWaste";
import ReservesSavings from "./money/ReservesSavings";
import CashTiming from "./money/CashTiming";
import ReceivablesObligations from "./money/ReceivablesObligations";
import MoneyApprovals from "./money/MoneyApprovals";
import MoneyBoardroom from "./money/MoneyBoardroom";
import MoneyProof from "./money/MoneyProof";
import MoneyDocuments from "./money/MoneyDocuments";
import MoneySettings from "./money/MoneySettings";
import InvestmentOffice from "./money/InvestmentOffice";
import TaxEstimator from "./money/TaxEstimator";
import NetWorthOffice from "./money/NetWorthOffice";
import DebtCreditOffice from "./money/DebtCreditOffice";
import BudgetEnvelopeOffice from "./money/BudgetEnvelopeOffice";
import TransactionIntelligence from "./money/TransactionIntelligence";
import HouseholdMoneyOffice from "./money/HouseholdMoneyOffice";
import FinancialHealthPulse from "./money/FinancialHealthPulse";
import MoneyAdvisorBoard from "./money/MoneyAdvisorBoard";
import ScenarioPlanner from "./money/ScenarioPlanner";
import StressRadar from "./money/StressRadar";
import LifeMoneyEngine from "./money/LifeMoneyEngine";
import MoneyModes from "./money/MoneyModes";
import CashAllocator from "./money/CashAllocator";
import TrustGraph from "./money/TrustGraph";
import OpportunityCost from "./money/OpportunityCost";
import MoneyRituals from "./money/MoneyRituals";
import PeaceScore from "./money/PeaceScore";
import FinancialBoundaryMonitor from "./money/FinancialBoundaryMonitor";
import SpendingPulse from "./money/SpendingPulse";
import ReconciliationReview from "./money/ReconciliationReview";
import FinanceAutomations from "./money/FinanceAutomations";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";


type SubPage = "overview" | "spending-pulse" | "bills" | "subscriptions" | "reserves" | "cash-timing" | "receivables" | "investment-office" | "tax" | "approvals" | "boardroom" | "proof" | "files" | "settings" | "net-worth" | "debt-credit" | "budgets" | "transactions" | "household" | "health" | "advisors" | "scenarios" | "stress-radar" | "life-impact" | "modes" | "allocator" | "trust-graph" | "opportunity-cost" | "rituals" | "peace-score" | "boundaries" | "reconciliation" | "automations";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/spending-pulse")) return "spending-pulse";
  if (path.includes("/reconciliation")) return "reconciliation";
  if (path.includes("/automations")) return "automations";
  if (path.includes("/boundaries")) return "boundaries";
  if (path.includes("/stress-radar")) return "stress-radar";
  if (path.includes("/life-impact")) return "life-impact";
  if (path.includes("/modes")) return "modes";
  if (path.includes("/allocator")) return "allocator";
  if (path.includes("/trust-graph")) return "trust-graph";
  if (path.includes("/opportunity-cost")) return "opportunity-cost";
  if (path.includes("/rituals")) return "rituals";
  if (path.includes("/peace-score")) return "peace-score";
  if (path.includes("/net-worth")) return "net-worth";
  if (path.includes("/debt-credit")) return "debt-credit";
  if (path.includes("/budgets")) return "budgets";
  if (path.includes("/transactions")) return "transactions";
  if (path.includes("/household")) return "household";
  if (path.includes("/health")) return "health";
  if (path.includes("/advisors")) return "advisors";
  if (path.includes("/scenarios")) return "scenarios";
  if (path.includes("/tax")) return "tax";
  if (path.includes("/investment-office")) return "investment-office";
  if (path.includes("/bills")) return "bills";
  if (path.includes("/subscriptions")) return "subscriptions";
  if (path.includes("/reserves")) return "reserves";
  if (path.includes("/cash-timing")) return "cash-timing";
  if (path.includes("/receivables")) return "receivables";
  if (path.includes("/approvals")) return "approvals";
  if (path.includes("/proof")) return "proof";
  if (path.includes("/files")) return "files";
  if (path.includes("/settings")) return "settings";
  if (path.includes("/boardroom")) return "boardroom";
  return "overview";
};

const pages: Record<SubPage, React.ComponentType> = {
  overview: MoneyOverview,
  "spending-pulse": SpendingPulse,
  bills: BillsWorkspace,
  subscriptions: SubscriptionsWaste,
  reserves: ReservesSavings,
  "cash-timing": CashTiming,
  receivables: ReceivablesObligations,
  "investment-office": InvestmentOffice,
  tax: TaxEstimator,
  approvals: MoneyApprovals,
  proof: MoneyProof,
  files: MoneyDocuments,
  settings: MoneySettings,
  boardroom: MoneyBoardroom,
  "net-worth": NetWorthOffice,
  "debt-credit": DebtCreditOffice,
  budgets: BudgetEnvelopeOffice,
  transactions: TransactionIntelligence,
  household: HouseholdMoneyOffice,
  health: FinancialHealthPulse,
  advisors: MoneyAdvisorBoard,
  scenarios: ScenarioPlanner,
  "stress-radar": StressRadar,
  "life-impact": LifeMoneyEngine,
  modes: MoneyModes,
  allocator: CashAllocator,
  "trust-graph": TrustGraph,
  "opportunity-cost": OpportunityCost,
  rituals: MoneyRituals,
  "peace-score": PeaceScore,
  boundaries: FinancialBoundaryMonitor,
  reconciliation: ReconciliationReview,
  automations: FinanceAutomations,
};

const TAB_GROUPS = [
  {
    label: "Core",
    tabs: [
      { key: "overview", label: "Overview" },
      { key: "spending-pulse", label: "Spending Pulse" },
      { key: "bills", label: "Bills" },
      { key: "subscriptions", label: "Subscriptions" },
      { key: "budgets", label: "Budgets" },
      { key: "transactions", label: "Transactions" },
      { key: "reconciliation", label: "Reconciliation" },
    ],
  },
  {
    label: "Wealth",
    tabs: [
      { key: "net-worth", label: "Net Worth" },
      { key: "debt-credit", label: "Debt & Credit" },
      { key: "reserves", label: "Reserves" },
      { key: "investment-office", label: "Investments" },
      { key: "tax", label: "Tax" },
    ],
  },
  {
    label: "Flow",
    tabs: [
      { key: "cash-timing", label: "Cash Timing" },
      { key: "receivables", label: "Receivables" },
      { key: "allocator", label: "Allocator" },
    ],
  },
  {
    label: "Insights",
    tabs: [
      { key: "health", label: "Health Pulse" },
      { key: "peace-score", label: "Peace Score" },
      { key: "stress-radar", label: "Stress Radar" },
      { key: "life-impact", label: "Life Impact" },
      { key: "trust-graph", label: "Trust Graph" },
      { key: "opportunity-cost", label: "Opportunity Cost" },
    ],
  },
  {
    label: "Lifestyle",
    tabs: [
      { key: "modes", label: "Modes" },
      { key: "rituals", label: "Rituals" },
      { key: "boundaries", label: "Boundaries" },
      { key: "household", label: "Household" },
      { key: "scenarios", label: "Scenarios" },
    ],
  },
  {
    label: "Office",
    tabs: [
      { key: "advisors", label: "Advisors" },
      { key: "approvals", label: "Approvals" },
      { key: "proof", label: "Proof" },
      { key: "files", label: "Documents" },
      { key: "boardroom", label: "Boardroom" },
      { key: "automations", label: "Automations" },
      { key: "settings", label: "Settings" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);


const MoneyCenter = () => {
  const { isDemoMode } = useDataMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isDemoMode && !isMoneyOnboardingComplete()) {
    return <Navigate to="/money/onboarding" replace />;
  }

  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "overview") navigate("/money");
    else navigate(`/money/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <CenterPageShell domain="finance">
      <h1 className="sr-only">Money Center</h1>
      <DemoModeBadge />
      <CenterSection>
        <InAppAdvisorStrip domain="finance" />
      </CenterSection>

      <CenterSection>
        {/* Tab Navigation — mobile dropdown, desktop scrollable tabs */}
        {isMobile ? (
          <MobileTabSelector active={activePage} onChange={goTo} tabGroups={TAB_GROUPS} />
        ) : (
          <motion.div
            className="overflow-x-auto -mx-2 px-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SitaTabs tabs={ALL_TABS} active={activePage} onChange={goTo} />
          </motion.div>
        )}
      </CenterSection>

      <CenterSection>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </CenterSection>
    </CenterPageShell>
  );
};

const MoneyCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <MoneyCenter />
  </GlobalErrorBoundary>
);

export default MoneyCenterWithBoundary;
