// ═══════════════════════════════════════════════════════════════
// SITA OS — Life Shock Simulator
// Cross-domain "What If?" engine for life events
// ═══════════════════════════════════════════════════════════════

export type ShockType =
  | 'job-loss' | 'new-baby' | 'divorce' | 'relocation'
  | 'inheritance' | 'disability' | 'business-failure' | 'market-crash';

export interface ShockParams {
  type: ShockType;
  severity: number; // 0-1
  monthlyIncome: number;
  reserves: number;
  monthlyExpenses: number;
  dependents: number;
  businessRevenue: number;
  householdMembers: number;
  activeGoals: number;
  insuranceCoverage: number; // 0-1
}

export interface DomainImpact {
  domain: 'financial' | 'business' | 'household' | 'emotional' | 'timeline';
  severity: number; // 0-1
  description: string;
  immediateActions: string[];
  recoveryMonths: number;
}

export interface ShockImpactReport {
  shockType: ShockType;
  survivalProbability: number;
  recoveryMonths: number;
  resilienceScore: number;
  criticalActions: string[];
  domainImpacts: DomainImpact[];
  scenarioDistribution: { percentile: number; outcome: string; months: number }[];
  runwayAfterShock: number;
  goalsAtRisk: number;
}

// Seeded PRNG for reproducibility
function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Box-Muller for normal distribution
function normalRandom(rng: () => number, mean: number, stddev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

const SHOCK_MULTIPLIERS: Record<ShockType, { financialHit: number; businessHit: number; householdHit: number; emotionalHit: number; baseRecovery: number }> = {
  'job-loss':          { financialHit: 0.7, businessHit: 0.1, householdHit: 0.4, emotionalHit: 0.6, baseRecovery: 6 },
  'new-baby':          { financialHit: 0.3, businessHit: 0.2, householdHit: 0.7, emotionalHit: 0.3, baseRecovery: 12 },
  'divorce':           { financialHit: 0.5, businessHit: 0.3, householdHit: 0.9, emotionalHit: 0.9, baseRecovery: 18 },
  'relocation':        { financialHit: 0.4, businessHit: 0.4, householdHit: 0.6, emotionalHit: 0.4, baseRecovery: 6 },
  'inheritance':       { financialHit: -0.3, businessHit: 0.0, householdHit: 0.2, emotionalHit: 0.3, baseRecovery: 3 },
  'disability':        { financialHit: 0.6, businessHit: 0.7, householdHit: 0.5, emotionalHit: 0.8, baseRecovery: 24 },
  'business-failure':  { financialHit: 0.8, businessHit: 1.0, householdHit: 0.5, emotionalHit: 0.7, baseRecovery: 12 },
  'market-crash':      { financialHit: 0.5, businessHit: 0.6, householdHit: 0.2, emotionalHit: 0.5, baseRecovery: 18 },
};

export class LifeShockSimulator {
  private scenarioCount: number;

  constructor(scenarioCount = 500) {
    this.scenarioCount = scenarioCount;
  }

  simulateShock(params: ShockParams): ShockImpactReport {
    const mult = SHOCK_MULTIPLIERS[params.type];
    const sev = params.severity;

    // Domain impacts
    const domainImpacts = this.computeDomainImpacts(params, mult, sev);

    // Monte Carlo
    const rng = createPRNG(Date.now());
    const outcomes: number[] = [];

    for (let i = 0; i < this.scenarioCount; i++) {
      const incomeShock = normalRandom(rng, mult.financialHit * sev, 0.15);
      const expenseSpike = normalRandom(rng, 0.1 * sev, 0.05);
      const effectiveIncome = params.monthlyIncome * (1 - Math.max(0, incomeShock));
      const effectiveExpenses = params.monthlyExpenses * (1 + Math.max(0, expenseSpike));
      const netMonthly = effectiveIncome - effectiveExpenses;
      const runwayMonths = netMonthly >= 0
        ? 999
        : params.reserves / Math.abs(netMonthly);
      outcomes.push(runwayMonths);
    }

    outcomes.sort((a, b) => a - b);

    const survivalProbability = outcomes.filter(m => m >= 6).length / this.scenarioCount;
    const medianRunway = outcomes[Math.floor(this.scenarioCount * 0.5)];
    const recoveryMonths = Math.ceil(mult.baseRecovery * sev * (1 - params.insuranceCoverage * 0.3));

    const resilienceScore = Math.round(
      (survivalProbability * 40) +
      (Math.min(1, params.reserves / (params.monthlyExpenses * 6)) * 30) +
      (params.insuranceCoverage * 20) +
      ((1 - sev) * 10)
    );

    const criticalActions = this.deriveCriticalActions(params, mult, sev);
    const goalsAtRisk = Math.ceil(params.activeGoals * mult.financialHit * sev);

    return {
      shockType: params.type,
      survivalProbability: Math.round(survivalProbability * 100) / 100,
      recoveryMonths,
      resilienceScore: Math.min(100, Math.max(0, resilienceScore)),
      criticalActions,
      domainImpacts,
      scenarioDistribution: [
        { percentile: 10, outcome: 'worst-case', months: Math.round(outcomes[Math.floor(this.scenarioCount * 0.1)]) },
        { percentile: 25, outcome: 'pessimistic', months: Math.round(outcomes[Math.floor(this.scenarioCount * 0.25)]) },
        { percentile: 50, outcome: 'median', months: Math.round(medianRunway) },
        { percentile: 75, outcome: 'optimistic', months: Math.round(outcomes[Math.floor(this.scenarioCount * 0.75)]) },
        { percentile: 90, outcome: 'best-case', months: Math.round(outcomes[Math.floor(this.scenarioCount * 0.9)]) },
      ],
      runwayAfterShock: Math.round(medianRunway * 10) / 10,
      goalsAtRisk,
    };
  }

  private computeDomainImpacts(p: ShockParams, mult: typeof SHOCK_MULTIPLIERS[ShockType], sev: number): DomainImpact[] {
    return [
      {
        domain: 'financial',
        severity: mult.financialHit * sev,
        description: `Income reduced by ~${Math.round(mult.financialHit * sev * 100)}%. Reserves cover ${Math.round(p.reserves / p.monthlyExpenses)} months.`,
        immediateActions: ['Freeze discretionary spending', 'Review insurance claims', 'Activate emergency fund'],
        recoveryMonths: Math.ceil(mult.baseRecovery * sev * 0.8),
      },
      {
        domain: 'business',
        severity: mult.businessHit * sev,
        description: `Business continuity risk at ${Math.round(mult.businessHit * sev * 100)}%. Revenue gap of $${Math.round(p.businessRevenue * mult.businessHit * sev).toLocaleString()}/mo.`,
        immediateActions: ['Notify key clients', 'Activate succession plan', 'Reduce operational costs'],
        recoveryMonths: Math.ceil(mult.baseRecovery * sev),
      },
      {
        domain: 'household',
        severity: mult.householdHit * sev,
        description: `${Math.ceil(p.householdMembers * mult.householdHit * sev)} members significantly affected. Task redistribution required.`,
        immediateActions: ['Redistribute household responsibilities', 'Arrange childcare backup', 'Communicate with family'],
        recoveryMonths: Math.ceil(mult.baseRecovery * sev * 0.6),
      },
      {
        domain: 'emotional',
        severity: mult.emotionalHit * sev,
        description: `Stress load increase of ${Math.round(mult.emotionalHit * sev * 100)}% across household.`,
        immediateActions: ['Schedule family meeting', 'Identify support resources', 'Set realistic short-term expectations'],
        recoveryMonths: Math.ceil(mult.baseRecovery * sev * 1.2),
      },
      {
        domain: 'timeline',
        severity: (mult.financialHit + mult.householdHit) / 2 * sev,
        description: `${Math.ceil(p.activeGoals * mult.financialHit * sev)} of ${p.activeGoals} active goals at risk of delay or failure.`,
        immediateActions: ['Reprioritize goals', 'Extend non-critical deadlines', 'Identify goals that can survive unchanged'],
        recoveryMonths: Math.ceil(mult.baseRecovery * sev),
      },
    ];
  }

  private deriveCriticalActions(p: ShockParams, mult: typeof SHOCK_MULTIPLIERS[ShockType], sev: number): string[] {
    const actions: string[] = [];
    if (mult.financialHit * sev > 0.5) actions.push('Activate emergency reserves immediately');
    if (p.reserves < p.monthlyExpenses * 3) actions.push('Seek bridge income within 2 weeks');
    if (mult.businessHit * sev > 0.6) actions.push('Notify top 3 clients and activate continuity plan');
    if (mult.householdHit * sev > 0.5) actions.push('Redistribute household tasks within 48 hours');
    if (p.insuranceCoverage < 0.5) actions.push('File insurance claims for applicable coverage');
    if (p.dependents > 0 && mult.emotionalHit * sev > 0.5) actions.push('Arrange support for dependents');
    actions.push('Review and pause non-essential subscriptions');
    actions.push('Update budget with post-shock projections');
    return actions;
  }

  getShockTypes(): { type: ShockType; label: string; description: string }[] {
    return [
      { type: 'job-loss', label: 'Job Loss', description: 'Primary income source eliminated' },
      { type: 'new-baby', label: 'New Baby', description: 'New family member arriving' },
      { type: 'divorce', label: 'Divorce/Separation', description: 'Household split and asset division' },
      { type: 'relocation', label: 'Relocation', description: 'Major geographic move' },
      { type: 'inheritance', label: 'Inheritance', description: 'Unexpected wealth transfer' },
      { type: 'disability', label: 'Disability', description: 'Long-term health impact on earning capacity' },
      { type: 'business-failure', label: 'Business Failure', description: 'Primary business becomes insolvent' },
      { type: 'market-crash', label: 'Market Crash', description: 'Major economic downturn affecting investments' },
    ];
  }
}

export const createLifeShockSimulator = (scenarioCount?: number) => new LifeShockSimulator(scenarioCount);

