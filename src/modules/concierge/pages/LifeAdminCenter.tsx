import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { ConciergePageWrapper } from "@/modules/concierge/components/concierge";
import {
  LIFE_ADMIN_RECURRING_DEMO, LIFE_ADMIN_SERVICE_DEMO, LIFE_ADMIN_FORMS_DEMO,
  LIFE_ADMIN_UPCOMING_DEMO, LIFE_ADMIN_AGING_DEMO, LIFE_ADMIN_BUNDLES_DEMO, LIFE_ADMIN_QUICK_WINS_DEMO,
  type AdminItem,
} from "@/data/fixtures/mock-data/concierge-life-admin-demo";
import { motion } from "framer-motion";
import { ModuleWorkspace } from "@/platform/sita/components/sita/domain-shared/ModuleWorkspace";
import { DomainAdvisorCard } from "@/platform/advisors/components/advisors/DomainAdvisorCard";
import { LifeAdminDetailPane } from "@/modules/concierge/components/concierge/LifeAdminDetailPane";
import { QueueCard, ActionCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { LifeAdminQueueCard } from "@/modules/concierge/components/concierge";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import {
  FileText, Calendar, Wrench, RefreshCw, Clock, CheckCircle,
  Shield, Phone, Timer, Package, ClipboardList
} from "lucide-react";
type AdminTab = "recurring" | "service" | "forms" | "upcoming" | "aging" | "bundles";


const TAB_DATA: Record<AdminTab, { items: AdminItem[]; label: string }> = {
  recurring: { items: [...LIFE_ADMIN_RECURRING_DEMO], label: "Recurring" },
  service: { items: [...LIFE_ADMIN_SERVICE_DEMO], label: "Follow-ups" },
  forms: { items: [...LIFE_ADMIN_FORMS_DEMO], label: "Forms" },
  upcoming: { items: [...LIFE_ADMIN_UPCOMING_DEMO], label: "Upcoming" },
  aging: { items: [...LIFE_ADMIN_AGING_DEMO], label: "Aging" },
  bundles: { items: [...LIFE_ADMIN_BUNDLES_DEMO], label: "Bundles" },
};

const urgencyMap = { high: "critical" as const, medium: "high" as const, low: "normal" as const };

const LifeAdminCenter = () => {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [activeTab, setActiveTab] = useState<AdminTab>("aging");

  if (!isDemo) {
    return (
      <ConciergePageWrapper className="space-y-6">
        <PageTruthBanner truthState="partial" />
        <PremiumEmptyState icon={ClipboardList} title={user ? "No life-admin items yet" : "Sign in to manage life admin"} description={user ? "Once a life-admin source is connected (forms, follow-ups, recurring obligations), prep items will appear here." : "Sign in and connect a life-admin source to populate this surface."} variant="first-use" domain="concierge" />
      </ConciergePageWrapper>
    );
  }
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tabData = TAB_DATA[activeTab];
  const allItems = useMemo(() => Object.values(TAB_DATA).flatMap(t => t.items), []);
  const totalAging = useMemo(() => allItems.filter(i => i.daysOverdue > 0).length, [allItems]);
  const selectedItem = allItems.find(i => i.id === selectedId) || null;

  const queueItems = tabData.items.map(item => ({
    id: item.id,
    label: item.title,
    meta: item.daysOverdue > 0 ? `${item.daysOverdue}d overdue` : item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
    urgency: urgencyMap[item.urgency],
  }));

  const listContent = (
    <div className="space-y-3">
      <PageTruthBanner truthState="demo" />

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: allItems.length, color: "text-[hsl(285_55%_65%)]" },
          { label: "Overdue", value: totalAging, color: "text-[hsl(0_70%_55%)]" },
          { label: "This Week", value: 3, color: "text-[hsl(38_85%_58%)]" },
          { label: "Recurring", value: ([] as any[]).length, color: "text-[hsl(265_55%_68%)]" },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-2 text-center">
            <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
            <p className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_45%)]")}>{s.label}</p>
          </div>
        ))}
      </div>

      <SitaTabs
        tabs={Object.entries(TAB_DATA).map(([key, data]) => ({ key, label: data.label, count: data.items.length }))}
        active={activeTab}
        onChange={(k) => { setActiveTab(k as AdminTab); setSelectedId(null); }}
      />

      <QueueCard
        title={tabData.label}
        items={queueItems}
        maxVisible={10}
        onItemClick={(id) => setSelectedId(id)}
      />

      <LifeAdminQueueCard items={[...LIFE_ADMIN_QUICK_WINS_DEMO]} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <ModuleWorkspace
        domain="concierge"
        title="Life Admin Center"
        icon={ClipboardList}
        list={listContent}
        detail={<LifeAdminDetailPane item={selectedItem} />}
        detailActive={!!selectedId}
        onCloseDetail={() => setSelectedId(null)}
        advisor={
          <DomainAdvisorCard
            domain="concierge"
            insights={[
              { id: "la-1", text: "3 items postponed > 1 week — phone calls session could clear 3 in 15 min", confidence: 85, action: "Start Calls", onAction: () => setSelectedId("lb1") },
              { id: "la-2", text: "Tax documents are the highest-impact item to resolve this week", confidence: 90, action: "View", onAction: () => setSelectedId("la13") },
            ]}
          />
        }
      />
    </motion.div>
  );
};

export default LifeAdminCenter;
