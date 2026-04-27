// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Proof Timeline Hook
// Live receipt timeline from the unified kernel
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useSitaKernel } from "@/platform/sita/contexts/SitaKernelContext";
import type { Receipt } from "@/lib/core-services/receipt-service";

interface ProofTimelineOptions {
  correlationId?: string;
  domain?: string;
  limit?: number;
}

export function useProofTimeline(options?: ProofTimelineOptions) {
  const kernel = useSitaKernel();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [chainValid, setChainValid] = useState(true);

  const refresh = useCallback(async () => {
    let all = kernel.receipts.getReceipts();

    // Filter by correlationId if provided
    if (options?.correlationId) {
      all = kernel.receipts.getReceiptsByCorrelation(options.correlationId);
    }

    // Filter by domain (check receipt data for domain tag)
    if (options?.domain) {
      all = all.filter(r =>
        r.data && (r.data as Record<string, unknown>).domain === options.domain
      );
    }

    // Apply limit
    if (options?.limit) {
      all = all.slice(-options.limit);
    }

    setReceipts(all);

    // Verify chain integrity
    const verification = await kernel.receipts.verifyChain();
    setChainValid(verification.valid);
  }, [kernel, options?.correlationId, options?.domain, options?.limit]);

  useEffect(() => {
    refresh();

    // Subscribe to receipt creation events
    const subId = kernel.eventBus.subscribe("receipt.created.v1", () => {
      refresh();
    }, "proof-timeline-hook");

    // Also catch execution completions and refusals
    const execSubId = kernel.eventBus.subscribe("execution.*", () => {
      refresh();
    }, "proof-timeline-exec");

    return () => {
      kernel.eventBus.unsubscribe(subId);
      kernel.eventBus.unsubscribe(execSubId);
    };
  }, [kernel, refresh]);

  return {
    receipts,
    chainValid,
    chainLength: kernel.receipts.getChainLength(),
    refresh,
  };
}
