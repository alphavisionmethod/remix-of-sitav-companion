import { DomainAppShell } from "@/components/sita/shell/DomainAppShell";
import type { DomainConfig } from "@/components/sita/shell/DomainAppShell";
import type { NavTabGroup } from "@/components/sita/shell/AppSidebarNav";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  Briefcase, LayoutDashboard, Target, Users, Phone, Headphones as SupportIcon,
  Calendar, Settings, TrendingUp, FileText, Receipt, Banknote, ClipboardList,
  Zap, Bot, RefreshCw, Share2, ShoppingCart, Globe, BarChart3, BookOpen,
  LineChart, Mail, FolderOpen, Crown, Shield
} from "lucide-react";

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
import { useAppStatePersistence, restoreAppState } from "@/hooks/useAppStatePersistence";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const DOMAIN_CONFIG: DomainConfig = {
  id: "business",
  title: "Business OS",
  icon: Briefcase,
  accentFrom: "hsl(265 55% 58%)",
  accentTo: "hsl(285 50% 48%)",
  statusLabel: "CRM Synced",
  version: "Business OS v2.0",
};

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

const TAB_GROUPS: NavTabGroup[] = [
  {
    label: "Core",
    tabs: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "leads", label: "Leads", icon: Target, count: 3 },
      { key: "customers", label: "Customers", icon: Users },
      { key: "follow-through", label: "Follow-Through", icon: Phone, count: 8, countSeverity: "warning" },
      { key: "support", label: "Support", icon: SupportIcon, count: 2 },
      { key: "appointments", label: "Appointments", icon: Calendar },
      { key: "operations", label: "Operations", icon: Settings, count: 3 },
      { key: "opportunities", label: "Opportunities", icon: TrendingUp },
    ],
  },
  {
    label: "Sales",
    tabs: [
      { key: "quotes", label: "Quotes", icon: FileText },
      { key: "invoices", label: "Invoices", icon: Receipt, count: 1, countSeverity: "critical" },
      { key: "collections", label: "Collections", icon: Banknote },
      { key: "proposals", label: "Proposals", icon: ClipboardList, count: 2 },
    ],
  },
  {
    label: "Growth",
    tabs: [
      { key: "revenue-autopilot", label: "Revenue Autopilot", icon: Zap },
      { key: "autopilot-hub", label: "Autopilot Hub", icon: Bot },
      { key: "lead-recovery", label: "Lead Recovery", icon: RefreshCw, count: 5, countSeverity: "warning" },
      { key: "social", label: "Social", icon: Share2, count: 4 },
      { key: "ecommerce", label: "E-Commerce", icon: ShoppingCart, count: 2 },
      { key: "website-builder", label: "Website", icon: Globe },
    ],
  },
  {
    label: "Intelligence",
    tabs: [
      { key: "revenue-impact", label: "Revenue Impact", icon: BarChart3 },
      { key: "playbook-builder", label: "Builder", icon: BookOpen },
      { key: "revenue-forecast", label: "Forecast", icon: LineChart },
    ],
  },
  {
    label: "Office",
    tabs: [
      { key: "communications", label: "Comms", icon: Mail },
      { key: "documents", label: "Documents", icon: FolderOpen, count: 10 },
      { key: "boardroom", label: "Boardroom", icon: Crown },
      { key: "proof", label: "Proof", icon: Shield },
    ],
  },
];

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
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);
  const { restoreScroll } = useAppStatePersistence("business", activePage);

  // Restore last sub-page if landing on overview from app switch
  React.useEffect(() => {
    if (location.pathname === "/business") {
      const saved = restoreAppState("business");
      if (saved && saved.activePage !== "overview") {
        navigate(`/business/${saved.activePage}`, { replace: true });
      }
    }
    restoreScroll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (key: string) => {
    if (key === "overview") navigate("/business");
    else navigate(`/business/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <DomainAppShell
      domain={DOMAIN_CONFIG}
      activePage={activePage}
      onNavigate={goTo}
      tabGroups={TAB_GROUPS}
    >
      <h1 className="sr-only">Business Center</h1>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    </DomainAppShell>
  );
};

const BusinessCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <BusinessCenter />
  </GlobalErrorBoundary>
);

export default BusinessCenterWithBoundary;
