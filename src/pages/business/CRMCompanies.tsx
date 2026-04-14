import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRMCompanies, useCreateCompany } from "@/hooks/use-crm-data";
import { Building2, Plus, Search, ChevronRight, Globe, DollarSign, Users, Heart } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const healthColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";

const CRMCompanies = () => {
  const { data: companies = [] } = useCRMCompanies();
  const createCompany = useCreateCompany();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", industry: "", size: "", website: "" });

  const filtered = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter(c => c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q) || c.domain?.toLowerCase().includes(q));
  }, [companies, search]);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error("Company name is required"); return; }
    try {
      await createCompany.mutateAsync(form as any);
      toast.success("Company created");
      setShowAdd(false);
      setForm({ name: "", domain: "", industry: "", size: "", website: "" });
    } catch { toast.error("Failed to create company"); }
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Companies</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} compan{filtered.length !== 1 ? "ies" : "y"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search companies..." className="pl-8 h-9 w-56 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Company</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New Company</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Company name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Domain (e.g. acme.com)" value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} />
                <Input placeholder="Industry" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} />
                <Input placeholder="Size (e.g. 50-200)" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} />
                <Input placeholder="Website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                <Button className="w-full" onClick={handleAdd} disabled={createCompany.isPending}>
                  {createCompany.isPending ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(c => (
          <Card key={c.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{c.name}</p>
                  {c.industry && <p className="text-xs text-muted-foreground">{c.industry} {c.size ? `· ${c.size}` : ""}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {c.annual_revenue && (
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${(c.annual_revenue / 1e6).toFixed(1)}M</span>
                    )}
                    <span className={`font-semibold ${healthColor(c.health_score ?? 50)}`}>
                      <Heart className="h-3 w-3 inline mr-0.5" />{c.health_score ?? 50}
                    </span>
                    {c.domain && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{c.domain}</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No companies yet</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5" /> Add your first company
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMCompanies;
