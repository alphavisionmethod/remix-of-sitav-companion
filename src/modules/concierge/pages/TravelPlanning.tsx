// ═══════════════════════════════════════════════════════════════
// SITA OS — Travel Planning (Honest-Degraded)
//
// Manifest classification: `degraded` (no travel/reservations
// hook wired into this surface). Live mode renders an honest empty
// trip queue. Demo mode (isDemo === true) renders the rich preview
// from `concierge-travel-planning-demo` fixtures.
// ═══════════════════════════════════════════════════════════════
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { HeroCard, QueueCard, TimelineCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CrossAppAction } from "@/platform/sita/components/sita/CrossAppAction";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { TripCard } from "@/platform/sita/components/sita/HouseholdComponents";
import {
  ConciergePageWrapper,
  TravelReadinessCard,
  ReservationStatusCard,
  ConciergeAdvisorInsightCard,
} from "@/modules/concierge/components/concierge";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Plane, Home } from "lucide-react";
import {
  TRAVEL_TRIPS_DEMO,
  TRAVEL_RESERVATIONS_DEMO,
  type DemoTrip,
} from "@/data/fixtures/mock-data/concierge-travel-planning-demo";

type TravelView = "trips" | "prep" | "itinerary" | "logistics" | "post-trip";

const TravelPlanning = () => {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [view, setView] = useState<TravelView>("trips");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    isDemo ? TRAVEL_TRIPS_DEMO[1]?.id ?? null : null,
  );

  // ── Live mode: honest empty surface ────────────────────────────
  if (!isDemo) {
    return (
      <ConciergePageWrapper className="space-y-5">
        <PageTruthBanner truthState="partial" />
        <HeroCard
          title="Travel Planning"
          metric="0 active trips"
          subtitle="Premium trip management — prep, logistics, household spillover"
          accentFrom="hsl(285 55% 55%)"
          accentTo="hsl(310 50% 48%)"
          icon={<Plane className="h-5 w-5 text-[hsl(285_55%_65%)]" />}
        />
        <PremiumEmptyState
          icon={Plane}
          title={user ? "No trips planned yet" : "Sign in to plan trips"}
          description={
            user
              ? "Once a travel/reservations source is connected, upcoming trips, prep checklists and household spillover will appear here."
              : "Sign in and connect a calendar or reservations provider to populate this surface."
          }
          variant="first-use"
          domain="concierge"
        />
      </ConciergePageWrapper>
    );
  }

  // ── Demo mode: rich preview ────────────────────────────────────
  const trips: ReadonlyArray<DemoTrip> = TRAVEL_TRIPS_DEMO;
  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? trips[1] ?? trips[0];

  return (
    <ConciergePageWrapper className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <PageTruthBanner truthState="demo" />
        <CrossAppAction
          to="/files/search"
          label="Travel Documents"
          variant="chip"
          context={{ entityType: "file", entityId: "travel", entityLabel: "Travel docs" }}
        />
      </div>

      <HeroCard
        title="Travel Planning"
        metric={`${trips.filter((t) => t.status !== "completed").length} active trips`}
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
          {view === "trips" &&
            trips.map((trip) => (
              <div key={trip.id} onClick={() => setSelectedTripId(trip.id)} className="cursor-pointer">
                <TripCard
                  destination={trip.destination}
                  dates={trip.dates}
                  travelers={trip.travelers}
                  status={trip.status}
                  budget={trip.budget}
                  spent={trip.spent}
                  tasksComplete={trip.completedTasks}
                  tasksTotal={trip.tasks}
                  daysUntil={trip.daysUntil}
                  onClick={() => setSelectedTripId(trip.id)}
                />
              </div>
            ))}

          {view === "prep" && (
            <QueueCard title={`Pre-Trip Prep — ${selectedTrip?.destination ?? ""}`} items={[]} maxVisible={8} />
          )}
          {view === "itinerary" && (
            <TimelineCard title={`Itinerary — ${selectedTrip?.destination ?? ""}`} events={[]} />
          )}

          {view === "logistics" && (
            <div className="space-y-2">
              <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)]")}>Household Spillover</h4>
              <StatusCard label="No household spillover yet" status="healthy" icon={<Home className="h-3.5 w-3.5" />} />
            </div>
          )}

          {view === "post-trip" && <QueueCard title="Post-Trip Recovery" items={[]} maxVisible={10} />}
        </div>

        <div className="space-y-4">
          {trips.map((trip) => (
            <TravelReadinessCard
              key={trip.id}
              trip={{
                id: trip.id,
                destination: trip.destination.split("—")[0].trim(),
                daysUntil: trip.daysUntil,
                readinessPercent: Math.round((trip.completedTasks / trip.tasks) * 100),
                totalItems: trip.tasks,
                completedItems: trip.completedTasks,
                missingItems:
                  trip.id === "2"
                    ? ["Car rental", "Airport shuttle", "Travel insurance"]
                    : trip.id === "1"
                    ? ["Ski rentals"]
                    : [],
              }}
            />
          ))}

          <ReservationStatusCard reservations={[...TRAVEL_RESERVATIONS_DEMO]} />

          <ConciergeAdvisorInsightCard
            insight={{
              role: "Travel Advisor",
              message:
                "Kids' passports expire before the Cancún trip — start renewal NOW. Book the pet sitter today.",
              linkedItems: ["Passport renewal", "Pet sitter booking"],
              confidence: "high",
            }}
          />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default TravelPlanning;
