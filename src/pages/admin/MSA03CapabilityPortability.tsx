import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Minus, Zap } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const portColors: Record<string, string> = {
  portable: "bg-green-500/20 text-green-400", web_preferred: "bg-cyan-500/20 text-cyan-400",
  surface_specific: "bg-yellow-500/20 text-yellow-400", not_portable: "bg-red-500/20 text-red-400",
};

const bindingColors: Record<string, string> = {
  production: "bg-green-500/20 text-green-400", tested: "bg-cyan-500/20 text-cyan-400",
  implemented: "bg-blue-500/20 text-blue-400", planned: "bg-muted text-muted-foreground",
  deprecated: "bg-red-500/20 text-red-400",
};

export default function MSA03CapabilityPortability() {
  const { data: capabilities = [] } = useQuery({
    queryKey: ["capability-definitions"],
    queryFn: async () => { const { data } = await fromTable("capability_definitions").select("*").order("domain"); return data || []; },
  });

  const { data: bindings = [] } = useQuery({
    queryKey: ["capability-surface-bindings"],
    queryFn: async () => { const { data } = await fromTable("capability_surface_bindings").select("*"); return data || []; },
  });

  const { data: surfaces = [] } = useQuery({
    queryKey: ["surface-types"],
    queryFn: async () => { const { data } = await fromTable("surface_types").select("id, surface_key, display_name").order("created_at"); return data || []; },
  });

  const getBinding = (capId: string, surfaceId: string) => bindings.find((b: Record<string, any>) => b.capability_id === capId && b.surface_id === surfaceId);

  const domains = [...new Set(capabilities.map((c: Record<string, any>) => c.domain))];
  const portable = capabilities.filter((c: Record<string, any>) => c.portability_class === "portable").length;

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6" /> Capability Portability Console</h1>
        <p className="text-sm text-muted-foreground mt-1">Every capability mapped to surface readiness — {portable}/{capabilities.length} portable</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(portColors).map(([key, color]) => {
          const count = capabilities.filter((c: Record<string, any>) => c.portability_class === key).length;
          return (
            <Card key={key} className="bg-card border-border"><CardContent className="pt-4">
              <p className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
              <p className="text-2xl font-bold">{count}</p>
            </CardContent></Card>
          );
        })}
      </div>

      {domains.map((domain: string) => {
        const domainCaps = capabilities.filter((c: Record<string, any>) => c.domain === domain);
        return (
          <Card key={domain} className="bg-card border-border">
            <CardHeader><CardTitle className="capitalize">{domain} Domain</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capability</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Portability</TableHead>
                    {surfaces.map((s: Record<string, any>) => <TableHead key={s.id}>{s.display_name}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainCaps.map((c: Record<string, any>) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.capability_key}</TableCell>
                      <TableCell><Badge variant="outline">{c.action_type}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{c.risk_tier}</Badge></TableCell>
                      <TableCell><Badge className={portColors[c.portability_class] || ""}>{c.portability_class}</Badge></TableCell>
                      {surfaces.map((s: Record<string, any>) => {
                        const binding = getBinding(c.id, s.id);
                        return (
                          <TableCell key={s.id}>
                            {binding ? (
                              <Badge className={bindingColors[binding.binding_status] || ""}>{binding.binding_status}</Badge>
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {capabilities.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No capabilities registered. Initialize MSA first.</CardContent></Card>
      )}
    </div>
  );
}
