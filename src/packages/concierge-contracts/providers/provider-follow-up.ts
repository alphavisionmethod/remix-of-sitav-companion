export interface ProviderFollowUp {
  id: string;
  providerId: string;
  providerName: string;
  type: "quality-check" | "quote-request" | "appointment-follow-up" | "review-reminder" | "warranty-claim";
  reason: string;
  dueDate: string;
  status: "pending" | "contacted" | "resolved" | "dismissed";
  priority: "high" | "medium" | "low";
  notes: string;
  createdAt: string;
}
