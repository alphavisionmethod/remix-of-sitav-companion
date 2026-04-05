// SITA OS — Concierge: Household Maintenance Item
export interface HouseholdMaintenanceItem {
  id: string;
  title: string;
  category: "hvac" | "plumbing" | "electrical" | "appliance" | "roof" | "exterior" | "interior" | "landscaping" | "pest-control" | "safety" | "other";
  frequency: "monthly" | "quarterly" | "semi-annual" | "annual" | "as-needed";
  lastCompletedAt?: string;
  nextDueAt: string;
  estimatedCostCents?: number;
  preferredProviderId?: string;
  warrantyExpiry?: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "upcoming" | "due" | "overdue" | "scheduled" | "completed";
  notes: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}
