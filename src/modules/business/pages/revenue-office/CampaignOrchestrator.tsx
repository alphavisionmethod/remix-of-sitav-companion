import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, MessageSquare, Play, Pause, Plus, Users, BarChart3, Clock, ArrowRight, AlertTriangle, TrendingUp, Send, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCampaigns } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Typography } from "@/platform/sita/components/sita/Typography";

// Inline static configuration (was seed data)
const REV_CAMPAIGNS: any[] = [];
const REV_SEGMENTS: any[] = [];
const CAMPAIGN_ATTRIBUTION: any[] = [];
const CAMPAIGN_FATIGUE: any[] = [];
const DELIVERABILITY: any[] = [];






interface AttributionRow {
  campaign: string;
  channel: string;
  sent?: number;
  impressions?: number;
  registered?: number;
  clicked?: number;
  clicks?: number;
  attended?: number;
  opened?: number;
  leads?: number;
  responded?: number;
  converted: number;
  revenue: string;
  roi: string;
  cost: string;
}


export default function CampaignOrchestrator() {
  const { data: liveCampaigns, isLoading } = useCampaigns();
  const [tab, setTab] = useState("campaigns");

  const CAMPAIGNS = (liveCampaigns?.map((c: Record<string, any>) => ({
    name: c.name, type: c.channel || "email", status: c.status, subscribers: c.audience_size || 0,
    openRate: c.open_rate || 0, clickRate: c.click_rate || 0, conversions: c.conversions || 0,
    revenue: `$${c.revenue_generated || 0}`, steps: c.steps || 0, completionRate: c.completion_rate || 0,
  })) ?? []);

  if (isLoading) {
    return (
      <PageShell width="wide" className="space-y-6">
<Skeleton className="h-8 w-64" />
        <div className="flex gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-36 rounded-xl" />)}</div>
        <Skeleton className="h-32 rounded-xl" />
      </PageShell>
    );
  }

  if (CAMPAIGNS.length === 0) {
    return (
      <PageShell width="wide" className="space-y-6">
<Typography role="appTitle">Campaign Orchestrator</Typography>
        <EmptyState icon={Zap} title="No campaigns yet" description="Create your first campaign to start automating growth." />
      </PageShell>
    );
  }

  return (
    <PageShell width="wide" className="space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <Typography role="appTitle">Campaign Orchestrator</Typography>
            <p className="text-sm text-muted-foreground">Email, SMS, lifecycle automation with attribution & fatigue intelligence</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Campaign</Button>
        </div>
      </motion.div>

      {/* Segment Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {([] as any[]).map(s => (
          <Card key={s.name} className="bg-card/50 border-border/50 min-w-[150px] flex-shrink-0 cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.name}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-foreground">{s.count}</span>
                <span className="text-xs text-green-400">{s.growth}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="campaigns" className="text-[10px] h-7 px-2.5 gap-1"><Mail className="h-3 w-3" />Campaigns</TabsTrigger>
          <TabsTrigger value="attribution" className="text-[10px] h-7 px-2.5 gap-1"><BarChart3 className="h-3 w-3" />Attribution</TabsTrigger>
          <TabsTrigger value="fatigue" className="text-[10px] h-7 px-2.5 gap-1"><AlertTriangle className="h-3 w-3" />Fatigue</TabsTrigger>
          <TabsTrigger value="health" className="text-[10px] h-7 px-2.5 gap-1"><Shield className="h-3 w-3" />Deliverability</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Campaigns List */}
          <TabsContent value="campaigns">
            <div className="space-y-4">
              {CAMPAIGNS.map((c: any, i: number) => (
                <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {c.type === "email" ? <Mail className="w-4 h-4 text-primary" /> : <Zap className="w-4 h-4 text-primary" />}
                          <div>
                            <p className="font-medium text-foreground">{c.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                              <span className="text-xs text-muted-foreground">{c.steps} steps</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{c.revenue}</p>
                            <p className="text-xs text-muted-foreground">revenue</p>
                          </div>
                          <Button variant="ghost" size="sm" aria-label={c.status === "active" ? "Pause campaign" : "Start campaign"}>
                            {c.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      {c.status === "active" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div><p className="text-xs text-muted-foreground">Subscribers</p><p className="text-sm font-medium text-foreground">{c.subscribers}</p></div>
                          <div><p className="text-xs text-muted-foreground">Open Rate</p><p className="text-sm font-medium text-foreground">{c.openRate}%</p></div>
                          <div><p className="text-xs text-muted-foreground">Click Rate</p><p className="text-sm font-medium text-foreground">{c.clickRate}%</p></div>
                          <div><p className="text-xs text-muted-foreground">Completion</p><Progress value={c.completionRate} className="h-1.5 mt-1.5" /></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Campaign Attribution & ROI</h3>
              {([] as any[]).map((a, i) => (
                <motion.div key={a.campaign} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{a.campaign}</p>
                          <Badge variant="outline" className="text-[10px]">{a.channel}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400">ROI {a.roi}</Badge>
                          <span className="text-sm font-bold text-foreground">{a.revenue}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center text-xs">
                        <div>
                          <p className="font-bold text-foreground">{(a as AttributionRow).sent ?? (a as AttributionRow).impressions ?? (a as AttributionRow).registered}</p>
                          <p className="text-muted-foreground">{a.channel === "Paid" ? "Impressions" : a.channel === "Event" ? "Registered" : "Sent"}</p>
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{(a as AttributionRow).clicked ?? (a as AttributionRow).clicks ?? (a as AttributionRow).attended ?? (a as AttributionRow).opened}</p>
                          <p className="text-muted-foreground">{a.channel === "Event" ? "Attended" : a.channel === "Email" ? "Opened" : "Clicked"}</p>
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{(a as AttributionRow).leads ?? (a as AttributionRow).responded}</p>
                          <p className="text-muted-foreground">Leads</p>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-400">{a.converted}</p>
                          <p className="text-muted-foreground">Converted</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>Cost: {a.cost}</span>
                        <span>Revenue: {a.revenue}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Fatigue Tab */}
          <TabsContent value="fatigue">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Audience Fatigue Monitor
              </h3>
              {([] as any[]).map((f, i) => (
                <Card key={f.segment} className={`border-border/50 ${f.status === "over" ? "bg-red-500/5 border-red-500/20" : "bg-card/50"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{f.segment}</p>
                        <Badge variant={f.status === "over" ? "destructive" : "default"} className="text-[10px]">
                          {f.status === "over" ? "Over Threshold" : "OK"}
                        </Badge>
                      </div>
                      <span className="text-sm font-bold text-foreground">{f.messagesThisWeek}/{f.threshold} msgs/week</span>
                    </div>
                    <Progress value={(f.messagesThisWeek / f.threshold) * 100} className="h-1.5 mb-2" />
                    <p className="text-xs text-muted-foreground">{f.recommendation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Deliverability Tab */}
          <TabsContent value="health">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Email Deliverability Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {([] as any[]).map(d => (
                  <Card key={d.metric} className={`border-border/50 ${d.status === "warning" ? "bg-amber-500/5 border-amber-500/20" : "bg-card/50"}`}>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{d.metric}</p>
                      <p className={`text-2xl font-bold ${d.status === "healthy" ? "text-emerald-400" : "text-amber-400"}`}>
                        {d.value}{d.metric.includes("Rate") ? "%" : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">Target: {d.target}{d.metric.includes("Rate") ? "%" : ""}</p>
                      <Badge variant={d.status === "healthy" ? "default" : "secondary"} className="text-[9px] mt-2">{d.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </PageShell>
  );
}
