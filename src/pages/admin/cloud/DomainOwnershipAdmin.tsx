// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Ownership Admin
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Network, Shield, Layers } from "lucide-react";

interface DomainEntry {
  domain_key: string;
  display_name: string;
  owning_service: string;
  plane: string;
  team: string;
  description: string;
  status: string;
}

const PLANE_COLORS: Record<string, string> = {
  control: "bg-destructive/20 text-destructive border-destructive/30",
  product: "bg-primary/20 text-primary border-primary/30",
  "shared-core": "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export function DomainOwnershipAdmin() {
  const [domains, setDomains] = useState<DomainEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("domain_ownership_registry" as never)
      .select("*" as never)
      .order("plane" as never)
      .then(({ data }) => {
        setDomains((data ?? []) as unknown as DomainEntry[]);
        setLoading(false);
      });
  }, []);

  const byPlane = domains.reduce<Record<string, DomainEntry[]>>((acc, d) => {
    (acc[d.plane] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Network className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Domain Ownership Registry</h2>
          <p className="text-sm text-muted-foreground">Service-to-plane-to-team mapping for all platform domains</p>
        </div>
        <Badge variant="outline" className="ml-auto">{domains.length} domains</Badge>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading domains…</div>
      ) : (
        Object.entries(byPlane).map(([plane, entries]) => (
          <Card key={plane} className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {plane === "control" ? <Shield className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                <span className="capitalize">{plane} Plane</span>
                <Badge variant="outline" className={PLANE_COLORS[plane]}>{entries.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Owning Service</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((d) => (
                    <TableRow key={d.domain_key}>
                      <TableCell className="font-mono text-sm font-medium">{d.domain_key}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{d.owning_service}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{d.team}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{d.description}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === "active" ? "default" : "outline"} className="text-[10px]">
                          {d.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
