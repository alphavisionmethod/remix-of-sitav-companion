// ═══════════════════════════════════════════════════════════════
// SITA OS — Category-Specific Store Pages
// Curated layouts with outcome-focused hero sections
// ═══════════════════════════════════════════════════════════════

import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { FeaturedPackCard, PackCard, resolveIcon } from "@/platform/sita/components/sita/PackStoreComponents";
import { PACK_CATALOG, type StoreCategory, type PackManifest } from "@/lib/pack-store";
import { ArrowRight, Crown, Home, DollarSign, Briefcase, Sparkles, Target, Zap, Shield, TrendingUp, BarChart3, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// ── Segment Configs ─────────────────────────────────────────────

interface SegmentConfig {
  title: string;
  subtitle: string;
  heroDescription: string;
  icon: React.ElementType;
  gradient: string;
  outcomes: { label: string; value: string }[];
  testimonial?: { quote: string; author: string; role: string };
  category: StoreCategory;
  relatedCategories: StoreCategory[];
}

const SEGMENT_CONFIGS: Record<string, SegmentConfig> = {
  founders: {
    title: "Built for Founders",
    subtitle: "Your operating system, not another tool",
    heroDescription: "Executive review rhythms, advisor synthesis, decision journals, revenue recovery, and strategic planning — all designed for operators who run everything and have no time for setup.",
    icon: Crown,
    gradient: "from-accent to-sita-gold-dark",
    outcomes: [
      { label: "Decision quality", value: "+40%" },
      { label: "Review time", value: "-60%" },
      { label: "Revenue recovered", value: "$2,400/mo" },
      { label: "Strategic clarity", value: "+80%" },
    ],
    testimonial: { quote: "SITA replaced my spreadsheet dashboard, my todo app, and my weekly review template — in one install.", author: "Sarah K.", role: "SaaS Founder" },
    category: "founders",
    relatedCategories: ["workflows", "advisors"],
  },
  families: {
    title: "Built for Families",
    subtitle: "Run your household like a calm operator",
    heroDescription: "Calendar intelligence, task delegation, provider management, school coordination, grocery planning, and family boardroom reviews — with the calm precision of a seasoned chief of staff.",
    icon: Home,
    gradient: "from-trust-safe to-emerald-300",
    outcomes: [
      { label: "Task completion", value: "+50%" },
      { label: "Missed appointments", value: "-80%" },
      { label: "Provider management", value: "-40% time" },
      { label: "Family coordination", value: "+70%" },
    ],
    testimonial: { quote: "Finally, one place where the family schedule, homework, groceries, and house maintenance all live together.", author: "Michael T.", role: "Father of 3" },
    category: "families",
    relatedCategories: ["workflows", "connectors"],
  },
  finance: {
    title: "Built for Capital Stewards",
    subtitle: "Disciplined wealth management, not speculation",
    heroDescription: "Portfolio regime detection, thesis management, investment committee boardroom, capital allocation intelligence, and multi-entity estate planning — all with proof-backed decision journals.",
    icon: BarChart3,
    gradient: "from-sita-purple-dark to-blue-500",
    outcomes: [
      { label: "Decision quality", value: "+60%" },
      { label: "Risk awareness", value: "+80%" },
      { label: "Tax efficiency", value: "+15%" },
      { label: "Thesis discipline", value: "+90%" },
    ],
    category: "finance",
    relatedCategories: ["advisors", "founders"],
  },
  "service-business": {
    title: "Built for Service Businesses",
    subtitle: "Purpose-built for appointment-based operators",
    heroDescription: "No-show recovery, rebooking automation, treatment upsell intelligence, collections ladders, and customer lifecycle management — built for med spas, salons, clinics, and professional services.",
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-400",
    outcomes: [
      { label: "No-show rate", value: "-45%" },
      { label: "Rebooking rate", value: "+35%" },
      { label: "Collection rate", value: "+35%" },
      { label: "Revenue per client", value: "+20%" },
    ],
    category: "service-business",
    relatedCategories: ["workflows", "founders"],
  },
  workflows: {
    title: "Workflow Packs",
    subtitle: "Automate the patterns you repeat every week",
    heroDescription: "Collections ladders, lead recovery, travel continuity, household ops, and more — each pack adds proven workflows with automatic triggers, escalation policies, and proof-backed execution.",
    icon: Zap,
    gradient: "from-primary to-sita-purple-light",
    outcomes: [
      { label: "Manual work", value: "-70%" },
      { label: "Follow-up speed", value: "+5x" },
      { label: "Completion rate", value: "+45%" },
      { label: "Recovery rate", value: "+35%" },
    ],
    category: "workflows",
    relatedCategories: ["founders", "service-business"],
  },
  advisors: {
    title: "Advisor Packs",
    subtitle: "Add specialized intelligence to your council",
    heroDescription: "Each advisor pack brings domain-specific reasoning, real-time monitoring, and proactive recommendations — making your advisory council smarter and more responsive.",
    icon: Shield,
    gradient: "from-emerald-500 to-teal-400",
    outcomes: [
      { label: "Advisor coverage", value: "+100%" },
      { label: "Recommendation quality", value: "+40%" },
      { label: "Response time", value: "-60%" },
      { label: "Blind spots", value: "-80%" },
    ],
    category: "advisors",
    relatedCategories: ["workflows", "founders"],
  },
};

const StoreCategoryPage = () => {
  const { segment } = useParams<{ segment: string }>();
  const navigate = useNavigate();
  const config = SEGMENT_CONFIGS[segment || ""];

  if (!config) {
    return (
      <div className="mx-auto max-w-4xl text-center py-20">
<p className="text-lg text-muted-foreground">Category not found</p>
        <button onClick={() => navigate("/store")} className="mt-4 text-primary underline text-sm">Back to Store</button>
      </div>
    );
  }

  const Icon = config.icon;
  const packs = PACK_CATALOG.filter(p => p.category === config.category);
  const relatedPacks = PACK_CATALOG.filter(p => config.relatedCategories.includes(p.category)).slice(0, 4);
  const featured = packs.filter(p => p.featured);
  const rest = packs.filter(p => !p.featured);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br ${config.gradient} p-8`}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{config.title}</h1>
              <p className="text-white/70 text-sm">{config.subtitle}</p>
            </div>
          </div>
          <p className="text-white/85 text-sm leading-relaxed max-w-2xl mb-6">{config.heroDescription}</p>

          {/* Outcome metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {config.outcomes.map((o, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2.5 text-center"
              >
                <p className="font-display text-lg font-bold text-foreground">{o.value}</p>
                <p className="text-[10px] text-white/60">{o.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/50">{packs.length} packs available</span>
            <span className="text-white/30">·</span>
            <span className="text-[11px] text-white/50">{featured.length} featured</span>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      </motion.div>

      {/* Testimonial */}
      {config.testimonial && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-accent/15 bg-accent/5 p-5"
        >
          <p className="text-sm text-foreground italic leading-relaxed">"{config.testimonial.quote}"</p>
          <p className="text-xs text-muted-foreground mt-2">— {config.testimonial.author}, {config.testimonial.role}</p>
        </motion.div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Featured" subtitle="Top picks for this category" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(pack => (
              <FeaturedPackCard key={pack.pack_id} pack={pack} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* All Packs */}
      {rest.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="All Packs" subtitle={`${rest.length} more in this category`} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(pack => (
              <PackCard key={pack.pack_id} pack={pack} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {relatedPacks.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="You Might Also Like" subtitle="From related categories" />
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedPacks.map(pack => (
              <PackCard key={pack.pack_id} pack={pack} onClick={() => navigate(`/store/packs/${pack.pack_id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Back */}
      <button onClick={() => navigate("/store")} className="text-xs text-primary hover:underline flex items-center gap-1">
        ← Back to Pack Store
      </button>
    </div>
  );
};

export default StoreCategoryPage;
