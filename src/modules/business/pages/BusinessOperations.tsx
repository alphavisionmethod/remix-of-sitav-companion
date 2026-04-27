import { toast } from "sonner";
import { useState } from "react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { useBusinessOperations } from "@/modules/business/hooks/use-business-operations";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import { HeroCard, QueueCard, ActionCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { SlidePanel } from "@/platform/sita/components/sita/surfaces/SlidePanel";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import {
  Layers, AlertTriangle, Users, Clock, Zap, ShieldAlert, GitBranch, Timer,
  CheckCircle, ArrowRight, Activity, TrendingDown, BarChart3, Target, Truck,
  UserCheck, Package, RefreshCw, ChevronRight, Star, Flame
} from "lucide-react";
type Tab = "all" | "queues" | "escalations" | "team" | "bottlenecks" | "delayed";

const urgencyMap = { critical: "critical" as const, high: "high" as const, medium: "normal" as const, low: "low" as const };

const BusinessOperations = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("operations", primaryMode);
  const { items, isLoading, isEmpty, metrics } = useBusinessOperations();
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = items.filter(item => {
    if (tab === "all") return true;
    if (tab === "queues") return item.category === "queue";
    if (tab === "escalations") return item.category === "escalation";
    if (tab === "bottlenecks") return item.category === "bottleneck";
    if (tab === "delayed") return item.category === "delayed" || item.category === "exception";
    return true;
  });

  const selected = items.find(i => i.id === selectedId);
  const criticalCount = metrics.critical;
  const totalCustomerImpact = metrics.customerImpact;

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
      <PageTruthBanner />

      <HeroCard
        title={moduleConfig.title}
        metric={`${metrics.total} active ${moduleConfig.terminology.item?.toLowerCase() || "item"}s`}
        subtitle={moduleConfig.subtitle}
        icon={<Layers className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(240 50% 48%)"
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <StatusCard label="Critical Items" status={criticalCount > 0 ? "down" : "healthy"} lastChecked={`${criticalCount} active`} icon={<Flame className="h-3.5 w-3.5" />} />
        <StatusCard label="Escalations" status={metrics.escalations > 0 ? "degraded" : "healthy"} lastChecked={`${metrics.escalations} open`} icon={<ShieldAlert className="h-3.5 w-3.5" />} />
        <StatusCard label="Bottlenecks" status={metrics.bottlenecks > 0 ? "degraded" : "healthy"} lastChecked={`${metrics.bottlenecks} blocking`} icon={<GitBranch className="h-3.5 w-3.5" />} />
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
          { key: "all", label: "All", count: metrics.total },
          { key: "queues", label: "Queues", count: metrics.queues },
          { key: "escalations", label: "Escalations", count: metrics.escalations },
          { key: "bottlenecks", label: "Bottlenecks", count: metrics.bottlenecks },
          { key: "delayed", label: "Delayed", count: metrics.delayed },
        ]}
        active={tab}
        onChange={k => setTab(k as Tab)}
      />

      {isLoading ? (
        <AppSurface level={1} className="p-6 text-center text-[11px] text-[hsl(0_0%_55%)]">Loading operations…</AppSurface>
      ) : isEmpty || filtered.length === 0 ? (
        <PremiumEmptyState icon={Layers} title="No operational items" description="All queues are clear — nothing needs attention right now" variant="first-use" domain="business" />
      ) : (
        <QueueCard title={moduleConfig.terminology.queue?.toUpperCase() || "OPERATIONAL QUEUE"} items={queueItems} maxVisible={10} onItemClick={handleSelectItem} />
      )}

      <ModuleAdvisorInsight
        advisorName={moduleConfig.advisorName}
        domain="business"
        confidence={88}
        insight={`${criticalCount} critical ${moduleConfig.terminology.item?.toLowerCase() || "item"}s need immediate attention. ${totalCustomerImpact} customers impacted. ${moduleConfig.advisorSpecialty}.`}
        linkedItems={items.slice(0, 3).map(i => i.title)}
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
              onApprove={() => toast.info("Recommendation noted")}
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
