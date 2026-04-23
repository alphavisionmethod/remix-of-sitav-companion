import RCPSubNav from "@/components/admin/RCPSubNav";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCode, AlertTriangle, ShieldAlert, Ban } from "lucide-react";
import { SOURCE_INVENTORY, getMockSourceStats, type PromiseSeverity } from "@/runtimes/reality/reality-audit-registry";

const critColors: Record<PromiseSeverity, string> = {
  critical: "text-red-400 bg-red-500/10",
  high: "text-amber-400 bg-amber-500/10",
  medium: "text-blue-400 bg-blue-500/10",
  low: "text-muted-foreground bg-muted/30",
};

const RCP05MockSourceInventory = () => {
  const stats = useMemo(() => getMockSourceStats(), []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><FileCode className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Mock Source Inventory</h1>
          <p className="text-sm text-muted-foreground">Complete inventory of mock/demo/hardcoded sources in production paths</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total Sources", value: stats.total, color: "text-blue-400" },
          { label: "Forbidden", value: stats.forbidden, color: stats.forbidden > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Critical", value: stats.critical, color: stats.critical > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Total Usages", value: stats.totalUsage, color: "text-amber-400" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* ForbiddenUsageWarnings */}
      {stats.forbidden > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Ban className="h-4 w-4 text-red-400" /> Forbidden Mock Sources ({stats.forbidden})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {SOURCE_INVENTORY.filter(s => s.forbidden).map(s => (
                <div key={s.id} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{s.sourcePath}</span>
                    <Badge variant="destructive" className="text-[9px]">FORBIDDEN</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.sourceDescription}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">Used by:</span>
                    {s.importedByPages.slice(0, 3).map(p => <Badge key={p} variant="outline" className="text-[9px]">{p}</Badge>)}
                    {s.importedByPages.length > 3 && <Badge variant="secondary" className="text-[9px]">+{s.importedByPages.length - 3}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MockSourceTable */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Source Path</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-16">Uses</TableHead>
                  <TableHead className="w-24">Criticality</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead>Domains</TableHead>
                  <TableHead>Replacement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SOURCE_INVENTORY.map(s => (
                  <TableRow key={s.id} className={s.forbidden ? "bg-red-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{s.sourcePath}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{s.sourceDescription}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{s.type}</Badge></TableCell>
                    <TableCell className="text-center font-bold">{s.usageCount}</TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded ${critColors[s.criticality]}`}>{s.criticality}</span></TableCell>
                    <TableCell>
                      {s.forbidden
                        ? <ShieldAlert className="h-4 w-4 text-red-400" />
                        : <span className="text-[10px] text-emerald-400">Allowed</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">{s.domainsAffected.map(d => <Badge key={d} variant="secondary" className="text-[9px] capitalize">{d}</Badge>)}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{s.replacementTarget}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DomainImpactPanel */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Domain Impact</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from(new Set(SOURCE_INVENTORY.flatMap(s => s.domainsAffected))).map(domain => {
              const sources = SOURCE_INVENTORY.filter(s => s.domainsAffected.includes(domain));
              const forbidden = sources.filter(s => s.forbidden).length;
              return (
                <div key={domain} className={`p-3 rounded-lg border ${forbidden > 0 ? "border-red-500/20 bg-red-500/5" : "border-border/50"}`}>
                  <div className="capitalize font-medium text-sm">{domain}</div>
                  <div className="text-xs text-muted-foreground mt-1">{sources.length} sources · {forbidden} forbidden</div>
                  <div className="text-xs text-muted-foreground">{sources.reduce((s, src) => s + src.usageCount, 0)} total usages</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RCP05MockSourceInventory;
