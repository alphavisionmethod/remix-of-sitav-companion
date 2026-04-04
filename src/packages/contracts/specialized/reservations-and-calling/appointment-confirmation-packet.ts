// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Reservations & Calling
// Appointment Confirmation Packet
// ═══════════════════════════════════════════════════════════════

export interface AppointmentConfirmationPacket {
  id: string;
  reservationId: string;
  confirmationNumber: string;
  confirmedDateTime: string;
  venue: string;
  details: Record<string, unknown>;
  confirmedAt: string;
  confirmedBy: string; // "agent" | "venue" | "system"
  expiresAt?: string;
  cancellationPolicy?: string;
}
