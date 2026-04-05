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

const DOMAINS: DomainReality[] = [
  {
    domain: "Investment Office",
    overallReadiness: 72,
    features: [
      { feature: "Portfolio Overview", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["asset_master", "asset_market_snapshots"] },
      { feature: "Holdings", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["asset_master"] },
      { feature: "Capital Buckets", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["capital_purpose_buckets"] },
      { feature: "Watchlists", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Theses", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Market Explorer", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: ["asset_master"] },
      { feature: "Strategy Studio", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Execution Desk", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
    ],
  },
  {
    domain: "Boardroom",
    overallReadiness: 65,
    features: [
      { feature: "Daily Pulse", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["os_event_log"] },
      { feature: "Weekly Boardroom", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Advisor Synthesis", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: ["advisor_responses"] },
      { feature: "Action Queue", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["approval_queue"] },
    ],
  },
  {
    domain: "Business CRM",
    overallReadiness: 78,
    features: [
      { feature: "Customer List", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["customers"] },
      { feature: "Deals Pipeline", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["deals"] },
      { feature: "Collections", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Revenue Autopilot", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["invoices"] },
    ],
  },
  {
    domain: "Money Office",
    overallReadiness: 70,
    features: [
      { feature: "Reserves & Savings", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["capital_allocations"] },
      { feature: "Bills", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["bills"] },
      { feature: "Safe to Spend", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
    ],
  },
  {
    domain: "Workspace",
    overallReadiness: 45,
    features: [
      { feature: "Documents", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["file_metadata"] },
      { feature: "Sheets", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Slides", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
    ],
  },
  {
    domain: "Owner Center",
    overallReadiness: 68,
    features: [
      { feature: "Approvals", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["approval_queue"] },
      { feature: "Pricing Editor", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Leases", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["deals"] },
    ],
  },
  {
    domain: "Calendar / Activity",
    overallReadiness: 65,
    features: [
      { feature: "Calendar", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["events"] },
      { feature: "Activity Timeline", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["audit_logs"] },
      { feature: "Inbox", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["notifications_queue"] },
    ],
  },
];

const pathColor = (p: string) => {
  if (p === "real") return "bg-primary/10 text-primary";
  if (p === "demo" || p === "simulated") return "bg-amber-500/10 text-amber-600";
  return "bg-muted text-muted-foreground";
};

export default function DomainRealityBoard() {
  const [selectedDomain, setSelectedDomain] = useState(0);
  const domain = DOMAINS[selectedDomain];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <SitaPageHeader title="Domain Reality Conversion Board" subtitle="Feature-level real vs demo readiness across every flagship domain" />

      <SitaTabs
        tabs={DOMAINS.map(d => d.domain)}
        activeTab={DOMAINS[selectedDomain].domain}
        onTabChange={(tab) => setSelectedDomain(DOMAINS.findIndex(d => d.domain === tab))}
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
