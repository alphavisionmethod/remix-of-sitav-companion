import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Unplug } from "lucide-react";
import { toast } from "sonner";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const statusColors: Record<string, string> = {
  connected: "bg-green-500/20 text-green-400", pending: "bg-yellow-500/20 text-yellow-400",
  disconnected: "bg-muted text-muted-foreground", reauth_required: "bg-orange-500/20 text-orange-400",
  expired: "bg-red-500/20 text-red-400", error: "bg-red-500/20 text-red-400",
  demo_simulated: "bg-purple-500/20 text-purple-400", internal_test: "bg-blue-500/20 text-blue-400",
};

export default function CN03AccountLinkageBoard() {
  const { isDemoMode } = useDataMode();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["connector-accounts"],
    queryFn: async () => { const { data } = await supabase.from("connector_accounts").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.functions.invoke("connector-operations", { body: { action: "disconnect", account_id: accountId } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success("Account disconnected"); queryClient.invalidateQueries({ queryKey: ["connector-accounts"] }); },
    onError: (e: any) => toast.error(`Disconnect failed: ${e.message}`),
  });

  return (
    <div className="space-y-6 p-6"  >
      <DemoModeBadge />
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Linked Accounts</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked accounts yet.</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium text-sm">{a.display_name || a.connector_type}</p>
                    <p className="text-xs text-muted-foreground">{a.account_email || "—"} · {a.connector_type}</p>
                    {a.connected_at && <p className="text-xs text-muted-foreground">Connected: {new Date(a.connected_at).toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[a.status] || ""}>{a.status}</Badge>
                    {a.demo_mode && <Badge variant="outline" className="text-purple-400">Demo</Badge>}
                    {a.status !== "disconnected" && (
                      <Button size="sm" variant="ghost" onClick={() => disconnectMutation.mutate(a.id)} className="text-destructive">
                        <Unplug className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
