import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { getAILaunchHonestyBoard } from "@/lib/services/ai-gateway";
import type { LaunchHonestyLevel } from "@/lib/services/ai-gateway";

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

  const counts = capabilities.reduce((acc, c) => {
    acc[c.launchLevel] = (acc[c.launchLevel] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Eye className="h-6 w-6" /> AIG06 — AI Launch Truth Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Which AI features are real, demo, partial, blocked, or planned</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {(["real", "partial", "demo_governed", "internal_only", "unavailable", "planned"] as LaunchHonestyLevel[]).map(level => (
          <Card key={level} className="bg-card border-border"><CardContent className="pt-4">
            <p className="text-xs text-muted-foreground capitalize">{level.replace("_", " ")}</p>
            <p className="text-2xl font-bold">{counts[level] ?? 0}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card className="bg-card border-border">
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
                <TableHead>Last Used</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {capabilities.map((c) => (
                  <TableRow key={c.capabilityId}>
                    <TableCell className="font-medium text-xs">{c.capabilityName}</TableCell>
                    <TableCell>
                      <Badge variant={LEVEL_COLORS[c.launchLevel] as any} className="text-xs">
                        {LEVEL_ICONS[c.launchLevel]}
                        {c.launchLevel.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{c.provider ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{c.model ?? "—"}</TableCell>
                    <TableCell>{c.hasRoutingPolicy ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{c.hasBudget ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs">{c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleDateString() : "never"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No AI capabilities tracked. Add routing policies or make AI requests to populate.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
