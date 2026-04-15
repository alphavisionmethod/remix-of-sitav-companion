// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Safety Rails
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminSafety, type SafetyRequirements, type ConfirmationRequest } from "@/lib/platform-plane";
import { ShieldAlert, Clock, CheckCircle2, XCircle, Eye, AlertTriangle } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
};

export function AdminSafetyRails() {
  const [actions, setActions] = useState<SafetyRequirements[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminSafety.loadSafetyActions(),
      adminSafety.getPendingConfirmations(),
    ]).then(([a, c]) => {
      setActions(a);
      setConfirmations(c);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-destructive/20 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Admin Safety Rails</h2>
          <p className="text-sm text-muted-foreground">Protection mechanisms for high-risk administrative actions</p>
        </div>
      </div>

      {/* Pending Confirmations */}
      {confirmations.length > 0 && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Pending Confirmations ({confirmations.length})
            </CardTitle>
            <CardDescription>Actions awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Cooldown</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.actionKey}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 text-[10px]">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {c.justification || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      {c.cooldownExpiresAt ? (
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          Until {new Date(c.cooldownExpiresAt).toLocaleTimeString()}
                        </Badge>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Safety Action Definitions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Safety Action Definitions</CardTitle>
          <CardDescription>All registered high-risk actions and their protection requirements</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Dry Run</TableHead>
                  <TableHead>Confirm</TableHead>
                  <TableHead>Dual Approval</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead>Cooldown</TableHead>
                  <TableHead>Permission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((a) => (
                  <TableRow key={a.actionKey}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{a.displayName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{a.actionKey}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${RISK_COLORS[a.riskLevel] ?? ""}`}>
                        {a.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.requiresDryRun ? <Eye className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{a.requiresConfirmation ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{a.requiresDualApproval ? <ShieldAlert className="h-4 w-4 text-destructive" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{a.requiresJustification ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      {a.cooldownSeconds > 0 ? (
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" />{a.cooldownSeconds}s
                        </Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{a.requiredPermission}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
