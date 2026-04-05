import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Zap, UserX, Megaphone, Package, Heart, Shield, Users, TrendingUp, CheckCircle } from "lucide-react";

const modes = [
  { name: "Quiet Monitoring", icon: Radio, color: "text-slate-400", desc: "Passive observation — advisors watch, no active campaigns", emphasis: "Boardroom health, anomaly detection", active: false },
  { name: "Lead Recovery", icon: UserX, color: "text-amber-400", desc: "Focus on reactivating dropped, stalled, and dormant leads", emphasis: "Follow-up queues, reactivation campaigns, CRM urgency", active: false },
  { name: "Campaign Launch", icon: Megaphone, color: "text-blue-400", desc: "Active campaign mode — launch, monitor, optimize", emphasis: "Campaign health, conversion, deliverability, fatigue", active: true },
  { name: "Offer Optimization", icon: Package, color: "text-purple-400", desc: "Testing and refining offers, pricing, and packaging", emphasis: "Conversion per offer, pricing signals, A/B results", active: false },
  { name: "Retention Mode", icon: Heart, color: "text-pink-400", desc: "Protect existing revenue — reduce churn, improve satisfaction", emphasis: "Churn risk, renewal timing, client health, NPS", active: false },
  { name: "Reputation Repair", icon: Shield, color: "text-red-400", desc: "Address negative sentiment and rebuild trust signals", emphasis: "Review response, sentiment recovery, trust pulse", active: false },
  { name: "Capacity Fill", icon: Users, color: "text-emerald-400", desc: "Fill underused appointment slots and service capacity", emphasis: "Booking utilization, scheduling gaps, upsell opportunities", active: false },
  { name: "Scale Mode", icon: TrendingUp, color: "text-cyan-400", desc: "Growth acceleration — aggressive campaigns and expansion", emphasis: "Volume, conversion scaling, channel expansion, team capacity", active: false },
];

export default function GrowthOperatingModes() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Growth Operating Modes</h1>
        <p className="text-muted-foreground">Contextual business modes that change boardroom emphasis, advisor urgency, and workflow priorities</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 flex items-center gap-3">
          <Megaphone className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-medium text-foreground">Current Mode: <span className="text-blue-400">Campaign Launch</span></p>
            <p className="text-xs text-muted-foreground">Boardroom, advisors, and notifications are tuned for active campaign monitoring</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {modes.map((m) => (
          <Card key={m.name} className={`bg-card/50 border-border/50 ${m.active ? "ring-1 ring-primary/50" : ""} hover:border-primary/30 transition-colors cursor-pointer`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                  <span className="font-medium text-foreground">{m.name}</span>
                </div>
                {m.active && <Badge className="bg-primary/10 text-primary text-[10px] flex items-center gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{m.desc}</p>
              <p className="text-xs text-muted-foreground"><span className="text-foreground">Emphasis:</span> {m.emphasis}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
