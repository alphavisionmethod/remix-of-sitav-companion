// ═══════════════════════════════════════════════════════════════
// SITA OS — SERV05: Canonical Action Entry Point Board
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllActions } from "@/lib/core-services/service-registry/route-to-service-inventory";
import { Crosshair, CheckCircle, AlertTriangle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function SERV05CanonicalActions() {
  const allActions = getAllActions();
  const canonicalActions = allActions.filter((a) => a.isCanonical);
  const nonCanonicalActions = allActions.filter((a) => !a.isCanonical);

  return (
    <div className="space-y-6 p-6" data-testid="serv05-board">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crosshair className="h-6 w-6 text-primary" />
          SERV05 — Canonical Action Entry Points
        </h1>
        <p className="text-muted-foreground mt-1">
          Every major action should have one obvious canonical service path
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{allActions.length}</div>
            <div className="text-xs text-muted-foreground">Total Actions Mapped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-400">{canonicalActions.length}</div>
            <div className="text-xs text-muted-foreground">Canonical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-400">{nonCanonicalActions.length}</div>
            <div className="text-xs text-muted-foreground">Non-Canonical / Alternate</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Action Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Primary Service</TableHead>
                  <TableHead>Providers</TableHead>
                  <TableHead>Launch</TableHead>
                  <TableHead>Canonical</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allActions.map((a) => (
                  <TableRow key={`${a.routeKey}-${a.actionKey}`}>
                    <TableCell className="font-medium text-sm">{a.actionLabel}</TableCell>
                    <TableCell className="font-mono text-xs">{a.routePath}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{a.actionType}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{a.primaryServiceKey}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {a.providerDependencies.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.launchCriticality === "critical" ? "destructive" : "secondary"} className="text-xs">
                        {a.launchCriticality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.isCanonical ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
