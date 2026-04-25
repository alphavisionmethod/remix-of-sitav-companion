import React, { useState, useMemo } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRMCompanies, useCreateCompany, useDeleteCompany } from "@/hooks/use-crm-data";
import { Building2, Plus, Search, ChevronRight, Globe, DollarSign, Heart, MoreHorizontal, Trash2, List, Grid3X3 } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CRMCompanyDetail } from "@/modules/business/components/business/crm/CRMCompanyDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";

const healthColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";

const CRMCompanies = () => {
  const { primaryMode, adaptations } = useBusinessProfile();
  const companyLabel = adaptations.crm?.language?.contactLabel === "Buyers" ? "Stores" : adaptations.crm?.language?.contactLabel === "Clients" ? "Practices" : "Companies";
  const { data: companies = [] } = useCRMCompanies();
  const createCompany = useCreateCompany();
  const deleteCompany = useDeleteCompany();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  type CompanyForm = { name: string; domain: string; industry: string; size: string; website: string; phone: string; annual_revenue: string };
  const EMPTY_COMPANY_FORM: CompanyForm = { name: "", domain: "", industry: "", size: "", website: "", phone: "", annual_revenue: "" };
  const { draft, updateDraft, clearDraft } = useDraftAutosave<CompanyForm>("business:crm:company:new", "business");
  const [form, setForm] = useState<CompanyForm>(() => ({ ...EMPTY_COMPANY_FORM, ...draft }));
  React.useEffect(() => { updateDraft(form); }, [form, updateDraft]);

  const filtered = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter(c => c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q) || c.domain?.toLowerCase().includes(q));
  }, [companies, search]);

  const activeCompany = companies.find(c => c.id === selectedCompany);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error("Company name is required"); return; }
    try {
      const payload: Record<string, unknown> = { ...form };
      if (form.annual_revenue) payload.annual_revenue = Number(form.annual_revenue);
      else delete payload.annual_revenue;
      await createCompany.mutateAsync(payload);
      toast.success("Company created");
      setShowAdd(false);
      setForm(EMPTY_COMPANY_FORM);
      clearDraft();
    } catch { toast.error("Failed to create company"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompany.mutateAsync(id);
      toast.success("Company deleted");
      if (selectedCompany === id) setSelectedCompany(null);
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="flex gap-0 h-full">
      <div className={`flex-1 space-y-4 transition-all ${activeCompany ? "max-w-[55%]" : ""}`}>
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
            <div className="flex border border-border rounded-md">
              <Button variant={view === "card" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView("card")}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView("table")}>
                <List className="h-3.5 w-3.5" />
              </Button>
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
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Industry" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} />
                    <Input placeholder="Size (e.g. 50-200)" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                    <Input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <Input placeholder="Annual Revenue ($)" type="number" value={form.annual_revenue} onChange={e => setForm(p => ({ ...p, annual_revenue: e.target.value }))} />
                  <Button className="w-full" onClick={handleAdd} disabled={createCompany.isPending}>
                    {createCompany.isPending ? "Creating..." : "Create Company"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {view === "card" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => (
              <Card
                key={c.id}
                className={`border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer group ${selectedCompany === c.id ? "border-primary/50 bg-primary/5" : ""}`}
                onClick={() => setSelectedCompany(c.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{c.name}</p>
                      {c.industry && <p className="text-xs text-muted-foreground">{c.industry} {c.size ? `· ${c.size}` : ""}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {c.annual_revenue != null && (
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${(c.annual_revenue / 1e6).toFixed(1)}M</span>
                        )}
                        <span className={`font-semibold ${healthColor(c.health_score ?? 50)}`}>
                          <Heart className="h-3 w-3 inline mr-0.5" />{c.health_score ?? 50}
                        </span>
                        {c.domain && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{c.domain}</span>}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => setSelectedCompany(c.id)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Company</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Industry</th>
                    <th className="text-right p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Revenue</th>
                    <th className="text-center p-3 text-xs text-muted-foreground font-medium">Health</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr
                      key={c.id}
                      className={`border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group ${selectedCompany === c.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedCompany(c.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{c.name}</p>
                            {c.domain && <p className="text-xs text-muted-foreground">{c.domain}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{c.industry || "—"}</td>
                      <td className="p-3 text-right hidden lg:table-cell">
                        {c.annual_revenue ? `$${(c.annual_revenue / 1e6).toFixed(1)}M` : "—"}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-sm font-semibold ${healthColor(c.health_score ?? 50)}`}>{c.health_score ?? 50}</span>
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
                <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No companies yet</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Detail panel */}
      {activeCompany && (
        <div className="w-[45%] border-l border-border/50 bg-background overflow-hidden">
          <CRMCompanyDetail
            company={activeCompany}
            onClose={() => setSelectedCompany(null)}
          />
        </div>
      )}
    </div>
  );
};

export default CRMCompanies;
