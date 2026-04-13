import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { TripCard, PrepCard } from "@/components/sita/HouseholdComponents";
import { ConciergeAdvisorInsightCard, TravelReadinessCard, ReservationStatusCard, ConciergePageWrapper, ConciergeEmptyState } from "@/components/concierge";
import type { TravelReadiness, Reservation } from "@/components/concierge";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane, Calendar, DollarSign, FileText, MapPin, Clock, CheckCircle, AlertCircle, Shield,
  Luggage, Home, PawPrint, Car, CreditCard, Sparkles
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useTravelPlans } from "@/hooks/use-concierge-data";
import { DEMO_householdSpillover, DEMO_itinerary, DEMO_postTripTasks, DEMO_preTripChecklist } from "@/lib/demo-data/concierge";

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

type TravelView = "trips" | "active" | "prep" | "itinerary" | "logistics" | "post-trip";

const TravelPlanning = () => {
  const [view, setView] = useState<TravelView>("trips");
  const [selectedTrip, setSelectedTrip] = useState(trips[1]); // Cancún

  return (
    <ConciergePageWrapper className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Travel Planning" subtitle="Premium trip management — prep, logistics, household spillover, and continuity" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Active Trips" value={String(trips.filter(t => t.status !== "completed").length)} icon={Plane} />
        <KPITile label="Next Trip" value={`${trips[0].daysUntil}d`} icon={Calendar} sub="Lake Tahoe" />
        <KPITile label="Total Budget" value="$13.5K" icon={DollarSign} sub="Across 3 trips" />
        <KPITile label="Readiness" value={`${Math.round((trips[0].completedTasks / trips[0].tasks) * 100)}%`} icon={CheckCircle} sub={trips[0].destination.split("—")[0]} trend="up" />
        <KPITile label="Documents" value={String(trips.reduce((s, t) => s + t.documents, 0))} icon={FileText} sub="Attached" />
      </div>

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {view === "trips" && trips.length === 0 && (
            <ConciergeEmptyState domain="travel" icon={Plane} />
          )}
          {view === "trips" && trips.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Trips" subtitle={`${trips.length} planned`} />
              {trips.map((trip) => {
                const readiness = Math.round((trip.completedTasks / trip.tasks) * 100);
                return (
                  <div key={trip.id} className="space-y-2">
                    <TripCard destination={trip.destination} dates={trip.dates} travelers={trip.travelers}
                      status={trip.status} budget={trip.budget} spent={trip.spent} tasksComplete={trip.completedTasks}
                      tasksTotal={trip.tasks} daysUntil={trip.daysUntil} onClick={() => setSelectedTrip(trip)}
                    />
                    {/* Readiness Bar */}
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-[10px] text-muted-foreground">Readiness</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${readiness >= 75 ? "bg-chart-2" : readiness >= 50 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${readiness}%` }} />
                      </div>
                      <span className={`text-[10px] font-medium ${readiness >= 75 ? "text-chart-2" : readiness >= 50 ? "text-amber-500" : "text-destructive"}`}>{readiness}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "prep" && (
            <div className="space-y-3">
              <SitaSectionHeader title={`Pre-Trip Prep — ${selectedTrip.destination}`} subtitle="Everything needed before departure" />
              {DEMO_preTripChecklist.map((section, i) => (
                <PrepCard key={i} title={section.title} items={section.items} dueIn={section.dueIn} />
              ))}
            </div>
          )}

          {view === "itinerary" && (
            <div className="space-y-4">
              <SitaSectionHeader title={`Itinerary — ${selectedTrip.destination}`} subtitle="Day-by-day plan" />
              {DEMO_itinerary.map((day, i) => (
                <SitaCard key={i} className="p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">{day.day}</p>
                  <div className="space-y-1.5">
                    {day.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-xs text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </SitaCard>
              ))}
            </div>
          )}

          {view === "logistics" && (
            <div className="space-y-3">
              <SitaSectionHeader title="Household Spillover" subtitle="Home obligations affected by this trip" />
              {DEMO_householdSpillover.map((item, i) => (
                <SitaCard key={i} lane={item.urgency === "high" ? "action" : undefined} className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.item}</p>
                      {item.cost && <p className="text-xs text-muted-foreground mt-0.5">Cost: {item.cost}</p>}
                    </div>
                    <TrustBadge level={item.urgency === "high" ? "high-impact" : "review"} label={item.urgency} size="sm" />
                  </div>
                </SitaCard>
              ))}
            </div>
          )}

          {view === "post-trip" && (
            <div className="space-y-3">
              <SitaSectionHeader title="Post-Trip Recovery" subtitle="Tasks to handle after returning home" />
              {DEMO_postTripTasks.map((task, i) => (
                <SitaCard key={i} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded border border-muted-foreground/30 shrink-0" />
                    <span className="text-sm text-foreground">{task}</span>
                  </div>
                </SitaCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Travel Readiness Cards */}
          {trips.map(trip => (
            <TravelReadinessCard key={trip.id} trip={{
              id: trip.id,
              destination: trip.destination.split("—")[0].trim(),
              daysUntil: trip.daysUntil,
              readinessPercent: Math.round((trip.completedTasks / trip.tasks) * 100),
              totalItems: trip.tasks,
              completedItems: trip.completedTasks,
              missingItems: trip.id === "2" ? ["Car rental", "Airport shuttle", "Travel insurance"] : trip.id === "1" ? ["Ski rentals"] : [],
            }} />
          ))}

          {/* Reservation Status */}
          <ReservationStatusCard reservations={[
            { id: "res1", title: "Hotel — Lake Tahoe Resort", date: "Feb 14–18", status: "confirmed", linkedTrip: "Lake Tahoe" },
            { id: "res2", title: "Flight — SFO → CUN", date: "Apr 10", status: "confirmed", linkedTrip: "Cancún" },
            { id: "res3", title: "Car rental — Cancún", date: "Apr 10–17", status: "missing", linkedTrip: "Cancún" },
            { id: "res4", title: "Airport shuttle — return", date: "Apr 17", status: "pending", linkedTrip: "Cancún" },
            { id: "res5", title: "Hotel — Cancún Beach Club", date: "Apr 10–17", status: "confirmed", linkedTrip: "Cancún" },
          ]} />
          {/* Trip Summary */}
          <SitaCard className="p-4">
            <SitaCardTitle className="mb-3">Selected Trip</SitaCardTitle>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span className="text-foreground font-medium">{selectedTrip.destination.split("—")[0]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dates</span><span className="text-foreground">{selectedTrip.dates}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Travelers</span><span className="text-foreground">{selectedTrip.travelers}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="text-foreground font-medium">{selectedTrip.budget}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Spent</span><span className="text-foreground">{selectedTrip.spent}</span></div>
              <div className="border-t border-border/30 pt-2 flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="text-primary font-medium">${(parseFloat(selectedTrip.budget.replace(/[^0-9.]/g, "")) - parseFloat(selectedTrip.spent.replace(/[^0-9.]/g, ""))).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[10px] text-primary mt-2">↗ Cross-referenced with Money Center</p>
          </SitaCard>

          {/* Document Alerts with Missing Confirmations */}
          <SitaCard className="p-4">
            <SitaCardTitle className="mb-2">Document Status</SitaCardTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs text-foreground">2 passports expiring — renewal urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-foreground">Travel insurance — quotes ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-chart-2" />
                <span className="text-xs text-foreground">Hotel confirmation on file</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-chart-2" />
                <span className="text-xs text-foreground">Flight booking confirmed</span>
              </div>
            </div>
            {/* Missing Confirmations */}
            <div className="mt-3 pt-3 border-t border-border/20">
              <p className="text-[10px] font-semibold text-destructive mb-1.5">Missing Confirmations</p>
              <div className="space-y-1">
                <p className="text-[10px] text-foreground">⚠ Car rental — Cancún (not yet booked)</p>
                <p className="text-[10px] text-foreground">⚠ Airport shuttle — return leg</p>
              </div>
            </div>
            {/* Calendar Conflicts */}
            <div className="mt-3 pt-3 border-t border-border/20">
              <p className="text-[10px] font-semibold text-amber-500 mb-1.5">Calendar Conflicts</p>
              <p className="text-[10px] text-foreground">⚡ Tahoe trip overlaps with Alex's science fair (Feb 16)</p>
            </div>
          </SitaCard>

          {/* Travel Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Travel Advisor",
            message: "Kids' passports expire before the Cancún trip — start renewal NOW (6–8 week processing). Book the pet sitter today — Sarah M. has only 2 slots left. Travel insurance quotes are ready for review. Consider adding a car rental for the Chichén Itzá day trip.",
            linkedItems: ["Passport renewal", "Pet sitter booking", "Insurance quotes", "Car rental"],
            confidence: "high",
          }} />

          {/* Budget Cross-Reference */}
          <SitaCard hover={false} lane="changed" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <SitaCardTitle>Money Center Link</SitaCardTitle>
            </div>
            <p className="text-xs text-foreground">Total travel spending this year: $4,300 of $15,000 annual travel budget. Spring break trip will use 43% of remaining budget.</p>
          </SitaCard>
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default TravelPlanning;
