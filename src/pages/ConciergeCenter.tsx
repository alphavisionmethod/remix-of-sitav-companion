import { DomainAppShell } from "@/components/sita/shell/DomainAppShell";
import type { DomainConfig } from "@/components/sita/shell/DomainAppShell";
import type { NavTabGroup } from "@/components/sita/shell/AppSidebarNav";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useRelationshipContexts, useHumanObligations } from "@/hooks/useCAIData";
import { AppOpenTransition } from "@/components/sita/shell/AppOpenTransition";
import {
  Headphones, LayoutDashboard, Clock, Calendar, FileText, ShoppingCart,
  Stethoscope, Plane, Home, CheckSquare, Apple, GraduationCap, Wrench,
  Gift, RefreshCw, Zap, Shield, FolderOpen, Crown, Settings
} from "lucide-react";

import ConciergeOverview from "./concierge/ConciergeOverview";
import HouseholdTasks from "./concierge/HouseholdTasks";
import FamilyCalendar from "./concierge/MonthGridCalendar";
import SchoolActivities from "./concierge/SchoolActivities";
import GroceryPlanning from "./concierge/GroceryPlanning";
import AppointmentsPrep from "./concierge/AppointmentsPrep";
import TravelPlanning from "./concierge/TravelPlanning";
import ServiceProviders from "./concierge/ServiceProviders";
import EventsGifts from "./concierge/EventsGifts";
import ConciergeWorkflows from "./concierge/ConciergeWorkflows";
import ConciergeProof from "./concierge/ConciergeProof";
import ConciergeFiles from "./concierge/ConciergeFiles";
import FamilyBoardroom from "./concierge/FamilyBoardroom";
import ConciergeSettings from "./concierge/ConciergeSettings";
import HouseholdCommandCenter from "./concierge/HouseholdCommandCenter";
import LifeAdminCenter from "./concierge/LifeAdminCenter";
import ErrandsLogistics from "./concierge/ErrandsLogistics";
import UpcomingNeeds from "./concierge/UpcomingNeeds";
import RecurringObligations from "./concierge/RecurringObligations";
import { ConciergeDataProvider } from "@/contexts/ConciergeDataContext";
import { useAppStatePersistence, restoreAppState } from "@/hooks/useAppStatePersistence";
import React from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const DOMAIN_CONFIG: DomainConfig = {
  id: "concierge",
  title: "Concierge",
  icon: Headphones,
  accentFrom: "hsl(285 55% 55%)",
  accentTo: "hsl(310 50% 48%)",
  statusLabel: "Concierge Active",
  version: "Concierge v2.0",
};

type SubPage = "overview" | "calendar" | "tasks" | "life-admin" | "household" | "school" | "grocery" | "appointments" | "travel" | "providers" | "events" | "workflows" | "proof" | "files" | "boardroom" | "settings" | "errands" | "upcoming" | "recurring";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/life-admin")) return "life-admin";
  if (path.includes("/calendar")) return "calendar";
  if (path.includes("/tasks")) return "tasks";
  if (path.includes("/household")) return "household";
  if (path.includes("/school")) return "school";
  if (path.includes("/grocery")) return "grocery";
  if (path.includes("/appointments")) return "appointments";
  if (path.includes("/travel")) return "travel";
  if (path.includes("/providers")) return "providers";
  if (path.includes("/events")) return "events";
  if (path.includes("/errands")) return "errands";
  if (path.includes("/upcoming")) return "upcoming";
  if (path.includes("/recurring")) return "recurring";
  if (path.includes("/workflows")) return "workflows";
  if (path.includes("/proof")) return "proof";
  if (path.includes("/files")) return "files";
  if (path.includes("/boardroom")) return "boardroom";
  if (path.includes("/settings")) return "settings";
  return "overview";
};

const TAB_GROUPS: NavTabGroup[] = [
  {
    label: "Home",
    tabs: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "upcoming", label: "Upcoming", icon: Clock },
      { key: "calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "Life",
    tabs: [
      { key: "life-admin", label: "Life Admin", icon: FileText },
      { key: "errands", label: "Errands", icon: ShoppingCart },
      { key: "appointments", label: "Appointments", icon: Stethoscope },
      { key: "travel", label: "Travel", icon: Plane },
    ],
  },
  {
    label: "Support",
    tabs: [
      { key: "household", label: "Household", icon: Home },
      { key: "tasks", label: "Tasks", icon: CheckSquare },
      { key: "grocery", label: "Grocery", icon: Apple },
      { key: "school", label: "School", icon: GraduationCap },
      { key: "providers", label: "Providers", icon: Wrench },
      { key: "events", label: "Events", icon: Gift },
      { key: "recurring", label: "Recurring", icon: RefreshCw },
    ],
  },
  {
    label: "Office",
    tabs: [
      { key: "workflows", label: "Automations", icon: Zap },
      { key: "proof", label: "Proof", icon: Shield },
      { key: "files", label: "Files", icon: FolderOpen },
      { key: "boardroom", label: "Boardroom", icon: Crown },
      { key: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const pages: Record<SubPage, React.ComponentType> = {
  overview: ConciergeOverview,
  upcoming: UpcomingNeeds,
  calendar: FamilyCalendar,
  tasks: HouseholdTasks,
  "life-admin": LifeAdminCenter,
  errands: ErrandsLogistics,
  household: HouseholdCommandCenter,
  school: SchoolActivities,
  grocery: GroceryPlanning,
  appointments: AppointmentsPrep,
  travel: TravelPlanning,
  providers: ServiceProviders,
  events: EventsGifts,
  recurring: RecurringObligations,
  workflows: ConciergeWorkflows,
  proof: ConciergeProof,
  files: ConciergeFiles,
  boardroom: FamilyBoardroom,
  settings: ConciergeSettings,
};

const ConciergeCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const signature = useExperienceSignature();
  const os = useOSOrchestration();
  const activePage = subpageFromPath(location.pathname);
  const { restoreScroll } = useAppStatePersistence("concierge", activePage);

  React.useEffect(() => {
    if (location.pathname === "/concierge") {
      const saved = restoreAppState("concierge");
      if (saved && saved.activePage !== "overview") {
        navigate(`/concierge/${saved.activePage}`, { replace: true });
      }
    }
    restoreScroll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: caiRelationships } = useRelationshipContexts({ limit: 20 });
  const { data: caiObligations } = useHumanObligations({ limit: 20 });

  const goTo = (key: string) => {
    if (key === "overview") navigate("/concierge");
    else navigate(`/concierge/${key}`);
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
        <h1 className="sr-only">Concierge Center</h1>
        <ConciergeDataProvider value={{ relationships: caiRelationships, obligations: caiObligations }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </ConciergeDataProvider>
      </DomainAppShell>
    </AppOpenTransition>
  );
};

const ConciergeCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <ConciergeCenter />
  </GlobalErrorBoundary>
);

export default ConciergeCenterWithBoundary;
