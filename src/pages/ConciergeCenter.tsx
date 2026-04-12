import { CenterPageShell, CenterSection } from "@/components/sita/CenterPageShell";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useRelationshipContexts, useHumanObligations } from "@/hooks/useCAIData";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { ConciergeDataProvider } from "@/contexts/ConciergeDataContext";

type SubPage = "overview" | "calendar" | "tasks" | "life-admin" | "household" | "school" | "grocery" | "appointments" | "travel" | "providers" | "events" | "workflows" | "proof" | "files" | "boardroom" | "settings";

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
      { key: "calendar", label: "Calendar" },
      { key: "tasks", label: "Tasks" },
      { key: "life-admin", label: "Life Admin" },
    ],
  },
  {
    label: "Life",
    tabs: [
      { key: "household", label: "Household" },
      { key: "appointments", label: "Appointments" },
      { key: "travel", label: "Travel" },
    ],
  },
  {
    label: "Support",
    tabs: [
      { key: "grocery", label: "Grocery" },
      { key: "school", label: "School" },
      { key: "providers", label: "Providers" },
      { key: "events", label: "Events" },
    ],
  },
  {
    label: "Office",
    tabs: [
      { key: "workflows", label: "Workflows" },
      { key: "proof", label: "Proof" },
      { key: "files", label: "Files" },
      { key: "boardroom", label: "Boardroom" },
      { key: "settings", label: "Settings" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);

const MobileTabSelector = ({
  active,
  onChange,
}: {
  active: SubPage;
  onChange: (key: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const activeLabel = ALL_TABS.find((t) => t.key === active)?.label ?? "Overview";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground touch-manipulation"
      >
        <span>{activeLabel}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
            {TAB_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </div>
                {group.tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { onChange(t.key); setOpen(false); }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors touch-manipulation ${
                      active === t.key
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const pages: Record<SubPage, React.ComponentType> = {
  overview: ConciergeOverview,
  calendar: FamilyCalendar,
  tasks: HouseholdTasks,
  "life-admin": LifeAdminCenter,
  household: HouseholdCommandCenter,
  school: SchoolActivities,
  grocery: GroceryPlanning,
  appointments: AppointmentsPrep,
  travel: TravelPlanning,
  providers: ServiceProviders,
  events: EventsGifts,
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
        <motion.div
          className="overflow-x-auto -mx-2 px-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <SitaTabs
            tabs={[
              { key: "overview", label: "Overview" },
              { key: "calendar", label: "Calendar" },
              { key: "tasks", label: "Tasks" },
              { key: "household", label: "Household" },
              { key: "school", label: "School" },
              { key: "grocery", label: "Grocery" },
              { key: "appointments", label: "Appointments" },
              { key: "travel", label: "Travel" },
              { key: "providers", label: "Providers" },
              { key: "events", label: "Events" },
              { key: "workflows", label: "Workflows" },
              { key: "proof", label: "Proof" },
              { key: "files", label: "Files" },
              { key: "boardroom", label: "Boardroom" },
              { key: "settings", label: "Settings" },
            ]}
            active={activePage}
            onChange={goTo}
          />
        </motion.div>
      </CenterSection>

      <ConciergeDataProvider value={{ relationships: caiRelationships, obligations: caiObligations }}>
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
