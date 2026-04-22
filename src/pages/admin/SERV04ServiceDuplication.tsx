// ═══════════════════════════════════════════════════════════════
// SITA OS — SERV04: Service Duplication / Shadow Logic Board
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SERVICE_OWNERSHIP_REGISTRY, DUPLICATE_CLUSTER_RESOLUTIONS, type ClusterResolution } from "@/lib/core-services/service-registry/service-ownership-registry";
import { getDuplicateActionPatterns, getRoutesWithShadowRisk } from "@/lib/core-services/service-registry/route-to-service-inventory";
import { AlertTriangle, Copy, Ghost, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { DEMO_SHADOW_PATTERNS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

interface ShadowPattern {
  pattern: string;
  severity: "high" | "medium" | "low";
  domain: string;
  description: string;
  recommendation: string;
}

const migrationColors: Record<string, string> = {
  "not-started": "bg-muted text-muted-foreground",
  "in-progress": "bg-amber-500/15 text-amber-400",
  "complete": "bg-emerald-500/15 text-emerald-400",
};

function ClusterResolutionCard({ cluster }: { cluster: ClusterResolution }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3" data-testid={`cluster-${cluster.clusterKey}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">{cluster.clusterName}</h3>
          <Badge variant="outline" className="text-xs">{cluster.domain}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cluster.riskLevel === "high" ? "destructive" : "secondary"} className="text-xs">
            {cluster.riskLevel} risk
          </Badge>
          <Badge className={`${migrationColors[cluster.migrationStatus]} text-xs`}>
            {cluster.migrationStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1 mb-1 text-emerald-400 font-medium">
            <CheckCircle className="h-3 w-3" /> Canonical
          </div>
          <div className="font-mono bg-emerald-500/10 px-2 py-1 rounded">{cluster.canonical}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1 text-blue-400 font-medium">
            <ArrowRight className="h-3 w-3" /> Adapters
          </div>
          <div className="space-y-1">
            {cluster.adapters.map((a) => (
              <div key={a} className="font-mono bg-blue-500/10 px-2 py-1 rounded">{a}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1 text-destructive font-medium">
            <AlertTriangle className="h-3 w-3" /> Deprecated
          </div>
          <div className="space-y-1">
            {cluster.deprecated.length > 0 ? cluster.deprecated.map((d) => (
              <div key={d} className="font-mono bg-destructive/10 px-2 py-1 rounded">{d}</div>
            )) : <span className="text-muted-foreground">None</span>}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic">{cluster.rationale}</p>
    </div>
  );
}

export default function SERV04ServiceDuplication() {
  const { isDemoMode } = useDataMode();
  const duplicateActions = getDuplicateActionPatterns();
  const shadowRoutes = getRoutesWithShadowRisk();
  const highRiskDomains = SERVICE_OWNERSHIP_REGISTRY.filter(
    (d) => d.duplicateRisk === "high" || d.shadowServiceRisk === "high"
  );

  return (
    <div className="space-y-6 p-6" data-testid="serv04-board">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Copy className="h-6 w-6 text-amber-400" />
          SERV04 — Service Duplication & Shadow Logic
        </h1>
        <p className="text-muted-foreground mt-1">
          Detect duplicate functions, shadow logic bypassing service layer, and overlapping service work
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4" data-testid="serv04-shadow-count">
            <div className="text-2xl font-bold text-amber-400">{(isDemoMode ? DEMO_SHADOW_PATTERNS : [] as typeof DEMO_SHADOW_PATTERNS).length}</div>
            <div className="text-xs text-muted-foreground">Known Shadow Patterns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-400">{highRiskDomains.length}</div>
            <div className="text-xs text-muted-foreground">High-Risk Domains</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{shadowRoutes.length}</div>
            <div className="text-xs text-muted-foreground">Routes with Shadow Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-400">{DUPLICATE_CLUSTER_RESOLUTIONS.length}</div>
            <div className="text-xs text-muted-foreground">Cluster Resolutions</div>
          </CardContent>
        </Card>
      </div>

      {/* Cluster Resolution Map */}
      <Card data-testid="serv04-cluster-resolutions">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Duplicate Cluster Resolutions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DUPLICATE_CLUSTER_RESOLUTIONS.map((c) => (
            <ClusterResolutionCard key={c.clusterKey} cluster={c} />
          ))}
        </CardContent>
      </Card>

      <Card data-testid="serv04-shadow-patterns">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Ghost className="h-4 w-4 text-amber-400" /> Shadow Logic Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isDemoMode ? DEMO_SHADOW_PATTERNS : [] as typeof DEMO_SHADOW_PATTERNS).map((p) => (
                <TableRow key={p.pattern}>
                  <TableCell className="font-medium text-sm">{p.pattern}</TableCell>
                  <TableCell><Badge variant="outline">{p.domain}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={p.severity === "high" ? "destructive" : "secondary"}>
                      {p.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs">{p.description}</TableCell>
                  <TableCell className="text-xs max-w-xs">{p.recommendation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card data-testid="serv04-high-risk-domains">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" /> High-Risk Domains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highRiskDomains.map((d) => (
              <div key={d.domain} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <Shield className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">{d.displayName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{d.notes}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">dup: {d.duplicateRisk}</Badge>
                    <Badge variant="destructive" className="text-xs">shadow: {d.shadowServiceRisk}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
