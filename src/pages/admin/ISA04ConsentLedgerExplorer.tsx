import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText, Shield, Plug, ArrowUpCircle, XCircle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRelation, parseProviderFamilyRef, parseProviderCapabilityRef } from "@/lib/types/relation-parsers";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const typeColors: Record<string, string> = {
  identity_link: "bg-blue-500/20 text-blue-400",
  connector_grant: "bg-green-500/20 text-green-400",
  scope_upgrade: "bg-amber-500/20 text-amber-400",
  scope_downgrade: "bg-orange-500/20 text-orange-400",
  initial_grant: "bg-cyan-500/20 text-cyan-400",
};

export default function ISA04ConsentLedgerExplorer() {
  const [tab, setTab] = useState("all");

  const { data: consents = [] } = useQuery({
    queryKey: ["isa04-consent-ledger"],
    queryFn: async () => {
      const { data } = await db.from("consent_ledger")
        .select("*, provider_families(name, provider_key), provider_capabilities(display_name)")
        .order("granted_at", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const { data: upgrades = [] } = useQuery({
    queryKey: ["isa04-consent-upgrades"],
    queryFn: async () => {
      const { data } = await db.from("consent_upgrades")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const { data: revocations = [] } = useQuery({
    queryKey: ["isa04-consent-revocations"],
    queryFn: async () => {
      const { data } = await db.from("consent_revocations")
        .select("*")
        .order("revoked_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const identityConsents = consents.filter((c: Record<string, any>) => c.consent_type === "identity_link");
  const connectorConsents = consents.filter((c: Record<string, any>) => c.consent_type !== "identity_link");
  const activeConsents = consents.filter((c: Record<string, any>) => !c.revoked);
  const revokedConsents = consents.filter((c: Record<string, any>) => c.revoked);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-primary" /> Consent Ledger Explorer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full audit trail of identity link consents vs connector access consents, upgrades, and revocations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Consents</p>
          <p className="text-2xl font-bold">{consents.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Identity</p>
          <p className="text-2xl font-bold text-blue-400">{identityConsents.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Plug className="h-3 w-3" /> Connector</p>
          <p className="text-2xl font-bold text-green-400">{connectorConsents.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpCircle className="h-3 w-3" /> Upgrades</p>
          <p className="text-2xl font-bold text-amber-400">{upgrades.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3" /> Revocations</p>
          <p className="text-2xl font-bold text-red-400">{revocations.length}</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({consents.length})</TabsTrigger>
          <TabsTrigger value="identity">Identity ({identityConsents.length})</TabsTrigger>
          <TabsTrigger value="connector">Connector ({connectorConsents.length})</TabsTrigger>
          <TabsTrigger value="upgrades">Upgrades ({upgrades.length})</TabsTrigger>
          <TabsTrigger value="revocations">Revocations ({revocations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {(tab === "upgrades") ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Date</TableHead><TableHead>From Scopes</TableHead><TableHead>To Scopes</TableHead>
                    <TableHead>Reason</TableHead><TableHead>Approved</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {upgrades.map((u: Record<string, any>) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><div className="flex flex-wrap gap-1">{(u.from_scopes || []).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></TableCell>
                        <TableCell><div className="flex flex-wrap gap-1">{(u.to_scopes || []).map((s: string) => <Badge key={s} className="bg-amber-500/20 text-amber-400 text-xs">{s}</Badge>)}</div></TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{u.reason || "—"}</TableCell>
                        <TableCell>{u.approved ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</TableCell>
                      </TableRow>
                    ))}
                    {upgrades.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No upgrades recorded</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (tab === "revocations") ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Date</TableHead><TableHead>Revoked Scopes</TableHead><TableHead>Reason</TableHead><TableHead>By</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {revocations.map((r: Record<string, any>) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs">{new Date(r.revoked_at).toLocaleDateString()}</TableCell>
                        <TableCell><div className="flex flex-wrap gap-1">{(r.revoked_scopes || []).map((s: string) => <Badge key={s} className="bg-red-500/20 text-red-400 text-xs">{s}</Badge>)}</div></TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.reason || "—"}</TableCell>
                        <TableCell className="text-xs">{r.revoked_by || "user"}</TableCell>
                      </TableRow>
                    ))}
                    {revocations.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No revocations recorded</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Family</TableHead>
                    <TableHead>Service</TableHead><TableHead>Scopes</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {(tab === "identity" ? identityConsents : tab === "connector" ? connectorConsents : consents).map((c: Record<string, any>) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs">{new Date(c.granted_at || c.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={typeColors[c.consent_type] || "bg-muted text-muted-foreground"}>
                            {c.consent_type === "identity_link" ? <><Shield className="h-3 w-3 mr-1" />Identity</> : <><Plug className="h-3 w-3 mr-1" />Connector</>}
                          </Badge>
                        </TableCell>
                        <TableCell>{getRelation(c, "provider_families", parseProviderFamilyRef).name || "—"}</TableCell>
                        <TableCell>{getRelation(c, "provider_capabilities", parseProviderCapabilityRef).display_name || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(c.scopes_granted || []).slice(0, 3).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                            {(c.scopes_granted || []).length > 3 && <Badge variant="outline" className="text-xs">+{c.scopes_granted.length - 3}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{c.mode || "real"}</Badge></TableCell>
                        <TableCell>
                          {c.revoked
                            ? <Badge className="bg-red-500/20 text-red-400">Revoked</Badge>
                            : <Badge className="bg-green-500/20 text-green-400">Active</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                    {consents.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No consent records</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
