import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Anomaly Alert System
// Detects unusual patterns in login, spending, schedule
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;
export type AnomalyType = 'login_location' | 'spending_spike' | 'schedule_deviation' | 'data_access' | 'approval_pattern' | 'api_abuse';

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  metric: { expected: number; actual: number; deviation: number };
  dismissed: boolean;
  actionTaken?: string;
}

export interface AnomalyConfig {
  enabled: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  alertChannels: string[];
  thresholds: Record<AnomalyType, number>;
}

class AnomalyAlertSystem {
  private config: AnomalyConfig = {
    enabled: true,
    sensitivityLevel: 'medium',
    alertChannels: ['push', 'email'],
    thresholds: {
      login_location: 2,
      spending_spike: 2.5,
      schedule_deviation: 3,
      data_access: 2,
      approval_pattern: 2.5,
      api_abuse: 1.5,
    },
  };

  async scan(userId: string): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    await Promise.all([
      this.checkSpendingAnomalies(userId, anomalies),
      this.checkApprovalAnomalies(userId, anomalies),
      this.checkDataAccessAnomalies(userId, anomalies),
    ]);

    // Sort by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Create notifications for critical anomalies
    for (const anomaly of anomalies.filter((a) => a.severity === 'critical')) {
      await fromDynamicTable('notifications').insert({
        user_id: userId,
        title: `⚠️ ${anomaly.title}`,
        body: anomaly.description,
        type: 'security',
        urgency: 'critical',
        domain: 'system',
      });
    }

    return anomalies;
  }

  private async checkSpendingAnomalies(userId: string, anomalies: Anomaly[]): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (!invoices || invoices.length < 5) return;

    const amounts = invoices.map((i) => Number(i.amount));
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length);

    // Check last 3 invoices for spikes
    const recent = amounts.slice(-3);
    for (const amount of recent) {
      const deviation = stdDev > 0 ? (amount - mean) / stdDev : 0;
      if (deviation > this.config.thresholds.spending_spike) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'spending_spike',
          severity: deviation > 4 ? 'critical' : 'warning',
          title: 'Unusual spending detected',
          description: `An amount of $${amount.toLocaleString()} is ${deviation.toFixed(1)} standard deviations above average ($${mean.toFixed(0)})`,
          detectedAt: new Date(),
          metric: { expected: mean, actual: amount, deviation },
          dismissed: false,
        });
      }
    }
  }

  private async checkApprovalAnomalies(userId: string, anomalies: Anomaly[]): Promise<void> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const { count } = await supabase
      .from('approval_queue')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'approved')
      .gte('decided_at', todayStart.toISOString());

    if ((count || 0) > 20) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'approval_pattern',
        severity: 'warning',
        title: 'High approval volume',
        description: `${count} approvals today, which is unusually high. Verify these are legitimate.`,
        detectedAt: new Date(),
        metric: { expected: 5, actual: count || 0, deviation: ((count || 0) - 5) / 5 },
        dismissed: false,
      });
    }
  }

  private async checkDataAccessAnomalies(userId: string, anomalies: Anomaly[]): Promise<void> {
    const { count } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('category', 'security')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    if ((count || 0) > 50) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'data_access',
        severity: 'critical',
        title: 'Excessive security events',
        description: `${count} security events in the last hour. Possible unauthorized access attempt.`,
        detectedAt: new Date(),
        metric: { expected: 10, actual: count || 0, deviation: ((count || 0) - 10) / 10 },
        dismissed: false,
      });
    }
  }

  configure(updates: Partial<AnomalyConfig>): void {
    Object.assign(this.config, updates);
  }

  getConfig(): AnomalyConfig {
    return { ...this.config };
  }
}

export const anomalyAlertSystem = new AnomalyAlertSystem();

