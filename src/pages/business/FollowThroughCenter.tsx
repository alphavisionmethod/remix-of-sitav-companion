import { useState, useMemo } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import { QueueCard } from "@/components/sita/cards";
import { UrgencyBadge, ExecutionBadge } from "@/components/sita/badges";
import { HeroCard, SummaryCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import {
  Phone, Mail, Clock, AlertCircle, SkipForward, AlarmClock,
  FileText, DollarSign, Users, CheckCircle
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

type QueueTab = "callbacks" | "no-touch" | "waiting" | "drafts" | "overdue" | "recovery";

interface QueueItem {
  id: string; name: string; company: string; reason: string;
  daysStale: number; value?: number; channel: "phone" | "email" | "meeting";
  urgency: "critical" | "high" | "normal" | "low";
}

const DEMO_CALLBACKS: QueueItem[] = [
  { id: "cb1", name: "Sarah Chen", company: "Meridian Ventures", reason: "Quote follow-up — $2,500 website redesign", daysStale: 0, value: 2500, channel: "phone", urgency: "high" },
  { id: "cb2", name: "James Rodriguez", company: "Nordic Digital", reason: "Onboarding check-in — started last week", daysStale: 0, value: 4200, channel: "phone", urgency: "normal" },
  { id: "cb3", name: "Emily Watson", company: "Atlas Corp", reason: "No contact in 3 days — stale risk", daysStale: 3, value: 1800, channel: "phone", urgency: "critical" },
];

const DEMO_NOTOUCH: QueueItem[] = [
  { id: "nt1", name: "David Kim", company: "Pinnacle LLC", reason: "Lead from website form — never contacted", daysStale: 7, value: 3200, channel: "email", urgency: "high" },
  { id: "nt2", name: "Lisa Park", company: "Summit Labs", reason: "Referred by Sarah Chen — no outreach yet", daysStale: 5, value: 1500, channel: "email", urgency: "normal" },
];

const DEMO_WAITING: QueueItem[] = [
  { id: "w1", name: "Marcus Webb", company: "Atlas Corp", reason: "Proposal sent 4 days ago — no response", daysStale: 4, value: 8500, channel: "email", urgency: "normal" },
  { id: "w2", name: "Elena Rossi", company: "Vanguard Advisory", reason: "Contract sent for review — awaiting signature", daysStale: 2, value: 4500, channel: "email", urgency: "low" },
];

const DEMO_DRAFTS: QueueItem[] = [
  { id: "d1", name: "Michael Park", company: "Apex Solutions", reason: "Follow-up draft — web design inquiry", daysStale: 1, value: 2000, channel: "email", urgency: "normal" },
];

const DEMO_OVERDUE: QueueItem[] = [
  { id: "o1", name: "Karen Lee", company: "Bright Media", reason: "Scheduled call missed — reschedule needed", daysStale: 2, value: 3400, channel: "phone", urgency: "critical" },
  { id: "o2", name: "Tom Jenkins", company: "CoreTech", reason: "Follow-up overdue by 5 days", daysStale: 5, value: 6200, channel: "email", urgency: "high" },
];

const DEMO_RECOVERY: QueueItem[] = [
  { id: "r1", name: "Apex Corp", company: "Apex Corp", reason: "Quote expired 3 days ago — $3,200 recoverable", daysStale: 3, value: 3200, channel: "email", urgency: "normal" },
  { id: "r2", name: "Blue Ridge Co", company: "Blue Ridge Co", reason: "Lost deal 14 days ago — re-engage opportunity", daysStale: 14, value: 5800, channel: "phone", urgency: "low" },
];

const TAB_DATA: Record<QueueTab, { items: QueueItem[]; label: string }> = {
  callbacks: { items: DEMO_CALLBACKS, label: "Callbacks" },
  "no-touch": { items: DEMO_NOTOUCH, label: "No-Touch Leads" },
  waiting: { items: DEMO_WAITING, label: "Waiting on Reply" },
  drafts: { items: DEMO_DRAFTS, label: "Unsent Drafts" },
  overdue: { items: DEMO_OVERDUE, label: "Overdue Outreach" },
  recovery: { items: DEMO_RECOVERY, label: "Recovery" },
};

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
