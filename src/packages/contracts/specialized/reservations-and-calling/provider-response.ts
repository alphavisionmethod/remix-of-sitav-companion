// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Reservations & Calling
// Provider Response
// ═══════════════════════════════════════════════════════════════

export interface ProviderResponse {
  id: string;
  requestId: string;
  provider: string;
  responseType: "confirmation" | "counter-offer" | "rejection" | "waitlist" | "callback-requested";
  details: Record<string, unknown>;
  alternativeOptions?: Array<{
    dateTime: string;
    details: string;
  }>;
  respondedAt: string;
  expiresAt?: string;
  requiresAction: boolean;
}
