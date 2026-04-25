import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { CalendarEventCard, ConflictCard, PrepCard, MemberAvatar } from "@/components/sita/HouseholdComponents";
import { ConciergeAdvisorInsightCard, ConciergePageWrapper } from "@/components/concierge";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, MapPin, AlertCircle, Heart, GraduationCap, Dumbbell, Stethoscope, Wrench, Car, Sparkles } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
const events: any[] = [];
const conflicts: any[] = [];
const prepItems: any[] = [];
const transportDuties: any[] = [];
const familyMembers: any[] = [];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = 2;

type CalendarView = "week" | "day" | "family" | "conflicts" | "prep" | "transport";

const FamilyCalendar = () => {
  const [view, setView] = useState<CalendarView>("week");

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Events This Week" value={String(([] as typeof events).length)} icon={Calendar} />
        <KPITile label="Family Members" value="4" icon={Users} />
        <KPITile label="Conflicts" value={String(([] as typeof conflicts).length)} icon={AlertCircle} sub="Needs resolution" />
        <KPITile label="Prep Items" value={String(([] as typeof prepItems).length)} icon={Clock} sub="Before events" />
        <KPITile label="Transport Duties" value={String(([] as typeof transportDuties).length)} icon={Car} sub="This week" />
      </div>

      <SitaTabs
        tabs={[
          { key: "week", label: "Week" },
          { key: "day", label: "Day" },
          { key: "family", label: "Family Grid" },
          { key: "conflicts", label: "Conflicts" },
          { key: "prep", label: "Prep View" },
          { key: "transport", label: "Transport" },
        ]}
        active={view}
        onChange={(k) => setView(k as CalendarView)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Week Strip */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">This Week</h4>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => {
                const dayEvents = ([] as typeof events).filter((_, ei) => ei % 7 === i).length;
                return (
                  <div key={day} className={`rounded-xl p-3 text-center transition-colors cursor-pointer hover:bg-secondary/60 ${i === today ? "bg-primary/10 ring-1 ring-primary/30" : "bg-secondary/30"}`}>
                    <p className={`text-[10px] font-medium ${i === today ? "text-primary" : "text-muted-foreground"}`}>{day}</p>
                    <p className={`text-lg font-semibold mt-0.5 ${i === today ? "text-primary" : "text-foreground"}`}>{14 + i}</p>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {Array.from({ length: Math.min(dayEvents, 3) }).map((_, di) => (
                        <div key={di} className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflicts */}
          {(view === "week" || view === "conflicts") && ([] as typeof conflicts).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Schedule Conflicts</h3>
              {([] as typeof conflicts).map((c, i) => (
                <ConflictCard key={i} events={c.events} resolution={c.resolution} />
              ))}
            </div>
          )}

          {/* Events or Prep or Transport */}
          {(view === "week" || view === "day" || view === "family") && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Upcoming Events</h3>
              {([] as typeof events).map((e) => (
                <CalendarEventCard
                  key={e.id} title={e.title} time={e.time} who={e.who} location={e.location}
                  category={e.category} conflict={e.conflict} owner={e.owner} transportTime={e.transportTime}
                  prep={e.prep}
                />
              ))}
            </div>
          )}

          {view === "prep" && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Preparation Checklists</h3>
              {([] as typeof prepItems).map((p, i) => (
                <PrepCard key={i} title={p.title} linkedEvent={p.linkedEvent} items={p.items} owner={p.owner} dueIn={p.dueIn} />
              ))}
            </div>
          )}

          {view === "transport" && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Transport & Carpool Duties</h3>
              {([] as typeof transportDuties).map((t, i) => (
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={i} >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/8 p-2 shrink-0"><Car className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{t.event}</p>
                      <p className="text-xs text-muted-foreground">{t.time} · Driver: {t.driver}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.route}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Est. {t.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Family Grid */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">Family Members</h4>
            {([] as typeof familyMembers).map((m) => (
              <div key={m.name} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                <MemberAvatar name={m.name} size="sm" />
                <span className="text-sm text-foreground flex-1">{m.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground">{m.events} events</span>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule Pressure */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" >
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">Schedule Pressure</h4>
            <div className="space-y-2.5">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => {
                const load = [2, 3, 4, 2, 1, 5, 3][i];
                const max = 6;
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-8">{day.slice(0, 3)}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${load >= 4 ? "bg-destructive/70" : load >= 3 ? "bg-amber-500/70" : "bg-primary/50"}`}
                        style={{ width: `${(load / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-4 text-right">{load}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Calendar Advisor",
            message: "Saturday has a timing conflict between Emma's soccer match (2 PM) and family dinner (6 PM). The match ends ~3:30 PM — moving dinner to 7 PM resolves the pressure. Restaurant has availability. Tuesday is your busiest day with school conference at 9 AM.",
            linkedItems: ["Soccer match — Saturday", "Family dinner — Saturday", "School conference — Tuesday"],
            confidence: "high",
          }} />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default FamilyCalendar;
