import { fromTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Habit Streak Tracker
// Gamified daily habits with streaks, rewards, family challenges
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekday' | 'weekly';
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  todayCompleted: boolean;
  lastCompletedAt: Date | null;
  createdAt: Date;
  color: string;
  icon: string;
  points: number;
}

export interface HabitCompletion {
  habitId: string;
  completedAt: Date;
  note?: string;
}

export interface StreakReward {
  id: string;
  title: string;
  description: string;
  requiredStreak: number;
  earned: boolean;
  earnedAt?: Date;
}

export interface HabitDashboard {
  habits: Habit[];
  todayProgress: { completed: number; total: number; percentage: number };
  totalPoints: number;
  rewards: StreakReward[];
  weeklyHeatmap: Record<string, boolean[]>; // habitId -> [Mon..Sun]
}

const REWARDS: Omit<StreakReward, 'id' | 'earned' | 'earnedAt'>[] = [
  { title: '🔥 First Flame', description: '3-day streak', requiredStreak: 3 },
  { title: '⭐ Rising Star', description: '7-day streak', requiredStreak: 7 },
  { title: '🏆 Two Weeks Strong', description: '14-day streak', requiredStreak: 14 },
  { title: '💎 Diamond Discipline', description: '30-day streak', requiredStreak: 30 },
  { title: '🌟 Legendary', description: '100-day streak', requiredStreak: 100 },
];

class HabitStreakService {
  async getDashboard(userId: string): Promise<HabitDashboard> {
    const habits = await this.getHabits(userId);
    const todayCount = habits.filter((h) => h.todayCompleted).length;
    const totalPoints = habits.reduce((s, h) => s + h.points, 0);
    const maxStreak = habits.reduce((m, h) => Math.max(m, h.longestStreak), 0);

    const rewards: StreakReward[] = REWARDS.map((r) => ({
      ...r,
      id: `reward_${r.requiredStreak}`,
      earned: maxStreak >= r.requiredStreak,
      earnedAt: maxStreak >= r.requiredStreak ? new Date() : undefined,
    }));

    const weeklyHeatmap: Record<string, boolean[]> = {};
    habits.forEach((h) => {
      weeklyHeatmap[h.id] = Array(7).fill(false);
      if (h.todayCompleted) {
        weeklyHeatmap[h.id][new Date().getDay()] = true;
      }
    });

    return {
      habits,
      todayProgress: { completed: todayCount, total: habits.length, percentage: habits.length > 0 ? Math.round((todayCount / habits.length) * 100) : 0 },
      totalPoints,
      rewards,
      weeklyHeatmap,
    };
  }

  async getHabits(userId: string): Promise<Habit[]> {
    const { data } = await supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'habit');

    return (data || []).map((d) => {
      const val = typeof d.value === 'string' ? JSON.parse(d.value) : d.value as unknown;
      return {
        id: d.id,
        title: val.title || d.key,
        category: val.category || 'general',
        frequency: val.frequency || 'daily',
        currentStreak: val.currentStreak || 0,
        longestStreak: val.longestStreak || 0,
        totalCompletions: val.totalCompletions || 0,
        todayCompleted: val.lastCompletedDate === new Date().toISOString().split('T')[0],
        lastCompletedAt: val.lastCompletedAt ? new Date(val.lastCompletedAt) : null,
        createdAt: new Date(d.created_at),
        color: val.color || '#8B5CF6',
        icon: val.icon || '✅',
        points: (val.currentStreak || 0) * 10 + (val.totalCompletions || 0),
      };
    });
  }

  async createHabit(userId: string, habit: { title: string; category: string; frequency: 'daily' | 'weekday' | 'weekly'; color?: string; icon?: string }): Promise<void> {
    await fromTable('user_memory').insert({
      user_id: userId,
      key: `habit_${Date.now()}`,
      value: JSON.stringify({
        title: habit.title,
        category: habit.category,
        frequency: habit.frequency,
        color: habit.color || '#8B5CF6',
        icon: habit.icon || '✅',
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        lastCompletedDate: null,
        lastCompletedAt: null,
      }) as never,
      category: 'habit',
    });
  }

  async completeHabit(userId: string, habitId: string): Promise<void> {
    const { data } = await fromTable('user_memory').select('*').eq('id', habitId).single();
    if (!data) return;

    const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value as unknown;
    const today = new Date().toISOString().split('T')[0];

    if (val.lastCompletedDate === today) return; // Already completed

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = val.lastCompletedDate === yesterday.toISOString().split('T')[0];

    val.currentStreak = wasYesterday ? (val.currentStreak || 0) + 1 : 1;
    val.longestStreak = Math.max(val.longestStreak || 0, val.currentStreak);
    val.totalCompletions = (val.totalCompletions || 0) + 1;
    val.lastCompletedDate = today;
    val.lastCompletedAt = new Date().toISOString();

    await fromTable('user_memory').update({ value: JSON.stringify(val) as never }).eq('id', habitId);
  }

  async deleteHabit(userId: string, habitId: string): Promise<void> {
    await fromTable('user_memory').delete().eq('user_id', userId).eq('id', habitId);
  }
}

export const habitStreakService = new HabitStreakService();
