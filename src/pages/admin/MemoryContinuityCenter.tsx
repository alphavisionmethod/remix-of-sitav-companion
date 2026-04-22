import { useState } from "react";
import CPSSubNav from "@/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Eye, Shield, Clock, Layers, RefreshCw, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fetchScopedMemory, getScopedMemoryStats, forgetScopedMemory, type PersistedScopedMemory } from "@/data/persistence";
import { DEMO_ADMIN_SCOPES_MEMORY_CONTINUITY_CENTER as DEMO_SCOPES, DEMO_PRIVACY_TIERS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function PrivacyBadge({ tier }: { tier: string }) {
  const c: Record<string, string> = { restricted: "bg-red-500/20 text-red-400", confidential: "bg-amber-500/20 text-amber-400", internal: "bg-blue-500/20 text-blue-400", public: "bg-emerald-500/20 text-emerald-400" };
  return <Badge className={`text-[10px] ${c[tier] ?? c.public}`}>{tier}</Badge>;
}

export default function MemoryContinuityCenter() {
  const { isDemoMode } = useDataMode();
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [privacyFilter, setPrivacyFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<PersistedScopedMemory | null>(null);

  const { data: stats } = useQuery({ queryKey: ["mem-stats"], queryFn: getScopedMemoryStats, staleTime: 30000 });
  const { data: entries = [], refetch } = useQuery({
    queryKey: ["mem-entries", scopeFilter, privacyFilter],
    queryFn: () => fetchScopedMemory({
      scope: scopeFilter !== "all" ? scopeFilter as never : undefined,
      privacyTier: privacyFilter !== "all" ? privacyFilter : undefined,
      limit: 200,
    }),
    staleTime: 15000,
  });

  const handleForget = async (id: string) => {
    await forgetScopedMemory(id, "Admin removal", "operator");
    setSelectedEntry(null);
    refetch();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Memory Continuity Center</h1>
          <Badge>{stats?.total ?? 0} entries</Badge>
        </motion.div>

        {/* Scope Summary Cards */}
        <motion.div variants={fade} className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(stats?.byScope ?? {}).map(([scope, count]) => (
            <Card key={scope} className="border-border/50 bg-card/50 cursor-pointer hover:border-primary/30" onClick={() => setScopeFilter(scope)}>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-foreground">{count as number}</p>
                <p className="text-xs text-muted-foreground capitalize">{scope}</p>
              </CardContent>
            </Card>
          ))}
          {Object.keys(stats?.byScope ?? {}).length === 0 && (
            <Card className="col-span-full border-border/50 bg-card/50"><CardContent className="p-4 text-center text-xs text-muted-foreground">No scoped memory persisted yet</CardContent></Card>
          )}
        </motion.div>

        {/* Privacy Tier Distribution */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Privacy Distribution</CardTitle></CardHeader>
            <CardContent className="flex gap-6">
              {(isDemoMode ? DEMO_PRIVACY_TIERS : [] as unknown as typeof DEMO_PRIVACY_TIERS).map(tier => {
                const count = (stats?.byPrivacy?.[tier] as number) ?? 0;
                const pct = stats?.total ? (count / stats.total) * 100 : 0;
                return (
                  <div key={tier} className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <PrivacyBadge tier={tier} />
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fade} className="flex gap-3">
          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Scope" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              {(isDemoMode ? DEMO_SCOPES : [] as unknown as typeof DEMO_SCOPES).map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Privacy" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Privacy</SelectItem>
              {(isDemoMode ? DEMO_PRIVACY_TIERS : [] as unknown as typeof DEMO_PRIVACY_TIERS).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
        </motion.div>

        {/* Memory Table */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border/50 text-muted-foreground">
                  <th className="p-3 text-left">Key</th>
                  <th className="p-3 text-left">Scope</th>
                  <th className="p-3 text-left">Privacy</th>
                  <th className="p-3 text-left">Confidence</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Domain</th>
                  <th className="p-3 text-left">Updated</th>
                </tr></thead>
                <tbody>
                  {entries.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No memory entries</td></tr>}
                  {entries.map(e => (
                    <tr key={e.id} className="border-b border-border/20 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedEntry(e)}>
                      <td className="p-3 font-mono">{e.key}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px] capitalize">{e.memory_scope}</Badge></td>
                      <td className="p-3"><PrivacyBadge tier={e.privacy_tier} /></td>
                      <td className="p-3"><Progress value={Number(e.confidence) * 100} className="h-2 w-16" /></td>
                      <td className="p-3 text-muted-foreground">{e.source}</td>
                      <td className="p-3 text-muted-foreground">{e.domain ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{new Date(e.updated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail Drawer */}
        {selectedEntry && (
          <motion.div variants={fade}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Memory: {selectedEntry.key}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleForget(selectedEntry.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Forget
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)}>✕</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Scope:</span> <Badge variant="outline" className="text-[10px]">{selectedEntry.memory_scope}</Badge></div>
                  <div><span className="text-muted-foreground">Privacy:</span> <PrivacyBadge tier={selectedEntry.privacy_tier} /></div>
                  <div><span className="text-muted-foreground">Confidence:</span> {(Number(selectedEntry.confidence) * 100).toFixed(0)}%</div>
                  <div><span className="text-muted-foreground">Retention:</span> {selectedEntry.retention_class}</div>
                  <div><span className="text-muted-foreground">Tags:</span> {selectedEntry.tags?.join(", ") || "—"}</div>
                  <div><span className="text-muted-foreground">Entity:</span> {selectedEntry.entity_id ?? "—"}</div>
                  {selectedEntry.superseded_by && <div><span className="text-muted-foreground">Superseded by:</span> <span className="font-mono">{selectedEntry.superseded_by.slice(0, 8)}</span></div>}
                  {selectedEntry.expires_at && <div><span className="text-muted-foreground">Expires:</span> {new Date(selectedEntry.expires_at).toLocaleString()}</div>}
                </div>
                <div>
                  <span className="text-muted-foreground">Value:</span>
                  <pre className="mt-1 p-2 bg-muted/30 rounded text-[10px] overflow-auto max-h-40">{JSON.stringify(selectedEntry.value, null, 2)}</pre>
                </div>
                {selectedEntry.provenance && (
                  <div>
                    <span className="text-muted-foreground">Provenance:</span>
                    <pre className="mt-1 p-2 bg-muted/30 rounded text-[10px] overflow-auto max-h-20">{JSON.stringify(selectedEntry.provenance, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
