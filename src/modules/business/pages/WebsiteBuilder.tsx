import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { motion } from "framer-motion";
import { Globe, Layout, FileText, BarChart3, Zap, Eye, Plus, ExternalLink, TrendingUp, Search, MousePointer, Users, DollarSign, Copy, FlaskConical, Settings, ArrowUpRight, ChevronRight, Target, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";

/* ── Revenue-attributed sites ── */
const sites = [
  { id: 1, name: "Main Business Site", url: "mybiz.com", status: "live", pages: 12, visitors: "1.2K/mo", lastEdit: "2h ago", leadsCapt: 34, revenue: "$28,400", convRate: "4.2%", seoScore: 87, bounceRate: "32%", avgTime: "2:45" },
  { id: 2, name: "Product Landing — Spring Launch", url: "mybiz.com/launch", status: "live", pages: 3, visitors: "890/mo", lastEdit: "1d ago", leadsCapt: 18, revenue: "$14,200", convRate: "6.1%", seoScore: 72, bounceRate: "28%", avgTime: "3:12" },
  { id: 3, name: "Lead Capture Funnel", url: "mybiz.com/free-consult", status: "live", pages: 4, visitors: "340/mo", lastEdit: "3d ago", leadsCapt: 12, revenue: "$9,800", convRate: "3.5%", seoScore: 65, bounceRate: "45%", avgTime: "1:58" },
  { id: 4, name: "Case Study Hub", url: "mybiz.com/results", status: "draft", pages: 6, visitors: "—", lastEdit: "5d ago", leadsCapt: 0, revenue: "$0", convRate: "—", seoScore: 41, bounceRate: "—", avgTime: "—" },
];

/* ── A/B Tests ── */
const abTests = [
  { id: 1, page: "Product Landing", variant: "A: Blue CTA", convA: "4.2%", convB: "6.8%", winner: "B", lift: "+62%", status: "complete", revenue: "+$4,100" },
  { id: 2, page: "Lead Capture Funnel", variant: "A: Long Form", convA: "3.5%", convB: "5.1%", winner: "B", lift: "+46%", status: "running", revenue: "+$2,300 projected" },
  { id: 3, page: "Main Site — Hero", variant: "A: Video Hero", convA: "2.8%", convB: "3.1%", winner: "—", lift: "+11%", status: "running", revenue: "TBD" },
];

/* ── SEO Rankings ── */
const seoKeywords = [
  { keyword: "business consulting near me", position: 3, change: "+2", volume: "2.4K", page: "Main Site" },
  { keyword: "free business consultation", position: 7, change: "+5", volume: "1.8K", page: "Lead Capture" },
  { keyword: "startup growth services", position: 12, change: "-1", volume: "890", page: "Main Site" },
  { keyword: "case study template", position: 18, change: "new", volume: "3.2K", page: "Case Study Hub" },
];

/* ── Heatmap summaries ── */
const heatmapData = [
  { page: "Product Landing", topClick: "CTA Button (68%)", scrollDepth: "78%", dropOff: "Pricing Section", suggestion: "Move pricing above fold — 23% drop-off before seeing it" },
  { page: "Lead Capture", topClick: "Form Field 1 (45%)", scrollDepth: "92%", dropOff: "Phone Number Field", suggestion: "Remove phone field — 31% abandon at that step" },
];

/* ── Templates ── */
const templates = [
  { icon: "🚀", name: "Product Launch", desc: "Landing page + waitlist", convRate: "5.2% avg", uses: 1240 },
  { icon: "📋", name: "Lead Capture", desc: "Form + thank you page", convRate: "4.8% avg", uses: 3100 },
  { icon: "🏢", name: "Business Homepage", desc: "About, services, contact", convRate: "3.1% avg", uses: 890 },
  { icon: "📰", name: "Newsletter Signup", desc: "Email capture + preview", convRate: "7.2% avg", uses: 2400 },
  { icon: "📊", name: "Case Study", desc: "Results + testimonials", convRate: "4.5% avg", uses: 670 },
  { icon: "🎯", name: "Webinar Registration", desc: "Event page + countdown", convRate: "8.1% avg", uses: 1800 },
];

type Tab = "sites" | "ab-tests" | "seo" | "heatmaps" | "templates";

const WebsiteBuilder = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("website", primaryMode);
  const [activeTab, setActiveTab] = useState<Tab>("sites");

  const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
    { key: "sites", label: "Sites", icon: Globe },
    { key: "ab-tests", label: "A/B Tests", icon: FlaskConical },
    { key: "seo", label: "SEO Rankings", icon: Search },
    { key: "heatmaps", label: "Heatmaps", icon: MousePointer },
    { key: "templates", label: "Templates", icon: Layers },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DomainAdvisorCard domain="business" insights={[
        { id: "web-1", text: "Lead Capture page has 45% bounce at phone field — removing it could recover ~$3.2K/mo", confidence: 91, action: "Remove Field" },
        { id: "web-2", text: "A/B test on Product Landing proved +62% lift — apply winning CTA to Main Site", confidence: 85, action: "Apply" },
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Website Builder</h1>
          <p className="text-sm text-muted-foreground">Revenue-attributed landing pages, A/B testing, SEO intelligence</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      {/* ── Revenue KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Users, label: "Total Leads Captured", value: "64", sub: "+12 this week", color: "text-primary" },
          { icon: TrendingUp, label: "Avg Conversion Rate", value: "4.6%", sub: "↑ 0.8% vs last month", color: "text-emerald-500" },
          { icon: DollarSign, label: "Revenue Attributed", value: "$52.4K", sub: "From all pages", color: "text-amber-500" },
          { icon: Target, label: "Cost Per Lead", value: "$18.40", sub: "↓ 22% with A/B tests", color: "text-blue-500" },
          { icon: BarChart3, label: "SEO Health", value: "72/100", sub: "3 issues to fix", color: "text-purple-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
            <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── AI Advisor Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Revenue Advisor</p>
            <p className="text-xs text-muted-foreground mt-1">Your Lead Capture page has a 45% bounce rate at the phone number field. <strong>Removing it could recover ~$3,200/mo</strong> in lost leads. The A/B test on Product Landing already proved a +62% lift — apply the same CTA pattern to Main Site.</p>
            <div className="flex gap-2 mt-3">
              <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">Remove Phone Field</button>
              <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">Apply Winning CTA</button>
              <button className="text-[10px] text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Dismiss</button>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full font-medium">+$3.2K/mo potential</span>
        </div>
      </motion.div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Sites Tab ── */}
      {activeTab === "sites" && (
        <div className="space-y-2">
          {sites.map((site, i) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Globe className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{site.name}</p>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", site.status === "live" ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground")}>{site.status}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{site.url} · {site.pages} pages · Edited {site.lastEdit}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-muted" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-muted" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-muted" title="A/B Test"><FlaskConical className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-muted" title="SEO"><Search className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-muted" title="Visit"><ExternalLink className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {/* Revenue attribution row */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3 pt-3 border-t border-border/20">
                {[
                  { label: "Visitors", value: site.visitors },
                  { label: "Leads", value: String(site.leadsCapt) },
                  { label: "Conv Rate", value: site.convRate },
                  { label: "Revenue", value: site.revenue },
                  { label: "SEO Score", value: `${site.seoScore}/100` },
                  { label: "Bounce", value: site.bounceRate },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-xs font-semibold">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── A/B Tests Tab ── */}
      {activeTab === "ab-tests" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Active & Completed Tests</p>
            <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">+ New Test</button>
          </div>
          {abTests.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center gap-4">
                <FlaskConical className="h-5 w-5 text-purple-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.page}</p>
                  <p className="text-[11px] text-muted-foreground">{t.variant}</p>
                </div>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", t.status === "complete" ? "bg-emerald-500/15 text-emerald-500" : "bg-blue-500/15 text-blue-500")}>{t.status}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/20">
                <div><p className="text-xs font-semibold">{t.convA}</p><p className="text-[10px] text-muted-foreground">Variant A</p></div>
                <div><p className="text-xs font-semibold">{t.convB}</p><p className="text-[10px] text-muted-foreground">Variant B</p></div>
                <div><p className="text-xs font-semibold text-emerald-500">{t.lift}</p><p className="text-[10px] text-muted-foreground">Lift</p></div>
                <div><p className="text-xs font-semibold text-primary">{t.revenue}</p><p className="text-[10px] text-muted-foreground">Revenue Impact</p></div>
              </div>
              {t.status === "complete" && (
                <button className="mt-3 text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">Apply Winner to All Pages</button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── SEO Tab ── */}
      {activeTab === "seo" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Keyword Rankings</p>
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
            <div className="grid grid-cols-5 gap-2 p-3 text-[10px] font-semibold text-muted-foreground border-b border-border/20">
              <span>Keyword</span><span>Position</span><span>Change</span><span>Volume</span><span>Page</span>
            </div>
            {seoKeywords.map((k, i) => (
              <div key={k.keyword} className="grid grid-cols-5 gap-2 p-3 text-xs border-b border-border/10 last:border-0 hover:bg-muted/30">
                <span className="font-medium truncate">{k.keyword}</span>
                <span className="font-bold">#{k.position}</span>
                <span className={cn("font-medium", k.change.startsWith("+") || k.change === "new" ? "text-emerald-500" : "text-destructive")}>{k.change}</span>
                <span className="text-muted-foreground">{k.volume}/mo</span>
                <span className="text-muted-foreground">{k.page}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Heatmaps Tab ── */}
      {activeTab === "heatmaps" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Behavior Insights</p>
          {heatmapData.map((h, i) => (
            <motion.div key={h.page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <p className="text-sm font-medium mb-3">{h.page}</p>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs font-semibold">{h.topClick}</p><p className="text-[10px] text-muted-foreground">Top Click Zone</p></div>
                <div><p className="text-xs font-semibold">{h.scrollDepth}</p><p className="text-[10px] text-muted-foreground">Scroll Depth</p></div>
                <div><p className="text-xs font-semibold text-destructive">{h.dropOff}</p><p className="text-[10px] text-muted-foreground">Drop-off Point</p></div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Zap className="h-3 w-3" /> <strong>AI Suggestion:</strong> {h.suggestion}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Templates Tab ── */}
      {activeTab === "templates" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Revenue-Optimized Templates</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {templates.map(t => (
              <button key={t.name} className="rounded-xl border border-border/40 bg-card/50 p-4 text-left hover:border-primary/30 transition-colors group">
                <span className="text-2xl">{t.icon}</span>
                <p className="text-sm font-medium mt-2">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-emerald-500 font-medium">{t.convRate}</span>
                  <span className="text-[10px] text-muted-foreground">{t.uses.toLocaleString()} uses</span>
                </div>
                <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1 inline-flex items-center gap-1">Use Template <ArrowUpRight className="h-3 w-3" /></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteBuilder;
