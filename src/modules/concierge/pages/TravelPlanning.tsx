import { useAuth } from "@/contexts/AuthContext";
import { HeroCard, QueueCard, TimelineCard, StatusCard, AdvisorCard } from "@/components/sita/cards";
import { FreshnessBadge } from "@/components/sita/badges";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CrossAppAction } from "@/platform/sita/components/sita/CrossAppAction";
import { SitaTabs, SectionHeader } from "@/platform/sita/components/sita/SitaComponents";
import { TripCard, PrepCard } from "@/platform/sita/components/sita/HouseholdComponents";
import { ConciergePageWrapper, ConciergeEmptyState, TravelReadinessCard, ReservationStatusCard, ConciergeAdvisorInsightCard } from "@/components/concierge";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Calendar, DollarSign, FileText, CheckCircle, AlertCircle, Clock, Home, CreditCard } from "lucide-react";
const preTripChecklist: any[] = [];
const itinerary: any[] = [];
const householdSpillover: any[] = [];
const postTripTasks: any[] = [];
interface Trip {
  id: string; destination: string; dates: string; status: "planning" | "booked" | "upcoming" | "active" | "completed";
  travelers: string; budget: string; spent: string; tasks: number; completedTasks: number;
  documents: number; daysUntil: number; type: "family" | "business" | "mixed";
}

const trips: Trip[] = [
  { id: "1", destination: "Lake Tahoe — Family Ski Trip", dates: "Feb 14–18, 2026", status: "upcoming", travelers: "4 travelers", budget: "$4,200", spent: "$3,100", tasks: 8, completedTasks: 6, documents: 5, daysUntil: 12, type: "family" },
  { id: "2", destination: "Cancún — Spring Break", dates: "Apr 10–17, 2026", status: "planning", travelers: "4 travelers", budget: "$6,500", spent: "$1,200", tasks: 12, completedTasks: 3, documents: 2, daysUntil: 18, type: "family" },
  { id: "3", destination: "NYC — Business + Family Extension", dates: "May 5–8, 2026", status: "planning", travelers: "2 travelers", budget: "$2,800", spent: "$0", tasks: 6, completedTasks: 0, documents: 0, daysUntil: 43, type: "mixed" },
];

type TravelView = "trips" | "prep" | "itinerary" | "logistics" | "post-trip";

const TravelPlanning = () => {
  const [view, setView] = useState<TravelView>("trips");
  const [selectedTrip, setSelectedTrip] = useState(trips[1]);

  const prepQueueItems = ([] as typeof preTripChecklist).flatMap((section, si) =>
    section.items.map((item, ii) => ({
      id: `prep-${si}-${ii}`,
      label: item,
      meta: section.dueIn,
      urgency: ((si === 0 ? "high" : si === 1 ? "normal" : "low") as "high" | "normal" | "low"),
    }))
  ).slice(0, 8);

  const itineraryEvents = ([] as typeof itinerary).map((day, i) => ({
    id: `day-${i}`,
    title: day.day,
    timestamp: `${day.items.length} activities`,
    detail: day.items[0],
    accentColor: "hsl(285 55% 55%)",
  }));

  return (
    <ConciergePageWrapper className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <PageTruthBanner truthState="live" />
        <CrossAppAction to="/files/search" label="Travel Documents" variant="chip" context={{ entityType: "file", entityId: "travel", entityLabel: "Travel docs" }} />
      </div>

      <HeroCard
        title="Travel Planning"
        metric={`${trips.filter(t => t.status !== "completed").length} active trips`}
        subtitle="Premium trip management — prep, logistics, household spillover"
        accentFrom="hsl(285 55% 55%)"
        accentTo="hsl(310 50% 48%)"
        icon={<Plane className="h-5 w-5 text-[hsl(285_55%_65%)]" />}
      />

      <SitaTabs
        tabs={[
          { key: "trips", label: "All Trips" },
          { key: "prep", label: "Prep View" },
          { key: "itinerary", label: "Itinerary" },
          { key: "logistics", label: "Home Logistics" },
          { key: "post-trip", label: "Post-Trip" },
        ]}
        active={view}
        onChange={(k) => setView(k as TravelView)}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {view === "trips" && trips.map(trip => (
            <div key={trip.id} onClick={() => setSelectedTrip(trip)} className="cursor-pointer">
              <TripCard destination={trip.destination} dates={trip.dates} travelers={trip.travelers}
                status={trip.status} budget={trip.budget} spent={trip.spent} tasksComplete={trip.completedTasks}
                tasksTotal={trip.tasks} daysUntil={trip.daysUntil} onClick={() => setSelectedTrip(trip)} />
            </div>
          ))}

          {view === "prep" && <QueueCard title={`Pre-Trip Prep — ${selectedTrip.destination}`} items={prepQueueItems} maxVisible={8} />}
          {view === "itinerary" && <TimelineCard title={`Itinerary — ${selectedTrip.destination}`} events={itineraryEvents} />}

          {view === "logistics" && (
            <div className="space-y-2">
              <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)]")}>Household Spillover</h4>
              {([] as typeof householdSpillover).map((item, i) => (
                <StatusCard key={i} label={item.item} status={item.urgency === "high" ? "degraded" : "healthy"} lastChecked={item.cost || undefined} icon={<Home className="h-3.5 w-3.5" />} />
              ))}
            </div>
          )}

          {view === "post-trip" && (
            <QueueCard
              title="Post-Trip Recovery"
              items={([] as typeof postTripTasks).map((task, i) => ({ id: `pt-${i}`, label: task, urgency: "normal" as const }))}
              maxVisible={10}
            />
          )}
        </div>

        <div className="space-y-4">
          {trips.map(trip => (
            <TravelReadinessCard key={trip.id} trip={{
              id: trip.id, destination: trip.destination.split("—")[0].trim(),
              daysUntil: trip.daysUntil, readinessPercent: Math.round((trip.completedTasks / trip.tasks) * 100),
              totalItems: trip.tasks, completedItems: trip.completedTasks,
              missingItems: trip.id === "2" ? ["Car rental", "Airport shuttle", "Travel insurance"] : trip.id === "1" ? ["Ski rentals"] : [],
            }} />
          ))}

          <ReservationStatusCard reservations={[
            { id: "res1", title: "Hotel — Lake Tahoe Resort", date: "Feb 14–18", status: "confirmed", linkedTrip: "Lake Tahoe" },
            { id: "res2", title: "Flight — SFO → CUN", date: "Apr 10", status: "confirmed", linkedTrip: "Cancún" },
            { id: "res3", title: "Car rental — Cancún", date: "Apr 10–17", status: "missing", linkedTrip: "Cancún" },
          ]} />

          <ConciergeAdvisorInsightCard insight={{
            role: "Travel Advisor",
            message: "Kids' passports expire before the Cancún trip — start renewal NOW. Book the pet sitter today.",
            linkedItems: ["Passport renewal", "Pet sitter booking"],
            confidence: "high",
          }} />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default TravelPlanning;
