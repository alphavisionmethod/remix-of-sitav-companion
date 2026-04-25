import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { createFraudSentinel } from "@/lib/services/fraud-sentinel";

export function RiskSummaryPanel() {
  const fraudSentinel = useMemo(() => createFraudSentinel(), []);
  const activeSignals = fraudSentinel.getActive();
  const riskScore = fraudSentinel.getRiskScore();

  const risks = [
    { label: "Operational", level: "low" as const },
    { label: "Compliance", level: "medium" as const },
    { label: "Launch", level: "low" as const },
    { label: "Degradation", level: "medium" as const },
    { label: "Fraud Signals", level: (activeSignals.length > 0 ? (riskScore > 5 ? "high" : "medium") : "low") as "low" | "medium" | "high" },
  ];

  const overallLevel = risks.some(r => r.level === "high") ? "High" : risks.some(r => r.level === "medium") ? "Medium" : "Low";
  const overallColor = overallLevel === "High" ? "text-red-500 bg-red-500/10 border-red-500/20" : overallLevel === "Medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";

  const levelColor = {
    low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    high: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <Card className="hover:-translate-y-0.5 transition-transform">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">Risk Summary</span>
          </div>
          <Badge variant="outline" className={`text-[9px] ${overallColor}`}>{overallLevel}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {risks.map(r => (
            <div key={r.label} className="flex items-center justify-between p-2 rounded border bg-card">
              <span className="text-[10px] text-muted-foreground">{r.label}</span>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${levelColor[r.level]}`}>{r.level}</Badge>
            </div>
          ))}
        </div>
        {activeSignals.length > 0 && (
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            {activeSignals.length} active fraud signal{activeSignals.length !== 1 ? "s" : ""} · Risk score: {riskScore}
          </div>
        )}
        <Link to="/admin/security-posture" className="text-[10px] text-primary hover:underline">View full posture →</Link>
      </CardContent>
    </Card>
  );
}
