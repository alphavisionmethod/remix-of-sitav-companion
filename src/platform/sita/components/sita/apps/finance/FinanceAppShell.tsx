import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity, CreditCard, PieChart, ShieldCheck, Brain, ArrowUpRight, CheckCircle, Clock, AlertTriangle, Zap,
  LayoutDashboard, Receipt, ArrowLeftRight, TrendingUp, Scale, PiggyBank, Building, Calculator,
  ArrowDownLeft, Shuffle, Heart, Shield, Sparkles, Network, Sliders, Calendar, Lock, Home, FlaskConical,
  CheckSquare, FolderOpen, Crown, Settings, DollarSign, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DomainAdvisorBoard } from "@/components/sita/domain-shared/DomainAdvisorBoard";
import { useBoardroomBridge } from "@/hooks/useBoardroomBridge";
import { getAdvisorOutputs } from "@/lib/services/orchestration-pipeline/module-advisor-consumer";
import { FinanceNavigationContext } from "@/contexts/FinanceNavigationContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getFinanceAdaptation } from "@/domains/engines/cross-os-integration";
import { CrossOSLinksPanel } from "@/components/sita/cross-os/CrossOSLinksPanel";
import { CrossDomainIntelligenceBridge } from "@/components/sita/cross-os/CrossDomainIntelligenceBridge";
import { AppShellBreadcrumb, useNavigationHistory } from "@/components/sita/shell/AppShellBreadcrumb";

// ── Page imports ────────────────────────────────────────────
import MoneyOverview from "@/pages/money/MoneyOverview";
import BillsWorkspace from "@/pages/money/BillsWorkspace";
import SubscriptionsWaste from "@/pages/money/SubscriptionsWaste";
import ReservesSavings from "@/pages/money/ReservesSavings";
import CashTiming from "@/pages/money/CashTiming";
import ReceivablesObligations from "@/pages/money/ReceivablesObligations";
import MoneyApprovals from "@/pages/money/MoneyApprovals";
import MoneyBoardroom from "@/pages/money/MoneyBoardroom";
import MoneyProof from "@/pages/money/MoneyProof";
import MoneyDocuments from "@/pages/money/MoneyDocuments";
import MoneySettings from "@/pages/money/MoneySettings";
import InvestmentOffice from "@/pages/money/InvestmentOffice";
import TaxEstimator from "@/pages/money/TaxEstimator";
import NetWorthOffice from "@/pages/money/NetWorthOffice";
import DebtCreditOffice from "@/pages/money/DebtCreditOffice";
import BudgetEnvelopeOffice from "@/pages/money/BudgetEnvelopeOffice";
import TransactionIntelligence from "@/pages/money/TransactionIntelligence";
import HouseholdMoneyOffice from "@/pages/money/HouseholdMoneyOffice";
import FinancialHealthPulse from "@/pages/money/FinancialHealthPulse";
import MoneyAdvisorBoard from "@/pages/money/MoneyAdvisorBoard";
import ScenarioPlanner from "@/pages/money/ScenarioPlanner";
import StressRadar from "@/pages/money/StressRadar";
import LifeMoneyEngine from "@/pages/money/LifeMoneyEngine";
import MoneyModes from "@/pages/money/MoneyModes";
import CashAllocator from "@/pages/money/CashAllocator";
import TrustGraph from "@/pages/money/TrustGraph";
import OpportunityCost from "@/pages/money/OpportunityCost";
import MoneyRituals from "@/pages/money/MoneyRituals";
import PeaceScore from "@/pages/money/PeaceScore";
import FinancialBoundaryMonitor from "@/pages/money/FinancialBoundaryMonitor";
import SpendingPulse from "@/pages/money/SpendingPulse";
import ReconciliationReview from "@/pages/money/ReconciliationReview";
import FinanceAutomations from "@/pages/money/FinanceAutomations";

// ── Pages map ───────────────────────────────────────────────
const pages: Record<string, React.ComponentType> = {
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

// ── Sidebar groups ──────────────────────────────────────────
interface SidebarItem { key: string; label: string; icon: React.ElementType }
interface SidebarGroup { label: string; items: SidebarItem[] }

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "Core",
    items: [
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
    items: [
      { key: "net-worth", label: "Net Worth", icon: TrendingUp },
      { key: "debt-credit", label: "Debt & Credit", icon: Scale },
      { key: "reserves", label: "Reserves", icon: PiggyBank },
      { key: "investment-office", label: "Investments", icon: Building },
      { key: "tax", label: "Tax", icon: Calculator },
    ],
  },
  {
    label: "Flow",
    items: [
      { key: "cash-timing", label: "Cash Timing", icon: Clock },
      { key: "receivables", label: "Receivables", icon: ArrowDownLeft },
      { key: "allocator", label: "Allocator", icon: Shuffle },
    ],
  },
  {
    label: "Insights",
    items: [
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
    items: [
      { key: "modes", label: "Modes", icon: Sliders },
      { key: "rituals", label: "Rituals", icon: Calendar },
      { key: "boundaries", label: "Boundaries", icon: Lock },
      { key: "household", label: "Household", icon: Home },
      { key: "scenarios", label: "Scenarios", icon: FlaskConical },
    ],
  },
  {
    label: "Office",
    items: [
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

// ── Boardroom status strip ──────────────────────────────────
function BoardroomStatusStrip({ pendingCount, decisionCount, synthesisScore }: { pendingCount: number; decisionCount: number; synthesisScore?: number }) {
  if (pendingCount === 0 && decisionCount === 0 && !synthesisScore) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mx-3 mt-2 rounded-lg border border-[hsl(152_55%_48%/0.15)] bg-[hsl(152_55%_48%/0.04)] px-3 py-2 flex items-center gap-3">
      <DollarSign size={12} className="text-[hsl(152_55%_58%)] shrink-0" />
      <div className="flex items-center gap-3 text-[10px]">
        {pendingCount > 0 && <span className="text-[hsl(var(--sita-gold))]">{pendingCount} item{pendingCount > 1 ? "s" : ""} in Boardroom</span>}
        {decisionCount > 0 && <span className="text-[hsl(var(--trust-safe))]">{decisionCount} decision{decisionCount > 1 ? "s" : ""} awaiting action</span>}
        {synthesisScore != null && synthesisScore > 0 && <span className="text-[hsl(152_55%_70%)]">Health: {Math.round(synthesisScore * 100)}%</span>}
      </div>
    </motion.div>
  );
}

// ── Main Shell ──────────────────────────────────────────────
export function FinanceAppShell() {
  const initial = (window as any).__financeInitialModule || "overview";
  const [activeModule, setActiveModule] = useState<string>(initial);
  const { pendingCount, decisionCount, synthesis } = useBoardroomBridge("finance");
  const { primaryMode } = useBusinessProfile();
  const financeAdapt = useMemo(() => getFinanceAdaptation(primaryMode), [primaryMode]);

  // Deep-link listener
  useEffect(() => {
    const handler = (e: Event) => {
      const module = (e as CustomEvent).detail?.module;
      if (module) setActiveModule(module);
    };
    window.addEventListener("sita-finance-navigate", handler);
    return () => window.removeEventListener("sita-finance-navigate", handler);
  }, []);

  const navHistory = useNavigationHistory(initial);
  const navigateTo = useCallback((key: string) => navHistory.navigate(key, setActiveModule), [navHistory]);

  const PageComponent = pages[activeModule];
  const adaptedLabels = useMemo(() => {
    const map: Record<string, string> = {};
    if (financeAdapt.receivablesLabel) map["receivables"] = financeAdapt.receivablesLabel;
    return map;
  }, [financeAdapt]);
  const activeLabel = adaptedLabels[activeModule] || SIDEBAR_GROUPS.flatMap(g => g.items).find(i => i.key === activeModule)?.label || activeModule;

  return (
    <FinanceNavigationContext.Provider value={{ navigateTo, activeModule }}>
      <div className="flex h-full w-full bg-[hsl(220_15%_6%)]">
        {/* ── Sidebar ─────────────────────────────────────── */}
        <div className="w-[210px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_15%_5%)] flex flex-col py-3 overflow-y-auto scrollbar-none">
          {/* App title */}
          <div className="flex items-center gap-2.5 px-4 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[hsl(152_55%_48%/0.12)] flex items-center justify-center">
              <DollarSign size={15} className="text-[hsl(152_55%_58%)]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[hsl(0_0%_90%)] tracking-tight">Finance OS</p>
              <p className="text-[9px] text-[hsl(0_0%_100%/0.3)]">{financeAdapt.budgetStyle === "business" ? "Business Finance" : financeAdapt.budgetStyle === "hybrid" ? "Hybrid Finance" : "Personal Finance"}</p>
            </div>
          </div>

          {/* Groups */}
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.25)] px-4 mb-1">{group.label}</p>
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveModule(item.key)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 outline-none text-left",
                      activeModule === item.key
                        ? "bg-[hsl(152_55%_48%/0.1)] text-[hsl(152_55%_65%)] shadow-[inset_3px_0_0_hsl(152_55%_48%)]"
                        : "text-[hsl(0_0%_100%/0.5)] hover:bg-[hsl(0_0%_100%/0.04)] hover:text-[hsl(0_0%_100%/0.8)]"
                    )}
                  >
                    <item.icon size={14} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.key === "boardroom" && pendingCount > 0 && (
                      <span className="ml-auto w-4 h-4 rounded-full bg-[hsl(152_55%_48%)] text-white text-[8px] font-bold flex items-center justify-center shrink-0">{pendingCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Cross-OS Links */}
          <div className="mt-auto px-3 pt-3 pb-2 space-y-2">
            <CrossDomainIntelligenceBridge currentApp="finance" compact />
            <CrossOSLinksPanel sourceApp="finance" primaryMode={primaryMode} compact maxLinks={4} />
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <div className="h-11 shrink-0 border-b border-[hsl(0_0%_100%/0.06)] flex items-center px-5 bg-[hsl(220_15%_6%/0.8)]">
            <AppShellBreadcrumb
              appName="Finance OS"
              appColor="hsl(152 55% 48%)"
              current={{ id: activeModule, label: activeLabel }}
              history={navHistory.history}
              historyIndex={navHistory.historyIndex}
              onNavigate={navigateTo}
              onBack={() => navHistory.goBack(setActiveModule)}
              onForward={() => navHistory.goForward(setActiveModule)}
            />
          </div>

          <BoardroomStatusStrip pendingCount={pendingCount} decisionCount={decisionCount} synthesisScore={synthesis?.boardroom_worthiness_score} />

          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {PageComponent ? <PageComponent /> : (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <p className="text-[hsl(0_0%_100%/0.2)] uppercase tracking-[0.2em] text-lg font-medium">{activeModule.toUpperCase()}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FinanceNavigationContext.Provider>
  );
}
