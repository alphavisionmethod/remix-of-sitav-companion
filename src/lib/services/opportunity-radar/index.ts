// ═══════════════════════════════════════════════════════════════
// SITA OS — Opportunity Radar
// Cross-domain opportunity detection
// ═══════════════════════════════════════════════════════════════

export type OpportunityType = 'synergy' | 'cost-saving' | 'revenue' | 'skill-match' | 'timing' | 'restructure';

export interface CrossDomainOpportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  estimatedValue: number; // annual $ impact
  confidence: number; // 0-1
  domains: string[];
  expiresIn?: number; // days, if time-sensitive
  actionSteps: string[];
}

export interface OpportunityCostAnalysis {
  optionA: string;
  optionB: string;
  costOfA: { financial: number; time: number; relationship: number };
  costOfB: { financial: number; time: number; relationship: number };
  recommendation: string;
}

export interface SynergyMatch {
  goalA: string;
  goalB: string;
  sharedAction: string;
  efficiencyGain: number; // percentage
}

export class OpportunityRadarEngine {
  private opportunities: Map<string, CrossDomainOpportunity> = new Map();
  private counter = 0;

  scanOpportunities(data: {
    skills: { memberId: string; memberName: string; skills: string[] }[];
    businessNeeds: { need: string; budget: number }[];
    financials: { savingsRate: number; highYieldBalance: number; debtRates: { name: string; rate: number; balance: number }[] };
    householdChanges: { type: string; timeline: string; impact: string }[];
    goals: { id: string; title: string; domain: string; resources: string[] }[];
    contracts: { vendor: string; amount: number; endDate: string }[];
  }): CrossDomainOpportunity[] {
    const found: CrossDomainOpportunity[] = [];

    // Skill-business matches
    for (const need of data.businessNeeds) {
      for (const member of data.skills) {
        const match = member.skills.find(s => need.need.toLowerCase().includes(s.toLowerCase()));
        if (match) {
          found.push(this.create('skill-match',
            `${member.memberName} can handle: ${need.need}`,
            `Family member has the "${match}" skill your business needs. Saves $${need.budget} outsourcing cost.`,
            need.budget, 0.75, ['business', 'household'],
            [`Discuss with ${member.memberName}`, 'Define scope and timeline', 'Set fair compensation if applicable']
          ));
        }
      }
    }

    // Debt restructuring
    if (data.financials.debtRates.length > 1) {
      const sorted = [...data.financials.debtRates].sort((a, b) => b.rate - a.rate);
      const highest = sorted[0];
      const lowest = sorted[sorted.length - 1];
      if (highest.rate - lowest.rate > 0.03) {
        const savings = Math.round(highest.balance * (highest.rate - lowest.rate));
        found.push(this.create('restructure',
          'Debt restructuring opportunity',
          `Moving ${highest.name} (${(highest.rate * 100).toFixed(1)}%) to a rate closer to ${lowest.name} (${(lowest.rate * 100).toFixed(1)}%) saves ~$${savings}/year.`,
          savings, 0.8, ['financial'],
          ['Research refinancing options', 'Compare balance transfer offers', 'Calculate break-even on fees']
        ));
      }
    }

    // Savings optimization
    if (data.financials.highYieldBalance > 10000 && data.financials.savingsRate < 0.03) {
      const potentialGain = Math.round(data.financials.highYieldBalance * 0.02);
      found.push(this.create('cost-saving',
        'Low-yield savings detected',
        `$${data.financials.highYieldBalance.toLocaleString()} earning below 3%. Moving to high-yield account adds ~$${potentialGain}/year.`,
        potentialGain, 0.9, ['financial'],
        ['Compare HYSA rates', 'Open high-yield account', 'Set up automatic transfer']
      ));
    }

    // Contract renewal windows
    const now = Date.now();
    for (const c of data.contracts) {
      const daysUntil = Math.ceil((new Date(c.endDate).getTime() - now) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= 90) {
        found.push(this.create('timing',
          `${c.vendor} contract renewal window`,
          `Contract ends in ${daysUntil} days — optimal negotiation window. Current: $${c.amount}/mo.`,
          Math.round(c.amount * 12 * 0.15), 0.7, ['business', 'financial'],
          ['Research competitor pricing', 'Prepare negotiation strategy', 'Contact vendor 30 days before expiry'],
          daysUntil
        ));
      }
    }

    // Goal synergies
    for (let i = 0; i < data.goals.length; i++) {
      for (let j = i + 1; j < data.goals.length; j++) {
        const shared = data.goals[i].resources.filter(r => data.goals[j].resources.includes(r));
        if (shared.length > 0) {
          found.push(this.create('synergy',
            `Goal synergy: ${data.goals[i].title} + ${data.goals[j].title}`,
            `Both goals need: ${shared.join(', ')}. Combining efforts saves resources.`,
            0, 0.65, [data.goals[i].domain, data.goals[j].domain],
            ['Merge resource allocation', 'Create shared milestone plan', 'Assign single owner for shared resources']
          ));
        }
      }
    }

    for (const o of found) this.opportunities.set(o.id, o);
    return found.sort((a, b) => b.estimatedValue - a.estimatedValue);
  }

  calculateOpportunityCost(
    optionA: { name: string; financial: number; timeCost: number; relationshipImpact: number },
    optionB: { name: string; financial: number; timeCost: number; relationshipImpact: number }
  ): OpportunityCostAnalysis {
    const totalA = optionA.financial + optionA.timeCost * 50 + optionA.relationshipImpact * 100;
    const totalB = optionB.financial + optionB.timeCost * 50 + optionB.relationshipImpact * 100;

    return {
      optionA: optionA.name, optionB: optionB.name,
      costOfA: { financial: optionA.financial, time: optionA.timeCost, relationship: optionA.relationshipImpact },
      costOfB: { financial: optionB.financial, time: optionB.timeCost, relationship: optionB.relationshipImpact },
      recommendation: totalA < totalB
        ? `${optionA.name} has lower total cost ($${Math.round(totalA)} vs $${Math.round(totalB)})`
        : `${optionB.name} has lower total cost ($${Math.round(totalB)} vs $${Math.round(totalA)})`,
    };
  }

  detectSynergies(goals: { id: string; title: string; resources: string[] }[]): SynergyMatch[] {
    const matches: SynergyMatch[] = [];
    for (let i = 0; i < goals.length; i++) {
      for (let j = i + 1; j < goals.length; j++) {
        const shared = goals[i].resources.filter(r => goals[j].resources.includes(r));
        for (const action of shared) {
          matches.push({
            goalA: goals[i].title, goalB: goals[j].title,
            sharedAction: action,
            efficiencyGain: Math.round((1 / (goals[i].resources.length + goals[j].resources.length)) * 100),
          });
        }
      }
    }
    return matches;
  }

  getTimeSensitive(daysThreshold = 30): CrossDomainOpportunity[] {
    return [...this.opportunities.values()]
      .filter(o => o.expiresIn !== undefined && o.expiresIn <= daysThreshold)
      .sort((a, b) => (a.expiresIn ?? 999) - (b.expiresIn ?? 999));
  }

  listAll(): CrossDomainOpportunity[] { return [...this.opportunities.values()]; }

  private create(type: OpportunityType, title: string, description: string, value: number, confidence: number, domains: string[], actions: string[], expiresIn?: number): CrossDomainOpportunity {
    return { id: `opp-${++this.counter}`, type, title, description, estimatedValue: value, confidence, domains, actionSteps: actions, expiresIn };
  }
}

export const createOpportunityRadar = () => new OpportunityRadarEngine();
