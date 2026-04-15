import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Clock, Shield, Users } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";

interface TokenClass {
  id: string;
  class_key: string;
  display_name: string;
  description: string;
  default_ttl_seconds: number;
  max_ttl_seconds: number;
  requires_mfa: boolean;
  scope_template: string[];
}

interface AdminSession {
  id: string;
  user_id: string;
  started_at: string;
  expires_at: string;
  last_activity_at: string;
  mfa_verified: boolean;
  status: string;
  ip_address: string | null;
}

const formatTTL = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
};

export function AdminTokenManager() {
  const [tokenClasses, setTokenClasses] = useState<TokenClass[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: tc }, { data: s }] = await Promise.all([
        fromTable("token_classes").select("*").order("class_key"),
        fromTable("admin_sessions")
          .select("*")
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .limit(20),
      ]);
      setTokenClasses(tc || []);
      setSessions(s || []);
      setLoading(false);
    };
    load();
  }, []);

  const tokenColors: Record<string, string> = {
    user: "border-blue-500/30 bg-blue-500/5",
    admin: "border-purple-500/30 bg-purple-500/5",
    service: "border-amber-500/30 bg-amber-500/5",
  };

  if (loading) {
    return <div className="h-48 bg-muted/30 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Token & Session Manager</h2>
        <Badge variant="outline" className="text-[10px]">{tokenClasses.length} classes</Badge>
      </div>

      {/* Token Classes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokenClasses.map((tc) => (
          <Card key={tc.id} className={`${tokenColors[tc.class_key] || ""} border`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4" />
                {tc.display_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">{tc.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground">Default TTL</span>
                  <p className="text-xs font-medium text-foreground">{formatTTL(tc.default_ttl_seconds)}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground">Max TTL</span>
                  <p className="text-xs font-medium text-foreground">{formatTTL(tc.max_ttl_seconds)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">MFA Required</span>
                <Badge variant="outline" className={`text-[9px] ${tc.requires_mfa ? "text-amber-400 border-amber-500/30" : "text-muted-foreground"}`}>
                  {tc.requires_mfa ? "Yes" : "No"}
                </Badge>
              </div>
              {tc.scope_template && (
                <div className="pt-1 border-t border-border/30 space-y-1">
                  <span className="text-[10px] text-muted-foreground">Scopes</span>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(tc.scope_template) ? tc.scope_template : []).map((scope: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[8px]">{scope}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Admin Sessions */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Active Admin Sessions
            <Badge variant="outline" className="text-[10px]">{sessions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No active admin sessions</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/20 text-xs">
                  <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-foreground font-mono text-[10px]">{s.user_id.slice(0, 12)}…</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(s.started_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {s.mfa_verified && (
                    <Badge className="text-[8px] bg-green-500/20 text-green-400 border-green-500/30">MFA</Badge>
                  )}
                  <Badge variant="outline" className="ml-auto text-[9px]">{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
