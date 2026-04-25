import { HeroCard, QueueCard, TimelineCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { SlidePanel } from "@/platform/sita/components/sita/surfaces/SlidePanel";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { ConciergePageWrapper } from "@/modules/concierge/components/concierge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Stethoscope, Calendar, MapPin, Clock, FileText, User, CheckCircle, AlertCircle, Car, ClipboardCheck } from "lucide-react";

interface Appointment {
  id: string; title: string; who: string; when: string; time: string; location: string;
  category: "medical" | "school" | "home" | "personal" | "pet" | "childcare";
  prepItems: string[]; documentsNeeded: string[]; transportTime?: string;
  status: "confirmed" | "unconfirmed" | "prep-needed" | "ready"; owner: string;
}

const appointments: Appointment[] = [
  { id: "1", title: "Dentist — kids checkup", who: "Emma & Liam", when: "Next Thursday", time: "10:00 AM", location: "Dr. Patel, Suite 200", category: "medical", prepItems: ["Brush teeth morning of", "Bring insurance cards"], documentsNeeded: ["Insurance card", "Previous x-rays"], transportTime: "25 min drive", status: "confirmed", owner: "You" },
  { id: "2", title: "Annual physical — You", who: "You", when: "Apr 10", time: "8:30 AM", location: "West Health Clinic", category: "medical", prepItems: ["Fast after 10 PM night before", "List of current meds"], documentsNeeded: ["Photo ID", "Insurance card"], transportTime: "15 min drive", status: "prep-needed", owner: "You" },
  { id: "3", title: "HVAC maintenance", who: "Home", when: "Apr 8", time: "2:00–4:00 PM", location: "At home", category: "home", prepItems: ["Clear area around furnace", "Change filters"], documentsNeeded: ["Service contract"], status: "confirmed", owner: "Partner" },
  { id: "4", title: "Vet — annual checkup (Max)", who: "Max (dog)", when: "Apr 14", time: "11:00 AM", location: "Happy Paws Vet", category: "pet", prepItems: ["Bring vaccination records", "No food 2 hours before"], documentsNeeded: ["Vaccination booklet"], transportTime: "20 min drive", status: "unconfirmed", owner: "Partner" },
  { id: "5", title: "Parent-teacher conference", who: "Emma", when: "Next Tuesday", time: "9:00 AM", location: "Lincoln Elementary", category: "school", prepItems: ["Review last report card", "Prepare questions"], documentsNeeded: [], transportTime: "10 min drive", status: "confirmed", owner: "Both" },
  { id: "6", title: "Hair appointment", who: "You", when: "Apr 12", time: "3:00 PM", location: "Studio 22", category: "personal", prepItems: [], documentsNeeded: [], transportTime: "10 min", status: "confirmed", owner: "You" },
];

const urgencyMap: Record<string, "critical" | "high" | "normal" | "low"> = {
  "prep-needed": "high", unconfirmed: "high", confirmed: "normal", ready: "low",
};

const AppointmentsPrep = () => {
  const [view, setView] = useState("upcoming");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const needsPrep = appointments.filter(a => a.prepItems.length > 0).length;
  const unconfirmed = appointments.filter(a => a.status === "unconfirmed").length;

  const filtered = view === "prep" ? appointments.filter(a => a.prepItems.length > 0)
    : view === "unconfirmed" ? appointments.filter(a => a.status === "unconfirmed")
    : view === "recurring" ? appointments.filter(a => a.category === "medical" || a.category === "pet")
    : appointments;

  const selected = appointments.find(a => a.id === selectedId);

  const handleSelect = (id: string) => { setSelectedId(id); setPanelOpen(true); };

  const queueItems = filtered.map(apt => ({
    id: apt.id,
    label: `${apt.title} — ${apt.who}`,
    meta: `${apt.when} ${apt.time}`,
    urgency: urgencyMap[apt.status] || "normal" as const,
  }));

  const timelineEvents = appointments.map(apt => ({
    id: apt.id,
    title: apt.title,
    timestamp: `${apt.when} ${apt.time}`,
    detail: `${apt.who} · ${apt.location}`,
    accentColor: apt.status === "unconfirmed" ? "hsl(38 85% 58%)" : apt.status === "prep-needed" ? "hsl(265 55% 58%)" : "hsl(285 55% 55%)",
  }));

  return (
    <ConciergePageWrapper className="space-y-5">
      <PageTruthBanner truthState="demo" />

      <HeroCard
        title="Appointments & Prep"
        metric={`${appointments.length} upcoming`}
        subtitle="Preparation checklists, logistics, and readiness"
        accentFrom="hsl(285 55% 55%)"
        accentTo="hsl(310 50% 48%)"
        icon={<ClipboardCheck className="h-5 w-5 text-[hsl(285_55%_65%)]" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="Upcoming" status="healthy" lastChecked={`${appointments.length}`} icon={<Calendar className="h-3.5 w-3.5" />} />
        <StatusCard label="Needs Prep" status={needsPrep > 0 ? "degraded" : "healthy"} lastChecked={`${needsPrep}`} icon={<ClipboardCheck className="h-3.5 w-3.5" />} />
        <StatusCard label="Unconfirmed" status={unconfirmed > 0 ? "degraded" : "healthy"} lastChecked={`${unconfirmed}`} icon={<AlertCircle className="h-3.5 w-3.5" />} />
        <StatusCard label="This Week" status="healthy" lastChecked={`${appointments.filter(a => a.when.includes("Next") || a.when === "Tomorrow").length}`} icon={<Clock className="h-3.5 w-3.5" />} />
      </div>

      <SitaTabs
        tabs={[
          { key: "upcoming", label: "All Upcoming" },
          { key: "prep", label: "Prep Needed", count: needsPrep },
          { key: "unconfirmed", label: "Unconfirmed", count: unconfirmed },
          { key: "recurring", label: "Recurring" },
        ]}
        active={view}
        onChange={setView}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <PremiumEmptyState icon={Calendar} title="No appointments" description="Your schedule is clear" variant="no-results" domain="concierge" />
          ) : (
            <QueueCard title="APPOINTMENT QUEUE" items={queueItems} maxVisible={10} onItemClick={handleSelect} />
          )}
        </div>
        <div className="lg:col-span-2">
          <TimelineCard title="Timeline" events={timelineEvents} maxVisible={5} />
        </div>
      </div>

      <ModuleAdvisorInsight
        advisorName="Appointment Advisor"
        domain="concierge"
        confidence={90}
        insight="Annual physical requires fasting — set a reminder for 10 PM the night before. Vet appointment is unconfirmed; call Happy Paws today. HVAC visit needs someone home 2–4 PM."
        linkedItems={["Annual physical — fasting", "Vet confirmation", "HVAC coverage"]}
      />

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={selected?.title || "Appointment"} width={400}>
        {selected && (
          <div className="space-y-4">
            <AppSurface level={2} className="p-3 space-y-2">
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Who</span><span className="text-[hsl(0_0%_85%)]">{selected.who}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">When</span><span className="text-[hsl(0_0%_85%)]">{selected.when} {selected.time}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Location</span><span className="text-[hsl(0_0%_85%)]">{selected.location}</span></div>
              {selected.transportTime && <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Travel</span><span className="text-[hsl(0_0%_85%)]">{selected.transportTime}</span></div>}
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Owner</span><span className="text-[hsl(0_0%_85%)]">{selected.owner}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-[hsl(0_0%_50%)]">Status</span><span className={cn("font-medium capitalize", selected.status === "unconfirmed" ? "text-[hsl(38_85%_58%)]" : "text-[hsl(152_55%_48%)]")}>{selected.status}</span></div>
            </AppSurface>

            {selected.prepItems.length > 0 && (
              <AppSurface level={2} className="p-3">
                <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider mb-2">Prep Checklist</p>
                {selected.prepItems.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <div className="h-3.5 w-3.5 rounded border border-[hsl(0_0%_30%)] shrink-0" />
                    <span className="text-[11px] text-[hsl(0_0%_75%)]">{p}</span>
                  </div>
                ))}
              </AppSurface>
            )}

            {selected.documentsNeeded.length > 0 && (
              <AppSurface level={2} className="p-3">
                <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider mb-2">Documents Needed</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.documentsNeeded.map((d, i) => (
                    <span key={i} className="rounded-md bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 text-[10px] text-[hsl(0_0%_65%)]">{d}</span>
                  ))}
                </div>
              </AppSurface>
            )}
          </div>
        )}
      </SlidePanel>
    </ConciergePageWrapper>
  );
};

export default AppointmentsPrep;
