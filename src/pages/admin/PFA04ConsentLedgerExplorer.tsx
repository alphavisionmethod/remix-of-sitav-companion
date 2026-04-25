import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function PFA04ConsentLedgerExplorer() {
  const { data: consents = [] } = useQuery({
    queryKey: ["consent-ledger"],
    queryFn: async () => { const { data } = await fromTable("consent_ledger").select("*, provider_families(name), provider_capabilities(display_name)").order("created_at", { ascending: false }).limit(100); return data || []; },
  });

  const { data: upgrades = [] } = useQuery({
    queryKey: ["consent-upgrades"],
    queryFn: async () => { const { data } = await fromTable("consent_upgrades").select("*").order("created_at", { ascending: false }).limit(50); return data || []; },
  });

  const { data: revocations = [] } = useQuery({
    queryKey: ["consent-revocations"],
    queryFn: async () => { const { data } = await fromTable("consent_revocations").select("*").order("created_at", { ascending: false }).limit(50); return data || []; },
  });

  const statusColors: Record<string, string> = { active: "bg-green-500/20 text-green-400", revoked: "bg-red-500/20 text-red-400", expired: "bg-yellow-500/20 text-yellow-400" };

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Consent Ledger Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Grants, upgrades, revocations, and permission histories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active Consents</p>
          <p className="text-2xl font-bold">{consents.filter((c: Record<string, any>) => c.consent_status === "active").length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Upgrades</p>
          <p className="text-2xl font-bold">{upgrades.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Revocations</p>
          <p className="text-2xl font-bold text-destructive">{revocations.length}</p>
        </CardContent></Card>
      </div>

      {consents.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Consent Records</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead>Granted Scopes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead>Granted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((c: Record<string, any>) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.provider_families?.name || "—"}</TableCell>
                    <TableCell>{c.provider_capabilities?.display_name || "—"}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{(c.granted_scopes || []).join(", ")}</TableCell>
                    <TableCell><Badge className={statusColors[c.consent_status] || ""}>{c.consent_status}</Badge></TableCell>
                    <TableCell className="text-xs">{c.mode}</TableCell>
                    <TableCell className="text-xs">{c.source_flow}</TableCell>
                    <TableCell className="text-xs">{new Date(c.granted_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {consents.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No consent records yet.</CardContent></Card>
      )}
    </div>
  );
}
