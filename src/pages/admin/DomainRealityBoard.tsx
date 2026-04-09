// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Reality Conversion Board
// Per-domain deep view: real vs demo provider coverage,
// write-path readiness, empty-state readiness
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SitaTabs } from "@/components/sita/SitaComponents";
import {
  Database, Shield, CheckCircle, XCircle, AlertTriangle,
  FileText, PenSquare, Eye, Layers
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_ADMIN_DOMAINS as DEMO_DOMAINS } from "@/lib/demo-data/admin-platform";

interface FeatureReality {
  feature: string;
  readPath: "real" | "demo" | "none";
  writePath: "real" | "simulated" | "none";
  emptyState: boolean;
  loadingState: boolean;
  errorState: boolean;
  tables: string[];
}

interface DomainReality {
  domain: string;
  features: FeatureReality[];
  overallReadiness: number;
}

const pathColor = (p: string) => {
  if (p === "real") return "bg-primary/10 text-primary";
  if (p === "demo" || p === "simulated") return "bg-amber-500/10 text-amber-600";
  return "bg-muted text-muted-foreground";
};

export default function DomainRealityBoard() {
  const { isDemoMode } = useDataMode();
  const [selectedDomain, setSelectedDomain] = useState(0);
  const domain = DEMO_DOMAINS[selectedDomain];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <DemoModeBadge />
      <SitaPageHeader title="Domain Reality Conversion Board" subtitle="Feature-level real vs demo readiness across every flagship domain" />

      <SitaTabs
        tabs={DEMO_DOMAINS.map(d => ({ key: d.domain, label: d.domain }))}
        active={DEMO_DOMAINS[selectedDomain].domain}
        onChange={(tab) => setSelectedDomain(DEMO_DOMAINS.findIndex(d => d.domain === tab))}
      />

      <SitaCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <SitaCardTitle>{domain.domain} — Feature Reality Map</SitaCardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overall Readiness</span>
            <span className="text-lg font-bold text-foreground">{domain.overallReadiness}%</span>
          </div>
        </div>
        <Progress value={domain.overallReadiness} className="h-2 mb-4" />

        <div className="space-y-2">
          <div className="grid grid-cols-7 text-[10px] font-medium text-muted-foreground uppercase px-3 py-1">
            <span className="col-span-2">Feature</span>
            <span>Read Path</span>
            <span>Write Path</span>
            <span>Empty State</span>
            <span>Loading</span>
            <span>Tables</span>
          </div>
          {domain.features.map(f => (
            <div key={f.feature} className="grid grid-cols-7 items-center px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors text-sm">
              <span className="col-span-2 font-medium text-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                {f.feature}
              </span>
              <Badge className={pathColor(f.readPath)} variant="secondary">{f.readPath}</Badge>
              <Badge className={pathColor(f.writePath)} variant="secondary">{f.writePath}</Badge>
              <span>{f.emptyState ? <CheckCircle className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}</span>
              <span>{f.loadingState ? <CheckCircle className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}</span>
              <span className="text-[10px] text-muted-foreground">{f.tables.length > 0 ? f.tables.join(", ") : "—"}</span>
            </div>
          ))}
        </div>
      </SitaCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Read = data source for display</span>
        <span className="flex items-center gap-1"><PenSquare className="h-3 w-3" /> Write = can persist mutations</span>
        <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Tables = Supabase tables backing the feature</span>
        <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> Demo = governed scenario data via Dual Reality</span>
      </div>
    </div>
  );
}
