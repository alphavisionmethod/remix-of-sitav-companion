// SITA OS — Revenue Ops: Onboarding Revenue Bootstrap Packet
export interface OnboardingRevenueBootstrapPacket {
  accountId: string;
  initialQuotes: string[];
  initialInvoices: string[];
  paymentTermsDefault: string;
  billingCurrency: string;
  taxConfiguration: { taxRate: number; taxId?: string; exempt: boolean };
  recurringSchedules: Array<{ description: string; amountCents: number; intervalMonths: number; startDate: string }>;
  estimatedFirstYearRevenueCents: number;
  bootstrappedAt: string;
  bootstrappedBy: string;
}
