// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge App Shell (Full 19-page windowed app)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import {
  CalendarHeart, CheckSquare, MapPin, LayoutDashboard, Brain,
  ArrowUpRight, CheckCircle, Clock, AlertTriangle, Activity, Zap,
  FileText, ShoppingCart, Stethoscope, Plane, Home, Apple,
  GraduationCap, Wrench, Gift, RefreshCw, Shield, FolderOpen,
  Crown, Settings, ChevronDown, Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DomainAdvisorBoard } from "@/platform/sita/components/sita/domain-shared/DomainAdvisorBoard";
import { useBoardroomBridge } from "@/platform/boardroom/hooks/useBoardroomBridge";
import { getAdvisorOutputs } from "@/lib/services/orchestration-pipeline/module-advisor-consumer";
import { useRelationshipContexts, useHumanObligations } from "@/hooks/useCAIData";
import { ConciergeDataProvider } from "@/modules/concierge/contexts/ConciergeDataContext";
import { ConciergeNavigationContext } from "@/modules/concierge/contexts/ConciergeNavigationContext";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getConciergeAdaptation } from "@/domains/engines/cross-os-integration";
import { CrossOSLinksPanel } from "@/platform/sita/components/sita/cross-os/CrossOSLinksPanel";
import { CrossDomainIntelligenceBridge } from "@/platform/sita/components/sita/cross-os/CrossDomainIntelligenceBridge";
import { AppShellBreadcrumb, useNavigationHistory } from "@/platform/sita/components/sita/shell/AppShellBreadcrumb";
import { useDataMode } from "@/contexts/DataModeContext";

// Lazy-load all 19 page components
const ConciergeOverview = lazy(() => import("@/pages/concierge/ConciergeOverview"));
const UpcomingNeeds = lazy(() => import("@/pages/concierge/UpcomingNeeds"));
const FamilyCalendar = lazy(() => import("@/pages/concierge/MonthGridCalendar"));
const HouseholdTasks = lazy(() => import("@/pages/concierge/HouseholdTasks"));
const LifeAdminWorkspace = lazy(() => import("@/pages/concierge/LifeAdminWorkspace"));
const ErrandsLogistics = lazy(() => import("@/pages/concierge/ErrandsLogistics"));
const AppointmentsPrep = lazy(() => import("@/pages/concierge/AppointmentsPrep"));
const TravelPlanning = lazy(() => import("@/pages/concierge/TravelPlanning"));
const HouseholdWorkspace = lazy(() => import("@/pages/concierge/HouseholdWorkspace"));
const SchoolActivities = lazy(() => import("@/pages/concierge/SchoolActivities"));
const GroceryPlanning = lazy(() => import("@/pages/concierge/GroceryPlanning"));
const ServiceProviders = lazy(() => import("@/pages/concierge/ServiceProviders"));
const EventsGifts = lazy(() => import("@/pages/concierge/EventsGifts"));
const RecurringObligations = lazy(() => import("@/pages/concierge/RecurringObligations"));
const ConciergeWorkflows = lazy(() => import("@/pages/concierge/ConciergeWorkflows"));
const ConciergeProof = lazy(() => import("@/pages/concierge/ConciergeProof"));
const ConciergeFiles = lazy(() => import("@/pages/concierge/ConciergeFiles"));
const FamilyBoardroom = lazy(() => import("@/pages/concierge/FamilyBoardroom"));
const ConciergeSettings = lazy(() => import("@/pages/concierge/ConciergeSettings"));

// ── Types ──
type ModuleId =
  | "overview" | "upcoming" | "calendar"
  | "life-admin" | "errands" | "appointments" | "travel"
  | "household" | "tasks" | "grocery" | "school" | "providers" | "events" | "recurring"
  | "workflows" | "proof" | "files" | "boardroom" | "settings"
  | "advisors" | "pipeline";

interface SidebarItem { id: ModuleId; label: string; icon: React.ElementType }
interface SidebarGroup { label: string; items: SidebarItem[] }

// ── Sidebar Groups ──
const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "Home",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "upcoming", label: "Upcoming", icon: Clock },
      { id: "calendar", label: "Calendar", icon: CalendarHeart },
    ],
  },
  {
    label: "Life",
    items: [
      { id: "life-admin", label: "Life Admin", icon: FileText },
      { id: "errands", label: "Errands", icon: ShoppingCart },
      { id: "appointments", label: "Appointments", icon: Stethoscope },
      { id: "travel", label: "Travel", icon: Plane },
    ],
  },
  {
    label: "Support",
    items: [
      { id: "household", label: "Household", icon: Home },
      { id: "tasks", label: "Tasks", icon: CheckSquare },
      { id: "grocery", label: "Grocery", icon: Apple },
      { id: "school", label: "School", icon: GraduationCap },
      { id: "providers", label: "Providers", icon: Wrench },
      { id: "events", label: "Events & Gifts", icon: Gift },
      { id: "recurring", label: "Recurring", icon: RefreshCw },
    ],
  },
  {
    label: "Office",
    items: [
      { id: "workflows", label: "Automations", icon: Zap },
      { id: "proof", label: "Proof", icon: Shield },
      { id: "files", label: "Files", icon: FolderOpen },
      { id: "boardroom", label: "Boardroom", icon: Crown },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "advisors", label: "Advisors", icon: Brain },
      { id: "pipeline", label: "Pipeline Health", icon: Activity },
    ],
  },
];

// ── Page Registry ──
const PAGE_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  overview: ConciergeOverview,
  upcoming: UpcomingNeeds,
  calendar: FamilyCalendar,
  tasks: HouseholdTasks,
  "life-admin": LifeAdminWorkspace,
  errands: ErrandsLogistics,
  household: HouseholdWorkspace,
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

// ── All module labels for header ──
const MODULE_LABELS: Record<string, string> = {};
SIDEBAR_GROUPS.forEach(g => g.items.forEach(i => { MODULE_LABELS[i.id] = i.label; }));

// ── Severity Colors ──
const severityColors: Record<string, string> = {
  high: "text-[hsl(var(--destructive))]",
  medium: "text-[hsl(var(--sita-gold))]",
  low: "text-[hsl(var(--trust-safe))]",
  critical: "text-[hsl(var(--destructive))]",
};

// ── Boardroom Status Strip ──
function BoardroomStatusStrip({ pendingCount, decisionCount, synthesisScore }: { pendingCount: number; decisionCount: number; synthesisScore?: number }) {
  if (pendingCount === 0 && decisionCount === 0 && !synthesisScore) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mx-2 mt-2 rounded-lg border border-[hsl(270_60%_55%/0.15)] bg-[hsl(270_50%_50%/0.04)] px-3 py-2 flex items-center gap-3">
      <Brain size={12} className="text-[hsl(270_60%_65%)] shrink-0" />
      <div className="flex items-center gap-3 text-[10px]">
        {pendingCount > 0 && <span className="text-[hsl(var(--sita-gold))]">{pendingCount} item{pendingCount > 1 ? "s" : ""} in Boardroom</span>}
        {decisionCount > 0 && <span className="text-[hsl(var(--trust-safe))]">{decisionCount} decision{decisionCount > 1 ? "s" : ""} awaiting action</span>}
        {synthesisScore != null && synthesisScore > 0 && <span className="text-[hsl(270_60%_70%)]">Pipeline: {Math.round(synthesisScore * 100)}%</span>}
      </div>
    </motion.div>
  );
}

// ── Domain Boardroom View ──
function DomainBoardroomView({ domain }: { domain: "business" | "finance" | "concierge" }) {
  const { escalations, decisions, escalate, isDemoMode, synthesis } = useBoardroomBridge(domain);
  return (
    <div className="space-y-4 p-4">
      {synthesis && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[hsl(270_60%_55%/0.15)] bg-[hsl(270_50%_50%/0.04)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(270_60%_65%/0.5)] mb-2 flex items-center gap-1.5"><Zap size={10} /> Board Synthesis</p>
          <p className="text-[12px] text-[hsl(0_0%_100%/0.7)] mb-2">{synthesis.issue_summary}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(270_60%_55%/0.1)] text-[hsl(270_60%_70%)]">{synthesis.module_advisor_positions.length} advisor(s)</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(270_60%_55%/0.1)] text-[hsl(270_60%_70%)]">Worthiness: {Math.round(synthesis.boardroom_worthiness_score * 100)}%</span>
          </div>
        </motion.div>
      )}
      <button onClick={() => escalate({ title: `New ${domain} issue — requires strategic review`, description: `Escalated from ${domain} app.`, domain, severity: "medium", advisorSummaries: { system: "Escalated by user" }, escalationReason: "Manual escalation" })} className="w-full rounded-xl border border-[hsl(270_60%_55%/0.2)] bg-[hsl(270_50%_50%/0.06)] p-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-[hsl(270_60%_70%)] hover:bg-[hsl(270_50%_50%/0.12)] transition-colors">
        <ArrowUpRight size={14} /> Escalate New Issue to Boardroom
      </button>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.35)] mb-2">Items in Boardroom {isDemoMode && <span className="text-[8px] text-[hsl(0_0%_100%/0.2)]">(demo)</span>}</p>
        <div className="space-y-1.5">
          {escalations.map((item: any) => (
            <div key={item.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={11} className={severityColors[item.severity] || "text-[hsl(0_0%_100%/0.4)]"} />
                <span className="text-[9px] font-bold uppercase text-[hsl(0_0%_100%/0.35)]">{item.severity}</span>
                <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] ml-auto flex items-center gap-1"><Clock size={8} /> {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-[12px] font-medium text-[hsl(0_0%_100%/0.8)]">{item.title}</p>
            </div>
          ))}
          {escalations.length === 0 && <p className="text-[11px] text-[hsl(0_0%_100%/0.25)] text-center py-4">No items in Boardroom</p>}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.35)] mb-2">Decisions from Boardroom</p>
        <div className="space-y-1.5">
          {decisions.map((dec: any) => (
            <div key={dec.id} className="rounded-lg border border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5 p-3">
              <div className="flex items-center gap-2 mb-1"><CheckCircle size={11} className="text-[hsl(var(--trust-safe))]" /><span className="text-[9px] font-bold text-[hsl(var(--trust-safe))]">APPROVED</span></div>
              <p className="text-[12px] font-medium text-[hsl(0_0%_100%/0.8)]">{dec.summary}</p>
            </div>
          ))}
          {decisions.length === 0 && <p className="text-[11px] text-[hsl(0_0%_100%/0.25)] text-center py-4">No pending decisions</p>}
        </div>
      </div>
    </div>
  );
}

// ── Pipeline Health View ──
function PipelineHealthView({ domain }: { domain: "business" | "finance" | "concierge" }) {
  const outputs = getAdvisorOutputs(domain);
  const { synthesis } = useBoardroomBridge(domain);
  return (
    <div className="space-y-4 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(270_60%_65%/0.5)] mb-2 flex items-center gap-1.5"><Activity size={10} /> Pipeline Health — {domain}</p>
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.6)] mb-2">Advisor Outputs ({outputs.length})</p>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {outputs.slice(-10).map((o) => (
            <div key={o.packet_id} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-[hsl(270_60%_70%)]">{o.advisor_name}</span>
                <span className="text-[9px] text-[hsl(0_0%_100%/0.3)] ml-auto">Relevance: {Math.round(o.boardroom_relevance_score * 100)}%</span>
              </div>
              <p className="text-[10px] text-[hsl(0_0%_100%/0.5)] mt-1 truncate">{o.recommendation}</p>
            </div>
          ))}
          {outputs.length === 0 && <p className="text-[10px] text-[hsl(0_0%_100%/0.25)] text-center py-3">No advisor outputs yet</p>}
        </div>
      </div>
      {synthesis && (
        <div className="rounded-xl border border-[hsl(270_60%_55%/0.15)] bg-[hsl(270_50%_50%/0.04)] p-4">
          <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.6)] mb-2">Board Synthesis</p>
          <p className="text-[11px] text-[hsl(0_0%_100%/0.5)]">{synthesis.recommendation}</p>
        </div>
      )}
    </div>
  );
}

// ── Sidebar Group Section ──
function SidebarGroupSection({ group, activeModule, onSelect }: { group: SidebarGroup; activeModule: string; onSelect: (id: string) => void }) {
  const hasActive = group.items.some(i => i.id === activeModule);
  const [open, setOpen] = useState(hasActive || group.label === "Home");

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.5)] transition-colors"
      >
        {group.label}
        <ChevronDown size={10} className={cn("transition-transform duration-200", open ? "" : "-rotate-90")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {group.items.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 outline-none text-left",
                  activeModule === item.id
                    ? "bg-[hsl(270_60%_55%/0.12)] text-[hsl(270_60%_75%)] shadow-[inset_3px_0_0_hsl(270_60%_55%)]"
                    : "text-[hsl(0_0%_100%/0.5)] hover:bg-[hsl(0_0%_100%/0.04)] hover:text-[hsl(0_0%_100%/0.8)]"
                )}
              >
                <item.icon size={14} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Loading Fallback ──
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[hsl(270_60%_55%/0.3)] border-t-[hsl(270_60%_55%)] rounded-full animate-spin" />
        <span className="text-[11px] text-[hsl(0_0%_100%/0.3)]">Loading module…</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Shell
// ═══════════════════════════════════════════════════════
export function ConciergeAppShell() {
  const [activeModule, setActiveModule] = useState<string>(() => {
    return (window as any).__conciergeInitialModule || "overview";
  });

  const { pendingCount, decisionCount, synthesis } = useBoardroomBridge("concierge");
  const { data: caiRelationships } = useRelationshipContexts({ limit: 20 });
  const { data: caiObligations } = useHumanObligations({ limit: 20 });
  const { primaryMode } = useBusinessProfile();
  const conciergeAdapt = useMemo(() => getConciergeAdaptation(primaryMode), [primaryMode]);

  // Deep-link navigation listener
  useEffect(() => {
    const handler = (e: Event) => {
      const module = (e as CustomEvent).detail?.module;
      if (module) setActiveModule(module);
    };
    window.addEventListener("sita-concierge-navigate", handler);
    return () => window.removeEventListener("sita-concierge-navigate", handler);
  }, []);

  // Clear initial module after mount
  useEffect(() => {
    delete (window as any).__conciergeInitialModule;
  }, []);

  const navHistory = useNavigationHistory(activeModule);
  const navigateTo = useCallback((key: string) => navHistory.navigate(key, setActiveModule), [navHistory]);

  // Render content
  const renderContent = () => {
    if (activeModule === "advisors") {
      return <DomainAdvisorBoard domain="concierge" />;
    }
    if (activeModule === "boardroom-intelligence") {
      return <DomainBoardroomView domain="concierge" />;
    }
    if (activeModule === "pipeline") {
      return <PipelineHealthView domain="concierge" />;
    }
    const PageComp = PAGE_COMPONENTS[activeModule];
    if (PageComp) {
      return (
        <Suspense fallback={<PageLoader />}>
          <PageComp />
        </Suspense>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-[hsl(0_0%_100%/0.04)] flex items-center justify-center">
            <CalendarHeart className="w-5 h-5 text-[hsl(0_0%_100%/0.15)]" />
          </div>
          <span className="text-[hsl(0_0%_100%/0.3)] text-sm font-medium">
            {activeModule.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          <span className="text-[hsl(0_0%_100%/0.15)] text-xs">This module is not yet configured for your household</span>
        </div>
      </div>
    );
  };

  return (
    <ConciergeNavigationContext.Provider value={{ navigateTo, activeModule }}>
      <ConciergeDataProvider value={{ relationships: caiRelationships, obligations: caiObligations }}>
        <div className="flex h-full w-full bg-[hsl(220_15%_6%)]">
          {/* ── Sidebar ── */}
          <div className="w-[210px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_15%_5%)] flex flex-col overflow-hidden">
            {/* App Identity */}
            <div className="px-4 py-4 flex items-center gap-2.5 border-b border-[hsl(0_0%_100%/0.04)]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(270_60%_55%)] to-[hsl(300_50%_48%)] flex items-center justify-center">
                <Headphones size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[hsl(0_0%_100%/0.85)]">Concierge</p>
                <p className="text-[9px] text-[hsl(0_0%_100%/0.3)]">{conciergeAdapt.advisorTone.length > 40 ? "Life Support OS" : conciergeAdapt.advisorTone}</p>
              </div>
            </div>

            {/* Sidebar Groups */}
            <div className="flex-1 overflow-y-auto py-2 px-1.5 scrollbar-thin">
              {SIDEBAR_GROUPS.map(group => (
                <SidebarGroupSection
                  key={group.label}
                  group={group}
                  activeModule={activeModule}
                  onSelect={navigateTo}
                />
              ))}

              {/* Cross-OS Links */}
              <div className="px-1.5 pt-3 pb-2 space-y-2">
                <CrossDomainIntelligenceBridge currentApp="concierge" compact />
                <CrossOSLinksPanel sourceApp="concierge" primaryMode={primaryMode} compact maxLinks={4} />
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="h-11 shrink-0 border-b border-[hsl(0_0%_100%/0.06)] flex items-center justify-between px-5 bg-[hsl(220_15%_6%/0.8)] backdrop-blur-sm">
              <AppShellBreadcrumb
                appName="Concierge OS"
                appColor="hsl(285 55% 55%)"
                current={{ id: activeModule, label: MODULE_LABELS[activeModule] || activeModule }}
                history={navHistory.history}
                historyIndex={navHistory.historyIndex}
                onNavigate={navigateTo}
                onBack={() => navHistory.goBack(setActiveModule)}
                onForward={() => navHistory.goForward(setActiveModule)}
              />
              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <button
                    onClick={() => setActiveModule("boardroom")}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[hsl(270_60%_55%/0.1)] text-[hsl(270_60%_70%)] text-[10px] font-medium hover:bg-[hsl(270_60%_55%/0.2)] transition-colors"
                  >
                    <Crown size={10} />
                    {pendingCount} pending
                  </button>
                )}
              </div>
            </div>

            <BoardroomStatusStrip
              pendingCount={pendingCount}
              decisionCount={decisionCount}
              synthesisScore={synthesis?.boardroom_worthiness_score}
            />

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="min-h-[300px]"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </ConciergeDataProvider>
    </ConciergeNavigationContext.Provider>
  );
}
