// ═══════════════════════════════════════════════════════════════
// SITA OS — Website Builder Demo Fixture
//
// Demo-only data for `WebsiteBuilder.tsx`. Consumed exclusively when
// `useRealityModeSafe().isDemo === true`. In live mode the page
// renders an honest setup-required state because no website
// connector is provisioned yet.
// See `_demo-source-marker.ts`.
// ═══════════════════════════════════════════════════════════════

export interface WebsiteBuilderSiteFixture {
  id: number;
  name: string;
  url: string;
  status: "live" | "draft";
  pages: number;
  visitors: string;
  lastEdit: string;
  leadsCapt: number;
  revenue: string;
  convRate: string;
  seoScore: number;
  bounceRate: string;
  avgTime: string;
}

export const WEBSITE_BUILDER_SITES: ReadonlyArray<WebsiteBuilderSiteFixture> = [
  { id: 1, name: "Main Business Site",            url: "mybiz.com",              status: "live",  pages: 12, visitors: "1.2K/mo", lastEdit: "2h ago", leadsCapt: 34, revenue: "$28,400", convRate: "4.2%", seoScore: 87, bounceRate: "32%", avgTime: "2:45" },
  { id: 2, name: "Product Landing — Spring Launch", url: "mybiz.com/launch",     status: "live",  pages:  3, visitors: "890/mo",  lastEdit: "1d ago", leadsCapt: 18, revenue: "$14,200", convRate: "6.1%", seoScore: 72, bounceRate: "28%", avgTime: "3:12" },
  { id: 3, name: "Lead Capture Funnel",           url: "mybiz.com/free-consult", status: "live",  pages:  4, visitors: "340/mo",  lastEdit: "3d ago", leadsCapt: 12, revenue: "$9,800",  convRate: "3.5%", seoScore: 65, bounceRate: "45%", avgTime: "1:58" },
  { id: 4, name: "Case Study Hub",                url: "mybiz.com/results",      status: "draft", pages:  6, visitors: "—",       lastEdit: "5d ago", leadsCapt:  0, revenue: "$0",       convRate: "—",    seoScore: 41, bounceRate: "—",   avgTime: "—"    },
] as const;

export interface WebsiteBuilderAbTestFixture {
  id: number;
  page: string;
  variant: string;
  convA: string;
  convB: string;
  winner: string;
  lift: string;
  status: "complete" | "running";
  revenue: string;
}

export const WEBSITE_BUILDER_AB_TESTS: ReadonlyArray<WebsiteBuilderAbTestFixture> = [
  { id: 1, page: "Product Landing",    variant: "A: Blue CTA",   convA: "4.2%", convB: "6.8%", winner: "B", lift: "+62%", status: "complete", revenue: "+$4,100" },
  { id: 2, page: "Lead Capture Funnel", variant: "A: Long Form",  convA: "3.5%", convB: "5.1%", winner: "B", lift: "+46%", status: "running",  revenue: "+$2,300 projected" },
  { id: 3, page: "Main Site — Hero",    variant: "A: Video Hero", convA: "2.8%", convB: "3.1%", winner: "—", lift: "+11%", status: "running",  revenue: "TBD" },
] as const;

export interface WebsiteBuilderSeoKeywordFixture {
  keyword: string;
  position: number;
  change: string;
  volume: string;
  page: string;
}

export const WEBSITE_BUILDER_SEO_KEYWORDS: ReadonlyArray<WebsiteBuilderSeoKeywordFixture> = [
  { keyword: "business consulting near me", position:  3, change: "+2",  volume: "2.4K", page: "Main Site" },
  { keyword: "free business consultation",  position:  7, change: "+5",  volume: "1.8K", page: "Lead Capture" },
  { keyword: "startup growth services",     position: 12, change: "-1",  volume: "890",  page: "Main Site" },
  { keyword: "case study template",         position: 18, change: "new", volume: "3.2K", page: "Case Study Hub" },
] as const;

export interface WebsiteBuilderHeatmapFixture {
  page: string;
  topClick: string;
  scrollDepth: string;
  dropOff: string;
  suggestion: string;
}

export const WEBSITE_BUILDER_HEATMAPS: ReadonlyArray<WebsiteBuilderHeatmapFixture> = [
  { page: "Product Landing", topClick: "CTA Button (68%)",   scrollDepth: "78%", dropOff: "Pricing Section",     suggestion: "Move pricing above fold — 23% drop-off before seeing it" },
  { page: "Lead Capture",    topClick: "Form Field 1 (45%)", scrollDepth: "92%", dropOff: "Phone Number Field",  suggestion: "Remove phone field — 31% abandon at that step" },
] as const;

export interface WebsiteBuilderTemplateFixture {
  icon: string;
  name: string;
  desc: string;
  convRate: string;
  uses: number;
}

export const WEBSITE_BUILDER_TEMPLATES: ReadonlyArray<WebsiteBuilderTemplateFixture> = [
  { icon: "🚀", name: "Product Launch",        desc: "Landing page + waitlist",      convRate: "5.2% avg", uses: 1240 },
  { icon: "📋", name: "Lead Capture",          desc: "Form + thank you page",         convRate: "4.8% avg", uses: 3100 },
  { icon: "🏢", name: "Business Homepage",     desc: "About, services, contact",      convRate: "3.1% avg", uses: 890  },
  { icon: "📰", name: "Newsletter Signup",     desc: "Email capture + preview",       convRate: "7.2% avg", uses: 2400 },
  { icon: "📊", name: "Case Study",            desc: "Results + testimonials",        convRate: "4.5% avg", uses: 670  },
  { icon: "🎯", name: "Webinar Registration",  desc: "Event page + countdown",        convRate: "8.1% avg", uses: 1800 },
] as const;