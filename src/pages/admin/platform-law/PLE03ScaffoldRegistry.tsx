import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cpu, Search, CheckCircle, Clock, Archive, FileCode, XCircle } from "lucide-react";
import { SCAFFOLD_REGISTRY, type ScaffoldEntry } from "@/lib/platform-law/platform-law-registry";

const PLE03ScaffoldRegistry = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "planned" | "deprecated">("all");
  const [selected, setSelected] = useState<ScaffoldEntry | null>(null);

  const filtered = useMemo(() => {
    return SCAFFOLD_REGISTRY.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.scriptPath.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter]);

  const avgCoverage = Math.round(SCAFFOLD_REGISTRY.reduce((s, g) => s + g.complianceCoverage, 0) / SCAFFOLD_REGISTRY.length);
  const totalProduced = SCAFFOLD_REGISTRY.reduce((s, g) => s + g.produces.length, 0);
  const withManifests = SCAFFOLD_REGISTRY.filter(s => s.includesManifests).length;
  const withContracts = SCAFFOLD_REGISTRY.filter(s => s.includesContracts).length;

  const includesFlags: { key: keyof ScaffoldEntry; label: string }[] = [
    { key: "includesManifests", label: "Manifests" },
    { key: "includesContracts", label: "Contracts" },
    { key: "includesTests", label: "Tests" },
    { key: "includesProbeScaffold", label: "Probes" },
    { key: "includesRouteShellBinding", label: "Route/Shell" },
    { key: "includesHelpRegistration", label: "Help" },
    { key: "includesCommandRegistration", label: "Command" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Cpu className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Scaffold & Generator Registry</h1>
          <p className="text-sm text-muted-foreground">{SCAFFOLD_REGISTRY.length} generators · {totalProduced} artifacts · {avgCoverage}% avg coverage · {withManifests} include manifests</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Generators", value: SCAFFOLD_REGISTRY.length, icon: Cpu, color: "text-blue-400" },
          { label: "With Manifests", value: withManifests, icon: FileCode, color: "text-purple-400" },
          { label: "With Contracts", value: withContracts, icon: FileCode, color: "text-cyan-400" },
          { label: "Avg Coverage", value: `${avgCoverage}%`, icon: CheckCircle, color: avgCoverage >= 85 ? "text-emerald-400" : "text-amber-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
            <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Artifact Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Archive className="h-4 w-4" /> Artifact Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const allArtifacts = Array.from(new Set(SCAFFOLD_REGISTRY.flatMap(s => s.produces))).sort();
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr><th className="text-left p-1 text-muted-foreground">Generator</th>{allArtifacts.map(a => <th key={a} className="p-1 text-center text-muted-foreground">{a.replace(/-/g, " ")}</th>)}</tr></thead>
                  <tbody>{SCAFFOLD_REGISTRY.map(s => (
                    <tr key={s.id} className="border-t border-border/30">
                      <td className="p-1 font-medium">{s.name}</td>
                      {allArtifacts.map(a => <td key={a} className="p-1 text-center">{s.produces.includes(a) ? <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Drift Warnings */}
      {SCAFFOLD_REGISTRY.filter(s => s.complianceCoverage < 80).length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><XCircle className="h-4 w-4 text-amber-400" /> Drift Warnings (Coverage &lt; 80%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {SCAFFOLD_REGISTRY.filter(s => s.complianceCoverage < 80).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded bg-amber-500/10 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    <Badge variant="outline" className="text-[10px]">{s.domain}</Badge>
                  </div>
                  <span className="text-amber-400 font-mono text-xs">{s.complianceCoverage}% coverage</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adoption Rate KPI */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Generator Adoption Rate</div>
              <div className="text-[10px] text-muted-foreground">{SCAFFOLD_REGISTRY.filter(s => s.status === "active").length} active of {SCAFFOLD_REGISTRY.length} total</div>
            </div>
            <div className={`text-2xl font-bold ${Math.round((SCAFFOLD_REGISTRY.filter(s => s.status === "active").length / SCAFFOLD_REGISTRY.length) * 100) >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
              {Math.round((SCAFFOLD_REGISTRY.filter(s => s.status === "active").length / SCAFFOLD_REGISTRY.length) * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search generators..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Generator</TableHead>
                  <TableHead className="w-20">Domain</TableHead>
                  <TableHead className="w-16">Status</TableHead>
                  <TableHead className="w-20 text-right">Coverage</TableHead>
                  <TableHead className="w-16">Version</TableHead>
                  <TableHead className="w-16 text-right">Outputs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(s)}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[250px]">{s.description}</div>
                    </TableCell>
                    <TableCell className="text-xs">{s.domain}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : s.status === "planned" ? "secondary" : "outline"} className="text-[10px]">
                        {s.status === "active" && <CheckCircle className="h-2.5 w-2.5 mr-1" />}
                        {s.status === "planned" && <Clock className="h-2.5 w-2.5 mr-1" />}
                        {s.status === "deprecated" && <Archive className="h-2.5 w-2.5 mr-1" />}
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.complianceCoverage >= 85 ? "bg-emerald-500" : s.complianceCoverage >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.complianceCoverage}%` }} />
                        </div>
                        <span className="text-xs font-mono">{s.complianceCoverage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.version}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{s.produces.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{selected.id} — {selected.name}</CardTitle>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{selected.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div><span className="text-muted-foreground text-xs">Script Path</span><div className="font-mono text-xs">{selected.scriptPath}</div></div>
              <div><span className="text-muted-foreground text-xs">Domain</span><div>{selected.domain}</div></div>
              <div><span className="text-muted-foreground text-xs">Version</span><div className="font-mono">{selected.version}</div></div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Produces</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selected.produces.map(p => <Badge key={p} variant="outline" className="text-[10px] font-mono">{p}</Badge>)}
              </div>
            </div>
            {/* Includes Checklist */}
            <div>
              <span className="text-muted-foreground text-xs">Compliance Includes</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                {includesFlags.map(f => {
                  const val = selected[f.key] as boolean;
                  return (
                    <div key={f.key} className={`flex items-center gap-1.5 text-xs p-1.5 rounded ${val ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/30 text-muted-foreground"}`}>
                      {val ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {f.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PLE03ScaffoldRegistry;