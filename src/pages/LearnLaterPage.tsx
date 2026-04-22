import { useState, useEffect } from "react";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { LearnLaterHub } from "@/components/sita/onboarding/LearnLaterHub";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

export default function LearnLaterPage() {
  const [deferredConnections, setDeferredConnections] = useState<string[]>([]);
  const [skippedPhases, setSkippedPhases] = useState<string[]>([]);

  useEffect(() => {
    try {
      const connections = localStorage.getItem("sita-deferred-connections");
      const phases = localStorage.getItem("sita-skipped-phases");
      if (connections) setDeferredConnections(JSON.parse(connections));
      if (phases) setSkippedPhases(JSON.parse(phases));
    } catch {
      // localStorage unavailable or malformed — use empty defaults
    }
  }, []);

  const totalDeferred = deferredConnections.length + skippedPhases.length;

  return (
    <PageShell>
    <motion.div
      className="mx-auto max-w-5xl space-y-6 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
<SitaPageHeader
        title="Learn Later"
        subtitle={
          totalDeferred > 0
            ? `${totalDeferred} item${totalDeferred !== 1 ? "s" : ""} deferred during setup — revisit when ready`
            : "Nothing deferred — explore optional integrations and features below"
        }
      />

      {totalDeferred > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{deferredConnections.length}</span> skipped connection{deferredConnections.length !== 1 ? "s" : ""}
            {" · "}
            <span className="font-medium text-foreground">{skippedPhases.length}</span> skipped phase{skippedPhases.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      <LearnLaterHub />
    </motion.div>
    </PageShell>
  );
}
