import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, User, Link2, CheckCircle, XCircle, Shield, ScrollText } from "lucide-react";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";

import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  getAccountNodes,
  getAccountEdges,
  getUserIdentityLinks,
  getConnectedServices,
  getConsentHistory,
  getSeparationAudits,
  getAccountGraphSummary,
} from "@/lib/core-services/identity-auth";

export default function PFA08AccountGraphExplorer() {
  const { data: nodes = [] } = useQuery({
    queryKey: ["account-nodes"],
    queryFn: getAccountNodes,
  });

  const { data: edges = [] } = useQuery({
    queryKey: ["account-edges"],
    queryFn: getAccountEdges,
  });

  const { data: identities = [] } = useQuery({
    queryKey: ["identity-links"],
    queryFn: getUserIdentityLinks,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["service-links"],
    queryFn: getConnectedServices,
  });

  const { data: consents = [] } = useQuery({
    queryKey: ["consent-history"],
    queryFn: () => getConsentHistory(20),
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["separation-audits"],
    queryFn: getSeparationAudits,
  });

  const { data: graphSummary = [] } = useQuery({
    queryKey: ["account-graph-summary"],
    queryFn: getAccountGraphSummary,
  });

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Network className="h-6 w-6" /> Unified Account Graph</h1>
        <p className="text-sm text-muted-foreground mt-1">Identity auth (sign-in) and connector auth (external access) — fully separated</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Graph Nodes</p>
          <p className="text-2xl font-bold">{nodes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Graph Edges</p>
          <p className="text-2xl font-bold">{edges.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Identity Links</p>
          <p className="text-2xl font-bold">{identities.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Service Links</p>
          <p className="text-2xl font-bold">{services.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Consent Records</p>
          <p className="text-2xl font-bold">{consents.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Separation Audits</p>
          <p className="text-2xl font-bold">{audits.length}</p>
        </CardContent></Card>
      </div>

      {/* Identity Provider Links — SIGN-IN domain */}
      {identities.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Identity Provider Links <Badge variant="outline" className="text-xs ml-2">Sign-In Domain</Badge></CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Email</TableHead><TableHead>Method</TableHead><TableHead>Primary</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
              <TableBody>
                {identities.map((i: Record<string, any>) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.provider_families?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{i.email || "—"}</TableCell>
                    <TableCell className="text-xs">{i.auth_method}</TableCell>
                    <TableCell>{i.primary_identity ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{i.active ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Connected Services — CONNECTOR domain */}
      {services.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Connected Services <Badge variant="outline" className="text-xs ml-2">Connector Domain</Badge></CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Capability</TableHead><TableHead>Status</TableHead><TableHead>Permission</TableHead><TableHead>Health</TableHead><TableHead>Mode</TableHead></TableRow></TableHeader>
              <TableBody>
                {services.map((s: Record<string, any>) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.provider_families?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{s.provider_capabilities?.display_name ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{s.connection_status}</Badge></TableCell>
                    <TableCell className="text-xs">{s.permission_level}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{s.health_status}</Badge></TableCell>
                    <TableCell className="text-xs">{s.mode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Consent Ledger */}
      {consents.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" /> Consent Ledger</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Type</TableHead><TableHead>Action</TableHead><TableHead>Granted Scopes</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {consents.map((c: Record<string, any>) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.provider_families?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{c.consent_type}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{c.action}</Badge></TableCell>
                    <TableCell className="text-xs">{Array.isArray(c.granted_scopes) ? c.granted_scopes.join(", ") : "—"}</TableCell>
                    <TableCell className="text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Separation Audits */}
      {audits.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Auth-Connector Separation Audits</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Check</TableHead><TableHead>Auth Domain</TableHead><TableHead>Result</TableHead><TableHead>Severity</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {audits.map((a: Record<string, any>) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs">{a.check_name}</TableCell>
                    <TableCell className="text-xs">{a.auth_domain}</TableCell>
                    <TableCell><Badge variant={a.passed ? "default" : "destructive"} className="text-xs">{a.passed ? "Pass" : "Fail"}</Badge></TableCell>
                    <TableCell className="text-xs">{a.severity}</TableCell>
                    <TableCell className="text-xs">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Graph Summary */}
      {graphSummary.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Network className="h-5 w-5" /> Graph Summary</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Label</TableHead><TableHead>Type</TableHead><TableHead>Edges</TableHead></TableRow></TableHeader>
              <TableBody>
                {graphSummary.map((g: Record<string, any>) => (
                  <TableRow key={g.id}>
                    <TableCell>{g.label}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{g.node_type}</Badge></TableCell>
                    <TableCell>{g.edge_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {nodes.length === 0 && identities.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No account graph data. Connect providers to populate.</CardContent></Card>
      )}
    </div>
  );
}
