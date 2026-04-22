import { motion } from "framer-motion";
import { Layout, Plus, Globe, Calendar, ShoppingCart, Users, FileText, Rocket, Sparkles, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSites } from "@/hooks/use-digital-presence";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";

const PAGE_TYPES = [
  { type: "Landing Page", desc: "High-converting campaign or product page", icon: Rocket, color: "text-blue-400" },
  { type: "Service Page", desc: "Describe and sell a service offering", icon: FileText, color: "text-green-400" },
  { type: "Booking Page", desc: "Let clients book appointments", icon: Calendar, color: "text-purple-400" },
  { type: "Checkout / Store", desc: "Sell products with checkout flow", icon: ShoppingCart, color: "text-amber-400" },
];

export default function SiteBuilder() {
  const { data: liveData, isLoading } = useSites();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Site / Experience Builder</h1>
        <p className="text-sm text-muted-foreground">Create websites, landing pages, booking pages, checkout flows & microsites</p>
      </motion.div>

      {/* Create New */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Create New</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PAGE_TYPES.map(pt => (
              <button key={pt.type} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left group">
                <pt.icon className={`w-5 h-5 ${pt.color} mb-2`} />
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{pt.type}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">{pt.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Page Generator */}
      <Card className="bg-card/50 border-border/50 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Page Generator</h3>
              <p className="text-[10px] text-muted-foreground">Describe what you need and SITA will generate a complete page</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="E.g., 'A booking page for yoga classes with testimonials and pricing'" className="text-sm" />
            <Button size="sm"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate</Button>
          </div>
        </CardContent>
      </Card>

      {/* Experience Rewrite */}
      <Card className="bg-card/50 border-border/50 border-violet-500/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Experience Rewrite / Refresh Mode</h3>
              <p className="text-[10px] text-muted-foreground">Ask SITA to redesign, refresh, or rewrite any page — get strategy, copy, layout, variants & publish plan</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <Input placeholder="E.g., 'Refresh homepage for our summer campaign with stronger CTA'" className="text-sm" />
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Rewrite</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Strategy brief", "Copy variants", "Layout options", "Mobile preview", "Publish plan"].map(item => (
              <Badge key={item} variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">{item}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Pages */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Your Pages</CardTitle>
            <Input placeholder="Search pages…" value={search} onChange={e => setSearch(e.target.value)} className="w-48 h-8 text-xs" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(!liveData || liveData.length === 0) ? (
            <PremiumEmptyState
              variant="no-data"
              domain="business"
              title="No pages created yet"
              description="Use the creator above or the AI Page Generator to build your first page."
            />
          ) : (
            liveData.filter((p: any) => !search || (p.name || "").toLowerCase().includes(search.toLowerCase())).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors">
                <div>
                  <span className="text-sm font-medium text-foreground">{p.name || p.title}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{p.type || "page"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-[10px]">{p.status || "draft"}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
