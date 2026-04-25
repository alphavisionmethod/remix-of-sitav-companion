// ═══════════════════════════════════════════════════════════════
// SITA OS — SERV02: Domain Service Ownership Board
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SERVICE_OWNERSHIP_REGISTRY } from "@/lib/core-services/service-registry/service-ownership-registry";
import { ROUTE_SERVICE_INVENTORY } from "@/lib/core-services/service-registry/route-to-service-inventory";
import { Shield, AlertTriangle, Layers } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

function getRiskBadge(risk: string) {
  if (risk === "high") return <Badge variant="destructive">{risk}</Badge>;
  if (risk === "medium") return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">{risk}</Badge>;
  return <Badge variant="outline">{risk}</Badge>;
}

export default function SERV02DomainOwnership() {
  const domainRouteCount = (domain: string) =>
    ROUTE_SERVICE_INVENTORY.filter((r) => r.domainFamily === domain).length;

  const domainActionCount = (domain: string) =>
    ROUTE_SERVICE_INVENTORY.filter((r) => r.domainFamily === domain)
      .reduce((sum, r) => sum + r.actions.length, 0);

  return (
    <div className="space-y-6 p-6" data-testid="serv02-board">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          SERV02 — Domain Service Ownership
        </h1>
        <p className="text-muted-foreground mt-1">
          Ownership, fragmentation, and flagship coverage per domain
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{SERVICE_OWNERSHIP_REGISTRY.length}</div>
            <div className="text-xs text-muted-foreground">Total Domains</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-400">
              {SERVICE_OWNERSHIP_REGISTRY.filter((d) => d.flagshipLoop).length}
            </div>
            <div className="text-xs text-muted-foreground">With Flagship Loop</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-400">
              {SERVICE_OWNERSHIP_REGISTRY.filter((d) => d.duplicateRisk !== "low").length}
            </div>
            <div className="text-xs text-muted-foreground">Duplicate Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-400">
              {SERVICE_OWNERSHIP_REGISTRY.filter((d) => d.shadowServiceRisk !== "low").length}
            </div>
            <div className="text-xs text-muted-foreground">Shadow Risk</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" /> Domain Ownership Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Primary Service</TableHead>
                  <TableHead className="text-center">Routes</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                  <TableHead className="text-center">Deps</TableHead>
                  <TableHead>Launch</TableHead>
                  <TableHead>Flagship</TableHead>
                  <TableHead>Dup Risk</TableHead>
                  <TableHead>Shadow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SERVICE_OWNERSHIP_REGISTRY.map((d) => (
                  <TableRow key={d.domain}>
                    <TableCell className="font-medium">{d.displayName}</TableCell>
                    <TableCell className="text-xs font-mono">{d.primaryService}</TableCell>
                    <TableCell className="text-center">{domainRouteCount(d.domain)}</TableCell>
                    <TableCell className="text-center">{domainActionCount(d.domain)}</TableCell>
                    <TableCell className="text-center">{d.dependentServices.length}</TableCell>
                    <TableCell>
                      <Badge variant={d.launchCriticality === "critical" ? "destructive" : "secondary"}>
                        {d.launchCriticality}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {d.flagshipLoop ? (
                        <Badge variant="outline" className="text-xs">{d.flagshipLoop}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getRiskBadge(d.duplicateRisk)}</TableCell>
                    <TableCell>{getRiskBadge(d.shadowServiceRisk)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Domain Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SERVICE_OWNERSHIP_REGISTRY.filter((d) => d.notes).map((d) => (
            <div key={d.domain} className="flex gap-2 text-sm">
              <Badge variant="outline" className="shrink-0">{d.domain}</Badge>
              <span className="text-muted-foreground">{d.notes}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
