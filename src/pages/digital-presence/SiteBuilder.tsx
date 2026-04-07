import { motion } from "framer-motion";
import { Layout, Plus, Globe, Calendar, ShoppingCart, Users, FileText, Rocket, Sparkles, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useSites } from "@/hooks/use-digital-presence";

const DEMO_PAGE_TYPES = [
  { type: "Landing Page", desc: "High-converting campaign or product page", icon: Rocket, color: "text-blue-400" },
  { type: "Service Page", desc: "Describe and sell a service offering", icon: FileText, color: "text-green-400" },
  { type: "Booking Page", desc: "Let customers schedule appointments", icon: Calendar, color: "text-purple-400" },
  { type: "Product Page", desc: "Showcase and sell a product", icon: ShoppingCart, color: "text-amber-400" },
  { type: "Checkout Flow", desc: "Secure payment and order flow", icon: ShoppingCart, color: "text-rose-400" },
  { type: "Member Page", desc: "Gated content for members only", icon: Users, color: "text-cyan-400" },
  { type: "Campaign Microsite", desc: "Focused multi-page campaign experience", icon: Globe, color: "text-orange-400" },
  { type: "Full Website", desc: "Complete multi-page website", icon: Layout, color: "text-indigo-400" },
];

const DEMO_EXISTING_PAGES = [
  { name: "Homepage", type: "Landing Page", status: "published", lastEdit: "2 days ago", views: 4201 },
  { name: "Summer Sale", type: "Campaign Microsite", status: "draft", lastEdit: "1 hour ago", views: 0 },
  { name: "Book a Call", type: "Booking Page", status: "published", lastEdit: "1 week ago", views: 1847 },
  { name: "Service: Web Design", type: "Service Page", status: "published", lastEdit: "3 days ago", views: 892 },
  { name: "Checkout", type: "Checkout Flow", status: "published", lastEdit: "2 weeks ago", views: 890 },
];

export default function SiteBuilder() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useSites();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Site / Experience Builder</h1>
        <p className="text-sm text-muted-foreground">Create websites, landing pages, booking pages, checkout flows & microsites</p>
      </motion.div>

      {/* Create New */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Create New</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_PAGE_TYPES.map(pt => (
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

      {/* Existing Pages */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Your Pages</CardTitle>
            <Input placeholder="Search pages…" value={search} onChange={e => setSearch(e.target.value)} className="w-48 h-8 text-xs" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEMO_EXISTING_PAGES.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <div key={p.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors">
              <div>
                <span className="text-sm font-medium text-foreground">{p.name}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{p.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><Eye className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">{p.views.toLocaleString()}</span></div>
                <span className="text-[10px] text-muted-foreground">{p.lastEdit}</span>
                <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
