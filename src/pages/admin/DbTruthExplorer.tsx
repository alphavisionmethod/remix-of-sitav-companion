import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DB_SCHEMA_REGISTRY } from "@/lib/db/schema-registry";
import { RLS_POLICY_REGISTRY, RLS_STATS } from "@/lib/db/rls-policy-registry";
import { TENANCY_BOUNDARY_MAP, TENANCY_STATS } from "@/lib/db/tenancy-boundary-map";
import { MIGRATION_REGISTRY, MIGRATION_STATS } from "@/lib/db/migration-registry";
import { TABLE_WRITER_READER_MAP, tableWriterReaderStats } from "@/lib/db/table-writer-reader-map";

export default function DbTruthExplorer() {
  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    const q = search.toLowerCase();
    return DB_SCHEMA_REGISTRY.filter(t => !q || t.name.includes(q) || t.domain.includes(q));
  }, [search]);

  const filteredMigrations = useMemo(() => {
    const q = search.toLowerCase();
    return MIGRATION_REGISTRY.filter(m => !q || m.filename.includes(q) || m.boundedContext.includes(q) || m.category.includes(q));
  }, [search]);

  const driftRows = useMemo(() => {
    const issues: Array<{ table: string; issue: string; severity: "warning" | "error" }> = [];
    for (const t of DB_SCHEMA_REGISTRY) {
      if (!RLS_POLICY_REGISTRY[t.name]) {
        issues.push({ table: t.name, issue: "Missing from RLS registry", severity: "error" });
      }
      if (!TENANCY_BOUNDARY_MAP[t.name]) {
        issues.push({ table: t.name, issue: "Missing from tenancy map", severity: "error" });
      }
      const rls = RLS_POLICY_REGISTRY[t.name];
      if (rls && rls.policyCount === 0) {
        issues.push({ table: t.name, issue: "Zero RLS policies", severity: "warning" });
      }
    }
    return issues;
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DB Truth Explorer</h1>
        <p className="text-muted-foreground">Schema · RLS · Tenancy · Migrations · Drift</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tables</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{DB_SCHEMA_REGISTRY.length}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Policies</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{RLS_STATS.totalPolicies}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Migrations</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{MIGRATION_STATS.total}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tenant-Scoped</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{TENANCY_STATS.total - TENANCY_STATS.byModel.global}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Drift Issues</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{driftRows.length}</CardContent></Card>
      </div>

      <Input placeholder="Search tables, migrations, domains..." value={search} onChange={e => setSearch(e.target.value)} />

      <Tabs defaultValue="schema">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="schema">Schema ({filteredTables.length})</TabsTrigger>
          <TabsTrigger value="rls">RLS Coverage</TabsTrigger>
          <TabsTrigger value="tenancy">Tenancy</TabsTrigger>
          <TabsTrigger value="writers">Writers/Readers</TabsTrigger>
          <TabsTrigger value="migrations">Migrations ({filteredMigrations.length})</TabsTrigger>
          <TabsTrigger value="drift">Drift Radar ({driftRows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="schema">
          <Card><CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background border-b">
                  <tr className="text-left"><th className="p-2">Table</th><th className="p-2">Domain</th><th className="p-2">Class</th><th className="p-2">Tenancy</th><th className="p-2">Policies</th><th className="p-2">Sensitive</th></tr>
                </thead>
                <tbody>
                  {filteredTables.map(t => (
                    <tr key={t.name} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">{t.name}</td>
                      <td className="p-2"><Badge variant="outline">{t.domain}</Badge></td>
                      <td className="p-2"><Badge variant="secondary">{t.schemaClass}</Badge></td>
                      <td className="p-2 font-mono text-xs">{t.tenancyColumn ?? "—"}</td>
                      <td className="p-2">{t.policyCount}</td>
                      <td className="p-2">{t.sensitiveData ? <Badge variant="destructive">PII</Badge> : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="rls">
          <Card><CardHeader><CardTitle>RLS Pattern Coverage</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(RLS_STATS.byPattern).map(([pat, count]) => (
                <div key={pat} className="flex justify-between p-3 border rounded">
                  <span className="font-mono text-sm">{pat}</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="tenancy">
          <Card><CardHeader><CardTitle>Tenancy Models</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(TENANCY_STATS.byModel).map(([m, count]) => (
                <div key={m} className="flex justify-between p-3 border rounded">
                  <span className="font-mono text-sm">{m}</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="writers">
          <Card><CardHeader><CardTitle>Table Writers / Readers (Phase 18.1)</CardTitle></CardHeader><CardContent className="p-0">
            {(() => {
              const stats = tableWriterReaderStats();
              const rows = Object.values(TABLE_WRITER_READER_MAP)
                .filter((e) => !search || e.table.includes(search.toLowerCase()) || e.domain.includes(search.toLowerCase()))
                .sort((a, b) => (b.unexemptedCrossDomainWriters.length - a.unexemptedCrossDomainWriters.length) || (b.crossDomainWriters.length - a.crossDomainWriters.length) || a.table.localeCompare(b.table));
              const sourceLabel = (s: { kind: string }) =>
                s.kind === "client-sdk" ? "client" : s.kind === "rpc" ? "rpc" : s.kind === "trigger" ? "trigger" : s.kind === "view-only" ? "view" : "system";
              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
                    <div className="p-3 border rounded"><div className="text-xs text-muted-foreground">Tables w/ writers</div><div className="text-xl font-bold">{stats.tablesWithWriters}</div></div>
                    <div className="p-3 border rounded"><div className="text-xs text-muted-foreground">Tables w/ readers</div><div className="text-xl font-bold">{stats.tablesWithReaders}</div></div>
                    <div className="p-3 border rounded"><div className="text-xs text-muted-foreground">No declared I/O</div><div className={`text-xl font-bold ${stats.tablesWithoutAnyIO > 0 ? "text-destructive" : ""}`}>{stats.tablesWithoutAnyIO}</div></div>
                    <div className="p-3 border rounded"><div className="text-xs text-muted-foreground">Cross-domain writers</div><div className="text-xl font-bold">{stats.crossDomainViolations}</div></div>
                    <div className="p-3 border rounded"><div className="text-xs text-muted-foreground">Unexempted</div><div className={`text-xl font-bold ${stats.unexemptedCrossDomainWriters > 0 ? "text-destructive" : ""}`}>{stats.unexemptedCrossDomainWriters}</div></div>
                  </div>
                  <ScrollArea className="h-[520px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background border-b">
                        <tr className="text-left"><th className="p-2">Table</th><th className="p-2">Owner</th><th className="p-2">Edge Writers</th><th className="p-2">Non-Edge Writers</th><th className="p-2">Readers</th><th className="p-2">Cross-Dom</th></tr>
                      </thead>
                      <tbody>
                        {rows.map((e) => {
                          const allReaders = [
                            ...e.readers.map((r) => ({ label: r, kind: "edge" as const })),
                            ...e.nonEdgeReaders.map((r) => ({ label: sourceLabel(r), kind: r.kind })),
                          ];
                          return (
                            <tr key={e.table} className="border-b hover:bg-muted/50 align-top">
                              <td className="p-2 font-mono text-xs">{e.table}</td>
                              <td className="p-2"><Badge variant="outline">{e.ownerTeam}</Badge></td>
                              <td className="p-2 text-xs">{e.writers.length === 0 ? <span className="text-muted-foreground">—</span> : e.writers.map((w) => (
                                <Badge key={w} variant={e.unexemptedCrossDomainWriters.includes(w) ? "destructive" : e.crossDomainWriters.includes(w) ? "default" : "secondary"} className="mr-1 mb-1 font-mono text-[10px]">{w}</Badge>
                              ))}</td>
                              <td className="p-2 text-xs">{e.nonEdgeWriters.length === 0 ? <span className="text-muted-foreground">—</span> : e.nonEdgeWriters.slice(0, 3).map((w, i) => (
                                <Badge key={i} variant="outline" className="mr-1 mb-1 font-mono text-[10px]">{sourceLabel(w)}</Badge>
                              ))}{e.nonEdgeWriters.length > 3 ? <span className="text-muted-foreground">+{e.nonEdgeWriters.length - 3}</span> : null}</td>
                              <td className="p-2 text-xs">{allReaders.length === 0 ? <span className="text-muted-foreground">—</span> : allReaders.slice(0, 4).map((r, i) => (
                                <Badge key={i} variant="outline" className="mr-1 mb-1 font-mono text-[10px]">{r.label}</Badge>
                              ))}{allReaders.length > 4 ? <span className="text-muted-foreground">+{allReaders.length - 4}</span> : null}</td>
                              <td className="p-2">{e.unexemptedCrossDomainWriters.length > 0 ? <Badge variant="destructive">{e.unexemptedCrossDomainWriters.length}!</Badge> : e.crossDomainWriters.length > 0 ? <Badge variant="default">{e.crossDomainWriters.length}✓</Badge> : <Badge variant="outline">0</Badge>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                </>
              );
            })()}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="migrations">
          <Card><CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background border-b">
                  <tr className="text-left"><th className="p-2">#</th><th className="p-2">Timestamp</th><th className="p-2">Category</th><th className="p-2">Domain</th><th className="p-2">Risk</th><th className="p-2">Tables</th></tr>
                </thead>
                <tbody>
                  {filteredMigrations.slice(0, 200).map(m => (
                    <tr key={m.filename} className="border-b hover:bg-muted/50">
                      <td className="p-2">{m.ordinal}</td>
                      <td className="p-2 font-mono text-xs">{m.timestamp}</td>
                      <td className="p-2"><Badge variant="outline">{m.category}</Badge></td>
                      <td className="p-2"><Badge variant="secondary">{m.boundedContext}</Badge></td>
                      <td className="p-2"><Badge variant={m.rollbackRisk === "critical" ? "destructive" : m.rollbackRisk === "high" ? "default" : "outline"}>{m.rollbackRisk}</Badge></td>
                      <td className="p-2 font-mono text-xs">{m.tablesAffected.slice(0, 2).join(", ")}{m.tablesAffected.length > 2 ? `+${m.tablesAffected.length - 2}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="drift">
          <Card><CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {driftRows.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">✅ No drift detected</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background border-b"><tr className="text-left"><th className="p-2">Table</th><th className="p-2">Issue</th><th className="p-2">Severity</th></tr></thead>
                  <tbody>
                    {driftRows.map((r, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 font-mono text-xs">{r.table}</td>
                        <td className="p-2">{r.issue}</td>
                        <td className="p-2"><Badge variant={r.severity === "error" ? "destructive" : "outline"}>{r.severity}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ScrollArea>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
