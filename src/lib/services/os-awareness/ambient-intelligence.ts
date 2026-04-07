// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Intelligence Service
// OS-wide awareness glue layer connecting all services
// ═══════════════════════════════════════════════════════════════

export interface AmbientInsight {
  id: string;
  type: 'prediction' | 'opportunity' | 'alert' | 'nudge' | 'celebration';
  title: string;
  description: string;
  relevance: number; // 0-1
  domains: string[];
  actionable: boolean;
  action?: string;
  timestamp: string;
}

export interface DailyBriefingSummary {
  date: string;
  lifeScore: number;
  topInsights: AmbientInsight[];
  predictedNeeds: { title: string; urgency: string; action: string }[];
  opportunities: { title: string; value: number }[];
  negotiationSavings: number;
  goalsOnTrack: number;
  goalsAtRisk: number;
  schedule: { focusBlocks: number; meetingLoad: number; freeHours: number };
}

export interface ContextualInsight {
  page: string;
  insights: AmbientInsight[];
  relatedMetrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
}

export class AmbientIntelligenceService {
  private insights: AmbientInsight[] = [];
  private counter = 0;
  private eventLog: { type: string; domain: string; timestamp: string; data: unknown }[] = [];

  ingestEvent(type: string, domain: string, data: unknown): void {
    this.eventLog.push({ type, domain, timestamp: new Date().toISOString(), data });
    if (this.eventLog.length > 1000) this.eventLog.shift();
    this.detectCrossDomainPatterns();
  }

  private detectCrossDomainPatterns(): void {
    const recent = this.eventLog.slice(-50);
    const domains = new Set(recent.map(e => e.domain));

    // Cross-domain correlation: if financial + business events spike together
    if (domains.size >= 3) {
      const domainCounts: Record<string, number> = {};
      for (const e of recent) domainCounts[e.domain] = (domainCounts[e.domain] || 0) + 1;
      const hotDomains = Object.entries(domainCounts).filter(([, c]) => c > 5);
      if (hotDomains.length >= 2) {
        this.addInsight('alert',
          'Cross-domain activity spike',
          `High activity in ${hotDomains.map(([d]) => d).join(' & ')} — may indicate cascading event.`,
          0.7, hotDomains.map(([d]) => d), true,
          'Review domain dashboards for connected impacts'
        );
      }
    }
  }

  addInsight(type: AmbientInsight['type'], title: string, description: string, relevance: number, domains: string[], actionable: boolean, action?: string): AmbientInsight {
    const insight: AmbientInsight = {
      id: `insight-${++this.counter}`, type, title, description,
      relevance, domains, actionable, action, timestamp: new Date().toISOString(),
    };
    this.insights.push(insight);
    if (this.insights.length > 200) this.insights.shift();
    return insight;
  }

  getDailyBriefing(params: {
    lifeScore: number;
    predictions: { title: string; urgency: string; action: string }[];
    opportunities: { title: string; value: number }[];
    negotiationSavings: number;
    goalsOnTrack: number;
    goalsAtRisk: number;
    focusBlocks: number;
    meetingLoad: number;
    freeHours: number;
  }): DailyBriefingSummary {
    return {
      date: new Date().toISOString().split('T')[0],
      lifeScore: params.lifeScore,
      topInsights: this.insights.filter(i => i.relevance > 0.5).slice(-5),
      predictedNeeds: params.predictions.slice(0, 5),
      opportunities: params.opportunities.slice(0, 3),
      negotiationSavings: params.negotiationSavings,
      goalsOnTrack: params.goalsOnTrack,
      goalsAtRisk: params.goalsAtRisk,
      schedule: { focusBlocks: params.focusBlocks, meetingLoad: params.meetingLoad, freeHours: params.freeHours },
    };
  }

  getContextualInsight(currentPage: string): ContextualInsight {
    const pageMap: Record<string, string[]> = {
      '/life-dashboard': ['financial', 'business', 'household'],
      '/business': ['business', 'revenue'],
      '/money': ['financial'],
      '/household': ['household', 'family'],
      '/life-simulator': ['simulation', 'resilience'],
    };

    const relevantDomains = pageMap[currentPage] || [];
    const relevant = this.insights
      .filter(i => i.domains.some(d => relevantDomains.includes(d)))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);

    return {
      page: currentPage,
      insights: relevant,
      relatedMetrics: relevantDomains.map(d => ({
        label: d.charAt(0).toUpperCase() + d.slice(1),
        value: `${Math.round(50 + Math.random() * 50)}`,
        trend: (['up', 'down', 'stable'] as const)[Math.floor(Math.random() * 3)],
      })),
    };
  }

  getInsights(minRelevance = 0): AmbientInsight[] {
    return this.insights.filter(i => i.relevance >= minRelevance).sort((a, b) => b.relevance - a.relevance);
  }

  getEventLog(limit = 50): typeof this.eventLog {
    return this.eventLog.slice(-limit);
  }

  clearInsights(): void { this.insights = []; }
}

export const createAmbientIntelligence = () => new AmbientIntelligenceService();

