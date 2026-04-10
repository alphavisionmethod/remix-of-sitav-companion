import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Users, Briefcase, FileText, Calendar, Star, Megaphone, AlertTriangle, CheckCircle, TrendingUp, Rocket } from "lucide-react";
import { ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";

export default function ReconciliationScreen({ state, setState, onBack }: ScreenProps) {
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
  const staleLeads = entities.find(e => e.label === "Leads") ? 23 : 0;
  const duplicates = entities.find(e => e.label === "Contacts") ? 12 : 0;
  const activeRatio = totalRecords > 0 ? Math.round(((totalRecords - staleLeads - duplicates) / totalRecords) * 100) : 0;

  const immediateWins = useMemo(() => {
    const wins: { label: string; value: string; icon: any }[] = [];
    if (staleLeads > 0) wins.push({ label: `${staleLeads} stale leads worth ~$6,900 in recoverable revenue`, value: "$6,900", icon: TrendingUp });
    if (duplicates > 0) wins.push({ label: `${duplicates} duplicate contacts to merge for cleaner CRM`, value: "Clean data", icon: Users });
    if (entities.find(e => e.label === "Proposals" && e.confidence < 90)) wins.push({ label: "5 proposals missing amounts — recover ~$2,400", value: "$2,400", icon: FileText });
    if (entities.find(e => e.label === "Reviews")) wins.push({ label: "67 reviews ready for reputation automation", value: "+12/mo", icon: Star });
    return wins;
  }, [entities, staleLeads, duplicates]);

  return (
    <div className="space-y-6">
      <ScreenHeader icon={Search} title="Data Review and Reconciliation" subtitle="SITA scanned your imports — review what was found before proceeding" color="text-amber-400" />

      {totalRecords > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/60 border-border/40"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-foreground">{totalRecords}</p><p className="text-[10px] text-muted-foreground">Total records</p></CardContent></Card>
          <Card className="bg-card/60 border-border/40"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-400">{entities.filter(e => e.confidence < 90).length}</p><p className="text-[10px] text-muted-foreground">Need attention</p></CardContent></Card>
          <Card className="bg-card/60 border-border/40"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-emerald-400">{entities.filter(e => e.confidence >= 90).length}</p><p className="text-[10px] text-muted-foreground">Ready</p></CardContent></Card>
        </div>
      )}

      {/* First Import Intelligence */}
      {totalRecords > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Search className="h-3.5 w-3.5 text-primary" />First Import Intelligence</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 rounded-lg bg-muted/20">
                <p className="text-[10px] text-muted-foreground">Active Records</p>
                <p className="text-sm font-bold text-foreground">{activeRatio}%</p>
                <Progress value={activeRatio} className="h-1 mt-1" />
              </div>
              <div className="p-2 rounded-lg bg-muted/20">
                <p className="text-[10px] text-muted-foreground">Stale Leads</p>
                <p className="text-sm font-bold text-amber-400">{staleLeads}</p>
                <p className="text-[8px] text-muted-foreground">Inactive &gt;90 days</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/20">
                <p className="text-[10px] text-muted-foreground">Duplicates</p>
                <p className="text-sm font-bold text-amber-400">{duplicates}</p>
                <p className="text-[8px] text-muted-foreground">Likely matches</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/20">
                <p className="text-[10px] text-muted-foreground">Data Types</p>
                <p className="text-sm font-bold text-foreground">{entities.length}</p>
                <p className="text-[8px] text-muted-foreground">Categories imported</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  {e.confidence > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={e.confidence} className="h-1 flex-1" />
                      <span className={`text-[9px] font-medium ${e.confidence >= 90 ? "text-emerald-400" : "text-amber-400"}`}>{e.confidence}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  {e.confidence >= 90 ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Immediate Wins from Data */}
      {immediateWins.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Rocket className="h-3.5 w-3.5 text-emerald-400" />Immediate Wins from Your Data</p>
              <div className="space-y-2">
                {immediateWins.map((win, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/5">
                    <win.icon className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <p className="text-[10px] text-muted-foreground flex-1">{win.label}</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 text-[8px]">{win.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Confirmation actions */}
      {totalRecords > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setState(p => ({ ...p, reconConfirmed: true }))}
            className={`flex-1 p-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${state.reconConfirmed ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-card/50 border border-border/50 text-foreground hover:bg-card/80"}`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {state.reconConfirmed ? "Confirmed" : "Looks right"}
          </button>
          <button
            onClick={onBack}
            className="flex-1 p-3 rounded-xl bg-card/50 border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Adjust this
          </button>
        </div>
      )}
    </div>
  );
}
