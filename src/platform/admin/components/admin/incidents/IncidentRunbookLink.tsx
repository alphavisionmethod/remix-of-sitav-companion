// ═══════════════════════════════════════════════════════════════
// SITA OS — Incident → Runbook + Kill Switch Link
// Embedded inside alert/incident cards so operators move from
// failure → recovery procedure → emergency control in one click.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Shield, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { classifyIncident, type IncidentClassification } from "@/lib/incidents/incident-classifier";

interface Props {
  subsystem: string;
  symptomCode?: string;
  /** Optional explicit override — skips classifier lookup */
  runbookId?: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-destructive border-destructive/40 bg-destructive/5",
  high:     "text-amber-500 border-amber-500/40 bg-amber-500/5",
  medium:   "text-muted-foreground border-border bg-secondary/20",
  low:      "text-muted-foreground border-border bg-secondary/10",
};

export function IncidentRunbookLink({ subsystem, symptomCode, runbookId }: Props) {
  const [classification, setClassification] = useState<IncidentClassification | null>(null);

  useEffect(() => {
    let mounted = true;
    classifyIncident(subsystem, symptomCode).then((c) => {
      if (mounted) setClassification(c);
    });
    return () => { mounted = false; };
  }, [subsystem, symptomCode]);

  const effectiveRunbook = runbookId ?? classification?.recommendedRunbookId;
  if (!effectiveRunbook && !classification) return null;

  return (
    <div className={`rounded-md border p-2 text-[11px] space-y-1 ${SEVERITY_COLOR[classification?.severity ?? "medium"]}`}>
      {classification && (
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3" />
          <span className="font-medium">{classification.displayName}</span>
          <Badge variant="outline" className="text-[9px] ml-auto">{classification.severity}</Badge>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {effectiveRunbook && (
          <Link
            to={`/admin/support/runbooks/${effectiveRunbook}`}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <BookOpen className="h-3 w-3" /> {effectiveRunbook}
          </Link>
        )}
        {classification?.recommendedSwitchId && (
          <Link
            to={`/admin/automation/kill-switches?focus=${classification.recommendedSwitchId}`}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <Shield className="h-3 w-3" /> {classification.recommendedSwitchId}
          </Link>
        )}
        {classification && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            owner: {classification.escalationOwner}
          </span>
        )}
      </div>
    </div>
  );
}
