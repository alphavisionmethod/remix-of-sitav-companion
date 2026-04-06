import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target, Shield, DollarSign, Users, MessageSquare, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const ADVISORS = [
  {
    name: "Growth Advisor",
    icon: TrendingUp,
    domain: "Acquisition & Expansion",
    stance: "Top-of-funnel is healthy. Recommend scaling paid acquisition while CAC is low. Focus on webinar funnel — highest ROI channel right now.",
    watching: ["Lead volume trends", "Channel ROI", "Market positioning", "Competitor moves"],
    confidence: 0.82,
    recommendation: "Scale acquisition spend 15%",
    type: "opportunity" as const,
  },
  {
    name: "Sales Advisor",
    icon: Target,
    domain: "Pipeline & Conversion",
    stance: "Pipeline velocity is slowing in Enterprise segment. Average deal cycle extended by 8 days. Consider re-qualifying stale opportunities.",
    watching: ["Close rates by segment", "Deal velocity", "Proposal-to-close ratio", "Follow-up discipline"],
    confidence: 0.76,
    recommendation: "Re-qualify 12 stale pipeline deals",
    type: "warning" as const,
  },
  {
    name: "Marketing Advisor",
    icon: Zap,
    domain: "Campaigns & Content",
    stance: "Email engagement is strong — open rates above industry average. Content strategy needs more bottom-of-funnel assets. Landing page conversion has room for optimization.",
    watching: ["Email metrics", "Content performance", "Landing page conversion", "Brand awareness"],
    confidence: 0.79,
    recommendation: "Create 3 case study assets",
    type: "opportunity" as const,
  },
  {
    name: "Retention Advisor",
    icon: Shield,
    domain: "Churn & Loyalty",
    stance: "Overall retention is strong at 91%. Two high-value clients showing disengagement signals. Proactive outreach recommended within 48 hours.",
    watching: ["Engagement scores", "Usage patterns", "Support satisfaction", "Renewal pipeline"],
    confidence: 0.74,
    recommendation: "Immediate outreach to 2 at-risk clients",
    type: "alert" as const,
  },
  {
    name: "Pricing Advisor",
    icon: DollarSign,
    domain: "Monetization & Packaging",
    stance: "Current pricing sits below market median for comparable value. 8-12% increase feasible without significant churn risk. Bundle strategy underutilized.",
    watching: ["Price sensitivity", "Competitive pricing", "Bundle performance", "Discount patterns"],
    confidence: 0.68,
    recommendation: "Test 10% price increase on new customers",
    type: "opportunity" as const,
  },
  {
    name: "Relationship Advisor",
    icon: Users,
    domain: "Customer Success & Advocacy",
    stance: "Referral program underperforming — only 12 advocates active. VIP clients highly satisfied but not being leveraged for testimonials or introductions.",
    watching: ["NPS trends", "Referral pipeline", "Testimonial velocity", "Community engagement"],
    confidence: 0.71,
    recommendation: "Launch structured referral ask to top 20 clients",
    type: "opportunity" as const,
  },
];

export default function GrowthAdvisorBoard() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Growth Advisor Board
        </h1>
        <p className="text-sm text-muted-foreground">Specialized revenue advisor council with structured intelligence</p>
      </motion.div>

      {/* Synthesis */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Board Synthesis</span>
          </div>
          <p className="text-sm text-foreground">The board sees strong fundamentals with opportunity to scale. Key risk is Enterprise pipeline slowdown and 2 at-risk high-value clients. Consensus: invest in acquisition while protecting retention. Pricing increase is viable but should be tested carefully.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ADVISORS.map((a, i) => (
          <motion.div key={a.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`border-border/50 ${a.type === "alert" ? "bg-red-500/5 border-red-500/20" : a.type === "warning" ? "bg-yellow-500/5 border-yellow-500/20" : "bg-card/50"}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><a.icon className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.domain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Confidence</span>
                    <p className="text-sm font-bold text-foreground">{Math.round(a.confidence * 100)}%</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{a.stance}</p>
                <div className="flex gap-1 flex-wrap">
                  {a.watching.map(w => <Badge key={w} variant="outline" className="text-xs">{w}</Badge>)}
                </div>
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-primary font-medium">→ {a.recommendation}</p>
                </div>
                <Progress value={a.confidence * 100} className="h-1" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
