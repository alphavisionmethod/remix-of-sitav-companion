export interface EmotionalLoadScore {
  overall: number;
  level: "low" | "moderate" | "high" | "critical";
  factors: LoadFactor[];
  recommendation: string;
}

export interface LoadFactor {
  category: string;
  score: number;
  label: string;
  icon: string;
}

export interface RhythmPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  dayOfWeek?: string;
  timeOfDay?: string;
  frequency: string;
  trend: "stable" | "emerging" | "declining";
}

export interface ProactiveSuggestion {
  id: string;
  title: string;
  reason: string;
  impact: "high" | "medium" | "low";
  category: string;
  actionable: boolean;
  suggestedTime?: string;
}

export interface ContinuitySnapshot {
  loadScore: EmotionalLoadScore;
  rhythms: RhythmPattern[];
  suggestions: ProactiveSuggestion[];
  weeklyTrend: number[];
}

export function calculateEmotionalLoad(taskCount: number, overdueCount: number, conflictCount: number, upcomingDeadlines: number): EmotionalLoadScore {
  const taskPressure = Math.min(taskCount * 6, 30);
  const overduePressure = Math.min(overdueCount * 15, 35);
  const conflictPressure = Math.min(conflictCount * 12, 25);
  const deadlinePressure = Math.min(upcomingDeadlines * 5, 10);
  const overall = Math.min(taskPressure + overduePressure + conflictPressure + deadlinePressure, 100);
  const level: EmotionalLoadScore["level"] = overall <= 25 ? "low" : overall <= 50 ? "moderate" : overall <= 75 ? "high" : "critical";
  const factors: LoadFactor[] = [
    { category: "Task Density", score: taskPressure, label: `${taskCount} active tasks`, icon: "list" },
    { category: "Overdue Items", score: overduePressure, label: `${overdueCount} overdue`, icon: "alert" },
    { category: "Schedule Conflicts", score: conflictPressure, label: `${conflictCount} conflicts`, icon: "calendar" },
    { category: "Upcoming Deadlines", score: deadlinePressure, label: `${upcomingDeadlines} this week`, icon: "clock" },
  ];
  const recommendations: Record<EmotionalLoadScore["level"], string> = {
    low: "Household is running smoothly. Good time to tackle deferred items.",
    moderate: "Some pressure building. Prioritize the overdue items and defer non-urgent tasks.",
    high: "Load is heavy. Consider delegating or deferring 2-3 items. Focus on time-sensitive commitments only.",
    critical: "Household is overloaded. Immediate triage recommended — defer everything non-essential.",
  };
  return { overall, level, factors, recommendation: recommendations[level] };
}

export function detectRhythms(): RhythmPattern[] {
  return [
    { id: "R-001", name: "Sunday Grocery Run", description: "Grocery shopping consistently happens on Sundays between 10-12 AM", confidence: 93, dayOfWeek: "Sunday", timeOfDay: "10:00 AM", frequency: "Weekly", trend: "stable" },
    { id: "R-002", name: "Monday Morning Reset", description: "Household planning and task review happens Monday mornings", confidence: 87, dayOfWeek: "Monday", timeOfDay: "8:00 AM", frequency: "Weekly", trend: "stable" },
    { id: "R-003", name: "Thursday Carpool Peak", description: "Highest transport load — soccer, piano, and errands cluster on Thursdays", confidence: 82, dayOfWeek: "Thursday", frequency: "Weekly", trend: "emerging" },
    { id: "R-004", name: "Bill Payment Window", description: "Bills typically reviewed and paid between 1st-5th of each month", confidence: 95, frequency: "Monthly", trend: "stable" },
    { id: "R-005", name: "Evening Wind-Down", description: "No new tasks created after 8 PM — family downtime pattern", confidence: 78, timeOfDay: "8:00 PM", frequency: "Daily", trend: "stable" },
  ];
}

export function generateSuggestions(load: EmotionalLoadScore): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [
    { id: "S-001", title: "Batch Thursday errands", reason: "3 transport tasks on Thursday can be consolidated into one trip saving ~45 min", impact: "high", category: "scheduling", actionable: true, suggestedTime: "Thursday 3:00 PM" },
    { id: "S-002", title: "Pre-sign permission slips digitally", reason: "Pattern detected: permission slips cause last-minute stress. Auto-sign when low-risk.", impact: "medium", category: "automation", actionable: true },
    { id: "S-003", title: "Set up recurring grocery order", reason: "80% of your grocery list repeats weekly. Auto-ordering saves 30 min/week.", impact: "high", category: "automation", actionable: true, suggestedTime: "Saturday 9:00 AM" },
    { id: "S-004", title: "Delegate passport renewal", reason: "Expiring in 60 days — processing takes 6-8 weeks. Start now to avoid rush fees.", impact: "high", category: "delegation", actionable: true },
    { id: "S-005", title: "Move dentist to after school", reason: "10 AM appointment conflicts with your Tuesday client meetings", impact: "medium", category: "scheduling", actionable: true, suggestedTime: "3:30 PM" },
  ];
  if (load.level === "high" || load.level === "critical") {
    suggestions.unshift({ id: "S-000", title: "Activate triage mode", reason: "Load is " + load.level + ". Defer all non-urgent items and focus on top 3 priorities.", impact: "high", category: "triage", actionable: true });
  }
  return suggestions;
}

export function getContinuitySnapshot(taskCount = 6, overdueCount = 2, conflictCount = 1, upcomingDeadlines = 3): ContinuitySnapshot {
  const loadScore = calculateEmotionalLoad(taskCount, overdueCount, conflictCount, upcomingDeadlines);
  const rhythms = detectRhythms();
  const suggestions = generateSuggestions(loadScore);
  const weeklyTrend = [32, 45, 38, 52, 48, 41, loadScore.overall];
  return { loadScore, rhythms, suggestions, weeklyTrend };
}
