import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { getAILaunchHonestyBoard, getLaunchHonestyRecords } from "@/lib/core-services/ai-gateway";
import type { LaunchHonestyLevel } from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LEVEL_VARIANT: Record<LaunchHonestyLevel, string> = {
  real: "default",
  partial: "secondary",
  demo_governed: "outline",
  internal_only: "outline",
  unavailable: "destructive",
  planned: "outline",
};

const LEVEL_LABEL: Record<LaunchHonestyLevel, { icon: React.ReactNode; color: string }> = {
  real: { icon: <CheckCircle className="h-3.5 w-3.5" />, color: "text-emerald-400" },
  partial: { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-amber-400" },
  demo_governed: { icon: <Eye className="h-3.5 w-3.5" />, color: "text-blue-400" },
  internal_only: { icon: <Eye className="h-3.5 w-3.5" />, color: "text-muted-foreground" },
  unavailable: { icon: <XCircle className="h-3.5 w-3.5" />, color: "text-destructive" },
  planned: { icon: <Eye className="h-3.5 w-3.5" />, color: "text-muted-foreground" },
};

export default function AIG07LaunchTruth() {
  const { data: capabilities = [] } = useQuery({
    queryKey: ["ai-launch-honesty"],
    queryFn: getAILaunchHonestyBoard,
  });

  const { data: rawRecords = [] } = useQuery({
    queryKey: ["ai-launch-honesty-records"],
    queryFn: getLaunchHonestyRecords,
  });

  const counts = capabilities.reduce((acc, c) => {
    acc[c.launchLevel] = (acc[c.launchLevel] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const publicSafe = capabilities.filter(c => c.publicClaimAllowed && c.launchLevel === "real").length;
  const contradictions = capabilities.filter(c =>
    (c.launchLevel === "unavailable" && c.hasRoutingPolicy) ||
    (c.publicClaimAllowed && c.launchLevel !== "real") ||
    (c.launchLevel === "real" && !c.hasRoutingPolicy)
  );

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> AIG07 — AI Launch Truth Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Honesty classes, public-safe status, contradictions, and verification for every AI capability
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {(["real", "partial", "demo_governed", "internal_only", "unavailable", "planned"] as LaunchHonestyLevel[]).map(level => (
          <Card key={level} className="bg-card border-border">
            <CardContent className="pt-3 pb-3">
              <div className={`flex items-center gap-1.5 text-xs ${LEVEL_LABEL[level].color}`}>
                {LEVEL_LABEL[level].icon}
                <span className="capitalize">{level.replace(/_/g, " ")}</span>
              </div>
              <p className="text-xl font-bold mt-1">{counts[level] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="bg-card border-border">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-emerald-400">Public-Safe</p>
            <p className="text-xl font-bold mt-1">{publicSafe}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-destructive">Contradictions</p>
            <p className="text-xl font-bold mt-1">{contradictions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contradictions */}
      {contradictions.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Contradictions Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Issue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contradictions.map(c => {
                  let issue = "";
                  if (c.publicClaimAllowed && c.launchLevel !== "real") issue = "Public claim allowed but not 'real'";
                  else if (c.launchLevel === "unavailable" && c.hasRoutingPolicy) issue = "Marked unavailable but has routing policy";
                  else if (c.launchLevel === "real" && !c.hasRoutingPolicy) issue = "Marked 'real' but no routing policy exists";
                  return (
                    <TableRow key={c.capabilityId}>
                      <TableCell className="font-mono text-xs">{c.capabilityId}</TableCell>
                      <TableCell>
                        <Badge variant={LEVEL_VARIANT[c.launchLevel] as never} className="text-xs">
                          {c.launchLevel.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-destructive">{issue}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Full capability truth table */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>AI Capability Launch Status</CardTitle></CardHeader>
        <CardContent>
          {capabilities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Honesty Class</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Routing</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Public-Safe</TableHead>
                  <TableHead>Qualifier</TableHead>
                  <TableHead>Last Verified</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capabilities.map(c => {
                  const raw = rawRecords.find(r => r.capability_key === c.capabilityId);
                  return (
                    <TableRow key={c.capabilityId}>
                      <TableCell className="font-mono text-xs font-medium">{c.capabilityId}</TableCell>
                      <TableCell>
                        <Badge variant={LEVEL_VARIANT[c.launchLevel] as never} className="text-xs gap-1">
                          {LEVEL_LABEL[c.launchLevel].icon}
                          {c.launchLevel.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{c.provider ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{c.model ?? "—"}</TableCell>
                      <TableCell>
                        {c.hasRoutingPolicy
                          ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      </TableCell>
                      <TableCell>
                        {c.hasBudget
                          ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      </TableCell>
                      <TableCell>
                        {c.publicClaimAllowed
                          ? <Badge variant="default" className="text-xs bg-emerald-500/20 text-emerald-300">Yes</Badge>
                          : <Badge variant="outline" className="text-xs">No</Badge>}
                      </TableCell>
                      <TableCell className="text-xs">{c.qualifierRequired ? "Required" : "—"}</TableCell>
                      <TableCell className="text-xs">{raw?.last_verified_at ? new Date(raw.last_verified_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-xs max-w-[180px] truncate">{c.notes ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No AI capabilities tracked yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Canonical honesty records */}
      {rawRecords.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Canonical Launch Honesty Records</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability Key</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Public Claim</TableHead>
                  <TableHead>Qualifier</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Last Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawRecords.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.capability_key}</TableCell>
                    <TableCell>
                      <Badge variant={LEVEL_VARIANT[r.launch_honesty_class as LaunchHonestyLevel] as never ?? "outline"} className="text-xs">
                        {r.launch_honesty_class}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.public_claim_allowed ? "✓" : "✗"}</TableCell>
                    <TableCell>{r.qualifier_required ? "Required" : "No"}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{r.notes ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.last_verified_at ? new Date(r.last_verified_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
