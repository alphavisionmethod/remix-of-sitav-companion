import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Shield, GitMerge, Eye, Settings, FileText, Layout, Bell, Smartphone } from "lucide-react";
import { namespaceRegistry, type SyncNamespace } from "@/lib/sync-engine/sync-namespaces";
import { syncPolicy } from "@/lib/sync-engine/security/sync-policy";
import { toast } from "sonner";

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-amber-500/20 text-amber-400",
  medium: "bg-blue-500/20 text-blue-400",
  low: "bg-muted text-muted-foreground",
  background: "bg-muted/50 text-muted-foreground/60",
};

const categoryIcons: Record<string, React.ElementType> = {
  files: FileText, settings: Settings, app: Layout,
  session: Layout, device: Smartphone, system: Settings, notification: Bell,
};

export function CloudNamespacesAdmin() {
  const [selectedNs, setSelectedNs] = useState<SyncNamespace | null>(null);

  const namespaces = namespaceRegistry.getAllNamespaces();
  const policies = syncPolicy.getRules();

  const nsByCategory = namespaces.reduce((acc, ns) => {
    const cat = ns.id.split(".")[0];
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ns);
    return acc;
  }, {} as Record<string, SyncNamespace[]>);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Namespaces", value: namespaces.length, color: "bg-primary/10" },
          { label: "Categories", value: Object.keys(nsByCategory).length, color: "bg-blue-500/10" },
          { label: "App Namespaces", value: namespaces.filter(n => n.id.startsWith("app.")).length, color: "bg-purple-500/10" },
          { label: "Active Policies", value: policies.filter(p => p.enforced).length, color: "bg-emerald-500/10" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg p-3 ${color}`}>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Namespaces by Category */}
      {Object.entries(nsByCategory).map(([category, nsList]) => {
        const CatIcon = categoryIcons[category] || Layers;
        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 capitalize">
                <CatIcon className="h-4 w-4 text-primary" /> {category} ({nsList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namespace</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Conflict Strategy</TableHead>
                    <TableHead>Encryption</TableHead>
                    <TableHead>Selective</TableHead>
                    <TableHead className="w-[80px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nsList.map(ns => (
                    <TableRow key={ns.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedNs(ns)}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium font-mono">{ns.id}</p>
                          <p className="text-xs text-muted-foreground">{ns.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${priorityColors[ns.defaultPriority]}`}>{ns.defaultPriority}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <GitMerge className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">{ns.conflictStrategy}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">{ns.defaultEncryptionClass}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ns.policyFlags.allowSelectiveSync
                          ? <Badge variant="default" className="text-[10px]">Yes</Badge>
                          : <Badge variant="outline" className="text-[10px]">No</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* Detail Panel */}
      {selectedNs && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 font-mono">
                <Layers className="h-4 w-4 text-primary" /> {selectedNs.id}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNs(null)}>×</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedNs.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Priority</p><p>{selectedNs.defaultPriority}</p></div>
              <div><p className="text-xs text-muted-foreground">Conflict Strategy</p><p>{selectedNs.conflictStrategy}</p></div>
              <div><p className="text-xs text-muted-foreground">Encryption</p><p>{selectedNs.defaultEncryptionClass}</p></div>
              <div><p className="text-xs text-muted-foreground">Max Object Size</p><p>{selectedNs.maxObjectSizeBytes ? `${Math.round(selectedNs.maxObjectSizeBytes / 1024 / 1024)}MB` : "Unlimited"}</p></div>
              <div><p className="text-xs text-muted-foreground">TTL</p><p>{selectedNs.ttlSeconds ? `${selectedNs.ttlSeconds}s` : "None"}</p></div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Policy Flags</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedNs.policyFlags).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/20 border border-border/30">
                    <span className="text-xs">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <Switch checked={val as boolean} disabled className="scale-75" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
