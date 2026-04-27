import { toast } from "sonner";
import { useState } from "react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { useSupportCases, type SupportSeverity } from "@/platform/operations/hooks/use-support-cases";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import { HeroCard, QueueCard, StatusCard, AdvisorCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { SlidePanel } from "@/platform/sita/components/sita/surfaces/SlidePanel";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { cn } from "@/lib/utils";
import {
  HeadphonesIcon, AlertTriangle, Clock, CheckCircle2, MessageSquare, User, ShieldAlert,
  Timer, TrendingDown, Mail, Phone, FileText, RotateCcw
} from "lucide-react";
const urgencyMap: Record<SupportSeverity, "critical" | "high" | "normal" | "low"> = { critical: "critical", high: "high", medium: "normal", low: "low" };

const CustomerSupportCenter = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("support", primaryMode);
  const { issues, isLoading, metrics } = useSupportCases();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filterIssues = (tab: string) => {
    if (tab === "all") return issues.filter(i => i.status !== "resolved");
    if (tab === "urgent") return issues.filter(i => (i.severity === "critical" || i.severity === "high") && i.status !== "resolved");
    if (tab === "waiting-on-us") return issues.filter(i => i.status === "waiting-on-us");
    if (tab === "escalated") return issues.filter(i => i.status === "escalated");
    if (tab === "resolved") return issues.filter(i => i.status === "resolved");
    return issues;
  };

  const filtered = filterIssues(activeTab);
  const selected = issues.find(i => i.id === selectedId);
  const criticalCount = metrics.critical;
  const breachedCount = metrics.breached;

  const handleSelect = (id: string) => { setSelectedId(id); setPanelOpen(true); };

  const queueItems = filtered.map(issue => ({
    id: issue.id,
    label: `${issue.customer}: ${issue.subject}`,
    meta: issue.createdAt,
    urgency: urgencyMap[issue.severity],
  }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTruthBanner />

      <HeroCard
        title={moduleConfig.title}
        metric={`${metrics.totalOpen} open ${moduleConfig.terminology.issue?.toLowerCase() || "issue"}s`}
        subtitle={moduleConfig.subtitle}
        icon={<HeadphonesIcon className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(280 50% 48%)"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="Critical" status={criticalCount > 0 ? "down" : "healthy"} lastChecked={`${criticalCount}`} icon={<ShieldAlert className="h-3.5 w-3.5" />} />
        <StatusCard label="SLA Breached" status={breachedCount > 0 ? "down" : "healthy"} lastChecked={`${breachedCount}`} icon={<Timer className="h-3.5 w-3.5" />} />
        <StatusCard label="Avg Resolution" status={metrics.avgResolutionHours == null ? "healthy" : metrics.avgResolutionHours > 24 ? "degraded" : "healthy"} lastChecked={metrics.avgResolutionHours == null ? "—" : `${metrics.avgResolutionHours.toFixed(1)} hours`} icon={<Clock className="h-3.5 w-3.5" />} />
        <StatusCard label="Resolved" status="healthy" lastChecked={`${metrics.resolved}`} icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Open", count: metrics.totalOpen },
          { key: "urgent", label: "Urgent", count: metrics.urgent },
          { key: "waiting-on-us", label: "Waiting on Us", count: metrics.waitingOnUs },
          { key: "escalated", label: "Escalated", count: metrics.escalated },
          { key: "resolved", label: "Resolved", count: metrics.resolved },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {isLoading ? (
        <AppSurface level={1} className="p-6 text-center text-[11px] text-[hsl(0_0%_55%)]">Loading support cases…</AppSurface>
      ) : filtered.length === 0 ? (
        <PremiumEmptyState icon={CheckCircle2} title="No issues here" description="All clear in this category" variant="no-results" domain="business" />
      ) : (
        <QueueCard title={moduleConfig.terminology.queue?.toUpperCase() || "SUPPORT QUEUE"} items={queueItems} maxVisible={10} onItemClick={handleSelect} />
      )}

      <ModuleAdvisorInsight
        advisorName={moduleConfig.advisorName}
        domain="business"
        confidence={92}
        insight={`${criticalCount} ${moduleConfig.terminology.issue?.toLowerCase() || "issue"}${criticalCount === 1 ? "" : "s"} need immediate response. ${breachedCount} SLA breach${breachedCount === 1 ? "" : "es"} active. ${moduleConfig.advisorSpecialty}.`}
        actions={[{ label: "View Drafts", onClick: () => toast.info("Drafts planned — coming in a future update") }, { label: "Call Queue", onClick: () => toast.info("Call queue planned — coming in a future update") }]}
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
              <button className="flex-1 px-3 py-2 rounded-lg bg-[hsl(265_55%_58%)] text-foreground text-[11px] font-medium hover:bg-[hsl(265_55%_50%)] transition-colors micro-press">Reply</button>
              <button className="px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_70%)] text-[11px] hover:bg-[hsl(0_0%_100%/0.10)] transition-colors micro-press">Assign</button>
            </div>
          </div>
        )}
      </SlidePanel>
    </motion.div>
  );
};

export default CustomerSupportCenter;
