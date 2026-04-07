// SITA OS — Income Discovery Engine
// Finds new revenue streams for any business type

export type RevenueStreamType = "core" | "upsell" | "cross-sell" | "subscription" | "passive" | "seasonal" | "digital" | "licensing";

export interface RevenueGap {
  category: string;
  currentRevenueCents: number;
  benchmarkRevenueCents: number;
  gapCents: number;
  gapPercent: number;
  suggestedActions: string[];
  estimatedLiftCents: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface PricingRecommendation {
  productId: string;
  currentPriceCents: number;
  optimalPriceCents: number;
  elasticity: number;
  marginGap: number;
  churnRiskPercent: number;
  projectedRevenueChangeCents: number;
  confidence: number;
}

export interface UpsellOpportunity {
  customerId: string;
  currentProducts: string[];
  suggestedBundle: string[];
  expectedLiftCents: number;
  probability: number;
  reasoning: string;
}

export interface SeasonalPlan {
  month: number;
  monthName: string;
  opportunities: string[];
  estimatedRevenueCents: number;
  preparationLeadDays: number;
  campaigns: string[];
}

export interface PassiveIncomeStream {
  assetType: "space" | "ip" | "expertise" | "equipment" | "data" | "brand";
  description: string;
  estimatedMonthlyCents: number;
  setupEffortDays: number;
  recurring: boolean;
  platforms: string[];
}

interface VerticalBenchmark {
  verticalId: string;
  revenueStreams: Record<string, number>;
  avgRevPerCustomerCents: number;
  upsellRate: number;
  subscriptionPercent: number;
}

const VERTICAL_BENCHMARKS: Record<string, VerticalBenchmark> = {
  salon: { verticalId: "salon", revenueStreams: { cuts: 0.35, color: 0.25, treatments: 0.15, retail: 0.15, memberships: 0.10 }, avgRevPerCustomerCents: 8500, upsellRate: 0.22, subscriptionPercent: 12 },
  "e-commerce": { verticalId: "e-commerce", revenueStreams: { products: 0.60, subscriptions: 0.15, bundles: 0.10, affiliate: 0.08, digital: 0.07 }, avgRevPerCustomerCents: 6200, upsellRate: 0.18, subscriptionPercent: 20 },
  consulting: { verticalId: "consulting", revenueStreams: { projects: 0.45, retainers: 0.25, workshops: 0.12, courses: 0.10, licensing: 0.08 }, avgRevPerCustomerCents: 250000, upsellRate: 0.30, subscriptionPercent: 25 },
  restaurant: { verticalId: "restaurant", revenueStreams: { "dine-in": 0.50, takeout: 0.20, delivery: 0.15, catering: 0.10, merch: 0.05 }, avgRevPerCustomerCents: 3500, upsellRate: 0.15, subscriptionPercent: 5 },
  fitness: { verticalId: "fitness", revenueStreams: { memberships: 0.40, "personal-training": 0.25, classes: 0.15, retail: 0.10, digital: 0.10 }, avgRevPerCustomerCents: 12000, upsellRate: 0.28, subscriptionPercent: 45 },
  agency: { verticalId: "agency", revenueStreams: { projects: 0.40, retainers: 0.30, strategy: 0.12, training: 0.10, "white-label": 0.08 }, avgRevPerCustomerCents: 500000, upsellRate: 0.25, subscriptionPercent: 30 },
};

const SEASONAL_OPPORTUNITIES: SeasonalPlan[] = [
  { month: 1, monthName: "January", opportunities: ["New Year resolutions", "Annual planning services", "Tax prep start"], estimatedRevenueCents: 0, preparationLeadDays: 30, campaigns: ["fresh-start", "annual-review"] },
  { month: 2, monthName: "February", opportunities: ["Valentine's promotions", "Q1 push"], estimatedRevenueCents: 0, preparationLeadDays: 21, campaigns: ["valentines", "q1-acceleration"] },
  { month: 3, monthName: "March", opportunities: ["Spring launch", "End of Q1 close"], estimatedRevenueCents: 0, preparationLeadDays: 14, campaigns: ["spring-launch", "q1-close"] },
  { month: 4, monthName: "April", opportunities: ["Tax season services", "Spring cleaning"], estimatedRevenueCents: 0, preparationLeadDays: 30, campaigns: ["tax-season", "spring-refresh"] },
  { month: 5, monthName: "May", opportunities: ["Mother's Day", "Summer prep", "Graduation"], estimatedRevenueCents: 0, preparationLeadDays: 21, campaigns: ["mothers-day", "graduation"] },
  { month: 6, monthName: "June", opportunities: ["Mid-year review", "Summer launch", "Father's Day"], estimatedRevenueCents: 0, preparationLeadDays: 14, campaigns: ["mid-year", "summer-kickoff"] },
  { month: 7, monthName: "July", opportunities: ["Summer peak", "Back-to-school prep"], estimatedRevenueCents: 0, preparationLeadDays: 30, campaigns: ["summer-peak", "bts-early"] },
  { month: 8, monthName: "August", opportunities: ["Back-to-school", "Fall planning"], estimatedRevenueCents: 0, preparationLeadDays: 21, campaigns: ["back-to-school", "fall-prep"] },
  { month: 9, monthName: "September", opportunities: ["Fall launch", "Q4 planning"], estimatedRevenueCents: 0, preparationLeadDays: 30, campaigns: ["fall-launch", "q4-strategy"] },
  { month: 10, monthName: "October", opportunities: ["Halloween", "Holiday prep", "Black Friday planning"], estimatedRevenueCents: 0, preparationLeadDays: 30, campaigns: ["halloween", "holiday-early"] },
  { month: 11, monthName: "November", opportunities: ["Black Friday", "Cyber Monday", "Holiday rush start"], estimatedRevenueCents: 0, preparationLeadDays: 14, campaigns: ["black-friday", "cyber-monday"] },
  { month: 12, monthName: "December", opportunities: ["Holiday peak", "Year-end close", "Gift cards"], estimatedRevenueCents: 0, preparationLeadDays: 7, campaigns: ["holiday-peak", "year-end", "gift-cards"] },
];

export class IncomeDiscoveryEngine {
  analyzeGaps(verticalId: string, currentStreams: Record<string, number>): RevenueGap[] {
    const benchmark = VERTICAL_BENCHMARKS[verticalId];
    if (!benchmark) return [];
    const totalCurrent = Object.values(currentStreams).reduce((a, b) => a + b, 0);
    const gaps: RevenueGap[] = [];
    for (const [category, benchPct] of Object.entries(benchmark.revenueStreams)) {
      const currentAmt = currentStreams[category] || 0;
      const benchAmt = Math.round(totalCurrent * benchPct / (1 - benchPct + 0.01));
      const gap = Math.max(0, benchAmt - currentAmt);
      if (gap > 0) {
        const gapPct = totalCurrent > 0 ? (gap / totalCurrent) * 100 : 0;
        gaps.push({
          category,
          currentRevenueCents: currentAmt,
          benchmarkRevenueCents: benchAmt,
          gapCents: gap,
          gapPercent: Math.round(gapPct * 10) / 10,
          suggestedActions: this.getSuggestedActions(category, verticalId),
          estimatedLiftCents: Math.round(gap * 0.3),
          difficulty: gapPct > 50 ? "hard" : gapPct > 20 ? "medium" : "easy",
        });
      }
    }
    return gaps.sort((a, b) => b.estimatedLiftCents - a.estimatedLiftCents);
  }

  optimizePricing(products: Array<{ id: string; priceCents: number; monthlySales: number; competitorPriceCents?: number }>): PricingRecommendation[] {
    return products.map((p) => {
      const competitorPrice = p.competitorPriceCents || p.priceCents * 1.1;
      const marginGap = (competitorPrice - p.priceCents) / p.priceCents;
      const elasticity = marginGap > 0.3 ? 0.3 : marginGap > 0.1 ? 0.5 : 0.8;
      const optimalPrice = Math.round(p.priceCents * (1 + elasticity * marginGap));
      const priceIncrease = optimalPrice - p.priceCents;
      const churnRisk = Math.min(30, (priceIncrease / p.priceCents) * 100 * 1.5);
      const projectedChange = Math.round(priceIncrease * p.monthlySales * (1 - churnRisk / 100));
      return {
        productId: p.id,
        currentPriceCents: p.priceCents,
        optimalPriceCents: optimalPrice,
        elasticity,
        marginGap: Math.round(marginGap * 1000) / 1000,
        churnRiskPercent: Math.round(churnRisk * 10) / 10,
        projectedRevenueChangeCents: projectedChange,
        confidence: marginGap > 0.05 ? 0.8 : 0.5,
      };
    });
  }

  suggestUpsells(customers: Array<{ id: string; products: string[]; spendCents: number }>, catalog: string[]): UpsellOpportunity[] {
    return customers.map((c) => {
      const missing = catalog.filter((p) => !c.products.includes(p));
      const topSuggestions = missing.slice(0, 3);
      const avgItemValue = c.products.length > 0 ? c.spendCents / c.products.length : 0;
      return {
        customerId: c.id,
        currentProducts: c.products,
        suggestedBundle: topSuggestions,
        expectedLiftCents: Math.round(avgItemValue * topSuggestions.length * 0.4),
        probability: Math.min(0.85, 0.3 + c.products.length * 0.1),
        reasoning: `Customer uses ${c.products.length}/${catalog.length} products. High affinity for ${topSuggestions[0] || "upgrades"}.`,
      };
    }).filter((u) => u.suggestedBundle.length > 0);
  }

  planSeasonal(verticalId: string, avgMonthlyRevenueCents: number): SeasonalPlan[] {
    const multipliers: Record<string, number[]> = {
      salon: [0.8, 1.1, 1.0, 0.9, 1.3, 1.1, 0.9, 0.8, 1.0, 1.0, 1.1, 1.4],
      "e-commerce": [0.7, 0.8, 0.9, 0.9, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.8, 2.0],
      restaurant: [0.8, 1.1, 1.0, 1.0, 1.2, 1.1, 1.0, 0.9, 1.0, 1.0, 1.1, 1.3],
      default: [0.85, 0.9, 1.0, 1.0, 1.05, 1.0, 0.9, 0.9, 1.05, 1.05, 1.2, 1.3],
    };
    const mults = multipliers[verticalId] || multipliers.default;
    return SEASONAL_OPPORTUNITIES.map((s, i) => ({
      ...s,
      estimatedRevenueCents: Math.round(avgMonthlyRevenueCents * mults[i]),
    }));
  }

  detectPassiveIncome(assets: Array<{ type: PassiveIncomeStream["assetType"]; description: string; currentUtilization: number }>): PassiveIncomeStream[] {
    const STREAM_TEMPLATES: Record<string, Omit<PassiveIncomeStream, "description">> = {
      space: { assetType: "space", estimatedMonthlyCents: 80000, setupEffortDays: 14, recurring: true, platforms: ["Peerspace", "Spacer", "ShareMySpace"] },
      ip: { assetType: "ip", estimatedMonthlyCents: 50000, setupEffortDays: 30, recurring: true, platforms: ["Gumroad", "Creative Market", "Licensing.biz"] },
      expertise: { assetType: "expertise", estimatedMonthlyCents: 120000, setupEffortDays: 45, recurring: true, platforms: ["Teachable", "Udemy", "Skillshare", "YouTube"] },
      equipment: { assetType: "equipment", estimatedMonthlyCents: 40000, setupEffortDays: 7, recurring: true, platforms: ["Fat Llama", "ShareGrid", "Neighbor"] },
      data: { assetType: "data", estimatedMonthlyCents: 30000, setupEffortDays: 21, recurring: true, platforms: ["Datarade", "Snowflake Marketplace"] },
      brand: { assetType: "brand", estimatedMonthlyCents: 60000, setupEffortDays: 30, recurring: true, platforms: ["Merch platforms", "Affiliate networks", "Co-branding"] },
    };
    return assets
      .filter((a) => a.currentUtilization < 0.7)
      .map((a) => {
        const template = STREAM_TEMPLATES[a.type];
        if (!template) return null;
        const utilizationGap = 1 - a.currentUtilization;
        return { ...template, description: a.description, estimatedMonthlyCents: Math.round(template.estimatedMonthlyCents * utilizationGap) };
      })
      .filter((s): s is PassiveIncomeStream => s !== null);
  }

  private getSuggestedActions(category: string, _verticalId: string): string[] {
    const actionMap: Record<string, string[]> = {
      color: ["Add color menu to services", "Train staff on balayage/highlights", "Bundle color + cut packages"],
      retail: ["Source professional products", "Create retail display area", "Add product recommendations to checkout"],
      memberships: ["Design 3-tier membership program", "Offer annual prepay discount", "Include exclusive member perks"],
      subscriptions: ["Create subscription box/service", "Offer auto-replenishment", "Design loyalty program"],
      digital: ["Create online courses", "Offer virtual consultations", "Sell digital templates/guides"],
      courses: ["Package expertise into curriculum", "Build cohort-based programs", "Create self-paced modules"],
      catering: ["Create catering menu", "Partner with event planners", "Offer corporate lunch packages"],
      "personal-training": ["Hire certified trainers", "Create small group programs", "Offer nutrition coaching add-on"],
    };
    return actionMap[category] || ["Research market demand", "Survey existing customers", "Pilot with small offering"];
  }
}

export function createIncomeDiscoveryEngine(): IncomeDiscoveryEngine {
  return new IncomeDiscoveryEngine();
}

