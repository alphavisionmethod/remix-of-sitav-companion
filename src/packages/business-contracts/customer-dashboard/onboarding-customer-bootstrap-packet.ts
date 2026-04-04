// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Onboarding Bootstrap Packet
// ═══════════════════════════════════════════════════════════════

export interface OnboardingCustomerBootstrapPacket {
  customerId: string;
  accountId: string;
  contractId: string;
  primaryContactEmail: string;
  servicesSubscribed: string[];
  onboardingTemplate: string;
  kickoffDate: string;
  estimatedCompletionDate: string;
  assignedTeam: string[];
  customFields: Record<string, unknown>;
}
