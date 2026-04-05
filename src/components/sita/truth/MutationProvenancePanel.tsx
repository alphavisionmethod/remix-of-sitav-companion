import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StalenessIndicator } from "./StalenessIndicator";
import { DurabilityStateBadge } from "./DurabilityStateBadge";
import { GitBranch, User, Bot, Shield, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MutationRecord {
  id: string;
  action: string;
  domain: string;
  actor: { type: "user" | "system" | "agent"; id: string; label: string };
  target: { type: string; id: string };
  durability: "persisted" | "transient" | "cached" | "fallback";
  receiptHash?: string;
  previousHash?: string;
  approvalRequired: boolean;
  approvalEnforced?: boolean;
  policyGated: boolean;
  replayable: boolean;
  rollbackable: boolean;
  timestamp: string;
}

interface Props {
  mutations: MutationRecord[];
  title?: string;
}

const actorIcons = { user: User, system: Shield, agent: Bot };

export function MutationProvenancePanel({ mutations, title = "Mutation Provenance" }: Props) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2"><GitBranch className="w-4 h-4 text-primary" />{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {mutations.map((m) => {
          const ActorIcon = actorIcons[m.actor.type];
          return (
            <div key={m.id} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <ActorIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">{m.action}</p>
                  <p className="text-[10px] text-muted-foreground">{m.target.type}/{m.target.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <DurabilityStateBadge state={m.durability} compact />
                {m.receiptHash && (
                  <span className="text-[9px] font-mono text-muted-foreground">{m.receiptHash.slice(0, 8)}…</span>
                )}
                {m.approvalRequired && (
                  <Badge variant={m.approvalEnforced ? "default" : "destructive"} className="text-[8px]">
                    {m.approvalEnforced ? "Approved" : "Bypassed!"}
                  </Badge>
                )}
                <div className="flex gap-1">
                  {m.replayable && <Badge variant="outline" className="text-[8px]">↻</Badge>}
                  {m.rollbackable && <Badge variant="outline" className="text-[8px]">⟲</Badge>}
                </div>
                <StalenessIndicator lastUpdated={m.timestamp} thresholdSeconds={3600} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
