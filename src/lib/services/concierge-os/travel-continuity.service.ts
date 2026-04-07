// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Travel Continuity Service
// ═══════════════════════════════════════════════════════════════

import type { TripSummary, TripPrepChecklist, PrepChecklistItem } from "@/packages/concierge-contracts";
import type { ReservationRecord } from "@/packages/concierge-contracts/travel";

export function buildPrepChecklist(trip: TripSummary): TripPrepChecklist {
  const items: PrepChecklistItem[] = [
    { id: `prep-${trip.id}-1`, task: "Check passport expiration", category: "documents", completed: false, dueDate: trip.startDate },
    { id: `prep-${trip.id}-2`, task: "Arrange pet care", category: "pet-care", completed: false, dueDate: trip.startDate },
    { id: `prep-${trip.id}-3`, task: "Set out-of-office reply", category: "work", completed: false, dueDate: trip.startDate },
    { id: `prep-${trip.id}-4`, task: "Pack luggage", category: "packing", completed: false, dueDate: trip.startDate },
    { id: `prep-${trip.id}-5`, task: "Confirm all reservations", category: "reservations", completed: false, dueDate: trip.startDate },
    { id: `prep-${trip.id}-6`, task: "Secure home (lock windows, set alarm)", category: "home-prep", completed: false, dueDate: trip.startDate },
  ];

  const completed = items.filter(i => i.completed).length;
  return {
    tripId: trip.id,
    items,
    completionPercent: items.length > 0 ? Math.round((completed / items.length) * 100) : 100,
  };
}

export function ingestReservation(emailData: Record<string, string>): ReservationRecord {
  return {
    id: `res-${Date.now()}`,
    type: "hotel",
    provider: emailData.provider || "Unknown",
    confirmationNumber: emailData.confirmation || "PENDING",
    location: emailData.location || "",
    costCents: parseInt(emailData.cost || "0") * 100,
    currency: "USD",
    status: "confirmed",
    ingestedAt: new Date().toISOString(),
  };
}

export function assessTripReadiness(trip: TripSummary, checklist: TripPrepChecklist): {
  readinessScore: number;
  blockers: string[];
  recommendations: string[];
} {
  const uncompletedCritical = checklist.items.filter(i => !i.completed && (i.category === "documents" || i.category === "reservations"));
  const blockers = uncompletedCritical.map(i => i.task);
  const readinessScore = checklist.completionPercent;
  const recommendations: string[] = [];

  if (readinessScore < 50) recommendations.push("Many prep items remain — consider delegating");
  if (blockers.length > 0) recommendations.push(`${blockers.length} critical items need attention`);

  return { readinessScore, blockers, recommendations };
}

