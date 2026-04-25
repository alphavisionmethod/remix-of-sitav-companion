import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, CheckCircle, Sparkles, Target, ArrowRight, BarChart3, Zap, Phone, FileText, Star, Search, TrendingUp, Users } from "lucide-react";
import { ScreenHeader } from "../primitives";
import { inferBusinessSignals } from "../branching";
import type { ScreenProps } from "../types";

const MODULE_REASONS: Record<string, { icon: any; reason: string }> = {
  "Quote Studio": { icon: FileText, reason: "Proposal-driven revenue detected" },
  "Call Desk": { icon: Phone, reason: "Call-centric sales motion" },
  "Conversion Lab": { icon: TrendingUp, reason: "E-commerce conversion optimization" },
  "Reputation Engine": { icon: Star, reason: "Local business reputation management" },
  "Membership Office": { icon: Users, reason: "Membership/subscription model" },
  "Automation Office": { icon: Zap, reason: "Trust-calibrated automation" },
  "Leak Detector": { icon: Search, reason: "Revenue leakage monitoring" },
  "Opportunity Board": { icon: TrendingUp, reason: "Growth opportunity ranking" },
  "Revenue Boardroom": { icon: BarChart3, reason: "Executive overview" },
  "Customer Journey Twin": { icon: Target, reason: "Journey mapping & leak detection" },
  "Growth Advisor Board": { icon: Brain, reason: "AI advisor recommendations" },
};

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

  const revenueSrcWeights = useMemo(() => {
    const sources = state.revenueSources.length > 0 ? state.revenueSources : ["mixed"];
    const max = sources.length;
    return sources.map((s, i) => ({ label: s, weight: Math.round(((max - i) / max) * 100) }));
  }, [state.revenueSources]);

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
      <ScreenHeader icon={Brain} title="Here's what SITA understands so far" subtitle="Review and confirm — or go back to refine" color="text-primary" />

      {/* Business DNA Visualization */}
      <Card className="bg-primary/5 border-primary/20 overflow-hidden">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary" />Business DNA</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-5">
            <div><p className="text-muted-foreground mb-1">Business</p><p className="font-medium text-foreground">{state.businessName || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Type</p><p className="font-medium text-foreground">{state.businessTypes.join(", ") || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Stage</p><p className="font-medium text-foreground capitalize">{state.businessStage}</p></div>
            <div><p className="text-muted-foreground mb-1">Sources</p><p className="font-medium text-foreground">{state.leadSources.slice(0, 3).join(", ") || "—"}</p></div>
            <div><p className="text-muted-foreground mb-1">Team</p><p className="font-medium text-foreground capitalize">{state.teamSize}</p></div>
            <div><p className="text-muted-foreground mb-1">Bottlenecks</p><p className="font-medium text-foreground">{state.growthBottlenecks.length} identified</p></div>
          </div>

          {/* Revenue Source Bars */}
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Revenue Mix</p>
          <div className="space-y-1.5">
            {revenueSrcWeights.map((src, i) => (
              <motion.div key={src.label} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: i * 0.1, duration: 0.4 }} style={{ transformOrigin: "left" }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 capitalize truncate">{src.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${src.weight}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                      className="h-full rounded-full bg-primary/60" />
                  </div>
                  <span className="text-[9px] text-muted-foreground w-8 text-right">{src.weight}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journey Flow Visualization */}
      {state.journeyStages.length > 0 && (
        <Card className="bg-card/60 border-border/40 overflow-hidden">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Target className="h-3.5 w-3.5 text-blue-400" />Journey Flow</p>
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
              {state.journeyStages.map((step, i) => {
                const isPain = state.journeyPainPoints.some(p => p.toLowerCase().includes(step.toLowerCase().slice(0, 4)));
                return (
                  <div key={i} className="flex items-center gap-1 flex-shrink-0">
                    <div className={`px-2 py-1.5 rounded-lg border text-[9px] font-medium whitespace-nowrap ${
                      isPain ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-primary/10 border-primary/20 text-primary"
                    }`}>
                      {step}
                      {isPain && <AlertTriangle className="h-2.5 w-2.5 inline ml-1" />}
                    </div>
                    {i < state.journeyStages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* What SITA Will Build For You */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-primary" />What SITA will build for you</p>
          <div className="space-y-2">
            {modules.map((m, i) => {
              const meta = MODULE_REASONS[m];
              const ModIcon = meta?.icon || BarChart3;
              return (
                <motion.div key={m} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20">
                  <div className="p-1 rounded bg-primary/10"><ModIcon className="h-3 w-3 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground">{m}</p>
                    {meta && <p className="text-[8px] text-muted-foreground truncate">{meta.reason}</p>}
                  </div>
                  <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
