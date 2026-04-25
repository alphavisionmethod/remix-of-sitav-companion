import RCPSubNav from "@/platform/admin/components/admin/RCPSubNav";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { CONTRACT_READINESS, getContractReadinessStats } from "@/runtimes/reality/reality-audit-registry";

const Indicator = ({ ok }: { ok: boolean }) => ok
  ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
  : <XCircle className="h-3.5 w-3.5 text-red-400" />;

const RCP08ContractReadiness = () => {
  const stats = useMemo(() => getContractReadinessStats(), []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><FileCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Contract & Backend Readiness</h1>
          <p className="text-sm text-muted-foreground">Whether mock-backed pages have real backend targets ready</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total Contracts", value: stats.total, color: "text-blue-400" },
          { label: "Fully Ready", value: stats.fullyReady, color: stats.fullyReady > 0 ? "text-emerald-400" : "text-muted-foreground" },
          { label: "Partially Ready", value: stats.partiallyReady, color: "text-amber-400" },
          { label: "Not Ready", value: stats.notReady, color: stats.notReady > 0 ? "text-red-400" : "text-emerald-400" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* BackendReadinessMatrix */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead className="w-24">Domain</TableHead>
                  <TableHead className="w-16">Contract</TableHead>
                  <TableHead className="w-16">Endpoint</TableHead>
                  <TableHead className="w-16">Edge Fn</TableHead>
                  <TableHead className="w-16">Schema</TableHead>
                  <TableHead className="w-16">Query</TableHead>
                  <TableHead className="w-16">Mutation</TableHead>
                  <TableHead>Gap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CONTRACT_READINESS.map(c => {
                  const readyCount = [c.contractExists, c.endpointExists, c.edgeFunctionExists, c.schemaExists, c.queryReady, c.mutationReady].filter(Boolean).length;
                  return (
                    <TableRow key={c.id} className={readyCount === 6 ? "bg-emerald-500/5" : readyCount === 0 ? "bg-red-500/5" : ""}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{c.contractName}</div>
                        <div className="text-[10px] text-muted-foreground">For: {c.expectedFor.join(", ")}</div>
                      </TableCell>
                      <TableCell className="text-xs capitalize">{c.domain}</TableCell>
                      <TableCell><Indicator ok={c.contractExists} /></TableCell>
                      <TableCell><Indicator ok={c.endpointExists} /></TableCell>
                      <TableCell><Indicator ok={c.edgeFunctionExists} /></TableCell>
                      <TableCell><Indicator ok={c.schemaExists} /></TableCell>
                      <TableCell><Indicator ok={c.queryReady} /></TableCell>
                      <TableCell><Indicator ok={c.mutationReady} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">{c.gapDescription}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ContractGapPanel */}
      <Card className="border-red-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Contracts Blocking Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CONTRACT_READINESS.filter(c => c.blocksFeatures.length > 0).map(c => (
              <div key={c.id} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.contractName}</span>
                  <span className="capitalize text-xs text-muted-foreground">{c.domain}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.gapDescription}</p>
                <div className="flex gap-1 mt-1">
                  {c.blocksFeatures.map(f => <Badge key={f} variant="outline" className="text-[9px]">{f}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* EndpointStatusStrip */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Readiness Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {([
              { count: stats.fullyReady, label: "Ready", bg: "bg-emerald-500" },
              { count: stats.partiallyReady, label: "Partial", bg: "bg-amber-500" },
              { count: stats.notReady, label: "Not Ready", bg: "bg-red-500" },
            ]).map(seg => {
              const pct = (seg.count / stats.total) * 100;
              return pct > 0 ? (
                <div key={seg.label} className={`${seg.bg} flex items-center justify-center text-xs font-bold text-foreground`} style={{ width: `${pct}%` }}>
                  {seg.count}
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RCP08ContractReadiness;
