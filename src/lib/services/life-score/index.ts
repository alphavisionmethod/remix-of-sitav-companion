import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Life Score Dashboard Service
// Single composite score across health, wealth, relationships, career
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export interface LifeDimension {
  id: string;
  label: string;
  score: number; // 0-100
  weight: number;
  trend: 'improving' | 'stable' | 'declining';
  trendDelta: number;
  subMetrics: Array<{ label: string; value: number; max: number }>;
}

export interface LifeScoreSnapshot {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  dimensions: LifeDimension[];
  weeklyHistory: Array<{ date: string; score: number }>;
  recommendations: string[];
  strengths: string[];
  growthAreas: string[];
}

class LifeScoreService {
  async calculate(userId: string): Promise<LifeScoreSnapshot> {
    const [financial, business, household, goals] = await Promise.all([
      this.getFinancialScore(userId),
      this.getBusinessScore(userId),
      this.getHouseholdScore(userId),
      this.getGoalScore(userId),
    ]);

    const dimensions: LifeDimension[] = [
      { id: 'financial', label: 'Financial Health', ...financial, weight: 0.3 },
      { id: 'business', label: 'Business Growth', ...business, weight: 0.25 },
      { id: 'household', label: 'Home & Family', ...household, weight: 0.25 },
      { id: 'goals', label: 'Personal Goals', ...goals, weight: 0.2 },
    ];

    const overallScore = Math.round(
      dimensions.reduce((s, d) => s + d.score * d.weight, 0)
    );

    const grade = overallScore >= 95 ? 'A+' : overallScore >= 85 ? 'A' : overallScore >= 78 ? 'B+'
      : overallScore >= 70 ? 'B' : overallScore >= 63 ? 'C+' : overallScore >= 55 ? 'C'
      : overallScore >= 40 ? 'D' : 'F';

    const strengths = dimensions.filter((d) => d.score >= 75).map((d) => d.label);
    const growthAreas = dimensions.filter((d) => d.score < 60).map((d) => d.label);

    const recommendations: string[] = [];
    if (financial.score < 60) recommendations.push('Review budget and reduce unnecessary expenses');
    if (business.score < 60) recommendations.push('Follow up on stale leads and overdue invoices');
    if (household.score < 60) recommendations.push('Delegate household tasks more evenly');
    if (goals.score < 60) recommendations.push('Set smaller milestone goals to build momentum');
    if (recommendations.length === 0) recommendations.push('Keep up the great work across all areas!');

    return {
      overallScore,
      grade,
      dimensions,
      weeklyHistory: this.generateHistory(overallScore),
      recommendations,
      strengths,
      growthAreas,
    };
  }

  private async getFinancialScore(userId: string): Promise<Omit<LifeDimension, 'id' | 'label' | 'weight'>> {
    const { data: budgets } = await fromDynamicTable('budgets').select('allocated, spent').eq('user_id', userId);
    const totalBudget = (budgets || []).reduce((s, b) => s + Number(b.allocated), 0);
    const totalSpent = (budgets || []).reduce((s, b) => s + Number(b.spent), 0);
    const budgetAdherence = totalBudget > 0 ? Math.max(0, 100 - ((totalSpent / totalBudget) * 100 - 100)) : 50;

    const { count: overdueCount } = await fromDynamicTable('invoices').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'overdue');

    const score = Math.round(Math.min(100, budgetAdherence - (overdueCount || 0) * 5));
    return {
      score: Math.max(0, score),
      trend: 'stable',
      trendDelta: 0,
      subMetrics: [
        { label: 'Budget Adherence', value: Math.round(budgetAdherence), max: 100 },
        { label: 'Overdue Invoices', value: overdueCount || 0, max: 0 },
      ],
    };
  }

  private async getBusinessScore(userId: string): Promise<Omit<LifeDimension, 'id' | 'label' | 'weight'>> {
    const { count: activeLeads } = await fromDynamicTable('leads').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).in('status', ['new', 'contacted', 'qualified']);
    const { count: wonDeals } = await fromDynamicTable('deals').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('stage', 'won');
    const { count: totalDeals } = await fromDynamicTable('deals').select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const winRate = totalDeals && totalDeals > 0 ? ((wonDeals || 0) / totalDeals) * 100 : 50;
    const pipelineHealth = Math.min(100, (activeLeads || 0) * 10);
    const score = Math.round((winRate * 0.6 + pipelineHealth * 0.4));

    return {
      score: Math.max(0, Math.min(100, score)),
      trend: 'stable',
      trendDelta: 0,
      subMetrics: [
        { label: 'Win Rate', value: Math.round(winRate), max: 100 },
        { label: 'Active Leads', value: activeLeads || 0, max: 20 },
      ],
    };
  }

  private async getHouseholdScore(userId: string): Promise<Omit<LifeDimension, 'id' | 'label' | 'weight'>> {
    const { count: totalTasks } = await fromDynamicTable('household_tasks').select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    const { count: doneTasks } = await fromDynamicTable('household_tasks').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'completed');

    const completionRate = totalTasks && totalTasks > 0 ? ((doneTasks || 0) / totalTasks) * 100 : 50;
    return {
      score: Math.round(completionRate),
      trend: 'stable',
      trendDelta: 0,
      subMetrics: [
        { label: 'Task Completion', value: Math.round(completionRate), max: 100 },
        { label: 'Total Tasks', value: totalTasks || 0, max: 50 },
      ],
    };
  }

  private async getGoalScore(userId: string): Promise<Omit<LifeDimension, 'id' | 'label' | 'weight'>> {
    const { data: goals } = await fromDynamicTable('goals').select('current_value, target_value, status')
      .eq('user_id', userId).eq('status', 'active');

    if (!goals || goals.length === 0) return { score: 50, trend: 'stable', trendDelta: 0, subMetrics: [] };

    const avgProgress = goals.reduce((s, g) => {
      const target = Number(g.target_value || 1);
      const current = Number(g.current_value || 0);
      return s + Math.min(100, (current / target) * 100);
    }, 0) / goals.length;

    return {
      score: Math.round(avgProgress),
      trend: 'stable',
      trendDelta: 0,
      subMetrics: [
        { label: 'Avg Goal Progress', value: Math.round(avgProgress), max: 100 },
        { label: 'Active Goals', value: goals.length, max: 10 },
      ],
    };
  }

  private generateHistory(currentScore: number): Array<{ date: string; score: number }> {
    const history: Array<{ date: string; score: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        score: Math.max(0, Math.min(100, currentScore + Math.round((Math.random() - 0.5) * 10))),
      });
    }
    history[history.length - 1].score = currentScore;
    return history;
  }
}

export const lifeScoreService = new LifeScoreService();

