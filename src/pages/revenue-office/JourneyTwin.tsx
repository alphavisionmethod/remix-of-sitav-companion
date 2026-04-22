import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Route, Eye, MousePointer, Mail, Phone, CreditCard, Star, ArrowRight, Clock, Zap, AlertTriangle, Users, Heart, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DEMO_JOURNEY_STAGES } from "@/data/seed/revenue-office";
import { useState, useMemo } from "react";
import { useCustomerJourneyStages } from "@/hooks/use-revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";


const AUTOMATION_OVERLAY = [
  { stage: "Awareness", automations: [{ name: "Lead Magnet Delivery", status: "active", coverage: 94 }, { name: "Welcome Email Sequence", status: "active", coverage: 87 }] },
  { stage: "Interest", automations: [{ name: "Nurture Drip (5-part)", status: "active", coverage: 72 }, { name: "Retarget Pixel", status: "degraded", coverage: 45 }] },
  { stage: "Consideration", automations: [{ name: "Case Study Sender", status: "active", coverage: 68 }, { name: "Booking Reminder", status: "inactive", coverage: 0 }] },
  { stage: "Decision", automations: [{ name: "Proposal Follow-Up", status: "active", coverage: 81 }, { name: "Discount Trigger (7-day)", status: "active", coverage: 55 }] },
  { stage: "Onboarding", automations: [{ name: "Welcome Kit", status: "active", coverage: 100 }, { name: "Check-in Sequence", status: "degraded", coverage: 60 }] },
  { stage: "Retention", automations: [{ name: "Monthly Health Check", status: "active", coverage: 78 }, { name: "Renewal Reminder (30d)", status: "active", coverage: 92 }] },
  { stage: "Advocacy", automations: [{ name: "Review Request (post-win)", status: "active", coverage: 42 }, { name: "Referral Incentive", status: "inactive", coverage: 0 }] },
];

const STALL_DETECTION = [
  { stage: "Interest", stalled: 18, avgDays: 12, revenue: "$8,400", reason: "No nurture after webinar" },
  { stage: "Consideration", stalled: 7, avgDays: 21, revenue: "$14,200", reason: "Proposal not sent" },
  { stage: "Decision", stalled: 4, avgDays: 9, revenue: "$22,800", reason: "Awaiting stakeholder buy-in" },
];

const ADVOCATE_TRACKING = [
  { name: "Sarah Chen", company: "TechFlow", referrals: 3, reviews: 2, nps: 10, revenueGenerated: "$18,400" },
  { name: "Marcus Reid", company: "Bloom Studio", referrals: 1, reviews: 1, nps: 9, revenueGenerated: "$6,200" },
  { name: "Lisa Wang", company: "Carter Legal", referrals: 2, reviews: 3, nps: 10, revenueGenerated: "$12,800" },
];

const CHURN_EXITS = [
  { stage: "Interest → Churn", count: 23, topReason: "No follow-up within 48hrs", recoverable: 14 },
  { stage: "Onboarding → Churn", count: 5, topReason: "Poor first experience", recoverable: 2 },
  { stage: "Retention → Churn", count: 3, topReason: "Price sensitivity + competitor offer", recoverable: 1 },
];

const statusColor = (s: string) => s === "active" ? "text-[hsl(var(--trust-safe))]" : s === "degraded" ? "text-orange-400" : "text-muted-foreground";
const statusBg = (s: string) => s === "active" ? "bg-[hsl(var(--trust-safe))]/10" : s === "degraded" ? "bg-orange-400/10" : "bg-muted/20";

export default function JourneyTwin() {
  const { isDemo: isDemoMode } = useAuth();
  const { data: liveJourneyStages } = useCustomerJourneyStages();
  const JOURNEY_STAGES = isDemoMode ? DEMO_JOURNEY_STAGES : (liveJourneyStages && liveJourneyStages.length > 0 ? liveJourneyStages.map((s: any) => ({
    stage: s.stage_name || s.name || "Unknown",
    metrics: { entered: s.entered_count || 0, conversion: `${s.conversion_rate || 0}%`, exited: s.exited_count || 0 },
    touchpoints: (s.touchpoints as any[]) || [],
  })) : DEMO_JOURNEY_STAGES);
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalEntered = JOURNEY_STAGES[0]?.metrics.entered ?? 0;
  const totalConverted = JOURNEY_STAGES[JOURNEY_STAGES.length - 1]?.metrics.entered ?? 0;
  const overallConversion = totalEntered > 0 ? Math.round((totalConverted / totalEntered) * 100) : 0;
  const totalStalled = STALL_DETECTION.reduce((a, s) => a + s.stalled, 0);
  const totalAdvocateRevenue = ADVOCATE_TRACKING.reduce((a, ad) => a + parseInt(ad.revenueGenerated.replace(/[^0-9]/g, "")), 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Route className="w-6 h-6 text-primary" /> Customer Journey Twin
        </h1>
        <p className="text-sm text-muted-foreground">Living model — where leads enter, move, stall, convert, churn, and become advocates</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Journey Throughput", v: `${overallConversion}%`, sub: `${totalEntered} → ${totalConverted}`, c: "text-primary" },
          { l: "Active Stages", v: JOURNEY_STAGES.length, sub: "Full lifecycle", c: "text-[hsl(var(--trust-safe))]" },
          { l: "Stalled Leads", v: totalStalled, sub: "Across 3 stages", c: "text-orange-400" },
          { l: "Advocates", v: ADVOCATE_TRACKING.length, sub: `$${(totalAdvocateRevenue/1000).toFixed(1)}k generated`, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Churn Exits", v: CHURN_EXITS.reduce((a, c) => a + c.count, 0), sub: `${CHURN_EXITS.reduce((a, c) => a + c.recoverable, 0)} recoverable`, c: "text-destructive" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Journey Flow */}
      <div className="space-y-3">
        {JOURNEY_STAGES.map((stage, si) => {
          const auto = AUTOMATION_OVERLAY.find(a => a.stage === stage.stage);
          const stall = STALL_DETECTION.find(s => s.stage === stage.stage);
          const isExpanded = expanded === stage.stage;
          const healthPct = stage.metrics.entered > 0
            ? Math.round((stage.metrics.entered - (stage.metrics.exited || 0)) / stage.metrics.entered * 100)
            : 100;

          return (
            <motion.div key={stage.stage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.06 }}>
              <Card className="bg-card/50 border-border/50 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : stage.stage)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Stage Label + Health */}
                    <div className="w-36 flex-shrink-0 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-foreground">{stage.stage}</h3>
                        {stall && <Badge variant="outline" className="text-[9px] text-orange-400 border-orange-400/30">{stall.stalled} stalled</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{stage.metrics.entered} entered</p>
                      <p className="text-xs text-primary font-medium">{stage.metrics.conversion} through</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Health</span>
                          <span className={healthPct >= 80 ? "text-[hsl(var(--trust-safe))]" : healthPct >= 50 ? "text-orange-400" : "text-destructive"}>{healthPct}%</span>
                        </div>
                        <Progress value={healthPct} className="h-1" />
                      </div>
                    </div>

                    {/* Touchpoints Flow */}
                    <div className="flex items-center gap-3 overflow-x-auto flex-1">
                      {stage.touchpoints.map((tp, ti) => (
                        <div key={ti} className="flex items-center gap-2">
                          <div className="min-w-[130px] p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
                            <tp.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                            <p className="text-xs font-medium text-foreground">{tp.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1"><Clock className="w-3 h-3" />{tp.time}</p>
                          </div>
                          {ti < stage.touchpoints.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                        </div>
                      ))}
                    </div>

                    {/* Exit + Expand */}
                    <div className="w-24 flex-shrink-0 text-right pt-2 flex flex-col items-end gap-1">
                      {stage.metrics.exited > 0 && (
                        <>
                          <p className="text-xs text-red-400 font-medium">↓ {stage.metrics.exited}</p>
                          <p className="text-[10px] text-muted-foreground">dropped</p>
                        </>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded: Automation Overlay + Stall Details */}
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border/30 space-y-3">
                      {/* Automation Overlay */}
                      {auto && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Automation Support</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {auto.automations.map(am => (
                              <div key={am.name} className={`p-2 rounded-lg border border-border/30 ${statusBg(am.status)}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-foreground">{am.name}</span>
                                  <Badge variant="outline" className={`text-[9px] ${statusColor(am.status)}`}>{am.status}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={am.coverage} className="h-1 flex-1" />
                                  <span className="text-[10px] text-muted-foreground">{am.coverage}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stall Detection */}
                      {stall && (
                        <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-xs font-medium text-orange-400">Stall Detected</span>
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-xs">
                            <div><span className="text-muted-foreground">Stuck:</span> <span className="font-medium text-foreground">{stall.stalled} leads</span></div>
                            <div><span className="text-muted-foreground">Avg days:</span> <span className="font-medium text-foreground">{stall.avgDays}d</span></div>
                            <div><span className="text-muted-foreground">At risk:</span> <span className="font-medium text-red-400">{stall.revenue}</span></div>
                            <div><span className="text-muted-foreground">Cause:</span> <span className="font-medium text-foreground">{stall.reason}</span></div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
              {si < JOURNEY_STAGES.length - 1 && (
                <div className="flex justify-center py-1"><div className="w-px h-4 bg-border/50" /></div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Churn Exit Map */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-destructive" /> Churn Exit Mapping</h3>
          <div className="space-y-2">
            {CHURN_EXITS.map(ce => (
              <div key={ce.stage} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{ce.stage}</p>
                  <p className="text-xs text-muted-foreground">Top reason: {ce.topReason}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-destructive font-medium">{ce.count} exits</span>
                  <Badge variant="outline" className="text-[hsl(var(--trust-safe))]">{ce.recoverable} recoverable</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advocate Tracking */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> Advocate Tracking</h3>
          <div className="space-y-2">
            {ADVOCATE_TRACKING.map(ad => (
              <div key={ad.name} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/20">
                <div>
                  <p className="text-sm font-medium text-foreground">{ad.name}</p>
                  <p className="text-xs text-muted-foreground">{ad.company} · NPS {ad.nps}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">{ad.referrals} referrals</span>
                  <span className="text-muted-foreground">{ad.reviews} reviews</span>
                  <span className="text-[hsl(var(--trust-safe))] font-medium">{ad.revenueGenerated} generated</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
