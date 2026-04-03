export interface ReactivationCandidate {
  accountId: string;
  accountName: string;
  lastActiveAt: string;
  dormantDays: number;
  previousRevenueCents: number;
  reactivationProbability: number; // 0-100
  suggestedApproach: "discount-offer" | "new-product" | "check-in" | "event-invite";
  triggerSignals: string[];
  estimatedRecoveryCents: number;
  identifiedAt: string;
}
