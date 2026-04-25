import { useAction } from "@/hooks/use-action";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Presentation, Play } from "lucide-react";
import { toast } from "sonner";
import CNSubNav from "@/platform/admin/components/admin/CNSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function CN06ConnectorDemoReview() {
  const queryClient = useQueryClient();

  const { data: demoBindings = [] } = useQuery({
    queryKey: ["connector-demo-bindings"],
    queryFn: async () => { const { data } = await fromTable("connector_demo_bindings").select("*"); return data || []; },
  });

  const activateMutation = useAction("admin", "connector.activate");

  return (
    <div className="space-y-6 p-6">
      <CNSubNav />
<h1 className="sr-only">Connector Demo Review</h1>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => activateMutation.mutate({ id: "demo_google_drive" })} disabled={activateMutation.isPending}>
            <Play className="h-4 w-4 mr-2" /> Activate Demo Drive
          </Button>
          <Button size="sm" variant="outline" onClick={() => activateMutation.mutate({ id: "demo_inbox" })} disabled={activateMutation.isPending}>
            <Play className="h-4 w-4 mr-2" /> Activate Demo Inbox
          </Button>
        </div>

        {demoBindings.length === 0 ? (
          <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No demo bindings. Seed the registry first.</CardContent></Card>
        ) : (
          demoBindings.map((db: Record<string, any>) => (
            <Card key={db.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><Presentation className="h-5 w-5" /> {db.scenario_name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-purple-400">{db.connector_type}</Badge>
                    {db.active && <Badge className="bg-green-500/20 text-green-400">Active</Badge>}
                    {db.pre_linked && <Badge variant="secondary">Pre-Linked</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(db.synthetic_files) && db.synthetic_files.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Synthetic Files ({db.synthetic_files.length})</p>
                    <div className="space-y-1">
                      {(db.synthetic_files as never[]).map((f: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/20 text-sm">
                          <span>{f.name}</span>
                          <span className="text-xs text-muted-foreground">{f.type === "folder" ? `${f.items} items` : `${(f.size / 1024 / 1024).toFixed(1)}MB`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(db.synthetic_messages) && db.synthetic_messages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Synthetic Messages ({db.synthetic_messages.length})</p>
                    <div className="space-y-1">
                      {(db.synthetic_messages as never[]).map((m: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/20 text-sm">
                          <div>
                            <p className="font-medium">{m.subject}</p>
                            <p className="text-xs text-muted-foreground">{m.from}</p>
                          </div>
                          <Badge variant={m.read ? "secondary" : "default"} className="text-xs">{m.read ? "Read" : "Unread"}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(db.synthetic_sync_history) && db.synthetic_sync_history.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Synthetic Sync History</p>
                    <div className="space-y-1">
                      {(db.synthetic_sync_history as never[]).map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-xs">
                          <Badge className="bg-green-500/20 text-green-400">{s.status}</Badge>
                          <span>{s.records_fetched} fetched → {s.records_imported} imported</span>
                          <span className="text-muted-foreground">{s.duration_ms}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
