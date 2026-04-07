import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

type SubPage = "overview" | "bills" | "subscriptions" | "reserves" | "cash-timing" | "receivables" | "investment-office" | "approvals" | "boardroom" | "proof" | "files" | "settings";

const subpageFromPath = (path: string): SubPage => {
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
  bills: BillsWorkspace,
  subscriptions: SubscriptionsWaste,
  reserves: ReservesSavings,
  "cash-timing": CashTiming,
  receivables: ReceivablesObligations,
  "investment-office": InvestmentOffice,
  approvals: MoneyApprovals,
  proof: MoneyProof,
  files: MoneyDocuments,
  settings: MoneySettings,
  boardroom: MoneyBoardroom,
};

const MoneyCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "overview") navigate("/money");
    else navigate(`/money/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DemoModeBadge />
      <motion.div
        className="overflow-x-auto -mx-2 px-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <SitaTabs
          tabs={[
            { key: "overview", label: "Overview" },
            { key: "bills", label: "Bills" },
            { key: "subscriptions", label: "Subscriptions" },
            { key: "reserves", label: "Reserves" },
            { key: "cash-timing", label: "Cash Timing" },
            { key: "receivables", label: "Receivables" },
            { key: "investment-office", label: "Investment Office" },
            { key: "approvals", label: "Approvals" },
            { key: "proof", label: "Proof" },
            { key: "files", label: "Documents" },
            { key: "boardroom", label: "Boardroom" },
            { key: "settings", label: "Settings" },
          ]}
          active={activePage}
          onChange={goTo}
        />
      </motion.div>

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
    </div>
  );
};

const MoneyCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <MoneyCenter />
  </GlobalErrorBoundary>
);

export default MoneyCenterWithBoundary;
