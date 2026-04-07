import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, TrendingUp, AlertTriangle, ExternalLink, Send, Globe, CheckCircle, Clock, Filter, Eye, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const STATS = [
  { label: "Average Rating", value: "4.8", icon: Star, trend: "+0.1", color: "text-amber-400" },
  { label: "Total Reviews", value: "186", icon: MessageCircle, trend: "+12 this month", color: "text-blue-400" },
  { label: "NPS Score", value: "72", icon: ThumbsUp, trend: "+4", color: "text-emerald-400" },
  { label: "Response Rate", value: "96%", icon: Clock, trend: "+2%", color: "text-purple-400" },
];

const DEMO_REVIEWS = [
  { id: "r1", author: "Sarah K.", rating: 5, text: "Absolutely transformed our business strategy. The coaching sessions were invaluable and the follow-through was exceptional.", platform: "Google", date: "2 days ago", responded: true, sentiment: "positive", helpfulCount: 8 },
  { id: "r2", author: "James C.", rating: 5, text: "Best investment we've made this year. Clear, actionable, and premium. Would recommend to anyone.", platform: "Trustpilot", date: "5 days ago", responded: true, sentiment: "positive", helpfulCount: 12 },
  { id: "r3", author: "Michael R.", rating: 4, text: "Great results overall, scheduling could be smoother. The strategy framework was excellent.", platform: "Google", date: "1 week ago", responded: false, sentiment: "mixed", helpfulCount: 3 },
  { id: "r4", author: "Lisa W.", rating: 5, text: "The VIP Day was worth every penny. Highly recommend for anyone serious about growth.", platform: "Google", date: "2 weeks ago", responded: true, sentiment: "positive", helpfulCount: 15 },
  { id: "r5", author: "David P.", rating: 3, text: "Good content but felt rushed at times. Would have appreciated more follow-up.", platform: "Yelp", date: "3 weeks ago", responded: false, sentiment: "negative", helpfulCount: 1 },
  { id: "r6", author: "Amy T.", rating: 5, text: "Incredible experience from start to finish. The team really cares.", platform: "Google", date: "1 month ago", responded: true, sentiment: "positive", helpfulCount: 6 },
  { id: "r7", author: "Brian M.", rating: 4, text: "Solid program with measurable results. Pricing is fair for the value.", platform: "Trustpilot", date: "1 month ago", responded: true, sentiment: "positive", helpfulCount: 4 },
];

const RATING_DIST = [
  { stars: 5, count: 142, pct: 76 },
  { stars: 4, count: 28, pct: 15 },
  { stars: 3, count: 10, pct: 5 },
  { stars: 2, count: 4, pct: 2 },
  { stars: 1, count: 2, pct: 1 },
];

const PLATFORMS = [
  { name: "Google Business", reviews: 98, rating: 4.9, linked: true, lastSync: "2h ago" },
  { name: "Trustpilot", reviews: 52, rating: 4.7, linked: true, lastSync: "4h ago" },
  { name: "Yelp", reviews: 24, rating: 4.4, linked: true, lastSync: "6h ago" },
  { name: "Facebook", reviews: 12, rating: 4.8, linked: false, lastSync: "—" },
];

const CAMPAIGNS = [
  { name: "Post-VIP Day Review Request", status: "active", sent: 34, responses: 28, convRate: "82%", lastSent: "1d ago" },
  { name: "Quarterly NPS Survey", status: "active", sent: 120, responses: 86, convRate: "72%", lastSent: "2w ago" },
  { name: "3-Month Anniversary", status: "paused", sent: 45, responses: 18, convRate: "40%", lastSent: "1m ago" },
];

const TESTIMONIALS = [
  { author: "Sarah K.", text: "Absolutely transformed our business strategy.", rating: 5, approved: true, featured: true, usedOn: ["landing-page", "funnel-1"] },
  { author: "Lisa W.", text: "The VIP Day was worth every penny.", rating: 5, approved: true, featured: true, usedOn: ["homepage"] },
  { author: "James C.", text: "Best investment we've made this year.", rating: 5, approved: true, featured: false, usedOn: [] },
  { author: "Brian M.", text: "Solid program with measurable results.", rating: 4, approved: false, featured: false, usedOn: [] },
];

export default function ReputationEngine() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("reviews");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reputation Engine</h1>
            <p className="text-sm text-muted-foreground">Reviews, testimonials, NPS, platform monitoring, and review campaigns</p>
          </div>
          <Button size="sm" className="gap-1.5"><Send className="w-3.5 h-3.5" />Request Reviews</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className={cn("w-5 h-5", s.color)} /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-[9px] text-emerald-400">{s.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "reviews", label: "Reviews", icon: MessageCircle },
            { value: "platforms", label: "Platforms", icon: Globe },
            { value: "campaigns", label: "Campaigns", icon: Send },
            { value: "testimonials", label: "Testimonials", icon: Star },
            { value: "analytics", label: "Analytics", icon: BarChart3 },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Rating Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {RATING_DIST.map(r => (
                    <div key={r.stars} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">{r.stars}★</span>
                      <Progress value={r.pct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{r.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Recent Reviews</CardTitle>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[9px] cursor-pointer">All</Badge>
                      <Badge variant="outline" className="text-[9px] cursor-pointer text-red-400">Needs Reply</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DEMO_REVIEWS.map(r => (
                    <div key={r.id} className={cn("p-3 rounded-lg border border-border/30", r.sentiment === "negative" ? "bg-red-500/5" : "bg-muted/10")}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{r.author}</span>
                          <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                          <Badge variant="outline" className="text-[9px]">{r.platform}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{r.date}</span>
                          {r.responded ? (
                            <Badge className="text-[9px] bg-green-500/20 text-green-400">Responded</Badge>
                          ) : (
                            <Button variant="outline" size="sm" className="text-[10px] h-6">Reply</Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.text}</p>
                      <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
                        <ThumbsUp className="w-3 h-3" />{r.helpfulCount} found helpful
                        <Badge variant="secondary" className="text-[8px] capitalize">{r.sentiment}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platforms">
            <h3 className="text-sm font-semibold mb-4">Connected Platforms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLATFORMS.map(p => (
                <Card key={p.name} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                      {p.linked ? (
                        <Badge className="text-[9px] bg-green-500/20 text-green-400">Connected</Badge>
                      ) : (
                        <Button variant="outline" size="sm" className="text-[10px] h-6">Connect</Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-lg font-bold text-foreground">{p.reviews}</p><p className="text-[9px] text-muted-foreground">Reviews</p></div>
                      <div><p className="text-lg font-bold text-amber-400">{p.rating}</p><p className="text-[9px] text-muted-foreground">Rating</p></div>
                      <div><p className="text-xs text-muted-foreground">{p.lastSync}</p><p className="text-[9px] text-muted-foreground">Last Sync</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <h3 className="text-sm font-semibold mb-4">Review Request Campaigns</h3>
            <div className="space-y-3">
              {CAMPAIGNS.map(c => (
                <Card key={c.name} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[9px]">{c.status}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[10px] h-6">{c.status === "active" ? "Pause" : "Resume"}</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center text-xs">
                      <div><p className="font-bold text-foreground">{c.sent}</p><p className="text-muted-foreground">Sent</p></div>
                      <div><p className="font-bold text-foreground">{c.responses}</p><p className="text-muted-foreground">Responses</p></div>
                      <div><p className="font-bold text-emerald-400">{c.convRate}</p><p className="text-muted-foreground">Response Rate</p></div>
                      <div><p className="text-muted-foreground">{c.lastSent}</p><p className="text-muted-foreground">Last Sent</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testimonials">
            <h3 className="text-sm font-semibold mb-4">Testimonial Library</h3>
            <div className="space-y-3">
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{t.author}</span>
                          <div className="flex">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                          {t.featured && <Badge className="text-[8px] bg-primary/20 text-primary">Featured</Badge>}
                          {t.approved ? <Badge className="text-[8px] bg-green-500/20 text-green-400">Approved</Badge> : <Badge variant="secondary" className="text-[8px]">Pending</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{t.text}"</p>
                        {t.usedOn.length > 0 && (
                          <div className="flex gap-1 mt-1.5">{t.usedOn.map(u => <Badge key={u} variant="outline" className="text-[8px]">{u}</Badge>)}</div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Eye className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Zap className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Reviews by Month</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {["Jan", "Feb", "Mar", "Apr"].map((m, i) => {
                    const counts = [8, 11, 14, 12];
                    return (
                      <div key={m} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-6">{m}</span>
                        <div className="flex-1 h-3 bg-muted/20 rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" style={{ width: `${(counts[i] / 14) * 100}%` }} /></div>
                        <span className="text-[10px] text-foreground w-4 text-right">{counts[i]}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Sentiment Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Positive", pct: 82, color: "bg-emerald-400" },
                    { label: "Mixed", pct: 13, color: "bg-amber-400" },
                    { label: "Negative", pct: 5, color: "bg-red-400" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-16">{s.label}</span>
                      <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden"><div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} /></div>
                      <span className="text-[10px] text-foreground w-6 text-right">{s.pct}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
