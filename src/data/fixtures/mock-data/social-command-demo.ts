// ═══════════════════════════════════════════════════════════════
// SITA OS — Social Command Demo Fixture
//
// Demo-only data for `SocialCommand.tsx`. Consumed exclusively when
// `useRealityModeSafe().isDemo === true`. In live mode the page
// renders an honest setup-required state because no social
// platform OAuth (Twitter/LinkedIn/Instagram/Facebook) is wired.
// See `_demo-source-marker.ts`.
// ═══════════════════════════════════════════════════════════════

export interface SocialPlatformFixture {
  name: string;
  icon: string;
  followers: string;
  growth: string;
  posts: number;
  engagement: string;
  leadsGenerated: number;
  revenue: string;
  bestTime: string;
}

export const SOCIAL_PLATFORMS: ReadonlyArray<SocialPlatformFixture> = [
  { name: "Instagram",   icon: "📸", followers: "2.4K", growth: "+3.2%", posts: 48, engagement: "4.8%", leadsGenerated: 12, revenue: "$8,400",  bestTime: "12:00 PM" },
  { name: "LinkedIn",    icon: "💼", followers: "1.8K", growth: "+5.1%", posts: 32, engagement: "6.2%", leadsGenerated: 18, revenue: "$14,200", bestTime: "8:00 AM"  },
  { name: "X (Twitter)", icon: "𝕏",  followers: "890",  growth: "+1.4%", posts: 96, engagement: "2.1%", leadsGenerated:  4, revenue: "$2,100",  bestTime: "6:00 PM"  },
  { name: "Facebook",    icon: "📘", followers: "3.1K", growth: "-0.3%", posts: 24, engagement: "1.9%", leadsGenerated:  6, revenue: "$3,800",  bestTime: "10:00 AM" },
] as const;

export interface SocialScheduledPostFixture {
  id: number;
  platform: string;
  platformName: string;
  content: string;
  time: string;
  status: "scheduled" | "draft";
  predictedEng: string;
  predictedReach: string;
}

export const SOCIAL_SCHEDULED_POSTS: ReadonlyArray<SocialScheduledPostFixture> = [
  { id: 1, platform: "📸", platformName: "Instagram", content: "New case study: How we helped Bloom Studio increase revenue by 340%...",                 time: "Today 2:00 PM",     status: "scheduled", predictedEng: "4.2%", predictedReach: "890" },
  { id: 2, platform: "💼", platformName: "LinkedIn",  content: "5 things every founder should know about lead recovery...",                              time: "Tomorrow 9:00 AM",  status: "scheduled", predictedEng: "6.8%", predictedReach: "1.2K" },
  { id: 3, platform: "𝕏",  platformName: "X",         content: "Just shipped a new feature! Thread 🧵 on how we built an AI-powered winback system...", time: "Tomorrow 12:00 PM", status: "draft",     predictedEng: "2.4%", predictedReach: "450" },
  { id: 4, platform: "📸", platformName: "Instagram", content: "Behind the scenes at our team retreat — culture is everything 🌿",                       time: "Apr 15 10:00 AM",   status: "scheduled", predictedEng: "5.1%", predictedReach: "1.1K" },
] as const;

export interface SocialTopPerformingFixture {
  platform: string;
  content: string;
  reach: string;
  engagement: string;
  clicks: number;
  leads: number;
  revenue: string;
}

export const SOCIAL_TOP_PERFORMING: ReadonlyArray<SocialTopPerformingFixture> = [
  { platform: "💼", content: "How we closed $24K from a single LinkedIn post...",         reach: "4.2K", engagement: "8.4%", clicks: 189, leads: 6, revenue: "$7,200" },
  { platform: "📸", content: "Client success story: Bloom Studio case study carousel",    reach: "3.1K", engagement: "6.2%", clicks: 134, leads: 4, revenue: "$4,800" },
  { platform: "𝕏",  content: "Thread: 7 lead recovery tactics that actually work",        reach: "2.8K", engagement: "3.8%", clicks:  96, leads: 3, revenue: "$2,400" },
] as const;

export interface SocialHashtagFixture {
  tag: string;
  reach: string;
  engagement: string;
  trend: string;
}

export const SOCIAL_HASHTAGS: ReadonlyArray<SocialHashtagFixture> = [
  { tag: "#BusinessGrowth",  reach: "12.4K", engagement: "4.2%", trend: "↑"  },
  { tag: "#LeadGeneration",  reach: "8.9K",  engagement: "5.1%", trend: "↑"  },
  { tag: "#StartupLife",     reach: "6.2K",  engagement: "3.8%", trend: "→"  },
  { tag: "#CaseStudy",       reach: "4.1K",  engagement: "6.7%", trend: "↑↑" },
  { tag: "#B2BMarketing",    reach: "3.5K",  engagement: "4.5%", trend: "→"  },
] as const;

export interface SocialCommentFixture {
  platform: string;
  user: string;
  content: string;
  time: string;
  sentiment: "positive" | "neutral" | "negative";
  replied: boolean;
}

export const SOCIAL_COMMENTS: ReadonlyArray<SocialCommentFixture> = [
  { platform: "📸", user: "@sarah_designs", content: "Love this! How do I get started?",        time: "2h ago", sentiment: "positive", replied: false },
  { platform: "💼", user: "Marcus Rivera",  content: "Great insights on lead recovery. Can we chat?", time: "4h ago", sentiment: "positive", replied: false },
  { platform: "𝕏",  user: "@tech_founder",  content: "Interesting approach. What's the ROI?",   time: "6h ago", sentiment: "neutral",  replied: true  },
  { platform: "📸", user: "@bloom_studio",  content: "Thanks for featuring us! 🙏",             time: "1d ago", sentiment: "positive", replied: true  },
] as const;

export interface SocialCompetitorFixture {
  name: string;
  platform: string;
  postsPerWeek: number;
  avgEngagement: string;
  followers: string;
  trend: string;
}

export const SOCIAL_COMPETITORS: ReadonlyArray<SocialCompetitorFixture> = [
  { name: "CompetitorA", platform: "LinkedIn",  postsPerWeek:  5, avgEngagement: "3.2%", followers: "4.5K", trend: "Growing fast" },
  { name: "CompetitorB", platform: "Instagram", postsPerWeek:  7, avgEngagement: "2.8%", followers: "6.1K", trend: "Stable"       },
  { name: "CompetitorC", platform: "X",         postsPerWeek: 12, avgEngagement: "1.9%", followers: "2.2K", trend: "Declining"    },
] as const;