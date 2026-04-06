import { SERVICE_OWNERSHIP_REGISTRY, getHighRiskDomains } from "@/lib/services/service-registry/service-ownership-registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, AlertTriangle, ShieldCheck } from "lucide-react";

const critColors: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive",
  high: "bg-amber-500/15 text-amber-400",
  medium: "bg-blue-500/15 text-blue-400",
  low: "bg-muted text-muted-foreground",
};

const riskColors: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-destructive",
};

export default function SERV01ServiceOwnership() {
  const highRisk = getHighRiskDomains();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SERV01 — Domain Service Ownership</h1>
        <p className="text-muted-foreground">12 major domains: primary services, routes, criticality, duplicate risk, shadow-service risk.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Server className="h-5 w-5 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-foreground">{SERVICE_OWNERSHIP_REGISTRY.length}</p>
            <p className="text-xs text-muted-foreground">Domains</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-400" />
            <p className="text-2xl font-bold text-foreground">{highRisk.length}</p>
            <p className="text-xs text-muted-foreground">High-Risk Domains</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
            <p className="text-2xl font-bold text-foreground">
              {SERVICE_OWNERSHIP_REGISTRY.filter((d) => d.flagshipLoop).length}
            </p>
            <p className="text-xs text-muted-foreground">Flagship-Linked</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground">Domain Registry</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Primary Service</TableHead>
                <TableHead>Routes</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Dup Risk</TableHead>
                <TableHead>Shadow Risk</TableHead>
                <TableHead>Flagship</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERVICE_OWNERSHIP_REGISTRY.map((d) => (
                <TableRow key={d.domain}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.displayName}</p>
                      <p className="text-xs text-muted-foreground">{d.domain}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.primaryService}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.routes.length}</TableCell>
                  <TableCell>
                    <Badge className={critColors[d.launchCriticality]}>{d.launchCriticality}</Badge>
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${riskColors[d.duplicateRisk]}`}>
                    {d.duplicateRisk}
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${riskColors[d.shadowServiceRisk]}`}>
                    {d.shadowServiceRisk}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {d.flagshipLoop || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {highRisk.length > 0 && (
        <Card className="bg-card border-border border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> High-Risk Domains — Consolidation Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highRisk.map((d) => (
              <div key={d.domain} className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm font-medium text-foreground">{d.displayName}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
