import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { getAILaunchHonestyBoard, getLaunchHonestyRecords } from "@/lib/core-services/ai-gateway";
import type { LaunchHonestyLevel } from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LEVEL_COLORS: Record<LaunchHonestyLevel, string> = {
  real: "default",
  partial: "secondary",
  demo_governed: "outline",
  internal_only: "outline",
  unavailable: "destructive",
  planned: "outline",
};

const LEVEL_ICONS: Record<LaunchHonestyLevel, React.ReactNode> = {
  real: <CheckCircle className="h-3 w-3 text-green-400 inline mr-1" />,
  partial: <AlertTriangle className="h-3 w-3 text-yellow-400 inline mr-1" />,
  demo_governed: <Eye className="h-3 w-3 text-blue-400 inline mr-1" />,
  internal_only: <Eye className="h-3 w-3 text-muted-foreground inline mr-1" />,
  unavailable: <XCircle className="h-3 w-3 text-red-400 inline mr-1" />,
  planned: <Eye className="h-3 w-3 text-muted-foreground inline mr-1" />,
};

export default function AIG06LaunchTruth() {
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

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Eye className="h-6 w-6" /> AIG07 — AI Launch Truth Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Which AI features are real, demo, partial, blocked, or planned — with canonical honesty records</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {(["real", "partial", "demo_governed", "internal_only", "unavailable", "planned"] as LaunchHonestyLevel[]).map(level => (
          <Card key={level}><CardContent className="pt-4">
            <p className="text-xs text-muted-foreground capitalize">{level.replace("_", " ")}</p>
            <p className="text-2xl font-bold">{counts[level] ?? 0}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>AI Capability Launch Status</CardTitle></CardHeader>
        <CardContent>
          {capabilities.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Launch Level</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Has Policy</TableHead>
                <TableHead>Has Budget</TableHead>
                <TableHead>Public Claim</TableHead>
                <TableHead>Qualifier</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {capabilities.map((c) => (
                  <TableRow key={c.capabilityId}>
                    <TableCell className="font-medium text-xs">{c.capabilityName}</TableCell>
                    <TableCell>
                      <Badge variant={LEVEL_COLORS[c.launchLevel] as never} className="text-xs">
                        {LEVEL_ICONS[c.launchLevel]}
                        {c.launchLevel.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{c.provider ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{c.model ?? "—"}</TableCell>
                    <TableCell>{c.hasRoutingPolicy ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{c.hasBudget ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{c.publicClaimAllowed ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{c.qualifierRequired ? "Required" : "No"}</TableCell>
                    <TableCell className="text-xs">{c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleDateString() : "never"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No AI capabilities tracked. Add routing policies, launch honesty records, or make AI requests to populate.</p>
          )}
        </CardContent>
      </Card>

      {/* Raw honesty records */}
      {rawRecords.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Canonical Launch Honesty Records</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Capability Key</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Public Claim</TableHead>
                <TableHead>Qualifier</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Last Verified</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rawRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.capability_key}</TableCell>
                    <TableCell><Badge variant={LEVEL_COLORS[r.launch_honesty_class as LaunchHonestyLevel] as never ?? "outline"} className="text-xs">{r.launch_honesty_class}</Badge></TableCell>
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
