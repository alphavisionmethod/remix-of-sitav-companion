import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ModuleWorkspace } from "@/components/sita/domain-shared/ModuleWorkspace";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { LifeAdminDetailPane } from "@/components/concierge/LifeAdminDetailPane";
import { QueueCard, ActionCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { LifeAdminQueueCard } from "@/components/concierge";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import {
  FileText, Calendar, Wrench, RefreshCw, Clock, CheckCircle,
  Shield, Phone, Timer, Package, ClipboardList
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

type AdminTab = "recurring" | "service" | "forms" | "upcoming" | "aging" | "bundles";

interface AdminItem {
  id: string; title: string; category: string; dueDate?: string;
  daysOverdue: number; frequency?: string; linkedTo?: string;
  urgency: "high" | "medium" | "low";
}

const DEMO_RECURRING: AdminItem[] = [
  { id: "la1", title: "Car insurance renewal review", category: "Insurance", dueDate: "2026-04-28", daysOverdue: 0, frequency: "Annual", urgency: "medium" },
  { id: "la2", title: "Water filter replacement", category: "Home", dueDate: "2026-04-15", daysOverdue: 0, frequency: "Quarterly", urgency: "low" },
  { id: "la3", title: "Passport renewal — expires Aug 2026", category: "Documents", dueDate: "2026-06-01", daysOverdue: 0, frequency: "Every 10 years", urgency: "medium" },
  { id: "la4", title: "Annual HVAC inspection", category: "Home", dueDate: "2026-05-10", daysOverdue: 0, frequency: "Annual", urgency: "low" },
];

const DEMO_SERVICE: AdminItem[] = [
  { id: "la5", title: "Follow up with plumber on kitchen leak", category: "Home Repair", daysOverdue: 4, urgency: "high" },
  { id: "la6", title: "Request lawn service spring schedule", category: "Landscaping", daysOverdue: 2, urgency: "medium" },
  { id: "la7", title: "Confirm pet sitter for spring break", category: "Pet Care", daysOverdue: 0, linkedTo: "Spring Break Trip", urgency: "high" },
];

const DEMO_FORMS: AdminItem[] = [
  { id: "la8", title: "School field trip permission slip", category: "School", dueDate: "2026-04-14", daysOverdue: 0, urgency: "high" },
  { id: "la9", title: "Health insurance claim submission", category: "Insurance", daysOverdue: 6, urgency: "medium" },
  { id: "la10", title: "Vehicle registration renewal form", category: "Documents", dueDate: "2026-04-30", daysOverdue: 0, urgency: "low" },
];

const DEMO_UPCOMING: AdminItem[] = [
  { id: "la11", title: "Dentist — bring insurance card", category: "Health", dueDate: "2026-04-16", daysOverdue: 0, urgency: "medium" },
  { id: "la12", title: "Parent-teacher conference prep", category: "School", dueDate: "2026-04-18", daysOverdue: 0, urgency: "low" },
];

const DEMO_AGING: AdminItem[] = [
  { id: "la13", title: "Organize tax documents", category: "Tax", daysOverdue: 12, urgency: "high" },
  { id: "la14", title: "Clean out garage — postponed 3x", category: "Home", daysOverdue: 21, urgency: "medium" },
  { id: "la15", title: "Update emergency contacts at school", category: "School", daysOverdue: 8, urgency: "low" },
];

const DEMO_BUNDLES: AdminItem[] = [
  { id: "lb1", title: "Phone calls — plumber, vet, insurance", category: "Calls", daysOverdue: 0, urgency: "medium" },
  { id: "lb2", title: "School paperwork batch", category: "School", daysOverdue: 0, urgency: "high" },
  { id: "lb3", title: "Online admin — claim, registration, tax upload", category: "Digital", daysOverdue: 2, urgency: "medium" },
];

const TAB_DATA: Record<AdminTab, { items: AdminItem[]; label: string }> = {
  recurring: { items: DEMO_RECURRING, label: "Recurring" },
  service: { items: DEMO_SERVICE, label: "Follow-ups" },
  forms: { items: DEMO_FORMS, label: "Forms" },
  upcoming: { items: DEMO_UPCOMING, label: "Upcoming" },
  aging: { items: DEMO_AGING, label: "Aging" },
  bundles: { items: DEMO_BUNDLES, label: "Bundles" },
};

const urgencyMap = { high: "critical" as const, medium: "high" as const, low: "normal" as const };

const LifeAdminCenter = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("aging");
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
          { label: "Recurring", value: ([] as typeof DEMO_RECURRING).length, color: "text-[hsl(265_55%_68%)]" },
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

      <LifeAdminQueueCard items={[
        { id: "qw1", title: "Update school emergency contacts", category: "School", urgency: "low", effort: "quick" },
        { id: "qw2", title: "Submit insurance claim photo", category: "Insurance", urgency: "medium", effort: "quick" },
        { id: "qw3", title: "Set up autopay for lawn service", category: "Home", urgency: "low", effort: "quick" },
      ]} />
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
