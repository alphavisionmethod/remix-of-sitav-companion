import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Family Command Center Service
// Unified calendar + tasks + meals + budget for the household
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;
export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: Date;
  assignedTo: string[];
  type: 'task' | 'event' | 'meal' | 'bill' | 'reminder';
  status: 'pending' | 'done' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

export interface FamilyBudgetSummary {
  totalBudget: number;
  spent: number;
  remaining: number;
  categories: Array<{ name: string; allocated: number; spent: number }>;
}

export interface FamilyDashboard {
  members: FamilyMember[];
  todayEvents: FamilyEvent[];
  weekEvents: FamilyEvent[];
  overdueTasks: FamilyEvent[];
  budget: FamilyBudgetSummary;
  upcomingBills: Array<{ payee: string; amount: number; dueDate: Date }>;
  loadBalance: Record<string, number>; // memberId -> task count
}

class FamilyCommandCenterService {
  async getDashboard(userId: string): Promise<FamilyDashboard> {
    const [members, tasks, bills, budgets] = await Promise.all([
      this.getMembers(userId),
      this.getTasks(userId),
      this.getBills(userId),
      this.getBudgets(userId),
    ]);

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

    const events: FamilyEvent[] = tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      date: new Date(t.due_date || t.created_at),
      assignedTo: t.assigned_to ? [t.assigned_to] : [],
      type: 'task' as const,
      status: t.status === 'completed' ? 'done' as const : new Date(t.due_date || '') < now ? 'overdue' as const : 'pending' as const,
      priority: (t.priority || 'medium') as 'low' | 'medium' | 'high',
    }));

    const loadBalance: Record<string, number> = {};
    events.forEach((e) => {
      e.assignedTo.forEach((m) => {
        loadBalance[m] = (loadBalance[m] || 0) + 1;
      });
    });

    const totalBudget = budgets.reduce((s: number, b: any) => s + Number(b.allocated), 0);
    const spent = budgets.reduce((s: number, b: any) => s + Number(b.spent), 0);

    return {
      members,
      todayEvents: events.filter((e) => e.date >= now && e.date < todayEnd),
      weekEvents: events.filter((e) => e.date >= now && e.date < weekEnd),
      overdueTasks: events.filter((e) => e.status === 'overdue'),
      budget: {
        totalBudget,
        spent,
        remaining: totalBudget - spent,
        categories: budgets.map((b: any) => ({ name: b.category, allocated: Number(b.allocated), spent: Number(b.spent) })),
      },
      upcomingBills: bills
        .filter((b: any) => new Date(b.due_date) >= now)
        .slice(0, 5)
        .map((b: any) => ({ payee: b.payee, amount: Number(b.amount), dueDate: new Date(b.due_date) })),
      loadBalance,
    };
  }

  private async getMembers(userId: string): Promise<FamilyMember[]> {
    const { data } = await fromDynamicTable('household_members').select('id, display_name, role').limit(20);
    const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];
    return (data || []).map((m, i) => ({
      id: m.id,
      name: m.display_name,
      role: m.role,
      color: colors[i % colors.length],
    }));
  }

  private async getTasks(userId: string): Promise<any[]> {
    const { data } = await fromDynamicTable('household_tasks').select('*').eq('user_id', userId).order('due_date');
    return data || [];
  }

  private async getBills(userId: string): Promise<any[]> {
    const { data } = await fromDynamicTable('bills').select('*').eq('user_id', userId).order('due_date');
    return data || [];
  }

  private async getBudgets(userId: string): Promise<any[]> {
    const { data } = await fromDynamicTable('budgets').select('*').eq('user_id', userId);
    return data || [];
  }
}

export const familyCommandCenterService = new FamilyCommandCenterService();

