import {
  Radar, Shield, Activity, CheckCircle, XCircle,
  AlertTriangle, Eye, Layers, Globe, Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_PATTERNS: any[] = [];

const privacyBadges: Record<string, { icon: typeof Globe; color: string }> = {
  public_safe: { icon: Globe, color: "text-emerald-400" },
  anonymizable: { icon: Eye, color: "text-blue-400" },
  tenant_private: { icon: Lock, color: "text-rose-400" },
};

const PatternLearningCenter = () => {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading || !isAdmin) return null;

  const totalPatterns = ([] as any[]).length;
  const reusableCount = ([] as any[]).filter(p => p.reusable).length;
  const avgConfidence = Math.round(([] as any[]).reduce((s, p) => s + p.confidence, 0) / totalPatterns);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader
        icon={<Radar className="h-6 w-6" />}
        title="Pattern Learning Center"
        subtitle="View recurrent patterns, fingerprints, and generalized learning across the system"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Patterns", value: String(totalPatterns) },
          { label: "Cross-Tenant Reusable", value: String(reusableCount), color: "text-emerald-400" },
          { label: "Avg Confidence", value: `${avgConfidence}%` },
          { label: "Privacy Restricted", value: String(([] as any[]).filter(p => p.privacy === "tenant_private").length), color: "text-rose-400" },
        ].map(m => (
          <Card key={m.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color || "text-foreground"}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pattern Library */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radar className="h-4 w-4 text-primary" /> Pattern Library</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Pattern</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs text-right">Confidence</TableHead>
                <TableHead className="text-xs text-right">False Pos.</TableHead>
                <TableHead className="text-xs text-right">Sources</TableHead>
                <TableHead className="text-xs">Privacy</TableHead>
                <TableHead className="text-xs text-center">Reusable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([] as any[]).sort((a, b) => b.confidence - a.confidence).map(p => {
                const PrivIcon = privacyBadges[p.privacy]?.icon || Shield;
                const privColor = privacyBadges[p.privacy]?.color || "text-muted-foreground";
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium text-foreground max-w-[220px] truncate">{p.label}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{p.type.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.domain}</TableCell>
                    <TableCell className="text-xs text-right">
                      <span className={p.confidence >= 85 ? "text-emerald-400" : p.confidence >= 70 ? "text-foreground" : "text-amber-400"}>{p.confidence}%</span>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      <span className={p.falsePositive > 10 ? "text-amber-400" : "text-foreground"}>{p.falsePositive}%</span>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">{p.sourceCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PrivIcon className={`h-3 w-3 ${privColor}`} />
                        <span className={`text-[10px] ${privColor}`}>{p.privacy.replace(/_/g, " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {p.reusable ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground mx-auto" />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pattern Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {([] as any[]).slice(0, 4).map(p => (
          <Card key={p.id} className="bg-card/80 border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[9px]">{p.type.replace(/_/g, " ")}</Badge>
                <Badge variant={p.reusable ? "secondary" : "destructive"} className="text-[9px]">{p.reusable ? "cross-tenant" : "private"}</Badge>
              </div>
              <p className="text-sm font-medium text-foreground">{p.label}</p>
              <p className="text-[10px] text-muted-foreground">{p.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span>Confidence: <span className="text-foreground">{p.confidence}%</span></span>
                <span>FP Rate: <span className={p.falsePositive > 10 ? "text-amber-400" : "text-foreground"}>{p.falsePositive}%</span></span>
                <span>Sources: <span className="text-foreground">{p.sourceCount}</span></span>
              </div>
              <Progress value={p.confidence} className="h-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatternLearningCenter;
