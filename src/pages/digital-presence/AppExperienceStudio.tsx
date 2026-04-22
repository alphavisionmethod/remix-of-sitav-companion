import { motion } from "framer-motion";
import { Smartphone, Globe, Layout, Link2, Users, Shield, Sparkles, Eye, Settings, Layers, ArrowRight, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DEMO_EXISTING_EXPERIENCES, DEMO_EXPERIENCE_TYPES, DEMO_PORTAL_FEATURES, DEMO_PWA_SETTINGS } from "@/data/seed/digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function AppExperienceStudio() {
  const [aiPrompt, setAiPrompt] = useState("");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">App / Mini-App Experience Studio</h1>
        <p className="text-sm text-muted-foreground">Build app-like web experiences, portals, PWAs & mobile-first variants</p>
      </motion.div>

      {/* Create New */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Create New Experience</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {([] as typeof DEMO_EXPERIENCE_TYPES).map(e => (
              <button key={e.type} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left group">
                <e.icon className={`w-5 h-5 ${e.color} mb-2`} />
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{e.type}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">{e.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="E.g., 'A client portal with booking, documents, and messaging'" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="text-sm" />
            <Button size="sm"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate</Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Experiences */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Your Experiences</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {([] as typeof DEMO_EXISTING_EXPERIENCES).map(e => (
            <div key={e.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors">
              <div>
                <span className="text-sm font-medium text-foreground">{e.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px]">{e.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">{e.lastUpdate}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {e.users > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {e.users}</span>}
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Smartphone className="w-3 h-3" /> {e.mobile}%</span>
                <Badge variant={e.status === "live" ? "default" : "secondary"} className="text-[10px]">{e.status}</Badge>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* PWA Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-green-400" /> PWA Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as typeof DEMO_PWA_SETTINGS).map(s => (
              <div key={s.setting} className="flex items-center justify-between p-2">
                <span className="text-xs text-muted-foreground">{s.setting}</span>
                <div className="flex items-center gap-2">
                  {s.setting === "Theme Color" || s.setting === "Background Color" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border border-border/50" style={{ backgroundColor: s.value }} />
                      <span className="text-xs font-mono text-foreground">{s.value}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-foreground">{s.value}</span>
                  )}
                  {s.editable && <Button variant="ghost" size="sm" className="h-5 w-5 p-0"><Settings className="w-3 h-3" /></Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Portal Features */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Portal Features</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as typeof DEMO_PORTAL_FEATURES).map(f => (
              <div key={f.feature} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-xs font-medium text-foreground">{f.feature}</span>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
                <Badge variant={f.status === "active" ? "default" : "secondary"} className="text-[10px]">{f.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Preview */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Device Preview</h3>
              <p className="text-[10px] text-muted-foreground">Preview experiences across devices and screen sizes</p>
            </div>
          </div>
          <div className="flex gap-2">
            {["iPhone 15", "iPad Pro", "Desktop", "Android"].map(d => (
              <Button key={d} variant="outline" size="sm" className="text-xs"><Eye className="w-3 h-3 mr-1" /> {d}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
