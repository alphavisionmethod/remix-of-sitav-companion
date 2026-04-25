import type { CostClass, ComputeModelTier } from "@/lib/compute-governance";

export const classColors: Record<CostClass, string> = { A: "text-emerald-400", B: "text-blue-400", C: "text-amber-400", D: "text-rose-400" };
export const tierColors: Record<ComputeModelTier, string> = { utility: "bg-emerald-500/20 text-emerald-300", standard: "bg-blue-500/20 text-blue-300", premium: "bg-amber-500/20 text-amber-300", exceptional: "bg-rose-500/20 text-rose-300" };
export const budgetStatusColors: Record<string, string> = { healthy: "text-emerald-400", approaching: "text-amber-400", warning: "text-orange-400", exceeded: "text-rose-400", frozen: "text-muted-foreground" };

export const fmt = (v: number) => v === -1 ? "∞" : String(v);
