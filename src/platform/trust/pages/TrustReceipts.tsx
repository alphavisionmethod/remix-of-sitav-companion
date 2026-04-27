import { FileText } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function TrustReceipts() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold">Receipts</h1>
        </div>
        <PageTruthBanner truthState="partial" />
      </header>
      <p className="text-muted-foreground mb-6">
        Every meaningful action — by you, your advisors, or any automation — produces a signed receipt.
        This is the proof chain that makes SITA explainable and reversible.
      </p>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Receipts feed wires into <code className="text-xs bg-muted px-1.5 py-0.5 rounded">ai_action_receipts</code>,{" "}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">advisor_action_proof_packs</code>, and the audit ledger.
        <br />Phase 2 connects this stub to the live receipt explorer.
      </div>
    </div>
  );
}