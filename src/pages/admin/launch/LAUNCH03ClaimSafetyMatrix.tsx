import { useState, useEffect } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { computeLaunchReadiness, type CapabilityClassification, type ClaimSafety } from "@/lib/core-services/launch-readiness/launch-readiness-engine";
import { cn } from "@/lib/utils";

const SAFETY_CONFIG: Record<ClaimSafety, { label: string; icon: typeof CheckCircle; color: string }> = {
  safe: { label: "Safe to Claim", icon: CheckCircle, color: "text-emerald-400" },
  qualify: { label: "Qualify Carefully", icon: AlertTriangle, color: "text-amber-400" },
  unsafe: { label: "Do Not Claim", icon: XCircle, color: "text-destructive" },
};

export default function LAUNCH03ClaimSafetyMatrix() {
  const [caps, setCaps] = useState<CapabilityClassification[]>([]);
  const [filter, setFilter] = useState<ClaimSafety | "all">("all");

  useEffect(() => { const r = computeLaunchReadiness(null); setCaps(r.capabilities); }, []);

  const filtered = filter === "all" ? caps : caps.filter(c => c.claimSafety === filter);

  return (
    <div className="space-y-6 p-6" data-testid="launch03-claim-safety">
      <SitaPageHeader icon={<Shield className="h-6 w-6" />} title="Capability Claim Safety Matrix" subtitle="What is safe to claim publicly, what needs qualification, and what must not be claimed" />
      <div className="flex gap-2">
        {(["all", "safe", "qualify", "unsafe"] as const).map(f => (
          <Badge key={f} variant={filter === f ? "default" : "outline"} className="cursor-pointer text-[10px]" onClick={() => setFilter(f)}>
            {f === "all" ? `All (${caps.length})` : `${SAFETY_CONFIG[f].label} (${caps.filter(c => c.claimSafety === f).length})`}
          </Badge>
        ))}
      </div>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Capability</TableHead>
                <TableHead className="text-[10px]">Domain</TableHead>
                <TableHead className="text-[10px]">Classification</TableHead>
                <TableHead className="text-[10px]">Claim Safety</TableHead>
                <TableHead className="text-[10px]">Score</TableHead>
                <TableHead className="text-[10px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => {
                const safety = SAFETY_CONFIG[c.claimSafety];
                const Icon = safety.icon;
                return (
                  <TableRow key={c.key} data-testid={`capability-${c.key}`}>
                    <TableCell className="text-xs font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{c.domain}</Badge></TableCell>
                    <TableCell className="text-[10px] text-muted-foreground capitalize">{c.honestyClass.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-1 text-[10px]", safety.color)}>
                        <Icon className="h-3 w-3" /> {safety.label}
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-xs font-bold", c.overallScore >= 70 ? "text-emerald-400" : c.overallScore >= 50 ? "text-amber-400" : "text-destructive")}>{c.overallScore}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{c.notes}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
