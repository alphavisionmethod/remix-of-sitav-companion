import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { Wrench, Star, Phone, Clock, DollarSign, MapPin, Shield, Plus, Search } from "lucide-react";
import { useState } from "react";

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
}

const providers: Provider[] = [
  { id: "1", name: "Mike's Plumbing", category: "Plumbing", rating: 4.8, lastUsed: "2 weeks ago", phone: "(555) 234-5678", location: "Local — 3 mi", costRange: "$85–$150/hr", trusted: true, notes: "Ref #4421 — kitchen leak", upcomingService: "Follow-up scheduled Apr 8" },
  { id: "2", name: "GreenScape Lawn Care", category: "Landscaping", rating: 4.5, lastUsed: "1 week ago", phone: "(555) 345-6789", location: "Local — 5 mi", costRange: "$120/visit", trusted: true },
  { id: "3", name: "Elite Auto Service", category: "Automotive", rating: 4.7, lastUsed: "3 months ago", phone: "(555) 456-7890", location: "Local — 8 mi", costRange: "$90–$200/visit", trusted: true, notes: "Oil change overdue" },
  { id: "4", name: "Dr. Patel — Family Dentist", category: "Dental", rating: 4.9, lastUsed: "6 months ago", phone: "(555) 567-8901", location: "Downtown — 4 mi", costRange: "Insurance", trusted: true, upcomingService: "Kids checkup — next Thursday" },
  { id: "5", name: "CleanPro House Cleaning", category: "Cleaning", rating: 4.3, lastUsed: "1 month ago", phone: "(555) 678-9012", location: "Local — 6 mi", costRange: "$180/session", trusted: false, notes: "Missed last appointment" },
  { id: "6", name: "SafeGuard Security", category: "Home Security", rating: 4.6, lastUsed: "4 months ago", phone: "(555) 789-0123", location: "Regional", costRange: "$45/month", trusted: true },
  { id: "7", name: "TechFix IT Support", category: "IT / Tech", rating: 4.4, lastUsed: "2 months ago", phone: "(555) 890-1234", location: "Remote", costRange: "$75/hr", trusted: true },
];

const categories = [...new Set(providers.map((p) => p.category))];

const ServiceProviders = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = providers.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <SitaPageHeader title="Service Providers" subtitle="Your trusted network of professionals and vendors" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Providers" value={String(providers.length)} icon={Wrench} />
        <KPITile label="Trusted" value={String(providers.filter(p => p.trusted).length)} icon={Shield} />
        <KPITile label="Upcoming Services" value={String(providers.filter(p => p.upcomingService).length)} icon={Clock} />
        <KPITile label="Categories" value={String(categories.length)} icon={Star} />
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
          {categories.map((c) => (
            <button key={c} onClick={() => setSelectedCategory(c)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === c ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>{c}</button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Provider
        </button>
      </div>

      {/* Provider Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <SitaCard key={p.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                  {p.trusted && <Shield className="h-3.5 w-3.5 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{p.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-medium text-foreground">{p.rating}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{p.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{p.location}</div>
              <div className="flex items-center gap-2"><DollarSign className="h-3 w-3" />{p.costRange}</div>
              <div className="flex items-center gap-2"><Clock className="h-3 w-3" />Last used: {p.lastUsed}</div>
            </div>

            {p.notes && <p className="text-xs text-muted-foreground/70 mt-2 italic">{p.notes}</p>}
            {p.upcomingService && (
              <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2">
                <p className="text-xs text-primary font-medium">{p.upcomingService}</p>
              </div>
            )}
          </SitaCard>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState icon={Wrench} title="No providers found" description="Try a different search or add a new provider" />}
    </div>
  );
};

export default ServiceProviders;
