// ═══════════════════════════════════════════════════════════════
// SITA OS — Events & Gifts (Honest-Degraded)
//
// Manifest classification: `degraded` (no events/gifting source
// hook wired into this surface). Live mode renders an honest empty
// queue. Demo mode (isDemo === true) renders the rich preview from
// `concierge-events-gifts-demo` fixtures.
// ═══════════════════════════════════════════════════════════════
import { KPITile, SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import {
  ConciergeAdvisorInsightCard,
  EventPrepCard,
  ConciergePageWrapper,
  ConciergeEmptyState,
} from "@/modules/concierge/components/concierge";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { useState } from "react";
import { Gift, Heart, Calendar, PartyPopper, Star, Mail, ShoppingBag } from "lucide-react";
import {
  EVENTS_GIFTS_DEMO,
  type EventItem,
} from "@/data/fixtures/mock-data/concierge-events-gifts-demo";

const catIcon = (c: EventItem["category"]) => {
  const m = { birthday: PartyPopper, anniversary: Heart, social: Star, holiday: Calendar, "thank-you": Mail, "follow-up": Heart };
  return m[c] || Gift;
};

const giftLabel = (s?: string) => {
  if (!s || s === "none") return null;
  const colors: Record<string, string> = {
    idea: "text-amber-500",
    purchased: "text-chart-2",
    wrapped: "text-chart-2",
    sent: "text-primary",
  };
  return <span className={`text-[10px] font-medium ${colors[s] || "text-muted-foreground"}`}>Gift: {s}</span>;
};

const EventsGifts = () => {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [view, setView] = useState("upcoming");

  // ── Live mode: render an honest empty queue ────────────────────
  if (!isDemo) {
    return (
      <ConciergePageWrapper className="space-y-6">
        <PageTruthBanner truthState="partial" />
        <PremiumEmptyState
          icon={Gift}
          title={user ? "No events or gifts tracked yet" : "Sign in to track events & gifts"}
          description={
            user
              ? "Once an events/gifting source is connected (calendar, contacts, gifting list), upcoming birthdays, anniversaries and prep items will appear here."
              : "Sign in and connect a calendar or contacts source to populate upcoming events and gifting prep."
          }
          variant="first-use"
          domain="concierge"
        />
      </ConciergePageWrapper>
    );
  }

  // ── Demo mode: rich preview ────────────────────────────────────
  const events = EVENTS_GIFTS_DEMO;
  const upcoming30 = events.filter((e) => e.daysUntil > 0 && e.daysUntil <= 30).length;
  const needsPrep = events.filter((e) => e.status === "prep-needed" || e.status === "overdue").length;
  const totalBudget = events.filter((e) => e.budget).reduce((s, e) => s + (e.budget || 0), 0);

  const filtered =
    view === "prep"
      ? events.filter((e) => e.status === "prep-needed" || e.status === "overdue")
      : view === "gifts"
      ? events.filter((e) => e.giftStatus && e.giftStatus !== "none")
      : view === "milestones"
      ? events.filter((e) => e.category === "birthday" || e.category === "anniversary" || e.category === "holiday")
      : view === "timeline"
      ? [...events].sort((a, b) => a.daysUntil - b.daysUntil)
      : view === "board"
      ? events.filter((e) => e.prepItems.length > 0)
      : [...events];

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner truthState="demo" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Next 30 Days" value={String(upcoming30)} icon={Calendar} />
        <KPITile label="Needs Prep" value={String(needsPrep)} icon={Gift} sub={needsPrep > 0 ? "Action needed" : "All set"} />
        <KPITile label="Gift Budget" value={`$${totalBudget}`} icon={ShoppingBag} sub="Upcoming gifts" />
        <KPITile
          label="Follow-ups"
          value={String(events.filter((e) => e.category === "thank-you" || e.category === "follow-up").length)}
          icon={Heart}
        />
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
        {filtered.length === 0 && <ConciergeEmptyState domain="events" icon={Gift} />}
        {view !== "timeline" &&
          filtered.map((ev) => {
            const Icon = catIcon(ev.category);
            return (
              <div
                key={ev.id}
                className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{ev.title}</p>
                        <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">
                          {ev.who}
                        </span>
                      </div>
                      <TrustBadge
                        level={ev.status === "overdue" ? "high-impact" : ev.status === "handled" ? "verified" : "review"}
                        label={ev.daysUntil < 0 ? "overdue" : `${ev.daysUntil}d`}
                        size="sm"
                      />
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
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                            {p}
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
          {filtered.map((ev) => (
            <div key={ev.id} className="relative">
              <div
                className={`absolute -left-3 top-2 h-3 w-3 rounded-full border-2 border-card ${
                  ev.daysUntil <= 0 ? "bg-destructive" : ev.daysUntil <= 7 ? "bg-amber-500" : "bg-chart-2"
                }`}
              />
              <div className="rounded-xl bg-secondary/15 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{ev.title}</p>
                  <span className="text-[10px] text-muted-foreground">{ev.date}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {ev.who} · {ev.prepItems.length} prep items
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "board" && (
        <div className="space-y-3 mt-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">
            Event Prep Cards
          </h3>
          {filtered.map((ev) => (
            <EventPrepCard
              key={ev.id}
              event={{
                id: ev.id,
                title: ev.title,
                who: ev.who,
                daysUntil: ev.daysUntil,
                giftStatus: ev.giftStatus as "idea" | "purchased" | "wrapped" | "sent" | undefined,
                giftIdea: ev.giftIdea,
                outstandingItems: [...ev.prepItems],
                linkedDocs: ev.category === "birthday" ? ["Gift receipt"] : [],
              }}
            />
          ))}
        </div>
      )}

      <ConciergeAdvisorInsightCard
        insight={{
          role: "Relationship Advisor",
          message:
            "You have an overdue thank-you to the Johnsons — a quick message today keeps the relationship warm. Mom's birthday is in 12 days; order the photo book this week to ensure delivery. Start brainstorming anniversary ideas — your partner values experiences over gifts.",
          linkedItems: ["Johnson thank-you", "Mom's photo book", "Anniversary planning"],
          confidence: "high",
        }}
      />
    </ConciergePageWrapper>
  );
};

export default EventsGifts;
