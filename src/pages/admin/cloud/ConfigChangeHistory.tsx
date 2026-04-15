// ═══════════════════════════════════════════════════════════════
// SITA OS — Config Change History
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { History, RotateCcw, CheckCircle2 } from "lucide-react";

interface ConfigChange {
  id: string;
  config_scope: string;
  config_key: string;
  previous_value: unknown;
  new_value: unknown;
  actor_user_id: string;
  justification: string;
  status: string;
  approval_required: boolean;
  created_at: string;
}

export function ConfigChangeHistory() {
  const [changes, setChanges] = useState<ConfigChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("config_change_history" as never)
      .select("*" as never)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setChanges((data ?? []) as unknown as ConfigChange[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Config Change History</h2>
          <p className="text-sm text-muted-foreground">Audit trail for all admin configuration changes with diff and rollback support</p>
        </div>
        <Badge variant="outline" className="ml-auto">{changes.length} changes</Badge>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-4">
          {loading ? (
            <div className="text-muted-foreground text-sm py-4">Loading…</div>
          ) : changes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No configuration changes recorded yet</p>
              <p className="text-xs mt-1">Changes to feature flags, policies, quotas, and retention rules will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scope</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{c.config_scope}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{c.config_key}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate font-mono">
                      {c.previous_value ? JSON.stringify(c.previous_value).slice(0, 40) : "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate font-mono">
                      {JSON.stringify(c.new_value).slice(0, 40)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{c.justification || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "applied" ? "default" : "outline"} className="text-[10px]">
                        {c.status === "applied" && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                        {c.status === "rolled_back" && <RotateCcw className="h-2.5 w-2.5 mr-1" />}
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
