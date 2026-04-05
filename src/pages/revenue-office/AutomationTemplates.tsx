import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout, Users, Phone, Star, Mail, FileText, RefreshCw, ShoppingBag, UserPlus, Heart, ArrowRight } from "lucide-react";

const templates = [
  { name: "Stale Lead Recovery", desc: "Detect leads with no next step for 48hrs, send personalized email, assign callback task", category: "Lead Recovery", popularity: 94, icon: Users, steps: 6 },
  { name: "No-Show Rescue", desc: "Detect appointment no-shows, send recovery SMS within 1hr, offer rebook link", category: "Booking", popularity: 89, icon: Phone, steps: 5 },
  { name: "Post-Service Review Request", desc: "After service completion, wait 24hrs, send review request, follow-up if no response", category: "Reputation", popularity: 87, icon: Star, steps: 4 },
  { name: "Quote Follow-up & Expiry", desc: "After quote sent, remind at 3 and 5 days, escalate at 7 days, close at 14", category: "Sales", popularity: 85, icon: FileText, steps: 7 },
  { name: "Welcome Onboarding Flow", desc: "New client welcome email, intake form, kickoff scheduling, milestone reminders", category: "Onboarding", popularity: 91, icon: UserPlus, steps: 8 },
  { name: "Nurture After Opt-in", desc: "5-email value sequence over 14 days, branch by engagement, offer at end", category: "Nurture", popularity: 83, icon: Mail, steps: 6 },
  { name: "Churn Prevention Check-in", desc: "Detect 60-day inactivity, send check-in, offer incentive, escalate to human", category: "Retention", popularity: 78, icon: Heart, steps: 5 },
  { name: "Abandoned Checkout Recovery", desc: "Cart abandonment detection, recovery email at 1hr and 24hrs, offer discount at 48hrs", category: "Sales", popularity: 86, icon: ShoppingBag, steps: 5 },
  { name: "Reactivation Campaign", desc: "Segment dormant contacts, launch 3-step reactivation, clean unresponsive", category: "Growth", popularity: 76, icon: RefreshCw, steps: 6 },
  { name: "Referral Ask Flow", desc: "Identify high-NPS clients, send referral request, reward on success", category: "Growth", popularity: 72, icon: Users, steps: 4 },
];

export default function AutomationTemplates() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automation Templates</h1>
        <p className="text-muted-foreground">Ready-made automation blueprints — customize, simulate, and activate</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{templates.length}</p><p className="text-xs text-muted-foreground">Templates Available</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-400">6</p><p className="text-xs text-muted-foreground">Categories</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-400">5.7</p><p className="text-xs text-muted-foreground">Avg Steps per Template</p></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <Card key={t.name} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><t.icon className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.name}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">{t.category}</Badge>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1">Use <ArrowRight className="h-3 w-3" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{t.desc}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{t.steps} steps</span>
                <span>Popularity: {t.popularity}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
