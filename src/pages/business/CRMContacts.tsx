import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRMContacts, useCreateContact } from "@/hooks/use-crm-data";
import { Users, Plus, Search, Grid3X3, List, Filter, ChevronRight, Phone, Mail, Building2, Heart, Star, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const LIFECYCLE_COLORS: Record<string, string> = {
  lead: "bg-blue-500/20 text-blue-400",
  qualified: "bg-indigo-500/20 text-indigo-400",
  opportunity: "bg-purple-500/20 text-purple-400",
  customer: "bg-green-500/20 text-green-400",
  churned: "bg-red-500/20 text-red-400",
};

const healthColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";

const CRMContacts = () => {
  const { data: contacts = [], isLoading } = useCRMContacts();
  const createContact = useCreateContact();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: "", last_name: "", email: "", phone: "", title: "", lifecycle_stage: "lead", source: "" });

  const filtered = useMemo(() => {
    let list = contacts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q)
      );
    }
    if (stageFilter) list = list.filter(c => c.lifecycle_stage === stageFilter);
    return list;
  }, [contacts, search, stageFilter]);

  const stages = useMemo(() => {
    const s = new Set(contacts.map(c => c.lifecycle_stage));
    return Array.from(s);
  }, [contacts]);

  const handleAdd = async () => {
    if (!newContact.first_name.trim()) { toast.error("First name is required"); return; }
    try {
      await createContact.mutateAsync(newContact as any);
      toast.success("Contact created");
      setShowAdd(false);
      setNewContact({ first_name: "", last_name: "", email: "", phone: "", title: "", lifecycle_stage: "lead", source: "" });
    } catch {
      toast.error("Failed to create contact");
    }
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contacts</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} contact{filtered.length !== 1 ? "s" : ""}</p>
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
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Contact</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="First name *" value={newContact.first_name} onChange={e => setNewContact(p => ({ ...p, first_name: e.target.value }))} />
                  <Input placeholder="Last name" value={newContact.last_name} onChange={e => setNewContact(p => ({ ...p, last_name: e.target.value }))} />
                </div>
                <Input placeholder="Email" type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} />
                <Input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} />
                <Input placeholder="Title / Role" value={newContact.title} onChange={e => setNewContact(p => ({ ...p, title: e.target.value }))} />
                <Input placeholder="Source (e.g. Referral, Website)" value={newContact.source} onChange={e => setNewContact(p => ({ ...p, source: e.target.value }))} />
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={newContact.lifecycle_stage} onChange={e => setNewContact(p => ({ ...p, lifecycle_stage: e.target.value }))}>
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="customer">Customer</option>
                </select>
                <Button className="w-full" onClick={handleAdd} disabled={createContact.isPending}>
                  {createContact.isPending ? "Creating..." : "Create Contact"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stage filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        <Button variant={!stageFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setStageFilter(null)}>All</Button>
        {stages.map(s => (
          <Button key={s} variant={stageFilter === s ? "secondary" : "ghost"} size="sm" className="h-7 text-xs capitalize" onClick={() => setStageFilter(s === stageFilter ? null : s)}>{s}</Button>
        ))}
      </div>

      {/* Table View */}
      {view === "table" ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Email</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Company</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Stage</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Health</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Last Contact</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group">
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
                    <td className="p-3 text-muted-foreground hidden lg:table-cell">{c.tags?.[0] || "—"}</td>
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
                    <td className="p-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
        /* Card View */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => (
            <Card key={c.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer group">
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
                    <div className="flex items-center gap-3 mt-3 text-muted-foreground">
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
  );
};

export default CRMContacts;
