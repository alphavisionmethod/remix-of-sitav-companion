import { PageShell } from "@/components/sita/PageShell";
import { motion } from "framer-motion";
import { Palette, Type, Image, Sparkles, Download, Eye, Layout, Paintbrush } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useBrandAssets } from "@/hooks/use-digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function BrandStudio() {
  const { data: liveData, isLoading } = useBrandAssets();
  const [logoPrompt, setLogoPrompt] = useState("");

  return (
    <PageShell width="wide">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Brand Studio</h1>
        <p className="text-sm text-muted-foreground">Logo, colors, typography, visual identity & reusable design system</p>
      </motion.div>

      {/* AI Logo Generator */}
      <Card className="bg-card/50 border-border/50 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Logo Generator</h3>
              <p className="text-[10px] text-muted-foreground">Describe your brand and generate logo concepts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="E.g., 'Modern minimalist logo for a wellness coaching brand'" value={logoPrompt} onChange={e => setLogoPrompt(e.target.value)} className="text-sm" />
            <Button size="sm"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Color System */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Paintbrush className="w-4 h-4 text-purple-400" /> Color System</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as any[]).map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md border border-border/50" style={{ backgroundColor: c.value }} />
                  <div>
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{c.value}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{c.hsl}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Type className="w-4 h-4 text-blue-400" /> Typography</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as any[]).map(t => (
              <div key={t.role} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-foreground">{t.role}</span>
                  <span className="text-xs text-muted-foreground ml-2">{t.family}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">Weight: {t.weight}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">Size: {t.size}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Brand Assets */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Image className="w-4 h-4 text-green-400" /> Brand Assets</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as any[]).map(a => (
              <div key={a.name} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{a.name}</span>
                  <span className="text-[10px] text-muted-foreground">{a.format}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.status === "ready" ? "default" : a.status === "draft" ? "secondary" : "destructive"} className="text-[10px]">{a.status}</Badge>
                  {a.status === "ready" && <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Download className="w-3 h-3" /></Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reusable Blocks */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Layout className="w-4 h-4 text-indigo-400" /> Reusable Blocks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([] as any[]).map(b => (
              <div key={b.name} className="flex items-center justify-between p-2">
                <div>
                  <span className="text-sm text-foreground">{b.name}</span>
                  <Badge variant="secondary" className="ml-2 text-[10px]">{b.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Used {b.uses}×</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Eye className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Brand Evolution Engine */}
      <Card className="bg-card/50 border-border/50 border-emerald-500/20">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-400" /> Brand Evolution Engine</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Coherent, campaign-driven style evolution — seasonal looks, offer visuals, and visual tone refinements without losing brand identity.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Spring / Fresh", active: false },
              { label: "Summer / Bold", active: true },
              { label: "Autumn / Warm", active: false },
              { label: "Holiday / Festive", active: false },
            ].map(s => (
              <div key={s.label} className={`p-3 rounded-lg border text-center text-xs font-medium cursor-pointer transition-all ${s.active ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/50 bg-muted/20 text-muted-foreground hover:border-emerald-500/20"}`}>
                {s.label}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[10px]"><Sparkles className="w-3 h-3 mr-1" /> Generate Campaign Style</Button>
            <Button variant="outline" size="sm" className="text-[10px]"><Eye className="w-3 h-3 mr-1" /> Preview Evolution</Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
