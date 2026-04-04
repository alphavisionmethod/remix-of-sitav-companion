import type { RealityContractMeta, IrreversibilityClass } from "./primitives";

export interface ReversibilityWindow {
  id: string;
  executionId: string;
  tenantId: string;
  currentClass: IrreversibilityClass;
  windowOpensAt: string;
  windowClosesAt: string;
  reversalCost?: { amount: number; currency: string };
  reversalConditions: string[];
  expired: boolean;
  meta: RealityContractMeta;
}
