import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Bot, Shield, FileCheck, Link, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: { type: "user" | "system" | "agent"; label: string };
  domain: string;
  target: string;
  receiptId?: string;
  chainIntegrity: "intact" | "break" | "unknown";
  correlationId?: string;
  details?: string;
}

interface Props { entries: AuditEntry[]; title?: string }

function timeFmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + dt.toLocaleDateString([], { month: "short", day: "numeric" });
}

const actorIcons = { user: User, system: Shield, agent: Bot };

export function AuditLineageTimeline({ entries, title = "Audit Lineage" }: Props) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-4 border-l border-border/40 space-y-3">
          {entries.map((e, i) => {
            const Icon = actorIcons[e.actor.type];
            return (
              <div key={e.id} className="relative">
                <div className={cn(
                  "absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2",
                  e.chainIntegrity === "intact" ? "bg-green-400 border-green-500" :
                  e.chainIntegrity === "break" ? "bg-red-400 border-red-500" :
                  "bg-muted border-border"
                )} />
                <div className="p-2.5 bg-muted/20 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{e.action}</span>
                      <Badge variant="outline" className="text-[8px]">{e.domain}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{timeFmt(e.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">{e.target}</span>
                    {e.receiptId && (
                      <span className="text-[9px] font-mono text-primary flex items-center gap-0.5">
                        <FileCheck className="w-2.5 h-2.5" />{e.receiptId.slice(0, 8)}
                      </span>
                    )}
                    {e.chainIntegrity === "break" && (
                      <Badge variant="destructive" className="text-[8px] flex items-center gap-0.5">
                        <AlertTriangle className="w-2 h-2" />Chain Break
                      </Badge>
                    )}
                    {e.correlationId && (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Link className="w-2.5 h-2.5" />{e.correlationId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  {e.details && <p className="text-[10px] text-muted-foreground">{e.details}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
