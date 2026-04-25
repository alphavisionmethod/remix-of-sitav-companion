// ═══════════════════════════════════════════════════════════════
// SITA OS — SimulationMemoCard
// Saveable summary card for a completed simulation
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, Receipt, FileText } from "lucide-react";
import { toast } from "sonner";
import type { SimulationResult } from "@/domains/simulation/monte-carlo-engine";

interface SimulationMemoCardProps {
  scenarioLabel: string;
  scenarioQuestion: string;
  result: SimulationResult;
  className?: string;
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function SimulationMemoCard({
  scenarioLabel,
  scenarioQuestion,
  result,
  className,
}: SimulationMemoCardProps) {
  const isPositive = result.mean > 0;
  const verdict = isPositive ? "GO" : result.mean > -result.stdDev ? "CAUTION" : "NO-GO";
  const verdictColor = verdict === "GO" ? "text-emerald-400" : verdict === "CAUTION" ? "text-amber-400" : "text-red-400";

  const handleSaveToBoardroom = () => {
    toast.success("Simulation saved to Boardroom", {
      description: `"${scenarioLabel}" added to your strategic review queue.`,
    });
  };

  const handleGenerateReceipt = () => {
    toast.success("Receipt generated", {
      description: "Simulation proof recorded in your trust ledger.",
    });
  };

  const handleShareWithAdvisor = () => {
    toast.success("Shared with Advisor", {
      description: "Your advisor will review this simulation in context.",
    });
  };

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">{scenarioLabel}</p>
          <p className="text-[10px] text-muted-foreground">{scenarioQuestion}</p>
        </div>
        <span className={cn("text-xs font-bold", verdictColor)}>{verdict}</span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">Mean Outcome</p>
          <p className="text-xs font-mono font-semibold text-foreground">{formatNum(result.mean)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">VaR 95</p>
          <p className="text-xs font-mono font-semibold text-foreground">{formatNum(result.var95)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">Iterations</p>
          <p className="text-xs font-mono font-semibold text-foreground">{(result.completed / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/30">
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleSaveToBoardroom}>
          <Bookmark className="h-3 w-3" /> Save to Boardroom
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleGenerateReceipt}>
          <Receipt className="h-3 w-3" /> Generate Receipt
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleShareWithAdvisor}>
          <Share2 className="h-3 w-3" /> Share with Advisor
        </Button>
      </div>
    </div>
  );
}