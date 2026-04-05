// SITA OS — Concierge: Route Grouping
export interface RouteGrouping {
  id: string;
  name: string;
  stops: Array<{ errandId: string; location: string; order: number; estimatedMinutes: number; coordinates?: { lat: number; lng: number } }>;
  totalDistanceKm: number;
  totalEstimatedMinutes: number;
  savedMinutesVsNaive: number;
  suggestedDepartureTime: string;
  trafficCondition: "light" | "moderate" | "heavy";
  transportMode: "car" | "walking" | "transit" | "bike";
  optimizedAt: string;
}
