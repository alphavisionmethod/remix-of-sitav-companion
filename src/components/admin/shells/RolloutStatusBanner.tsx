import { useState } from "react";
import { cn } from "@/lib/utils";
import { Rocket, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDataMode } from "@/contexts/DataModeContext";

interface RolloutState {
  active: boolean;
  ring: string;
  environment: string;
  warningLevel: "info" | "warning" | "critical";
  title: string;
  impactedSurfaces: string[];
  confidence: number;
  lastUpdated: string;
}

const ROLLOUT: RolloutState = {
  active: true,
  ring: "Ring 1 (Beta)",
  environment: "staging",
  warningLevel: "info",
  title: "v2.14.0 — Approval Chain Hardening",
  impactedSurfaces: ["Approvals", "Policy Engine", "Receipts"],
  confidence: 92,
  lastUpdated: new Date().toISOString(),
};

const levelStyles = {
  info: "bg-primary/5 border-primary/20 text-primary",
  warning: "bg-accent/5 border-accent/20 text-accent",
  critical: "bg-destructive/5 border-destructive/20 text-destructive",
};

export function RolloutStatusBanner() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const rollout = ROLLOUT;

  if (!rollout.active) return null;

  return (
    <div className={cn("rounded-lg border px-4 py-2 text-[11px]", levelStyles[rollout.warningLevel])}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold">{rollout.title}</span>
          <Badge variant="outline" className="text-[9px] h-4">{rollout.ring}</Badge>
          <Badge variant="outline" className="text-[9px] h-4">{rollout.environment}</Badge>
          <span className="text-muted-foreground">Confidence: {rollout.confidence}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-5 text-[10px] px-2" onClick={() => navigate("/admin/release-ring")}>
            <ExternalLink className="h-2.5 w-2.5 mr-1" /> Details
          </Button>
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 hover:bg-muted/30 rounded">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-current/10 flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground">Impacted:</span>
          {rollout.impactedSurfaces.map(s => (
            <Badge key={s} variant="outline" className="text-[9px] h-4">{s}</Badge>
          ))}
          <span className="text-muted-foreground ml-2">Updated: {new Date(rollout.lastUpdated).toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}
