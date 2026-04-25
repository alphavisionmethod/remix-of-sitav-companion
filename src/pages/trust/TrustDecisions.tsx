// ════════════════════════════════════════════════════════════
// Trust Center — Decision Queue
// Surfaces the architectural ownership decisions resolved during
// the 4-pillar re-architecture (DECISION_QUEUE in _shared).
// ════════════════════════════════════════════════════════════

import { GitBranch, ShieldCheck, Layers } from "lucide-react";
import { DECISION_QUEUE, type SurfaceOwner } from "@/modules/_shared/decision-queue";

const ownerStyles: Record<SurfaceOwner, string> = {
  business: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  concierge: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  finance: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  health: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  trust: "bg-primary/10 text-primary border-primary/30",
  shared: "bg-muted text-muted-foreground border-border",
};

const statusStyles: Record<string, string> = {
  default: "bg-muted text-muted-foreground",
  "needs-confirmation": "bg-amber-500/10 text-amber-600",
  confirmed: "bg-emerald-500/10 text-emerald-600",
};

export default function TrustDecisions() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <GitBranch className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold">Architectural Decisions</h1>
          <p className="text-muted-foreground">
            Ownership resolutions for ambiguous surfaces across the 4-pillar OS.
          </p>
        </div>
      </header>

      <div className="rounded-lg border bg-card divide-y">
        {DECISION_QUEUE.map((d) => (
          <div key={d.surface} className="p-4 flex items-start gap-4">
            <Layers className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <code className="text-sm font-mono font-medium">{d.surface}</code>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${ownerStyles[d.owner]}`}
                >
                  → {d.owner}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${statusStyles[d.status]}`}
                >
                  {d.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{d.rationale}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Source of truth: <code>src/modules/_shared/decision-queue.ts</code>
      </footer>
    </div>
  );
}