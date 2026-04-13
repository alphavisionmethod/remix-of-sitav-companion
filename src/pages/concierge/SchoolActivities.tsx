import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState, RiskCard } from "@/components/sita/SitaComponents";
import { ConciergePageWrapper, ConciergeEmptyState } from "@/components/concierge";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { GraduationCap, Calendar, FileText, DollarSign, Bus, Users, AlertTriangle, CheckCircle, Clock, ClipboardList } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useSchoolActivities } from "@/hooks/use-concierge-data";

interface SchoolItem {
  id: string;
  title: string;
  child: string;
  school: string;
  category: "deadline" | "form" | "meeting" | "fee" | "volunteer" | "prep" | "transport";
  due: string;
  status: "pending" | "submitted" | "overdue" | "confirmed" | "upcoming";
  priority: "high" | "medium" | "low";
  notes?: string;
  amount?: number;
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

const categoryIcon = (cat: SchoolItem["category"]) => {
  const map = { deadline: Calendar, form: FileText, meeting: Users, fee: DollarSign, volunteer: Users, prep: ClipboardList, transport: Bus };
  return map[cat] || Calendar;
};

const statusColor = (s: SchoolItem["status"]) => {
  if (s === "overdue") return "text-destructive";
  if (s === "pending") return "text-amber-500";
  if (s === "confirmed" || s === "submitted") return "text-chart-2";
  return "text-muted-foreground";
};

const SchoolActivities = () => {
  const [view, setView] = useState("this-week");
  const overdue = schoolItems.filter(i => i.status === "overdue").length;
  const pending = schoolItems.filter(i => i.status === "pending").length;
  const totalFees = schoolItems.filter(i => i.amount).reduce((s, i) => s + (i.amount || 0), 0);

  const filtered = view === "overdue" ? schoolItems.filter(i => i.status === "overdue" || i.priority === "high")
    : view === "by-child" ? [...schoolItems].sort((a, b) => a.child.localeCompare(b.child))
    : view === "fees" ? schoolItems.filter(i => i.category === "fee" || i.amount)
    : schoolItems;

  return (
    <ConciergePageWrapper className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="School & Activities" subtitle="Forms, fees, meetings, prep, and logistics for every child" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Items This Week" value={String(schoolItems.length)} icon={GraduationCap} />
        <KPITile label="Overdue" value={String(overdue)} icon={AlertTriangle} sub={overdue > 0 ? "Needs attention" : "All clear"} />
        <KPITile label="Pending Action" value={String(pending)} icon={Clock} />
        <KPITile label="Fees Due" value={`$${totalFees.toLocaleString()}`} icon={DollarSign} sub="Next 30 days" />
      </div>

      {overdue > 0 && (
        <RiskCard title={`${overdue} overdue school item${overdue > 1 ? "s" : ""} — bus pass renewal needs immediate action`} severity="high" />
      )}

      <SitaTabs
        tabs={[
          { key: "this-week", label: "This Week" },
          { key: "overdue", label: "Urgent" },
          { key: "by-child", label: "By Child" },
          { key: "fees", label: "Fees & Costs" },
        ]}
        active={view}
        onChange={setView}
      />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <ConciergeEmptyState domain="school" icon={GraduationCap} />
        )}
        {filtered.map(item => {
          const Icon = categoryIcon(item.category);
          return (
            <SitaCard key={item.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{item.child}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{item.school}</span>
                    <span>·</span>
                    <span className={statusColor(item.status)}>{item.due}</span>
                    {item.amount && <span>· ${item.amount.toLocaleString()}</span>}
                  </div>
                  {item.notes && <p className="text-xs text-muted-foreground/70 mt-1">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TrustBadge level={item.status === "overdue" ? "high-impact" : item.status === "confirmed" || item.status === "submitted" ? "verified" : "review"} label={item.status} size="sm" />
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>

      {/* Advisor */}
      <SitaCard hover={false}>
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="h-4 w-4 text-primary" />
          <SitaCardTitle>School Advisor</SitaCardTitle>
          <TrustBadge level="verified" label="high" size="sm" />
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          Liam's bus pass is overdue — renew today to avoid transport disruption. Emma's field trip permission slip is due tomorrow.
          I recommend handling both today. Spring tuition can be scheduled for auto-pay if you'd like.
        </p>
      </SitaCard>
    </ConciergePageWrapper>
  );
};

export default SchoolActivities;
