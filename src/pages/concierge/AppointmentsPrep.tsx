import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConciergeAdvisorInsightCard, AppointmentPrepCard } from "@/components/concierge";
import type { AppointmentPrep } from "@/components/concierge";
import { useState } from "react";
import { Stethoscope, Calendar, MapPin, Clock, FileText, User, CheckCircle, AlertCircle, Car, ClipboardCheck } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useServiceProvidersList } from "@/hooks/use-concierge-data";

interface Appointment {
  id: string;
  title: string;
  who: string;
  when: string;
  time: string;
  location: string;
  category: "medical" | "school" | "home" | "personal" | "pet" | "childcare";
  prepItems: string[];
  documentsNeeded: string[];
  transportTime?: string;
  status: "confirmed" | "unconfirmed" | "prep-needed" | "ready";
  owner: string;
}

const appointments: Appointment[] = [
  {
    id: "1", title: "Dentist — kids checkup", who: "Emma & Liam", when: "Next Thursday", time: "10:00 AM",
    location: "Dr. Patel, Suite 200", category: "medical", prepItems: ["Brush teeth morning of", "Bring insurance cards"],
    documentsNeeded: ["Insurance card", "Previous x-rays if available"], transportTime: "25 min drive",
    status: "confirmed", owner: "You"
  },
  {
    id: "2", title: "Annual physical — You", who: "You", when: "Apr 10", time: "8:30 AM",
    location: "West Health Clinic", category: "medical", prepItems: ["Fast after 10 PM night before", "List of current meds"],
    documentsNeeded: ["Photo ID", "Insurance card"], transportTime: "15 min drive",
    status: "prep-needed", owner: "You"
  },
  {
    id: "3", title: "HVAC maintenance", who: "Home", when: "Apr 8", time: "2:00–4:00 PM",
    location: "At home", category: "home", prepItems: ["Clear area around furnace", "Change filters if possible"],
    documentsNeeded: ["Service contract"], status: "confirmed", owner: "Partner"
  },
  {
    id: "4", title: "Vet — annual checkup (Max)", who: "Max (dog)", when: "Apr 14", time: "11:00 AM",
    location: "Happy Paws Vet", category: "pet", prepItems: ["Bring vaccination records", "No food 2 hours before"],
    documentsNeeded: ["Vaccination booklet"], transportTime: "20 min drive",
    status: "unconfirmed", owner: "Partner"
  },
  {
    id: "5", title: "Parent-teacher conference", who: "Emma", when: "Next Tuesday", time: "9:00 AM",
    location: "Lincoln Elementary", category: "school", prepItems: ["Review last report card", "Prepare questions"],
    documentsNeeded: [], transportTime: "10 min drive",
    status: "confirmed", owner: "Both"
  },
  {
    id: "6", title: "Hair appointment", who: "You", when: "Apr 12", time: "3:00 PM",
    location: "Studio 22", category: "personal", prepItems: [], documentsNeeded: [],
    transportTime: "10 min", status: "confirmed", owner: "You"
  },
];

const catIcon = (c: Appointment["category"]) => {
  const m = { medical: Stethoscope, school: Calendar, home: ClipboardCheck, personal: User, pet: User, childcare: User };
  return m[c] || Calendar;
};

const AppointmentsPrep = () => {
  const [view, setView] = useState("upcoming");
  const needsPrep = appointments.filter(a => a.status === "prep-needed" || a.prepItems.length > 0).length;
  const unconfirmed = appointments.filter(a => a.status === "unconfirmed").length;

  const filtered = view === "prep" ? appointments.filter(a => a.prepItems.length > 0)
    : view === "unconfirmed" ? appointments.filter(a => a.status === "unconfirmed")
    : view === "recurring" ? appointments.filter(a => a.category === "medical" || a.category === "pet")
    : view === "followup" ? appointments.filter(a => a.status === "confirmed").slice(0, 2)
    : appointments;

  return (
    <div className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Appointments & Prep" subtitle="Upcoming appointments with preparation checklists and logistics" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Upcoming" value={String(appointments.length)} icon={Calendar} />
        <KPITile label="Needs Prep" value={String(needsPrep)} icon={ClipboardCheck} sub="Items to prepare" />
        <KPITile label="Unconfirmed" value={String(unconfirmed)} icon={AlertCircle} sub={unconfirmed > 0 ? "Follow up needed" : "All confirmed"} />
        <KPITile label="This Week" value={String(appointments.filter(a => a.when.includes("Next") || a.when === "Tomorrow").length)} icon={Clock} />
      </div>

      <SitaTabs
        tabs={[
          { key: "upcoming", label: "All Upcoming" },
          { key: "prep", label: "Prep Needed" },
          { key: "unconfirmed", label: "Unconfirmed" },
          { key: "recurring", label: "Recurring" },
          { key: "followup", label: "Follow-up" },
        ]}
        active={view}
        onChange={setView}
      />

      <div className="space-y-4">
        {filtered.map(apt => {
          const Icon = catIcon(apt.category);
          return (
            <SitaCard key={apt.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-foreground">{apt.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {apt.when} at {apt.time} · {apt.who} · Owner: {apt.owner}
                      </p>
                    </div>
                    <TrustBadge level={apt.status === "unconfirmed" ? "review" : apt.status === "ready" ? "verified" : "safe"} label={apt.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.location}</span>
                    {apt.transportTime && <span className="flex items-center gap-1"><Car className="h-3 w-3" />{apt.transportTime}</span>}
                  </div>

                  {apt.prepItems.length > 0 && (
                    <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Prep Checklist</p>
                      {apt.prepItems.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30 shrink-0" />
                          <span className="text-xs text-foreground">{p}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {apt.documentsNeeded.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {apt.documentsNeeded.map((d, i) => (
                        <span key={i} className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{d}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>

      {/* Appointment Prep Cards for prep-needed view */}
      {view === "prep" && (
        <div className="space-y-3 mt-4">
          <SitaSectionHeader title="Prep Checklist Summary" subtitle="All appointments requiring preparation" />
          {filtered.map(apt => (
            <AppointmentPrepCard key={apt.id} appointment={{
              id: apt.id,
              title: apt.title,
              who: apt.who,
              when: apt.when,
              provider: apt.location,
              prepChecklist: apt.prepItems.map((p, i) => ({ id: `${apt.id}-p${i}`, label: p, done: false })),
              docsNeeded: apt.documentsNeeded,
              transportTime: apt.transportTime,
              status: apt.status as "confirmed" | "unconfirmed" | "prep-needed",
            }} />
          ))}
        </div>
      )}

      <ConciergeAdvisorInsightCard insight={{
        role: "Appointment Advisor",
        message: "Your annual physical requires fasting — set a reminder for 10 PM the night before. The vet appointment is unconfirmed; I recommend calling Happy Paws today. HVAC visit needs someone home 2–4 PM on the 8th — confirm with your partner.",
        linkedItems: ["Annual physical — fasting", "Vet confirmation", "HVAC coverage"],
        confidence: "high",
      }} />
    </div>
  );
};

export default AppointmentsPrep;
