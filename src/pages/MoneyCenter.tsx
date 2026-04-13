import { DomainAppShell } from "@/components/sita/shell/DomainAppShell";
import type { DomainConfig } from "@/components/sita/shell/DomainAppShell";
import type { NavTabGroup } from "@/components/sita/shell/AppSidebarNav";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { isMoneyOnboardingComplete } from "@/components/sita/money-onboarding";
import { motion, AnimatePresence } from "framer-motion";
import { AppOpenTransition } from "@/components/sita/shell/AppOpenTransition";
import {
  DollarSign, LayoutDashboard, Activity, Receipt, CreditCard, PieChart,
  ArrowLeftRight, CheckCircle, TrendingUp, Scale, PiggyBank, Building,
  Calculator, Clock, ArrowDownLeft, Shuffle, Heart, Shield, AlertTriangle,
  Sparkles, Network, Sliders, Calendar, Lock, Home, FlaskConical,
  Brain, CheckSquare, FolderOpen, Crown, Zap, Settings
} from "lucide-react";

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

const DOMAIN_CONFIG: DomainConfig = {
  id: "finance",
  title: "Finance OS",
  icon: DollarSign,
  accentFrom: "hsl(152 55% 48%)",
  accentTo: "hsl(165 50% 42%)",
  statusLabel: "Finance Synced",
  version: "Finance OS v2.0",
};

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

const TAB_GROUPS: NavTabGroup[] = [
  {
    label: "Core",
    tabs: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "spending-pulse", label: "Spending Pulse", icon: Activity },
      { key: "bills", label: "Bills", icon: Receipt },
      { key: "subscriptions", label: "Subscriptions", icon: CreditCard },
      { key: "budgets", label: "Budgets", icon: PieChart },
      { key: "transactions", label: "Transactions", icon: ArrowLeftRight },
      { key: "reconciliation", label: "Reconciliation", icon: CheckCircle },
    ],
  },
  {
    label: "Wealth",
    tabs: [
      { key: "net-worth", label: "Net Worth", icon: TrendingUp },
      { key: "debt-credit", label: "Debt & Credit", icon: Scale },
      { key: "reserves", label: "Reserves", icon: PiggyBank },
      { key: "investment-office", label: "Investments", icon: Building },
      { key: "tax", label: "Tax", icon: Calculator },
    ],
  },
  {
    label: "Flow",
    tabs: [
      { key: "cash-timing", label: "Cash Timing", icon: Clock },
      { key: "receivables", label: "Receivables", icon: ArrowDownLeft },
      { key: "allocator", label: "Allocator", icon: Shuffle },
    ],
  },
  {
    label: "Insights",
    tabs: [
      { key: "health", label: "Health Pulse", icon: Heart },
      { key: "peace-score", label: "Peace Score", icon: Shield },
      { key: "stress-radar", label: "Stress Radar", icon: AlertTriangle },
      { key: "life-impact", label: "Life Impact", icon: Sparkles },
      { key: "trust-graph", label: "Trust Graph", icon: Network },
      { key: "opportunity-cost", label: "Opportunity Cost", icon: Scale },
    ],
  },
  {
    label: "Lifestyle",
    tabs: [
      { key: "modes", label: "Modes", icon: Sliders },
      { key: "rituals", label: "Rituals", icon: Calendar },
      { key: "boundaries", label: "Boundaries", icon: Lock },
      { key: "household", label: "Household", icon: Home },
      { key: "scenarios", label: "Scenarios", icon: FlaskConical },
    ],
  },
  {
    label: "Office",
    tabs: [
      { key: "advisors", label: "Advisors", icon: Brain },
      { key: "approvals", label: "Approvals", icon: CheckSquare },
      { key: "proof", label: "Proof", icon: Shield },
      { key: "files", label: "Documents", icon: FolderOpen },
      { key: "boardroom", label: "Boardroom", icon: Crown },
      { key: "automations", label: "Automations", icon: Zap },
      { key: "settings", label: "Settings", icon: Settings },
    ],
  },
];

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

const MoneyCenter = () => {
  const { isDemoMode } = useDataMode();
  const location = useLocation();
  const navigate = useNavigate();

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
    <AppOpenTransition>
      <DomainAppShell
        domain={DOMAIN_CONFIG}
        activePage={activePage}
        onNavigate={goTo}
        tabGroups={TAB_GROUPS}
      >
        <h1 className="sr-only">Finance Center</h1>
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
      </DomainAppShell>
    </AppOpenTransition>
  );
};

const MoneyCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <MoneyCenter />
  </GlobalErrorBoundary>
);

export default MoneyCenterWithBoundary;
