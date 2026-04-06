import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";
import { ScreenHeader } from "../primitives";
import { inferBusinessSignals } from "../branching";
import type { ScreenProps } from "../types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

export default function ShapeSummaryScreen({ state }: ScreenProps) {
  const signals = useMemo(() => inferBusinessSignals(state), [state]);

  const strengths = useMemo(() => {
    const s: string[] = [];
    if (state.leadSources.includes("referrals")) s.push("Strong referral engine");
    if (state.revenueSources.includes("retainers")) s.push("Recurring revenue base");
    if (state.postSaleSteps.includes("checkins")) s.push("Active client check-ins");
    if (state.whatCloses.includes("relationship")) s.push("Relationship-driven closing");
    if (state.businessTypes.length === 1) s.push("Focused business model");
    if (s.length === 0) s.push("Hybrid growth potential");
    return s;
  }, [state]);

  const leaks = useMemo(() => {
    const l: string[] = [];
    if (state.postSaleSlips.includes("followup")) l.push("Follow-up gaps losing warm leads");
    if (state.postSaleSlips.includes("reviews")) l.push("Review collection opportunity missed");
    if (state.growthBottlenecks.includes("lead_followup")) l.push("Lead response time leak");
    if (state.growthBottlenecks.includes("no_shows")) l.push("No-show revenue loss");
    if (state.postSaleSlips.includes("upsells")) l.push("Upsell opportunities not surfaced");
    return l;
  }, [state]);

  const modules = useMemo(() => {
    const m = ["Revenue Boardroom", "Customer Journey Twin", "Growth Advisor Board"];
    if (state.revenueSources.includes("proposals")) m.push("Quote Studio");
    if (state.revenueSources.includes("appointments") || state.whatCloses.includes("call")) m.push("Call Desk");
    if (state.businessTypes.includes("ecommerce")) m.push("Conversion Lab");
    if (state.businessTypes.includes("local")) m.push("Reputation Engine");
    if (state.businessTypes.includes("membership") || state.revenueSources.includes("memberships")) m.push("Membership Office");
    m.push("Automation Office", "Leak Detector", "Opportunity Board");
    return m;
  }, [state]);

  const importSummary = useMemo(() => {
    const items: { label: string; count: string }[] = [];
    if (state.connectedSystems.length > 0) items.push({ label: "Systems to connect", count: `${state.connectedSystems.length}` });
    if (state.importedFiles.length > 0) items.push({ label: "Import types selected", count: `${state.importedFiles.length}` });
    if (state.uploadedArtifacts.length > 0) items.push({ label: "Materials for analysis", count: `${state.uploadedArtifacts.length}` });
    if (state.pastedUrls.length > 0) items.push({ label: "URLs for inference", count: `${state.pastedUrls.length}` });
    return items;
  }, [state]);

  return (
    <div className="space-y-6">
      <DemoModeBadge />
      <ScreenHeader icon={Brain} title="Here's what SITA understands so far" subtitle="Review and confirm — or go back to refine" color="text-primary" />

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div><p className="text-muted-foreground mb-1">Business</p><p className="font-medium text-foreground">{state.businessName || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Type</p><p className="font-medium text-foreground">{state.businessTypes.join(", ") || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Stage</p><p className="font-medium text-foreground capitalize">{state.businessStage}</p></div>
            <div><p className="text-muted-foreground mb-1">Revenue</p><p className="font-medium text-foreground">{state.revenueSources.slice(0, 3).join(", ") || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Sources</p><p className="font-medium text-foreground">{state.leadSources.slice(0, 3).join(", ") || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Bottlenecks</p><p className="font-medium text-foreground">{state.growthBottlenecks.length} identified</p></div>
          </div>
        </CardContent>
      </Card>

      {signals.length > 0 && (
        <Card className="bg-primary/5 border-primary/15">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /><p className="text-xs font-semibold text-foreground">SITA Detected Signals</p></div>
            <div className="space-y-1.5">
              {signals.map((sig, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary text-[8px]">{sig.confidence}%</Badge>
                  <p className="text-[11px] text-muted-foreground">{sig.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" />Likely Strengths</p>
            {strengths.map((s, i) => <p key={i} className="text-[11px] text-muted-foreground ml-5 mb-1">• {s}</p>)}
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-400" />Likely Leaks</p>
            {leaks.length > 0 ? leaks.map((l, i) => <p key={i} className="text-[11px] text-muted-foreground ml-5 mb-1">• {l}</p>) : <p className="text-[11px] text-muted-foreground ml-5">None detected yet</p>}
          </CardContent>
        </Card>
      </div>

      {importSummary.length > 0 && (
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-2">Import & Connection Summary</p>
            <div className="grid grid-cols-2 gap-2">
              {importSummary.map(item => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  <Badge className="bg-primary/10 text-primary text-[9px]">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-foreground mb-3">Office modules that will matter most</p>
          <div className="flex flex-wrap gap-1.5">
            {modules.map(m => <Badge key={m} className="bg-primary/10 text-primary text-[9px]">{m}</Badge>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
