import { useState } from "react";
import {
  Library, Search, Filter, RefreshCw, Shield, AlertTriangle,
  Clock, CheckCircle, XCircle, Eye, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_INTEL_ASSETS as DEMO_ASSETS } from "@/lib/demo-data/admin-intelligence";

const [selectedAsset, setSelectedAsset] = [null as typeof DEMO_ASSETS[0] | null, (_: typeof DEMO_ASSETS[0] | null) => {}];

const verificationColors: Record<string, string> = {
  verified: "text-emerald-400",
  pending: "text-amber-400",
  stale: "text-rose-400",
  invalidated: "text-muted-foreground",
};

const IntelligenceAssetLibrary = () => {
  const { isAdmin, loading } = useRequireAdmin();
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  if (loading || !isAdmin) return null;

  const filtered = DEMO_ASSETS.filter(a => {
    if (filterDomain !== "all" && a.domain !== filterDomain) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const domains = [...new Set(DEMO_ASSETS.map(a => a.domain))];
  const types = [...new Set(DEMO_ASSETS.map(a => a.type))];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
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
                <TableRow key={a.id} className="cursor-pointer hover:bg-secondary/30">
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
              DEMO_ASSETS.flatMap(a => a.invalidationTriggers).reduce<Record<string, number>>((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {})
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
              DEMO_ASSETS.reduce<Record<string, { count: number; totalSavings: number }>>((acc, a) => {
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
    </div>
  );
};

export default IntelligenceAssetLibrary;
