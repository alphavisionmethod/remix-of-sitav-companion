import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function RevenueSummaryPanel() {
  return (
    <Card className="hover:-translate-y-0.5 transition-transform">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Revenue Pulse</span>
          </div>
          <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Healthy</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">MRR Trend</p>
            <p className="text-lg font-bold text-foreground flex items-center gap-1">$12.4k <ArrowUpRight className="h-3 w-3 text-emerald-500" /></p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Recovered</p>
            <p className="text-lg font-bold text-emerald-500">$2.1k</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>Autopilot influenced 18% of revenue actions</span>
        </div>
        <Link to="/admin/revenue-autopilot" className="text-[10px] text-primary hover:underline">View autopilot →</Link>
      </CardContent>
    </Card>
  );
}
