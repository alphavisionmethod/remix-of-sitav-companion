import { fromTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Competitive Intelligence Feed
// Tracks competitor landscape and surfaces actionable insights
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';


export interface Competitor {
  id: string;
  name: string;
  website: string;
  industry: string;
  strengths: string[];
  weaknesses: string[];
  lastUpdated: Date;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CompetitiveInsight {
  id: string;
  competitorId: string;
  competitorName: string;
  type: 'pricing_change' | 'product_launch' | 'market_move' | 'hiring' | 'partnership' | 'weakness';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  urgency: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: string;
  detectedAt: Date;
  source: string;
}

export interface CompetitivePosition {
  overallScore: number; // 0-100
  strengths: string[];
  vulnerabilities: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

class CompetitiveIntelligenceService {
  private competitors: Map<string, Competitor> = new Map();
  private insights: CompetitiveInsight[] = [];

  async addCompetitor(userId: string, competitor: Omit<Competitor, 'id' | 'lastUpdated'>): Promise<Competitor> {
    const full: Competitor = {
      ...competitor,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
    };
    this.competitors.set(full.id, full);

    await fromTable('user_memory').upsert({
      user_id: userId,
      key: `competitor_${full.id}`,
      value: JSON.stringify(full) as never,
      category: 'competitive_intel',
    }, { onConflict: 'user_id,key' });

    return full;
  }

  async loadCompetitors(userId: string): Promise<Competitor[]> {
    const { data } = await supabase
      .from('user_memory')
      .select('value')
      .eq('user_id', userId)
      .eq('category', 'competitive_intel')
      .like('key', 'competitor_%');

    const competitors = (data || []).map((d) => JSON.parse(d.value as string) as Competitor);
    competitors.forEach((c) => this.competitors.set(c.id, c));
    return competitors;
  }

  async removeCompetitor(userId: string, competitorId: string): Promise<void> {
    this.competitors.delete(competitorId);
    await supabase
      .from('user_memory')
      .delete()
      .eq('user_id', userId)
      .eq('key', `competitor_${competitorId}`);
  }

  addInsight(insight: Omit<CompetitiveInsight, 'id' | 'detectedAt'>): CompetitiveInsight {
    const full: CompetitiveInsight = {
      ...insight,
      id: crypto.randomUUID(),
      detectedAt: new Date(),
    };
    this.insights.unshift(full);
    if (this.insights.length > 100) this.insights.pop();
    return full;
  }

  getInsights(filters?: { competitorId?: string; type?: string; urgency?: string }): CompetitiveInsight[] {
    let filtered = [...this.insights];
    if (filters?.competitorId) filtered = filtered.filter((i) => i.competitorId === filters.competitorId);
    if (filters?.type) filtered = filtered.filter((i) => i.type === filters.type);
    if (filters?.urgency) filtered = filtered.filter((i) => i.urgency === filters.urgency);
    return filtered;
  }

  assessPosition(): CompetitivePosition {
    const competitors = Array.from(this.competitors.values());
    const highThreats = competitors.filter((c) => c.threatLevel === 'high' || c.threatLevel === 'critical');
    const recentInsights = this.insights.filter((i) => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 30);
      return i.detectedAt >= dayAgo;
    });

    const negativeInsights = recentInsights.filter((i) => i.impact === 'negative');
    const positiveInsights = recentInsights.filter((i) => i.impact === 'positive');

    const score = Math.max(0, Math.min(100,
      70 - highThreats.length * 10 - negativeInsights.length * 5 + positiveInsights.length * 5
    ));

    return {
      overallScore: score,
      strengths: competitors.flatMap((c) => c.weaknesses).filter((w, i, a) => a.indexOf(w) === i).slice(0, 5),
      vulnerabilities: competitors.flatMap((c) => c.strengths).filter((s, i, a) => a.indexOf(s) === i).slice(0, 5),
      opportunities: recentInsights.filter((i) => i.actionable && i.impact === 'positive').map((i) => i.suggestedAction || i.title).slice(0, 5),
      threats: recentInsights.filter((i) => i.impact === 'negative').map((i) => i.title).slice(0, 5),
      recommendations: [
        score < 50 ? 'Urgent: Review competitive positioning strategy' : 'Maintain current competitive advantage',
        highThreats.length > 0 ? `Monitor ${highThreats.map((c) => c.name).join(', ')} closely` : 'No critical competitor threats detected',
        negativeInsights.length > 3 ? 'Consider accelerating product roadmap' : 'Current pace is competitive',
      ],
    };
  }
}

export const competitiveIntelligenceService = new CompetitiveIntelligenceService();
