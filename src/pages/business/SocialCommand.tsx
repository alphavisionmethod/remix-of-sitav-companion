import { AppWelcomeHeader } from "@/components/sita/AppWelcomeHeader";
import { InAppAdvisorStrip } from "@/components/sita/InAppAdvisorStrip";
import { motion } from "framer-motion";
import { Share2, TrendingUp, Calendar, MessageCircle, Heart, Eye, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
  { name: "Instagram", icon: "📸", followers: "2.4K", growth: "+3.2%", posts: 48, engagement: "4.8%" },
  { name: "LinkedIn", icon: "💼", followers: "1.8K", growth: "+5.1%", posts: 32, engagement: "6.2%" },
  { name: "X (Twitter)", icon: "𝕏", followers: "890", growth: "+1.4%", posts: 96, engagement: "2.1%" },
  { name: "Facebook", icon: "📘", followers: "3.1K", growth: "-0.3%", posts: 24, engagement: "1.9%" },
];

const scheduled = [
  { id: 1, platform: "📸", content: "New case study: How we helped Bloom Studio...", time: "Today 2:00 PM", status: "scheduled" },
  { id: 2, platform: "💼", content: "5 things every founder should know about...", time: "Tomorrow 9:00 AM", status: "scheduled" },
  { id: 3, platform: "𝕏", content: "Just shipped a new feature! Thread 🧵", time: "Tomorrow 12:00 PM", status: "draft" },
  { id: 4, platform: "📸", content: "Behind the scenes at our team retreat...", time: "Apr 15 10:00 AM", status: "scheduled" },
];

const SocialCommand = () => (
  <div className="mx-auto max-w-5xl space-y-6">
    <AppWelcomeHeader domain="business" />
    <InAppAdvisorStrip domain="business" />

    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">Social Command</h1>
        <p className="text-sm text-muted-foreground">Schedule posts, track engagement, grow your audience across platforms</p>
      </div>
      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> New Post
      </button>
    </div>

    {/* Platform Overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {platforms.map(p => (
        <div key={p.name} className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{p.icon}</span>
            <span className="text-xs font-medium">{p.name}</span>
          </div>
          <p className="text-lg font-bold">{p.followers}</p>
          <div className="flex items-center justify-between mt-1">
            <span className={cn("text-[10px] font-medium", p.growth.startsWith("+") ? "text-emerald-500" : "text-destructive")}>
              {p.growth}
            </span>
            <span className="text-[10px] text-muted-foreground">{p.engagement} eng.</span>
          </div>
        </div>
      ))}
    </div>

    {/* Scheduled Posts */}
    <div className="space-y-2">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <Calendar className="h-4 w-4" /> Scheduled Posts
      </h2>
      {scheduled.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 p-4 hover:border-primary/30 transition-colors"
        >
          <span className="text-xl shrink-0">{post.platform}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{post.content}</p>
            <p className="text-[11px] text-muted-foreground">{post.time}</p>
          </div>
          <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0",
            post.status === "scheduled" ? "bg-blue-500/15 text-blue-500" : "bg-muted text-muted-foreground"
          )}>
            {post.status}
          </span>
        </motion.div>
      ))}
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Eye, label: "Total Reach (30d)", value: "12.4K" },
        { icon: Heart, label: "Total Engagement", value: "2.1K" },
        { icon: MessageCircle, label: "Comments to Reply", value: "7" },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4 text-center">
          <s.icon className="h-4 w-4 mx-auto mb-1 text-primary/60" />
          <p className="text-lg font-bold">{s.value}</p>
          <p className="text-[10px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);

export default SocialCommand;
