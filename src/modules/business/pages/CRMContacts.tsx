import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRMContacts, useCRMCompanies, useDeleteContact } from "@/modules/business/hooks/use-crm-data";
import { Users, Plus, Search, Grid3X3, List, ChevronRight, Phone, Mail, Heart, MoreHorizontal, Download, Trash2, Tag } from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { formatDistanceToNow, isPast } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CRMContactDetail } from "@/modules/business/components/business/crm/CRMContactDetail";
import { CRMContactForm } from "@/modules/business/components/business/crm/CRMContactForm";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const LIFECYCLE_COLORS: Record<string, string> = {
  new: "bg-sky-500/20 text-sky-400",
  lead: "bg-blue-500/20 text-blue-400",
  contacted: "bg-cyan-500/20 text-cyan-400",
  engaged: "bg-teal-500/20 text-teal-400",
  qualified: "bg-indigo-500/20 text-indigo-400",
  opportunity: "bg-purple-500/20 text-purple-400",
  active_opportunity: "bg-violet-500/20 text-violet-400",
  proposal_sent: "bg-fuchsia-500/20 text-fuchsia-400",
  negotiation: "bg-pink-500/20 text-pink-400",
  won: "bg-emerald-500/20 text-emerald-400",
  customer: "bg-green-500/20 text-green-400",
  dormant: "bg-zinc-500/20 text-zinc-400",
  at_risk: "bg-orange-500/20 text-orange-400",
  lost: "bg-red-500/20 text-red-400",
  churned: "bg-red-500/20 text-red-400",
  reactivation: "bg-amber-500/20 text-amber-400",
  support_sensitive: "bg-rose-500/20 text-rose-400",
  collections_sensitive: "bg-red-600/20 text-red-500",
};

const healthColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";

const CRMContacts = () => {
  const { data: contacts = [], isLoading } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const deleteContact = useDeleteContact();
  const { adaptations } = useBusinessProfile();
  const crmLang = adaptations.crm.language;
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = contacts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (stageFilter) list = list.filter(c => c.lifecycle_stage === stageFilter);
    return list;
  }, [contacts, search, stageFilter]);

  const stages = useMemo(() => {
    const s = new Set(contacts.map(c => c.lifecycle_stage));
    return Array.from(s);
  }, [contacts]);

  const activeContact = contacts.find(c => c.id === selectedContact);

  const handleDelete = async (id: string) => {
    try {
      await deleteContact.mutateAsync(id);
      toast.success("Contact deleted");
      if (selectedContact === id) setSelectedContact(null);
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="flex gap-0 h-full">
      {/* Main list */}
      <div className={`flex-1 space-y-4 transition-all ${activeContact ? "max-w-[55%]" : ""}`}>
        <PageTruthBanner truthState="demo" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{crmLang.contactLabel}</h2>
            <p className="text-xs text-muted-foreground">{filtered.length} {crmLang.contactLabel.toLowerCase()}{filtered.length !== 1 ? "" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search contacts..." className="pl-8 h-9 w-56 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex border border-border rounded-md">
              <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView("table")}>
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button variant={view === "card" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView("card")}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5" /> Add {crmLang.contactLabel.replace(/s$/, "")}
            </Button>
          </div>
        </div>

        {/* Stage filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          <Button variant={!stageFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setStageFilter(null)}>All</Button>
          {stages.map(s => (
            <Button key={s} variant={stageFilter === s ? "secondary" : "ghost"} size="sm" className="h-7 text-xs capitalize" onClick={() => setStageFilter(s === stageFilter ? null : s)}>{s}</Button>
          ))}
        </div>

        {view === "table" ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Name</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Email</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Stage</th>
                    <th className="text-center p-3 text-xs text-muted-foreground font-medium">Health</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Last Contact</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr
                      key={c.id}
                      className={`border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group ${selectedContact === c.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedContact(c.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {c.first_name?.[0]}{c.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{c.first_name} {c.last_name}</p>
                            {c.title && <p className="text-xs text-muted-foreground">{c.title}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{c.email || "—"}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LIFECYCLE_COLORS[c.lifecycle_stage] || "bg-muted text-muted-foreground"}`}>
                          {c.lifecycle_stage}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-sm font-semibold ${healthColor(c.health_score ?? 50)}`}>{c.health_score ?? 50}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                        {c.last_contacted_at ? formatDistanceToNow(new Date(c.last_contacted_at), { addSuffix: true }) : "Never"}
                      </td>
                      <td className="p-3" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedContact(c.id)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No contacts found</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setShowAdd(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add your first contact
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => (
              <Card
                key={c.id}
                className={`border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer group ${selectedContact === c.id ? "border-primary/50 bg-primary/5" : ""}`}
                onClick={() => setSelectedContact(c.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{c.first_name} {c.last_name}</p>
                      {c.title && <p className="text-xs text-muted-foreground truncate">{c.title}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LIFECYCLE_COLORS[c.lifecycle_stage] || "bg-muted text-muted-foreground"}`}>
                          {c.lifecycle_stage}
                        </span>
                        <span className={`text-xs font-semibold ${healthColor(c.health_score ?? 50)}`}>
                          <Heart className="h-3 w-3 inline mr-0.5" />{c.health_score ?? 50}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                        {c.email && <Mail className="h-3.5 w-3.5" />}
                        {c.phone && <Phone className="h-3.5 w-3.5" />}
                        {c.last_contacted_at && (
                          <span className="text-xs">{formatDistanceToNow(new Date(c.last_contacted_at), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No contacts found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {activeContact && (
        <div className="w-[45%] border-l border-border/50 bg-background overflow-hidden">
          <CRMContactDetail
            contact={activeContact}
            companies={companies}
            onClose={() => setSelectedContact(null)}
          />
        </div>
      )}

      {/* Contact Form */}
      <CRMContactForm
        open={showAdd}
        onOpenChange={setShowAdd}
        companies={companies}
      />
    </div>
  );
};

export default CRMContacts;
