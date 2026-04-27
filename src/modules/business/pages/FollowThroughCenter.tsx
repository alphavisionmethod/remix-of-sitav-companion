import { useState, useMemo } from "react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
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
  FileText, DollarSign, Users, CheckCircle, Inbox, LogIn
} from "lucide-react";
import { type QueueTab } from "./_config/FollowThroughCenter.config";
import { useFollowThroughQueues } from "@/modules/business/hooks/use-follow-through-queues";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";

const FollowThroughCenter = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("follow-through", primaryMode);
  const [activeTab, setActiveTab] = useState<QueueTab>("callbacks");
  const { queues, isDemo, isUnauthenticated, isLoading } = useFollowThroughQueues();
  const tabData = queues[activeTab];

  const totalItems = useMemo(() => Object.values(queues).reduce((sum, t) => sum + t.items.length, 0), [queues]);
  const totalValue = useMemo(() => Object.values(queues).flatMap(t => t.items).reduce((sum, i) => sum + (i.value || 0), 0), [queues]);

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

  // Honest unauth state in live mode.
  if (isUnauthenticated && !isDemo) {
    return (
      <div className="space-y-4">
        <PageTruthBanner />
        <EmptyStateCard
          icon={LogIn}
          title="Sign in to view follow-through queues"
          description="The Follow-Through Center surfaces real callbacks, no-touch leads, waiting replies, and overdue outreach scoped to your account. Switch to Demo mode to explore the workspace with sample data."
          ctaLabel="Open sign-in"
          ctaPath="/auth"
        />
      </div>
    );
  }

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTruthBanner truthState={isDemo ? "demo" : "live"} />

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
          { label: "Overdue", value: String(queues.overdue.items.length + queues["no-touch"].items.length), trend: "up" },
          { label: "Ready to Send", value: String(queues.drafts.items.length) },
        ]}
      />

      <SitaTabs
        tabs={(Object.entries(queues) as [QueueTab, { label: string; items: unknown[] }][]).map(([key, data]) => ({
          key, label: data.label, count: data.items.length,
        }))}
        active={activeTab}
        onChange={(k) => setActiveTab(k as QueueTab)}
      />

      {isLoading ? (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
          <p className={cn(SITA_TYPE.timelineMeta)}>Loading queues…</p>
        </div>
      ) : queueItems.length === 0 ? (
        !isDemo && totalItems === 0 ? (
          <EmptyStateCard
            icon={Inbox}
            title="No follow-through items yet"
            description="The Follow-Through Center populates from real callback, support, and lead activity tied to your account. Items are added when the system detects stale leads, missed callbacks, or open support cases."
          />
        ) : (
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
            <CheckCircle className="h-8 w-8 text-[hsl(152_55%_48%)] mx-auto mb-2" />
            <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>All clear</p>
            <p className={cn(SITA_TYPE.timelineMeta)}>No items in this queue</p>
          </div>
        )
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
