// SITA OS — Concierge: Service Provider Memory
export interface ServiceProviderMemory {
  providerId: string;
  name: string;
  category: string;
  usageHistory: Array<{ date: string; service: string; costCents: number; rating: number; notes?: string }>;
  avgResponseTime: string;
  reliability: number;
  qualityScore: number;
  priceCompetitiveness: "below-market" | "market" | "above-market" | "premium";
  strengths: string[];
  weaknesses: string[];
  recommendation: "strongly-recommend" | "recommend" | "neutral" | "avoid";
  lastContactAt: string;
  preferredContactMethod: "phone" | "email" | "text" | "app";
  nextScheduledService?: string;
}
