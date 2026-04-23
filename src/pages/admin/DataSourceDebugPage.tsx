import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DATA_SOURCE_REGISTRY, REGISTRY_STATS, type DataMode } from "@/lib/debug/page-data-source-registry";

const MODE_COLORS: Record<DataMode, string> = {
  live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  demo: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  mixed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  static: "bg-muted text-muted-foreground border-border",
};

type FilterMode = DataMode | "all";
type FilterType = "page" | "hook" | "component" | "all";

export default function DataSourceDebugPage() {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<FilterMode>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    return DATA_SOURCE_REGISTRY.filter((e) => {
      if (modeFilter !== "all" && e.mode !== modeFilter) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.path.toLowerCase().includes(q) ||
          e.tables.some((t) => t.toLowerCase().includes(q)) ||
          e.rpcs.some((r) => r.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, modeFilter, typeFilter]);

  const s = REGISTRY_STATS;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Data Source Debug"
        subtitle={`${s.totalFiles} files scanned · Generated ${new Date(s.generatedAt).toLocaleDateString()}`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Pages Total", value: s.pages.total },
          { label: "Pages Live", value: s.pages.live, color: "text-emerald-400" },
          { label: "Pages Demo", value: s.pages.demo, color: "text-amber-400" },
          { label: "Pages Mixed", value: s.pages.mixed, color: "text-rose-400" },
          { label: "Pages Static", value: s.pages.static },
          { label: "Unique Tables", value: s.uniqueTables, color: "text-blue-400" },
          { label: "Unique RPCs", value: s.uniqueRpcs, color: "text-purple-400" },
          { label: "Hooks (live)", value: s.hooks.live, color: "text-emerald-400" },
          { label: "Components (live)", value: s.components.live, color: "text-emerald-400" },
          { label: "Hooks Total", value: s.hooks.total },
          { label: "Components Total", value: s.components.total },
          { label: "Files Total", value: s.totalFiles },
        ].map((c) => (
          <Card key={c.label} className="bg-card/50">
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold ${c.color || "text-foreground"}`}>{c.value}</div>
              <div className="text-[11px] text-muted-foreground">{c.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search file path or table name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {(["all", "live", "demo", "mixed", "static"] as FilterMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                modeFilter === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "page", "hook", "component"] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <Card className="bg-card/50">
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">File Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Tables</TableHead>
                <TableHead>RPCs</TableHead>
                <TableHead className="text-right">Demo Refs</TableHead>
                <TableHead className="text-right">Live Queries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 200).map((e) => (
                <TableRow key={e.path}>
                  <TableCell className="font-mono text-xs truncate max-w-[400px]">{e.path}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${MODE_COLORS[e.mode]}`}>{e.mode}</Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {e.tables.length > 0 ? e.tables.join(", ") : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {e.rpcs.length > 0 ? e.rpcs.join(", ") : "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs">{e.demoCount || "—"}</TableCell>
                  <TableCell className="text-right text-xs">{e.liveQueries || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length > 200 && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Showing first 200 of {filtered.length} results
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}