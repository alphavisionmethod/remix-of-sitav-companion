import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import { HeroCard, QueueCard, StatusCard, AdvisorCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { SlidePanel } from "@/components/sita/surfaces/SlidePanel";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { cn } from "@/lib/utils";
import {
  HeadphonesIcon, AlertTriangle, Clock, CheckCircle2, MessageSquare, User, ShieldAlert,
  Timer, TrendingDown, Mail, Phone, FileText, RotateCcw
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

type Severity = "critical" | "high" | "medium" | "low";
type IssueStatus = "open" | "waiting-on-us" | "waiting-on-customer" | "escalated" | "resolved";

interface SupportIssue {
  id: string; customer: string; subject: string; preview: string; severity: Severity;
  status: IssueStatus; owner: string; linkedEntity?: string; linkedType?: string;
  createdAt: string; lastAction: string; responseCount: number; slaHours: number; hoursOpen: number;
}

const DEMO_ISSUES: SupportIssue[] = [
  { id: "SUP-001", customer: "Marcus Chen", subject: "Order arrived damaged — requesting replacement", preview: "The packaging was torn and the product inside has visible damage.", severity: "critical", status: "waiting-on-us", owner: "You", linkedEntity: "ORD-4521", linkedType: "order", createdAt: "2h ago", lastAction: "Customer sent photos", responseCount: 3, slaHours: 4, hoursOpen: 2 },
  { id: "SUP-002", customer: "Sarah Park", subject: "Billing discrepancy on last invoice", preview: "I was charged $450 but the agreed amount was $380.", severity: "high", status: "open", owner: "Unassigned", linkedEntity: "INV-1892", linkedType: "invoice", createdAt: "5h ago", lastAction: "New ticket", responseCount: 0, slaHours: 8, hoursOpen: 5 },
  { id: "SUP-003", customer: "David Liu", subject: "Can't access my account portal", preview: "I've tried resetting my password three times and still can't log in.", severity: "medium", status: "waiting-on-us", owner: "Alex M.", createdAt: "1d ago", lastAction: "Escalated to tech", responseCount: 2, slaHours: 24, hoursOpen: 26 },
  { id: "SUP-004", customer: "Elena Torres", subject: "Requesting refund for cancelled service", preview: "I cancelled last week but was still charged.", severity: "high", status: "escalated", owner: "You", linkedEntity: "INV-2001", linkedType: "invoice", createdAt: "3d ago", lastAction: "Manager review pending", responseCount: 5, slaHours: 24, hoursOpen: 72 },
  { id: "SUP-005", customer: "James Wright", subject: "Feature request — bulk export", preview: "Would love to be able to export all my data in CSV format.", severity: "low", status: "open", owner: "Unassigned", createdAt: "2d ago", lastAction: "New ticket", responseCount: 0, slaHours: 72, hoursOpen: 48 },
  { id: "SUP-006", customer: "Amy Nguyen", subject: "Appointment was rescheduled without notice", preview: "My appointment was moved without anyone telling me.", severity: "high", status: "waiting-on-customer", owner: "Alex M.", linkedEntity: "APT-337", linkedType: "appointment", createdAt: "6h ago", lastAction: "Apology sent", responseCount: 2, slaHours: 8, hoursOpen: 6 },
  { id: "SUP-007", customer: "Robert Kim", subject: "Delivery tracking shows wrong address", preview: "The tracking info shows a completely different delivery address.", severity: "critical", status: "open", owner: "Unassigned", linkedEntity: "ORD-4580", linkedType: "order", createdAt: "45m ago", lastAction: "New ticket", responseCount: 0, slaHours: 2, hoursOpen: 0.75 },
  { id: "SUP-008", customer: "Lisa Chang", subject: "Thank you — issue resolved perfectly", preview: "Just wanted to say thanks for the quick resolution!", severity: "low", status: "resolved", owner: "You", createdAt: "1d ago", lastAction: "Closed", responseCount: 4, slaHours: 24, hoursOpen: 6 },
];

const urgencyMap: Record<Severity, "critical" | "high" | "normal" | "low"> = { critical: "critical", high: "high", medium: "normal", low: "low" };

const CustomerSupportCenter = () => {
  const { isDemoMode } = useDataMode();
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("support", primaryMode);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filterIssues = (tab: string) => {
    if (tab === "all") return (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status !== "resolved");
    if (tab === "urgent") return (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => (i.severity === "critical" || i.severity === "high") && i.status !== "resolved");
    if (tab === "waiting-on-us") return (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status === "waiting-on-us");
    if (tab === "escalated") return (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status === "escalated");
    if (tab === "resolved") return (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status === "resolved");
    return DEMO_ISSUES;
  };

  const filtered = filterIssues(activeTab);
  const selected = (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).find(i => i.id === selectedId);
  const criticalCount = (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.severity === "critical" && i.status !== "resolved").length;
  const breachedCount = (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.hoursOpen > i.slaHours && i.status !== "resolved").length;

  const handleSelect = (id: string) => { setSelectedId(id); setPanelOpen(true); };

  const queueItems = filtered.map(issue => ({
    id: issue.id,
    label: `${issue.customer}: ${issue.subject}`,
    meta: issue.createdAt,
    urgency: urgencyMap[issue.severity],
  }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTruthBanner truthState="demo" />

      <HeroCard
        title={moduleConfig.title}
        metric={`${(isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status !== "resolved").length} open ${moduleConfig.terminology.issue?.toLowerCase() || "issue"}s`}
        subtitle={moduleConfig.subtitle}
        icon={<HeadphonesIcon className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(280 50% 48%)"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="Critical" status={criticalCount > 0 ? "down" : "healthy"} lastChecked={`${criticalCount}`} icon={<ShieldAlert className="h-3.5 w-3.5" />} />
        <StatusCard label="SLA Breached" status={breachedCount > 0 ? "down" : "healthy"} lastChecked={`${breachedCount}`} icon={<Timer className="h-3.5 w-3.5" />} />
        <StatusCard label="Avg Resolution" status="healthy" lastChecked="4.2 hours" icon={<Clock className="h-3.5 w-3.5" />} />
        <StatusCard label="Satisfaction" status="healthy" lastChecked="94%" confidence={94} icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Open", count: (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status !== "resolved").length },
          { key: "urgent", label: "Urgent", count: (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => (i.severity === "critical" || i.severity === "high") && i.status !== "resolved").length },
          { key: "waiting-on-us", label: "Waiting on Us", count: (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status === "waiting-on-us").length },
          { key: "escalated", label: "Escalated", count: (isDemoMode ? DEMO_ISSUES : [] as typeof DEMO_ISSUES).filter(i => i.status === "escalated").length },
          { key: "resolved", label: "Resolved" },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {filtered.length === 0 ? (
        <PremiumEmptyState icon={CheckCircle2} title="No issues here" description="All clear in this category" variant="no-results" domain="business" />
      ) : (
        <QueueCard title={moduleConfig.terminology.queue?.toUpperCase() || "SUPPORT QUEUE"} items={queueItems} maxVisible={10} onItemClick={handleSelect} />
      )}

      <ModuleAdvisorInsight
        advisorName={moduleConfig.advisorName}
        domain="business"
        confidence={92}
        insight={`2 ${moduleConfig.terminology.issue?.toLowerCase() || "issue"}s need immediate response. ${moduleConfig.advisorSpecialty}.`}
        actions={[{ label: "View Drafts", onClick: () => {} }, { label: "Call Queue", onClick: () => {} }]}
      />

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={selected?.subject || "Issue Detail"} width={420}>
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                selected.severity === "critical" ? "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_55%)]" :
                selected.severity === "high" ? "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_58%)]" :
                "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]"
              )}>{selected.severity}</span>
              {selected.hoursOpen > selected.slaHours && selected.status !== "resolved" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_55%)]">SLA Breached</span>
              )}
            </div>

            <div>
              <p className="text-[10px] text-[hsl(0_0%_50%)] mb-1">{selected.id} · {selected.customer}</p>
              <p className="text-[12px] text-[hsl(0_0%_70%)] leading-relaxed">{selected.preview}</p>
            </div>

            <AppSurface level={2} className="p-3 space-y-2">
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Owner</span><span className="text-[hsl(0_0%_85%)]">{selected.owner}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Status</span><span className="text-[hsl(0_0%_85%)] capitalize">{selected.status.replace(/-/g, " ")}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Replies</span><span className="text-[hsl(0_0%_85%)]">{selected.responseCount}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Last</span><span className="text-[hsl(0_0%_85%)]">{selected.lastAction}</span></div>
              {selected.linkedEntity && <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Linked</span><span className="text-[hsl(265_55%_68%)] font-medium">{selected.linkedEntity}</span></div>}
            </AppSurface>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-lg bg-[hsl(265_55%_58%)] text-white text-[11px] font-medium hover:bg-[hsl(265_55%_50%)] transition-colors micro-press">Reply</button>
              <button className="px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_70%)] text-[11px] hover:bg-[hsl(0_0%_100%/0.10)] transition-colors micro-press">Assign</button>
            </div>
          </div>
        )}
      </SlidePanel>
    </motion.div>
  );
};

export default CustomerSupportCenter;
