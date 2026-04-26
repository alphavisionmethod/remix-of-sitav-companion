import { useState, useMemo } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import { QueueCard } from "@/platform/sita/components/sita/cards";
import { UrgencyBadge, ExecutionBadge } from "@/platform/sita/components/sita/badges";
import { HeroCard, SummaryCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import {
  Phone, Mail, Clock, AlertCircle, SkipForward, AlarmClock,
  FileText, DollarSign, Users, CheckCircle
} from "lucide-react";
import { FOLLOW_THROUGH_TAB_DATA as TAB_DATA, type QueueTab } from "./_config/FollowThroughCenter.config";

const FollowThroughCenter = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("follow-through", primaryMode);
  const [activeTab, setActiveTab] = useState<QueueTab>("callbacks");
  const tabData = TAB_DATA[activeTab];

  const totalItems = useMemo(() => Object.values(TAB_DATA).reduce((sum, t) => sum + t.items.length, 0), []);
  const totalValue = useMemo(() => Object.values(TAB_DATA).flatMap(t => t.items).reduce((sum, i) => sum + (i.value || 0), 0), []);

  const queueItems = tabData.items.map(item => ({
    id: item.id,
    label: `${item.name} · ${item.company}`,
    meta: item.value ? `$${item.value.toLocaleString()}` : undefined,
    urgency: item.urgency,
    badge: item.daysStale > 0 ? (
      <span className={cn("text-[9px] font-medium", item.daysStale >= 3 ? "text-[hsl(0_70%_55%)]" : "text-[hsl(38_85%_58%)]")}>
        {item.daysStale}d
      </span>
    ) : undefined,
  }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTruthBanner truthState="demo" />

      <HeroCard
        title={moduleConfig.title}
        metric={`${totalItems} open ${moduleConfig.terminology.thread?.toLowerCase() || "thread"}s`}
        subtitle={moduleConfig.subtitle}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(285 50% 48%)"
        icon={<Phone className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
      >
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency="critical" />
          <ExecutionBadge state="executing" />
        </div>
      </HeroCard>

      <SummaryCard
        title="Queue Summary"
        kpis={[
          { label: "Total Queue", value: String(totalItems) },
          { label: "At Risk Value", value: `$${totalValue.toLocaleString()}`, trend: "down" },
          { label: "Overdue", value: String(TAB_DATA.overdue.items.length + TAB_DATA["no-touch"].items.length), trend: "up" },
          { label: "Ready to Send", value: String(TAB_DATA.drafts.items.length) },
        ]}
      />

      <SitaTabs
        tabs={Object.entries(TAB_DATA).map(([key, data]) => ({
          key, label: data.label, count: data.items.length,
        }))}
        active={activeTab}
        onChange={(k) => setActiveTab(k as QueueTab)}
      />

      {queueItems.length === 0 ? (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
          <CheckCircle className="h-8 w-8 text-[hsl(152_55%_48%)] mx-auto mb-2" />
          <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>All clear</p>
          <p className={cn(SITA_TYPE.timelineMeta)}>No items in this queue</p>
        </div>
      ) : (
        <QueueCard
          title={tabData.label}
          items={queueItems}
          maxVisible={10}
        />
      )}
    </motion.div>
  );
};

export default FollowThroughCenter;
