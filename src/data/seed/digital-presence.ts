// SITA OS — Demo Data: Digital Presence
import {
  Smartphone, Globe, Users, Shield, Link2, Layout, Clock, Phone, MapPin, Tag,
  MousePointer, ShoppingCart, FileText, Image, Eye, Target, TrendingUp, Calendar,
  BarChart3, Monitor, Palette, Store, Megaphone, Sparkles, Wrench, Rocket, Server,
  Lock,
} from "lucide-react";


export const DEMO_DPO_DISAGREEMENTS = [
  {
    topic: "Homepage hero redesign priority",
    agents: ["Web Strategist", "Design Director", "CRO Advisor"],
    positions: [
      { agent: "Web Strategist", position: "Prioritize value prop rewrite first", confidence: 87 },
      { agent: "Design Director", position: "Visual hierarchy fix is more impactful", confidence: 82 },
      { agent: "CRO Advisor", position: "CTA above fold is the fastest win", confidence: 92 },
    ],
    resolution: "CRO Advisor's suggestion has highest confidence and fastest impact. Recommend CTA fix first, then content, then layout."
  },
  {
    topic: "Blog content refresh vs new landing pages",
    agents: ["Content Strategist", "Web Strategist"],
    positions: [
      { agent: "Content Strategist", position: "Refresh 12 stale blogs — engagement declining", confidence: 94 },
      { agent: "Web Strategist", position: "New campaign landing page will drive more conversions", confidence: 76 },
    ],
    resolution: "Content refresh has higher confidence. Recommend parallel execution — refresh blogs while drafting landing page."
  },
];

export const DEMO_EXPERIENCE_TYPES = [
  { type: "App Landing Page", desc: "Mobile-first marketing page for your app", icon: Smartphone, color: "text-blue-400" },
  { type: "Progressive Web App", desc: "Installable web app with offline support", icon: Globe, color: "text-green-400" },
  { type: "Client Portal", desc: "Secure dashboard for your customers", icon: Users, color: "text-purple-400" },
  { type: "Member Dashboard", desc: "Membership area with gated content", icon: Shield, color: "text-amber-400" },
  { type: "Deep-Link Flow", desc: "Multi-step flow accessible via shareable URL", icon: Link2, color: "text-cyan-400" },
  { type: "Mobile-First Variant", desc: "Alternative mobile experience for existing pages", icon: Layout, color: "text-rose-400" },
];

export const DEMO_EXISTING_EXPERIENCES = [
  { name: "Client Dashboard", type: "Client Portal", status: "live", users: 142, lastUpdate: "2 days ago", mobile: 88 },
  { name: "Booking Mini-App", type: "Progressive Web App", status: "live", users: 89, lastUpdate: "1 week ago", mobile: 95 },
  { name: "Course Portal", type: "Member Dashboard", status: "draft", users: 0, lastUpdate: "3 hours ago", mobile: 72 },
];

export const DEMO_PWA_SETTINGS = [
  { setting: "App Name", value: "MyBusiness", editable: true },
  { setting: "Short Name", value: "MyBiz", editable: true },
  { setting: "Theme Color", value: "#3B82F6", editable: true },
  { setting: "Background Color", value: "#0F172A", editable: true },
  { setting: "Display Mode", value: "standalone", editable: true },
  { setting: "Start URL", value: "/app", editable: true },
  { setting: "Offline Support", value: "Enabled", editable: true },
  { setting: "Install Prompt", value: "After 2nd visit", editable: true },
];

export const DEMO_PORTAL_FEATURES = [
  { feature: "Authentication", status: "active", desc: "Email + Google SSO" },
  { feature: "Dashboard Overview", status: "active", desc: "KPIs, activity, upcoming" },
  { feature: "Document Access", status: "active", desc: "Shared files & invoices" },
  { feature: "Booking Widget", status: "active", desc: "Schedule appointments" },
  { feature: "Messaging", status: "planned", desc: "Secure client messaging" },
  { feature: "Payment History", status: "planned", desc: "View invoices & receipts" },
];

export const DEMO_BRAND_COLORS = [
  { name: "Primary", value: "#3B82F6", hsl: "217 91% 60%" },
  { name: "Secondary", value: "#8B5CF6", hsl: "263 70% 66%" },
  { name: "Accent", value: "#F59E0B", hsl: "38 92% 50%" },
  { name: "Background", value: "#0F172A", hsl: "222 47% 11%" },
  { name: "Surface", value: "#1E293B", hsl: "217 33% 17%" },
  { name: "Foreground", value: "#F8FAFC", hsl: "210 40% 98%" },
];

export const DEMO_TYPOGRAPHY = [
  { role: "Headings", family: "Inter", weight: "700", size: "24–48px" },
  { role: "Body", family: "Inter", weight: "400", size: "14–16px" },
  { role: "Captions", family: "Inter", weight: "500", size: "11–12px" },
  { role: "Code", family: "JetBrains Mono", weight: "400", size: "13px" },
];

export const DEMO_BRAND_ASSETS = [
  { name: "Primary Logo", format: "SVG", status: "ready" },
  { name: "Logo Mark", format: "PNG", status: "ready" },
  { name: "Favicon", format: "ICO", status: "ready" },
  { name: "Social Card", format: "PNG 1200×630", status: "draft" },
  { name: "Email Header", format: "PNG", status: "missing" },
];

export const DEMO_REUSABLE_BLOCKS = [
  { name: "Hero Section", uses: 3, category: "Header" },
  { name: "Testimonials Grid", uses: 2, category: "Social Proof" },
  { name: "CTA Banner", uses: 5, category: "Conversion" },
  { name: "Pricing Table", uses: 1, category: "Conversion" },
  { name: "Footer", uses: 4, category: "Navigation" },
];

export const DEMO_CTA_ANALYSIS = [
  { page: "Homepage", cta: "Book a Free Call", clicks: 342, ctr: "8.1%", position: "Above fold", score: 92 },
  { page: "Services", cta: "Get Started", clicks: 89, ctr: "4.2%", position: "Below fold", score: 65 },
  { page: "Pricing", cta: "Choose Plan", clicks: 156, ctr: "13.0%", position: "Above fold", score: 88 },
  { page: "Blog Post", cta: "Read More", clicks: 34, ctr: "1.2%", position: "Bottom", score: 35 },
];

export const DEMO_TRUST_GAPS = [
  { page: "Services", gap: "No testimonials or social proof", impact: "high", fix: "Add 3+ client testimonials" },
  { page: "Checkout", gap: "Missing security badges", impact: "high", fix: "Add SSL + payment trust badges" },
  { page: "Pricing", gap: "No money-back guarantee visible", impact: "medium", fix: "Add guarantee badge near CTA" },
  { page: "About", gap: "No team photos or credentials", impact: "low", fix: "Add team section with headshots" },
];

export const DEMO_FUNNEL_LEAKS = [
  { step: "Landing → Services", dropoff: "38%", visitors: 4201, issue: "Weak value proposition above fold" },
  { step: "Services → Book", dropoff: "45%", visitors: 2103, issue: "CTA below fold on mobile" },
  { step: "Cart → Checkout", dropoff: "32%", visitors: 1200, issue: "Surprise shipping costs" },
  { step: "Checkout → Complete", dropoff: "28%", visitors: 890, issue: "Too many form fields" },
];

export const DEMO_FORM_FRICTION = [
  { page: "Contact", fields: 7, avgTime: "2m 34s", abandon: "42%", recommendation: "Reduce to 4 fields" },
  { page: "Booking", fields: 5, avgTime: "1m 12s", abandon: "18%", recommendation: "Good — minor label improvements" },
  { page: "Checkout", fields: 9, avgTime: "3m 48s", abandon: "35%", recommendation: "Add autofill, reduce to 6 fields" },
];

export const DEMO_MOBILE_ISSUES = [
  { page: "/services", issue: "CTA button too small on mobile (32px)", severity: "high" },
  { page: "/contact", issue: "Form layout breaks on iPhone SE", severity: "high" },
  { page: "/shop", issue: "Product images not lazy-loaded", severity: "medium" },
  { page: "/pricing", issue: "Table not responsive — horizontal scroll", severity: "medium" },
];

export const DEMO_DPO_PLATFORMS = [
  { name: "Shopify", icon: "🛒", connected: true, url: "mystore.myshopify.com", health: 94, lastSync: "2 min ago", products: 48, issues: 1 },
  { name: "WordPress", icon: "📝", connected: true, url: "blog.mybusiness.com", health: 78, lastSync: "1 hr ago", products: 0, issues: 3 },
  { name: "Webflow", icon: "🎨", connected: false, url: null, health: 0, lastSync: null, products: 0, issues: 0 },
  { name: "Wix", icon: "🌐", connected: false, url: null, health: 0, lastSync: null, products: 0, issues: 0 },
  { name: "Squarespace", icon: "◼️", connected: false, url: null, health: 0, lastSync: null, products: 0, issues: 0 },
  { name: "Custom Site", icon: "🔧", connected: true, url: "mybusiness.com", health: 85, lastSync: "30 min ago", products: 0, issues: 2 },
];

export const DEMO_AUDIT_FINDINGS = [
  { site: "WordPress", finding: "3 plugins need security updates", severity: "high", category: "Security" },
  { site: "WordPress", finding: "SSL certificate expiring in 14 days", severity: "medium", category: "Technical" },
  { site: "WordPress", finding: "7 images not optimized for web", severity: "low", category: "Performance" },
  { site: "Shopify", finding: "Product 'Summer Tee' missing description", severity: "low", category: "Content" },
  { site: "Custom Site", finding: "Contact page returns 404 on mobile", severity: "high", category: "UX" },
  { site: "Custom Site", finding: "Meta description missing on 4 pages", severity: "medium", category: "SEO" },
];

export const DEMO_AI_RECOMMENDATIONS = [
  { action: "Update WordPress plugins", risk: "low", impact: "Fixes 3 known vulnerabilities", autoFixable: true },
  { action: "Add product descriptions to 5 Shopify items", risk: "low", impact: "Improves SEO and conversion", autoFixable: false },
  { action: "Fix mobile 404 on contact page", risk: "low", impact: "Restores lead capture path", autoFixable: true },
  { action: "Compress 7 images on WordPress", risk: "none", impact: "30% faster page load", autoFixable: true },
];

export const DEMO_STALE_PAGES = [
  { page: "/blog/2023-trends", lastUpdated: "14 months ago", views: 120, category: "Blog", staleness: 95 },
  { page: "/blog/old-guide", lastUpdated: "11 months ago", views: 45, category: "Blog", staleness: 85 },
  { page: "/services/legacy", lastUpdated: "9 months ago", views: 230, category: "Service", staleness: 75 },
  { page: "/faq", lastUpdated: "7 months ago", views: 560, category: "Support", staleness: 60 },
  { page: "/team", lastUpdated: "5 months ago", views: 180, category: "About", staleness: 45 },
];

export const DEMO_EXPIRED_OFFERS = [
  { offer: "Summer Sale 2024", page: "/summer-sale", expiredDays: 14, stillLive: true },
  { offer: "Holiday Bundle", page: "/holiday-bundle", expiredDays: 45, stillLive: true },
  { offer: "Early Bird Pricing", page: "/pricing", expiredDays: 0, stillLive: false },
];

export const DEMO_STALE_INFO = [
  { type: "Business Hours", page: "/contact", issue: "Shows Mon-Fri 9-5, but you're now open Saturdays", icon: Clock },
  { type: "Phone Number", page: "/contact", issue: "Old number still displayed — new number not updated", icon: Phone },
  { type: "Location", page: "/about", issue: "Address shows old office location", icon: MapPin },
  { type: "Product Description", page: "/products/item-3", issue: "Describes old version — updated product not reflected", icon: Tag },
];

export const DEMO_INCONSISTENCIES = [
  { pages: ["/homepage", "/about"], issue: "Different taglines used — 'We help you grow' vs 'Growth made simple'" },
  { pages: ["/pricing", "/services"], issue: "Pricing on services page doesn't match pricing page" },
  { pages: ["/footer", "/contact"], issue: "Email address differs between footer and contact page" },
];

export const DEMO_DPO_DOMAINS = [
  { domain: "mybusiness.com", type: "primary", ssl: true, status: "active", dnsOk: true, lastPublished: "2 hours ago" },
  { domain: "www.mybusiness.com", type: "redirect", ssl: true, status: "active", dnsOk: true, lastPublished: "2 hours ago" },
  { domain: "shop.mybusiness.com", type: "subdomain", ssl: true, status: "active", dnsOk: true, lastPublished: "1 day ago" },
  { domain: "staging.mybusiness.com", type: "staging", ssl: true, status: "ready", dnsOk: true, lastPublished: "30 min ago" },
];

export const DEMO_DPO_ENVIRONMENTS = [
  { env: "Production", url: "mybusiness.com", status: "live", version: "v2.4.1", lastDeploy: "2 hours ago", deployer: "Auto (approved)" },
  { env: "Staging", url: "staging.mybusiness.com", status: "ready", version: "v2.5.0-beta", lastDeploy: "30 min ago", deployer: "Design Director" },
  { env: "Preview", url: "preview-abc123.sita.app", status: "active", version: "v2.5.0-beta.2", lastDeploy: "5 min ago", deployer: "AI Web Team" },
];

export const DEMO_PUBLISH_HISTORY = [
  { version: "v2.4.1", date: "Apr 3, 2:14 PM", changes: "Homepage hero redesign, checkout trust badges", approvedBy: "Owner", status: "live" },
  { version: "v2.4.0", date: "Apr 1, 10:30 AM", changes: "Summer sale banner, product page updates", approvedBy: "Owner", status: "archived" },
  { version: "v2.3.2", date: "Mar 28, 4:45 PM", changes: "Blog content refresh, SEO meta fixes", approvedBy: "Auto", status: "archived" },
  { version: "v2.3.1", date: "Mar 25, 11:00 AM", changes: "Contact form fix, image compression", approvedBy: "Auto", status: "archived" },
  { version: "v2.3.0", date: "Mar 20, 9:15 AM", changes: "Mobile nav redesign, pricing table", approvedBy: "Owner", status: "archived" },
];

export const DEMO_PUBLISH_RULES = [
  { rule: "Require owner approval for homepage changes", active: true },
  { rule: "Auto-publish low-risk SEO fixes", active: true },
  { rule: "Require preview before any checkout changes", active: true },
  { rule: "Block publish if critical issues detected", active: true },
  { rule: "Auto-notify team on publish", active: false },
  { rule: "Require staging test before production", active: false },
];

export const DEMO_DPO_PRODUCTS = [
  { name: "Premium Yoga Mat", price: "$79", stock: 24, views: 1200, conversion: "4.2%", rating: 4.8, status: "active" },
  { name: "Resistance Bands Set", price: "$29", stock: 156, views: 890, conversion: "6.1%", rating: 4.5, status: "active" },
  { name: "Summer Tee (Limited)", price: "$45", stock: 3, views: 342, conversion: "2.8%", rating: 4.2, status: "low-stock" },
  { name: "Wellness Journal", price: "$22", stock: 89, views: 120, conversion: "1.1%", rating: 3.9, status: "underperforming" },
  { name: "Gift Bundle", price: "$120", stock: 45, views: 567, conversion: "3.5%", rating: 4.7, status: "active" },
];

export const DEMO_COLLECTIONS = [
  { name: "Best Sellers", products: 8, revenue: "$4,280", featured: true },
  { name: "New Arrivals", products: 5, revenue: "$1,200", featured: true },
  { name: "Summer Collection", products: 12, revenue: "$2,100", featured: false },
  { name: "Gift Ideas", products: 6, revenue: "$890", featured: false },
];

export const DEMO_CART_DIAGNOSTICS = [
  { issue: "Shipping cost surprise at checkout", impact: "32% of cart abandonments", severity: "critical" },
  { issue: "No guest checkout option", impact: "18% of abandonments", severity: "high" },
  { issue: "Payment method limited to credit card", impact: "12% of abandonments", severity: "medium" },
  { issue: "No urgency/scarcity signals", impact: "Estimated 5% lift possible", severity: "opportunity" },
];

export const DEMO_MERCHANDISING_OPS = [
  { action: "Feature 'Resistance Bands' on homepage — highest conversion", type: "opportunity", confidence: 89 },
  { action: "Bundle 'Yoga Mat' + 'Resistance Bands' — natural pair", type: "opportunity", confidence: 82 },
  { action: "Archive 'Wellness Journal' — low performance, update or remove", type: "cleanup", confidence: 75 },
  { action: "Add related products to 'Gift Bundle' page", type: "improvement", confidence: 91 },
];

export const DEMO_ERRORS = [
  { type: "Broken Link", icon: Link2, page: "/blog/old-post", detail: "Links to /resources/guide → 404", severity: "high", autoFixable: true },
  { type: "Missing Image", icon: Image, page: "/products/item-5", detail: "Product image returns 404", severity: "high", autoFixable: false },
  { type: "Stale Content", icon: Clock, page: "/blog/2023-trends", detail: "Published 14 months ago, never updated", severity: "medium", autoFixable: false },
  { type: "Expired Promo", icon: Clock, page: "/summer-sale", detail: "Sale ended 2 weeks ago, page still live", severity: "high", autoFixable: true },
  { type: "Weak CTA", icon: MousePointer, page: "/services", detail: "CTA below fold, 1.2% CTR — 65% below average", severity: "medium", autoFixable: false },
  { type: "Trust Gap", icon: Shield, page: "/checkout", detail: "No security badges visible near payment form", severity: "high", autoFixable: true },
  { type: "Mobile Issue", icon: Smartphone, page: "/contact", detail: "Form breaks on screens < 375px", severity: "high", autoFixable: false },
  { type: "Cart Leakage", icon: ShoppingCart, page: "/cart", detail: "32% drop at shipping reveal — surprise costs", severity: "critical", autoFixable: false },
  { type: "Missing Meta", icon: FileText, page: "/about", detail: "No meta description — hurts SEO", severity: "low", autoFixable: true },
];

export const DEMO_OPPORTUNITIES = [
  { title: "Add testimonials to services page", impact: "high", effort: "low", category: "Trust" },
  { title: "Feature best-seller on homepage", impact: "high", effort: "low", category: "Merchandising" },
  { title: "Create FAQ page from support queries", impact: "medium", effort: "medium", category: "Content" },
  { title: "Add exit-intent popup on cart page", impact: "high", effort: "medium", category: "CRO" },
  { title: "Refresh 12 stale blog posts", impact: "medium", effort: "high", category: "Content" },
];

export const DEMO_DPO_READINESS_CHECKS = [
  { area: "Landing Page", status: "ready", score: 95, details: "Page live, CTA strong, mobile optimized" },
  { area: "Copy & Content", status: "ready", score: 90, details: "Headlines tested, descriptions complete" },
  { area: "Visual Design", status: "ready", score: 88, details: "Brand-aligned, responsive, images optimized" },
  { area: "Checkout Flow", status: "warning", score: 72, details: "Guest checkout missing — recommend adding" },
  { area: "Tracking & Analytics", status: "ready", score: 85, details: "UTMs set, conversion pixels active" },
  { area: "Email / SMS Automation", status: "ready", score: 91, details: "Welcome sequence, abandoned cart ready" },
  { area: "Cart Recovery", status: "warning", score: 65, details: "Only 1 recovery email — add 2 more" },
  { area: "Rollback Plan", status: "ready", score: 100, details: "Previous version saved, instant rollback" },
];

export const DEMO_LAUNCH_TIMELINE = [
  { time: "T-48h", task: "Final copy review", status: "done" },
  { time: "T-24h", task: "Visual QA pass", status: "done" },
  { time: "T-12h", task: "Checkout test orders", status: "done" },
  { time: "T-6h", task: "Analytics verification", status: "done" },
  { time: "T-2h", task: "Team notification", status: "pending" },
  { time: "T-1h", task: "Final approval", status: "pending" },
  { time: "Launch", task: "Go live", status: "pending" },
  { time: "T+1h", task: "Monitor metrics", status: "pending" },
  { time: "T+24h", task: "Performance review", status: "pending" },
];

export const DEMO_OVERVIEW_METRICS = [
  { label: "Total Visitors", value: "12,847", change: "+14.2%", up: true, icon: Eye },
  { label: "Unique Visitors", value: "9,203", change: "+11.8%", up: true, icon: Users },
  { label: "Conversion Rate", value: "3.2%", change: "+0.4%", up: true, icon: Target },
  { label: "Bounce Rate", value: "42%", change: "-3.1%", up: true, icon: TrendingUp },
  { label: "Avg Session", value: "3m 24s", change: "+18s", up: true, icon: Calendar },
  { label: "Revenue from Web", value: "$8,420", change: "+22%", up: true, icon: ShoppingCart },
];

export const DEMO_SOURCE_PERFORMANCE = [
  { source: "Organic Search", visitors: 4201, conversion: "4.1%", revenue: "$3,200", quality: 92, trend: "up" },
  { source: "Direct", visitors: 2890, conversion: "3.8%", revenue: "$2,100", quality: 85, trend: "stable" },
  { source: "Social Media", visitors: 2103, conversion: "2.1%", revenue: "$1,400", quality: 68, trend: "up" },
  { source: "Referral", visitors: 1847, conversion: "5.2%", revenue: "$1,200", quality: 90, trend: "up" },
  { source: "Paid Ads", visitors: 1204, conversion: "1.8%", revenue: "$520", quality: 55, trend: "down" },
  { source: "Email", visitors: 602, conversion: "8.4%", revenue: "$800", quality: 95, trend: "stable" },
];

export const DEMO_PAGE_IMPACT = [
  { page: "/", name: "Homepage", visits: 4201, conversion: "4.1%", bounceRate: "38%", avgTime: "2m 12s", revenue: "$2,400", impact: "high" },
  { page: "/book", name: "Booking", visits: 1847, conversion: "12.4%", bounceRate: "22%", avgTime: "4m 30s", revenue: "$3,200", impact: "high" },
  { page: "/services", name: "Services", visits: 2103, conversion: "2.8%", bounceRate: "45%", avgTime: "1m 48s", revenue: "$890", impact: "medium" },
  { page: "/shop", name: "Shop", visits: 3102, conversion: "3.5%", bounceRate: "35%", avgTime: "3m 15s", revenue: "$1,800", impact: "high" },
  { page: "/pricing", name: "Pricing", visits: 1204, conversion: "5.2%", bounceRate: "52%", avgTime: "1m 20s", revenue: "$1,200", impact: "medium" },
  { page: "/blog", name: "Blog", visits: 2800, conversion: "0.8%", bounceRate: "65%", avgTime: "2m 45s", revenue: "$120", impact: "low" },
  { page: "/contact", name: "Contact", visits: 445, conversion: "18.2%", bounceRate: "28%", avgTime: "1m 55s", revenue: "$0", impact: "medium" },
];

export const DEMO_PROMO_PERFORMANCE = [
  { name: "Summer Sale Banner", placement: "Homepage Hero", impressions: 4201, clicks: 342, ctr: "8.1%", conversions: 48, revenue: "$2,160", status: "active" },
  { name: "Free Shipping Bar", placement: "Cart Page", impressions: 1200, clicks: 89, ctr: "7.4%", conversions: 34, revenue: "$1,530", status: "active" },
  { name: "New Collection CTA", placement: "Shop Page", impressions: 3102, clicks: 156, ctr: "5.0%", conversions: 21, revenue: "$945", status: "active" },
];

export const DEMO_AGENT_CONFIDENCE = [
  { agent: "CRO Advisor", confidence: 88, trend: "improving", topInsight: "Pricing page bounce rate decreasing after CTA changes" },
  { agent: "Content Strategist", confidence: 72, trend: "stable", topInsight: "Blog engagement flat — needs content refresh strategy" },
  { agent: "SEO Advisor", confidence: 81, trend: "improving", topInsight: "Organic traffic up 14% after meta description fixes" },
  { agent: "Merchandising Advisor", confidence: 65, trend: "declining", topInsight: "Product page conversion dropping — needs attention" },
];

export const DEMO_DPO_METRICS = [
  { label: "Total Traffic", value: "12,847", change: "+14.2%", up: true, icon: Eye },
  { label: "Conversion Rate", value: "3.2%", change: "+0.4%", up: true, icon: TrendingUp },
  { label: "Cart Abandonment", value: "68%", change: "-2.1%", up: true, icon: ShoppingCart },
  { label: "Site Health", value: "87/100", change: "+3", up: true, icon: Globe },
];

export const DEMO_TOP_PAGES = [
  { page: "/", name: "Homepage", views: 4201, conversion: "4.1%", health: 92 },
  { page: "/services", name: "Services", views: 2103, conversion: "2.8%", health: 85 },
  { page: "/book", name: "Booking", views: 1847, conversion: "12.4%", health: 90 },
  { page: "/pricing", name: "Pricing", views: 1204, conversion: "5.2%", health: 78 },
  { page: "/about", name: "About", views: 892, conversion: "0.8%", health: 95 },
];

export const DEMO_WEAK_PAGES = [
  { page: "/blog/old-post", issue: "Stale content — last updated 9 months ago", severity: "high" },
  { page: "/products/item-12", issue: "Low conversion, weak CTA", severity: "medium" },
  { page: "/contact", issue: "Form has 7 fields — consider reducing", severity: "low" },
];

export const DEMO_LIVE_PROMOTIONS = [
  { name: "Summer Sale Banner", status: "active", expires: "3 days", placement: "Homepage hero" },
  { name: "Free Shipping", status: "active", expires: "7 days", placement: "Cart page" },
  { name: "Holiday Bundle", status: "scheduled", expires: "—", placement: "Collection page" },
];

export const DEMO_DPO_ADVISOR_SIGNALS = [
  { advisor: "CRO Advisor", signal: "Pricing page has high bounce — add social proof below fold", type: "opportunity" },
  { advisor: "Content Strategist", signal: "12 blog posts haven't been updated in 6+ months", type: "warning" },
  { advisor: "SEO Advisor", signal: "3 pages missing meta descriptions", type: "fix" },
  { advisor: "Design Director", signal: "Mobile CTA on services page barely visible", type: "alert" },
];

export const DEMO_WORKSPACES = [
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

export const DEMO_HEALTH_STATS = [
  { label: "Site Health", value: "87%", status: "good" },
  { label: "Pages Active", value: "24", status: "neutral" },
  { label: "Conversion Rate", value: "3.2%", status: "good" },
  { label: "Issues Found", value: "7", status: "warning" },
];

export const DEMO_TIMELINE_EVENTS = [
  { date: "Apr 3", event: "Homepage hero redesign", type: "design", impact: "+18% CTR", positive: true, details: "New value prop + hero image. CRO Advisor recommended duplicating CTA." },
  { date: "Apr 1", event: "Added checkout trust badges", type: "trust", impact: "-8% abandonment", positive: true, details: "SSL + payment badges added near CTA. Advisor-generated recommendation." },
  { date: "Mar 28", event: "Summer sale banner deployed", type: "promotion", impact: "+12% revenue", positive: true, details: "Homepage hero banner for 20% off sale. Auto-cleanup scheduled for Apr 11." },
  { date: "Mar 25", event: "Blog content refresh (5 posts)", type: "content", impact: "+22% organic traffic", positive: true, details: "Content Strategist flagged 5 stale posts. Updated with current data." },
  { date: "Mar 20", event: "Contact form reduced to 4 fields", type: "cro", impact: "-15% form abandon", positive: true, details: "CRO Advisor recommendation. Removed company, title, budget fields." },
  { date: "Mar 15", event: "Mobile nav redesign", type: "design", impact: "-3% mobile time", positive: false, details: "New hamburger menu. Some users struggle with nested items. Under review." },
  { date: "Mar 10", event: "Product page A/B test launched", type: "experiment", impact: "Running", positive: true, details: "Testing larger images vs current layout. 60% through test." },
  { date: "Mar 5", event: "WordPress security patches", type: "maintenance", impact: "3 CVEs fixed", positive: true, details: "Auto-fix applied by Technical QA advisor. No downtime." },
];

export const DEMO_ACTIVE_PROMOTIONS = [
  { name: "Summer Sale — 20% Off", type: "Site Banner", placement: "Homepage Hero", status: "active", expires: "3 days", impressions: 4201, clicks: 342, ctr: "8.1%" },
  { name: "Free Shipping Over $50", type: "Cart Banner", placement: "Cart Page", status: "active", expires: "7 days", impressions: 1200, clicks: 89, ctr: "7.4%" },
  { name: "New Collection Launch", type: "Campaign Page", placement: "Landing Page", status: "scheduled", expires: "—", impressions: 0, clicks: 0, ctr: "—" },
  { name: "Holiday Bundle Deal", type: "Product Badge", placement: "Collection Page", status: "draft", expires: "—", impressions: 0, clicks: 0, ctr: "—" },
];

export const DEMO_PROMO_CALENDAR = [
  { date: "Apr 8", event: "Summer Sale Starts", type: "promotion" },
  { date: "Apr 11", event: "Summer Sale Ends — auto-cleanup", type: "cleanup" },
  { date: "Apr 15", event: "New Collection Launch", type: "launch" },
  { date: "Apr 20", event: "Easter Promo — auto-activate", type: "promotion" },
  { date: "May 1", event: "Spring Clearance", type: "promotion" },
];

export const DEMO_EMAIL_SMS_SYNC = [
  { campaign: "Summer Sale Announcement", channel: "Email", status: "sent", opens: "34%", clicks: "12%" },
  { campaign: "Free Shipping Reminder", channel: "SMS", status: "scheduled", opens: "—", clicks: "—" },
  { campaign: "New Collection Preview", channel: "Email", status: "draft", opens: "—", clicks: "—" },
];

export const DEMO_DPO_STATS = [
  { label: "Pending Patches", value: 4, color: "text-amber-400" },
  { label: "Auto-Fix Eligible", value: 3, color: "text-green-400" },
  { label: "Applied This Week", value: 5, color: "text-blue-400" },
  { label: "Verified Clean", value: 4, color: "text-primary" },
];

export const DEMO_PAGE_TYPES = [
  { type: "Landing Page", desc: "High-converting campaign or product page", icon: Rocket, color: "text-blue-400" },
  { type: "Service Page", desc: "Describe and sell a service offering", icon: FileText, color: "text-green-400" },
  { type: "Booking Page", desc: "Let customers schedule appointments", icon: Calendar, color: "text-purple-400" },
  { type: "Product Page", desc: "Showcase and sell a product", icon: ShoppingCart, color: "text-amber-400" },
  { type: "Checkout Flow", desc: "Secure payment and order flow", icon: ShoppingCart, color: "text-rose-400" },
  { type: "Member Page", desc: "Gated content for members only", icon: Users, color: "text-cyan-400" },
  { type: "Campaign Microsite", desc: "Focused multi-page campaign experience", icon: Globe, color: "text-orange-400" },
  { type: "Full Website", desc: "Complete multi-page website", icon: Layout, color: "text-indigo-400" },
];

export const DEMO_EXISTING_PAGES = [
  { name: "Homepage", type: "Landing Page", status: "published", lastEdit: "2 days ago", views: 4201 },
  { name: "Summer Sale", type: "Campaign Microsite", status: "draft", lastEdit: "1 hour ago", views: 0 },
  { name: "Book a Call", type: "Booking Page", status: "published", lastEdit: "1 week ago", views: 1847 },
  { name: "Service: Web Design", type: "Service Page", status: "published", lastEdit: "3 days ago", views: 892 },
  { name: "Checkout", type: "Checkout Flow", status: "published", lastEdit: "2 weeks ago", views: 890 },
];

export const DEMO_PAGE_TREE = [
  { path: "/", label: "Homepage", health: 92, views: 4201, mobile: 88, children: [
    { path: "/services", label: "Services", health: 85, views: 2103, mobile: 72 },
    { path: "/pricing", label: "Pricing", health: 78, views: 1204, mobile: 80 },
    { path: "/about", label: "About", health: 95, views: 892, mobile: 91 },
    { path: "/contact", label: "Contact", health: 70, views: 445, mobile: 65 },
  ]},
  { path: "/book", label: "Booking", health: 90, views: 1847, mobile: 85, children: [] },
  { path: "/shop", label: "Shop", health: 82, views: 3102, mobile: 76, children: [
    { path: "/shop/cart", label: "Cart", health: 75, views: 1200, mobile: 70 },
    { path: "/shop/checkout", label: "Checkout", health: 68, views: 890, mobile: 62 },
  ]},
  { path: "/blog", label: "Blog", health: 60, views: 2800, mobile: 82, children: [] },
];

export const DEMO_CONVERSION_PATHS = [
  { name: "Homepage → Services → Book", rate: "12.4%", volume: 342, trend: "up" },
  { name: "Homepage → Shop → Cart → Checkout", rate: "3.8%", volume: 198, trend: "down" },
  { name: "Blog → Services → Contact", rate: "2.1%", volume: 87, trend: "stable" },
  { name: "Landing Page → Book", rate: "18.2%", volume: 156, trend: "up" },
];

export const DEMO_WEAK_NODES = [
  { page: "/shop/checkout", issue: "68% drop-off at payment step", severity: "critical" },
  { page: "/contact", issue: "Mobile form barely usable — 65% mobile score", severity: "high" },
  { page: "/blog", issue: "14 posts older than 6 months, no updates", severity: "medium" },
];
