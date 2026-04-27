import { HeartPulse } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

/**
 * Generic stub for greenfield Health OS sub-apps.
 * Real surfaces will replace these one-by-one in their own phase.
 */
export default function HealthStub({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <PageTruthBanner truthState="partial" />
      </header>
      <p className="text-muted-foreground mb-6">{blurb}</p>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        🌱 Greenfield surface — scheduled for a future phase.
        <br />
        See <code className="text-xs bg-muted px-1.5 py-0.5 rounded">src/modules/health/MANIFEST.md</code> for the build plan.
      </div>
    </div>
  );
}