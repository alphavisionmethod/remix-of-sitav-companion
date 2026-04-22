import { PageShell } from "@/components/sita/PageShell";
import { motion } from "framer-motion";
import { Globe, Palette, ShoppingCart, BarChart3, Rocket, Wrench, ArrowRight, Sparkles, Layout, Monitor, Store, Megaphone, Shield, Smartphone, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DEMO_HEALTH_STATS, DEMO_WORKSPACES } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function PresenceGate() {
  const navigate = useNavigate();

  return (
    <PageShell width="wide">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Digital Presence Office</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your AI-powered web strategy, design, CRO, and maintenance command center</p>
      </motion.div>

      {/* Health band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([] as typeof DEMO_HEALTH_STATS).map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                <Badge variant={s.status === "good" ? "default" : s.status === "warning" ? "destructive" : "secondary"} className="mt-2 text-[10px]">
                  {s.status === "good" ? "Healthy" : s.status === "warning" ? "Needs attention" : "OK"}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Workspace grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {([] as typeof DEMO_WORKSPACES).map((w, i) => (
          <motion.div key={w.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.03 }}>
            <Card
              className="bg-card/50 border-border/50 hover:border-primary/30 cursor-pointer transition-all group"
              onClick={() => navigate(w.path)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <w.icon className={`w-5 h-5 ${w.color}`} />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{w.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{w.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={() => navigate("/digital-presence/onboarding")} className="gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Start Formation Ceremony
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/digital-presence/builder")}>
          <Layout className="w-3.5 h-3.5 mr-1.5" /> Create New Page
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/digital-presence/connected-sites")}>
          <Globe className="w-3.5 h-3.5 mr-1.5" /> Connect Website
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/digital-presence/brand-studio")}>
          <Palette className="w-3.5 h-3.5 mr-1.5" /> Generate Logo
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/digital-presence/radar")}>
          <Wrench className="w-3.5 h-3.5 mr-1.5" /> Run Diagnostics
        </Button>
      </div>
    </PageShell>
  );
}
