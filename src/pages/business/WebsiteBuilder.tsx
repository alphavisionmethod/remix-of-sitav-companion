import { AppWelcomeHeader } from "@/components/sita/AppWelcomeHeader";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { motion } from "framer-motion";
import { Globe, Layout, FileText, BarChart3, Zap, Eye, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const sites = [
  { id: 1, name: "Main Business Site", url: "mybiz.com", status: "live", pages: 12, visitors: "1.2K/mo", lastEdit: "2h ago" },
  { id: 2, name: "Product Landing", url: "mybiz.com/launch", status: "draft", pages: 3, visitors: "—", lastEdit: "1d ago" },
  { id: 3, name: "Lead Capture Funnel", url: "mybiz.com/free-consult", status: "live", pages: 4, visitors: "340/mo", lastEdit: "3d ago" },
];

const templates = [
  { icon: "🚀", name: "Product Launch", desc: "Landing page + waitlist" },
  { icon: "📋", name: "Lead Capture", desc: "Form + thank you page" },
  { icon: "🏢", name: "Business Homepage", desc: "About, services, contact" },
  { icon: "📰", name: "Newsletter Signup", desc: "Email capture + preview" },
];

const WebsiteBuilder = () => (
  <div className="mx-auto max-w-5xl space-y-6">
    <AppWelcomeHeader domain="business" />
    <InAppAdvisorStrip domain="business" />

    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">Website Builder</h1>
        <p className="text-sm text-muted-foreground">Manage landing pages, lead capture forms, and your web presence</p>
      </div>
      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> New Page
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: Globe, label: "Active Sites", value: "2", color: "text-primary" },
        { icon: FileText, label: "Total Pages", value: "19", color: "text-blue-500" },
        { icon: BarChart3, label: "Monthly Visitors", value: "1.5K", color: "text-emerald-500" },
        { icon: Zap, label: "Conversion Rate", value: "4.2%", color: "text-amber-500" },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
          <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
          <p className="text-lg font-bold">{s.value}</p>
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>

    {/* Sites */}
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">Your Sites</h2>
      {sites.map(site => (
        <motion.div
          key={site.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer"
        >
          <Globe className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{site.name}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span>{site.url}</span> · <span>{site.pages} pages</span> · <span>Edited {site.lastEdit}</span>
            </p>
          </div>
          <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            site.status === "live" ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
          )}>
            {site.status}
          </span>
          <span className="text-xs text-muted-foreground">{site.visitors}</span>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg hover:bg-muted"><Eye className="h-3.5 w-3.5" /></button>
            <button className="p-1.5 rounded-lg hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /></button>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Templates */}
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">Quick Start Templates</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map(t => (
          <button key={t.name} className="rounded-xl border border-border/40 bg-card/50 p-4 text-left hover:border-primary/30 transition-colors">
            <span className="text-2xl">{t.icon}</span>
            <p className="text-sm font-medium mt-2">{t.name}</p>
            <p className="text-[11px] text-muted-foreground">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default WebsiteBuilder;
