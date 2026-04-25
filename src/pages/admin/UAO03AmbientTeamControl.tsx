import UAOSubNav from "@/platform/admin/components/admin/UAOSubNav";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";
import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const toneColors: Record<string, string> = { executive: "bg-purple-500/20 text-purple-400", professional: "bg-blue-500/20 text-blue-400", analytical: "bg-cyan-500/20 text-cyan-400", concise: "bg-muted text-muted-foreground", caring: "bg-green-500/20 text-green-400", direct: "bg-orange-500/20 text-orange-400", precise: "bg-yellow-500/20 text-yellow-400", calm: "bg-teal-500/20 text-teal-400" };
const intensityColors: Record<string, string> = { high: "bg-red-500/20 text-red-400", normal: "bg-blue-500/20 text-blue-400", low: "bg-muted text-muted-foreground" };

export default function UAO03AmbientTeamControl() {
  const queryClient = useQueryClient();

  const { data: roles = [] } = useQuery({
    queryKey: ["assistant-roles"],
    queryFn: async () => { const { data } = await fromTable("assistant_role_presences").select("*").order("role_name"); return data || []; },
  });

  const { data: interventions = [] } = useQuery({
    queryKey: ["proactive-interventions"],
    queryFn: async () => { const { data } = await fromTable("proactive_interventions").select("*").order("created_at", { ascending: false }).limit(20); return data || []; },
  });

  const seedRoles = useAction("admin", "roles.seed");

  const activeRoles = roles.filter((r: Record<string, any>) => r.active);
  const proactiveRoles = roles.filter((r: Record<string, any>) => r.proactive_mode);

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
      <DemoOnlyBanner surfaceId="UAO03" />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Ambient Team Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Assistant roles, proactive modes, escalation behavior</p>
        </div>
        <Button onClick={() => seedRoles.mutate({})} disabled={seedRoles.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${seedRoles.isPending ? "animate-spin" : ""}`} />
          {roles.length === 0 ? "Initialize Team" : "Re-Seed"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Roles</p><p className="text-2xl font-bold">{roles.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-400">{activeRoles.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Proactive</p><p className="text-2xl font-bold">{proactiveRoles.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Interventions</p><p className="text-2xl font-bold">{interventions.length}</p></CardContent></Card>
      </div>

      {roles.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Assistant Team Roles</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Description</TableHead><TableHead>Intensity</TableHead><TableHead>Tone</TableHead><TableHead>Proactive</TableHead><TableHead>Escalation</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
              <TableBody>
                {roles.map((r: Record<string, any>) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.role_name}</TableCell>
                    <TableCell className="text-xs max-w-[250px] truncate">{r.description}</TableCell>
                    <TableCell><Badge className={intensityColors[r.intensity] || ""}>{r.intensity}</Badge></TableCell>
                    <TableCell><Badge className={toneColors[r.tone] || ""} variant="outline">{r.tone}</Badge></TableCell>
                    <TableCell>{r.proactive_mode ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs">{r.escalation_behavior}</TableCell>
                    <TableCell>{r.active ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {roles.length === 0 && (<Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No assistant roles. Click "Initialize Team" to seed.</CardContent></Card>)}
    </div>
  );
}
