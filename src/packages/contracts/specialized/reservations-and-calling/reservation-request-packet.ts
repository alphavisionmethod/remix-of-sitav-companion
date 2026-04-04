// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Reservations & Calling
// Reservation Request Packet
// ═══════════════════════════════════════════════════════════════

export interface ReservationRequestPacket {
  id: string;
  type: "restaurant" | "hotel" | "service" | "appointment" | "event";
  venue: string;
  dateTime: string;
  partySize?: number;
  preferences: Record<string, string>;
  contactName: string;
  contactPhone?: string;
  specialRequests?: string;
  status: "draft" | "submitted" | "confirmed" | "failed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
