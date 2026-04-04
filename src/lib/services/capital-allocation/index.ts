// ═══════════════════════════════════════════════════════════════
// SITA OS — Capital Allocation Service
// Investment allocation, rebalancing, portfolio optimization
// ═══════════════════════════════════════════════════════════════

import type { Portfolio, Allocation, RebalanceOrder, RebalanceSimulation, TargetAllocation, AssetClass } from "@/packages/contracts/domain-types/capital-allocation";

export type { Portfolio, Allocation, RebalanceOrder, RebalanceSimulation, TargetAllocation, AssetClass };

export class CapitalAllocationService {
  private portfolios: Map<string, Portfolio> = new Map();
  private rebalanceOrders: Map<string, RebalanceOrder> = new Map();

  createPortfolio(portfolio: Portfolio): Portfolio {
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  getPortfolio(id: string): Portfolio | null {
    return this.portfolios.get(id) ?? null;
  }

  listPortfolios(tenantId?: string): Portfolio[] {
    let portfolios = Array.from(this.portfolios.values());
    if (tenantId) portfolios = portfolios.filter(p => p.tenantId === tenantId);
    return portfolios;
  }

  updateAllocation(portfolioId: string, allocation: Allocation): Portfolio | null {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return null;

    const idx = portfolio.allocations.findIndex(a => a.id === allocation.id);
    if (idx >= 0) {
      portfolio.allocations[idx] = allocation;
    } else {
      portfolio.allocations.push(allocation);
    }

    this.recalculateWeights(portfolio);
    portfolio.updatedAt = new Date().toISOString();
    return portfolio;
  }

  analyzePortfolioDrift(portfolioId: string): { assetClass: AssetClass; currentWeight: number; targetWeight: number; drift: number; requiresRebalance: boolean }[] {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return [];

    return portfolio.targetAllocations.map(target => {
      const currentWeight = portfolio.allocations
        .filter(a => a.assetClass === target.assetClass)
        .reduce((s, a) => s + a.weight, 0);

      const drift = Math.abs(currentWeight - target.targetWeight);
      return {
        assetClass: target.assetClass,
        currentWeight,
        targetWeight: target.targetWeight,
        drift,
        requiresRebalance: drift > target.driftThreshold,
      };
    });
  }

  simulateRebalance(portfolioId: string): RebalanceSimulation | null {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return null;

    const drifts = this.analyzePortfolioDrift(portfolioId);
    const maxDrift = Math.max(...drifts.map(d => d.drift), 0);

    return {
      projectedRiskScore: portfolio.riskScore * (1 - maxDrift * 0.1),
      projectedReturn: portfolio.performanceYTD * 1.02,
      taxEfficiency: 0.85,
      transactionCosts: portfolio.totalValue * 0.001,
      driftReduction: maxDrift * 0.9,
    };
  }

  createRebalanceOrder(portfolioId: string, reason: string): RebalanceOrder | null {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return null;

    const drifts = this.analyzePortfolioDrift(portfolioId);
    const simulation = this.simulateRebalance(portfolioId);

    const trades = drifts
      .filter(d => d.requiresRebalance)
      .map(d => ({
        assetClass: d.assetClass,
        assetName: d.assetClass,
        direction: (d.currentWeight > d.targetWeight ? "sell" : "buy") as "buy" | "sell",
        quantity: Math.abs(d.currentWeight - d.targetWeight) * portfolio.totalValue / 100,
        estimatedPrice: 1,
        estimatedValue: Math.abs(d.currentWeight - d.targetWeight) * portfolio.totalValue / 100,
      }));

    const order: RebalanceOrder = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId: portfolio.tenantId,
      portfolioId,
      status: "pending",
      trades,
      estimatedCost: simulation?.transactionCosts ?? 0,
      estimatedTaxImpact: portfolio.totalValue * 0.005,
      reason,
      simulationResult: simulation ?? undefined,
    };

    this.rebalanceOrders.set(order.id, order);
    return order;
  }

  getRebalanceOrders(portfolioId?: string): RebalanceOrder[] {
    let orders = Array.from(this.rebalanceOrders.values());
    if (portfolioId) orders = orders.filter(o => o.portfolioId === portfolioId);
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private recalculateWeights(portfolio: Portfolio): void {
    const total = portfolio.allocations.reduce((s, a) => s + a.currentValue, 0);
    portfolio.totalValue = total;
    portfolio.allocations.forEach(a => {
      a.weight = total > 0 ? (a.currentValue / total) * 100 : 0;
    });
  }
}

export function createCapitalAllocation(): CapitalAllocationService {
  return new CapitalAllocationService();
}
