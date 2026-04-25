// ═══════════════════════════════════════════════════════════════
// SITA OS — AIReceiptLink
// Link to AI receipt/trace explorer for traceability
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";

interface AIReceiptLinkProps {
  receiptId: string;
  className?: string;
}

export function AIReceiptLink({ receiptId, className }: AIReceiptLinkProps) {
  return (
    <Link
      to={`/admin/ai-gateway/receipts?id=${receiptId}`}
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ${className ?? ""}`}
      title={`Receipt: ${receiptId}`}
    >
      <Receipt className="h-3 w-3" />
      <span className="font-mono">{receiptId.substring(0, 8)}…</span>
    </Link>
  );
}
