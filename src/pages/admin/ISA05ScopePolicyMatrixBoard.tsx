import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Grid3X3, Shield, Lock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { getRelation, parseProviderFamilyRef, parseProviderCapabilityRef } from "@/lib/types/relation-parsers";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const riskColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  critical: "bg-red-500/20 text-red-400",
};

const categoryColors: Record<string, string> = {
  identity_minimal: "bg-blue-500/20 text-blue-400",
  connector_read: "bg-green-500/20 text-green-400",
  connector_write: "bg-amber-500/20 text-amber-400",
  connector_admin: "bg-red-500/20 text-red-400",
  disallowed: "bg-red-800/20 text-red-300",
};

export default function ISA05ScopePolicyMatrixBoard() {
  const { data: scopes = [] } = useQuery({
    queryKey: ["isa05-scope-policy"],
    queryFn: async () => {
      const { data } = await db.from("scope_policy_matrix")
        .select("*, provider_families(name, provider_key), provider_capabilities(display_name)")
        .order("provider_family_id")
        .order("category");
      return data || [];
    },
  });

  const identityScopes = scopes.filter((s: Record<string, any>) => s.category === "identity_minimal");
  const readScopes = scopes.filter((s: Record<string, any>) => s.category === "connector_read");
  const writeScopes = scopes.filter((s: Record<string, any>) => s.category === "connector_write");
  const adminScopes = scopes.filter((s: Record<string, any>) => s.category === "connector_admin");
  const disallowedScopes = scopes.filter((s: Record<string, any>) => s.category === "disallowed");
  const approvalNeeded = scopes.filter((s: Record<string, any>) => s.approval_needed);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Grid3X3 className="h-6 w-6 text-primary" /> Scope Policy Matrix
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Governs which scopes are identity-minimal, connector-read, connector-write, and disallowed.
        </p>
      </div>

      {/* Separation Callout */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Scope Governance Rule</p>
            <p className="text-xs text-muted-foreground mt-1">
              Identity scopes (openid, email, profile) are never mixed with connector scopes (drive.readonly, gmail.send, etc.).
              Connector scopes default to read-only. Write/admin scopes require explicit upgrade.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{scopes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Identity</p>
          <p className="text-xl font-bold text-blue-400">{identityScopes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground">Read</p>
          <p className="text-xl font-bold text-green-400">{readScopes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground">Write</p>
          <p className="text-xl font-bold text-amber-400">{writeScopes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground">Approval</p>
          <p className="text-xl font-bold text-orange-400">{approvalNeeded.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground">Disallowed</p>
          <p className="text-xl font-bold text-red-400">{disallowedScopes.length}</p>
        </CardContent></Card>
      </div>

      {/* Scope Matrix Table */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Full Scope Policy Matrix</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scopes.map((s: Record<string, any>) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{getRelation(s, "provider_families", parseProviderFamilyRef).name || "—"}</TableCell>
                  <TableCell className="text-sm">{getRelation(s, "provider_capabilities", parseProviderCapabilityRef).display_name || "—"}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{s.scope_key}</code></TableCell>
                  <TableCell><Badge className={categoryColors[s.category] || "bg-muted text-muted-foreground"}>{s.category?.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell><Badge className={riskColors[s.risk_level] || "bg-muted text-muted-foreground"}>{s.risk_level}</Badge></TableCell>
                  <TableCell>{s.default_granted ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                  <TableCell>{s.approval_needed ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                </TableRow>
              ))}
              {scopes.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No scope policies configured. Seed data to populate.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
