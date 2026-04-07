import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import BusinessOverview from "./business/BusinessOverview";
import LeadsInbox from "./business/LeadsInbox";
import OpportunitiesCenter from "./business/OpportunitiesCenter";
import QuotesWorkspace from "./business/QuotesWorkspace";
import InvoicesCollections from "./business/InvoicesCollections";
import CommunicationsCenter from "./business/CommunicationsCenter";
import BusinessBoardroom from "./business/BusinessBoardroom";
import BusinessProof from "./business/BusinessProof";
import CustomersPage from "./business/CustomersPage";
import RevenueAutopilot from "./business/RevenueAutopilot";
import AutopilotHub from "./business/AutopilotHub";
import CollectionsCommandCenter from "./business/CollectionsCommandCenter";
import RevenueImpactDashboard from "./business/RevenueImpactDashboard";
import PlaybookBuilder from "./business/PlaybookBuilder";
import RevenueForecast from "./business/RevenueForecast";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

type SubPage = "overview" | "leads" | "customers" | "opportunities" | "quotes" | "invoices" | "communications" | "boardroom" | "proof" | "revenue-autopilot" | "collections" | "autopilot-hub" | "revenue-impact" | "playbook-builder" | "revenue-forecast";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/revenue-forecast")) return "revenue-forecast";
  if (path.includes("/playbook-builder")) return "playbook-builder";
  if (path.includes("/revenue-impact")) return "revenue-impact";
  if (path.includes("/autopilot-hub")) return "autopilot-hub";
  if (path.includes("/collections")) return "collections";
  if (path.includes("/revenue-autopilot")) return "revenue-autopilot";
  if (path.includes("/leads")) return "leads";
  if (path.includes("/customers")) return "customers";
  if (path.includes("/opportunities")) return "opportunities";
  if (path.includes("/quotes")) return "quotes";
  if (path.includes("/invoices")) return "invoices";
  if (path.includes("/communications")) return "communications";
  if (path.includes("/boardroom")) return "boardroom";
  if (path.includes("/proof")) return "proof";
  return "overview";
};

const pages: Record<SubPage, React.ComponentType> = {
  overview: BusinessOverview,
  leads: LeadsInbox,
  customers: CustomersPage,
  opportunities: OpportunitiesCenter,
  quotes: QuotesWorkspace,
  invoices: InvoicesCollections,
  collections: CollectionsCommandCenter,
  communications: CommunicationsCenter,
  "revenue-autopilot": RevenueAutopilot,
  boardroom: BusinessBoardroom,
  proof: BusinessProof,
  "autopilot-hub": AutopilotHub,
  "revenue-impact": RevenueImpactDashboard,
  "playbook-builder": PlaybookBuilder,
  "revenue-forecast": RevenueForecast,
};

const BusinessCenter = () => {
  const { isDemoMode } = useDataMode();
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "overview") navigate("/business");
    else navigate(`/business/${key}`);
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
            { key: "leads", label: "Leads" },
            { key: "customers", label: "Customers" },
            { key: "opportunities", label: "Opportunities" },
            { key: "quotes", label: "Quotes" },
            { key: "invoices", label: "Invoices" },
            { key: "collections", label: "Collections" },
            { key: "revenue-autopilot", label: "Revenue Autopilot" },
            { key: "autopilot-hub", label: "⚡ Autopilot Hub" },
            { key: "revenue-impact", label: "📊 Revenue Impact" },
            { key: "playbook-builder", label: "🔧 Builder" },
            { key: "revenue-forecast", label: "🔮 Forecast" },
            { key: "communications", label: "Comms" },
            { key: "boardroom", label: "Boardroom" },
            { key: "proof", label: "Proof" },
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

const BusinessCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <BusinessCenter />
  </GlobalErrorBoundary>
);

export default BusinessCenterWithBoundary;
