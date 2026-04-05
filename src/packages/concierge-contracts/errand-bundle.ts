// SITA OS — Concierge: Errand Bundle
export interface ErrandBundle {
  id: string;
  name: string;
  errands: ErrandItem[];
  optimizedRoute: Array<{ errandId: string; order: number; estimatedArrival: string }>;
  totalEstimatedMinutes: number;
  savedMinutes: number;
  suggestedTimeSlot: string;
  assignedTo?: string;
  status: "planned" | "in-progress" | "completed";
  createdAt: string;
}

export interface ErrandItem {
  id: string;
  name: string;
  location: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  deadline?: string;
  canBeCombined: boolean;
  category: string;
  coordinates?: { lat: number; lng: number };
  completed: boolean;
}
