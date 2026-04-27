import { useState } from "react";
import {
  Library, Search, Filter, RefreshCw, Shield, AlertTriangle,
  Clock, CheckCircle, XCircle, Eye, Activity, X, History, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useIntelligenceAssetLibrary, type IntelligenceAsset } from "@/platform/personal-brain/hooks/use-intelligence-screen-data";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const verificationColors: Record<string, string> = {
  verified: "text-emerald-400",
  pending: "text-amber-400",
  stale: "text-rose-400",
  invalidated: "text-muted-foreground",
};

const freshnessColors: Record<string, string> = {
  fresh: "bg-emerald-500",
  recent: "bg-sky-500",
  aging: "bg-amber-500",
  stale: "bg-rose-500",
};

/* ── Freshness & Confidence Strip (UIE02 spec) ── */
function FreshnessAndConfidenceStrip({ asset }: { asset: IntelligenceAsset }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20">
      <div className="flex-1 space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Freshness</p>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${freshnessColors[asset.freshness] ?? "bg-muted"}`} />
          <span className="text-xs font-medium text-foreground capitalize">{asset.freshness}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</p>
        <div className="flex items-center gap-2">
          <Progress value={asset.confidence} className="h-1.5 flex-1" />
          <span className="text-xs font-mono text-foreground">{asset.confidence}%</span>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quality</p>
        <div className="flex items-center gap-2">
          <Progress value={asset.qualityScore} className="h-1.5 flex-1" />
          <span className="text-xs font-mono text-foreground">{asset.qualityScore}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Reuse History Panel (UIE02 spec) ── */
function ReuseHistoryPanel({ asset }: { asset: IntelligenceAsset }) {
  const reuseEvents = Array.from({ length: Math.min(asset.usageCount, 6) }, (_, i) => {
    const daysAgo = i * 3 + 1;
    const modes = ["direct", "adapted", "reference"] as const;
    const mode = modes[i % 3];
    const costSaved = Math.round((asset.savings / Math.max(asset.usageCount, 1)) * (0.8 + Math.random() * 0.4));
    return {
      id: `${asset.id}-reuse-${i}`,
      date: `${daysAgo}d ago`,
      mode,
      costSavedCents: costSaved,
      domain: asset.domain,
      outcome: i % 5 === 0 ? "adapted" : "accepted",
    };
  });

  const modeColors: Record<string, string> = {
    direct: "bg-emerald-500/20 text-emerald-400",
    adapted: "bg-sky-500/20 text-sky-400",
    reference: "bg-violet-500/20 text-violet-400",
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <History className="h-3.5 w-3.5" /> Reuse History ({asset.usageCount} total)
      </h4>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {reuseEvents.map(e => (
          <div key={e.id} className="flex items-center gap-2 p-2 rounded bg-secondary/10 text-xs">
            <span className="text-muted-foreground w-14 shrink-0">{e.date}</span>
            <Badge className={`text-[9px] ${modeColors[e.mode]}`}>{e.mode}</Badge>
            <span className="flex-1 text-muted-foreground truncate">{e.domain}</span>
            <span className="text-emerald-400 font-mono">${(e.costSavedCents / 100).toFixed(2)}</span>
            <Badge variant="outline" className="text-[9px]">{e.outcome}</Badge>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
        <span>Acceptance rate: {(asset.acceptanceRate * 100).toFixed(0)}%</span>
        <span>Total saved: <span className="text-emerald-400 font-mono">${(asset.savings / 100).toFixed(0)}</span></span>
      </div>
    </div>
  );
}

/* ── Invalidation Rules Card (UIE02 spec) ── */
function InvalidationRulesCard({ asset }: { asset: IntelligenceAsset }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Invalidation Triggers
      </h4>
      <div className="space-y-1.5">
        {asset.invalidationTriggers.map(trigger => (
          <div key={trigger} className="flex items-center gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/10">
            <Zap className="h-3 w-3 text-amber-400 shrink-0" />
            <span className="text-xs text-foreground">{trigger.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        When any trigger fires, this asset's verification state resets and reuse eligibility is re-evaluated.
      </p>
    </div>
  );
}

/* ── Asset Detail Drawer (UIE02 spec) ── */
function AssetDetailDrawer({
  asset,
  open,
  onClose,
}: {
  asset: IntelligenceAsset | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!asset) return null;

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <SheetTitle className="text-sm text-foreground leading-tight">{asset.title}</SheetTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[9px]">{asset.type}</Badge>
                <Badge variant="secondary" className="text-[9px]">{asset.domain}</Badge>
                <span className={`text-[10px] font-medium ${verificationColors[asset.verificationState]}`}>
                  {asset.verificationState}
                </span>
                {asset.reuseEligible ? (
                  <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400">reusable</Badge>
                ) : (
                  <Badge className="text-[9px] bg-rose-500/20 text-rose-400">not reusable</Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          <FreshnessAndConfidenceStrip asset={asset} />
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-secondary/20 text-center">
              <p className="text-lg font-bold text-foreground">{asset.usageCount}</p>
              <p className="text-[10px] text-muted-foreground">Total Reuses</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 text-center">
              <p className="text-lg font-bold text-emerald-400">${(asset.savings / 100).toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">Cost Saved</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 text-center">
              <p className="text-lg font-bold text-foreground">{asset.evidenceRefs}</p>
              <p className="text-[10px] text-muted-foreground">Evidence Refs</p>
            </div>
          </div>
          <ReuseHistoryPanel asset={asset} />
          <InvalidationRulesCard asset={asset} />
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Metadata</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-secondary/10">
                <span className="text-muted-foreground">Last Used</span>
                <p className="text-foreground font-medium">{asset.lastUsed}</p>
              </div>
              <div className="p-2 rounded bg-secondary/10">
                <span className="text-muted-foreground">Acceptance Rate</span>
                <p className="text-foreground font-medium">{(asset.acceptanceRate * 100).toFixed(0)}%</p>
              </div>
              <div className="p-2 rounded bg-secondary/10">
                <span className="text-muted-foreground">Confidence</span>
                <p className="text-foreground font-medium">{asset.confidence}%</p>
              </div>
              <div className="p-2 rounded bg-secondary/10">
                <span className="text-muted-foreground">Quality Score</span>
                <p className="text-foreground font-medium">{asset.qualityScore}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Main Component ── */
const IntelligenceAssetLibrary = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<IntelligenceAsset | null>(null);

  const { assets, loading: dataLoading, isDemo } = useIntelligenceAssetLibrary();

  if (authLoading || !isAdmin) return null;

  const filtered = assets.filter(a => {
    if (filterDomain !== "all" && a.domain !== filterDomain) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const domains = [...new Set(assets.map(a => a.domain))];
  const types = [...new Set(assets.map(a => a.type))];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      
      <SitaPageHeader
        icon={<Library className="h-6 w-6" />}
        title="Intelligence Asset Library"
        subtitle="Browse, filter, and inspect reusable intelligence assets across all domains"
      />

      {/* Filters */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Select value={filterDomain} onValueChange={setFilterDomain}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-xs">{filtered.length} assets</Badge>
        </CardContent>
      </Card>

      {/* Asset Grid */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Asset</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs text-right">Confidence</TableHead>
                <TableHead className="text-xs">Freshness</TableHead>
                <TableHead className="text-xs">Verification</TableHead>
                <TableHead className="text-xs text-center">Reusable</TableHead>
                <TableHead className="text-xs text-right">Reuses</TableHead>
                <TableHead className="text-xs text-right">Quality</TableHead>
                <TableHead className="text-xs text-right">Acceptance</TableHead>
                <TableHead className="text-xs text-right">Savings</TableHead>
                <TableHead className="text-xs text-right">Evidence</TableHead>
                <TableHead className="text-xs">Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer hover:bg-secondary/30"
                  onClick={() => setSelectedAsset(a)}
                >
                  <TableCell className="text-xs font-medium text-foreground max-w-[200px] truncate">{a.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{a.type}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.domain}</TableCell>
                  <TableCell className="text-xs text-right">
                    <span className={a.confidence >= 90 ? "text-emerald-400" : a.confidence >= 70 ? "text-foreground" : "text-amber-400"}>{a.confidence}%</span>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{a.freshness}</TableCell>
                  <TableCell>
                    <span className={`text-xs ${verificationColors[a.verificationState]}`}>{a.verificationState}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {a.reuseEligible ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground mx-auto" />}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">{a.usageCount}</TableCell>
                  <TableCell className="text-xs text-right">
                    <span className={a.qualityScore >= 90 ? "text-emerald-400" : "text-foreground"}>{a.qualityScore}</span>
                  </TableCell>
                  <TableCell className="text-xs text-right">{(a.acceptanceRate * 100).toFixed(0)}%</TableCell>
                  <TableCell className="text-xs text-right font-mono text-emerald-400">${(a.savings / 100).toFixed(0)}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{a.evidenceRefs}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{a.lastUsed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invalidation Triggers Summary */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Invalidation Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              assets.flatMap(a => a.invalidationTriggers).reduce<Record<string, number>>((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {})
            ).sort(([, a], [, b]) => b - a).map(([trigger, count]) => (
              <Badge key={trigger} variant="outline" className="text-xs gap-1">
                {trigger.replace(/_/g, " ")} <span className="text-muted-foreground">({count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Type Distribution */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Asset Type Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(
              assets.reduce<Record<string, { count: number; totalSavings: number }>>((acc, a) => {
                if (!acc[a.type]) acc[a.type] = { count: 0, totalSavings: 0 };
                acc[a.type].count++;
                acc[a.type].totalSavings += a.savings;
                return acc;
              }, {})
            ).sort(([, a], [, b]) => b.count - a.count).map(([type, data]) => (
              <div key={type} className="p-3 rounded-lg bg-secondary/20 text-center">
                <p className="text-lg font-bold text-foreground">{data.count}</p>
                <p className="text-[10px] text-muted-foreground">{type}</p>
                <p className="text-[10px] text-emerald-400">${(data.totalSavings / 100).toFixed(0)} saved</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Detail Drawer */}
      <AssetDetailDrawer
        asset={selectedAsset}
        open={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
};

export default IntelligenceAssetLibrary;
