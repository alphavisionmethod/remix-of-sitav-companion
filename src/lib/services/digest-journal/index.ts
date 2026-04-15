// ═══════════════════════════════════════════════════════════════
// SITA OS — Digest & Journal System
// Daily executive digest, weekly trends, monthly reviews,
// delivery preferences and scheduling.
// ═══════════════════════════════════════════════════════════════

export type DigestFrequency = "daily" | "weekly" | "monthly";
export type DigestChannel = "in_app" | "email" | "push";

export interface DigestPreferences {
  user_id: string;
  enabled_frequencies: DigestFrequency[];
  channels: DigestChannel[];
  daily_time_utc: string;
  weekly_day: number;
  monthly_day: number;
  include_domains: string[];
  exclude_low_priority: boolean;
}

export interface DailyDigest {
  id: string;
  user_id: string;
  date: string;
  headline: string;
  summary: string;
  sections: DigestSection[];
  ai_commentary: string;
  action_items: DigestActionItem[];
  health_score: number;
  generated_at: string;
}

export interface DigestSection {
  domain: string;
  title: string;
  highlights: string[];
  metrics: Array<{ label: string; value: string; trend: "up" | "down" | "flat" }>;
  alerts: string[];
  advisor_notes: string[];
}

export interface DigestActionItem {
  id: string;
  priority: "critical" | "high" | "normal" | "low";
  title: string;
  description: string;
  domain: string;
  due_date?: string;
  source: string;
}

export interface WeeklyJournal {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  executive_summary: string;
  trend_analysis: Array<{
    metric: string;
    direction: "improving" | "declining" | "stable";
    magnitude: number;
    commentary: string;
  }>;
  top_wins: string[];
  concerns: string[];
  advisor_commentary: Record<string, string>;
  next_week_priorities: string[];
  generated_at: string;
}

export interface MonthlyReview {
  id: string;
  user_id: string;
  month: string;
  strategic_summary: string;
  kpi_scorecard: Array<{
    kpi: string;
    target: number;
    actual: number;
    status: "exceeded" | "met" | "missed";
  }>;
  objective_progress: Array<{
    objective: string;
    completion_percent: number;
    blockers: string[];
  }>;
  financial_summary: { revenue: number; costs: number; margin_percent: number; runway_months: number };
  ai_strategic_assessment: string;
  recommendations: string[];
  generated_at: string;
}

export class DigestJournalService {
  async generateDailyDigest(userId: string, date: string): Promise<DailyDigest> {
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      date,
      headline: `Your ${date} briefing`,
      summary: "Digest generation requires AI synthesis of domain data.",
      sections: [],
      ai_commentary: "Connect domain data sources for personalized insights.",
      action_items: [],
      health_score: 0.75,
      generated_at: new Date().toISOString(),
    };
  }

  async generateWeeklyJournal(userId: string, weekStart: string): Promise<WeeklyJournal> {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return {
      id: crypto.randomUUID(),
      user_id: userId,
      week_start: weekStart,
      week_end: end.toISOString().split("T")[0],
      executive_summary: "Weekly journal synthesis requires connected domain data.",
      trend_analysis: [],
      top_wins: [],
      concerns: [],
      advisor_commentary: {},
      next_week_priorities: [],
      generated_at: new Date().toISOString(),
    };
  }

  async generateMonthlyReview(userId: string, month: string): Promise<MonthlyReview> {
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      month,
      strategic_summary: "Monthly review synthesis requires connected domain data.",
      kpi_scorecard: [],
      objective_progress: [],
      financial_summary: { revenue: 0, costs: 0, margin_percent: 0, runway_months: 0 },
      ai_strategic_assessment: "Connect domain data for strategic AI assessment.",
      recommendations: [],
      generated_at: new Date().toISOString(),
    };
  }
}

export const digestJournalService = new DigestJournalService();
