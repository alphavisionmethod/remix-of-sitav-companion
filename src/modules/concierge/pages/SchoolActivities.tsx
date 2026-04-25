import { HeroCard, QueueCard, StatusCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { SlidePanel } from "@/components/sita/surfaces/SlidePanel";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { ConciergePageWrapper } from "@/components/concierge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { GraduationCap, Calendar, FileText, DollarSign, Bus, Users, AlertTriangle, Clock, ClipboardList } from "lucide-react";

interface SchoolItem {
  id: string; title: string; child: string; school: string;
  category: "deadline" | "form" | "meeting" | "fee" | "volunteer" | "prep" | "transport";
  due: string; status: "pending" | "submitted" | "overdue" | "confirmed" | "upcoming";
  priority: "high" | "medium" | "low"; notes?: string; amount?: number;
}

const schoolItems: SchoolItem[] = [
  { id: "1", title: "Permission slip — Field trip to Science Museum", child: "Emma", school: "Lincoln Elementary", category: "form", due: "Tomorrow", status: "pending", priority: "high", notes: "Needs parent signature" },
  { id: "2", title: "Spring tuition payment", child: "Liam", school: "Westside Academy", category: "fee", due: "Apr 5", status: "pending", priority: "high", amount: 2400 },
  { id: "3", title: "Parent-teacher conference", child: "Emma", school: "Lincoln Elementary", category: "meeting", due: "Next Tuesday 9 AM", status: "confirmed", priority: "medium" },
  { id: "4", title: "Soccer uniform order", child: "Emma", school: "Lincoln Elementary", category: "prep", due: "Apr 8", status: "pending", priority: "medium", amount: 65 },
  { id: "5", title: "Science fair project materials", child: "Liam", school: "Westside Academy", category: "prep", due: "Apr 12", status: "upcoming", priority: "medium", notes: "Poster board, markers, battery kit" },
  { id: "6", title: "Volunteer sign-up — Spring carnival", child: "Both", school: "Lincoln Elementary", category: "volunteer", due: "Apr 15", status: "pending", priority: "low" },
  { id: "7", title: "Bus pass renewal", child: "Liam", school: "Westside Academy", category: "transport", due: "Apr 1", status: "overdue", priority: "high", amount: 45 },
  { id: "8", title: "Annual health form", child: "Emma", school: "Lincoln Elementary", category: "form", due: "Apr 20", status: "upcoming", priority: "low", notes: "Needs updated immunization record" },
];

const urgencyMap: Record<string, "critical" | "high" | "normal" | "low"> = {
  high: "critical", medium: "high", low: "normal",
};

const SchoolActivities = () => {
  const [view, setView] = useState("this-week");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const overdue = schoolItems.filter(i => i.status === "overdue").length;
  const pending = schoolItems.filter(i => i.status === "pending").length;
  const totalFees = schoolItems.filter(i => i.amount).reduce((s, i) => s + (i.amount || 0), 0);

  const filtered = view === "overdue" ? schoolItems.filter(i => i.status === "overdue" || i.priority === "high")
    : view === "by-child" ? [...schoolItems].sort((a, b) => a.child.localeCompare(b.child))
    : view === "fees" ? schoolItems.filter(i => i.category === "fee" || i.amount)
    : schoolItems;

  const selected = schoolItems.find(i => i.id === selectedId);
  const handleSelect = (id: string) => { setSelectedId(id); setPanelOpen(true); };

  const queueItems = filtered.map(item => ({
    id: item.id,
    label: `${item.title} — ${item.child}`,
    meta: item.due,
    urgency: urgencyMap[item.priority] || "normal" as const,
  }));

  return (
    <ConciergePageWrapper className="space-y-5">
      <PageTruthBanner truthState="demo" />

      <HeroCard
        title="School & Activities"
        metric={`${schoolItems.length} items`}
        subtitle="Forms, fees, meetings, prep, and logistics for every child"
        accentFrom="hsl(285 55% 55%)"
        accentTo="hsl(310 50% 48%)"
        icon={<GraduationCap className="h-5 w-5 text-[hsl(285_55%_65%)]" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="This Week" status="healthy" lastChecked={`${schoolItems.length}`} icon={<GraduationCap className="h-3.5 w-3.5" />} />
        <StatusCard label="Overdue" status={overdue > 0 ? "down" : "healthy"} lastChecked={`${overdue}`} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
        <StatusCard label="Pending" status={pending > 0 ? "degraded" : "healthy"} lastChecked={`${pending}`} icon={<Clock className="h-3.5 w-3.5" />} />
        <StatusCard label="Fees Due" status="healthy" lastChecked={`$${totalFees.toLocaleString()}`} icon={<DollarSign className="h-3.5 w-3.5" />} />
      </div>

      <SitaTabs
        tabs={[
          { key: "this-week", label: "This Week" },
          { key: "overdue", label: "Urgent", count: overdue },
          { key: "by-child", label: "By Child" },
          { key: "fees", label: "Fees & Costs" },
        ]}
        active={view}
        onChange={setView}
      />

      {filtered.length === 0 ? (
        <PremiumEmptyState icon={GraduationCap} title="No school items" description="Nothing in this category" variant="no-results" domain="concierge" />
      ) : (
        <QueueCard title="SCHOOL QUEUE" items={queueItems} maxVisible={10} onItemClick={handleSelect} />
      )}

      <ModuleAdvisorInsight
        advisorName="School Advisor"
        domain="concierge"
        confidence={92}
        insight="Liam's bus pass is overdue — renew today to avoid transport disruption. Emma's field trip permission slip is due tomorrow. Spring tuition can be scheduled for auto-pay."
        linkedItems={["Bus pass renewal", "Permission slip", "Spring tuition"]}
      />

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={selected?.title || "School Item"} width={380}>
        {selected && (
          <div className="space-y-4">
            <AppSurface level={2} className="p-3 space-y-2">
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Child</span><span className="text-[hsl(0_0%_85%)]">{selected.child}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">School</span><span className="text-[hsl(0_0%_85%)]">{selected.school}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Due</span><span className={cn(selected.status === "overdue" ? "text-[hsl(0_70%_55%)]" : "text-[hsl(0_0%_85%)]")}>{selected.due}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Status</span><span className="text-[hsl(0_0%_85%)] capitalize">{selected.status}</span></div>
              {selected.amount && <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Cost</span><span className="text-[hsl(0_0%_85%)]">${selected.amount.toLocaleString()}</span></div>}
            </AppSurface>
            {selected.notes && (
              <AppSurface level={2} className="p-3">
                <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider mb-1">Notes</p>
                <p className="text-[11px] text-[hsl(0_0%_65%)]">{selected.notes}</p>
              </AppSurface>
            )}
            <button className="w-full px-3 py-2 rounded-lg bg-[hsl(285_55%_55%)] text-foreground text-[11px] font-medium hover:bg-[hsl(285_55%_48%)] transition-colors micro-press">
              Mark Complete
            </button>
          </div>
        )}
      </SlidePanel>
    </ConciergePageWrapper>
  );
};

export default SchoolActivities;
