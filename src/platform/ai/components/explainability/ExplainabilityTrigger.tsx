// ═══════════════════════════════════════════════════════════════
// SITA OS — ExplainabilityTrigger
// Compact "Why?" button that opens the ExplainabilityDrawer
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplainabilityCard } from "./ExplainabilityCard";
import type { Explanation } from "@/lib/services/explainability/index";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReasoningChainTimeline } from "./ReasoningChainTimeline";
import { TradeoffExplorer } from "./TradeoffExplorer";
import { WhatWouldChangePanel } from "./WhatWouldChangePanel";
import { ConfidenceRiskMeter } from "./ConfidenceRiskMeter";

interface ExplainabilityTriggerProps {
  explanation: Explanation | null;
  label?: string;
  variant?: "ghost" | "link" | "outline";
  className?: string;
}

export function ExplainabilityTrigger({
  explanation,
  label = "Why?",
  variant = "ghost",
  className,
}: ExplainabilityTriggerProps) {
  const [open, setOpen] = useState(false);

  if (!explanation) return null;

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        className={cn("h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground", className)}
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-3 w-3" />
        {label}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
          <SheetHeader>
            <SheetTitle className="text-sm">{explanation.title}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-5">
            <ExplainabilityCard explanation={explanation} compact={false} />

            <ConfidenceRiskMeter
              confidence={explanation.confidence}
              riskLevel={explanation.confidence >= 0.8 ? "low" : explanation.confidence >= 0.6 ? "medium" : "high"}
            />

            <ReasoningChainTimeline
              steps={explanation.reasoningChain}
              sources={explanation.sources}
            />

            {"tradeoffs" in explanation && Array.isArray((explanation as any).tradeoffs) && (
              <TradeoffExplorer tradeoffs={(explanation as any).tradeoffs} />
            )}

            {"invalidators" in explanation && Array.isArray((explanation as any).invalidators) && (
              <WhatWouldChangePanel invalidators={(explanation as any).invalidators} />
            )}

            {explanation.alternatives.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Alternatives Considered
                </p>
                <ul className="space-y-1">
                  {explanation.alternatives.map((alt, i) => (
                    <li key={i} className="text-xs text-foreground/70 pl-3 border-l-2 border-border/50">
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}