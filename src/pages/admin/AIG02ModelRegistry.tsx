import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cpu, CheckCircle, XCircle } from "lucide-react";
import { getAIModelRegistry } from "@/lib/core-services/ai-gateway";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function AIG02ModelRegistry() {
  const { data: models = [] } = useQuery({
    queryKey: ["ai-model-registry"],
    queryFn: getAIModelRegistry,
  });

  const providers = [...new Set(models.map(m => m.provider))];

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Cpu className="h-6 w-6" /> AIG02 — AI Model Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">All registered models, tiers, costs, and capabilities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Models</p>
          <p className="text-2xl font-bold">{models.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Providers</p>
          <p className="text-2xl font-bold">{providers.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{models.filter(m => !m.deprecated).length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Deprecated</p>
          <p className="text-2xl font-bold">{models.filter(m => m.deprecated).length}</p>
        </CardContent></Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Model Catalog</CardTitle></CardHeader>
        <CardContent>
          {models.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Model ID</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Quality Tier</TableHead>
                <TableHead>Cost Tier</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Tool Use</TableHead>
                <TableHead>Structured</TableHead>
                <TableHead>Recommended Uses</TableHead>
                <TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {models.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.model_id}</TableCell>
                    <TableCell>{m.provider}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{m.model_class}</Badge></TableCell>
                    <TableCell className="text-xs">{m.quality_tier ?? "—"}</TableCell>
                    <TableCell className="text-xs">{m.cost_tier ?? "—"}</TableCell>
                    <TableCell className="text-xs">{m.latency_tier ?? "—"}</TableCell>
                    <TableCell className="text-xs">{m.context_length ? `${(m.context_length / 1000).toFixed(0)}K` : "—"}</TableCell>
                    <TableCell>{m.tool_calling_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{m.structured_output_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate">
                      {m.recommended_use_cases
                        ? (typeof m.recommended_use_cases === "string"
                            ? m.recommended_use_cases
                            : Array.isArray(m.recommended_use_cases)
                              ? (m.recommended_use_cases as string[]).join(", ")
                              : JSON.stringify(m.recommended_use_cases))
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.deprecated ? "destructive" : m.is_active === false ? "secondary" : "default"} className="text-xs">
                        {m.deprecated ? "deprecated" : m.is_active === false ? "inactive" : m.launch_stage ?? "active"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No models registered. Seed the ai_model_registry table to populate.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
