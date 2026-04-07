import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { CalendarEventCard, ConflictCard, PrepCard, MemberAvatar, HouseholdAdvisor } from "@/components/sita/HouseholdComponents";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, MapPin, AlertCircle, Heart, GraduationCap, Dumbbell, Stethoscope, Wrench, Car, Sparkles } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = 2;

const familyMembers = [
  { name: "You", events: 5, color: "bg-primary" },
  { name: "Partner", events: 3, color: "bg-accent" },
  { name: "Emma", events: 4, color: "bg-chart-2" },
  { name: "Liam", events: 3, color: "bg-amber-500" },
];

const events = [
  { id: "1", title: "Soccer practice", time: "Today 4:00 PM", who: "Emma", location: "Riverside Park", category: "Sports", owner: "Partner", transportTime: "15 min", prep: ["Shin guards", "Water bottle"] },
  { id: "2", title: "Carpool duty — morning route", time: "Tomorrow 7:30 AM", who: "You", category: "Transport", owner: "You" },
  { id: "3", title: "Piano lesson", time: "Tomorrow 3:30 PM", who: "Liam", location: "Music Academy", category: "Education", owner: "Partner", transportTime: "20 min", prep: ["Music book"] },
  { id: "4", title: "Parent-teacher conference", time: "Next Tuesday 9:00 AM", who: "Parents", location: "Lincoln Elementary", category: "School", owner: "Both", transportTime: "10 min", prep: ["Review report card", "Prepare questions"] },
  { id: "5", title: "Dentist — kids checkup", time: "Next Thursday 10:00 AM", who: "Emma & Liam", location: "Dr. Patel", category: "Health", owner: "You", transportTime: "25 min", prep: ["Insurance cards", "Brush teeth morning of"] },
  { id: "6", title: "Soccer match", time: "Saturday 2:00 PM", who: "Emma", location: "County Field", category: "Sports", owner: "Partner", transportTime: "30 min", conflict: true },
  { id: "7", title: "Family dinner — Chez Marie", time: "Saturday 6:00 PM", who: "Everyone", location: "Chez Marie", category: "Family", owner: "You", prep: ["Reservation confirmed"], conflict: true },
  { id: "8", title: "Birthday party — Max", time: "Sunday 3:00 PM", who: "Liam", location: "FunZone", category: "Social", owner: "Partner", transportTime: "15 min", prep: ["Wrap gift", "RSVP done"] },
  { id: "9", title: "HVAC maintenance", time: "Apr 8, 2:00–4:00 PM", who: "Home", location: "At home", category: "Home", owner: "Partner", prep: ["Clear area around furnace", "Service contract ready"] },
  { id: "10", title: "Annual physical", time: "Apr 10, 8:30 AM", who: "You", location: "West Health Clinic", category: "Health", owner: "You", transportTime: "15 min", prep: ["Fast after 10 PM", "List of meds", "ID + Insurance card"] },
];

const conflicts = [
  {
    events: [
      { title: "Soccer match (Emma)", time: "Saturday 2:00 PM", who: "Emma" },
      { title: "Family dinner", time: "Saturday 6:00 PM", who: "Everyone" },
    ],
    resolution: "Soccer match ends ~3:30 PM. Move dinner to 7 PM — restaurant has availability. This resolves the timing pressure.",
  },
];

const prepItems = [
  { title: "Dentist prep — kids checkup", linkedEvent: "Next Thursday 10 AM", items: ["Brush teeth morning of", "Bring insurance cards", "Request x-ray copies"], owner: "You", dueIn: "5 days" },
  { title: "Annual physical prep", linkedEvent: "Apr 10, 8:30 AM", items: ["Fast after 10 PM night before", "List current medications", "Bring ID + insurance card"], owner: "You", dueIn: "8 days" },
  { title: "HVAC maintenance prep", linkedEvent: "Apr 8, 2–4 PM", items: ["Clear area around furnace", "Have service contract accessible", "Someone must be home"], owner: "Partner", dueIn: "6 days" },
];

const transportDuties = [
  { event: "Soccer practice", time: "Today 4 PM", driver: "Partner", route: "Home → Riverside Park → Home", duration: "45 min total" },
  { event: "Carpool duty", time: "Tomorrow 7:30 AM", driver: "You", route: "3-kid route → Lincoln Elementary", duration: "25 min" },
  { event: "Piano lesson", time: "Tomorrow 3:30 PM", driver: "Partner", route: "School → Music Academy → Home", duration: "40 min" },
];

type CalendarView = "week" | "day" | "family" | "conflicts" | "prep" | "transport";

const FamilyCalendar = () => {
  const [view, setView] = useState<CalendarView>("week");

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Family Calendar" subtitle="Reconciled schedules — conflict-aware, prep-ready, ownership-clear" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Events This Week" value={String(events.length)} icon={Calendar} />
        <KPITile label="Family Members" value="4" icon={Users} />
        <KPITile label="Conflicts" value={String(conflicts.length)} icon={AlertCircle} sub="Needs resolution" />
        <KPITile label="Prep Items" value={String(prepItems.length)} icon={Clock} sub="Before events" />
        <KPITile label="Transport Duties" value={String(transportDuties.length)} icon={Car} sub="This week" />
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
          <SitaCard className="p-4">
            <SitaCardTitle className="mb-3">This Week</SitaCardTitle>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => {
                const dayEvents = events.filter((_, ei) => ei % 7 === i).length;
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
          </SitaCard>

          {/* Conflicts */}
          {(view === "week" || view === "conflicts") && conflicts.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Schedule Conflicts" subtitle="Overlapping or impossible schedules detected" />
              {conflicts.map((c, i) => (
                <ConflictCard key={i} events={c.events} resolution={c.resolution} />
              ))}
            </div>
          )}

          {/* Events or Prep or Transport */}
          {(view === "week" || view === "day" || view === "family") && (
            <div className="space-y-3">
              <SitaSectionHeader title="Upcoming Events" subtitle={`${events.length} scheduled — with prep and ownership`} />
              {events.map((e) => (
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
              <SitaSectionHeader title="Preparation Checklists" subtitle="What needs to be done before each event" />
              {prepItems.map((p, i) => (
                <PrepCard key={i} title={p.title} linkedEvent={p.linkedEvent} items={p.items} owner={p.owner} dueIn={p.dueIn} />
              ))}
            </div>
          )}

          {view === "transport" && (
            <div className="space-y-3">
              <SitaSectionHeader title="Transport & Carpool Duties" subtitle="Who drives where and when" />
              {transportDuties.map((t, i) => (
                <SitaCard key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/8 p-2 shrink-0"><Car className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{t.event}</p>
                      <p className="text-xs text-muted-foreground">{t.time} · Driver: {t.driver}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.route}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Est. {t.duration}</p>
                    </div>
                  </div>
                </SitaCard>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Family Grid */}
          <SitaCard className="p-4">
            <SitaCardTitle className="mb-3">Family Members</SitaCardTitle>
            {familyMembers.map((m) => (
              <div key={m.name} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                <MemberAvatar name={m.name} size="sm" />
                <span className="text-sm text-foreground flex-1">{m.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground">{m.events} events</span>
                </div>
              </div>
            ))}
          </SitaCard>

          {/* Schedule Pressure */}
          <SitaCard hover={false} className="p-4">
            <SitaCardTitle className="mb-3">Schedule Pressure</SitaCardTitle>
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
          </SitaCard>

          {/* Calendar Advisor */}
          <HouseholdAdvisor
            role="Calendar Advisor"
            icon={Calendar}
            confidence="high"
            message="Saturday has a timing conflict between Emma's soccer match (2 PM) and family dinner (6 PM). The match ends ~3:30 PM — moving dinner to 7 PM resolves the pressure. Restaurant has availability. Tuesday is your busiest day with school conference at 9 AM."
            linkedItems={["Soccer match — Saturday", "Family dinner — Saturday", "School conference — Tuesday"]}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FamilyCalendar;
