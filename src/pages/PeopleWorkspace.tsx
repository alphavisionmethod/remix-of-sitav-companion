import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Users, Search, Plus, Mail, Phone, Building2, Star, ChevronRight, Clock, MessageSquare, FileText, DollarSign, UserCircle, Heart, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";


const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

type PersonRole = "client" | "lead" | "vendor" | "team" | "household" | "personal";
const ROLE_STYLES: Record<PersonRole, string> = {
  client: "bg-primary/15 text-primary border-primary/30",
  lead: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  vendor: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  team: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  household: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  personal: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

const PeopleWorkspace = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ["people_customers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("customers").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["people_leads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("leads").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: householdMembers = [] } = useQuery({
    queryKey: ["people_household", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await fromTable("household_members").select("*");
      return data || [];
    },
    enabled: !!user,
  });

  const allPeople = useMemo(() => {
    const people: Array<{ id: string; name: string; email?: string; phone?: string; company?: string; role: PersonRole; status: string; lastContact?: string; value?: number; healthScore?: number }> = [];
    customers.forEach((c: Record<string, any>) => people.push({ id: c.id, name: c.name, email: c.email, phone: c.phone, company: c.company, role: "client", status: c.status, lastContact: c.last_contact_at, value: c.lifetime_revenue, healthScore: c.health_score }));
    leads.forEach((l: Record<string, any>) => people.push({ id: l.id, name: l.name, email: l.email, phone: l.phone, company: l.company, role: "lead", status: l.status, lastContact: l.last_contact_at, value: l.likely_value }));
    householdMembers.forEach((h: Record<string, any>) => people.push({ id: h.id, name: h.display_name, role: "household", status: h.role }));
    return people;
  }, [customers, leads, householdMembers]);

  // Demo data if empty
  const displayPeople = allPeople.length > 0 ? allPeople : [
    { id: "d1", name: "Marcus Chen", email: "marcus@acme.com", company: "Acme Corp", role: "client" as PersonRole, status: "active", lastContact: new Date(Date.now() - 86400000).toISOString(), value: 45000, healthScore: 85 },
    { id: "d2", name: "Sarah Park", email: "sarah@nova.io", company: "Nova IO", role: "lead" as PersonRole, status: "qualified", lastContact: new Date(Date.now() - 172800000).toISOString(), value: 12000 },
    { id: "d3", name: "David Liu", email: "david@example.com", role: "personal" as PersonRole, status: "active" },
    { id: "d4", name: "Elena Torres", email: "elena@buildright.com", company: "BuildRight", role: "vendor" as PersonRole, status: "active" },
    { id: "d5", name: "James Wright", role: "household" as PersonRole, status: "member" },
    { id: "d6", name: "Amy Nguyen", email: "amy@startup.co", company: "StartUp Co", role: "lead" as PersonRole, status: "new", value: 8000 },
  ];

  const filtered = useMemo(() => {
    let result = displayPeople;
    if (roleFilter !== "all") result = result.filter(p => p.role === roleFilter);
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()) || p.company?.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [displayPeople, roleFilter, search]);

  const selected = selectedId ? filtered.find(p => p.id === selectedId) : null;
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    displayPeople.forEach(p => { counts[p.role] = (counts[p.role] || 0) + 1; });
    return counts;
  }, [displayPeople]);

  return (
    <div className="min-h-screen pb-12">
<SitaPageHeader title="People" subtitle="Relationships across business, household, and personal life" actions={
        <Button size="sm" variant="outline" className="gap-1.5 border-border/50"><Plus className="w-3.5 h-3.5" /> Add Person</Button>
      } />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KPITile label="Total People" value={displayPeople.length.toString()} icon={Users} />
        <KPITile label="Clients" value={(roleCounts.client || 0).toString()} icon={Building2} />
        <KPITile label="Leads" value={(roleCounts.lead || 0).toString()} icon={Star} />
        <KPITile label="Household" value={(roleCounts.household || 0).toString()} icon={Heart} />
        <KPITile label="Vendors" value={(roleCounts.vendor || 0).toString()} icon={Shield} />
      </div>

      <div className="flex gap-4">
        {/* People list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search people..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs bg-card/30" />
            </div>
            <div className="flex gap-1">
              {[{ k: "all", l: "All" }, { k: "client", l: "Clients" }, { k: "lead", l: "Leads" }, { k: "household", l: "Household" }, { k: "vendor", l: "Vendors" }, { k: "personal", l: "Personal" }].map(r => (
                <button key={r.k} onClick={() => setRoleFilter(r.k)} className={cn("px-2 py-1 text-xs rounded-md transition-colors", roleFilter === r.k ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{r.l}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {filtered.map(person => (
              <motion.button key={person.id} variants={fadeUp} initial="hidden" animate="show" onClick={() => setSelectedId(person.id)}
                className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all", selectedId === person.id ? "bg-primary/10 border-primary/30" : "bg-card/20 border-border/20 hover:bg-accent/20")}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-semibold shrink-0">
                  {person.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{person.name}</span>
                    <Badge className={cn("text-[9px] px-1.5 py-0 border", ROLE_STYLES[person.role])}>{person.role}</Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {person.company && <span>{person.company} · </span>}
                    {person.email || person.status}
                  </div>
                </div>
                {person.value && person.value > 0 && (
                  <span className="text-xs text-emerald-400 font-medium">${(person.value / 1000).toFixed(0)}k</span>
                )}
                {person.healthScore && (
                  <div className={cn("text-xs font-medium", person.healthScore >= 70 ? "text-emerald-400" : person.healthScore >= 40 ? "text-amber-400" : "text-red-400")}>
                    {person.healthScore}%
                  </div>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-80 shrink-0 hidden lg:block">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <SitaCard className="p-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-2xl font-bold mx-auto mb-2">{selected.name.charAt(0)}</div>
                    <h3 className="text-base font-semibold">{selected.name}</h3>
                    {selected.company && <p className="text-xs text-muted-foreground">{selected.company}</p>}
                    <Badge className={cn("text-[10px] mt-1.5 border", ROLE_STYLES[selected.role])}>{selected.role}</Badge>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    {selected.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3 h-3" />{selected.email}</div>}
                    {selected.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3 h-3" />{selected.phone}</div>}
                    {selected.lastContact && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3 h-3" />Last contact: {format(new Date(selected.lastContact), "MMM d, yyyy")}</div>}
                  </div>
                  {selected.value && selected.value > 0 && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 mb-4">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-sm font-semibold text-emerald-400">${selected.value.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">{selected.role === "lead" ? "Estimated value" : "Lifetime revenue"}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><MessageSquare className="w-3 h-3" /> Message</Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><FileText className="w-3 h-3" /> Notes</Button>
                  </div>
                </SitaCard>
              </motion.div>
            ) : (
              <SitaCard className="p-5">
                <div className="text-center text-muted-foreground">
                  <UserCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Select a person to see details</p>
                </div>
              </SitaCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PeopleWorkspace;
