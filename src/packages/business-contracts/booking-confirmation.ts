// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Booking Confirmation
// ═══════════════════════════════════════════════════════════════

export interface BookingConfirmation {
  bookingId: string;
  confirmed: boolean;
  confirmationCode: string;
  notifiedAt: string;
  notificationChannel: "email" | "sms" | "push" | "in-app";
  confirmedBy?: string;
  confirmedAt?: string;
  expiresAt?: string;
}
