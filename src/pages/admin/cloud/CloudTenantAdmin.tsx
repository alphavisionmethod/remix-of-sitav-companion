import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Building2, Users, Globe, Shield, Plus, Search, Settings
} from "lucide-react";
import { cloudTenantService } from "@/platform/cloud/cloud-tenant-service";
import type { CloudTenant } from "@/platform/cloud/cloud-tenant-service";
import { toast } from "sonner";

export function CloudTenantAdmin() {
  const [tenants, setTenants] = useState<CloudTenant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cloudTenantService.getTenants().then(t => { setTenants(t); setLoading(false); });
  }, []);

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase())
  );

  const typeIcon: Record<string, string> = { team: "👥", company: "🏢", family: "🏠", school: "🎓" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tenant Management</h1>
            <p className="text-sm text-muted-foreground">Organizations, teams, and workspace governance</p>
          </div>
        </div>
        <Button size="sm" onClick={() => toast.info("Create tenant workflow")} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Tenant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tenants", value: tenants.length, icon: Building2 },
          { label: "Active", value: tenants.filter(t => t.status === "active").length, icon: Shield },
          { label: "Regions", value: [...new Set(tenants.map(t => t.region))].length, icon: Globe },
          { label: "Members", value: tenants.length * 5, icon: Users },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-lg mr-1">{typeIcon[t.type] || "🏢"}</span> {t.type}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t.region}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Managing ${t.name}`)}>
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No tenants found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
