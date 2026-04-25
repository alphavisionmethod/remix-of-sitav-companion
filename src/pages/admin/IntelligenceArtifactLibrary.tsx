import { useState } from "react";
import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, RefreshCw, Recycle, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fetchIntelligenceAssets, getAssetStats, invalidateAsset, type IntelligenceAssetRow } from "@/data/persistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function IntelligenceArtifactLibrary() {
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showInvalidated, setShowInvalidated] = useState(false);
  const [selected, setSelected] = useState<IntelligenceAssetRow | null>(null);

  const { data: stats } = useQuery({ queryKey: ["intel-stats"], queryFn: getAssetStats, staleTime: 30000 });
  const { data: assets = [], refetch } = useQuery({
    queryKey: ["intel-assets", domainFilter, typeFilter, showInvalidated],
    queryFn: () => fetchIntelligenceAssets({
      domain: domainFilter !== "all" ? domainFilter : undefined,
      asset_type: typeFilter !== "all" ? typeFilter : undefined,
      invalidated: showInvalidated ? undefined : false,
      limit: 200,
    }),
    staleTime: 15000,
  });

  const uniqueDomains = [...new Set(assets.map(a => a.domain))];
  const uniqueTypes = [...new Set(assets.map(a => a.asset_type))];

  const handleInvalidate = async (id: string) => {
    await invalidateAsset(id, "Invalidated by operator");
    setSelected(null);
    refetch();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Intelligence Artifact Library</h1>
          <Badge>{stats?.total ?? 0} assets</Badge>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fade} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/50 bg-card/50"><CardContent className="p-3 text-center">
            <Recycle className="h-5 w-5 text-primary mx-auto" />
            <p className="text-lg font-bold text-foreground mt-1">{stats?.totalReuses ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total Reuses</p>
          </CardContent></Card>
          <Card className="border-border/50 bg-card/50"><CardContent className="p-3 text-center">
            <DollarSign className="h-5 w-5 text-emerald-400 mx-auto" />
            <p className="text-lg font-bold text-foreground mt-1">${((stats?.totalCostAvoided ?? 0) / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Cost Avoided</p>
          </CardContent></Card>
          <Card className="border-border/50 bg-card/50"><CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 text-blue-400 mx-auto" />
            <p className="text-lg font-bold text-foreground mt-1">{((stats?.avgFreshness ?? 0) * 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Avg Freshness</p>
          </CardContent></Card>
          <Card className="border-border/50 bg-card/50"><CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />
            <p className="text-lg font-bold text-foreground mt-1">{stats?.invalidatedCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Invalidated</p>
          </CardContent></Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fade} className="flex flex-wrap gap-3">
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {uniqueDomains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={showInvalidated ? "default" : "outline"} size="sm" onClick={() => setShowInvalidated(!showInvalidated)}>
            {showInvalidated ? "Showing Invalidated" : "Hide Invalidated"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
        </motion.div>

        {/* Asset Grid */}
        <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {assets.length === 0 && <Card className="col-span-full border-border/50 bg-card/50"><CardContent className="p-8 text-center text-xs text-muted-foreground">No intelligence assets found</CardContent></Card>}
          {assets.map(asset => (
            <Card key={asset.id} className={`border-border/50 bg-card/50 cursor-pointer hover:border-primary/30 ${asset.invalidated ? "opacity-50" : ""}`} onClick={() => setSelected(asset)}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-foreground">{asset.title}</p>
                  {asset.invalidated && <Badge variant="destructive" className="text-[10px]">invalidated</Badge>}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">{asset.asset_type}</Badge>
                  <Badge variant="outline" className="text-[10px]">{asset.domain}</Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Reused {asset.reuse_count}x</span>
                  <span>Confidence {(asset.confidence * 100).toFixed(0)}%</span>
                </div>
                <Progress value={asset.freshness_score * 100} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">{asset.evidence_grade} grade · Freshness {(asset.freshness_score * 100).toFixed(0)}%</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Detail Drawer */}
        {selected && (
          <motion.div variants={fade}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{selected.title}</CardTitle>
                  <div className="flex gap-2">
                    {!selected.invalidated && (
                      <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleInvalidate(selected.id)}>Invalidate</Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Type:</span> {selected.asset_type}</div>
                  <div><span className="text-muted-foreground">Domain:</span> {selected.domain}</div>
                  <div><span className="text-muted-foreground">Confidence:</span> {(selected.confidence * 100).toFixed(0)}%</div>
                  <div><span className="text-muted-foreground">Evidence Grade:</span> {selected.evidence_grade}</div>
                  <div><span className="text-muted-foreground">Reuses:</span> {selected.reuse_count} ({selected.adapted_reuse_count} adapted)</div>
                  <div><span className="text-muted-foreground">Cost Avoided:</span> ${(selected.cost_avoided_cents / 100).toFixed(2)}</div>
                  <div><span className="text-muted-foreground">Freshness:</span> {(selected.freshness_score * 100).toFixed(0)}%</div>
                  <div><span className="text-muted-foreground">Decay Rate:</span> {selected.decay_rate}</div>
                  <div><span className="text-muted-foreground">Tags:</span> {selected.tags?.join(", ") || "—"}</div>
                  <div><span className="text-muted-foreground">Source Mission:</span> <span className="font-mono">{selected.source_mission_id?.slice(0, 8) ?? "—"}</span></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Content:</span>
                  <pre className="mt-1 p-2 bg-muted/30 rounded text-[10px] overflow-auto max-h-40">{JSON.stringify(selected.content, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
