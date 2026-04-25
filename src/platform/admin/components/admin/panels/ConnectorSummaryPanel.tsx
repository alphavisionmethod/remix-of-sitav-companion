import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function ConnectorSummaryPanel() {
  const stats = { connected: 8, degraded: 1, failed: 0, policyBlocked: 0 };

  return (
    <Card className="hover:-translate-y-0.5 transition-transform">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Connectors</span>
          </div>
          <Badge variant="outline" className={`text-[9px] ${stats.degraded > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
            {stats.degraded > 0 ? "Degraded" : "All OK"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> {stats.connected}</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> {stats.degraded}</span>
          <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> {stats.failed}</span>
        </div>
        <Link to="/admin/connectors" className="text-[10px] text-primary hover:underline">Manage connectors →</Link>
      </CardContent>
    </Card>
  );
}
