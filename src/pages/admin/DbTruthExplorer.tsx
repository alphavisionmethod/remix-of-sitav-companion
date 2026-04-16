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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schema">Schema ({filteredTables.length})</TabsTrigger>
          <TabsTrigger value="rls">RLS Coverage</TabsTrigger>
          <TabsTrigger value="tenancy">Tenancy</TabsTrigger>
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
