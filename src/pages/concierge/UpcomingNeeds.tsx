import { SitaPageHeader, SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { HouseholdAdvisor } from "@/components/sita/HouseholdComponents";
import { UpcomingObligationsCard, SupportBurdenCard, ConciergeReviewQueue } from "@/components/concierge";
import type { UpcomingObligation, ReviewItem } from "@/components/concierge";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, AlertCircle, Zap, Sparkles, Eye, CheckCircle, Plane, MapPin, FileText, RotateCcw
} from "lucide-react";

/* ── Demo Data ── */
const OBLIGATIONS: UpcomingObligation[] = [
  { id: "u1", title: "Dentist appointment — Alex", type: "appointment", dueLabel: "Today 2:30 PM", who: "Alex", prepNeeded: true },
  { id: "u2", title: "Drop off UPS package", type: "errand", dueLabel: "Today", who: "You" },
  { id: "u3", title: "Hotel check-in confirmation", type: "reservation", dueLabel: "Tomorrow", prepNeeded: true },
  { id: "u4", title: "Permission slip deadline", type: "admin", dueLabel: "Tomorrow", who: "Alex" },
  { id: "u5", title: "Lake Tahoe trip begins", type: "travel", dueLabel: "In 12 days", who: "Family" },
  { id: "u6", title: "Mortgage payment auto-draft", type: "recurring", dueLabel: "In 3 days" },
  { id: "u7", title: "Plumber follow-up call", type: "errand", dueLabel: "Overdue 4 days", who: "You" },
  { id: "u8", title: "Spring break flight check-in", type: "travel", dueLabel: "In 16 days" },
  { id: "u9", title: "HVAC annual inspection", type: "recurring", dueLabel: "Overdue 1 week" },
  { id: "u10", title: "Restaurant reservation — anniversary", type: "reservation", dueLabel: "In 5 days", who: "Partner" },
  { id: "u11", title: "Car oil change", type: "errand", dueLabel: "This week" },
  { id: "u12", title: "Renew parking permit", type: "admin", dueLabel: "In 10 days" },
];

const REVIEW_ITEMS: ReviewItem[] = [
  { id: "r1", title: "Weekly grocery auto-order", reason: "New items added — review before submit", urgency: "medium" },
  { id: "r2", title: "Pet sitter booking — $280", reason: "Spending over $200 policy", urgency: "high" },
  { id: "r3", title: "Reschedule dentist proposal", reason: "AI detected conflict with soccer match", urgency: "medium" },
];

type UpcomingView = "today" | "3-day" | "week" | "month" | "type" | "burden";

const groupByDay = (items: UpcomingObligation[], days: number) => {
  const labels = ["Today", "Tomorrow"];
  for (let i = 2; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    labels.push(d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
  }
  return labels;
};

const UpcomingNeeds = () => {
  const [view, setView] = useState<UpcomingView>("today");

  const todayItems = OBLIGATIONS.filter((o) => o.dueLabel.startsWith("Today") || o.dueLabel.startsWith("Overdue"));
  const threeDayItems = OBLIGATIONS.filter((o) => !o.dueLabel.includes("week") && !o.dueLabel.includes("10") && !o.dueLabel.includes("12") && !o.dueLabel.includes("16"));
  const needsHandling = OBLIGATIONS.filter((o) => o.dueLabel.includes("Overdue") || o.dueLabel.startsWith("Today") || o.dueLabel.startsWith("Tomorrow"));
  const canWait = OBLIGATIONS.filter((o) => !o.dueLabel.includes("Overdue") && !o.dueLabel.startsWith("Today") && !o.dueLabel.startsWith("Tomorrow"));

  const filterForView = () => {
    switch (view) {
      case "today": return todayItems;
      case "3-day": return threeDayItems;
      case "burden": return OBLIGATIONS;
      default: return OBLIGATIONS;
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Upcoming & Needs Handling" subtitle="One calm surface for everything that needs your attention" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Today" value={String(todayItems.length)} icon={Zap} sub="Need handling" />
        <KPITile label="This Week" value={String(OBLIGATIONS.length)} icon={Calendar} />
        <KPITile label="Overdue" value={String(OBLIGATIONS.filter((o) => o.dueLabel.includes("Overdue")).length)} icon={AlertCircle} sub="Slipping" />
        <KPITile label="Prep Needed" value={String(OBLIGATIONS.filter((o) => o.prepNeeded).length)} icon={Eye} />
      </div>

      <SitaTabs
        tabs={[
          { key: "today", label: "Today" },
          { key: "3-day", label: "Next 3 Days" },
          { key: "week", label: "This Week" },
          { key: "month", label: "This Month" },
          { key: "type", label: "By Type" },
          { key: "burden", label: "By Burden" },
        ]}
        active={view}
        onChange={(k) => setView(k as UpcomingView)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {view === "type" ? (
            <>
              {(["appointment", "errand", "travel", "admin", "recurring", "reservation"] as const).map((type) => {
                const items = OBLIGATIONS.filter((o) => o.type === type);
                if (items.length === 0) return null;
                return <UpcomingObligationsCard key={type} obligations={items} title={type.charAt(0).toUpperCase() + type.slice(1) + "s"} />;
              })}
            </>
          ) : view === "burden" ? (
            <>
              <SitaSectionHeader title="Needs Handling Soon" subtitle="Overdue or due today/tomorrow" />
              <UpcomingObligationsCard obligations={needsHandling} title="Urgent" />
              <SitaSectionHeader title="Can Wait" subtitle="No immediate action required" />
              <UpcomingObligationsCard obligations={canWait} title="Flexible" />
            </>
          ) : (
            <UpcomingObligationsCard obligations={filterForView()} title={
              view === "today" ? "Today's Obligations" :
              view === "3-day" ? "Next 3 Days" :
              view === "week" ? "This Week" : "This Month"
            } />
          )}
        </div>

        <div className="space-y-4">
          {/* Support Burden */}
          <SupportBurdenCard
            overall={58}
            categories={[
              { label: "Appointments", load: 40, trend: "flat" },
              { label: "Errands", load: 65, trend: "up" },
              { label: "Travel prep", load: 75, trend: "up" },
              { label: "Admin", load: 50, trend: "down" },
              { label: "Recurring", load: 30, trend: "flat" },
            ]}
            recommendation="Travel prep is driving most of the load. Handle the UPS drop-off and plumber call to free up mental space."
          />

          {/* Review Queue */}
          <ConciergeReviewQueue items={REVIEW_ITEMS} />

          {/* Advisor */}
          <HouseholdAdvisor
            role="Upcoming Advisor"
            icon={Sparkles}
            confidence="high"
            message="Alex's dentist appointment today needs the insurance card — check your wallet. The plumber follow-up is 4 days overdue and may lose the estimate window. Permission slip can be handled during school drop-off tomorrow."
            linkedItems={["Dentist prep", "Plumber follow-up", "Permission slip"]}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default UpcomingNeeds;
