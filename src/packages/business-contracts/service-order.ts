// SITA OS — Business Contracts: Service Order
export type ServiceOrderStatus = "draft" | "confirmed" | "in-progress" | "completed" | "cancelled" | "disputed";

export interface ServiceOrder {
  id: string;
  accountId: string;
  contactId: string;
  title: string;
  description: string;
  lineItems: ServiceLineItem[];
  totalCents: number;
  currency: string;
  status: ServiceOrderStatus;
  scheduledDate?: string;
  completedDate?: string;
  assignedTeam: string[];
  location?: string;
  priority: "urgent" | "high" | "normal" | "low";
  relatedQuoteId?: string;
  relatedInvoiceId?: string;
  customerSignatureUrl?: string;
  notes: string[];
  proofId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  laborHours?: number;
  materialsCostCents?: number;
  category: string;
}

export interface ServiceOrderMetrics {
  period: string;
  totalOrders: number;
  completedOrders: number;
  completionRate: number;
  avgCompletionDays: number;
  revenueCents: number;
  customerSatisfactionAvg: number;
  repeatOrderRate: number;
}
