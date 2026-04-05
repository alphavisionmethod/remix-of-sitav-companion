import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Filter, Target, BarChart3, Zap, Tag, TrendingUp, Mail, Calendar, DollarSign, Clock, Star, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { id: "s1", name: "High-Value Clients", type: "dynamic", contacts: 34, revenue: "$284,000", criteria: ["LTV > $5,000", "Active in last 30d"], color: "border-l-emerald-400", growth: "+3 this month" },
  { id: "s2", name: "Warm Leads (Engaged)", type: "dynamic", contacts: 67, revenue: "$0", criteria: ["Opened 3+ emails", "Visited pricing page", "Not yet converted"], color: "border-l-blue-400", growth: "+8 this week" },
  { id: "s3", name: "At-Risk Clients", type: "dynamic", contacts: 12, revenue: "$48,000", criteria: ["No activity 60+ days", "Previously active", "LTV > $1,000"], color: "border-l-red-400", growth: "+2 this month" },
  { id: "s4", name: "VIP Candidates", type: "smart", contacts: 18, revenue: "$126,000", criteria: ["LTV > $3,000", "NPS 9-10", "Referred others"], color: "border-l-amber-400", growth: "Stable" },
  { id: "s5", name: "Email Unengaged", type: "dynamic", contacts: 89, revenue: "$0", criteria: ["No email open in 90d", "Still subscribed"], color: "border-l-muted", growth: "+12 this month" },
  { id: "s6", name: "Coaching Clients", type: "static", contacts: 24, revenue: "$72,000", criteria: ["Product: Coaching Program", "Active subscription"], color: "border-l-purple-400", growth: "+1 this month" },
  { id: "s7", name: "Webinar Attendees (No Purchase)", type: "dynamic", contacts: 156, revenue: "$0", criteria: ["Attended webinar", "No purchase within 14d"], color: "border-l-cyan-400", growth: "+28 this week" },
  { id: "s8", name: "Repeat Buyers", type: "smart", contacts: 42, revenue: "$210,000", criteria: ["2+ purchases", "Active"], color: "border-l-green-400", growth: "+5 this month" },
];

const SCORING_RULES = [
  { signal: "Visited pricing page", points: 15, category: "Engagement" },
  { signal: "Opened 3+ emails in 7 days", points: 10, category: "Email" },
  { signal: "Booked a call", points: 25, category: "Intent" },
  { signal: "Submitted a form", points: 20, category: "Conversion" },
  { signal: "Replied to email", points: 15, category: "Engagement" },
  { signal: "Watched webinar replay (>50%)", points: 12, category: "Content" },
  { signal: "Downloaded resource", points: 8, category: "Content" },
  { signal: "Referred a friend", points: 30, category: "Advocacy" },
  { signal: "No activity 30+ days", points: -20, category: "Decay" },
  { signal: "Unsubscribed from list", points: -15, category: "Decay" },
];

const TOP_LEADS = [
  { name: "Rachel Green", score: 87, company: "GreenCo", signals: ["Pricing page 5x", "Form submitted", "Email reply"], stage: "Qualified" },
  { name: "Tom Hayes", score: 78, company: "Hayes Group", signals: ["VIP inquiry", "Booked call"], stage: "Proposal" },
  { name: "Mia Zhang", score: 72, company: "Studio Co", signals: ["Webinar attended", "3 emails opened"], stage: "Warm" },
  { name: "Alex Rivera", score: 65, company: "Rivera IO", signals: ["Resource download", "Pricing page 2x"], stage: "Warm" },
  { name: "Jordan Lee", score: 54, company: "Lee & Partners", signals: ["Email opens", "Blog visits"], stage: "Cold" },
];

export default function SegmentationEngine() {
  const [tab, setTab] = useState("segments");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Segmentation & Lead Scoring</h1>
            <p className="text-sm text-muted-foreground">Dynamic audience segments, behavioral scoring, and conversion intelligence</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />New Segment</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Segments", value: SEGMENTS.length, color: "text-foreground" },
          { label: "Total Contacts", value: "442", color: "text-primary" },
          { label: "Scored Leads", value: TOP_LEADS.length, color: "text-blue-400" },
          { label: "At Risk", value: "12", color: "text-red-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "segments", label: "Segments", icon: Users },
            { value: "scoring", label: "Lead Scoring", icon: Target },
            { value: "top-leads", label: "Top Leads", icon: Star },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="segments">
            <div className="space-y-3">
              {SEGMENTS.map(seg => (
                <Card key={seg.id} className={cn("bg-card/50 border-l-2 hover:border-primary/30 transition-colors cursor-pointer", seg.color)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{seg.name}</p>
                          <Badge variant={seg.type === "dynamic" ? "default" : seg.type === "smart" ? "outline" : "secondary"} className="text-[8px]">{seg.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <div className="text-center"><p className="font-bold text-foreground">{seg.contacts}</p><p className="text-[9px] text-muted-foreground">Contacts</p></div>
                        <div className="text-center"><p className="font-bold text-emerald-400">{seg.revenue}</p><p className="text-[9px] text-muted-foreground">Revenue</p></div>
                        <span className="text-[10px] text-muted-foreground">{seg.growth}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">{seg.criteria.map(c => <Badge key={c} variant="outline" className="text-[8px]">{c}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scoring">
            <h3 className="text-sm font-semibold mb-4">Lead Scoring Rules ({SCORING_RULES.length} signals)</h3>
            <div className="space-y-2">
              {SCORING_RULES.map((rule, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    {rule.points > 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                    <div>
                      <p className="text-xs font-medium text-foreground">{rule.signal}</p>
                      <Badge variant="outline" className="text-[8px]">{rule.category}</Badge>
                    </div>
                  </div>
                  <Badge className={cn("text-[10px]", rule.points > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                    {rule.points > 0 ? "+" : ""}{rule.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top-leads">
            <h3 className="text-sm font-semibold mb-4">Highest-Scored Leads</h3>
            <div className="space-y-3">
              {TOP_LEADS.map((lead, i) => (
                <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{lead.name.split(" ").map(n => n[0]).join("")}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-[10px] text-muted-foreground">{lead.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-[9px]">{lead.stage}</Badge>
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                            lead.score >= 75 ? "border-emerald-400 text-emerald-400" : lead.score >= 50 ? "border-amber-400 text-amber-400" : "border-muted-foreground text-muted-foreground"
                          )}>{lead.score}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">{lead.signals.map(s => <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
