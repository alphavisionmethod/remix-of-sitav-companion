// ═══════════════════════════════════════════════════════════════
// SITA OS — Live Revenue Ticker
// Real-time revenue stream visualization like a stock ticker
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export interface RevenueEvent {
  id: string;
  type: 'invoice_paid' | 'invoice_sent' | 'lead_converted' | 'deal_closed' | 'subscription' | 'refund';
  amount: number;
  customerName: string;
  timestamp: Date;
  domain: string;
}

export interface RevenueTick {
  time: Date;
  cumulative: number;
  delta: number;
  event?: RevenueEvent;
}

export interface RevenueTickerState {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  todayTarget: number;
  trend: 'up' | 'down' | 'flat';
  trendPercent: number;
  ticks: RevenueTick[];
  recentEvents: RevenueEvent[];
  velocity: number; // dollars per hour
  projectedDaily: number;
}

class RevenueTickerService {
  private state: RevenueTickerState = {
    todayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
    todayTarget: 0,
    trend: 'flat',
    trendPercent: 0,
    ticks: [],
    recentEvents: [],
    velocity: 0,
    projectedDaily: 0,
  };
  private listeners: Set<(state: RevenueTickerState) => void> = new Set();
  private subscription: ReturnType<typeof supabase.channel> | null = null;

  async initialize(userId: string): Promise<RevenueTickerState> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount, status, created_at, invoice_number')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .gte('created_at', monthStart.toISOString());

    const paidInvoices = invoices || [];

    this.state.monthTotal = paidInvoices.reduce((s, i) => s + Number(i.amount), 0);
    this.state.weekTotal = paidInvoices
      .filter((i) => new Date(i.created_at) >= weekStart)
      .reduce((s, i) => s + Number(i.amount), 0);
    this.state.todayTotal = paidInvoices
      .filter((i) => new Date(i.created_at) >= todayStart)
      .reduce((s, i) => s + Number(i.amount), 0);

    // Calculate velocity
    const hoursElapsed = (now.getTime() - todayStart.getTime()) / 3600000;
    this.state.velocity = hoursElapsed > 0 ? this.state.todayTotal / hoursElapsed : 0;
    this.state.projectedDaily = this.state.velocity * 24;

    // Calculate trend vs yesterday
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const { data: yesterdayInvoices } = await supabase
      .from('invoices')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString());

    const yesterdayTotal = (yesterdayInvoices || []).reduce((s, i) => s + Number(i.amount), 0);
    if (yesterdayTotal > 0) {
      this.state.trendPercent = ((this.state.todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
      this.state.trend = this.state.trendPercent > 2 ? 'up' : this.state.trendPercent < -2 ? 'down' : 'flat';
    }

    // Build tick history
    this.state.ticks = paidInvoices
      .filter((i) => new Date(i.created_at) >= todayStart)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .reduce<RevenueTick[]>((ticks, inv) => {
        const prev = ticks.length > 0 ? ticks[ticks.length - 1].cumulative : 0;
        ticks.push({
          time: new Date(inv.created_at),
          cumulative: prev + Number(inv.amount),
          delta: Number(inv.amount),
        });
        return ticks;
      }, []);

    this.state.todayTarget = Math.max(yesterdayTotal, this.state.monthTotal / Math.max(1, now.getDate()));

    this.notify();
    return this.state;
  }

  subscribe(listener: (state: RevenueTickerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  addEvent(event: RevenueEvent): void {
    this.state.recentEvents.unshift(event);
    if (this.state.recentEvents.length > 20) this.state.recentEvents.pop();

    if (event.type !== 'refund') {
      this.state.todayTotal += event.amount;
      this.state.weekTotal += event.amount;
      this.state.monthTotal += event.amount;
    } else {
      this.state.todayTotal -= event.amount;
      this.state.weekTotal -= event.amount;
      this.state.monthTotal -= event.amount;
    }

    this.state.ticks.push({
      time: event.timestamp,
      cumulative: this.state.todayTotal,
      delta: event.type === 'refund' ? -event.amount : event.amount,
      event,
    });

    this.notify();
  }

  startRealtimeSync(userId: string): void {
    this.subscription = supabase
      .channel('revenue-ticker')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'invoices',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new && (payload.new as never).status === 'paid' && (payload.old as never)?.status !== 'paid') {
          this.addEvent({
            id: (payload.new as never).id,
            type: 'invoice_paid',
            amount: Number((payload.new as never).amount),
            customerName: (payload.new as never).invoice_number,
            timestamp: new Date(),
            domain: 'business',
          });
        }
      })
      .subscribe();
  }

  stopRealtimeSync(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  private notify(): void {
    this.listeners.forEach((l) => l({ ...this.state }));
  }
}

export const revenueTickerService = new RevenueTickerService();

