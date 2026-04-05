import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, TrendingUp, AlertTriangle, ExternalLink, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const STATS = [
  { label: "Average Rating", value: "4.8", icon: Star },
  { label: "Total Reviews", value: "186", icon: MessageCircle },
  { label: "NPS Score", value: "72", icon: ThumbsUp },
  { label: "Response Rate", value: "96%", icon: TrendingUp },
];

const REVIEWS = [
  { author: "Sarah K.", rating: 5, text: "Absolutely transformed our business strategy. The coaching sessions were invaluable.", platform: "Google", date: "2 days ago", responded: true },
  { author: "James C.", rating: 5, text: "Best investment we've made this year. Clear, actionable, and premium.", platform: "Trustpilot", date: "5 days ago", responded: true },
  { author: "Michael R.", rating: 4, text: "Great results overall, scheduling could be smoother.", platform: "Google", date: "1 week ago", responded: false },
  { author: "Lisa W.", rating: 5, text: "The VIP Day was worth every penny. Highly recommend.", platform: "Google", date: "2 weeks ago", responded: true },
  { author: "David P.", rating: 3, text: "Good content but felt rushed at times.", platform: "Yelp", date: "3 weeks ago", responded: false },
];

const RATING_DIST = [
  { stars: 5, count: 142, pct: 76 },
  { stars: 4, count: 28, pct: 15 },
  { stars: 3, count: 10, pct: 5 },
  { stars: 2, count: 4, pct: 2 },
  { stars: 1, count: 2, pct: 1 },
];

export default function ReputationEngine() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Reputation Engine</h1>
        <p className="text-sm text-muted-foreground">Reviews, testimonials, NPS, and reputation monitoring</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Rating Distribution</CardTitle></CardHeader>
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

        {/* Recent Reviews */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Reviews</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs"><Send className="w-3 h-3 mr-1" /> Request Reviews</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{r.author}</span>
                    <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                    <Badge variant="outline" className="text-xs">{r.platform}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                    {r.responded ? <Badge className="text-xs bg-green-500/20 text-green-400">Responded</Badge> : <Button variant="ghost" size="sm" className="text-xs h-6">Reply</Button>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
