import { motion } from "framer-motion";
import { Sparkles, Globe, Palette, Target, Wrench, Search, Store, Megaphone, Settings, Layout, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AI_TEAM = [
  { name: "Web Strategist", icon: Globe, color: "text-blue-400", desc: "Overall web strategy, growth priorities, competitive positioning", status: "active", intensity: "high", lastInsight: "Homepage needs stronger value prop above fold" },
  { name: "Design Director", icon: Palette, color: "text-purple-400", desc: "Visual identity, layout, brand coherence, responsiveness", status: "active", intensity: "medium", lastInsight: "Services page layout inconsistent with brand system" },
  { name: "Content Strategist", icon: Layout, color: "text-green-400", desc: "Copy quality, content freshness, messaging alignment", status: "active", intensity: "high", lastInsight: "12 blog posts need content refresh — engagement dropping" },
  { name: "CRO Advisor", icon: Target, color: "text-amber-400", desc: "Conversion optimization, CTA placement, trust signals", status: "active", intensity: "high", lastInsight: "Pricing page CTA should be duplicated above fold" },
  { name: "Technical QA", icon: Wrench, color: "text-red-400", desc: "Performance, broken links, security, uptime", status: "active", intensity: "medium", lastInsight: "3 broken images found on product pages" },
  { name: "SEO / Discovery", icon: Search, color: "text-cyan-400", desc: "Search visibility, meta tags, structured data, indexing", status: "active", intensity: "low", lastInsight: "4 pages missing meta descriptions" },
  { name: "Ecommerce Merchandising", icon: Store, color: "text-rose-400", desc: "Product placement, collections, cart optimization", status: "active", intensity: "medium", lastInsight: "Best seller not featured — should be on homepage" },
  { name: "Promotions Advisor", icon: Megaphone, color: "text-orange-400", desc: "Banner strategy, promo timing, campaign page optimization", status: "active", intensity: "low", lastInsight: "Summer sale banner performing well — extend 2 days" },
  { name: "Website Ops", icon: Settings, color: "text-slate-400", desc: "Uptime, SSL, backups, plugin health, sync status", status: "active", intensity: "low", lastInsight: "SSL cert renewal in 14 days — auto-renew confirmed" },
  { name: "App Experience", icon: Eye, color: "text-indigo-400", desc: "PWA, mobile app presence, cross-device experience", status: "inactive", intensity: "—", lastInsight: "No app presence detected — consider PWA" },
];

type Intensity = "low" | "medium" | "high";

export default function AIWebTeam() {
  const [teamState, setTeamState] = useState(AI_TEAM.map(t => ({ ...t })));

  const cycleIntensity = (i: number) => {
    setTeamState(prev => prev.map((t, idx) => {
      if (idx !== i || t.status === "inactive") return t;
      const levels: Intensity[] = ["low", "medium", "high"];
      const curr = levels.indexOf(t.intensity as Intensity);
      return { ...t, intensity: levels[(curr + 1) % 3] };
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">AI Web Team Board</h1>
        <p className="text-sm text-muted-foreground">Your AI-powered web strategy, design, CRO & ops team</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamState.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={`bg-card/50 border-border/50 ${t.status === "inactive" ? "opacity-50" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <t.icon className={`w-5 h-5 ${t.color}`} />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-[10px]">{t.status}</Badge>
                    {t.status === "active" && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => cycleIntensity(i)}>
                        {t.intensity}
                      </Button>
                    )}
                  </div>
                </div>
                {t.lastInsight && (
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-[10px] text-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary shrink-0" />
                      {t.lastInsight}
                    </p>
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
