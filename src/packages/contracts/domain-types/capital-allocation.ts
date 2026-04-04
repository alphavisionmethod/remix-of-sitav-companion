// ═══════════════════════════════════════════════════════════════
// SITA OS — Capital Allocation Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, Timestamped, TenantScoped } from "../_contract-scaffold";

export type AssetClass = "equity" | "fixed-income" | "real-estate" | "cash" | "alternative" | "crypto" | "commodity";

export type AllocationStrategy = "growth" | "balanced" | "conservative" | "income" | "custom";

export type RebalanceStatus = "pending" | "simulated" | "approved" | "executing" | "completed" | "failed";

export interface Portfolio extends Timestamped, TenantScoped {
  name: string;
  strategy: AllocationStrategy;
  totalValue: number;
  currency: string;
  allocations: Allocation[];
  targetAllocations: TargetAllocation[];
  lastRebalanced?: string;
  performanceYTD: number;
  riskScore: number;
  benchmarkId?: string;
}

export interface Allocation extends BaseContract {
  portfolioId: string;
  assetClass: AssetClass;
  assetName: string;
  assetSymbol?: string;
  quantity: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  unrealizedGain: number;
  weight: number;
  lastUpdated: string;
}

export interface TargetAllocation {
  assetClass: AssetClass;
  targetWeight: number;
  minWeight: number;
  maxWeight: number;
  driftThreshold: number;
}

export interface RebalanceOrder extends Timestamped, TenantScoped {
  portfolioId: string;
  status: RebalanceStatus;
  trades: RebalanceTrade[];
  estimatedCost: number;
  estimatedTaxImpact: number;
  reason: string;
  approvalId?: string;
  simulationResult?: RebalanceSimulation;
}

export interface RebalanceTrade {
  assetClass: AssetClass;
  assetName: string;
  direction: "buy" | "sell";
  quantity: number;
  estimatedPrice: number;
  estimatedValue: number;
}

export interface RebalanceSimulation {
  projectedRiskScore: number;
  projectedReturn: number;
  taxEfficiency: number;
  transactionCosts: number;
  driftReduction: number;
}
