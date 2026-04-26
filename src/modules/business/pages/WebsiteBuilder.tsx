// ═══════════════════════════════════════════════════════════════
// SITA OS — Website Builder (Honest-Degraded)
//
// Manifest classification: `degraded` (no website connector
// provisioned). Live mode renders a setup-required EmptyStateCard
// + descriptive preview block. Demo mode (isDemo === true) renders
// the original rich preview from `website-builder-demo` fixtures.
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import {
  Globe, FileText, BarChart3, Zap, Eye, Plus, ExternalLink, TrendingUp,
  Search, MousePointer, Users, DollarSign, Copy, FlaskConical, Target, Layers,
  ArrowUpRight, LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import { DomainAdvisorCard } from "@/platform/advisors/components/advisors/DomainAdvisorCard";
import {
  WEBSITE_BUILDER_SITES,
  WEBSITE_BUILDER_AB_TESTS,
  WEBSITE_BUILDER_SEO_KEYWORDS,
  WEBSITE_BUILDER_HEATMAPS,
  WEBSITE_BUILDER_TEMPLATES,
} from "@/data/fixtures/mock-data/website-builder-demo";

type Tab = "sites" | "ab-tests" | "seo" | "heatmaps" | "templates";

// Live-mode descriptive preview (no fake numbers).
const LIVE_PREVIEW_FEATURES: ReadonlyArray<{ icon: typeof Globe; title: string; description: string }> = [
  { icon: Globe,        title: "Sites & pages",   description: "Inventory of every page with traffic, leads, and revenue once a hosting provider is connected." },
  { icon: FlaskConical, title: "A/B tests",       description: "Server-side experimentation results with conversion lift and revenue impact." },
  { icon: Search,       title: "SEO rankings",    description: "Keyword positions, change deltas, and search volume from your search console." },
  { icon: MousePointer, title: "Heatmaps",        description: "Click and scroll-depth analysis sourced from your analytics provider." },
  { icon: Layers,       title: "Templates",       description: "Revenue-optimised page templates ready to publish to your live site." },
];

const WebsiteBuilder = () => {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [activeTab, setActiveTab] = useState<Tab>("sites");

  // ── LIVE MODE: honest setup-required state ────────────────────
  if (!isDemo) {
    if (!user) {
      return (
        <div className="mx-auto max-w-5xl space-y-4 p-4">
          <PageTruthBanner truthState="partial" />
          <EmptyStateCard
            icon={LogIn}
            title="Sign in to manage your sites"
            description="The website builder unifies your hosted pages, A/B tests, SEO rankings, and heatmaps into one revenue-attributed view. Sign in to connect a provider, or switch to Demo mode to see a sample workspace."
            ctaLabel="Open sign-in"
            ctaPath="/auth"
          />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <PageTruthBanner truthState="partial" />
        <EmptyStateCard
          icon={Globe}
          title="Connect a website provider"
          description="No website connector is provisioned yet. Link a hosting provider (Webflow, Framer, WordPress, or a custom DNS site) to populate sites, A/B tests, SEO rankings, and heatmaps. Until then, this surface stays intentionally empty rather than showing fabricated metrics."
          ctaLabel="Open integrations"
          ctaPath="/business/integrations"
        />
        <div className="rounded-xl border border-border/40 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">What this surface will show once connected</p>
          </div>
          <ul className="space-y-2">
            {LIVE_PREVIEW_FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3 text-xs">
                <f.icon className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{f.title}</p>
                  <p className="text-muted-foreground">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ── DEMO MODE: rich sample workspace ──────────────────────────
  const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
    { key: "sites",     label: "Sites",         icon: Globe        },
    { key: "ab-tests",  label: "A/B Tests",     icon: FlaskConical },
    { key: "seo",       label: "SEO Rankings",  icon: Search       },
    { key: "heatmaps",  label: "Heatmaps",      icon: MousePointer },
    { key: "templates", label: "Templates",     icon: Layers       },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageTruthBanner truthState="demo" />

      <DomainAdvisorCard
        domain="business"
        insights={[
          { id: "web-1", text: "Lead Capture page has 45% bounce at phone field — removing it could recover ~$3.2K/mo", confidence: 91, action: "Remove Field" },
          { id: "web-2", text: "A/B test on Product Landing proved +62% lift — apply winning CTA to Main Site",          confidence: 85, action: "Apply"         },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Website Builder</h1>
          <p className="text-sm text-muted-foreground">Revenue-attributed landing pages, A/B testing, SEO intelligence</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Users,       label: "Total Leads Captured", value: "64",      sub: "+12 this week",        color: "text-primary"     },
          { icon: TrendingUp,  label: "Avg Conversion Rate",  value: "4.6%",    sub: "↑ 0.8% vs last month", color: "text-emerald-500" },
          { icon: DollarSign,  label: "Revenue Attributed",   value: "$52.4K",  sub: "From all pages",       color: "text-amber-500"   },
          { icon: Target,      label: "Cost Per Lead",        value: "$18.40",  sub: "↓ 22% with A/B tests", color: "text-blue-500"    },
          { icon: BarChart3,   label: "SEO Health",           value: "72/100",  sub: "3 issues to fix",      color: "text-purple-500"  },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
            <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Revenue Advisor</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your Lead Capture page has a 45% bounce rate at the phone number field. <strong>Removing it could recover ~$3,200/mo</strong> in lost leads.
              The A/B test on Product Landing already proved a +62% lift — apply the same CTA pattern to Main Site.
            </p>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full font-medium">+$3.2K/mo potential</span>
        </div>
      </motion.div>

      <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "sites" && (
        <div className="space-y-2">
          {WEBSITE_BUILDER_SITES.map((site, i) => (
            <motion.div key={site.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer">
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
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3 pt-3 border-t border-border/20">
                {[
                  { label: "Visitors",  value: site.visitors                 },
                  { label: "Leads",     value: String(site.leadsCapt)        },
                  { label: "Conv Rate", value: site.convRate                 },
                  { label: "Revenue",   value: site.revenue                  },
                  { label: "SEO Score", value: `${site.seoScore}/100`        },
                  { label: "Bounce",    value: site.bounceRate               },
                ].map((m) => (
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

      {activeTab === "ab-tests" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Active & Completed Tests</p>
            <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">+ New Test</button>
          </div>
          {WEBSITE_BUILDER_AB_TESTS.map((t, i) => (
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
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "seo" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Keyword Rankings</p>
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
            <div className="grid grid-cols-5 gap-2 p-3 text-[10px] font-semibold text-muted-foreground border-b border-border/20">
              <span>Keyword</span><span>Position</span><span>Change</span><span>Volume</span><span>Page</span>
            </div>
            {WEBSITE_BUILDER_SEO_KEYWORDS.map((k) => (
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

      {activeTab === "heatmaps" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Behavior Insights</p>
          {WEBSITE_BUILDER_HEATMAPS.map((h, i) => (
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

      {activeTab === "templates" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Revenue-Optimized Templates</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WEBSITE_BUILDER_TEMPLATES.map((t) => (
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