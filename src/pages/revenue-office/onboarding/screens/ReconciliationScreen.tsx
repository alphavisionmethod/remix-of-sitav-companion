import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Briefcase, FileText, Calendar, Star, Megaphone, AlertTriangle, CheckCircle } from "lucide-react";
import { ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

export default function ReconciliationScreen({ state }: ScreenProps) {
  const entities = useMemo(() => {
    const e: { label: string; icon: any; count: number; issues: string; confidence: number }[] = [];
    if (state.importedFiles.includes("contacts") || state.importedFiles.includes("customers")) e.push({ label: "Contacts", icon: Users, count: 347, issues: "12 likely duplicates", confidence: 88 });
    if (state.importedFiles.includes("leads")) e.push({ label: "Leads", icon: Users, count: 89, issues: "23 stale (>90 days)", confidence: 72 });
    if (state.importedFiles.includes("proposals")) e.push({ label: "Proposals", icon: FileText, count: 34, issues: "5 missing amounts", confidence: 82 });
    if (state.importedFiles.includes("bookings")) e.push({ label: "Bookings", icon: Calendar, count: 156, issues: "3 missing dates", confidence: 95 });
    if (state.importedFiles.includes("reviews")) e.push({ label: "Reviews", icon: Star, count: 67, issues: "All clean", confidence: 99 });
    if (state.importedFiles.includes("products")) e.push({ label: "Offers / Products", icon: Briefcase, count: 12, issues: "2 missing pricing", confidence: 85 });
    if (state.importedFiles.includes("campaigns")) e.push({ label: "Campaign Lists", icon: Megaphone, count: 4, issues: "All clean", confidence: 97 });
    if (e.length === 0) e.push({ label: "No imports yet", icon: Search, count: 0, issues: "Import data in previous steps", confidence: 0 });
    return e;
  }, [state.importedFiles]);

  const totalRecords = entities.reduce((s, e) => s + e.count, 0);

  return (
    <div className="space-y-6">
      <DemoModeBadge />
      <ScreenHeader icon={Search} title="Data Review and Reconciliation" subtitle="SITA scanned your imports — review what was found before proceeding" color="text-amber-400" />

      {totalRecords > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/60 border-border/40"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-foreground">{totalRecords}</p><p className="text-[10px] text-muted-foreground">Total records</p></CardContent></Card>
          <Card className="bg-card/60 border-border/40"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-400">{entities.filter(e => e.confidence < 90).length}</p><p className="text-[10px] text-muted-foreground">Need attention</p></CardContent></Card>
          <Card className="bg-card/60 border-border/40"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-emerald-400">{entities.filter(e => e.confidence >= 90).length}</p><p className="text-[10px] text-muted-foreground">Ready</p></CardContent></Card>
        </div>
      )}

      <div className="space-y-2">
        {entities.map(e => (
          <Card key={e.label} className="bg-card/60 border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><e.icon className="h-4 w-4 text-muted-foreground" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{e.label}</p>
                    <Badge className="bg-muted text-muted-foreground text-[9px]">{e.count} records</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{e.issues}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {e.confidence >= 90 ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                  <span className={`text-[10px] font-medium ${e.confidence >= 90 ? "text-emerald-400" : "text-amber-400"}`}>{e.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
