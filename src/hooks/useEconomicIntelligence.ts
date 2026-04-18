// ═══════════════════════════════════════════════════════════════
// SITA OS — useEconomicIntelligence Hook
// Revenue projections, unit economics, cash runway scenarios.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import {
  economicIntelligence,
  type RevenueProjection,
  type UnitEconomics,
  type CashRunway,
  type CostOptimization,
  type CostBreakdown,
} from "@/domains/engines/economic-intelligence-engine";

export function useEconomicIntelligence() {
  const [projections, setProjections] = useState<RevenueProjection[]>([]);
  const [unitEconomics, setUnitEconomics] = useState<UnitEconomics | null>(null);
  const [runway, setRunway] = useState<CashRunway | null>(null);
  const [optimizations, setOptimizations] = useState<CostOptimization[]>([]);

  const projectRevenue = useCallback((currentMRR: number, growthRate: number, churnRate: number, months: number) => {
    const result = economicIntelligence.projectRevenue(currentMRR, growthRate, churnRate, months);
    setProjections(result);
    return result;
  }, []);

  const calculateUnitEconomics = useCallback((cac: number, arpu: number, churnRate: number, grossMargin: number) => {
    const result = economicIntelligence.calculateUnitEconomics(cac, arpu, churnRate, grossMargin);
    setUnitEconomics(result);
    return result;
  }, []);

  const calculateRunway = useCallback((cash: number, monthlyBurn: number, scenarios?: Array<{ name: string; burnAdjust: number; revenueAdjust: number }>) => {
    const result = economicIntelligence.calculateRunway(cash, monthlyBurn, scenarios);
    setRunway(result);
    return result;
  }, []);

  const identifyOptimizations = useCallback((costs: CostBreakdown) => {
    const result = economicIntelligence.identifyOptimizations(costs);
    setOptimizations(result);
    return result;
  }, []);

  return {
    projections,
    unitEconomics,
    runway,
    optimizations,
    projectRevenue,
    calculateUnitEconomics,
    calculateRunway,
    identifyOptimizations,
  };
}
