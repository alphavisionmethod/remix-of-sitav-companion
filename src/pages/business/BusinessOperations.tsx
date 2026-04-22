import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import { HeroCard, QueueCard, ActionCard, StatusCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { SlidePanel } from "@/components/sita/surfaces/SlidePanel";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import {
  Layers, AlertTriangle, Users, Clock, Zap, ShieldAlert, GitBranch, Timer,
  CheckCircle, ArrowRight, Activity, TrendingDown, BarChart3, Target, Truck,
  UserCheck, Package, RefreshCw, ChevronRight, Star, Flame
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

type Tab = "all" | "queues" | "escalations" | "team" | "bottlenecks" | "delayed";

interface OperationalItem {
  id: string; title: string;
  category: "queue" | "escalation" | "bottleneck" | "delayed" | "exception";
  status: "active" | "at-risk" | "blocked" | "resolved" | "overdue";
  urgency: "critical" | "high" | "medium" | "low";
  owner: string; ownerAvatar: string; customerImpact: number; description: string;
  linkedEntity?: string; linkedEntityType?: string; age: string; nextAction: string; workload?: number;
}

const DEMO_ITEMS: OperationalItem[] = [
  { id: "ops-1", title: "Order fulfillment queue backup", category: "queue", status: "at-risk", urgency: "critical", owner: "Sarah K.", ownerAvatar: "SK", customerImpact: 12, description: "14 orders pending fulfillment > 48hrs. SLA breach imminent for 5 priority accounts.", linkedEntity: "Warehouse A", linkedEntityType: "Facility", age: "2d 6h", nextAction: "Reassign 5 priority orders to express lane" },
  { id: "ops-2", title: "Billing dispute escalation — Acme Corp", category: "escalation", status: "active", urgency: "high", owner: "Michael R.", ownerAvatar: "MR", customerImpact: 1, description: "Customer disputes $12,400 invoice. Finance review pending since Monday.", linkedEntity: "INV-2024-0847", linkedEntityType: "Invoice", age: "4d", nextAction: "Schedule finance review call" },
  { id: "ops-3", title: "API integration stall — payment processor", category: "bottleneck", status: "blocked", urgency: "critical", owner: "Dev Team", ownerAvatar: "DT", customerImpact: 45, description: "Payment processor webhook failing intermittently. 45 transactions in retry queue.", linkedEntity: "Stripe Webhook", linkedEntityType: "Integration", age: "18h", nextAction: "Escalate to engineering lead" },
  { id: "ops-4", title: "Delayed onboarding — 3 enterprise accounts", category: "delayed", status: "overdue", urgency: "high", owner: "Lisa M.", ownerAvatar: "LM", customerImpact: 3, description: "Enterprise onboarding behind schedule. Missing compliance docs from 2 accounts.", linkedEntity: "Q1 Enterprise Cohort", linkedEntityType: "Program", age: "1w 2d", nextAction: "Send compliance doc reminders" },
  { id: "ops-5", title: "Support ticket volume spike", category: "queue", status: "at-risk", urgency: "high", owner: "Support Team", ownerAvatar: "ST", customerImpact: 28, description: "Support volume 3x normal after product update. Response time degrading.", linkedEntity: "v2.4 Release", linkedEntityType: "Release", age: "1d 4h", nextAction: "Deploy additional support agents" },
  { id: "ops-6", title: "Inventory restock delay — top 5 SKUs", category: "bottleneck", status: "at-risk", urgency: "medium", owner: "Procurement", ownerAvatar: "PR", customerImpact: 8, description: "Supplier delayed shipment for 5 best-selling SKUs. Current stock covers ~3 days.", linkedEntity: "SKU Batch #447", linkedEntityType: "Inventory", age: "3d", nextAction: "Contact alternate supplier" },
  { id: "ops-7", title: "SLA breach — premium tier response time", category: "escalation", status: "overdue", urgency: "critical", owner: "Jordan T.", ownerAvatar: "JT", customerImpact: 2, description: "2 premium-tier customers waiting 6h+ for response (SLA: 1h).", linkedEntity: "Premium SLA Policy", linkedEntityType: "Policy", age: "6h", nextAction: "Immediate response + apology credit" },
  { id: "ops-8", title: "Workflow exception — auto-renewal failures", category: "exception", status: "active", urgency: "medium", owner: "Billing Team", ownerAvatar: "BT", customerImpact: 15, description: "15 subscription auto-renewals failed due to expired payment methods.", linkedEntity: "Renewal Batch", linkedEntityType: "Subscription", age: "2d", nextAction: "Send payment update reminders" },
];

const TEAM_MEMBERS = [
  { name: "Sarah K.", avatar: "SK", role: "Fulfillment Lead", activeItems: 6, capacity: 85, status: "high-load" as const },
  { name: "Michael R.", avatar: "MR", role: "Account Manager", activeItems: 4, capacity: 60, status: "normal" as const },
  { name: "Lisa M.", avatar: "LM", role: "Onboarding Specialist", activeItems: 5, capacity: 90, status: "overloaded" as const },
  { name: "Jordan T.", avatar: "JT", role: "Support Lead", activeItems: 8, capacity: 95, status: "overloaded" as const },
  { name: "Dev Team", avatar: "DT", role: "Engineering", activeItems: 3, capacity: 45, status: "normal" as const },
];

const urgencyMap = { critical: "critical" as const, high: "high" as const, medium: "normal" as const, low: "low" as const };

const BusinessOperations = () => {
  const { isDemoMode } = useDataMode();
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("operations", primaryMode);
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(item => {
    if (tab === "all") return true;
    if (tab === "queues") return item.category === "queue";
    if (tab === "escalations") return item.category === "escalation";
    if (tab === "bottlenecks") return item.category === "bottleneck";
    if (tab === "delayed") return item.category === "delayed" || item.category === "exception";
    return true;
  });

  const selected = (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).find(i => i.id === selectedId);
  const criticalCount = (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(i => i.urgency === "critical").length;
  const totalCustomerImpact = (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).reduce((sum, i) => sum + i.customerImpact, 0);

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
  };

  const queueItems = filtered.map(item => ({
    id: item.id,
    label: item.title,
    meta: item.age,
    urgency: urgencyMap[item.urgency],
    badge: undefined,
  }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageTruthBanner truthState="demo" />

      <HeroCard
        title={moduleConfig.title}
        metric={`${(isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).length} active ${moduleConfig.terminology.item?.toLowerCase() || "item"}s`}
        subtitle={moduleConfig.subtitle}
        icon={<Layers className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(240 50% 48%)"
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <StatusCard label="Critical Items" status={criticalCount > 0 ? "down" : "healthy"} lastChecked={`${criticalCount} active`} icon={<Flame className="h-3.5 w-3.5" />} />
        <StatusCard label="Escalations" status="degraded" lastChecked={`${(isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(i => i.category === "escalation").length} open`} icon={<ShieldAlert className="h-3.5 w-3.5" />} />
        <StatusCard label="Bottlenecks" status="degraded" lastChecked={`${(isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(i => i.category === "bottleneck").length} blocking`} icon={<GitBranch className="h-3.5 w-3.5" />} />
        <StatusCard label="Customer Impact" status={totalCustomerImpact > 20 ? "down" : "degraded"} lastChecked={`${totalCustomerImpact} affected`} icon={<Users className="h-3.5 w-3.5" />} />
      </div>

      {/* Business Day Pulse */}
      <AppSurface level={1} className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-[hsl(265_55%_68%)]" />
          <span className="text-[11px] font-semibold text-[hsl(0_0%_85%)]">Business Day Pulse</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Queue Velocity", value: "12/hr", change: "↑ 18%", changeColor: "text-[hsl(152_55%_48%)]", bar: 72 },
            { label: "Resolution Rate", value: "84%", change: "↓ 6%", changeColor: "text-[hsl(38_85%_58%)]", bar: 84 },
            { label: "Avg Handle Time", value: "2.4h", change: "↑ 40min", changeColor: "text-[hsl(0_70%_55%)]", bar: 55 },
            { label: "Team Utilization", value: "78%", change: "High", changeColor: "text-[hsl(38_85%_58%)]", bar: 78 },
          ].map(m => (
            <div key={m.label} className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[hsl(0_0%_50%)]">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-[hsl(0_0%_90%)] tabular-nums">{m.value}</span>
                <span className={cn("text-[10px] font-medium", m.changeColor)}>{m.change}</span>
              </div>
              <ConfidenceBar value={m.bar} size="sm" />
            </div>
          ))}
        </div>
      </AppSurface>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).length },
          { key: "queues", label: "Queues", count: (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(i => i.category === "queue").length },
          { key: "escalations", label: "Escalations", count: (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(i => i.category === "escalation").length },
          { key: "bottlenecks", label: "Bottlenecks", count: (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(i => i.category === "bottleneck").length },
          { key: "delayed", label: "Delayed", count: (isDemoMode ? DEMO_ITEMS : [] as typeof DEMO_ITEMS).filter(i => i.category === "delayed" || i.category === "exception").length },
          { key: "team", label: "Team Activity" },
        ]}
        active={tab}
        onChange={k => setTab(k as Tab)}
      />

      {tab === "team" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map(member => (
            <AppSurface key={member.name} level={1} className="p-4 micro-hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(265_55%_58%/0.12)] font-semibold text-sm text-[hsl(265_55%_68%)] shrink-0">{member.avatar}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-[hsl(0_0%_85%)]">{member.name}</p>
                  <p className="text-[10px] text-[hsl(0_0%_50%)]">{member.role}</p>
                </div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
                  member.status === "overloaded" ? "text-[hsl(0_70%_55%)] bg-[hsl(0_70%_55%/0.12)]" :
                  member.status === "high-load" ? "text-[hsl(38_85%_58%)] bg-[hsl(38_85%_58%/0.12)]" :
                  "text-[hsl(152_55%_48%)] bg-[hsl(152_55%_48%/0.12)]"
                )}>
                  {member.status === "overloaded" ? "Overloaded" : member.status === "high-load" ? "High Load" : "Normal"}
                </span>
              </div>
              <ConfidenceBar value={member.capacity} label="Capacity Used" size="sm" />
              <p className="text-[10px] text-[hsl(0_0%_50%)] mt-2">{member.activeItems} active items</p>
            </AppSurface>
          ))}
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <PremiumEmptyState icon={Layers} title="No operational items" description="All queues are clear — nothing needs attention right now" variant="first-use" domain="business" />
          ) : (
            <QueueCard title={moduleConfig.terminology.queue?.toUpperCase() || "OPERATIONAL QUEUE"} items={queueItems} maxVisible={10} onItemClick={handleSelectItem} />
          )}
        </>
      )}

      <ModuleAdvisorInsight
        advisorName={moduleConfig.advisorName}
        domain="business"
        confidence={88}
        insight={`${criticalCount} critical ${moduleConfig.terminology.item?.toLowerCase() || "item"}s need immediate attention. ${totalCustomerImpact} customers impacted. ${moduleConfig.advisorSpecialty}.`}
        linkedItems={["API Webhook", "SLA Breach", "Queue Backup"]}
      />

      {/* SlidePanel for detail */}
      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={selected?.title || "Details"} width={420}>
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                selected.urgency === "critical" ? "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_55%)]" :
                selected.urgency === "high" ? "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_58%)]" :
                "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]"
              )}>{selected.urgency}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_60%)] capitalize">{selected.status}</span>
            </div>

            <p className="text-[12px] text-[hsl(0_0%_70%)] leading-relaxed">{selected.description}</p>

            <AppSurface level={2} className="p-3 space-y-2">
              {[
                { label: "Owner", value: selected.owner },
                { label: "Age", value: selected.age },
                { label: "Impact", value: `${selected.customerImpact} customers` },
                ...(selected.linkedEntity ? [{ label: selected.linkedEntityType || "Link", value: selected.linkedEntity }] : []),
              ].map(row => (
                <div key={row.label} className="flex justify-between text-[11px]">
                  <span className="text-[hsl(0_0%_50%)]">{row.label}</span>
                  <span className="text-[hsl(0_0%_85%)] font-medium">{row.value}</span>
                </div>
              ))}
            </AppSurface>

            <ActionCard
              title="Recommended Action"
              description={selected.nextAction}
              accentColor="hsl(265 55% 58%)"
              onApprove={() => {}}
            />

            {selected.customerImpact > 0 && (
              <AppSurface level={2} className="p-3">
                <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider mb-2">Impact Severity</p>
                <ConfidenceBar value={Math.min(100, selected.customerImpact * 8)} size="md" />
                <p className="text-[10px] text-[hsl(0_0%_55%)] mt-1">
                  {selected.customerImpact} customer{selected.customerImpact !== 1 ? "s" : ""} affected.
                </p>
              </AppSurface>
            )}
          </div>
        )}
      </SlidePanel>
    </motion.div>
  );
};

export default BusinessOperations;
