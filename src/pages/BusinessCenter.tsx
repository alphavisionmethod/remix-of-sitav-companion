import { CenterPageShell, CenterSection } from "@/components/sita/CenterPageShell";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
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
import WebsiteBuilder from "./business/WebsiteBuilder";
import ProposalsContracts from "./business/ProposalsContracts";
import LeadRecovery from "./business/LeadRecovery";
import SocialCommand from "./business/SocialCommand";
import EcommerceManager from "./business/EcommerceManager";
import FollowThroughCenter from "./business/FollowThroughCenter";
import CustomerSupportCenter from "./business/CustomerSupportCenter";
import AppointmentsScheduling from "./business/AppointmentsScheduling";
import BusinessOperations from "./business/BusinessOperations";
import BusinessDocuments from "./business/BusinessDocuments";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { useOpportunitySignals } from "@/hooks/useCAIData";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTabSelector } from "@/components/sita/MobileTabSelector";

type SubPage = "overview" | "leads" | "customers" | "follow-through" | "support" | "appointments" | "operations" | "documents" | "opportunities" | "quotes" | "invoices" | "communications" | "boardroom" | "proof" | "revenue-autopilot" | "collections" | "autopilot-hub" | "revenue-impact" | "playbook-builder" | "revenue-forecast" | "website-builder" | "proposals" | "lead-recovery" | "social" | "ecommerce";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/documents")) return "documents";
  if (path.includes("/operations")) return "operations";
  if (path.includes("/follow-through")) return "follow-through";
  if (path.includes("/support")) return "support";
  if (path.includes("/appointments")) return "appointments";
  if (path.includes("/website-builder")) return "website-builder";
  if (path.includes("/proposals")) return "proposals";
  if (path.includes("/lead-recovery")) return "lead-recovery";
  if (path.includes("/social")) return "social";
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

const TAB_GROUPS = [
  {
    label: "Core",
    tabs: [
      { key: "overview", label: "Overview" },
      { key: "leads", label: "Leads", count: 3 },
      { key: "customers", label: "Customers" },
      { key: "follow-through", label: "Follow-Through", count: 8 },
      { key: "support", label: "Support", count: 2 },
      { key: "appointments", label: "Appointments" },
      { key: "operations", label: "Operations", count: 3 },
      { key: "opportunities", label: "Opportunities" },
    ],
  },
  {
    label: "Sales",
    tabs: [
      { key: "quotes", label: "Quotes" },
      { key: "invoices", label: "Invoices", count: 1 },
      { key: "collections", label: "Collections" },
      { key: "proposals", label: "Proposals", count: 2 },
    ],
  },
  {
    label: "Growth",
    tabs: [
      { key: "revenue-autopilot", label: "Revenue Autopilot" },
      { key: "autopilot-hub", label: "Autopilot Hub" },
      { key: "lead-recovery", label: "Lead Recovery", count: 5 },
      { key: "social", label: "Social", count: 4 },
      { key: "ecommerce", label: "E-Commerce", count: 2 },
      { key: "website-builder", label: "Website" },
    ],
  },
  {
    label: "Intelligence",
    tabs: [
      { key: "revenue-impact", label: "Revenue Impact" },
      { key: "playbook-builder", label: "Builder" },
      { key: "revenue-forecast", label: "Forecast" },
    ],
  },
  {
    label: "Office",
    tabs: [
      { key: "communications", label: "Comms" },
      { key: "documents", label: "Documents", count: 10 },
      { key: "boardroom", label: "Boardroom" },
      { key: "proof", label: "Proof" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);


const pages: Record<SubPage, React.ComponentType> = {
  overview: BusinessOverview,
  leads: LeadsInbox,
  customers: CustomersPage,
  "follow-through": FollowThroughCenter,
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
  "website-builder": WebsiteBuilder,
  proposals: ProposalsContracts,
  "lead-recovery": LeadRecovery,
  social: SocialCommand,
  ecommerce: EcommerceManager,
  support: CustomerSupportCenter,
  appointments: AppointmentsScheduling,
  operations: BusinessOperations,
  documents: BusinessDocuments,
};

const BusinessCenter = () => {
  const { isDemoMode } = useDataMode();
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);
  const isMobile = useIsMobile();
  const os = useOSOrchestration();
  const signature = useExperienceSignature();
  const { data: caiOpportunities } = useOpportunitySignals({ limit: 15 });

  const goTo = (key: string) => {
    if (key === "overview") navigate("/business");
    else navigate(`/business/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <CenterPageShell domain="business">
      <h1 className="sr-only">Business Center</h1>
      <DemoModeBadge />
      <CenterSection>
        <InAppAdvisorStrip domain="business" />
      </CenterSection>
      <CenterSection>
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

const BusinessCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <BusinessCenter />
  </GlobalErrorBoundary>
);

export default BusinessCenterWithBoundary;
