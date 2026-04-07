import { motion } from "framer-motion";
import { Zap, Mail, MessageSquare, Play, Pause, Plus, Users, BarChart3, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useCampaigns } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";

const DEMO_CAMPAIGNS = [
  { name: "Welcome Sequence", type: "email", status: "active", subscribers: 234, openRate: 68.4, clickRate: 24.2, conversions: 18, revenue: "$5,400", steps: 5, completionRate: 72 },
  { name: "Re-Engagement Series", type: "email", status: "active", subscribers: 89, openRate: 42.1, clickRate: 12.8, conversions: 6, revenue: "$2,400", steps: 4, completionRate: 45 },
  { name: "Upsell After Purchase", type: "automation", status: "active", subscribers: 47, openRate: 55.3, clickRate: 18.6, conversions: 8, revenue: "$6,800", steps: 3, completionRate: 82 },
  { name: "Holiday Campaign 2026", type: "email", status: "draft", subscribers: 0, openRate: 0, clickRate: 0, conversions: 0, revenue: "$0", steps: 6, completionRate: 0 },
];

const DEMO_SEGMENTS = [
  { name: "All Contacts", count: 454, growth: "+12" },
  { name: "Active Customers", count: 67, growth: "+3" },
  { name: "Warm Leads", count: 89, growth: "+8" },
  { name: "At-Risk", count: 14, growth: "-2" },
  { name: "VIP / Advocates", count: 12, growth: "+1" },
];

export default function CampaignOrchestrator() {
  const { isDemoMode } = useDataMode();
  const { data: liveCampaigns, isLoading } = useCampaigns();

  const CAMPAIGNS = isDemoMode ? DEMO_CAMPAIGNS : (liveCampaigns?.map((c: any) => ({
    name: c.name, type: c.channel || "email", status: c.status, subscribers: c.audience_size || 0,
    openRate: c.open_rate || 0, clickRate: c.click_rate || 0, conversions: c.conversions || 0,
    revenue: `$${c.revenue_generated || 0}`, steps: c.steps || 0, completionRate: c.completion_rate || 0,
  })) ?? DEMO_CAMPAIGNS);

  const SEGMENTS = isDemoMode ? DEMO_SEGMENTS : DEMO_SEGMENTS;

  if (!isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-36 rounded-xl" />)}</div>
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!isDemoMode && CAMPAIGNS.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <h1 className="text-2xl font-bold text-foreground">Campaign Orchestrator</h1>
        <EmptyState icon={Zap} title="No campaigns yet" description="Create your first campaign to start automating growth." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaign Orchestrator</h1>
            <p className="text-sm text-muted-foreground">Email, SMS, and lifecycle automation with intelligence</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Campaign</Button>
        </div>
      </motion.div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {SEGMENTS.map(s => (
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
    </div>
  );
}
