// ═══════════════════════════════════════════════════════════════
// SITA OS — Social Command (Honest-Degraded)
//
// Manifest classification: `degraded` (no social platform OAuth
// wired). Live mode renders a setup-required EmptyStateCard +
// descriptive preview block. Demo mode renders the rich sample
// workspace from `social-command-demo` fixtures.
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import {
  Share2, TrendingUp, Calendar, MessageCircle, Heart, Eye, Plus, DollarSign,
  Zap, Clock, Target, BarChart3, Hash, Users, Bot, Send, LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import { DomainAdvisorCard } from "@/platform/advisors/components/advisors/DomainAdvisorCard";
import {
  SOCIAL_PLATFORMS,
  SOCIAL_SCHEDULED_POSTS,
  SOCIAL_TOP_PERFORMING,
  SOCIAL_HASHTAGS,
  SOCIAL_COMMENTS,
  SOCIAL_COMPETITORS,
} from "@/data/fixtures/mock-data/social-command-demo";

type Tab = "overview" | "calendar" | "comments" | "hashtags" | "competitors" | "attribution";

const LIVE_PREVIEW_FEATURES: ReadonlyArray<{ icon: typeof Share2; title: string; description: string }> = [
  { icon: BarChart3,     title: "Platform overview",   description: "Follower counts, engagement rate, and revenue attribution per connected channel." },
  { icon: Calendar,      title: "Scheduled posts",     description: "Cross-platform publishing calendar with predicted reach and engagement." },
  { icon: MessageCircle, title: "Comment inbox",       description: "Inbound comments and DMs across providers with sentiment classification." },
  { icon: Hash,          title: "Hashtag intelligence", description: "Reach and engagement performance for hashtags used in your posts." },
  { icon: Users,         title: "Competitor monitoring", description: "Posting cadence and engagement of tracked competitor accounts." },
  { icon: DollarSign,    title: "Revenue attribution",  description: "Closed-won revenue traced back to specific posts and campaigns." },
];

const SocialCommand = () => {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── LIVE MODE: honest setup-required state ────────────────────
  if (!isDemo) {
    if (!user) {
      return (
        <div className="mx-auto max-w-5xl space-y-4 p-4">
          <PageTruthBanner truthState="partial" />
          <EmptyStateCard
            icon={LogIn}
            title="Sign in to manage your social channels"
            description="Social Command unifies posting, scheduling, comments, and revenue attribution across Instagram, LinkedIn, X, and Facebook. Sign in to connect a channel, or switch to Demo mode to explore a sample workspace."
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
          icon={Share2}
          title="Connect a social platform"
          description="No social platform OAuth is wired yet. Connect Instagram, LinkedIn, X (Twitter), or Facebook to start scheduling posts, monitoring comments, and tracking revenue attribution. Until then this surface stays intentionally empty rather than displaying fabricated follower counts or engagement metrics."
          ctaLabel="Open integrations"
          ctaPath="/business/integrations"
        />
        <div className="rounded-xl border border-border/40 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-muted-foreground" />
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
  const tabs: { key: Tab; label: string; icon: typeof Share2 }[] = [
    { key: "overview",    label: "Overview",    icon: BarChart3     },
    { key: "calendar",    label: "Calendar",    icon: Calendar      },
    { key: "comments",    label: "Comments",    icon: MessageCircle },
    { key: "hashtags",    label: "Hashtags",    icon: Hash          },
    { key: "competitors", label: "Competitors", icon: Users         },
    { key: "attribution", label: "Revenue",     icon: DollarSign    },
  ];

  const totalLeads = SOCIAL_PLATFORMS.reduce((s, p) => s + p.leadsGenerated, 0);
  const totalRevenue = SOCIAL_PLATFORMS.reduce((s, p) => s + parseInt(p.revenue.replace(/[^0-9]/g, ""), 10), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageTruthBanner truthState="demo" />

      <DomainAdvisorCard
        domain="business"
        insights={[
          { id: "soc-1", text: "LinkedIn posts generate 3.4x more leads than Instagram — focus case study content there", confidence: 87, action: "Draft Post" },
          { id: "soc-2", text: "2 unreplied comments show purchase intent — respond to convert",                          confidence: 79, action: "Reply"      },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Social Command</h1>
          <p className="text-sm text-muted-foreground">Content-to-revenue pipeline with AI scheduling and cross-platform intelligence</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Eye,           label: "Total Reach (30d)",     value: "12.4K",                                                               sub: "↑ 18% vs last month",         color: "text-primary"     },
          { icon: Heart,         label: "Total Engagement",      value: "2.1K",                                                                sub: "4.1% avg rate",                color: "text-pink-500"    },
          { icon: Target,        label: "Leads from Social",     value: String(totalLeads),                                                    sub: `${totalLeads} leads captured`, color: "text-blue-500"    },
          { icon: DollarSign,    label: "Revenue Attributed",    value: `$${(totalRevenue / 1000).toFixed(1)}K`,                               sub: "From social posts",            color: "text-emerald-500" },
          { icon: MessageCircle, label: "Unreplied Comments",    value: String(SOCIAL_COMMENTS.filter((c) => !c.replied).length),              sub: "Respond to convert",           color: "text-amber-500"   },
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
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium">Content Revenue Advisor</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your LinkedIn posts generate <strong>3.4x more leads</strong> than Instagram. The "case study" format has the highest conversion at <strong>8.4% engagement → 3.2% click-through</strong>.
            </p>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full font-medium shrink-0">+$7.2K potential</span>
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

      {activeTab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SOCIAL_PLATFORMS.map((p) => (
              <div key={p.name} className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs font-medium">{p.name}</span>
                </div>
                <p className="text-lg font-bold">{p.followers}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={cn("text-[10px] font-medium", p.growth.startsWith("+") ? "text-emerald-500" : "text-destructive")}>{p.growth}</span>
                  <span className="text-[10px] text-muted-foreground">{p.engagement} eng.</span>
                </div>
                <div className="border-t border-border/20 mt-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{p.leadsGenerated} leads</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">{p.revenue}</span>
                  </div>
                  <p className="text-[10px] text-primary/60 mt-0.5 flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> Best: {p.bestTime}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold mt-4">Top Performing Content (Revenue Impact)</p>
          {SOCIAL_TOP_PERFORMING.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center gap-4">
                <span className="text-xl shrink-0">{post.platform}</span>
                <div className="flex-1 min-w-0"><p className="text-sm truncate">{post.content}</p></div>
                <span className="text-xs font-bold text-emerald-500 shrink-0">{post.revenue}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/20">
                <div><p className="text-xs font-semibold">{post.reach}</p><p className="text-[10px] text-muted-foreground">Reach</p></div>
                <div><p className="text-xs font-semibold">{post.engagement}</p><p className="text-[10px] text-muted-foreground">Engagement</p></div>
                <div><p className="text-xs font-semibold">{post.clicks}</p><p className="text-[10px] text-muted-foreground">Clicks</p></div>
                <div><p className="text-xs font-semibold">{post.leads}</p><p className="text-[10px] text-muted-foreground">Leads</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Scheduled Posts</p>
          {SOCIAL_SCHEDULED_POSTS.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-xl shrink-0">{post.platform}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.content}</p>
                  <p className="text-[11px] text-muted-foreground">{post.time} · {post.platformName}</p>
                </div>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0", post.status === "scheduled" ? "bg-blue-500/15 text-blue-500" : "bg-muted text-muted-foreground")}>{post.status}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Predicted: {post.predictedEng} eng</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> ~{post.predictedReach} reach</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Comment Inbox</p>
          {SOCIAL_COMMENTS.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cn("rounded-xl border bg-card/50 p-4", !c.replied ? "border-primary/30" : "border-border/40")}>
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">{c.platform}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{c.user} · <span className="text-muted-foreground">{c.time}</span></p>
                  <p className="text-sm mt-0.5">{c.content}</p>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", c.sentiment === "positive" ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground")}>{c.sentiment}</span>
                {!c.replied ? (
                  <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 shrink-0"><Send className="h-3 w-3" /> Reply</button>
                ) : (
                  <span className="text-[10px] text-muted-foreground shrink-0">✓ Replied</span>
                )}
              </div>
              {!c.replied && c.content.toLowerCase().includes("get started") && (
                <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-primary flex items-center gap-1"><Zap className="h-3 w-3" /> <strong>Lead signal detected!</strong> This comment indicates purchase intent.</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "hashtags" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Hashtag Performance</p>
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 p-3 text-[10px] font-semibold text-muted-foreground border-b border-border/20">
              <span>Hashtag</span><span>Reach</span><span>Engagement</span><span>Trend</span>
            </div>
            {SOCIAL_HASHTAGS.map((h) => (
              <div key={h.tag} className="grid grid-cols-4 gap-2 p-3 text-xs border-b border-border/10 last:border-0 hover:bg-muted/30">
                <span className="font-medium text-primary">{h.tag}</span>
                <span>{h.reach}</span>
                <span>{h.engagement}</span>
                <span className={cn("font-medium", h.trend.includes("↑") ? "text-emerald-500" : "text-muted-foreground")}>{h.trend}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "competitors" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Competitor Monitoring</p>
          {SOCIAL_COMPETITORS.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{c.name}</p>
                <span className="text-[10px] text-muted-foreground">{c.platform}</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div><p className="text-xs font-semibold">{c.postsPerWeek}/wk</p><p className="text-[10px] text-muted-foreground">Posts</p></div>
                <div><p className="text-xs font-semibold">{c.avgEngagement}</p><p className="text-[10px] text-muted-foreground">Avg Engagement</p></div>
                <div><p className="text-xs font-semibold">{c.followers}</p><p className="text-[10px] text-muted-foreground">Followers</p></div>
                <div><p className="text-xs font-semibold">{c.trend}</p><p className="text-[10px] text-muted-foreground">Trend</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "attribution" && (
        <div className="rounded-xl border border-border/40 bg-card/50 p-6 text-center">
          <DollarSign className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Revenue Attribution Report</p>
          <p className="text-xs text-muted-foreground mt-1">Total revenue from social: <strong className="text-emerald-500">${(totalRevenue / 1000).toFixed(1)}K</strong> across {totalLeads} leads</p>
        </div>
      )}
    </div>
  );
};

export default SocialCommand;