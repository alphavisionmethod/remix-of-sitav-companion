import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Search, User, Smartphone, RefreshCw, Wrench, FileSearch, Shield } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";

export function SupportConsoleSafe() {
  const [searchQuery, setSearchQuery] = useState("");
  const [grants, setGrants] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: g }, { data: a }] = await Promise.all([
        fromTable("support_access_grants")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        fromTable("admin_action_audit")
          .select("*")
          .ilike("action", "support:%")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setGrants(g || []);
      setRecentActions(a || []);
      setLoading(false);
    };
    load();
  }, []);

  const supportTools = [
    { key: "user-lookup", label: "User Lookup", icon: User, desc: "Search and inspect user account health", permission: "support.view" },
    { key: "device-inspect", label: "Device Inspect", icon: Smartphone, desc: "Check device trust, sync, and client version", permission: "support.view" },
    { key: "sync-trace", label: "Sync Trace", icon: RefreshCw, desc: "Trace sync operations for a specific user", permission: "support.view" },
    { key: "run-diagnostic", label: "Run Diagnostic", icon: FileSearch, desc: "Generate a diagnostic bundle for support", permission: "support.repair" },
    { key: "safe-repair", label: "Safe Repair", icon: Wrench, desc: "Run safe, non-destructive repair flows", permission: "support.repair" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Support Console</h2>
        <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">Safe Mode</Badge>
      </div>

      {/* Restriction Notice */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-3 flex items-center gap-3">
          <Shield className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400">
            Support Console operates with restricted permissions. Only read operations and safe repairs are available.
            Policy, quota, and feature flag modifications require Admin Console access.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by user ID, email, or device ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/30"
        />
      </div>

      {/* Support Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {supportTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.key} className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{tool.label}</p>
                    <Badge variant="outline" className="text-[8px]">{tool.permission}</Badge>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{tool.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Support Grants */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Active Support Access Grants</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-24 animate-pulse bg-muted/30 rounded" />
          ) : grants.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No active support grants</p>
          ) : (
            <div className="space-y-2">
              {grants.map((g: any) => (
                <div key={g.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/20 text-xs">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground">Target: {g.target_user_id?.slice(0, 8)}…</span>
                  <Badge variant="outline" className="text-[9px]">{g.scope}</Badge>
                  <span className="text-muted-foreground ml-auto">{g.reason}</span>
                  <span className="text-[10px] text-muted-foreground">
                    Exp: {new Date(g.expires_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Support Actions */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Support Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-24 animate-pulse bg-muted/30 rounded" />
          ) : recentActions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No recent support actions</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentActions.map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/20 text-xs">
                  <span className="text-foreground font-medium">{a.action}</span>
                  <Badge variant="outline" className="text-[9px]">{a.severity}</Badge>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
