// ═══════════════════════════════════════════════════════════════
// SITA OS — Error Events Explorer (Phase 20.A)
// Admin-facing live view over public.error_events with filters.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bug, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

interface ErrorEventRow {
  id: string;
  fingerprint: string;
  message: string;
  stack: string | null;
  severity: string;
  source: string;
  route: string | null;
  release: string | null;
  environment: string;
  count: number;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
  sentry_event_id: string | null;
  metadata: Record<string, unknown>;
}

const sevColor: Record<string, string> = {
  fatal: "text-red-500 bg-red-500/10 border-red-500/20",
  error: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  debug: "text-muted-foreground bg-muted/30 border-border",
};

export default function ErrorEventsExplorer() {
  const [severity, setSeverity] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["error-events", severity, search, showResolved],
    queryFn: async () => {
      let q = supabase
        .from("error_events")
        .select("*")
        .order("last_seen_at", { ascending: false })
        .limit(200);
      if (severity !== "all") q = q.eq("severity", severity);
      if (!showResolved) q = q.is("resolved_at", null);
      if (search.trim()) q = q.ilike("message", `%${search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ErrorEventRow[];
    },
    refetchInterval: 30_000,
  });

  const events = data ?? [];

  // Group by fingerprint
  const grouped = events.reduce<Record<string, ErrorEventRow[]>>((acc, e) => {
    (acc[e.fingerprint] ||= []).push(e);
    return acc;
  }, {});
  const groups = Object.entries(grouped).sort((a, b) => {
    const aLatest = Math.max(...a[1].map((e) => new Date(e.last_seen_at).getTime()));
    const bLatest = Math.max(...b[1].map((e) => new Date(e.last_seen_at).getTime()));
    return bLatest - aLatest;
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Bug className="h-6 w-6 text-primary" /> Error Events Explorer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live deduplicated errors from <code>public.error_events</code> · {events.length} loaded · {groups.length} unique
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />} Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex gap-1.5">
          {["all", "fatal", "error", "warning", "info"].map((s) => (
            <Button key={s} variant={severity === s ? "default" : "outline"} size="sm" className="text-[10px] h-7" onClick={() => setSeverity(s)}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <Button variant={showResolved ? "default" : "outline"} size="sm" className="text-[10px] h-7" onClick={() => setShowResolved((v) => !v)}>
          {showResolved ? "Hide resolved" : "Include resolved"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" /> No error events.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map(([fp, rows]) => {
            const top = rows[0];
            const totalCount = rows.reduce((s, r) => s + r.count, 0);
            return (
              <Card key={fp} className={top.severity === "fatal" ? "border-red-500/30" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[9px] ${sevColor[top.severity] ?? sevColor.error}`}>{top.severity}</Badge>
                    <Badge variant="outline" className="text-[9px]">{top.source}</Badge>
                    {top.release && <Badge variant="outline" className="text-[9px]">{top.release}</Badge>}
                    <Badge variant="outline" className="text-[9px]">×{totalCount}</Badge>
                    <span className="text-foreground font-medium">{top.message.slice(0, 160)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground space-y-1">
                  {top.route && <div>Route: <code className="text-foreground">{top.route}</code></div>}
                  <div>First: {new Date(top.first_seen_at).toLocaleString()} · Last: {new Date(top.last_seen_at).toLocaleString()}</div>
                  {top.sentry_event_id && <div>Sentry: <code>{top.sentry_event_id}</code></div>}
                  {top.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[10px] uppercase tracking-wider">Stack</summary>
                      <pre className="text-[10px] mt-1 bg-muted/30 rounded p-2 overflow-x-auto max-h-40">{top.stack}</pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
