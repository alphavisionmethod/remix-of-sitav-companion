import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export function ReplaySummaryPanel() {
  const coverage = { replay: 87, rollback: 72, failingJobs: 0, missingEdges: 2 };

  return (
    <Card className="hover:-translate-y-0.5 transition-transform">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Proof & Replay</span>
          </div>
          <Badge variant="outline" className={`text-[9px] ${coverage.missingEdges > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
            {coverage.missingEdges > 0 ? "Gaps" : "Complete"}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-muted-foreground">Replay: </span><span className="font-medium text-foreground">{coverage.replay}%</span></div>
          <div><span className="text-muted-foreground">Rollback: </span><span className="font-medium text-foreground">{coverage.rollback}%</span></div>
        </div>
        {coverage.missingEdges > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-500">
            <AlertTriangle className="h-3 w-3" /> {coverage.missingEdges} missing proof edges
          </div>
        )}
        <Link to="/admin/proof-matrix" className="text-[10px] text-primary hover:underline">Proof matrix →</Link>
      </CardContent>
    </Card>
  );
}
