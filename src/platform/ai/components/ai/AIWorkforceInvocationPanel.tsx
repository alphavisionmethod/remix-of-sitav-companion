// ═══════════════════════════════════════════════════════════════
// SITA OS — AIWorkforceInvocationPanel
// Displays result of a workforce invocation with receipts/trace
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, DollarSign, Clock, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AIStateBadge } from "./AIStateBadge";
import { AIReceiptLink } from "./AIReceiptLink";
import { AIDegradedState } from "./AIDegradedState";
import { formatFreshness } from "@/lib/ai/ai-surface-grammar";
import { isSuccessState, isDegradedState } from "@/lib/ai/ai-state-types";
import type { WorkforceExecutionResult } from "@/lib/ai/workforce-executor";

interface AIWorkforceInvocationPanelProps {
  result: WorkforceExecutionResult | null;
  onRetry?: () => void;
  className?: string;
}

export function AIWorkforceInvocationPanel({ result, onRetry, className }: AIWorkforceInvocationPanelProps) {
  if (!result) return null;

  const { response, roleKey, taskType, costCents } = result;

  if (isDegradedState(response.status) || response.status === "error" ||
      response.status === "rate_limited" || response.status === "payment_required") {
    return <AIDegradedState state={response.status} reason={response.degradedReason} onRetry={onRetry} className={className} />;
  }

  return (
    <Card className={`bg-card border-border ${className ?? ""}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium capitalize">{roleKey.replace(/_/g, " ")}</span>
          <Badge variant="outline" className="text-xs">{taskType}</Badge>
          <AIStateBadge state={response.status} launchLevel={response.launchHonestyClass} />
        </div>
        <span className="text-xs text-muted-foreground">{formatFreshness(response.timestamp)}</span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{response.content}</ReactMarkdown>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {response.providerUsed && <span>{response.providerUsed}</span>}
            {response.modelUsed && <span className="font-mono">{response.modelUsed}</span>}
            {response.usageSummary && (
              <>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{response.usageSummary.latencyMs}ms</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{(response.usageSummary.inputTokens + response.usageSummary.outputTokens).toLocaleString()} tokens</span>
              </>
            )}
            {costCents > 0 && (
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{(costCents / 100).toFixed(3)}</span>
            )}
          </div>
          {response.receiptId && <AIReceiptLink receiptId={response.receiptId} />}
        </div>
      </CardContent>
    </Card>
  );
}
