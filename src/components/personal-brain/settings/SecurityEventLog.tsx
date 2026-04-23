// ═══════════════════════════════════════════════════════════════
// Personal Brain — Security event log (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { Activity, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePbSecurityEvents, type PbSecurityEvent } from "../hooks/usePbSecurityEvents";

function severityIcon(s: PbSecurityEvent["severity"]) {
  if (s === "critical") return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
  if (s === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-destructive/80" />;
  return <Info className="h-3.5 w-3.5 text-muted-foreground" />;
}

function severityBadge(s: PbSecurityEvent["severity"]) {
  if (s === "critical")
    return (
      <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
        CRITICAL
      </Badge>
    );
  if (s === "warning")
    return (
      <Badge variant="outline" className="h-5 border-destructive/40 px-1.5 text-[10px] text-destructive">
        WARNING
      </Badge>
    );
  return (
    <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-muted-foreground">
      INFO
    </Badge>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function SecurityEventLog() {
  const { events, loading } = usePbSecurityEvents(60);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Security activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="px-4 pb-4 text-sm text-muted-foreground">
            No activity yet. Events from learning, exports, and sensitive mode will appear here.
          </div>
        ) : (
          <ScrollArea className="h-[360px]">
            <ul className="divide-y divide-border/60">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                  <div className="mt-0.5">{severityIcon(e.severity)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{e.event_type}</span>
                      {severityBadge(e.severity)}
                      <span className="text-[10px] text-muted-foreground">{formatDate(e.created_at)}</span>
                    </div>
                    {Object.keys(e.detail ?? {}).length > 0 && (
                      <pre className="mt-1 truncate text-[11px] text-muted-foreground">
                        {JSON.stringify(e.detail)}
                      </pre>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}