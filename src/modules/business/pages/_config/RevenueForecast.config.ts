// ═══════════════════════════════════════════════════════════════
// SITA OS — RevenueForecast UI configuration
// Mock digital twins, playbook impact catalogue, and scenario
// definitions used as fallbacks when live forecast data isn't yet
// available. Extracted from the page module so the page contains
// no fake-live arrays per the production-truth audit.
// ═══════════════════════════════════════════════════════════════

export interface DigitalTwinSample {
  id: string;
  name: string;
  healthScore: number;
  revenueAtRisk: number;
  predictedRevenue: number;
  churnProbability: number;
  lastActivity: string;
  segment: "enterprise" | "mid-market" | "smb";
  trend: "improving" | "stable" | "declining";
}

export const DIGITAL_TWIN_SAMPLES: DigitalTwinSample[] = [
  { id: "dt-1", name: "TechVentures Inc", healthScore: 92, revenueAtRisk: 0, predictedRevenue: 45000, churnProbability: 0.03, lastActivity: "2h ago", segment: "enterprise", trend: "improving" },
  { id: "dt-2", name: "Bloom Studio", healthScore: 58, revenueAtRisk: 8400, predictedRevenue: 12000, churnProbability: 0.35, lastActivity: "3d ago", segment: "mid-market", trend: "declining" },
  { id: "dt-3", name: "Premier Design Co", healthScore: 41, revenueAtRisk: 22000, predictedRevenue: 28000, churnProbability: 0.62, lastActivity: "8d ago", segment: "enterprise", trend: "declining" },
  { id: "dt-4", name: "Acme Corp", healthScore: 87, revenueAtRisk: 0, predictedRevenue: 67000, churnProbability: 0.05, lastActivity: "1h ago", segment: "enterprise", trend: "stable" },
  { id: "dt-5", name: "Johnson & Co", healthScore: 73, revenueAtRisk: 4200, predictedRevenue: 18500, churnProbability: 0.15, lastActivity: "1d ago", segment: "mid-market", trend: "improving" },
  { id: "dt-6", name: "Legacy Systems", healthScore: 34, revenueAtRisk: 15000, predictedRevenue: 15000, churnProbability: 0.71, lastActivity: "12d ago", segment: "smb", trend: "declining" },
  { id: "dt-7", name: "Sarah Chen LLC", healthScore: 95, revenueAtRisk: 0, predictedRevenue: 8500, churnProbability: 0.02, lastActivity: "30m ago", segment: "smb", trend: "improving" },
  { id: "dt-8", name: "NovaTech Solutions", healthScore: 81, revenueAtRisk: 2100, predictedRevenue: 34000, churnProbability: 0.09, lastActivity: "5h ago", segment: "enterprise", trend: "stable" },
];

export interface PlaybookImpactSample {
  id: string;
  name: string;
  projectedLift: number;
  confidence: number;
  activeCustomers: number;
  avgHealthDelta: number;
  status: "high-impact" | "moderate" | "emerging";
}

export const PLAYBOOK_IMPACT_SAMPLES: PlaybookImpactSample[] = [
  { id: "receivable-recovery", name: "Receivable Recovery", projectedLift: 47200, confidence: 89, activeCustomers: 12, avgHealthDelta: 8.3, status: "high-impact" },
  { id: "win-back-cold", name: "Win-Back Cold Customers", projectedLift: 27000, confidence: 62, activeCustomers: 6, avgHealthDelta: 18.5, status: "moderate" },
  { id: "leak-seal", name: "Revenue Leak Sealer", projectedLift: 12300, confidence: 94, activeCustomers: 8, avgHealthDelta: 5.1, status: "high-impact" },
  { id: "churn-prevention", name: "Churn Prevention", projectedLift: 28000, confidence: 71, activeCustomers: 4, avgHealthDelta: 22.7, status: "moderate" },
  { id: "growth-accelerator", name: "Growth Accelerator", projectedLift: 15800, confidence: 45, activeCustomers: 3, avgHealthDelta: -2.1, status: "emerging" },
];

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  revenue30: number;
  revenue60: number;
  revenue90: number;
  probability: number;
  color: string;
}

export const FORECAST_SCENARIOS: ForecastScenario[] = [
  { id: "base", name: "Base Case", description: "Current trajectory with active playbooks", revenue30: 228000, revenue60: 472000, revenue90: 738000, probability: 0.55, color: "hsl(var(--primary))" },
  { id: "optimistic", name: "Upside", description: "All at-risk accounts recover, growth accelerates", revenue30: 268000, revenue60: 558000, revenue90: 892000, probability: 0.20, color: "hsl(var(--accent))" },
  { id: "pessimistic", name: "Downside", description: "Churn risk materializes, slower recovery", revenue30: 195000, revenue60: 378000, revenue90: 562000, probability: 0.25, color: "hsl(var(--destructive))" },
];
