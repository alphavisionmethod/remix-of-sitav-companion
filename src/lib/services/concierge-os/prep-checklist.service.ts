// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Travel Prep Checklist Service
// ═══════════════════════════════════════════════════════════════

import type { TripSummary, PrepChecklistItem, TripPrepChecklist } from "@/packages/concierge-contracts";

export function generateTripChecklist(trip: TripSummary): TripPrepChecklist {
  const items: PrepChecklistItem[] = [
    { id: `p-${trip.id}-1`, task: "Check passport expiration", category: "documents", completed: false, dueDate: trip.startDate },
    { id: `p-${trip.id}-2`, task: "Book transportation to airport", category: "reservations", completed: false },
    { id: `p-${trip.id}-3`, task: "Set out-of-office", category: "work", completed: false },
    { id: `p-${trip.id}-4`, task: "Pack luggage", category: "packing", completed: false, dueDate: trip.startDate },
    { id: `p-${trip.id}-5`, task: "Arrange pet/plant care", category: "home-prep", completed: false },
    { id: `p-${trip.id}-6`, task: "Confirm all reservations", category: "reservations", completed: false },
  ];
  return { tripId: trip.id, items, completionPercent: 0 };
}

