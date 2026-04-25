import { ScrollText } from "lucide-react";

export default function TrustAudit() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-3 mb-4">
        <ScrollText className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-semibold">Audit Log</h1>
      </header>
      <p className="text-muted-foreground">
        Immutable ledger of every meaningful action across all four pillars. Phase 2 wires this stub
        into <code className="text-xs bg-muted px-1.5 py-0.5 rounded">audit-ledger</code> with filtering by pillar, actor, and time.
      </p>
    </div>
  );
}