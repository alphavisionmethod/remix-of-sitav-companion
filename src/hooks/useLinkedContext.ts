// ═══════════════════════════════════════════════════════════════
// SITA OS — useLinkedContext Hook
// Consumes cross-domain entity context on mount
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { consumeLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";

interface LinkedContext {
  entityType: string;
  entityId: string;
  entityLabel?: string;
  timestamp: number;
}

/**
 * Hook that auto-consumes linked context from cross-app navigation.
 * Returns the context (if any) and clears it after consumption.
 *
 * Usage:
 * ```tsx
 * const linkedContext = useLinkedContext();
 * useEffect(() => {
 *   if (linkedContext?.entityType === "invoice") {
 *     setSelectedInvoice(linkedContext.entityId);
 *   }
 * }, [linkedContext]);
 * ```
 */
export function useLinkedContext(): LinkedContext | null {
  const [context, setContext] = useState<LinkedContext | null>(null);

  useEffect(() => {
    const ctx = consumeLinkedContext();
    if (ctx) {
      setContext(ctx);
    }
  }, []);

  return context;
}
