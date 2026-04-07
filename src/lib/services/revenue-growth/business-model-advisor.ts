// SITA OS — Business Model Advisor
// Model scoring, transformation paths, unit economics

export type ModelDimension = "recurringRevenue" | "customerConcentration" | "marginHealth" | "scalability" | "defensibility" | "marketTiming" | "unitEconomics" | "growthVelocity";

export interface ModelScore {
  dimension: ModelDimension;
  score: number; // 0-100
  benchmark: number;
  gap: number;
  recommendation: string;
}

export interface ModelAssessment {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  dimensions: ModelScore[];
  topStrengths: string[];
  criticalWeaknesses: string[];
  transformationPaths: TransformationPath[];
}

export interface TransformationPath {
  from: string;
  to: string;
  estimatedTimeMonths: number;
  revenueImpactPercent: number;
  difficulty: "low" | "medium" | "high";
  steps: string[];
  risks: string[];
}

export interface UnitEconomics {
  cacCents: number;
  ltvCents: number;
  ltvCacRatio: number;
  paybackMonths: number;
  contributionMarginPercent: number;
  grossMarginPercent: number;
  healthy: boolean;
  recommendations: string[];
}

export interface BusinessScenarioResult {
  scenarioName: string;
  monthlyRevenueCents: number;
  annualRevenueCents: number;
  newCustomers: number;
  churnedCustomers: number;
  netRevenueLiftCents: number;
  breakEvenMonths: number;
  roiPercent: number;
}

const TRANSFORMATION_LIBRARY: TransformationPath[] = [
  { from: "one-time", to: "subscription", estimatedTimeMonths: 6, revenueImpactPercent: 40, difficulty: "medium", steps: ["Identify recurring value", "Design tier structure", "Build billing system", "Migrate top 20% customers", "Scale enrollment"], risks: ["Customer resistance", "Cash flow dip during transition"] },
  { from: "services", to: "productized", estimatedTimeMonths: 4, revenueImpactPercent: 30, difficulty: "medium", steps: ["Standardize top 3 services", "Create fixed-scope packages", "Build delivery playbook", "Price based on value not hours", "Systematize delivery"], risks: ["Scope creep", "Staff resistance to standardization"] },
  { from: "local", to: "digital", estimatedTimeMonths: 8, revenueImpactPercent: 60, difficulty: "high", steps: ["Digitize core offering", "Build online presence", "Create digital delivery", "Establish online marketing", "Scale beyond geography"], risks: ["Increased competition", "Technology learning curve"] },
  { from: "b2c", to: "b2b", estimatedTimeMonths: 6, revenueImpactPercent: 80, difficulty: "high", steps: ["Identify enterprise use case", "Build enterprise features", "Create sales process", "Develop case studies", "Hire B2B sales"], risks: ["Longer sales cycles", "Higher support needs"] },
  { from: "single-product", to: "platform", estimatedTimeMonths: 12, revenueImpactPercent: 100, difficulty: "high", steps: ["Identify ecosystem participants", "Build API layer", "Create marketplace", "Onboard initial partners", "Drive network effects"], risks: ["Cold start problem", "Quality control at scale"] },
  { from: "manual", to: "automated", estimatedTimeMonths: 3, revenueImpactPercent: 25, difficulty: "low", steps: ["Map manual processes", "Identify automation candidates", "Implement top 5 automations", "Measure time saved", "Reinvest capacity"], risks: ["Over-automation", "Quality degradation"] },
];

export class BusinessModelAdvisor {
  scoreModel(metrics: {
    recurringRevenuePercent: number;
    topCustomerRevenuePercent: number;
    grossMarginPercent: number;
    canServe10xWithoutHiring: boolean;
    hasIP: boolean;
    marketGrowthPercent: number;
    ltvCacRatio: number;
    revenueGrowthPercent: number;
  }): ModelAssessment {
    const dimensions: ModelScore[] = [
      this.scoreDimension("recurringRevenue", metrics.recurringRevenuePercent, 30, "Increase recurring revenue through subscriptions or retainers"),
      this.scoreDimension("customerConcentration", 100 - metrics.topCustomerRevenuePercent, 80, "Diversify customer base to reduce concentration risk"),
      this.scoreDimension("marginHealth", metrics.grossMarginPercent, 60, "Improve margins through pricing or cost optimization"),
      this.scoreDimension("scalability", metrics.canServe10xWithoutHiring ? 80 : 30, 70, "Invest in systems and automation for scalability"),
      this.scoreDimension("defensibility", metrics.hasIP ? 75 : 25, 60, "Build defensible moats: IP, network effects, switching costs"),
      this.scoreDimension("marketTiming", Math.min(100, metrics.marketGrowthPercent * 5), 60, "Align product roadmap with market growth trajectory"),
      this.scoreDimension("unitEconomics", Math.min(100, metrics.ltvCacRatio * 20), 60, "Optimize CAC channels and improve LTV through retention"),
      this.scoreDimension("growthVelocity", Math.min(100, metrics.revenueGrowthPercent * 2), 50, "Accelerate growth through new channels or market expansion"),
    ];

    const overallScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
    const grade = overallScore >= 80 ? "A" : overallScore >= 65 ? "B" : overallScore >= 50 ? "C" : overallScore >= 35 ? "D" : "F";
    const sorted = [...dimensions].sort((a, b) => b.score - a.score);
    const topStrengths = sorted.slice(0, 2).filter((d) => d.score >= 60).map((d) => `${d.dimension}: ${d.score}/100`);
    const criticalWeaknesses = sorted.slice(-2).filter((d) => d.score < 40).map((d) => `${d.dimension}: ${d.score}/100 — ${d.recommendation}`);

    const transformationPaths = this.suggestTransformations(metrics);

    return { overallScore, grade, dimensions, topStrengths, criticalWeaknesses, transformationPaths };
  }

  calculateUnitEconomics(params: {
    totalMarketingSpendCents: number;
    newCustomers: number;
    avgRevPerCustomerCents: number;
    avgLifespanMonths: number;
    cogsCents: number;
    revenueCents: number;
  }): UnitEconomics {
    const cac = params.newCustomers > 0 ? Math.round(params.totalMarketingSpendCents / params.newCustomers) : 0;
    const ltv = Math.round(params.avgRevPerCustomerCents * params.avgLifespanMonths);
    const ltvCacRatio = cac > 0 ? Math.round((ltv / cac) * 100) / 100 : 0;
    const paybackMonths = params.avgRevPerCustomerCents > 0 ? Math.ceil(cac / params.avgRevPerCustomerCents) : Infinity;
    const grossMargin = params.revenueCents > 0 ? Math.round(((params.revenueCents - params.cogsCents) / params.revenueCents) * 100) : 0;
    const contributionMargin = grossMargin - (params.revenueCents > 0 ? Math.round((params.totalMarketingSpendCents / params.revenueCents) * 100) : 0);
    const healthy = ltvCacRatio >= 3 && paybackMonths <= 12;

    const recommendations: string[] = [];
    if (ltvCacRatio < 3) recommendations.push(`LTV/CAC ratio is ${ltvCacRatio}x (target: 3x+). Reduce CAC or improve retention.`);
    if (paybackMonths > 12) recommendations.push(`Payback period is ${paybackMonths} months (target: <12). Increase early revenue or reduce acquisition cost.`);
    if (grossMargin < 60) recommendations.push(`Gross margin is ${grossMargin}% (target: 60%+). Review COGS and pricing.`);
    if (contributionMargin < 20) recommendations.push(`Contribution margin is ${contributionMargin}% (target: 20%+). Marketing spend may be too high relative to revenue.`);

    return { cacCents: cac, ltvCents: ltv, ltvCacRatio, paybackMonths, contributionMarginPercent: contributionMargin, grossMarginPercent: grossMargin, healthy, recommendations };
  }

  modelScenario(params: {
    scenarioName: string;
    currentMonthlyCents: number;
    newPriceCents: number;
    expectedNewCustomers: number;
    expectedChurnPercent: number;
    currentCustomers: number;
    implementationCostCents: number;
  }): BusinessScenarioResult {
    const churnedCustomers = Math.round(params.currentCustomers * params.expectedChurnPercent / 100);
    const netCustomers = params.currentCustomers - churnedCustomers + params.expectedNewCustomers;
    const newMonthly = netCustomers * params.newPriceCents;
    const liftCents = newMonthly - params.currentMonthlyCents;
    const breakEvenMonths = liftCents > 0 ? Math.ceil(params.implementationCostCents / liftCents) : Infinity;
    const annualLift = liftCents * 12;
    const roi = params.implementationCostCents > 0 ? Math.round((annualLift / params.implementationCostCents) * 100) : 0;

    return {
      scenarioName: params.scenarioName,
      monthlyRevenueCents: newMonthly,
      annualRevenueCents: newMonthly * 12,
      newCustomers: params.expectedNewCustomers,
      churnedCustomers,
      netRevenueLiftCents: liftCents,
      breakEvenMonths,
      roiPercent: roi,
    };
  }

  private scoreDimension(dimension: ModelDimension, value: number, benchmark: number, recommendation: string): ModelScore {
    const score = Math.min(100, Math.max(0, Math.round(value)));
    return { dimension, score, benchmark, gap: benchmark - score, recommendation };
  }

  private suggestTransformations(metrics: { recurringRevenuePercent: number; canServe10xWithoutHiring: boolean; grossMarginPercent: number }): TransformationPath[] {
    const paths: TransformationPath[] = [];
    if (metrics.recurringRevenuePercent < 20) paths.push(TRANSFORMATION_LIBRARY[0]);
    if (!metrics.canServe10xWithoutHiring) paths.push(TRANSFORMATION_LIBRARY[5]);
    if (metrics.grossMarginPercent < 50) paths.push(TRANSFORMATION_LIBRARY[1]);
    return paths.slice(0, 3);
  }
}

export function createBusinessModelAdvisor(): BusinessModelAdvisor {
  return new BusinessModelAdvisor();
}

