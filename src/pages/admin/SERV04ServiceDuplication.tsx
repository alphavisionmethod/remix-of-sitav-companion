// ═══════════════════════════════════════════════════════════════
// SITA OS — SERV04: Service Duplication / Shadow Logic Board
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SERVICE_OWNERSHIP_REGISTRY } from "@/lib/services/service-registry/service-ownership-registry";
import { getDuplicateActionPatterns, getRoutesWithShadowRisk } from "@/lib/services/service-registry/route-to-service-inventory";
import { AlertTriangle, Copy, Ghost, Shield } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

interface ShadowPattern {
  pattern: string;
  severity: "high" | "medium" | "low";
  domain: string;
  description: string;
  recommendation: string;
}

const SHADOW_PATTERNS: ShadowPattern[] = [
  {
    pattern: "Multiple summary/card rendering",
    severity: "medium",
    domain: "dashboard",
    description: "Dashboard, pulse, and index pages each render summary cards with overlapping data sources",
    recommendation: "Consolidate into a single SummaryCardService with configurable views",
  },
  {
    pattern: "Advisor vs Assistant duplication",
    severity: "medium",
    domain: "assistant",
    description: "Multiple advisor/assistant chat patterns exist across different pages",
    recommendation: "Unify under ai-gateway-service as the single canonical entry",
  },
  {
    pattern: "Admin truth board proliferation",
    severity: "high",
    domain: "admin-truth",
    description: "272 admin pages with many sharing similar data fetch patterns and card layouts",
    recommendation: "Create shared admin data hooks and composable board primitives",
  },
  {
    pattern: "Connector config vs provider family overlap",
    severity: "medium",
    domain: "connectors",
    description: "Google provider family model and connector-oauth have overlapping scopes",
    recommendation: "Align provider family as the identity layer, connector as the data layer",
  },
  {
    pattern: "Direct Supabase calls from pages",
    severity: "low",
    domain: "multiple",
    description: "Some pages directly call supabase instead of going through service layer",
    recommendation: "Migrate direct calls to domain services for traceability",
  },
  {
    pattern: "Recommendation score aggregation",
    severity: "low",
    domain: "recommendation-execution",
    description: "Score aggregation logic exists in both REX01 page and recommendation-loop-service",
    recommendation: "Centralize in recommendation-loop-service",
  },
];

export default function SERV04ServiceDuplication() {
  const duplicateActions = getDuplicateActionPatterns();
  const shadowRoutes = getRoutesWithShadowRisk();
  const highRiskDomains = SERVICE_OWNERSHIP_REGISTRY.filter(
    (d) => d.duplicateRisk === "high" || d.shadowServiceRisk === "high"
  );

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
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
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-400">{SHADOW_PATTERNS.length}</div>
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
            <div className="text-2xl font-bold">{duplicateActions.length}</div>
            <div className="text-xs text-muted-foreground">Shared Service Patterns</div>
          </CardContent>
        </Card>
      </div>

      <Card>
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
              {SHADOW_PATTERNS.map((p) => (
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

      <Card>
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
