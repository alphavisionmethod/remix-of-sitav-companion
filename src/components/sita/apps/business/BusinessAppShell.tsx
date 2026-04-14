import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from "react";
import {
  Users, FileText, Briefcase, TrendingUp, Brain, ArrowUpRight, CheckCircle, Clock,
  AlertTriangle, Activity, Zap, LayoutDashboard, Target, Phone, Calendar, Settings,
  Receipt, Banknote, ClipboardList, Bot, RefreshCw, Share2, ShoppingCart, Globe,
  BarChart3, BookOpen, LineChart, Mail, FolderOpen, Crown, Shield, Heart,
  Building2, StickyNote, Upload, Filter, Workflow, BrainCircuit, Search,
  ChevronDown, ChevronRight, Sliders
} from "lucide-react";
import { Headphones as SupportIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DomainAdvisorBoard } from "@/components/sita/domain-shared/DomainAdvisorBoard";
import { useBoardroomBridge } from "@/hooks/useBoardroomBridge";
import { getAdvisorOutputs } from "@/lib/services/orchestration-pipeline/module-advisor-consumer";
import { BusinessNavigationContext } from "@/contexts/BusinessNavigationContext";
import { BusinessProfileProvider } from "@/contexts/BusinessProfileContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import AdaptiveBusinessHome from "@/components/business/adaptive/AdaptiveBusinessHome";
import BusinessProfileEditor from "@/components/business/adaptive/BusinessProfileEditor";

// ── Page imports ──────────────────────────────────────────────
import BusinessOverview from "@/pages/business/BusinessOverview";
import LeadsInbox from "@/pages/business/LeadsInbox";
import OpportunitiesCenter from "@/pages/business/OpportunitiesCenter";
import QuotesWorkspace from "@/pages/business/QuotesWorkspace";
import InvoicesCollections from "@/pages/business/InvoicesCollections";
import CommunicationsCenter from "@/pages/business/CommunicationsCenter";
import BusinessBoardroom from "@/pages/business/BusinessBoardroom";
import BusinessProof from "@/pages/business/BusinessProof";
import CustomersPage from "@/pages/business/CustomersPage";
import RevenueAutopilot from "@/pages/business/RevenueAutopilot";
import AutopilotHub from "@/pages/business/AutopilotHub";
import CollectionsCommandCenter from "@/pages/business/CollectionsCommandCenter";
import RevenueImpactDashboard from "@/pages/business/RevenueImpactDashboard";
import PlaybookBuilder from "@/pages/business/PlaybookBuilder";
import RevenueForecast from "@/pages/business/RevenueForecast";
import WebsiteBuilder from "@/pages/business/WebsiteBuilder";
import ProposalsContracts from "@/pages/business/ProposalsContracts";
import LeadRecovery from "@/pages/business/LeadRecovery";
import SocialCommand from "@/pages/business/SocialCommand";
import EcommerceManager from "@/pages/business/EcommerceManager";
import FollowThroughCenter from "@/pages/business/FollowThroughCenter";
import CustomerSupportCenter from "@/pages/business/CustomerSupportCenter";
import AppointmentsScheduling from "@/pages/business/AppointmentsScheduling";
import BusinessOperations from "@/pages/business/BusinessOperations";
import BusinessDocuments from "@/pages/business/BusinessDocuments";
import CRMHome from "@/pages/business/CRMHome";
import CRMContacts from "@/pages/business/CRMContacts";
import CRMCompanies from "@/pages/business/CRMCompanies";
import CRMPipeline from "@/pages/business/CRMPipeline";
import CRMHealth from "@/pages/business/CRMHealth";
import CRMTimeline from "@/pages/business/CRMTimeline";
import CRMTasks from "@/pages/business/CRMTasks";
import CRMNotes from "@/pages/business/CRMNotes";
import CRMSegments from "@/pages/business/CRMSegments";
import CRMAutomations from "@/pages/business/CRMAutomations";
import CRMImportCenter from "@/pages/business/CRMImportCenter";
import CRMDuplicates from "@/pages/business/CRMDuplicates";
import CRMAdvisorPage from "@/pages/business/CRMAdvisorPage";
import CRMCustomFieldsPage from "@/pages/business/CRMCustomFieldsPage";
import CRMCommunications from "@/pages/business/CRMCommunications";
import CRMIntegrationHub from "@/pages/business/CRMIntegrationHub";
import CustomerHealthPage from "@/pages/CustomerHealthPage";
import CustomerDetail from "@/pages/CustomerDetail";

// ── Sidebar structure ─────────────────────────────────────────

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  countSeverity?: "warning" | "critical";
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "CRM",
    items: [
      { id: "crm-home", label: "CRM Home", icon: Heart },
      { id: "crm-contacts", label: "Contacts", icon: Users },
      { id: "crm-companies", label: "Companies", icon: Building2 },
      { id: "crm-pipeline", label: "Pipeline", icon: TrendingUp },
      { id: "crm-health", label: "Health", icon: Heart },
      { id: "crm-timeline", label: "Timeline", icon: Clock },
      { id: "crm-communications", label: "Comms Queue", icon: Mail },
      { id: "crm-tasks", label: "Tasks", icon: Target, count: 3, countSeverity: "warning" },
      { id: "crm-notes", label: "Notes", icon: StickyNote },
      { id: "crm-segments", label: "Segments", icon: Filter },
      { id: "crm-automations", label: "Automations", icon: Zap },
      { id: "crm-import", label: "Import", icon: Upload },
      { id: "crm-duplicates", label: "Duplicates", icon: RefreshCw },
      { id: "crm-advisor", label: "Advisor", icon: BrainCircuit },
      { id: "crm-fields", label: "Fields", icon: Settings },
      { id: "integrations", label: "Integrations", icon: Share2 },
    ],
  },
  {
    label: "Core",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "leads", label: "Leads", icon: Target, count: 3 },
      { id: "customers", label: "Customers", icon: Users },
      { id: "follow-through", label: "Follow-Through", icon: Phone, count: 8, countSeverity: "warning" },
      { id: "support", label: "Support", icon: SupportIcon, count: 2 },
      { id: "appointments", label: "Appointments", icon: Calendar },
      { id: "operations", label: "Operations", icon: Settings, count: 3 },
      { id: "opportunities", label: "Opportunities", icon: TrendingUp },
      { id: "customer-health", label: "Customer Health", icon: Heart },
    ],
  },
  {
    label: "Sales",
    items: [
      { id: "quotes", label: "Quotes", icon: FileText },
      { id: "invoices", label: "Invoices", icon: Receipt, count: 1, countSeverity: "critical" },
      { id: "collections", label: "Collections", icon: Banknote },
      { id: "proposals", label: "Proposals", icon: ClipboardList, count: 2 },
    ],
  },
  {
    label: "Growth",
    items: [
      { id: "revenue-autopilot", label: "Revenue Autopilot", icon: Zap },
      { id: "autopilot-hub", label: "Autopilot Hub", icon: Bot },
      { id: "lead-recovery", label: "Lead Recovery", icon: RefreshCw, count: 5, countSeverity: "warning" },
      { id: "social", label: "Social", icon: Share2, count: 4 },
      { id: "ecommerce", label: "E-Commerce", icon: ShoppingCart, count: 2 },
      { id: "website-builder", label: "Website", icon: Globe },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "revenue-impact", label: "Revenue Impact", icon: BarChart3 },
      { id: "playbook-builder", label: "Builder", icon: BookOpen },
      { id: "revenue-forecast", label: "Forecast", icon: LineChart },
    ],
  },
  {
    label: "System",
    items: [
      { id: "communications", label: "Comms", icon: Mail },
      { id: "documents", label: "Documents", icon: FolderOpen, count: 10 },
      { id: "boardroom", label: "Boardroom", icon: Crown },
      { id: "proof", label: "Proof", icon: Shield },
      { id: "advisors", label: "Advisors", icon: Brain },
      { id: "pipeline-health", label: "Pipeline Health", icon: Activity },
      { id: "business-profile", label: "Business Profile", icon: Sliders },
    ],
  },
];

// ── Pages map ─────────────────────────────────────────────────
const pages: Record<string, React.ComponentType> = {
  overview: BusinessOverview,
  leads: LeadsInbox,
  customers: CustomersPage,
  "follow-through": FollowThroughCenter,
  support: CustomerSupportCenter,
  appointments: AppointmentsScheduling,
  operations: BusinessOperations,
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
  documents: BusinessDocuments,
  "crm-home": CRMHome,
  "crm-contacts": CRMContacts,
  "crm-companies": CRMCompanies,
  "crm-pipeline": CRMPipeline,
  "crm-health": CRMHealth,
  "crm-timeline": CRMTimeline,
  "crm-tasks": CRMTasks,
  "crm-notes": CRMNotes,
  "crm-segments": CRMSegments,
  "crm-automations": CRMAutomations,
  "crm-import": CRMImportCenter,
  "crm-duplicates": CRMDuplicates,
  "crm-advisor": CRMAdvisorPage,
  "crm-fields": CRMCustomFieldsPage,
  "crm-communications": CRMCommunications,
  integrations: CRMIntegrationHub,
  "customer-health": CustomerHealthPage,
  "adaptive-home": AdaptiveBusinessHome,
  "business-profile": BusinessProfileEditor,
};

// ── Helper components ─────────────────────────────────────────

const severityColors: Record<string, string> = {
  high: "text-[hsl(var(--destructive))]",
  medium: "text-[hsl(var(--sita-gold))]",
  low: "text-[hsl(var(--trust-safe))]",
  critical: "text-[hsl(var(--destructive))]",
};

function BoardroomStatusStrip({ pendingCount, decisionCount, synthesisScore }: { pendingCount: number; decisionCount: number; synthesisScore?: number }) {
  if (pendingCount === 0 && decisionCount === 0 && !synthesisScore) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 mt-2 rounded-lg border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.04)] px-3 py-2 flex items-center gap-3"
    >
      <Brain size={12} className="text-[hsl(280_50%_65%)] shrink-0" />
      <div className="flex items-center gap-3 text-[10px]">
        {pendingCount > 0 && (
          <span className="text-[hsl(var(--sita-gold))]">
            {pendingCount} item{pendingCount > 1 ? "s" : ""} in Boardroom
          </span>
        )}
        {decisionCount > 0 && (
          <span className="text-[hsl(var(--trust-safe))]">
            {decisionCount} decision{decisionCount > 1 ? "s" : ""} awaiting action
          </span>
        )}
        {synthesisScore != null && synthesisScore > 0 && (
          <span className="text-[hsl(280_50%_70%)]">
            Pipeline: {Math.round(synthesisScore * 100)}% Boardroom relevance
          </span>
        )}
      </div>
    </motion.div>
  );
}

function DomainBoardroomView({ domain }: { domain: "business" | "finance" | "concierge" }) {
  const { escalations, decisions, escalate, isDemoMode, synthesis } = useBoardroomBridge(domain);
  return (
    <div className="space-y-4 p-4">
      {synthesis && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.04)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-2 flex items-center gap-1.5"><Zap size={10} /> Board Synthesis</p>
          <p className="text-[12px] text-[hsl(0_0%_100%/0.7)] mb-2">{synthesis.issue_summary}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(280_50%_50%/0.1)] text-[hsl(280_50%_70%)]">{synthesis.module_advisor_positions.length} advisor(s)</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(280_50%_50%/0.1)] text-[hsl(280_50%_70%)]">Worthiness: {Math.round(synthesis.boardroom_worthiness_score * 100)}%</span>
            {synthesis.missing_data_flags.length > 0 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]">{synthesis.missing_data_flags.length} data gap(s)</span>
            )}
          </div>
        </motion.div>
      )}
      <button
        onClick={() => escalate({ title: `New business issue — requires strategic review`, description: `Escalated from business app for Boardroom assessment.`, domain, severity: "medium", advisorSummaries: { system: "Escalated by user" }, escalationReason: "Manual escalation from domain app" })}
        className="w-full rounded-xl border border-[hsl(280_50%_50%/0.2)] bg-[hsl(280_40%_50%/0.06)] p-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-[hsl(280_50%_70%)] hover:bg-[hsl(280_40%_50%/0.12)] transition-colors"
      >
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
              {dec.payload?.approved_motion && <p className="text-[10px] text-[hsl(0_0%_100%/0.4)] mt-1">{dec.payload.approved_motion}</p>}
            </div>
          ))}
          {decisions.length === 0 && <p className="text-[11px] text-[hsl(0_0%_100%/0.25)] text-center py-4">No pending decisions</p>}
        </div>
      </div>
    </div>
  );
}

function PipelineHealthView({ domain }: { domain: "business" | "finance" | "concierge" }) {
  const outputs = getAdvisorOutputs(domain);
  const { synthesis } = useBoardroomBridge(domain);
  return (
    <div className="space-y-4 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-2 flex items-center gap-1.5"><Activity size={10} /> Pipeline Health — {domain}</p>
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.6)] mb-2">Advisor Outputs ({outputs.length})</p>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {outputs.slice(-10).map((o) => (
            <div key={o.packet_id} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-[hsl(280_50%_70%)]">{o.advisor_name}</span>
                <span className="text-[9px] text-[hsl(0_0%_100%/0.3)] ml-auto">Relevance: {Math.round(o.boardroom_relevance_score * 100)}%</span>
              </div>
              <p className="text-[10px] text-[hsl(0_0%_100%/0.5)] mt-1 truncate">{o.recommendation}</p>
            </div>
          ))}
          {outputs.length === 0 && <p className="text-[10px] text-[hsl(0_0%_100%/0.25)] text-center py-3">No advisor outputs yet</p>}
        </div>
      </div>
      {synthesis && (
        <div className="rounded-xl border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.04)] p-4">
          <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.6)] mb-2">Board Synthesis</p>
          <p className="text-[11px] text-[hsl(0_0%_100%/0.5)]">{synthesis.recommendation}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.05)]">Trust: {synthesis.trust_state}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.05)]">Modules: {synthesis.affected_modules.join(", ")}</span>
          </div>
          {synthesis.disagreement_areas.length > 0 && (
            <div className="mt-2 space-y-1">
              {synthesis.disagreement_areas.map((d, i) => <p key={i} className="text-[9px] text-[hsl(var(--sita-gold))]">⚠ {d}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Collapsible sidebar group ─────────────────────────────────

function SidebarGroupSection({ group, activeModule, onSelect }: { group: SidebarGroup; activeModule: string; onSelect: (id: string) => void }) {
  const hasActive = group.items.some(i => i.id === activeModule);
  const [open, setOpen] = useState(hasActive || group.label === "CRM");

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.5)] transition-colors"
      >
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        {group.label}
      </button>
      {open && (
        <div className="space-y-0.5 ml-1">
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 outline-none text-left",
                activeModule === item.id
                  ? "bg-[hsl(217_80%_50%/0.12)] text-[hsl(217_80%_65%)] shadow-[inset_2px_0_0_hsl(217_80%_55%)]"
                  : "text-[hsl(0_0%_100%/0.45)] hover:bg-[hsl(0_0%_100%/0.04)] hover:text-[hsl(0_0%_100%/0.7)]"
              )}
            >
              <item.icon size={13} className="shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.count && item.count > 0 && (
                <span className={cn(
                  "ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  item.countSeverity === "critical" ? "bg-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive))]" :
                  item.countSeverity === "warning" ? "bg-[hsl(var(--sita-gold))]/15 text-[hsl(var(--sita-gold))]" :
                  "bg-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_100%/0.4)]"
                )}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────

export function BusinessAppShell({ initialModule }: { initialModule?: string }) {
  const storedModule = (window as any).__businessInitialModule;
  const [activeModule, setActiveModule] = useState(storedModule || initialModule || "crm-home");

  // Listen for navigation events from outside (deep-linking, launchers)
  useEffect(() => {
    // Clear the stored module after reading
    delete (window as any).__businessInitialModule;

    const handler = (e: Event) => {
      const module = (e as CustomEvent).detail?.module;
      if (module) {
        const key = module.replace(/^\/business\//, "").replace(/^business\//, "");
        const resolved = key === "" || key === "business" ? "overview" : key;
        setActiveModule(resolved);
      }
    };
    window.addEventListener("sita-business-navigate", handler);
    return () => window.removeEventListener("sita-business-navigate", handler);
  }, []);
  const { pendingCount, decisionCount, synthesis } = useBoardroomBridge("business");

  const navigateTo = useCallback((moduleKey: string) => {
    // Strip "/business/" prefix if passed
    const key = moduleKey.replace(/^\/business\//, "").replace(/^business\//, "");
    const resolved = key === "" || key === "business" ? "overview" : key;
    setActiveModule(resolved);
  }, []);

  // Find current label
  const currentLabel = (() => {
    for (const g of SIDEBAR_GROUPS) {
      const item = g.items.find(i => i.id === activeModule);
      if (item) return item.label;
    }
    return activeModule;
  })();

  // Determine what to render
  const renderContent = () => {
    if (activeModule === "advisors") {
      return (
        <motion.div key="advisors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
          <DomainAdvisorBoard domain="business" />
        </motion.div>
      );
    }
    if (activeModule === "boardroom") {
      return (
        <motion.div key="boardroom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <DomainBoardroomView domain="business" />
        </motion.div>
      );
    }
    if (activeModule === "pipeline-health") {
      return (
        <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <PipelineHealthView domain="business" />
        </motion.div>
      );
    }

    // Handle customer detail view (customer-detail:someId)
    if (activeModule.startsWith("customer-detail:")) {
      const custId = activeModule.replace("customer-detail:", "");
      return (
        <motion.div key={activeModule} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <CustomerDetail customerId={custId} />
        </motion.div>
      );
    }

    const PageComponent = pages[activeModule];
    if (PageComponent) {
      return (
        <motion.div key={activeModule} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <PageComponent />
        </motion.div>
      );
    }

    return (
      <motion.div key={activeModule} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
        <div className="text-[hsl(0_0%_100%/0.2)] uppercase tracking-[0.2em] text-lg font-medium select-none">
          {activeModule.toUpperCase()} — Coming Soon
        </div>
      </motion.div>
    );
  };

  return (
    <BusinessNavigationContext.Provider value={{ navigateTo, activeModule }}>
      <div className="flex h-full w-full bg-[hsl(220_15%_6%)]">
        {/* Sidebar */}
        <div className="w-[190px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(220_15%_5%)] flex flex-col py-3 px-1.5 overflow-y-auto scrollbar-thin">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.25)] px-3 mb-3">
            Business OS
          </p>
          {SIDEBAR_GROUPS.map((group) => (
            <SidebarGroupSection key={group.label} group={group} activeModule={activeModule} onSelect={setActiveModule} />
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 shrink-0 border-b border-[hsl(0_0%_100%/0.06)] flex items-center px-5 bg-[hsl(220_15%_6%/0.8)]">
            <span className="text-[12px] font-semibold text-[hsl(0_0%_100%/0.6)]">{currentLabel}</span>
          </div>

          <BoardroomStatusStrip pendingCount={pendingCount} decisionCount={decisionCount} synthesisScore={synthesis?.boardroom_worthiness_score} />

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </BusinessNavigationContext.Provider>
  );
}
