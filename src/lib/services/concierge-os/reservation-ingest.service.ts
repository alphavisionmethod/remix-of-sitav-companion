// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Reservation Ingest Service
// ═══════════════════════════════════════════════════════════════

import type { ReservationRecord } from "@/packages/concierge-contracts/travel";

export function ingestReservationFromEmail(emailData: Record<string, string>): ReservationRecord {
  return {
    id: `res-${Date.now()}`, type: (emailData.type as ReservationRecord["type"]) || "hotel",
    provider: emailData.provider || "Unknown", confirmationNumber: emailData.confirmation || "PENDING",
    location: emailData.location || "", costCents: parseInt(emailData.cost || "0") * 100,
    currency: "USD", status: "confirmed", ingestedAt: new Date().toISOString(),
  };
}

