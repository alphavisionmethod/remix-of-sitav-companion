import { motion } from "framer-motion";
import { Globe, Palette, ShoppingCart, BarChart3, Rocket, Wrench, ArrowRight, Sparkles, Layout, Monitor, Store, Megaphone, Shield, Smartphone, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WORKSPACES = [
  { label: "Presence Boardroom", desc: "Health, traffic, conversions, advisors", icon: BarChart3, path: "/digital-presence/boardroom", color: "text-blue-400" },
  { label: "Website Twin", desc: "Live model of pages, paths & performance", icon: Monitor, path: "/digital-presence/website-twin", color: "text-cyan-400" },
  { label: "Site Builder", desc: "Create pages, sites, microsites", icon: Layout, path: "/digital-presence/builder", color: "text-indigo-400" },
  { label: "Brand Studio", desc: "Logo, colors, typography, identity", icon: Palette, path: "/digital-presence/brand-studio", color: "text-purple-400" },
  { label: "Connected Sites", desc: "Manage Shopify, WordPress, Webflow…", icon: Globe, path: "/digital-presence/connected-sites", color: "text-green-400" },
  { label: "CRO Office", desc: "Conversion optimization & trust gaps", icon: BarChart3, path: "/digital-presence/cro", color: "text-amber-400" },
  { label: "Ecommerce Office", desc: "Products, merchandising, cart recovery", icon: Store, path: "/digital-presence/ecommerce", color: "text-rose-400" },
  { label: "Promotions Office", desc: "Banners, campaigns, launch coordination", icon: Megaphone, path: "/digital-presence/promotions", color: "text-orange-400" },
  { label: "AI Web Team", desc: "Strategist, Designer, CRO, SEO advisors", icon: Sparkles, path: "/digital-presence/ai-team", color: "text-violet-400" },
  { label: "Error & Opportunity Radar", desc: "Broken links, stale content, weak CTAs", icon: Wrench, path: "/digital-presence/radar", color: "text-red-400" },
  { label: "Content Freshness", desc: "Outdated pages, expired offers, stale info", icon: Globe, path: "/digital-presence/content-freshness", color: "text-teal-400" },
  { label: "Launch War Room", desc: "Launch readiness, rollback plans", icon: Rocket, path: "/digital-presence/launch", color: "text-pink-400" },
  { label: "Time Machine", desc: "Replay changes, impact review", icon: Globe, path: "/digital-presence/time-machine", color: "text-sky-400" },
  { label: "Self-Healing Queue", desc: "Safe auto-fixes, patch preview & verification", icon: Shield, path: "/digital-presence/self-healing", color: "text-emerald-400" },
  { label: "App Experience Studio", desc: "PWA, portals, mini-apps, mobile-first", icon: Smartphone, path: "/digital-presence/app-studio", color: "text-lime-400" },
  { label: "Presence Analytics", desc: "Traffic quality, source performance, impact", icon: BarChart3, path: "/digital-presence/analytics", color: "text-fuchsia-400" },
  { label: "Domain & Publish", desc: "Domains, staging, rollback, release management", icon: Server, path: "/digital-presence/domains", color: "text-slate-400" },
];

const HEALTH_STATS = [
  { label: "Site Health", value: "87%", status: "good" },
  { label: "Pages Active", value: "24", status: "neutral" },
  { label: "Conversion Rate", value: "3.2%", status: "good" },
  { label: "Issues Found", value: "7", status: "warning" },
];

export default function PresenceGate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Digital Presence Office</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your AI-powered web strategy, design, CRO, and maintenance command center</p>
      </motion.div>

      {/* Health band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {HEALTH_STATS.map((s, i) => (
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
        {WORKSPACES.map((w, i) => (
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
    </div>
  );
}
