import { KPITile, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { DomainHeader } from "@/components/sita/primitives";
import { ConciergeAdvisorInsightCard, ServiceFollowUpCard, VendorDetailPanel, ConciergePageWrapper, ConciergeEmptyState } from "@/components/concierge";
import type { ServiceFollowUp, VendorDetail } from "@/components/concierge";
import { Wrench, Star, Phone, Clock, DollarSign, MapPin, Shield, Plus, Search, Calendar, FileText, History, CheckCircle, AlertTriangle, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInspector } from "@/contexts/InspectorContext";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useServiceProvidersList } from "@/hooks/use-concierge-data";

// Production fallback — seed data removed
const categories: any[] = [];

interface ServiceRecord {
  date: string;
  description: string;
  cost: string;
  rating?: number;
  proofId?: string;
}

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  lastUsed: string;
  phone: string;
  location: string;
  costRange: string;
  trusted: boolean;
  notes?: string;
  upcomingService?: string;
  responseTime?: string;
  totalSpent?: string;
  serviceCount?: number;
  history: ServiceRecord[];
}

const providers: Provider[] = [
  {
    id: "1", name: "Mike's Plumbing", category: "Plumbing", rating: 4.8, lastUsed: "2 weeks ago",
    phone: "(555) 234-5678", location: "Local — 3 mi", costRange: "$85–$150/hr", trusted: true,
    notes: "Ref #4421 — kitchen leak", upcomingService: "Follow-up scheduled Apr 8",
    responseTime: "Same day", totalSpent: "$1,240", serviceCount: 4,
    history: [
      { date: "Mar 18, 2024", description: "Kitchen leak repair — pipe replacement", cost: "$320", rating: 5, proofId: "prf-101" },
      { date: "Jan 5, 2024", description: "Bathroom faucet installation", cost: "$180", rating: 5 },
      { date: "Oct 12, 2023", description: "Water heater inspection", cost: "$85", rating: 4 },
      { date: "Jun 22, 2023", description: "Emergency drain unclog", cost: "$655", rating: 5, proofId: "prf-042" },
    ],
  },
  {
    id: "2", name: "GreenScape Lawn Care", category: "Landscaping", rating: 4.5, lastUsed: "1 week ago",
    phone: "(555) 345-6789", location: "Local — 5 mi", costRange: "$120/visit", trusted: true,
    responseTime: "1-2 days", totalSpent: "$2,880", serviceCount: 24,
    history: [
      { date: "Mar 25, 2024", description: "Weekly lawn maintenance", cost: "$120", rating: 5 },
      { date: "Mar 18, 2024", description: "Spring aeration + overseeding", cost: "$280", rating: 4 },
    ],
  },
  {
    id: "3", name: "Elite Auto Service", category: "Automotive", rating: 4.7, lastUsed: "3 months ago",
    phone: "(555) 456-7890", location: "Local — 8 mi", costRange: "$90–$200/visit", trusted: true,
    notes: "Oil change overdue", responseTime: "Appointment", totalSpent: "$1,850", serviceCount: 6,
    history: [
      { date: "Dec 15, 2023", description: "Oil change + tire rotation", cost: "$95", rating: 5 },
      { date: "Sep 8, 2023", description: "Brake pad replacement — front", cost: "$420", rating: 5, proofId: "prf-078" },
    ],
  },
  {
    id: "4", name: "Dr. Patel — Family Dentist", category: "Dental", rating: 4.9, lastUsed: "6 months ago",
    phone: "(555) 567-8901", location: "Downtown — 4 mi", costRange: "Insurance", trusted: true,
    upcomingService: "Kids checkup — next Thursday", responseTime: "24h", totalSpent: "$480", serviceCount: 8,
    history: [
      { date: "Sep 20, 2023", description: "Annual cleaning — You", cost: "$120 (copay)", rating: 5 },
      { date: "Sep 20, 2023", description: "Annual cleaning — Partner", cost: "$120 (copay)", rating: 5 },
    ],
  },
  {
    id: "5", name: "CleanPro House Cleaning", category: "Cleaning", rating: 4.3, lastUsed: "1 month ago",
    phone: "(555) 678-9012", location: "Local — 6 mi", costRange: "$180/session", trusted: false,
    notes: "Missed last appointment — reliability concern", responseTime: "2-3 days", totalSpent: "$1,440", serviceCount: 8,
    history: [
      { date: "Feb 28, 2024", description: "Deep clean — full house", cost: "$240", rating: 3 },
      { date: "Feb 1, 2024", description: "Scheduled cleaning — NO SHOW", cost: "$0", rating: 1 },
    ],
  },
  {
    id: "6", name: "SafeGuard Security", category: "Home Security", rating: 4.6, lastUsed: "4 months ago",
    phone: "(555) 789-0123", location: "Regional", costRange: "$45/month", trusted: true,
    responseTime: "Emergency: <15min", totalSpent: "$540", serviceCount: 12,
    history: [
      { date: "Nov 10, 2023", description: "Annual system check + battery replacement", cost: "$0 (covered)", rating: 5 },
    ],
  },
  {
    id: "7", name: "TechFix IT Support", category: "IT / Tech", rating: 4.4, lastUsed: "2 months ago",
    phone: "(555) 890-1234", location: "Remote", costRange: "$75/hr", trusted: true,
    responseTime: "Same day remote", totalSpent: "$375", serviceCount: 5,
    history: [
      { date: "Jan 28, 2024", description: "Router setup + WiFi optimization", cost: "$150", rating: 4 },
      { date: "Dec 5, 2023", description: "Laptop data migration", cost: "$225", rating: 5 },
    ],
  },
];

const ServiceProviders = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { inspect } = useInspector();

  const filtered = providers.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = providers.reduce((s, p) => s + (parseFloat(p.totalSpent?.replace(/[^0-9.]/g, "") || "0")), 0);
  const trustedCount = providers.filter(p => p.trusted).length;
  const upcomingCount = providers.filter(p => p.upcomingService).length;

  const inspectProvider = (p: Provider) => {
    inspect({
      id: p.id,
      type: "generic",
      title: p.name,
      subtitle: p.category,
      domain: "concierge",
      status: p.trusted ? "Trusted" : "Under review",
      trustLevel: p.trusted ? "verified" : "review",
      details: {
        phone: p.phone,
        location: p.location,
        cost_range: p.costRange,
        rating: p.rating,
        total_spent: p.totalSpent || "N/A",
        service_count: p.serviceCount || 0,
        response_time: p.responseTime || "Unknown",
      },
      timeline: p.history.map(h => ({
        action: h.description,
        actor: p.name,
        timestamp: h.date,
        detail: h.cost,
      })),
      proofChain: p.history.filter(h => h.proofId).map(h => ({
        id: h.proofId!,
        action: h.description,
        result: "confirmed" as const,
        timestamp: h.date,
      })),
    });
  };

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />
      <DomainHeader title="Service Providers" subtitle="Your trusted network — with full service history, spend tracking, and reliability scores" domain="concierge" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Providers" value={String(providers.length)} icon={Wrench} />
        <KPITile label="Trusted" value={String(trustedCount)} icon={Shield} sub={`${Math.round((trustedCount / providers.length) * 100)}% verified`} />
        <KPITile label="Upcoming" value={String(upcomingCount)} icon={Calendar} sub="Scheduled services" />
        <KPITile label="Total Spent" value={`$${(totalSpent / 1000).toFixed(1)}K`} icon={DollarSign} sub="All time" />
        <KPITile label="Categories" value={String(([] as typeof categories).length)} icon={Star} />
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/50 bg-secondary/20 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setSelectedCategory(null)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!selectedCategory ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>All</button>
          {([] as typeof categories).map((c) => (
            <button key={c} onClick={() => setSelectedCategory(c)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === c ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>{c}</button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Provider
        </button>
      </div>

      {/* Provider Cards */}
      {filtered.length === 0 ? (
        <ConciergeEmptyState domain="services" icon={Wrench} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const expanded = expandedId === p.id;
          return (
            <motion.div key={p.id} layout>
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5 micro-hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                      {p.trusted && <Shield className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{p.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))] fill-[hsl(var(--sita-gold))]" />
                    <span className="text-xs font-medium text-foreground">{p.rating}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{p.phone}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{p.location}</div>
                  <div className="flex items-center gap-2"><DollarSign className="h-3 w-3" />{p.costRange}</div>
                  <div className="flex items-center gap-2"><Clock className="h-3 w-3" />Last: {p.lastUsed}</div>
                  {p.responseTime && (
                    <div className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-trust-safe" />Response: {p.responseTime}</div>
                  )}
                </div>

                {/* Spend summary */}
                {p.totalSpent && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                    <span className="text-[10px] text-muted-foreground">Total spent</span>
                    <span className="text-xs font-semibold text-foreground">{p.totalSpent}</span>
                  </div>
                )}

                {p.notes && (
                  <p className="text-xs text-muted-foreground/70 mt-2 italic flex items-start gap-1.5">
                    {!p.trusted && <AlertTriangle className="h-3 w-3 text-[hsl(var(--sita-gold))] shrink-0 mt-0.5" />}
                    {p.notes}
                  </p>
                )}

                {p.upcomingService && (
                  <div className="mt-3 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                    <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> {p.upcomingService}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expanded ? null : p.id)}
                    className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                  >
                    <History className="h-3 w-3" /> {expanded ? "Hide" : "History"} ({p.serviceCount})
                  </button>
                  <button
                    onClick={() => inspectProvider(p)}
                    className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" /> Detail
                  </button>
                </div>

                {/* Service History */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Service History</p>
                        {p.history.map((h, i) => (
                          <div key={i} className="flex items-start gap-2.5 rounded-lg bg-secondary/20 px-3 py-2">
                            <div className="flex flex-col items-center">
                              <div className="h-2 w-2 rounded-full bg-primary/40 mt-1" />
                              {i < p.history.length - 1 && <div className="flex-1 w-px bg-border/30 min-h-[16px]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{h.description}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{h.date}</span>
                                <span className="text-[10px] font-medium text-foreground">{h.cost}</span>
                                {h.rating && (
                                  <span className="flex items-center gap-0.5">
                                    <Star className="h-2.5 w-2.5 text-[hsl(var(--sita-gold))] fill-[hsl(var(--sita-gold))]" />
                                    <span className="text-[10px] text-muted-foreground">{h.rating}</span>
                                  </span>
                                )}
                                {h.proofId && <Shield className="h-2.5 w-2.5 text-trust-safe" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}


      {/* Service Follow-ups */}
      <ServiceFollowUpCard items={[
        { id: "sf1", vendorName: "Mike's Plumbing", reason: "Kitchen leak estimate pending", daysWaiting: 4, urgency: "high", linkedTasks: ["Get repair quote", "Schedule follow-up"] },
        { id: "sf2", vendorName: "CleanPro", reason: "Missed appointment — reschedule or replace", daysWaiting: 14, urgency: "medium", linkedTasks: ["Find alternative cleaner"] },
        { id: "sf3", vendorName: "Elite Auto", reason: "Oil change overdue", daysWaiting: 7, urgency: "medium", linkedTasks: ["Schedule oil change"] },
      ]} />

      {/* Provider Advisor */}
      <ConciergeAdvisorInsightCard insight={{
        role: "Provider Advisor",
        message: `You have ${trustedCount} trusted providers across ${([] as typeof categories).length} categories. CleanPro has a reliability concern — consider finding an alternative. Elite Auto has an overdue oil change — recommend scheduling this week. Total service spend: $${(totalSpent / 1000).toFixed(1)}K all-time.`,
        linkedItems: ["CleanPro reliability issue", "Oil change overdue — Elite Auto", "Dr. Patel checkup Thursday"],
        confidence: "high",
      }} />
    </ConciergePageWrapper>
  );
};

export default ServiceProviders;
