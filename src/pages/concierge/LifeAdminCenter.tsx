import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { LifeAdminQueueCard, ConciergeAdvisorInsightCard, ConciergePageWrapper } from "@/components/concierge";
import type { AdminQueueItem } from "@/components/concierge";
import {
  FileText, Calendar, Wrench, RefreshCw, Clock, AlertCircle, CheckCircle,
  Shield, Phone, Mail, ArrowRight, Timer, Zap, Package
} from "lucide-react";

type AdminTab = "recurring" | "service" | "forms" | "upcoming" | "aging" | "bundles";

interface AdminItem {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  daysOverdue: number;
  frequency?: string;
  linkedTo?: string;
  urgency: "high" | "medium" | "low";
}

const DEMO_RECURRING: AdminItem[] = [
  { id: "la1", title: "Car insurance renewal review", category: "Insurance", dueDate: "2026-04-28", daysOverdue: 0, frequency: "Annual", urgency: "medium" },
  { id: "la2", title: "Water filter replacement", category: "Home", dueDate: "2026-04-15", daysOverdue: 0, frequency: "Quarterly", urgency: "low" },
  { id: "la3", title: "Passport renewal — expires Aug 2026", category: "Documents", dueDate: "2026-06-01", daysOverdue: 0, frequency: "Every 10 years", urgency: "medium" },
  { id: "la4", title: "Annual HVAC inspection", category: "Home", dueDate: "2026-05-10", daysOverdue: 0, frequency: "Annual", urgency: "low" },
];

const DEMO_SERVICE: AdminItem[] = [
  { id: "la5", title: "Follow up with plumber on kitchen leak estimate", category: "Home Repair", daysOverdue: 4, urgency: "high" },
  { id: "la6", title: "Request lawn service spring schedule", category: "Landscaping", daysOverdue: 2, urgency: "medium" },
  { id: "la7", title: "Confirm pet sitter for spring break", category: "Pet Care", daysOverdue: 0, linkedTo: "Spring Break Trip", urgency: "high" },
];

const DEMO_FORMS: AdminItem[] = [
  { id: "la8", title: "School field trip permission slip", category: "School", dueDate: "2026-04-14", daysOverdue: 0, urgency: "high" },
  { id: "la9", title: "Health insurance claim submission", category: "Insurance", daysOverdue: 6, urgency: "medium" },
  { id: "la10", title: "Vehicle registration renewal form", category: "Documents", dueDate: "2026-04-30", daysOverdue: 0, urgency: "low" },
];

const DEMO_UPCOMING: AdminItem[] = [
  { id: "la11", title: "Dentist appointment — bring insurance card", category: "Health", dueDate: "2026-04-16", daysOverdue: 0, linkedTo: "Dentist Visit", urgency: "medium" },
  { id: "la12", title: "School parent-teacher conference prep", category: "School", dueDate: "2026-04-18", daysOverdue: 0, urgency: "low" },
];

const DEMO_AGING: AdminItem[] = [
  { id: "la13", title: "Organize tax documents for accountant", category: "Tax", daysOverdue: 12, urgency: "high" },
  { id: "la14", title: "Clean out garage — postponed 3 times", category: "Home", daysOverdue: 21, urgency: "medium" },
  { id: "la15", title: "Update emergency contacts at school", category: "School", daysOverdue: 8, urgency: "low" },
];

const DEMO_BUNDLES: AdminItem[] = [
  { id: "lb1", title: "Phone calls session — plumber, vet, insurance", category: "Calls", daysOverdue: 0, urgency: "medium" },
  { id: "lb2", title: "School paperwork batch — permission slip, health forms, emergency contacts", category: "School", daysOverdue: 0, urgency: "high" },
  { id: "lb3", title: "Online admin — insurance claim, vehicle registration, tax docs upload", category: "Digital", daysOverdue: 2, urgency: "medium" },
];

const TAB_DATA: Record<AdminTab, { items: AdminItem[]; label: string; icon: typeof FileText }> = {
  recurring: { items: DEMO_RECURRING, label: "Recurring", icon: RefreshCw },
  service: { items: DEMO_SERVICE, label: "Service Follow-ups", icon: Phone },
  forms: { items: DEMO_FORMS, label: "Forms & Docs", icon: FileText },
  upcoming: { items: DEMO_UPCOMING, label: "Upcoming Linked", icon: Calendar },
  aging: { items: DEMO_AGING, label: "Aging Items", icon: Timer },
  bundles: { items: DEMO_BUNDLES, label: "One Sitting", icon: Package },
};

const urgencyDot = { high: "bg-destructive", medium: "bg-amber-500", low: "bg-chart-2" };
const categoryIcon: Record<string, typeof FileText> = {
  Insurance: Shield, Home: Wrench, Documents: FileText, "Home Repair": Wrench,
  Landscaping: Wrench, "Pet Care": Wrench, School: FileText, Health: FileText, Tax: FileText,
};

const AdminCard = ({ item }: { item: AdminItem }) => {
  const Icon = categoryIcon[item.category] || FileText;
  return (
    <motion.div
      className="flex items-center gap-3 rounded-xl border border-border/20 bg-secondary/15 px-4 py-3 hover:bg-secondary/30 transition-colors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${urgencyDot[item.urgency]}`} />
      <div className="rounded-xl bg-accent/10 p-2 shrink-0">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground truncate">{item.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{item.category}</span>
          {item.frequency && (
            <span className="text-[9px] text-primary font-medium">{item.frequency}</span>
          )}
          {item.linkedTo && (
            <span className="text-[9px] text-accent font-medium">→ {item.linkedTo}</span>
          )}
        </div>
        {item.daysOverdue > 0 && (
          <span className={`text-[9px] font-medium ${item.daysOverdue >= 7 ? "text-destructive" : "text-amber-500"}`}>
            {item.daysOverdue}d overdue
          </span>
        )}
        {item.dueDate && item.daysOverdue === 0 && (
          <span className="text-[9px] text-muted-foreground">Due {item.dueDate}</span>
        )}
      </div>
      <button className="shrink-0 rounded-lg p-2 hover:bg-primary/10 transition-colors">
        <CheckCircle className="h-4 w-4 text-muted-foreground hover:text-chart-2" />
      </button>
    </motion.div>
  );
};

const LifeAdminCenter = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("aging");

  const tabData = TAB_DATA[activeTab];
  const totalAging = useMemo(() => Object.values(TAB_DATA).flatMap(t => t.items).filter(i => i.daysOverdue > 0).length, []);

  return (
    <ConciergePageWrapper className="space-y-5">
      <DemoModeBadge />
      <SitaPageHeader
        title="Life Admin Center"
        subtitle="The things that usually get postponed — tracked and surfaced"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Items", value: Object.values(TAB_DATA).flatMap(t => t.items).length, color: "text-accent" },
          { label: "Overdue", value: totalAging, color: "text-destructive" },
          { label: "Due This Week", value: 3, color: "text-amber-500" },
          { label: "Recurring Active", value: DEMO_RECURRING.length, color: "text-primary" },
        ].map(s => (
          <GlassCard key={s.label} glow="none" className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      <SitaTabs
        tabs={Object.entries(TAB_DATA).map(([key, data]) => ({
          key,
          label: data.label,
          count: data.items.length,
        }))}
        active={activeTab}
        onChange={(k) => setActiveTab(k as AdminTab)}
      />

      <div className="space-y-2">
        {tabData.items.length === 0 ? (
          <GlassCard glow="none" className="p-12 text-center">
            <CheckCircle className="h-9 w-9 text-chart-2 mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">All clear — no admin lurking</p>
            <p className="text-sm text-muted-foreground mt-1">Enjoy the calm. We'll surface things when they come up.</p>
          </GlassCard>
        ) : (
          tabData.items.map(item => <AdminCard key={item.id} item={item} />)
        )}
      </div>

      {/* Quick Win Admin Queue */}
      <LifeAdminQueueCard items={[
        { id: "qw1", title: "Update school emergency contacts", category: "School", urgency: "low", effort: "quick" },
        { id: "qw2", title: "Submit insurance claim photo", category: "Insurance", urgency: "medium", effort: "quick" },
        { id: "qw3", title: "Set up autopay for lawn service", category: "Home", urgency: "low", effort: "quick" },
      ]} />

      {/* Advisor */}
      <ConciergeAdvisorInsightCard insight={{
        role: "Life Admin Advisor",
        message: "You have 3 items that have been postponed more than a week. The phone calls session could knock out 3 follow-ups in 15 minutes. Tax documents are the highest-impact item to resolve this week.",
        linkedItems: ["Tax documents", "Phone calls session", "School paperwork"],
        confidence: "high",
      }} />
    </ConciergePageWrapper>
  );
};

export default LifeAdminCenter;
