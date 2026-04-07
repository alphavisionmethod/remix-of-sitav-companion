// SITA OS — Market Intelligence Service
// Industry benchmarks, competitive positioning, trend detection

export interface IndustryBenchmark {
  verticalId: string;
  revenuePerEmployeeCents: number;
  avgProfitMarginPercent: number;
  avgGrowthRatePercent: number;
  avgCustomerRetentionPercent: number;
  avgCacCents: number;
  avgLtvCents: number;
  avgTicketCents: number;
}

export interface CompetitivePosition {
  dimension: "price" | "quality" | "speed" | "breadth" | "service" | "innovation";
  userScore: number;
  industryAvg: number;
  topQuartile: number;
  gap: number;
  action: string;
}

export interface MarketTrend {
  trendId: string;
  name: string;
  direction: "growing" | "stable" | "declining";
  relevance: number;
  description: string;
  actionable: boolean;
  suggestedResponse: string;
}

export interface LocalMarketAnalysis {
  populationEstimate: number;
  medianIncomeCents: number;
  competitorDensity: "low" | "medium" | "high";
  underservedNiches: string[];
  growthPotential: number;
  recommendations: string[];
}

export interface TimingAdvice {
  activity: string;
  bestMonths: number[];
  worstMonths: number[];
  reasoning: string;
  confidence: number;
}

const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  salon: { verticalId: "salon", revenuePerEmployeeCents: 7500000, avgProfitMarginPercent: 8, avgGrowthRatePercent: 3, avgCustomerRetentionPercent: 65, avgCacCents: 3500, avgLtvCents: 85000, avgTicketCents: 6500 },
  "e-commerce": { verticalId: "e-commerce", revenuePerEmployeeCents: 25000000, avgProfitMarginPercent: 10, avgGrowthRatePercent: 12, avgCustomerRetentionPercent: 30, avgCacCents: 4500, avgLtvCents: 18000, avgTicketCents: 5500 },
  consulting: { verticalId: "consulting", revenuePerEmployeeCents: 20000000, avgProfitMarginPercent: 20, avgGrowthRatePercent: 8, avgCustomerRetentionPercent: 80, avgCacCents: 25000, avgLtvCents: 500000, avgTicketCents: 250000 },
  restaurant: { verticalId: "restaurant", revenuePerEmployeeCents: 5500000, avgProfitMarginPercent: 5, avgGrowthRatePercent: 2, avgCustomerRetentionPercent: 55, avgCacCents: 1500, avgLtvCents: 35000, avgTicketCents: 3200 },
  fitness: { verticalId: "fitness", revenuePerEmployeeCents: 9000000, avgProfitMarginPercent: 12, avgGrowthRatePercent: 5, avgCustomerRetentionPercent: 72, avgCacCents: 5000, avgLtvCents: 120000, avgTicketCents: 8500 },
  agency: { verticalId: "agency", revenuePerEmployeeCents: 18000000, avgProfitMarginPercent: 15, avgGrowthRatePercent: 10, avgCustomerRetentionPercent: 75, avgCacCents: 15000, avgLtvCents: 350000, avgTicketCents: 150000 },
  saas: { verticalId: "saas", revenuePerEmployeeCents: 30000000, avgProfitMarginPercent: 18, avgGrowthRatePercent: 25, avgCustomerRetentionPercent: 85, avgCacCents: 20000, avgLtvCents: 600000, avgTicketCents: 50000 },
};

export class MarketIntelligenceService {
  getBenchmark(verticalId: string): IndustryBenchmark | null {
    return INDUSTRY_BENCHMARKS[verticalId] || null;
  }

  assessCompetitivePosition(verticalId: string, userMetrics: { priceCents: number; qualityScore: number; deliveryDays: number; productCount: number; npsScore: number; innovationScore: number }): CompetitivePosition[] {
    const bench = INDUSTRY_BENCHMARKS[verticalId];
    if (!bench) return [];

    return [
      this.buildPosition("price", this.normalizePriceScore(userMetrics.priceCents, bench.avgTicketCents), 50, 75, "Adjust pricing strategy relative to market"),
      this.buildPosition("quality", userMetrics.qualityScore, 60, 85, "Invest in quality systems and training"),
      this.buildPosition("speed", this.normalizeSpeedScore(userMetrics.deliveryDays), 55, 80, "Streamline delivery pipeline"),
      this.buildPosition("breadth", Math.min(100, userMetrics.productCount * 5), 50, 75, "Expand product/service catalog strategically"),
      this.buildPosition("service", Math.min(100, userMetrics.npsScore), 60, 80, "Improve customer experience touchpoints"),
      this.buildPosition("innovation", userMetrics.innovationScore, 45, 70, "Allocate R&D budget for differentiation"),
    ];
  }

  detectTrends(verticalId: string): MarketTrend[] {
    const trendLibrary: Record<string, MarketTrend[]> = {
      salon: [
        { trendId: "ai-booking", name: "AI-Powered Booking", direction: "growing", relevance: 85, description: "Clients expect instant AI booking and reminders", actionable: true, suggestedResponse: "Implement automated booking with smart scheduling" },
        { trendId: "sustainability", name: "Sustainable Products", direction: "growing", relevance: 70, description: "Growing demand for eco-friendly products", actionable: true, suggestedResponse: "Switch to sustainable product lines and market the change" },
        { trendId: "membership", name: "Membership Models", direction: "growing", relevance: 80, description: "Flat-rate memberships replacing per-visit pricing", actionable: true, suggestedResponse: "Design tiered membership program" },
      ],
      "e-commerce": [
        { trendId: "social-commerce", name: "Social Commerce", direction: "growing", relevance: 90, description: "Direct purchasing through social platforms", actionable: true, suggestedResponse: "Enable shoppable content on Instagram/TikTok" },
        { trendId: "same-day", name: "Same-Day Delivery", direction: "growing", relevance: 75, description: "Customer expectations for instant delivery", actionable: true, suggestedResponse: "Partner with local delivery services" },
        { trendId: "personalization", name: "Hyper-Personalization", direction: "growing", relevance: 85, description: "AI-driven product recommendations", actionable: true, suggestedResponse: "Implement recommendation engine" },
      ],
      default: [
        { trendId: "ai-ops", name: "AI Operations", direction: "growing", relevance: 80, description: "AI automating routine business operations", actionable: true, suggestedResponse: "Identify top 5 manual processes for AI automation" },
        { trendId: "remote-first", name: "Remote Service Delivery", direction: "stable", relevance: 65, description: "Hybrid remote/in-person service models", actionable: true, suggestedResponse: "Create digital delivery option for applicable services" },
        { trendId: "subscription-economy", name: "Subscription Economy", direction: "growing", relevance: 75, description: "Shift from ownership to subscription", actionable: true, suggestedResponse: "Design recurring revenue offering" },
      ],
    };
    return trendLibrary[verticalId] || trendLibrary.default;
  }

  analyzeLocalMarket(params: { population: number; medianIncomeCents: number; competitorCount: number; marketSizeCents: number }): LocalMarketAnalysis {
    const density: "low" | "medium" | "high" = params.competitorCount < 5 ? "low" : params.competitorCount < 15 ? "medium" : "high";
    const perCapitaSpend = params.population > 0 ? params.marketSizeCents / params.population : 0;
    const growthPotential = Math.min(100, Math.round((params.medianIncomeCents / 500000) * (density === "low" ? 1.5 : density === "medium" ? 1.0 : 0.7) * 50));

    const niches: string[] = [];
    if (density === "low") niches.push("Premium tier (underserved affluent segment)");
    if (perCapitaSpend < 5000) niches.push("Value segment (low market penetration)");
    if (params.population > 50000) niches.push("Specialized services for large population base");
    niches.push("Digital/remote services (geography-independent)");

    const recommendations: string[] = [];
    if (density === "high") recommendations.push("Differentiate on service quality or niche specialization");
    if (density === "low") recommendations.push("Capture market share quickly before competitors enter");
    if (growthPotential > 60) recommendations.push("Invest in growth — market conditions are favorable");
    recommendations.push("Build local brand through community engagement");

    return { populationEstimate: params.population, medianIncomeCents: params.medianIncomeCents, competitorDensity: density, underservedNiches: niches, growthPotential, recommendations };
  }

  getTimingAdvice(verticalId: string): TimingAdvice[] {
    return [
      { activity: "Launch new product/service", bestMonths: [1, 3, 9], worstMonths: [7, 8, 12], reasoning: "Align with new year energy, spring momentum, or fall restart", confidence: 0.7 },
      { activity: "Hire staff", bestMonths: [1, 2, 9], worstMonths: [6, 7, 11, 12], reasoning: "Talent available after year-end transitions, before summer/holiday", confidence: 0.75 },
      { activity: "Raise prices", bestMonths: [1, 7], worstMonths: [11, 12], reasoning: "Natural reset points; avoid holiday season increases", confidence: 0.8 },
      { activity: "Marketing push", bestMonths: [1, 3, 9, 11], worstMonths: [7, 8], reasoning: "Align with buying intent cycles; summer is typically slow", confidence: 0.65 },
      { activity: "Capital investment", bestMonths: [1, 2, 3], worstMonths: [10, 11, 12], reasoning: "Full year to realize ROI; avoid year-end cash crunch", confidence: 0.7 },
    ];
  }

  private normalizePriceScore(userPrice: number, benchPrice: number): number {
    if (benchPrice === 0) return 50;
    const ratio = userPrice / benchPrice;
    return Math.min(100, Math.max(0, Math.round(50 + (1 - ratio) * 50)));
  }

  private normalizeSpeedScore(deliveryDays: number): number {
    if (deliveryDays <= 1) return 95;
    if (deliveryDays <= 3) return 80;
    if (deliveryDays <= 7) return 60;
    if (deliveryDays <= 14) return 40;
    return 20;
  }

  private buildPosition(dimension: CompetitivePosition["dimension"], score: number, industryAvg: number, topQuartile: number, action: string): CompetitivePosition {
    return { dimension, userScore: Math.round(score), industryAvg, topQuartile, gap: topQuartile - Math.round(score), action };
  }
}

export function createMarketIntelligence(): MarketIntelligenceService {
  return new MarketIntelligenceService();
}

