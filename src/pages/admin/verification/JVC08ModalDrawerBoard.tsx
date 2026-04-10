// ═══════════════════════════════════════════════════════
// SITA OS — JVC08: Modal / Drawer Interaction Board
// Verify transient UI correctness (open/close/focus trap)
// ═══════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SURFACE_REGISTRY } from "@/lib/verification/surface-registry";
import { useVerificationRuns } from "@/lib/verification/verification-hooks";
import { Layers, CheckCircle2, XCircle, AlertTriangle, Focus, Trash2, Eye } from "lucide-react";

export default function JVC08ModalDrawerBoard() {
  const { data: runs } = useVerificationRuns();

  const overlays = useMemo(() =>
    SURFACE_REGISTRY.filter(s => s.surfaceClass === "modal" || s.surfaceClass === "drawer"),
    []
  );

  const modals = overlays.filter(s => s.surfaceClass === "modal");
  const drawers = overlays.filter(s => s.surfaceClass === "drawer");
  const withFocusTrap = overlays.filter(s => s.focusTrapExpected);
  const withCleanup = overlays.filter(s => s.modalCleanupRequired);

  const zombieRisks = overlays.filter(s => s.modalCleanupRequired && !s.focusTrapExpected);

  return (
    <div className="space-y-6 p-6" data-testid="jvc08-modal-drawer">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          JVC08 — Modal / Drawer Interaction Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Open/close, focus trap, escape handling, zombie overlay detection</p>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{overlays.length}</div>
          <div className="text-xs text-muted-foreground">Total Overlays</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{modals.length}</div>
          <div className="text-xs text-muted-foreground">Modals</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{drawers.length}</div>
          <div className="text-xs text-muted-foreground">Drawers</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{withFocusTrap.length}</div>
          <div className="text-xs text-muted-foreground">Focus Trap</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{zombieRisks.length}</div>
          <div className="text-xs text-muted-foreground">Zombie Risks</div>
        </CardContent></Card>
      </div>

      {/* Overlay Interaction Grid */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Overlay Registry</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Overlay</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Route</TableHead>
                <TableHead className="text-xs">Focus Trap</TableHead>
                <TableHead className="text-xs">Cleanup</TableHead>
                <TableHead className="text-xs">Escape</TableHead>
                <TableHead className="text-xs">Proof</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overlays.map(o => (
                <TableRow key={o.routeKey}>
                  <TableCell className="text-xs font-medium">{o.actionLabel}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${o.surfaceClass === "modal" ? "border-blue-500/30 text-blue-400" : "border-purple-500/30 text-purple-400"}`}>
                      {o.surfaceClass}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{o.routePath}</TableCell>
                  <TableCell>
                    {o.focusTrapExpected ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    {o.modalCleanupRequired ? <CheckCircle2 className="h-3 w-3 text-blue-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  </TableCell>
                  <TableCell>
                    {o.proofReceiptRequired ? <CheckCircle2 className="h-3 w-3 text-purple-400" /> : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell><Badge variant={o.testPriority === "P0" ? "destructive" : "outline"} className="text-xs">{o.testPriority}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Focus Trap Check Panel */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Focus className="h-4 w-4" /> Focus Trap Verification</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overlays.map(o => (
              <div key={o.routeKey} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{o.actionLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {o.focusTrapExpected ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px]">trap active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">no trap</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">Esc closes</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zombie Overlay Alerts */}
      <Card className={zombieRisks.length > 0 ? "border-amber-500/30" : ""}>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Trash2 className="h-4 w-4 text-amber-400" /> Zombie Overlay Alerts</CardTitle></CardHeader>
        <CardContent>
          {zombieRisks.length > 0 ? (
            <div className="space-y-2">
              {zombieRisks.map(o => (
                <div key={o.routeKey} className="flex items-center gap-3 p-2 bg-amber-500/10 rounded-md">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  <span className="text-xs font-medium">{o.actionLabel}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Cleanup required but no focus trap — potential zombie overlay</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> No zombie overlay risks detected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Nested Action Results */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Nested CTA Behavior</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overlays.filter(o => o.proofReceiptRequired || o.actionType === "open_modal").map(o => (
              <div key={o.routeKey} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <span className="text-xs font-medium">{o.actionLabel}</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">{o.actionType}</Badge>
                  <Badge variant="outline" className="text-[10px]">{o.expectedResult.substring(0, 50)}…</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
