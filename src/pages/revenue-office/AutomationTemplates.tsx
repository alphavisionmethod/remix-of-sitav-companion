import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Layout, Users, Phone, Star, Mail, FileText, RefreshCw, ShoppingBag,
  UserPlus, Heart, ArrowRight, Zap, Target, MessageSquare, Shield,
  Clock, CheckCircle, Brain, Package, DollarSign, AlertTriangle, Workflow
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const templates = [
  { name: "Stale Lead Recovery (48hr)", desc: "Detect leads with no next step for 48hrs. Enrich with CRM data, send personalized email, assign callback task, follow up via SMS if no response, escalate high-value leads.", category: "Lead Recovery", popularity: 94, icon: Users, steps: 8, trustLevel: "L3", impact: "$8,200/mo recovered", difficulty: "Easy", timeToSetup: "5 min", advisorNote: "CRM Advisor: Most impactful first automation for service businesses" },
  { name: "Warm Lead Follow-up", desc: "When lead shows high engagement (multiple page views, form started), immediately send value-driven email, create priority call task, fast-track to sales pipeline.", category: "Lead Recovery", popularity: 88, icon: Target, steps: 6, trustLevel: "L3", impact: "+24% conversion", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Funnel Advisor: Catches hot leads before they cool" },
  { name: "No-Show Rescue + Rebook", desc: "Detect no-show within 15 min of appointment time. Send caring SMS with easy rebook link, follow up with email if no response in 2hrs, track recovery rate.", category: "Booking", popularity: 91, icon: Phone, steps: 6, trustLevel: "L3", impact: "+22% rebook rate", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Booking Advisor: SMS at 15 min works better than 1hr — sense of immediacy" },
  { name: "Post-Service Review Request", desc: "After service completion, wait 24hrs for experience to settle, send personalized review request, follow up if no response at 72hrs, route negative sentiment to recovery workflow.", category: "Reputation", popularity: 89, icon: Star, steps: 5, trustLevel: "L3", impact: "+12 reviews/mo", difficulty: "Easy", timeToSetup: "3 min", advisorNote: "Reputation Advisor: 24hr delay gets better quality reviews than immediate ask" },
  { name: "Quote Follow-up & Expiry (3/5/7/14 day)", desc: "After quote sent: remind at day 3, nudge with social proof at day 5, urgency at day 7, close/archive at day 14 with reactivation tag. Track viewed-but-not-responded separately.", category: "Sales", popularity: 87, icon: FileText, steps: 8, trustLevel: "L3", impact: "$4,800/mo recovered", difficulty: "Medium", timeToSetup: "6 min", advisorNote: "Offer Advisor: Day 5 social proof email has 2x higher conversion than plain reminder" },
  { name: "Welcome Onboarding (7-step)", desc: "New client welcome: day 0 welcome email, day 1 intake form, day 2 kickoff scheduling, day 3 resource packet, day 5 check-in, day 7 satisfaction pulse, day 14 milestone.", category: "Onboarding", popularity: 93, icon: UserPlus, steps: 9, trustLevel: "L3", impact: "+34% completion rate", difficulty: "Medium", timeToSetup: "8 min", advisorNote: "Retention Advisor: Day 5 check-in catches 80% of at-risk onboardings" },
  { name: "Nurture Sequence (14-day value)", desc: "5-email value sequence over 14 days. Branch by engagement level at email 3. Engaged path gets offer. Disengaged path gets different angle. Auto-tag by interest for future campaigns.", category: "Nurture", popularity: 85, icon: Mail, steps: 7, trustLevel: "L3", impact: "+18% nurture conversion", difficulty: "Medium", timeToSetup: "7 min", advisorNote: "Campaign Advisor: Branching at email 3 recovers 40% of otherwise lost leads" },
  { name: "Churn Prevention Check-in", desc: "Detect 60-day inactivity. Send caring check-in, offer incentive at 75 days, escalate to personal call at 90 days, create save-offer if high-value.", category: "Retention", popularity: 80, icon: Heart, steps: 6, trustLevel: "L2", impact: "$12,400/mo saved", difficulty: "Medium", timeToSetup: "5 min", advisorNote: "Retention Advisor: Personal call at 90 days saves 3x more than email alone" },
  { name: "Abandoned Checkout Recovery", desc: "Cart/checkout abandonment at 1hr, 24hrs, and 48hrs. Progressive urgency. Discount offer at 48hrs if item allows. Track recovery revenue separately.", category: "Sales", popularity: 86, icon: ShoppingBag, steps: 5, trustLevel: "L3", impact: "$7,200/mo recovered", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Funnel Advisor: 1hr email recovers 60% of all recoverable carts" },
  { name: "Reactivation Campaign (90-day dormant)", desc: "Segment dormant contacts. 3-step reactivation: re-engagement email, value reminder, final exclusive offer. Clean unresponsive contacts after 14 days.", category: "Growth", popularity: 78, icon: RefreshCw, steps: 6, trustLevel: "L2", impact: "$2,800/mo reactivated", difficulty: "Medium", timeToSetup: "6 min", advisorNote: "Campaign Advisor: Clean unresponsive contacts to improve deliverability" },
  { name: "Upsell After Service Delivery", desc: "After successful service delivery + positive feedback, wait 7 days, send relevant upsell based on purchased service. Include case study from similar client.", category: "Growth", popularity: 76, icon: Package, steps: 5, trustLevel: "L2", impact: "$5,600/mo added", difficulty: "Medium", timeToSetup: "5 min", advisorNote: "Offer Advisor: Case study inclusion increases upsell acceptance by 45%" },
  { name: "Referral Ask Flow", desc: "Identify high-NPS/satisfaction clients. Send personalized referral request with easy sharing link. Reward on successful referral. Track referral source.", category: "Growth", popularity: 74, icon: Users, steps: 4, trustLevel: "L2", impact: "+8 referrals/mo", difficulty: "Easy", timeToSetup: "3 min", advisorNote: "CRM Advisor: Ask within 7 days of positive feedback for 3x higher referral rate" },
  { name: "Internal Task Handoff", desc: "When deal stage changes or service milestone reached, auto-create tasks for next team member, include context packet, set due dates, escalate if overdue.", category: "Operations", popularity: 82, icon: Workflow, steps: 5, trustLevel: "L3", impact: "-40% handoff delays", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Revenue Ops Advisor: Structured handoffs prevent 80% of client experience gaps" },
  { name: "Post-Call Follow-up", desc: "After call completed, auto-generate summary from notes, send follow-up email with key points, create next-step task, update pipeline, trigger quote if qualified.", category: "Sales", popularity: 90, icon: Phone, steps: 7, trustLevel: "L2", impact: "$15,000/mo recovered", difficulty: "Medium", timeToSetup: "5 min", advisorNote: "Chief Strategist: Biggest ROI automation — most businesses lose deals between call and follow-up" },
  { name: "Failed Payment Retry", desc: "On payment failure, send immediate notification, retry at 24hrs and 72hrs, offer alternative payment method, escalate to human if still failing.", category: "Revenue", popularity: 84, icon: DollarSign, steps: 5, trustLevel: "L3", impact: "$2,100/mo recovered", difficulty: "Easy", timeToSetup: "3 min", advisorNote: "Revenue Ops Advisor: 72% of failed payments recover with a simple retry + notification" },
];

const categories = ["All", "Lead Recovery", "Sales", "Booking", "Reputation", "Onboarding", "Nurture", "Retention", "Growth", "Operations", "Revenue"];

export default function AutomationTemplates() {
  const { isDemoMode } = useDataMode();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filtered = selectedCategory === "All" ? templates : templates.filter(t => t.category === selectedCategory);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />Automation Template Gallery
        </h1>
        <p className="text-muted-foreground">Ready-made automation blueprints — customize, simulate, and activate in minutes</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{templates.length}</p><p className="text-[10px] text-muted-foreground">Templates</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-400">{categories.length - 1}</p><p className="text-[10px] text-muted-foreground">Categories</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-400">6.1</p><p className="text-[10px] text-muted-foreground">Avg Steps</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-400">4.8 min</p><p className="text-[10px] text-muted-foreground">Avg Setup</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">$82K</p><p className="text-[10px] text-muted-foreground">Total Impact/mo</p></CardContent></Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>{cat}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <Card key={t.name} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5"><t.icon className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{t.trustLevel}</Badge>
                      <Badge variant="outline" className="text-[10px]">{t.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.desc}</p>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                <span>{t.steps} steps</span>
                <span>Setup: {t.timeToSetup}</span>
                <span>Popularity: {t.popularity}%</span>
                <span className="text-emerald-400 font-medium">{t.impact}</span>
              </div>
              {/* Advisor Note */}
              <div className="p-2 rounded bg-primary/5 border border-primary/10 mb-3">
                <div className="flex items-start gap-1.5">
                  <Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-foreground">{t.advisorNote}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1 flex-1 justify-center">Use Template <ArrowRight className="h-3 w-3" /></button>
                <button className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs flex-1 justify-center flex items-center gap-1">Preview Flow</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
