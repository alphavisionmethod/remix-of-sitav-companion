import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { motion } from "framer-motion";
import { Share2, TrendingUp, Calendar, MessageCircle, Heart, Eye, Plus, DollarSign, Zap, Clock, Target, BarChart3, Hash, Users, ArrowUpRight, Bot, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";

const platforms = [
  { name: "Instagram", icon: "📸", followers: "2.4K", growth: "+3.2%", posts: 48, engagement: "4.8%", leadsGenerated: 12, revenue: "$8,400", bestTime: "12:00 PM" },
  { name: "LinkedIn", icon: "💼", followers: "1.8K", growth: "+5.1%", posts: 32, engagement: "6.2%", leadsGenerated: 18, revenue: "$14,200", bestTime: "8:00 AM" },
  { name: "X (Twitter)", icon: "𝕏", followers: "890", growth: "+1.4%", posts: 96, engagement: "2.1%", leadsGenerated: 4, revenue: "$2,100", bestTime: "6:00 PM" },
  { name: "Facebook", icon: "📘", followers: "3.1K", growth: "-0.3%", posts: 24, engagement: "1.9%", leadsGenerated: 6, revenue: "$3,800", bestTime: "10:00 AM" },
];

const scheduled = [
  { id: 1, platform: "📸", platformName: "Instagram", content: "New case study: How we helped Bloom Studio increase revenue by 340%...", time: "Today 2:00 PM", status: "scheduled", predictedEng: "4.2%", predictedReach: "890" },
  { id: 2, platform: "💼", platformName: "LinkedIn", content: "5 things every founder should know about lead recovery...", time: "Tomorrow 9:00 AM", status: "scheduled", predictedEng: "6.8%", predictedReach: "1.2K" },
  { id: 3, platform: "𝕏", platformName: "X", content: "Just shipped a new feature! Thread 🧵 on how we built an AI-powered winback system...", time: "Tomorrow 12:00 PM", status: "draft", predictedEng: "2.4%", predictedReach: "450" },
  { id: 4, platform: "📸", platformName: "Instagram", content: "Behind the scenes at our team retreat — culture is everything 🌿", time: "Apr 15 10:00 AM", status: "scheduled", predictedEng: "5.1%", predictedReach: "1.1K" },
];

const topPerforming = [
  { platform: "💼", content: "How we closed $24K from a single LinkedIn post...", reach: "4.2K", engagement: "8.4%", clicks: 189, leads: 6, revenue: "$7,200" },
  { platform: "📸", content: "Client success story: Bloom Studio case study carousel", reach: "3.1K", engagement: "6.2%", clicks: 134, leads: 4, revenue: "$4,800" },
  { platform: "𝕏", content: "Thread: 7 lead recovery tactics that actually work", reach: "2.8K", engagement: "3.8%", clicks: 96, leads: 3, revenue: "$2,400" },
];

const hashtags = [
  { tag: "#BusinessGrowth", reach: "12.4K", engagement: "4.2%", trend: "↑" },
  { tag: "#LeadGeneration", reach: "8.9K", engagement: "5.1%", trend: "↑" },
  { tag: "#StartupLife", reach: "6.2K", engagement: "3.8%", trend: "→" },
  { tag: "#CaseStudy", reach: "4.1K", engagement: "6.7%", trend: "↑↑" },
  { tag: "#B2BMarketing", reach: "3.5K", engagement: "4.5%", trend: "→" },
];

const comments = [
  { platform: "📸", user: "@sarah_designs", content: "Love this! How do I get started?", time: "2h ago", sentiment: "positive", replied: false },
  { platform: "💼", user: "Marcus Rivera", content: "Great insights on lead recovery. Can we chat?", time: "4h ago", sentiment: "positive", replied: false },
  { platform: "𝕏", user: "@tech_founder", content: "Interesting approach. What's the ROI?", time: "6h ago", sentiment: "neutral", replied: true },
  { platform: "📸", user: "@bloom_studio", content: "Thanks for featuring us! 🙏", time: "1d ago", sentiment: "positive", replied: true },
];

const competitors = [
  { name: "CompetitorA", platform: "LinkedIn", postsPerWeek: 5, avgEngagement: "3.2%", followers: "4.5K", trend: "Growing fast" },
  { name: "CompetitorB", platform: "Instagram", postsPerWeek: 7, avgEngagement: "2.8%", followers: "6.1K", trend: "Stable" },
  { name: "CompetitorC", platform: "X", postsPerWeek: 12, avgEngagement: "1.9%", followers: "2.2K", trend: "Declining" },
];

type Tab = "overview" | "calendar" | "comments" | "hashtags" | "competitors" | "attribution";

const SocialCommand = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("social", primaryMode);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; icon: typeof Share2 }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "calendar", label: "Calendar", icon: Calendar },
    { key: "comments", label: "Comments", icon: MessageCircle },
    { key: "hashtags", label: "Hashtags", icon: Hash },
    { key: "competitors", label: "Competitors", icon: Users },
    { key: "attribution", label: "Revenue", icon: DollarSign },
  ];

  const totalLeads = platforms.reduce((s, p) => s + p.leadsGenerated, 0);
  const totalRevenue = platforms.reduce((s, p) => s + parseInt(p.revenue.replace(/[^0-9]/g, "")), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DomainAdvisorCard domain="business" insights={[
        { id: "soc-1", text: "LinkedIn posts generate 3.4x more leads than Instagram — focus case study content there", confidence: 87, action: "Draft Post" },
        { id: "soc-2", text: "2 unreplied comments show purchase intent — respond to convert", confidence: 79, action: "Reply" },
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Social Command</h1>
          <p className="text-sm text-muted-foreground">Content-to-revenue pipeline with AI scheduling and cross-platform intelligence</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {/* ── Revenue Attribution KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Eye, label: "Total Reach (30d)", value: "12.4K", sub: "↑ 18% vs last month", color: "text-primary" },
          { icon: Heart, label: "Total Engagement", value: "2.1K", sub: "4.1% avg rate", color: "text-pink-500" },
          { icon: Target, label: "Leads from Social", value: String(totalLeads), sub: `${totalLeads} leads captured`, color: "text-blue-500" },
          { icon: DollarSign, label: "Revenue Attributed", value: `$${(totalRevenue / 1000).toFixed(1)}K`, sub: "From social posts", color: "text-emerald-500" },
          { icon: MessageCircle, label: "Unreplied Comments", value: String(comments.filter(c => !c.replied).length), sub: "Respond to convert", color: "text-amber-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
            <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── AI Content Advisor ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium">Content Revenue Advisor</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your LinkedIn posts generate <strong>3.4x more leads</strong> than Instagram. The "case study" format has the highest conversion at <strong>8.4% engagement → 3.2% click-through</strong>. I've drafted a new case study post for LinkedIn optimized for your best posting time (8:00 AM Tue).
            </p>
            <div className="flex gap-2 mt-3">
              <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">Review Draft</button>
              <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">Generate More Ideas</button>
              <button className="text-[10px] text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Dismiss</button>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full font-medium shrink-0">+$7.2K potential</span>
        </div>
      </motion.div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab: Platform Cards with Revenue ── */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map(p => (
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

          {/* Top Performing Posts */}
          <p className="text-sm font-semibold mt-4">Top Performing Content (Revenue Impact)</p>
          {topPerforming.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center gap-4">
                <span className="text-xl shrink-0">{post.platform}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.content}</p>
                </div>
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

      {/* ── Calendar Tab ── */}
      {activeTab === "calendar" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Scheduled Posts</p>
          {scheduled.map((post, i) => (
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
                <div className="flex-1" />
                <button className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-medium">Edit</button>
                {post.status === "draft" && <button className="text-[10px] bg-primary text-primary-foreground px-2.5 py-1 rounded-lg font-medium">Schedule</button>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Comments Tab ── */}
      {activeTab === "comments" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Comment Inbox</p>
          {comments.map((c, i) => (
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
                  <p className="text-[10px] text-primary flex items-center gap-1"><Zap className="h-3 w-3" /> <strong>Lead signal detected!</strong> This comment indicates purchase intent. Reply with your booking link.</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Hashtags Tab ── */}
      {activeTab === "hashtags" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Hashtag Performance</p>
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 p-3 text-[10px] font-semibold text-muted-foreground border-b border-border/20">
              <span>Hashtag</span><span>Reach</span><span>Engagement</span><span>Trend</span>
            </div>
            {hashtags.map(h => (
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

      {/* ── Competitors Tab ── */}
      {activeTab === "competitors" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Competitor Monitoring</p>
          {competitors.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border/40 bg-card/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{c.name}</p>
                <span className="text-[10px] text-muted-foreground">{c.platform}</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div><p className="text-xs font-semibold">{c.postsPerWeek}/wk</p><p className="text-[10px] text-muted-foreground">Posts</p></div>
                <div><p className="text-xs font-semibold">{c.avgEngagement}</p><p className="text-[10px] text-muted-foreground">Avg Engagement</p></div>
                <div><p className="text-xs font-semibold">{c.followers}</p><p className="text-[10px] text-muted-foreground">Followers</p></div>
                <div><p className={cn("text-xs font-semibold", c.trend === "Growing fast" ? "text-amber-500" : c.trend === "Declining" ? "text-emerald-500" : "text-muted-foreground")}>{c.trend}</p><p className="text-[10px] text-muted-foreground">Trend</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Revenue Attribution Tab ── */}
      {activeTab === "attribution" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Content → Revenue Pipeline</p>
          <div className="rounded-xl border border-border/40 bg-card/50 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span>Posts</span><ArrowUpRight className="h-3 w-3" /><span>Clicks</span><ArrowUpRight className="h-3 w-3" /><span>Leads</span><ArrowUpRight className="h-3 w-3" /><span>Deals</span><ArrowUpRight className="h-3 w-3" /><span>Revenue</span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span>200</span><span className="text-muted-foreground">→</span><span>419</span><span className="text-muted-foreground">→</span><span>40</span><span className="text-muted-foreground">→</span><span>8</span><span className="text-muted-foreground">→</span><span className="text-emerald-500">$28.5K</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
              <span>Total Posts</span><span /><span>2.1% CTR</span><span /><span>9.5% conv</span><span /><span>20% close</span><span /><span>$3,563/deal</span>
            </div>
          </div>

          {/* Per-platform revenue */}
          <p className="text-xs font-semibold mt-2">Revenue by Platform</p>
          {platforms.map(p => (
            <div key={p.name} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 p-3">
              <span className="text-lg">{p.icon}</span>
              <span className="text-xs font-medium flex-1">{p.name}</span>
              <span className="text-[10px] text-muted-foreground">{p.leadsGenerated} leads</span>
              <div className="w-20 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(parseInt(p.revenue.replace(/[^0-9]/g, "")) / 14200) * 100}%` }} /></div>
              <span className="text-xs font-bold text-emerald-500 w-16 text-right">{p.revenue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialCommand;
