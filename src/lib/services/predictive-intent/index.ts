import { fromTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Predictive Intent Engine
// Anticipates user needs before they ask using behavioral patterns
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';


export interface PredictedIntent {
  id: string;
  action: string;
  description: string;
  confidence: number;
  domain: string;
  suggestedAt: Date;
  expiresAt: Date;
  dismissed: boolean;
  context: Record<string, unknown>;
}

interface TimePattern {
  hour: number;
  dayOfWeek: number;
  frequency: number;
  lastAction: string;
  domain: string;
}

class PredictiveIntentEngine {
  private patterns: Map<string, TimePattern[]> = new Map();
  private predictions: PredictedIntent[] = [];
  private readonly PREDICTION_WINDOW_MINUTES = 30;
  private readonly MIN_FREQUENCY = 3;
  private readonly MIN_CONFIDENCE = 0.65;

  async learnFromAction(userId: string, action: string, domain: string): Promise<void> {
    const now = new Date();
    const pattern: TimePattern = {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      frequency: 1,
      lastAction: action,
      domain,
    };

    const userPatterns = this.patterns.get(userId) || [];
    const existing = userPatterns.find(
      (p) => p.hour === pattern.hour && p.dayOfWeek === pattern.dayOfWeek && p.lastAction === action
    );

    if (existing) {
      existing.frequency++;
    } else {
      userPatterns.push(pattern);
    }
    this.patterns.set(userId, userPatterns);

    // Persist to user_memory
    await fromTable('user_memory').upsert({
      user_id: userId,
      key: `intent_pattern_${action}_${pattern.hour}_${pattern.dayOfWeek}`,
      value: JSON.stringify(pattern) as unknown,
      category: 'predictive_intent',
    }, { onConflict: 'user_id,key' }).select();
  }

  async predictNext(userId: string): Promise<PredictedIntent[]> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const userPatterns = this.patterns.get(userId) || [];

    this.predictions = userPatterns
      .filter((p) => {
        const hourMatch = Math.abs(p.hour - currentHour) <= 1;
        const dayMatch = p.dayOfWeek === currentDay;
        return hourMatch && dayMatch && p.frequency >= this.MIN_FREQUENCY;
      })
      .map((p) => {
        const confidence = Math.min(1, (p.frequency / 10) * (1 - Math.abs(p.hour - currentHour) * 0.2));
        return {
          id: `pred_${p.lastAction}_${Date.now()}`,
          action: p.lastAction,
          description: this.describeAction(p.lastAction, p.domain),
          confidence,
          domain: p.domain,
          suggestedAt: now,
          expiresAt: new Date(now.getTime() + this.PREDICTION_WINDOW_MINUTES * 60000),
          dismissed: false,
          context: { frequency: p.frequency, patternHour: p.hour },
        };
      })
      .filter((p) => p.confidence >= this.MIN_CONFIDENCE)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return this.predictions;
  }

  async loadPatterns(userId: string): Promise<void> {
    const { data } = await supabase
      .from('user_memory')
      .select('key, value')
      .eq('user_id', userId)
      .eq('category', 'predictive_intent');

    if (data) {
      const patterns: TimePattern[] = data.map((row) => JSON.parse(row.value as string));
      this.patterns.set(userId, patterns);
    }
  }

  dismissPrediction(id: string): void {
    const pred = this.predictions.find((p) => p.id === id);
    if (pred) pred.dismissed = true;
  }

  private describeAction(action: string, domain: string): string {
    const descriptions: Record<string, string> = {
      check_invoices: 'Review today\'s outstanding invoices',
      review_leads: 'Check new leads and follow-ups',
      check_calendar: 'Review today\'s schedule',
      review_approvals: 'Handle pending approval requests',
      check_finances: 'Review financial overview',
      check_tasks: 'Review household tasks',
    };
    return descriptions[action] || `You usually ${action.replace(/_/g, ' ')} in ${domain} around this time`;
  }
}

export const predictiveIntentEngine = new PredictiveIntentEngine();
