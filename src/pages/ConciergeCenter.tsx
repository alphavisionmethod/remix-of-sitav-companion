import { CenterPageShell, CenterSection } from "@/components/sita/CenterPageShell";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { MobileTabSelector } from "@/components/sita/MobileTabSelector";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useRelationshipContexts, useHumanObligations } from "@/hooks/useCAIData";
import { useIsMobile } from "@/hooks/use-mobile";

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
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { ConciergeDataProvider } from "@/contexts/ConciergeDataContext";

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

const TAB_GROUPS = [
  {
    label: "Home",
    tabs: [
      { key: "overview", label: "Overview" },
      { key: "upcoming", label: "Upcoming" },
      { key: "calendar", label: "Calendar" },
    ],
  },
  {
    label: "Life",
    tabs: [
      { key: "life-admin", label: "Life Admin" },
      { key: "errands", label: "Errands" },
      { key: "appointments", label: "Appointments" },
      { key: "travel", label: "Travel" },
    ],
  },
  {
    label: "Support",
    tabs: [
      { key: "household", label: "Household" },
      { key: "tasks", label: "Tasks" },
      { key: "grocery", label: "Grocery" },
      { key: "school", label: "School" },
      { key: "providers", label: "Providers" },
      { key: "events", label: "Events" },
      { key: "recurring", label: "Recurring" },
    ],
  },
  {
    label: "Office",
    tabs: [
      { key: "workflows", label: "Automations" },
      { key: "proof", label: "Proof" },
      { key: "files", label: "Files" },
      { key: "boardroom", label: "Boardroom" },
      { key: "settings", label: "Settings" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);

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
  const { isDemoMode } = useDataMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const signature = useExperienceSignature();
  const os = useOSOrchestration();
  const activePage = subpageFromPath(location.pathname);

  // Wire CAI relationship + obligation data for real persistence
  const { data: caiRelationships } = useRelationshipContexts({ limit: 20 });
  const { data: caiObligations } = useHumanObligations({ limit: 20 });

  const goTo = (key: string) => {
    if (key === "overview") navigate("/concierge");
    else navigate(`/concierge/${key}`);
  };

  const PageComponent = pages[activePage];

  return (
    <CenterPageShell domain="concierge">
      <h1 className="sr-only">Concierge Center</h1>
      <DemoModeBadge />
      <CenterSection>
        <InAppAdvisorStrip domain="concierge" />
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

      <ConciergeDataProvider value={{ relationships: caiRelationships, obligations: caiObligations }}>
        <CenterSection>
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
        </CenterSection>
      </ConciergeDataProvider>
    </CenterPageShell>
  );
};

const ConciergeCenterWithBoundary = () => (
  <GlobalErrorBoundary>
    <ConciergeCenter />
  </GlobalErrorBoundary>
);

export default ConciergeCenterWithBoundary;
