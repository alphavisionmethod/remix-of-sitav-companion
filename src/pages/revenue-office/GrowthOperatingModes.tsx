import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Radio, Zap, UserX, Megaphone, Package, Heart, Shield, Users, TrendingUp, CheckCircle, AlertTriangle, Clock, ArrowRight, Settings, Brain, Target } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Typography } from "@/components/sita/Typography";

interface OperatingMode {
  name: string;
  icon: any;
  color: string;
  desc: string;
  emphasis: string;
  active: boolean;
  kpis: { label: string; value: string; trend: "up" | "down" | "stable" }[];
  advisorFocus: string[];
  automations: { name: string; status: "active" | "paused" | "suggested" }[];
  risks: string[];
  transitionRules: string[];
}

const modes: OperatingMode[] = [
  { name: "Quiet Monitoring", icon: Radio, color: "text-slate-400", desc: "Passive observation — advisors watch, no active campaigns", emphasis: "Boardroom health, anomaly detection", active: false,
    kpis: [{ label: "Anomalies Detected", value: "2", trend: "stable" }, { label: "Health Score", value: "87%", trend: "up" }],
    advisorFocus: ["Anomaly detection", "Baseline monitoring", "Trend identification"],
    automations: [{ name: "Health alerts", status: "active" }, { name: "Weekly digest", status: "active" }],
    risks: ["May miss time-sensitive opportunities", "Competitors may gain ground"],
    transitionRules: ["Switch to Lead Recovery if >10 leads go cold", "Switch to Campaign Launch before seasonal peaks"]
  },
  { name: "Lead Recovery", icon: UserX, color: "text-amber-400", desc: "Focus on reactivating dropped, stalled, and dormant leads", emphasis: "Follow-up queues, reactivation campaigns, CRM urgency", active: false,
    kpis: [{ label: "Stale Leads", value: "34", trend: "down" }, { label: "Recovery Rate", value: "22%", trend: "up" }, { label: "Recovered Value", value: "$18.4K", trend: "up" }],
    advisorFocus: ["CRM follow-up urgency", "Reactivation sequence optimization", "Lead scoring recalibration"],
    automations: [{ name: "Auto follow-up sequences", status: "active" }, { name: "Lead aging alerts", status: "active" }, { name: "Win-back campaigns", status: "suggested" }],
    risks: ["Over-contacting may damage relationships", "Low-quality leads consuming resources"],
    transitionRules: ["Return to Campaign Launch once stale leads < 10", "Escalate to Retention Mode if churn signals detected"]
  },
  { name: "Campaign Launch", icon: Megaphone, color: "text-blue-400", desc: "Active campaign mode — launch, monitor, optimize", emphasis: "Campaign health, conversion, deliverability, fatigue", active: true,
    kpis: [{ label: "Active Campaigns", value: "3", trend: "stable" }, { label: "Conversion Rate", value: "4.2%", trend: "up" }, { label: "Deliverability", value: "98.1%", trend: "stable" }, { label: "Fatigue Risk", value: "Low", trend: "stable" }],
    advisorFocus: ["Campaign performance optimization", "A/B test analysis", "Audience fatigue monitoring", "Budget pacing"],
    automations: [{ name: "Send optimization", status: "active" }, { name: "Auto A/B testing", status: "active" }, { name: "Budget reallocation", status: "paused" }, { name: "Fatigue circuit breaker", status: "active" }],
    risks: ["Audience fatigue if campaigns run too long", "Budget overspend without pacing"],
    transitionRules: ["Switch to Offer Optimization if conversion drops >15%", "Switch to Retention after campaign cycle ends"]
  },
  { name: "Offer Optimization", icon: Package, color: "text-purple-400", desc: "Testing and refining offers, pricing, and packaging", emphasis: "Conversion per offer, pricing signals, A/B results", active: false,
    kpis: [{ label: "Offers Tested", value: "4", trend: "stable" }, { label: "Best Performer", value: "Pro Bundle", trend: "up" }, { label: "Avg Conversion", value: "6.8%", trend: "up" }],
    advisorFocus: ["Pricing elasticity analysis", "Bundle effectiveness", "Offer-market fit"],
    automations: [{ name: "Price A/B tests", status: "suggested" }, { name: "Bundle recommendations", status: "active" }],
    risks: ["Price changes may confuse existing customers", "Too many variants reduce clarity"],
    transitionRules: ["Lock winning offer and switch to Campaign Launch", "Switch to Scale Mode once best offer confirmed"]
  },
  { name: "Retention Mode", icon: Heart, color: "text-pink-400", desc: "Protect existing revenue — reduce churn, improve satisfaction", emphasis: "Churn risk, renewal timing, client health, NPS", active: false,
    kpis: [{ label: "Churn Risk", value: "8 clients", trend: "down" }, { label: "NPS", value: "72", trend: "up" }, { label: "Renewal Rate", value: "89%", trend: "stable" }],
    advisorFocus: ["Churn prediction", "Client health monitoring", "Renewal optimization", "Satisfaction improvement"],
    automations: [{ name: "Churn risk alerts", status: "active" }, { name: "Renewal reminders", status: "active" }, { name: "NPS surveys", status: "active" }, { name: "Win-back sequences", status: "suggested" }],
    risks: ["Over-communicating to at-risk clients", "Ignoring acquisition while focusing on retention"],
    transitionRules: ["Switch to Lead Recovery if pipeline dries up", "Switch to Capacity Fill if utilization drops below 60%"]
  },
  { name: "Reputation Repair", icon: Shield, color: "text-red-400", desc: "Address negative sentiment and rebuild trust signals", emphasis: "Review response, sentiment recovery, trust pulse", active: false,
    kpis: [{ label: "Avg Rating", value: "4.2★", trend: "up" }, { label: "Negative Reviews", value: "3", trend: "down" }, { label: "Response Rate", value: "100%", trend: "stable" }],
    advisorFocus: ["Review response drafting", "Sentiment analysis", "Trust signal improvement"],
    automations: [{ name: "Review alerts", status: "active" }, { name: "Response drafts", status: "active" }, { name: "Positive review requests", status: "suggested" }],
    risks: ["Appearing defensive in responses", "Not addressing root causes"],
    transitionRules: ["Switch to Campaign Launch once rating >4.5★", "Maintain parallel with Retention Mode"]
  },
  { name: "Capacity Fill", icon: Users, color: "text-emerald-400", desc: "Fill underused appointment slots and service capacity", emphasis: "Booking utilization, scheduling gaps, upsell opportunities", active: false,
    kpis: [{ label: "Utilization", value: "65%", trend: "up" }, { label: "Empty Slots", value: "12/week", trend: "down" }, { label: "Fill Rate", value: "+8%", trend: "up" }],
    advisorFocus: ["Scheduling optimization", "Last-minute booking campaigns", "Upsell opportunities"],
    automations: [{ name: "Gap-fill campaigns", status: "suggested" }, { name: "Waitlist management", status: "active" }],
    risks: ["Discounting too aggressively to fill slots", "Quality of fill vs value"],
    transitionRules: ["Switch to Scale Mode once utilization >85%", "Switch to Retention Mode if existing client bookings drop"]
  },
  { name: "Scale Mode", icon: TrendingUp, color: "text-cyan-400", desc: "Growth acceleration — aggressive campaigns and expansion", emphasis: "Volume, conversion scaling, channel expansion, team capacity", active: false,
    kpis: [{ label: "Growth Rate", value: "+24%", trend: "up" }, { label: "New Channels", value: "2", trend: "up" }, { label: "Team Capacity", value: "78%", trend: "stable" }],
    advisorFocus: ["Channel expansion", "Volume scaling", "Team capacity planning", "Unit economics"],
    automations: [{ name: "Multi-channel campaigns", status: "suggested" }, { name: "Capacity alerts", status: "active" }, { name: "ROI tracking", status: "active" }],
    risks: ["Scaling before unit economics are proven", "Team burnout", "Quality degradation"],
    transitionRules: ["Switch to Retention Mode if churn spikes", "Switch to Quiet Monitoring for cooldown periods"]
  },
];

export default function GrowthOperatingModes() {
  const [activeMode, setActiveMode] = useState(modes.findIndex(m => m.active));
  const [tab, setTab] = useState("overview");
  const currentMode = modes[activeMode];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <Typography role="appTitle">Growth Operating Modes</Typography>
        <p className="text-muted-foreground">Contextual business modes that change boardroom emphasis, advisor urgency, and workflow priorities</p>
      </div>

      {/* Current mode banner */}
      <Card className="bg-card/50 border-primary/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <currentMode.icon className={`h-6 w-6 ${currentMode.color}`} />
            <div>
              <p className="text-sm font-semibold text-foreground">Current Mode: <span className={currentMode.color}>{currentMode.name}</span></p>
              <p className="text-xs text-muted-foreground">{currentMode.desc}</p>
            </div>
          </div>
          <Badge variant="default" className="text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</Badge>
        </CardContent>
      </Card>

      {/* Mode selector grid */}
      <div className="grid md:grid-cols-4 gap-3">
        {modes.map((m, i) => (
          <Card key={m.name} className={`cursor-pointer transition-all hover:border-primary/30 ${i === activeMode ? "ring-1 ring-primary/50 border-primary/30" : "bg-card/50 border-border/50"}`} onClick={() => setActiveMode(i)}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <m.icon className={`h-4 w-4 ${m.color}`} />
                <span className="text-xs font-semibold text-foreground">{m.name}</span>
              </div>
              {i === modes.findIndex(mm => mm.active) && <Badge className="text-[9px]">Active</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mode detail */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="transitions">Transition Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <currentMode.icon className={`h-6 w-6 ${currentMode.color}`} />
                <div>
                  <h3 className="text-base font-bold text-foreground">{currentMode.name}</h3>
                  <p className="text-xs text-muted-foreground">{currentMode.desc}</p>
                </div>
              </div>
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Emphasis</p>
                <p className="text-xs text-foreground">{currentMode.emphasis}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Advisor Focus Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentMode.advisorFocus.map(f => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Risks in this mode</p>
                {currentMode.risks.map(r => (
                  <div key={r} className="flex items-start gap-2 text-xs text-foreground mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{r}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentMode.kpis.map(kpi => (
              <Card key={kpi.label} className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  <Badge variant={kpi.trend === "up" ? "default" : kpi.trend === "down" ? "destructive" : "secondary"} className="mt-2 text-[9px]">
                    {kpi.trend === "up" ? "↑ Improving" : kpi.trend === "down" ? "↓ Declining" : "→ Stable"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automations" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-2">
              {currentMode.automations.map(a => (
                <div key={a.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-3.5 h-3.5 ${a.status === "active" ? "text-green-400" : a.status === "paused" ? "text-amber-400" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium text-foreground">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.status === "active" ? "default" : a.status === "paused" ? "secondary" : "outline"} className="text-[9px] capitalize">{a.status}</Badge>
                    {a.status === "suggested" && <Button size="sm" variant="outline" className="h-6 text-[10px]">Activate</Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transitions" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-2">
              {currentMode.transitionRules.map(rule => (
                <div key={rule} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                  <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground">{rule}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Switch mode action */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings className="w-3.5 h-3.5" /> Configure Mode Rules
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Brain className="w-3.5 h-3.5" /> Ask Advisor to Recommend Mode
        </Button>
        {activeMode !== modes.findIndex(m => m.active) && (
          <Button size="sm" className="gap-1.5">
            <Target className="w-3.5 h-3.5" /> Switch to {currentMode.name}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
