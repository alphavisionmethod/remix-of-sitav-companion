// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS Domain Engine
// Pure deterministic functions for life logistics intelligence
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────

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
  rating: number;          // 0-5
  reviewCount: number;
  duration?: number;        // minutes
  distance?: number;        // km
  departureTime?: number;
  arrivalTime?: number;
  cancellable: boolean;
  refundable: boolean;
  preferences: string[];    // matched user preferences
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  location?: string;
  category: "work" | "personal" | "school" | "health" | "social" | "travel" | "family";
  attendees?: string[];
  isFixed: boolean;         // cannot be moved
  bufferMinutes: number;    // time needed before/after
}

export interface ItineraryDay {
  date: string;             // YYYY-MM-DD
  items: ItineraryItem[];
  totalCost: number;
  travelMinutes: number;
  notes: string[];
}

export interface ItineraryItem {
  time: string;
  activity: string;
  location?: string;
  duration: number;         // minutes
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
  completionRate: number;   // 0-1 over last 30 days
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

export interface HouseholdMember {
  id: string;
  name: string;
  role: "adult" | "teen" | "child";
  taskCapacity: number;     // tasks per week
  currentLoad: number;      // current assigned tasks
  preferences: string[];
  availability: { dayOfWeek: number; startHour: number; endHour: number }[];
}

// ── Result Types ─────────────────────────────────────────────────

export interface TaskPrioritization {
  prioritized: (Task & { score: number; reason: string })[];
  blocked: Task[];
  deferred: Task[];
  totalEstimatedMinutes: number;
  suggestedFocusBlock: { tasks: Task[]; totalMinutes: number; optimalTimeOfDay: string };
}

export interface BookingScoreResult {
  id: string;
  score: number;            // 0-100
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
  overallScore: number;     // 0-100
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
  memberLoads: { member: HouseholdMember; load: number; capacity: number; status: "light" | "balanced" | "heavy" | "overloaded" }[];
  unassignedTasks: Task[];
  suggestedAssignments: { task: Task; member: HouseholdMember; reason: string }[];
  fairnessScore: number;   // 0-100
  recommendations: string[];
}

// ── Task Prioritization ─────────────────────────────────────────

export function prioritizeTasks(tasks: Task[]): TaskPrioritization {
  const now = Date.now();
  const blocked = tasks.filter(t => t.status === "blocked");
  const deferred = tasks.filter(t => t.status === "deferred");
  const actionable = tasks.filter(t => t.status === "pending" || t.status === "in-progress");

  const scored = actionable.map(task => {
    let score = 0;
    let reason = "";

    // Urgency from priority (0-30)
    const priorityScores = { urgent: 30, high: 22, medium: 14, low: 6 };
    score += priorityScores[task.priority];

    // Due date pressure (0-30)
    if (task.dueDate) {
      const hoursUntilDue = (task.dueDate - now) / 3600000;
      if (hoursUntilDue < 0) { score += 30; reason = "Overdue"; }
      else if (hoursUntilDue < 4) { score += 28; reason = "Due very soon"; }
      else if (hoursUntilDue < 24) { score += 22; reason = "Due today"; }
      else if (hoursUntilDue < 72) { score += 15; reason = "Due within 3 days"; }
      else if (hoursUntilDue < 168) { score += 8; reason = "Due this week"; }
    }

    // Quick-win bonus (0-15) — short tasks score higher for momentum
    if (task.estimatedMinutes <= 15) score += 15;
    else if (task.estimatedMinutes <= 30) score += 10;
    else if (task.estimatedMinutes <= 60) score += 5;

    // In-progress bonus (10)
    if (task.status === "in-progress") { score += 10; reason = reason || "Already in progress"; }

    // Category importance (0-10)
    const categoryBonus: Record<string, number> = { health: 10, school: 8, family: 7, household: 5, errands: 4, maintenance: 3, personal: 2, admin: 1 };
    score += categoryBonus[task.category] ?? 0;

    // Energy match (current time heuristic)
    const hour = new Date().getHours();
    const isMorning = hour >= 6 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 17;
    if (isMorning && task.energyLevel === "high") score += 5;
    if (isAfternoon && task.energyLevel === "medium") score += 5;
    if (hour >= 17 && task.energyLevel === "low") score += 5;

    if (!reason) reason = `Priority: ${task.priority}`;

    return { ...task, score: Math.min(100, score), reason };
  });

  scored.sort((a, b) => b.score - a.score);

  const totalEstimatedMinutes = scored.reduce((s, t) => s + t.estimatedMinutes, 0);

  // Build suggested focus block — top tasks fitting in ~90 minutes
  const focusTasks: Task[] = [];
  let focusTotal = 0;
  for (const t of scored) {
    if (focusTotal + t.estimatedMinutes <= 90) {
      focusTasks.push(t);
      focusTotal += t.estimatedMinutes;
    }
  }

  const hour = new Date().getHours();
  const optimalTimeOfDay = hour < 10 ? "morning" : hour < 14 ? "early afternoon" : hour < 18 ? "late afternoon" : "evening";

  return {
    prioritized: scored,
    blocked,
    deferred,
    totalEstimatedMinutes,
    suggestedFocusBlock: { tasks: focusTasks, totalMinutes: focusTotal, optimalTimeOfDay },
  };
}

// ── Booking Scoring ─────────────────────────────────────────────

export function scoreBookingOptions(options: BookingOption[], userPreferences: string[] = []): BookingScoreResult[] {
  return options.map(option => {
    const factors: BookingScoreResult["factors"] = [];

    // Price (weight 0.30) — lower is better, normalized against max
    const maxPrice = Math.max(...options.map(o => o.price), 1);
    const priceScore = Math.round((1 - option.price / maxPrice) * 100);
    factors.push({ factor: "Price", weight: 0.30, score: priceScore });

    // Rating (weight 0.25)
    const ratingScore = Math.round((option.rating / 5) * 100);
    factors.push({ factor: "Rating", weight: 0.25, score: ratingScore });

    // Review confidence (weight 0.10)
    const reviewScore = Math.min(100, Math.round(Math.log10(option.reviewCount + 1) * 33));
    factors.push({ factor: "Reviews", weight: 0.10, score: reviewScore });

    // Preference match (weight 0.20)
    const matchCount = option.preferences.filter(p => userPreferences.includes(p)).length;
    const prefScore = userPreferences.length > 0 ? Math.round((matchCount / userPreferences.length) * 100) : 50;
    factors.push({ factor: "Preferences", weight: 0.20, score: prefScore });

    // Flexibility (weight 0.15)
    const flexScore = (option.cancellable ? 50 : 0) + (option.refundable ? 50 : 0);
    factors.push({ factor: "Flexibility", weight: 0.15, score: flexScore });

    const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));

    const recommendation: BookingScoreResult["recommendation"] =
      score >= 75 ? "strong" : score >= 55 ? "good" : score >= 35 ? "acceptable" : "weak";

    const tradeoffs: string[] = [];
    if (priceScore < 30) tradeoffs.push("Higher price than alternatives");
    if (ratingScore < 60) tradeoffs.push("Lower rating — check recent reviews");
    if (!option.refundable) tradeoffs.push("Non-refundable");
    if (!option.cancellable) tradeoffs.push("Non-cancellable");

    return { id: option.id, score, factors, recommendation, tradeoffs };
  }).sort((a, b) => b.score - a.score);
}

// ── Calendar Conflict Detection ─────────────────────────────────

export function detectConflicts(events: CalendarEvent[]): ConflictResult {
  const conflicts: ConflictResult["conflicts"] = [];
  const warnings: ConflictResult["warnings"] = [];

  const sorted = [...events].sort((a, b) => a.startTime - b.startTime);

  for (let i = 0; i < sorted.length; i++) {
    const e1 = sorted[i];

    // Check for buffer violations and overlaps with subsequent events
    for (let j = i + 1; j < sorted.length; j++) {
      const e2 = sorted[j];
      if (e2.startTime >= e1.endTime + e1.bufferMinutes * 60000) break;

      if (e2.startTime < e1.endTime) {
        const overlapMinutes = Math.round((e1.endTime - e2.startTime) / 60000);
        const resolution = !e1.isFixed && e2.isFixed
          ? `Move "${e1.title}" earlier`
          : e1.isFixed && !e2.isFixed
          ? `Move "${e2.title}" later`
          : "Review and reschedule one event";
        conflicts.push({ event1: e1, event2: e2, overlapMinutes, resolution });
      } else if (e2.startTime < e1.endTime + e1.bufferMinutes * 60000) {
        warnings.push({
          event: e1,
          issue: `Only ${Math.round((e2.startTime - e1.endTime) / 60000)}min gap before "${e2.title}"`,
          suggestion: `Consider ${e1.bufferMinutes}min buffer after "${e1.title}"`,
        });
      }
    }

    // Check for long days
    const eventDuration = (e1.endTime - e1.startTime) / 3600000;
    if (eventDuration > 4) {
      warnings.push({ event: e1, issue: `${eventDuration.toFixed(1)}h event — consider breaks`, suggestion: "Add a 15-minute break midway" });
    }
  }

  // Find free slots (between 8am and 8pm)
  const freeSlots: ConflictResult["freeSlots"] = [];
  const dayStart = new Date(); dayStart.setHours(8, 0, 0, 0);
  const dayEnd = new Date(); dayEnd.setHours(20, 0, 0, 0);
  const todayEvents = sorted.filter(e => e.startTime >= dayStart.getTime() && e.startTime <= dayEnd.getTime());

  let cursor = dayStart.getTime();
  for (const evt of todayEvents) {
    if (evt.startTime > cursor + 900000) { // >15 min gap
      freeSlots.push({ start: cursor, end: evt.startTime - evt.bufferMinutes * 60000, durationMinutes: Math.round((evt.startTime - cursor) / 60000) });
    }
    cursor = Math.max(cursor, evt.endTime + evt.bufferMinutes * 60000);
  }
  if (cursor < dayEnd.getTime() - 900000) {
    freeSlots.push({ start: cursor, end: dayEnd.getTime(), durationMinutes: Math.round((dayEnd.getTime() - cursor) / 60000) });
  }

  return { conflicts, warnings, freeSlots };
}

// ── Itinerary Builder ───────────────────────────────────────────

export function buildItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  activities: { name: string; duration: number; cost: number; type: ItineraryItem["type"]; location?: string; timePreference?: "morning" | "afternoon" | "evening" }[],
  budget?: number
): ItineraryDay[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));

  const days: ItineraryDay[] = [];
  const activitiesCopy = [...activities];

  for (let d = 0; d < dayCount; d++) {
    const date = new Date(start.getTime() + d * 86400000);
    const dateStr = date.toISOString().split("T")[0];
    const items: ItineraryItem[] = [];
    let totalCost = 0;
    let travelMinutes = 0;

    // Morning slot (9-12)
    const morningActivities = activitiesCopy.filter(a => a.timePreference === "morning" || !a.timePreference);
    if (morningActivities.length > 0) {
      const act = morningActivities[0];
      activitiesCopy.splice(activitiesCopy.indexOf(act), 1);
      items.push({ time: "09:00", activity: act.name, location: act.location, duration: act.duration, cost: act.cost, type: act.type, bookingRequired: act.type !== "rest", bookingStatus: "suggested" });
      totalCost += act.cost;
    }

    // Lunch
    items.push({ time: "12:30", activity: `Lunch in ${destination}`, duration: 60, cost: 25, type: "meal", bookingRequired: false, bookingStatus: "suggested" });
    totalCost += 25;

    // Afternoon slot (14-17)
    const afternoonActivities = activitiesCopy.filter(a => a.timePreference === "afternoon" || !a.timePreference);
    if (afternoonActivities.length > 0) {
      const act = afternoonActivities[0];
      activitiesCopy.splice(activitiesCopy.indexOf(act), 1);
      items.push({ time: "14:00", activity: act.name, location: act.location, duration: act.duration, cost: act.cost, type: act.type, bookingRequired: act.type !== "rest", bookingStatus: "suggested" });
      totalCost += act.cost;
      travelMinutes += 20;
    }

    // Evening
    const eveningActivities = activitiesCopy.filter(a => a.timePreference === "evening");
    if (eveningActivities.length > 0) {
      const act = eveningActivities[0];
      activitiesCopy.splice(activitiesCopy.indexOf(act), 1);
      items.push({ time: "19:00", activity: act.name, location: act.location, duration: act.duration, cost: act.cost, type: act.type, bookingRequired: act.type !== "rest", bookingStatus: "suggested" });
      totalCost += act.cost;
    } else {
      items.push({ time: "19:00", activity: `Dinner in ${destination}`, duration: 90, cost: 45, type: "meal", bookingRequired: false, bookingStatus: "suggested" });
      totalCost += 45;
    }

    const notes: string[] = [];
    if (budget && totalCost > budget / dayCount) {
      notes.push(`Day exceeds daily budget target of $${Math.round(budget / dayCount)}`);
    }

    days.push({ date: dateStr, items, totalCost, travelMinutes, notes });
  }

  return days;
}

// ── Routine Health Evaluation ───────────────────────────────────

export function evaluateRoutineHealth(routines: Routine[]): RoutineHealthResult {
  if (routines.length === 0) {
    return { overallScore: 50, routines: [], recommendations: ["Set up daily routines for consistency"] };
  }

  const evaluated = routines.map(r => {
    const health: "thriving" | "stable" | "declining" | "broken" =
      r.completionRate >= 0.85 && r.streakDays >= 7 ? "thriving" :
      r.completionRate >= 0.65 ? "stable" :
      r.completionRate >= 0.4 ? "declining" : "broken";

    const suggestion =
      health === "thriving" ? "Keep it up — strong consistency"
      : health === "stable" ? "Good progress — try to build a longer streak"
      : health === "declining" ? "Consider simplifying this routine or adjusting timing"
      : "Reset this routine — start with fewer steps";

    return { name: r.name, health, completionRate: r.completionRate, streak: r.streakDays, suggestion };
  });

  const overallScore = Math.round(evaluated.reduce((s, r) => {
    const healthScore = { thriving: 100, stable: 70, declining: 40, broken: 15 };
    return s + healthScore[r.health];
  }, 0) / evaluated.length);

  const recommendations: string[] = [];
  const broken = evaluated.filter(r => r.health === "broken");
  if (broken.length > 0) recommendations.push(`${broken.length} routine(s) need resetting — simplify and restart`);
  const declining = evaluated.filter(r => r.health === "declining");
  if (declining.length > 0) recommendations.push(`${declining.length} routine(s) declining — review what's blocking completion`);

  return { overallScore, routines: evaluated, recommendations };
}

// ── Errand Optimization ─────────────────────────────────────────

export function optimizeErrands(errands: Errand[]): ErrandOptimization {
  if (errands.length === 0) {
    return { optimizedOrder: [], totalEstimatedMinutes: 0, combinedStops: [], savedMinutes: 0, suggestedTimeSlot: "morning" };
  }

  // Group by location for combined stops
  const locationGroups: Map<string, Errand[]> = new Map();
  for (const e of errands) {
    const key = e.location.toLowerCase().trim();
    const existing = locationGroups.get(key);
    if (existing) existing.push(e);
    else locationGroups.set(key, [e]);
  }

  const combinedStops: ErrandOptimization["combinedStops"] = [];
  for (const [location, group] of locationGroups) {
    if (group.length > 1) {
      combinedStops.push({ errands: group, location: group[0].location, reason: `${group.length} errands at same location` });
    }
  }

  // Sort by priority, then by deadline
  const sorted = [...errands].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (diff !== 0) return diff;
    return (a.deadline ?? Infinity) - (b.deadline ?? Infinity);
  });

  const naiveTotal = errands.reduce((s, e) => s + e.estimatedMinutes, 0) + (errands.length - 1) * 15; // 15min travel between each
  const optimizedTotal = sorted.reduce((s, e) => s + e.estimatedMinutes, 0) + Math.max(0, (locationGroups.size - 1) * 15);
  const savedMinutes = Math.max(0, naiveTotal - optimizedTotal);

  const hour = new Date().getHours();
  const suggestedTimeSlot = hour < 10 ? "this morning" : hour < 14 ? "early afternoon" : "tomorrow morning";

  return { optimizedOrder: sorted, totalEstimatedMinutes: optimizedTotal, combinedStops, savedMinutes, suggestedTimeSlot };
}

// ── Household Coordination ──────────────────────────────────────

export function coordinateHousehold(members: HouseholdMember[], tasks: Task[]): HouseholdCoordination {
  const unassigned = tasks.filter(t => !t.assignedTo && t.status !== "done" && t.status !== "deferred");
  const memberLoads = members.map(m => {
    const load = tasks.filter(t => t.assignedTo === m.id && t.status !== "done").length;
    const utilization = m.taskCapacity > 0 ? load / m.taskCapacity : 0;
    const status: "light" | "balanced" | "heavy" | "overloaded" =
      utilization < 0.3 ? "light" :
      utilization < 0.7 ? "balanced" :
      utilization < 1.0 ? "heavy" : "overloaded";
    return { member: m, load, capacity: m.taskCapacity, status };
  });

  // Suggest assignments for unassigned tasks
  const suggestedAssignments: HouseholdCoordination["suggestedAssignments"] = [];
  for (const task of unassigned) {
    // Find member with lightest load who can handle this category
    const available = memberLoads
      .filter(ml => ml.status !== "overloaded")
      .filter(ml => ml.member.role !== "child" || task.category === "personal" || task.category === "school")
      .sort((a, b) => (a.load / a.capacity) - (b.load / b.capacity));

    if (available.length > 0) {
      const best = available[0];
      suggestedAssignments.push({
        task,
        member: best.member,
        reason: `${best.member.name} has capacity (${best.load}/${best.capacity} tasks)`,
      });
    }
  }

  // Fairness score — how evenly distributed is the load
  const utilizations = memberLoads.map(ml => ml.capacity > 0 ? ml.load / ml.capacity : 0);
  const avgUtil = utilizations.reduce((s, u) => s + u, 0) / Math.max(1, utilizations.length);
  const variance = utilizations.reduce((s, u) => s + (u - avgUtil) ** 2, 0) / Math.max(1, utilizations.length);
  const fairnessScore = Math.round(Math.max(0, 100 - variance * 200));

  const recommendations: string[] = [];
  const overloaded = memberLoads.filter(ml => ml.status === "overloaded");
  if (overloaded.length > 0) recommendations.push(`${overloaded.map(m => m.member.name).join(", ")} overloaded — redistribute tasks`);
  if (unassigned.length > 0) recommendations.push(`${unassigned.length} unassigned task(s) — review suggested assignments`);
  if (fairnessScore < 50) recommendations.push("Task distribution is uneven — consider rebalancing");

  return { memberLoads, unassignedTasks: unassigned, suggestedAssignments, fairnessScore, recommendations };
}
