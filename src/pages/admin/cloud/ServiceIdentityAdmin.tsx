// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Identity Admin
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Fingerprint, ShieldCheck, ShieldAlert } from "lucide-react";

interface ServiceIdentityRow {
  service_key: string;
  display_name: string;
  plane: string;
  scopes: string[];
  trust_level: string;
  is_active: boolean;
  allowed_targets: string[];
  token_ttl_seconds: number;
}

const TRUST_COLORS: Record<string, string> = {
  standard: "bg-muted text-muted-foreground",
  elevated: "bg-amber-500/20 text-amber-400",
  critical: "bg-destructive/20 text-destructive",
};

export function ServiceIdentityAdmin() {
  const [services, setServices] = useState<ServiceIdentityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("service_identity_registry" as never)
      .select("*" as never)
      .order("plane" as never)
      .then(({ data }) => {
        setServices((data ?? []) as unknown as ServiceIdentityRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Fingerprint className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Service Identity Registry</h2>
          <p className="text-sm text-muted-foreground">Zero-trust service-to-service authentication identities</p>
        </div>
        <Badge variant="outline" className="ml-auto">{services.length} services</Badge>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading…</div>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Plane</TableHead>
                  <TableHead>Trust Level</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Allowed Targets</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.service_key}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {s.trust_level === "critical" ? (
                          <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{s.display_name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{s.service_key}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">{s.plane}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${TRUST_COLORS[s.trust_level] ?? ""}`}>
                        {s.trust_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-0.5 max-w-[200px]">
                        {s.scopes.slice(0, 3).map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-[9px] font-mono">{scope}</Badge>
                        ))}
                        {s.scopes.length > 3 && (
                          <Badge variant="secondary" className="text-[9px]">+{s.scopes.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {s.allowed_targets.length > 0 ? s.allowed_targets.join(", ") : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{s.token_ttl_seconds}s</TableCell>
                    <TableCell>
                      <Badge variant={s.is_active ? "default" : "destructive"} className="text-[10px]">
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
