import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Hash, Clock, Shield, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  action: string;
  domain: string;
  actor: string;
  target: string;
  receiptHash: string;
  previousHash: string;
  timestamp: string;
  status: "completed" | "failed" | "pending";
  replayable?: boolean;
  rollbackable?: boolean;
  approvalId?: string;
  className?: string;
}

export function AdminWriteReceiptCard({ action, domain, actor, target, receiptHash, previousHash, timestamp, status, replayable, rollbackable, approvalId, className }: Props) {
  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">{action}</span>
            <Badge variant="outline" className="text-[8px]">{domain}</Badge>
          </div>
          <Badge variant={status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"} className="text-[9px] capitalize">{status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          <div><span className="text-muted-foreground">Actor:</span> <span className="text-foreground">{actor}</span></div>
          <div><span className="text-muted-foreground">Target:</span> <span className="text-foreground font-mono">{target}</span></div>
          <div className="flex items-center gap-1"><Hash className="w-2.5 h-2.5 text-muted-foreground" /><span className="font-mono text-muted-foreground">{receiptHash}</span></div>
          <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-muted-foreground" /><span className="text-muted-foreground">{new Date(timestamp).toLocaleString()}</span></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] text-muted-foreground">prev: <span className="font-mono">{previousHash}</span></span>
          {approvalId && <Badge variant="outline" className="text-[8px] gap-0.5"><Shield className="w-2 h-2" />Approved</Badge>}
          {replayable && <Badge variant="outline" className="text-[8px] gap-0.5"><RotateCcw className="w-2 h-2" />Replayable</Badge>}
          {rollbackable && <Badge variant="outline" className="text-[8px] gap-0.5">⟲ Rollback</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
