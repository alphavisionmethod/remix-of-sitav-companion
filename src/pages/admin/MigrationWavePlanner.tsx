import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMockReplacements } from "@/hooks/useMockReplacements";
import { Layers, Users, Clock, Target, ArrowRight } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function MigrationWavePlanner() {
  const { data: replacements = [] } = useMockReplacements();

  const waves = useMemo(() => {
    const critical = replacements.filter(m => m.migration_priority === "critical");
    const high = replacements.filter(m => m.migration_priority === "high");
    const medium = replacements.filter(m => m.migration_priority === "medium");
    const low = replacements.filter(m => m.migration_priority === "low");

    return [
      { name: "Wave 1 — Critical / Launch Blockers", priority: "critical", items: critical, color: "text-destructive border-destructive/30" },
      { name: "Wave 2 — High / Core Integrity", priority: "high", items: high, color: "text-orange-400 border-orange-400/30" },
      { name: "Wave 3 — Medium / Important", priority: "medium", items: medium, color: "text-yellow-400 border-yellow-400/30" },
      { name: "Wave 4 — Low / Internal", priority: "low", items: low, color: "text-muted-foreground border-muted" },
    ];
  }, [replacements]);

  const domainGroups = useMemo(() => {
    const map = new Map<string, typeof replacements>();
    replacements.forEach(m => {
      const domain = m.page_path.split("/")[1] || "root";
      const list = map.get(domain) ?? [];
      list.push(m);
      map.set(domain, list);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [replacements]);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Migration Wave Planner</h1>
        <p className="text-sm text-muted-foreground">Plan the sequence of mock → real migrations — RCP10</p>
      </div>

      {/* Wave Cards */}
      <div className="grid grid-cols-1 gap-4">
        {waves.map(wave => (
          <Card key={wave.priority}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm flex items-center justify-between ${wave.color}`}>
                <span className="flex items-center gap-2"><Layers className="h-4 w-4" />{wave.name}</span>
                <Badge variant="outline" className={wave.color}>{wave.items.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wave.items.length === 0 && <p className="text-xs text-muted-foreground">No items in this wave</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {wave.items.map(item => {
                  const done = item.migration_status === "completed" || item.migration_status === "validated";
                  return (
                    <div key={item.id} className={`border rounded p-2 text-sm ${done ? "opacity-50" : ""}`}>
                      <div className="font-medium flex items-center justify-between">
                        {item.feature_name}
                        <Badge variant="outline" className="text-[10px]">{item.migration_status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{item.page_path}</div>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-muted-foreground">{item.migration_owner || "Unassigned"}</span>
                        {item.dependencies.length > 0 && <Badge variant="outline" className="text-[10px]">{item.dependencies.length} deps</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Domain Grouping */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />By Domain</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {domainGroups.map(([domain, items]) => {
            const done = items.filter(i => i.migration_status === "completed" || i.migration_status === "validated").length;
            return (
              <div key={domain} className="flex items-center justify-between text-sm">
                <span className="font-medium">{domain}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{done}/{items.length} done</span>
                  <Badge variant="outline">{Math.round((done / items.length) * 100)}%</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
