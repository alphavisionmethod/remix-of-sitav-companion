// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Engine Canonical Types
// Migrated from src/lib/domain-engines/concierge-os.ts
// ═══════════════════════════════════════════════════════════════

export interface Task {
  id: string;
  title: string;
  category: "household" | "errands" | "school" | "health" | "personal" | "family" | "maintenance" | "admin";
  priority: "urgent" | "high" | "medium" | "low";
  dueDate?: number;
  estimatedMinutes: number;
  assignedTo?: string;
  status: "pending" | "in-progress" | "blocked" | "done" | "deferred";
  dependencies?: string[];
  recurring: boolean;
  frequency?: "daily" | "weekly" | "biweekly" | "monthly";
  location?: string;
  energyLevel: "high" | "medium" | "low";
}

export interface BookingOption {
  id: string;
  type: "flight" | "hotel" | "restaurant" | "activity" | "transport" | "service";
  provider: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  duration?: number;
  distance?: number;
  departureTime?: number;
  arrivalTime?: number;
  cancellable: boolean;
  refundable: boolean;
  preferences: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  location?: string;
  category: "work" | "personal" | "school" | "health" | "social" | "travel" | "family";
  attendees?: string[];
  isFixed: boolean;
  bufferMinutes: number;
}

export interface ItineraryDay {
  date: string;
  items: ItineraryItem[];
  totalCost: number;
  travelMinutes: number;
  notes: string[];
}

export interface ItineraryItem {
  time: string;
  activity: string;
  location?: string;
  duration: number;
  cost: number;
  type: "transport" | "accommodation" | "meal" | "activity" | "rest" | "transit";
  bookingRequired: boolean;
  bookingStatus?: "confirmed" | "pending" | "suggested";
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  type: "morning" | "evening" | "weekly" | "monthly";
  tasks: string[];
  completionRate: number;
  streakDays: number;
  lastCompleted?: number;
  averageDurationMinutes: number;
}

export interface Errand {
  id: string;
  name: string;
  location: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  deadline?: number;
  canBeCombined: boolean;
  category: string;
  coordinates?: { lat: number; lng: number };
}

export interface ConciergeHouseholdMember {
  id: string;
  name: string;
  role: "adult" | "teen" | "child";
  taskCapacity: number;
  currentLoad: number;
  preferences: string[];
  availability: { dayOfWeek: number; startHour: number; endHour: number }[];
}

export interface TaskPrioritization {
  prioritized: (Task & { score: number; reason: string })[];
  blocked: Task[];
  deferred: Task[];
  totalEstimatedMinutes: number;
  suggestedFocusBlock: { tasks: Task[]; totalMinutes: number; optimalTimeOfDay: string };
}

export interface BookingScoreResult {
  id: string;
  score: number;
  factors: { factor: string; weight: number; score: number }[];
  recommendation: "strong" | "good" | "acceptable" | "weak";
  tradeoffs: string[];
}

export interface ConflictResult {
  conflicts: { event1: CalendarEvent; event2: CalendarEvent; overlapMinutes: number; resolution: string }[];
  warnings: { event: CalendarEvent; issue: string; suggestion: string }[];
  freeSlots: { start: number; end: number; durationMinutes: number }[];
}

export interface RoutineHealthResult {
  overallScore: number;
  routines: { name: string; health: "thriving" | "stable" | "declining" | "broken"; completionRate: number; streak: number; suggestion: string }[];
  recommendations: string[];
}

export interface ErrandOptimization {
  optimizedOrder: Errand[];
  totalEstimatedMinutes: number;
  combinedStops: { errands: Errand[]; location: string; reason: string }[];
  savedMinutes: number;
  suggestedTimeSlot: string;
}

export interface HouseholdCoordination {
  memberLoads: { member: ConciergeHouseholdMember; load: number; capacity: number; status: "light" | "balanced" | "heavy" | "overloaded" }[];
  unassignedTasks: Task[];
  suggestedAssignments: { task: Task; member: ConciergeHouseholdMember; reason: string }[];
  fairnessScore: number;
  recommendations: string[];
}
