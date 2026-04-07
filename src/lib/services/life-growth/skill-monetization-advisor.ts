// SITA OS — Skill Monetization Advisor
// Help every household member turn skills into income

export type SkillCategory = "creative" | "technical" | "professional" | "physical" | "educational" | "craft" | "service";
export type MonetizationModel = "freelance" | "gig" | "course" | "product" | "consulting" | "content" | "local-service";

export interface SkillProfile {
  skillId: string;
  name: string;
  category: SkillCategory;
  proficiencyLevel: number; // 1-10
  yearsExperience: number;
  certifications: string[];
  availableHoursPerWeek: number;
  isMinor: boolean;
}

export interface MarketDemandScore {
  skillId: string;
  demandScore: number; // 0-100
  avgHourlyRateCents: number;
  freelancerCount: "low" | "medium" | "high";
  growthTrend: "growing" | "stable" | "declining";
  topPlatforms: PlatformRecommendation[];
}

export interface PlatformRecommendation {
  name: string;
  type: MonetizationModel;
  avgRateCents: number;
  platformFeePercent: number;
  bestFor: string;
  minorSafe: boolean;
}

export interface IncomeProjection {
  monthlyLowCents: number;
  monthlyMidCents: number;
  monthlyHighCents: number;
  rampUpMonths: number;
  assumptions: string[];
}

export interface LaunchRoadmap {
  skillId: string;
  phases: RoadmapPhase[];
  totalWeeks: number;
  firstDollarTarget: string;
  sustainableIncomeTarget: string;
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  durationWeeks: number;
  tasks: string[];
  milestone: string;
  estimatedIncomeCents: number;
}

const SKILL_MARKET_DATA: Record<string, { demand: number; rateRange: [number, number]; growth: "growing" | "stable" | "declining"; platforms: PlatformRecommendation[] }> = {
  "web-development": { demand: 90, rateRange: [5000, 15000], growth: "growing", platforms: [
    { name: "Upwork", type: "freelance", avgRateCents: 7500, platformFeePercent: 10, bestFor: "Long-term contracts", minorSafe: false },
    { name: "Toptal", type: "freelance", avgRateCents: 12000, platformFeePercent: 0, bestFor: "Premium clients", minorSafe: false },
    { name: "Fiverr", type: "gig", avgRateCents: 5000, platformFeePercent: 20, bestFor: "Quick projects", minorSafe: false },
  ]},
  "graphic-design": { demand: 75, rateRange: [3500, 10000], growth: "stable", platforms: [
    { name: "99designs", type: "gig", avgRateCents: 5000, platformFeePercent: 15, bestFor: "Contest-based work", minorSafe: false },
    { name: "Creative Market", type: "product", avgRateCents: 0, platformFeePercent: 30, bestFor: "Selling templates", minorSafe: true },
    { name: "Dribbble", type: "freelance", avgRateCents: 8000, platformFeePercent: 0, bestFor: "Portfolio exposure", minorSafe: true },
  ]},
  "writing": { demand: 70, rateRange: [2500, 8000], growth: "stable", platforms: [
    { name: "Medium", type: "content", avgRateCents: 0, platformFeePercent: 0, bestFor: "Audience building", minorSafe: true },
    { name: "Contently", type: "freelance", avgRateCents: 6000, platformFeePercent: 0, bestFor: "Premium content", minorSafe: false },
    { name: "Substack", type: "content", avgRateCents: 0, platformFeePercent: 10, bestFor: "Newsletter monetization", minorSafe: true },
  ]},
  "tutoring": { demand: 85, rateRange: [2000, 7000], growth: "growing", platforms: [
    { name: "Wyzant", type: "local-service", avgRateCents: 4000, platformFeePercent: 25, bestFor: "Academic tutoring", minorSafe: true },
    { name: "Chegg Tutors", type: "local-service", avgRateCents: 2000, platformFeePercent: 20, bestFor: "Homework help", minorSafe: true },
    { name: "Varsity Tutors", type: "local-service", avgRateCents: 3500, platformFeePercent: 30, bestFor: "Test prep", minorSafe: true },
  ]},
  "photography": { demand: 65, rateRange: [3000, 12000], growth: "stable", platforms: [
    { name: "Shutterstock", type: "product", avgRateCents: 0, platformFeePercent: 60, bestFor: "Stock photos", minorSafe: true },
    { name: "SmugMug", type: "product", avgRateCents: 0, platformFeePercent: 15, bestFor: "Print sales", minorSafe: true },
    { name: "Thumbtack", type: "local-service", avgRateCents: 8000, platformFeePercent: 0, bestFor: "Local events", minorSafe: false },
  ]},
  "pet-care": { demand: 80, rateRange: [1500, 4000], growth: "growing", platforms: [
    { name: "Rover", type: "local-service", avgRateCents: 2500, platformFeePercent: 20, bestFor: "Pet sitting/walking", minorSafe: true },
    { name: "Wag", type: "gig", avgRateCents: 2000, platformFeePercent: 40, bestFor: "Dog walking", minorSafe: true },
  ]},
  "crafts": { demand: 60, rateRange: [1000, 5000], growth: "stable", platforms: [
    { name: "Etsy", type: "product", avgRateCents: 0, platformFeePercent: 12, bestFor: "Handmade goods", minorSafe: true },
    { name: "Amazon Handmade", type: "product", avgRateCents: 0, platformFeePercent: 15, bestFor: "Scale sales", minorSafe: false },
  ]},
};

export class SkillMonetizationAdvisor {
  assessMarketDemand(skill: SkillProfile): MarketDemandScore {
    const key = skill.name.toLowerCase().replace(/\s+/g, "-");
    const data = SKILL_MARKET_DATA[key];

    if (data) {
      const platforms = skill.isMinor ? data.platforms.filter((p) => p.minorSafe) : data.platforms;
      const avgRate = data.rateRange[0] + (data.rateRange[1] - data.rateRange[0]) * (skill.proficiencyLevel / 10);
      return {
        skillId: skill.skillId,
        demandScore: data.demand,
        avgHourlyRateCents: Math.round(avgRate),
        freelancerCount: data.demand > 80 ? "high" : data.demand > 50 ? "medium" : "low",
        growthTrend: data.growth,
        topPlatforms: platforms,
      };
    }

    return {
      skillId: skill.skillId,
      demandScore: 50,
      avgHourlyRateCents: 3000 + skill.proficiencyLevel * 500,
      freelancerCount: "medium",
      growthTrend: "stable",
      topPlatforms: skill.isMinor
        ? [{ name: "Local community", type: "local-service", avgRateCents: 2000, platformFeePercent: 0, bestFor: "Starting out", minorSafe: true }]
        : [{ name: "Upwork", type: "freelance", avgRateCents: 4000, platformFeePercent: 10, bestFor: "General freelancing", minorSafe: false }],
    };
  }

  projectIncome(skill: SkillProfile, demand: MarketDemandScore): IncomeProjection {
    const hourlyRate = demand.avgHourlyRateCents;
    const utilizationLow = 0.4;
    const utilizationMid = 0.6;
    const utilizationHigh = 0.8;
    const platformFee = demand.topPlatforms[0]?.platformFeePercent || 10;
    const netMultiplier = 1 - platformFee / 100;

    const monthlyHours = skill.availableHoursPerWeek * 4.33;

    return {
      monthlyLowCents: Math.round(hourlyRate * monthlyHours * utilizationLow * netMultiplier),
      monthlyMidCents: Math.round(hourlyRate * monthlyHours * utilizationMid * netMultiplier),
      monthlyHighCents: Math.round(hourlyRate * monthlyHours * utilizationHigh * netMultiplier),
      rampUpMonths: skill.yearsExperience > 2 ? 2 : skill.yearsExperience > 0 ? 4 : 6,
      assumptions: [
        `Hourly rate: $${(hourlyRate / 100).toFixed(0)}/hr`,
        `Available: ${skill.availableHoursPerWeek} hrs/week`,
        `Platform fee: ${platformFee}%`,
        `Ramp-up: ${skill.yearsExperience > 2 ? "2" : skill.yearsExperience > 0 ? "4" : "6"} months to mid utilization`,
      ],
    };
  }

  generateLaunchRoadmap(skill: SkillProfile, demand: MarketDemandScore): LaunchRoadmap {
    const isMinor = skill.isMinor;
    const phases: RoadmapPhase[] = [
      {
        phase: 1, name: "Foundation", durationWeeks: 2,
        tasks: [
          "Create portfolio of best work (3-5 samples)",
          isMinor ? "Get parental approval for platform accounts" : "Set up professional profiles on top platforms",
          "Research top 10 competitors in your niche",
          "Set initial pricing (start 20% below market to build reviews)",
        ],
        milestone: "Profile live with portfolio", estimatedIncomeCents: 0,
      },
      {
        phase: 2, name: "First Dollar", durationWeeks: 4,
        tasks: [
          "Apply to 10 relevant jobs/gigs per week",
          "Offer 2-3 discounted projects for testimonials",
          "Deliver exceptional quality on every project",
          "Ask for reviews after each completion",
        ],
        milestone: "First paid project completed", estimatedIncomeCents: Math.round(demand.avgHourlyRateCents * 10),
      },
      {
        phase: 3, name: "Momentum", durationWeeks: 8,
        tasks: [
          "Increase prices by 15% after 5 positive reviews",
          "Specialize in highest-demand sub-niche",
          "Create repeatable delivery process",
          "Build client relationships for repeat work",
        ],
        milestone: "Consistent weekly income", estimatedIncomeCents: Math.round(demand.avgHourlyRateCents * skill.availableHoursPerWeek * 2),
      },
      {
        phase: 4, name: "Sustainable Income", durationWeeks: 12,
        tasks: [
          "Raise rates to market average",
          "Develop signature offering or package",
          "Build referral system (ask every happy client)",
          "Consider creating passive income (course, templates)",
        ],
        milestone: "Predictable monthly income stream", estimatedIncomeCents: Math.round(demand.avgHourlyRateCents * skill.availableHoursPerWeek * 4 * 0.6),
      },
    ];

    return {
      skillId: skill.skillId,
      phases,
      totalWeeks: phases.reduce((t, p) => t + p.durationWeeks, 0),
      firstDollarTarget: "Week 4-6",
      sustainableIncomeTarget: "Month 4-6",
    };
  }

  getMinorSafeSkills(): Array<{ name: string; category: SkillCategory; minAge: number; platforms: string[] }> {
    return [
      { name: "Tutoring", category: "educational", minAge: 14, platforms: ["Wyzant", "Local community"] },
      { name: "Pet Care", category: "service", minAge: 12, platforms: ["Rover", "Neighborhood"] },
      { name: "Crafts", category: "craft", minAge: 10, platforms: ["Etsy (with parent)", "Local fairs"] },
      { name: "Photography", category: "creative", minAge: 13, platforms: ["Shutterstock", "SmugMug"] },
      { name: "Graphic Design", category: "creative", minAge: 13, platforms: ["Creative Market", "Redbubble"] },
      { name: "Writing", category: "creative", minAge: 13, platforms: ["Medium", "School newspaper"] },
      { name: "Lawn Care", category: "physical", minAge: 12, platforms: ["Neighborhood", "Nextdoor"] },
      { name: "Tech Support", category: "technical", minAge: 14, platforms: ["Local community", "Family/friends"] },
    ];
  }
}

export function createSkillMonetizationAdvisor(): SkillMonetizationAdvisor {
  return new SkillMonetizationAdvisor();
}

