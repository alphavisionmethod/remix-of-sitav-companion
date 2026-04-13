// ═══════════════════════════════════════════════════════════════
// SITA OS — Monte Carlo Simulation Engine
// Batched execution with real-time progress callbacks
// ═══════════════════════════════════════════════════════════════

export interface SimulationVariable {
  id: string;
  label: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  distribution: "normal" | "uniform" | "triangular";
}

export interface SimulationConfig {
  variables: SimulationVariable[];
  iterations: number;
  outputFormula: (vars: Record<string, number>) => number;
  batchSize?: number;
}

export interface SimulationProgress {
  completed: number;
  total: number;
  results: number[];
  percentiles: Record<string, number>;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  speed: number;
}

export interface SimulationResult extends SimulationProgress {
  histogram: { bin: number; count: number }[];
  clusters: { label: string; percentage: number; range: [number, number] }[];
  sensitivity: { variable: string; impact: number }[];
  tailRisk: { threshold: number; probability: number; label: string }[];
}

// Box-Muller transform for normal distribution
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function sampleVariable(v: SimulationVariable): number {
  switch (v.distribution) {
    case "normal":
      return Math.max(v.min, Math.min(v.max, normalRandom(v.mean, v.stdDev)));
    case "uniform":
      return v.min + Math.random() * (v.max - v.min);
    case "triangular": {
      const u = Math.random();
      const mode = v.mean;
      const fc = (mode - v.min) / (v.max - v.min);
      if (u < fc) {
        return v.min + Math.sqrt(u * (v.max - v.min) * (mode - v.min));
      }
      return v.max - Math.sqrt((1 - u) * (v.max - v.min) * (v.max - mode));
    }
    default:
      return v.mean;
  }
}

function computePercentiles(sorted: number[]): Record<string, number> {
  const n = sorted.length;
  if (n === 0) return {};
  const p = (pct: number) => sorted[Math.min(Math.floor(pct * n), n - 1)];
  return { P10: p(0.1), P25: p(0.25), P50: p(0.5), P75: p(0.75), P90: p(0.9) };
}

function buildHistogram(results: number[], bins = 40): { bin: number; count: number }[] {
  if (results.length === 0) return [];
  const min = results[0];
  const max = results[results.length - 1];
  const range = max - min || 1;
  const binWidth = range / bins;
  const hist = Array.from({ length: bins }, (_, i) => ({ bin: min + (i + 0.5) * binWidth, count: 0 }));
  for (const v of results) {
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    hist[idx].count++;
  }
  return hist;
}

function identifyClusters(sorted: number[]): SimulationResult["clusters"] {
  if (sorted.length === 0) return [];
  const n = sorted.length;
  const p25 = sorted[Math.floor(n * 0.25)];
  const p75 = sorted[Math.floor(n * 0.75)];
  const low = sorted.filter(v => v < p25).length;
  const mid = sorted.filter(v => v >= p25 && v <= p75).length;
  const high = sorted.filter(v => v > p75).length;
  return [
    { label: "Bear case", percentage: Math.round((low / n) * 100), range: [sorted[0], p25] },
    { label: "Base case", percentage: Math.round((mid / n) * 100), range: [p25, p75] },
    { label: "Bull case", percentage: Math.round((high / n) * 100), range: [p75, sorted[n - 1]] },
  ];
}

export function runSimulationBatch(
  config: SimulationConfig,
  onProgress: (p: SimulationProgress) => void,
  onComplete: (r: SimulationResult) => void,
): { cancel: () => void } {
  const { variables, iterations, outputFormula, batchSize = 2000 } = config;
  const results: number[] = [];
  let completed = 0;
  let cancelled = false;
  const startTime = performance.now();

  const baselineVars: Record<string, number> = {};
  variables.forEach(v => { baselineVars[v.id] = v.mean; });
  const baselineOutput = outputFormula(baselineVars);

  const tick = () => {
    if (cancelled) return;
    const batchEnd = Math.min(completed + batchSize, iterations);

    for (let i = completed; i < batchEnd; i++) {
      const sampled: Record<string, number> = {};
      variables.forEach(v => { sampled[v.id] = sampleVariable(v); });
      results.push(outputFormula(sampled));
    }
    completed = batchEnd;

    const sorted = [...results].sort((a, b) => a - b);
    const mean = results.reduce((s, v) => s + v, 0) / results.length;
    const variance = results.reduce((s, v) => s + (v - mean) ** 2, 0) / results.length;
    const elapsed = (performance.now() - startTime) / 1000;

    const progress: SimulationProgress = {
      completed,
      total: iterations,
      results: sorted,
      percentiles: computePercentiles(sorted),
      mean,
      stdDev: Math.sqrt(variance),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      speed: Math.round(completed / elapsed),
    };

    onProgress(progress);

    if (completed >= iterations) {
      const sensitivity = variables.map(v => {
        const tweaked = { ...baselineVars, [v.id]: v.mean + v.stdDev };
        const delta = Math.abs(outputFormula(tweaked) - baselineOutput);
        return { variable: v.label, impact: delta };
      }).sort((a, b) => b.impact - a.impact);

      const p10 = progress.percentiles.P10 ?? 0;
      const tailCount = sorted.filter(v => v <= p10 * 0.5).length;
      const tailRisk = [{
        threshold: p10 * 0.5,
        probability: Math.round((tailCount / sorted.length) * 100),
        label: `Severe downside (below ${(p10 * 0.5).toFixed(0)})`,
      }];

      onComplete({
        ...progress,
        histogram: buildHistogram(sorted),
        clusters: identifyClusters(sorted),
        sensitivity,
        tailRisk,
      });
    } else {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
  return { cancel: () => { cancelled = true; } };
}

// ═══════════════════════════════════════════════════════════════
// Preset Scenario Templates
// ═══════════════════════════════════════════════════════════════

export interface SimulationPreset {
  id: string;
  label: string;
  domain: "Business" | "Finance" | "Investment" | "Life";
  question: string;
  variables: SimulationVariable[];
  formula: (v: Record<string, number>) => number;
  popular?: boolean;
}

export const SIMULATION_PRESETS: SimulationPreset[] = [
  // ─── Business ───
  {
    id: "hire-engineers",
    label: "Hire Engineers",
    domain: "Business",
    question: "Should I hire 3 new engineers?",
    popular: true,
    variables: [
      { id: "salary", label: "Annual Salary", min: 80000, max: 200000, mean: 130000, stdDev: 25000, distribution: "normal" },
      { id: "rampMonths", label: "Ramp-up (months)", min: 1, max: 6, mean: 3, stdDev: 1, distribution: "normal" },
      { id: "productivity", label: "Productivity Multiplier", min: 0.5, max: 2.0, mean: 1.2, stdDev: 0.3, distribution: "normal" },
      { id: "revenueGrowth", label: "Revenue Growth %", min: 0, max: 40, mean: 15, stdDev: 8, distribution: "normal" },
    ],
    formula: (v) => {
      const cost = v.salary * 3;
      const revenueGain = 1000000 * (v.revenueGrowth / 100) * v.productivity;
      return revenueGain - cost;
    },
  },
  {
    id: "launch-product",
    label: "Launch New Product",
    domain: "Business",
    question: "What if I launch a new product line?",
    popular: true,
    variables: [
      { id: "devCost", label: "Development Cost", min: 50000, max: 500000, mean: 200000, stdDev: 80000, distribution: "normal" },
      { id: "unitsSold", label: "Units Sold (Year 1)", min: 100, max: 10000, mean: 3000, stdDev: 2000, distribution: "normal" },
      { id: "pricePerUnit", label: "Price Per Unit", min: 20, max: 200, mean: 80, stdDev: 30, distribution: "normal" },
      { id: "marketingSpend", label: "Marketing Spend", min: 10000, max: 200000, mean: 75000, stdDev: 30000, distribution: "normal" },
    ],
    formula: (v) => (v.unitsSold * v.pricePerUnit) - v.devCost - v.marketingSpend,
  },
  {
    id: "pivot-model",
    label: "Pivot Business Model",
    domain: "Business",
    question: "Should I pivot from services to SaaS?",
    variables: [
      { id: "currentRevenue", label: "Current Annual Revenue", min: 200000, max: 2000000, mean: 800000, stdDev: 300000, distribution: "normal" },
      { id: "transitionMonths", label: "Transition Period (months)", min: 3, max: 18, mean: 9, stdDev: 3, distribution: "normal" },
      { id: "churnDuringTransition", label: "Client Churn %", min: 5, max: 50, mean: 25, stdDev: 10, distribution: "normal" },
      { id: "saasGrowthRate", label: "SaaS Growth Rate %", min: 5, max: 50, mean: 20, stdDev: 10, distribution: "normal" },
    ],
    formula: (v) => {
      const retained = v.currentRevenue * (1 - v.churnDuringTransition / 100);
      const saasRevenue = retained * (1 + v.saasGrowthRate / 100) * (12 / v.transitionMonths);
      return saasRevenue - v.currentRevenue * 0.3; // minus transition cost
    },
  },
  {
    id: "second-location",
    label: "Open Second Location",
    domain: "Business",
    question: "Should I open a second physical location?",
    variables: [
      { id: "setupCost", label: "Setup Cost", min: 50000, max: 500000, mean: 200000, stdDev: 80000, distribution: "normal" },
      { id: "monthlyRent", label: "Monthly Rent", min: 2000, max: 15000, mean: 6000, stdDev: 2500, distribution: "normal" },
      { id: "monthlyRevenue", label: "Monthly Revenue (new)", min: 5000, max: 60000, mean: 25000, stdDev: 10000, distribution: "normal" },
      { id: "staffCost", label: "Annual Staff Cost", min: 40000, max: 200000, mean: 100000, stdDev: 30000, distribution: "normal" },
    ],
    formula: (v) => (v.monthlyRevenue * 12) - (v.monthlyRent * 12) - v.staffCost - v.setupCost,
  },

  // ─── Finance ───
  {
    id: "raise-prices",
    label: "Raise Prices 20%",
    domain: "Finance",
    question: "What if I raise prices by 20%?",
    popular: true,
    variables: [
      { id: "churnRate", label: "Customer Churn %", min: 0, max: 30, mean: 10, stdDev: 6, distribution: "normal" },
      { id: "currentRevenue", label: "Current Revenue", min: 500000, max: 2000000, mean: 1000000, stdDev: 300000, distribution: "normal" },
      { id: "elasticity", label: "Price Elasticity", min: 0.2, max: 1.5, mean: 0.7, stdDev: 0.2, distribution: "normal" },
    ],
    formula: (v) => {
      const retainedCustomers = 1 - (v.churnRate / 100) * v.elasticity;
      return v.currentRevenue * 1.2 * retainedCustomers;
    },
  },
  {
    id: "refinance-mortgage",
    label: "Refinance Mortgage",
    domain: "Finance",
    question: "Should I refinance my mortgage at a lower rate?",
    variables: [
      { id: "loanBalance", label: "Loan Balance", min: 100000, max: 800000, mean: 350000, stdDev: 100000, distribution: "normal" },
      { id: "currentRate", label: "Current Rate %", min: 3, max: 8, mean: 5.5, stdDev: 1, distribution: "normal" },
      { id: "newRate", label: "New Rate %", min: 2, max: 6, mean: 4.0, stdDev: 0.8, distribution: "normal" },
      { id: "closingCosts", label: "Closing Costs", min: 2000, max: 15000, mean: 6000, stdDev: 3000, distribution: "normal" },
      { id: "yearsRemaining", label: "Years Remaining", min: 5, max: 30, mean: 20, stdDev: 5, distribution: "normal" },
    ],
    formula: (v) => {
      const monthlySavings = v.loanBalance * ((v.currentRate - v.newRate) / 100) / 12;
      return monthlySavings * v.yearsRemaining * 12 - v.closingCosts;
    },
  },
  {
    id: "emergency-fund",
    label: "Emergency Fund Strategy",
    domain: "Finance",
    question: "How much emergency fund do I need?",
    variables: [
      { id: "monthlyExpenses", label: "Monthly Expenses", min: 2000, max: 15000, mean: 5000, stdDev: 2000, distribution: "normal" },
      { id: "jobLossProb", label: "Job Loss Probability %", min: 1, max: 20, mean: 5, stdDev: 3, distribution: "normal" },
      { id: "monthsUnemployed", label: "Months Unemployed", min: 1, max: 12, mean: 4, stdDev: 2, distribution: "triangular" },
      { id: "unexpectedExpense", label: "Unexpected Expense", min: 0, max: 20000, mean: 3000, stdDev: 4000, distribution: "normal" },
    ],
    formula: (v) => {
      const needed = v.monthlyExpenses * v.monthsUnemployed + v.unexpectedExpense;
      const risk = v.jobLossProb / 100;
      return needed * (1 + risk);
    },
  },
  {
    id: "debt-vs-invest",
    label: "Debt Payoff vs Invest",
    domain: "Finance",
    question: "Pay off debt or invest the extra cash?",
    variables: [
      { id: "debtBalance", label: "Debt Balance", min: 5000, max: 100000, mean: 30000, stdDev: 15000, distribution: "normal" },
      { id: "debtRate", label: "Debt Interest %", min: 3, max: 25, mean: 12, stdDev: 5, distribution: "normal" },
      { id: "investReturn", label: "Investment Return %", min: -10, max: 30, mean: 9, stdDev: 8, distribution: "normal" },
      { id: "monthlyCash", label: "Monthly Extra Cash", min: 200, max: 3000, mean: 800, stdDev: 300, distribution: "normal" },
    ],
    formula: (v) => {
      const investGain = v.monthlyCash * 12 * (v.investReturn / 100);
      const debtCostSaved = v.debtBalance * (v.debtRate / 100);
      return investGain - debtCostSaved; // positive = invest wins
    },
  },

  // ─── Investment ───
  {
    id: "new-market",
    label: "Enter New Market",
    domain: "Investment",
    question: "Should I expand into a new geographic market?",
    variables: [
      { id: "marketSize", label: "Market Size ($M)", min: 5, max: 50, mean: 20, stdDev: 10, distribution: "normal" },
      { id: "captureRate", label: "Market Capture %", min: 0.5, max: 10, mean: 3, stdDev: 2, distribution: "normal" },
      { id: "entryCost", label: "Entry Cost ($M)", min: 0.5, max: 5, mean: 2, stdDev: 1, distribution: "normal" },
      { id: "timeToBreakeven", label: "Break-even (months)", min: 6, max: 36, mean: 18, stdDev: 6, distribution: "normal" },
    ],
    formula: (v) => {
      const revenue = v.marketSize * 1000000 * (v.captureRate / 100);
      const cost = v.entryCost * 1000000;
      const yearsToBreakeven = v.timeToBreakeven / 12;
      return revenue * 3 - cost * yearsToBreakeven;
    },
  },
  {
    id: "real-estate",
    label: "Real Estate Purchase",
    domain: "Investment",
    question: "Should I buy a rental property?",
    popular: true,
    variables: [
      { id: "purchasePrice", label: "Purchase Price", min: 100000, max: 1000000, mean: 350000, stdDev: 100000, distribution: "normal" },
      { id: "downPayment", label: "Down Payment %", min: 5, max: 30, mean: 20, stdDev: 5, distribution: "normal" },
      { id: "monthlyRent", label: "Monthly Rent Income", min: 800, max: 5000, mean: 2200, stdDev: 500, distribution: "normal" },
      { id: "appreciation", label: "Annual Appreciation %", min: -5, max: 15, mean: 4, stdDev: 3, distribution: "normal" },
      { id: "vacancyRate", label: "Vacancy Rate %", min: 0, max: 20, mean: 5, stdDev: 3, distribution: "normal" },
    ],
    formula: (v) => {
      const downPay = v.purchasePrice * (v.downPayment / 100);
      const netRent = v.monthlyRent * 12 * (1 - v.vacancyRate / 100);
      const appreciation5yr = v.purchasePrice * (v.appreciation / 100) * 5;
      return netRent * 5 + appreciation5yr - downPay;
    },
  },
  {
    id: "crypto-allocation",
    label: "Crypto Allocation",
    domain: "Investment",
    question: "What allocation to crypto maximizes risk-adjusted return?",
    variables: [
      { id: "portfolioSize", label: "Portfolio Size", min: 10000, max: 1000000, mean: 100000, stdDev: 50000, distribution: "normal" },
      { id: "cryptoAlloc", label: "Crypto Allocation %", min: 0, max: 30, mean: 10, stdDev: 5, distribution: "uniform" },
      { id: "cryptoReturn", label: "Crypto Return %", min: -60, max: 200, mean: 30, stdDev: 50, distribution: "normal" },
      { id: "tradReturn", label: "Traditional Return %", min: -15, max: 25, mean: 8, stdDev: 6, distribution: "normal" },
    ],
    formula: (v) => {
      const cryptoPart = v.portfolioSize * (v.cryptoAlloc / 100) * (1 + v.cryptoReturn / 100);
      const tradPart = v.portfolioSize * (1 - v.cryptoAlloc / 100) * (1 + v.tradReturn / 100);
      return cryptoPart + tradPart - v.portfolioSize; // net gain
    },
  },
  {
    id: "diversify-portfolio",
    label: "Diversify Portfolio",
    domain: "Investment",
    question: "How does diversification reduce my downside risk?",
    variables: [
      { id: "totalCapital", label: "Total Capital", min: 50000, max: 2000000, mean: 500000, stdDev: 200000, distribution: "normal" },
      { id: "stockReturn", label: "Stock Return %", min: -30, max: 40, mean: 10, stdDev: 15, distribution: "normal" },
      { id: "bondReturn", label: "Bond Return %", min: -5, max: 10, mean: 4, stdDev: 2, distribution: "normal" },
      { id: "altReturn", label: "Alternatives Return %", min: -20, max: 30, mean: 7, stdDev: 8, distribution: "normal" },
    ],
    formula: (v) => {
      return v.totalCapital * (
        0.5 * (v.stockReturn / 100) +
        0.3 * (v.bondReturn / 100) +
        0.2 * (v.altReturn / 100)
      );
    },
  },

  // ─── Life ───
  {
    id: "career-change",
    label: "Career Change",
    domain: "Life",
    question: "What if I switch careers entirely?",
    popular: true,
    variables: [
      { id: "currentSalary", label: "Current Salary", min: 30000, max: 200000, mean: 80000, stdDev: 20000, distribution: "normal" },
      { id: "newSalaryStart", label: "New Career Starting Salary", min: 20000, max: 150000, mean: 55000, stdDev: 15000, distribution: "normal" },
      { id: "growthRate", label: "New Career Growth %/yr", min: 0, max: 25, mean: 10, stdDev: 5, distribution: "normal" },
      { id: "transitionCost", label: "Training/Transition Cost", min: 0, max: 50000, mean: 15000, stdDev: 8000, distribution: "normal" },
      { id: "satisfactionBonus", label: "Happiness Value ($/yr)", min: 0, max: 30000, mean: 10000, stdDev: 5000, distribution: "triangular" },
    ],
    formula: (v) => {
      const fiveYearNew = v.newSalaryStart * 5 * (1 + v.growthRate / 100 * 2.5);
      const fiveYearCurrent = v.currentSalary * 5;
      return fiveYearNew + v.satisfactionBonus * 5 - fiveYearCurrent - v.transitionCost;
    },
  },
  {
    id: "relocate-city",
    label: "Relocate to New City",
    domain: "Life",
    question: "Should I relocate to a new city for better opportunities?",
    variables: [
      { id: "movingCost", label: "Moving Cost", min: 2000, max: 30000, mean: 10000, stdDev: 5000, distribution: "normal" },
      { id: "costOfLivingDelta", label: "COL Change %", min: -30, max: 50, mean: 10, stdDev: 15, distribution: "normal" },
      { id: "salaryIncrease", label: "Salary Increase %", min: -10, max: 40, mean: 15, stdDev: 10, distribution: "normal" },
      { id: "currentSalary", label: "Current Salary", min: 30000, max: 200000, mean: 75000, stdDev: 20000, distribution: "normal" },
    ],
    formula: (v) => {
      const newSalary = v.currentSalary * (1 + v.salaryIncrease / 100);
      const colAdjusted = newSalary * (1 - v.costOfLivingDelta / 200); // rough adjustment
      return (colAdjusted - v.currentSalary) * 5 - v.movingCost; // 5-year net
    },
  },
  {
    id: "start-family",
    label: "Start a Family",
    domain: "Life",
    question: "What's the financial impact of having a child?",
    variables: [
      { id: "annualChildCost", label: "Annual Child Cost", min: 8000, max: 30000, mean: 15000, stdDev: 5000, distribution: "normal" },
      { id: "incomeReduction", label: "Income Reduction %", min: 0, max: 50, mean: 15, stdDev: 10, distribution: "normal" },
      { id: "householdIncome", label: "Household Income", min: 40000, max: 300000, mean: 120000, stdDev: 40000, distribution: "normal" },
      { id: "childcareYears", label: "Full-Time Childcare Years", min: 0, max: 6, mean: 3, stdDev: 1, distribution: "triangular" },
    ],
    formula: (v) => {
      const lostIncome = v.householdIncome * (v.incomeReduction / 100) * v.childcareYears;
      const directCosts = v.annualChildCost * 5;
      return -(lostIncome + directCosts); // negative = cost
    },
  },
  {
    id: "early-retirement",
    label: "Early Retirement",
    domain: "Life",
    question: "Can I retire 10 years early?",
    popular: true,
    variables: [
      { id: "currentSavings", label: "Current Savings", min: 50000, max: 2000000, mean: 500000, stdDev: 200000, distribution: "normal" },
      { id: "annualExpenses", label: "Annual Expenses", min: 20000, max: 100000, mean: 50000, stdDev: 15000, distribution: "normal" },
      { id: "investReturn", label: "Investment Return %", min: -5, max: 15, mean: 7, stdDev: 4, distribution: "normal" },
      { id: "inflationRate", label: "Inflation %", min: 1, max: 8, mean: 3, stdDev: 1, distribution: "normal" },
      { id: "retirementYears", label: "Retirement Duration (yrs)", min: 20, max: 45, mean: 30, stdDev: 5, distribution: "normal" },
    ],
    formula: (v) => {
      const realReturn = (v.investReturn - v.inflationRate) / 100;
      const neededSavings = v.annualExpenses * v.retirementYears;
      const projectedGrowth = v.currentSavings * Math.pow(1 + realReturn, 10);
      return projectedGrowth - neededSavings;
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// Custom Scenario Support
// ═══════════════════════════════════════════════════════════════

export interface CustomFormulaNode {
  type: "add" | "subtract" | "multiply" | "divide";
  operands: string[]; // variable IDs
}

export interface CustomScenario {
  id: string;
  label: string;
  domain: "Business" | "Finance" | "Investment" | "Life";
  question: string;
  variables: SimulationVariable[];
  formulaNodes: CustomFormulaNode[];
  createdAt: number;
}

const STORAGE_KEY = "sita-custom-simulations";

export function loadCustomScenarios(): CustomScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomScenarios(scenarios: CustomScenario[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export function compileFormula(nodes: CustomFormulaNode[], variables: SimulationVariable[]): (v: Record<string, number>) => number {
  return (vals: Record<string, number>) => {
    if (nodes.length === 0) {
      // Default: sum all variables
      return Object.values(vals).reduce((a, b) => a + b, 0);
    }
    let result = 0;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const operandValues = node.operands.map(id => vals[id] ?? 0);
      let nodeResult = operandValues[0] ?? 0;
      for (let j = 1; j < operandValues.length; j++) {
        switch (node.type) {
          case "add": nodeResult += operandValues[j]; break;
          case "subtract": nodeResult -= operandValues[j]; break;
          case "multiply": nodeResult *= operandValues[j]; break;
          case "divide": nodeResult = operandValues[j] !== 0 ? nodeResult / operandValues[j] : 0; break;
        }
      }
      if (i === 0) result = nodeResult;
      else result += nodeResult; // chain nodes additively
    }
    return result;
  };
}
