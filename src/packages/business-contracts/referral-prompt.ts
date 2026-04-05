// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Referral & Advocacy Program
// ═══════════════════════════════════════════════════════════════

export type ReferralStatus = "identified" | "prompted" | "submitted" | "qualified" | "converted" | "rewarded" | "expired";

export interface ReferralPrompt {
  id: string;
  customerId: string;
  customerName: string;
  triggerEvent: "high-nps" | "successful-delivery" | "renewal" | "milestone" | "manual";
  channel: "email" | "in-app" | "sms" | "phone";
  message: string;
  promptedAt: string;
  respondedAt?: string;
  status: ReferralStatus;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName: string;
  referredName: string;
  referredEmail: string;
  referredCompany?: string;
  status: ReferralStatus;
  estimatedValueCents: number;
  actualValueCents?: number;
  convertedToLeadId?: string;
  convertedToOpportunityId?: string;
  rewardType?: "cash" | "credit" | "discount" | "gift" | "none";
  rewardValueCents?: number;
  rewardIssuedAt?: string;
  createdAt: string;
  convertedAt?: string;
}

export interface ReferralProgramMetrics {
  period: string;
  totalPrompts: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  convertedReferrals: number;
  conversionRate: number;
  totalRevenueGeneratedCents: number;
  totalRewardsPaidCents: number;
  roi: number;
  topReferrers: Array<{ customerId: string; name: string; referralCount: number; revenueCents: number }>;
  avgTimeToConversionDays: number;
}
