import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { ConciergeAdvisorInsightCard, EventPrepCard, ConciergePageWrapper, ConciergeEmptyState } from "@/components/concierge";
import type { EventPrep } from "@/components/concierge";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { useState } from "react";
import { Gift, Heart, Calendar, PartyPopper, Star, Clock, CheckCircle, ShoppingBag, Mail } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { useServiceProvidersList } from "@/hooks/use-concierge-data";

interface EventItem {
  id: string;
  title: string;
  who: string;
  date: string;
  category: "birthday" | "anniversary" | "social" | "holiday" | "thank-you" | "follow-up";
  giftStatus?: "idea" | "purchased" | "wrapped" | "sent" | "none";
  giftIdea?: string;
  budget?: number;
  prepItems: string[];
  status: "upcoming" | "prep-needed" | "handled" | "overdue";
  daysUntil: number;
}

const events: EventItem[] = [
  { id: "1", title: "Mom's birthday", who: "Mom", date: "Apr 14", category: "birthday", giftStatus: "idea", giftIdea: "Spa gift card + photo book", budget: 120, prepItems: ["Order photo book", "Buy card", "Make dinner reservation"], status: "prep-needed", daysUntil: 12 },
  { id: "2", title: "Max's birthday party (friend)", who: "Liam → Max", date: "This Sunday", category: "birthday", giftStatus: "purchased", giftIdea: "LEGO Space Set", budget: 35, prepItems: ["Wrap gift", "RSVP confirmed", "Drop-off at 3 PM"], status: "prep-needed", daysUntil: 4 },
  { id: "3", title: "Wedding anniversary", who: "You & Partner", date: "Apr 28", category: "anniversary", giftStatus: "none", prepItems: ["Book restaurant", "Arrange babysitter", "Gift ideas needed"], status: "upcoming", daysUntil: 26 },
  { id: "4", title: "Thank you — Johnsons (dinner party)", who: "Johnson family", date: "Overdue", category: "thank-you", giftStatus: "none", prepItems: ["Send thank you card or message"], status: "overdue", daysUntil: -3 },
  { id: "5", title: "School spring carnival", who: "Family", date: "Apr 15", category: "social", prepItems: ["Volunteer shift confirmed", "Bake cookies for booth"], status: "upcoming", daysUntil: 13 },
  { id: "6", title: "Neighbor's new baby", who: "Hendersons", date: "Apr 10", category: "follow-up", giftStatus: "idea", giftIdea: "Meal delivery gift card", budget: 50, prepItems: ["Order gift card", "Write congratulations card"], status: "prep-needed", daysUntil: 8 },
  { id: "7", title: "Father's Day", who: "Dad", date: "Jun 15", category: "holiday", giftStatus: "none", prepItems: [], status: "upcoming", daysUntil: 74 },
];

const catIcon = (c: EventItem["category"]) => {
  const m = { birthday: PartyPopper, anniversary: Heart, social: Star, holiday: Calendar, "thank-you": Mail, "follow-up": Heart };
  return m[c] || Gift;
};

const giftLabel = (s?: string) => {
  if (!s || s === "none") return null;
  const colors: Record<string, string> = { idea: "text-amber-500", purchased: "text-chart-2", wrapped: "text-chart-2", sent: "text-primary" };
  return <span className={`text-[10px] font-medium ${colors[s] || "text-muted-foreground"}`}>Gift: {s}</span>;
};

const EventsGifts = () => {
  const [view, setView] = useState("upcoming");
  const upcoming30 = events.filter(e => e.daysUntil > 0 && e.daysUntil <= 30).length;
  const needsPrep = events.filter(e => e.status === "prep-needed" || e.status === "overdue").length;
  const totalBudget = events.filter(e => e.budget).reduce((s, e) => s + (e.budget || 0), 0);

  const filtered = view === "prep" ? events.filter(e => e.status === "prep-needed" || e.status === "overdue")
    : view === "gifts" ? events.filter(e => e.giftStatus && e.giftStatus !== "none")
    : view === "milestones" ? events.filter(e => e.category === "birthday" || e.category === "anniversary" || e.category === "holiday")
    : view === "timeline" ? [...events].sort((a, b) => a.daysUntil - b.daysUntil)
    : view === "board" ? events.filter(e => e.prepItems.length > 0)
    : events;

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Next 30 Days" value={String(upcoming30)} icon={Calendar} />
        <KPITile label="Needs Prep" value={String(needsPrep)} icon={Gift} sub={needsPrep > 0 ? "Action needed" : "All set"} />
        <KPITile label="Gift Budget" value={`$${totalBudget}`} icon={ShoppingBag} sub="Upcoming gifts" />
        <KPITile label="Follow-ups" value={String(events.filter(e => e.category === "thank-you" || e.category === "follow-up").length)} icon={Heart} />
      </div>

      <SitaTabs
        tabs={[
          { key: "upcoming", label: "All Upcoming" },
          { key: "prep", label: "Needs Prep" },
          { key: "gifts", label: "Gift Tracker" },
          { key: "milestones", label: "Milestones" },
          { key: "timeline", label: "Prep Timeline" },
          { key: "board", label: "Planning Board" },
        ]}
        active={view}
        onChange={setView}
      />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <ConciergeEmptyState domain="events" icon={Gift} />
        )}
        {filtered.map(ev => {
          const Icon = catIcon(ev.category);
          return (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={ev.id} >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{ev.title}</p>
                      <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{ev.who}</span>
                    </div>
                    <TrustBadge level={ev.status === "overdue" ? "high-impact" : ev.status === "handled" ? "verified" : "review"} label={ev.daysUntil < 0 ? "overdue" : `${ev.daysUntil}d`} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{ev.date}</span>
                    {ev.budget && <span>Budget: ${ev.budget}</span>}
                    {giftLabel(ev.giftStatus)}
                  </div>
                  {ev.giftIdea && <p className="text-xs text-foreground/80">💡 {ev.giftIdea}</p>}
                  {ev.prepItems.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {ev.prepItems.map((p, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />{p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {view === "timeline" && (
        <div className="relative pl-6 space-y-3">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border/30" />
          {filtered.map(ev => (
            <div key={ev.id} className="relative">
              <div className={`absolute -left-3 top-2 h-3 w-3 rounded-full border-2 border-card ${ev.daysUntil <= 0 ? "bg-destructive" : ev.daysUntil <= 7 ? "bg-amber-500" : "bg-chart-2"}`} />
              <div className="rounded-xl bg-secondary/15 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{ev.title}</p>
                  <span className="text-[10px] text-muted-foreground">{ev.date}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ev.who} · {ev.prepItems.length} prep items</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {(view !== "timeline") && (
      <div className="space-y-3">
        {filtered.map(ev => {
          const Icon = catIcon(ev.category);
          return (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={ev.id} >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{ev.title}</p>
                      <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{ev.who}</span>
                    </div>
                    <TrustBadge level={ev.status === "overdue" ? "high-impact" : ev.status === "handled" ? "verified" : "review"} label={ev.daysUntil < 0 ? "overdue" : `${ev.daysUntil}d`} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{ev.date}</span>
                    {ev.budget && <span>Budget: ${ev.budget}</span>}
                    {giftLabel(ev.giftStatus)}
                  </div>
                  {ev.giftIdea && <p className="text-xs text-foreground/80">💡 {ev.giftIdea}</p>}
                  {ev.prepItems.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {ev.prepItems.map((p, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />{p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Event Prep Cards for planning board */}
      {view === "board" && (
        <div className="space-y-3 mt-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Event Prep Cards</h3>
          {filtered.map(ev => (
            <EventPrepCard key={ev.id} event={{
              id: ev.id,
              title: ev.title,
              who: ev.who,
              daysUntil: ev.daysUntil,
              giftStatus: ev.giftStatus as "idea" | "purchased" | "wrapped" | "sent" | undefined,
              giftIdea: ev.giftIdea,
              outstandingItems: ev.prepItems,
              linkedDocs: ev.category === "birthday" ? ["Gift receipt"] : [],
            }} />
          ))}
        </div>
      )}

      <ConciergeAdvisorInsightCard insight={{
        role: "Relationship Advisor",
        message: "You have an overdue thank-you to the Johnsons — a quick message today keeps the relationship warm. Mom's birthday is in 12 days; order the photo book this week to ensure delivery. Start brainstorming anniversary ideas — your partner values experiences over gifts.",
        linkedItems: ["Johnson thank-you", "Mom's photo book", "Anniversary planning"],
        confidence: "high",
      }} />
    </ConciergePageWrapper>
  );
};

export default EventsGifts;
