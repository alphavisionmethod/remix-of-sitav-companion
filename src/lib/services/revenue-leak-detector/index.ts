// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Leak Detector
// Finds unbilled hours, expired quotes, forgotten follow-ups
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export type LeakType = 'unbilled_work' | 'expired_quote' | 'stale_lead' | 'overdue_invoice' | 'missed_followup' | 'underpriced_deal' | 'churning_client';

export interface RevenueLeak {
  id: string;
  type: LeakType;
  title: string;
  description: string;
  estimatedLoss: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  entity: { type: string; id: string; name: string };
  suggestedAction: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface LeakSummary {
  totalLeaks: number;
  totalEstimatedLoss: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  leaks: RevenueLeak[];
  trend: 'improving' | 'stable' | 'worsening';
}

class RevenueLeakDetector {
  async scan(userId: string): Promise<LeakSummary> {
    const leaks: RevenueLeak[] = [];

    await Promise.all([
      this.detectStaleLeads(userId, leaks),
      this.detectOverdueInvoices(userId, leaks),
      this.detectExpiredQuotes(userId, leaks),
      this.detectChurningClients(userId, leaks),
      this.detectStalePipeline(userId, leaks),
    ]);

    leaks.sort((a, b) => b.estimatedLoss - a.estimatedLoss);

    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};
    leaks.forEach((l) => {
      bySeverity[l.severity] = (bySeverity[l.severity] || 0) + 1;
      byType[l.type] = (byType[l.type] || 0) + 1;
    });

    return {
      totalLeaks: leaks.length,
      totalEstimatedLoss: leaks.reduce((s, l) => s + l.estimatedLoss, 0),
      bySeverity,
      byType,
      leaks,
      trend: leaks.length > 10 ? 'worsening' : leaks.length > 5 ? 'stable' : 'improving',
    };
  }

  private async detectStaleLeads(userId: string, leaks: RevenueLeak[]): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('leads')
      .select('id, name, likely_value, last_contact_at, status')
      .eq('user_id', userId)
      .in('status', ['new', 'contacted', 'qualified'])
      .lt('last_contact_at', thirtyDaysAgo.toISOString());

    (data || []).forEach((lead) => {
      leaks.push({
        id: `leak_lead_${lead.id}`,
        type: 'stale_lead',
        title: `Stale lead: ${lead.name}`,
        description: `No contact in 30+ days. Likely value: $${Number(lead.likely_value || 0).toLocaleString()}`,
        estimatedLoss: Number(lead.likely_value || 0),
        severity: Number(lead.likely_value || 0) > 10000 ? 'high' : 'medium',
        entity: { type: 'lead', id: lead.id, name: lead.name },
        suggestedAction: 'Send a follow-up email or schedule a call',
        detectedAt: new Date(),
        resolved: false,
      });
    });
  }

  private async detectOverdueInvoices(userId: string, leaks: RevenueLeak[]): Promise<void> {
    const { data } = await supabase
      .from('invoices')
      .select('id, invoice_number, amount, due_date, aging_days')
      .eq('user_id', userId)
      .in('status', ['sent', 'overdue']);

    const now = new Date();
    (data || []).forEach((inv) => {
      const dueDate = new Date(inv.due_date);
      if (dueDate < now) {
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
        leaks.push({
          id: `leak_inv_${inv.id}`,
          type: 'overdue_invoice',
          title: `Overdue invoice #${inv.invoice_number}`,
          description: `$${Number(inv.amount).toLocaleString()} is ${daysOverdue} days overdue`,
          estimatedLoss: Number(inv.amount),
          severity: daysOverdue > 60 ? 'critical' : daysOverdue > 30 ? 'high' : 'medium',
          entity: { type: 'invoice', id: inv.id, name: inv.invoice_number },
          suggestedAction: daysOverdue > 30 ? 'Escalate collection or send formal reminder' : 'Send payment reminder',
          detectedAt: new Date(),
          resolved: false,
        });
      }
    });
  }

  private async detectExpiredQuotes(userId: string, leaks: RevenueLeak[]): Promise<void> {
    const { data } = await supabase
      .from('opportunities')
      .select('id, title, value, stage, last_movement_at')
      .eq('user_id', userId)
      .eq('stage', 'proposal');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    (data || []).forEach((opp) => {
      if (opp.last_movement_at && new Date(opp.last_movement_at) < thirtyDaysAgo) {
        leaks.push({
          id: `leak_quote_${opp.id}`,
          type: 'expired_quote',
          title: `Stale proposal: ${opp.title}`,
          description: `Proposal worth $${Number(opp.value || 0).toLocaleString()} has had no movement in 30+ days`,
          estimatedLoss: Number(opp.value || 0),
          severity: Number(opp.value || 0) > 10000 ? 'high' : 'medium',
          entity: { type: 'opportunity', id: opp.id, name: opp.title },
          suggestedAction: 'Follow up on proposal or revise terms',
          detectedAt: new Date(),
          resolved: false,
        });
      }
    });
  }

  private async detectChurningClients(userId: string, leaks: RevenueLeak[]): Promise<void> {
    const { data } = await supabase
      .from('customers')
      .select('id, name, health_score, lifetime_revenue, last_contact_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .lt('health_score', 40);

    (data || []).forEach((client) => {
      leaks.push({
        id: `leak_churn_${client.id}`,
        type: 'churning_client',
        title: `At-risk client: ${client.name}`,
        description: `Health score ${client.health_score}/100. Lifetime revenue: $${Number(client.lifetime_revenue || 0).toLocaleString()}`,
        estimatedLoss: Number(client.lifetime_revenue || 0) * 0.3,
        severity: Number(client.health_score || 0) < 20 ? 'critical' : 'high',
        entity: { type: 'customer', id: client.id, name: client.name },
        suggestedAction: 'Schedule a check-in call to understand concerns',
        detectedAt: new Date(),
        resolved: false,
      });
    });
  }

  private async detectStalePipeline(userId: string, leaks: RevenueLeak[]): Promise<void> {
    const { data } = await supabase
      .from('opportunities')
      .select('id, title, value, stage, stale_risk')
      .eq('user_id', userId)
      .eq('stale_risk', true)
      .not('stage', 'in', '("won","lost")');

    (data || []).forEach((opp) => {
      leaks.push({
        id: `leak_pipe_${opp.id}`,
        type: 'missed_followup',
        title: `Stale pipeline: ${opp.title}`,
        description: `Deal worth $${Number(opp.value || 0).toLocaleString()} flagged as stale in ${opp.stage} stage`,
        estimatedLoss: Number(opp.value || 0) * 0.5,
        severity: 'medium',
        entity: { type: 'opportunity', id: opp.id, name: opp.title },
        suggestedAction: 'Re-engage prospect or update deal status',
        detectedAt: new Date(),
        resolved: false,
      });
    });
  }
}

export const revenueLeakDetector = new RevenueLeakDetector();
