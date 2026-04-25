import React, { useState, useMemo } from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, Link, Plus, History, CheckCircle, AlertTriangle, RefreshCw, BarChart3, Download, Sparkles } from "lucide-react";
import CRMImportWizard from "@/modules/business/components/business/CRMImportWizard";
import CRMConnectModal from "@/modules/business/components/business/CRMConnectModal";
import { CRMImportTemplates, CRMImportQuality } from "@/modules/business/components/business/crm/CRMImportQuality";
import { useCRMImportJobs } from "@/hooks/use-crm-data";
import { format } from "date-fns";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

const PLATFORMS = [
  { id: "hubspot", name: "HubSpot", icon: "🟠", description: "Import from HubSpot CRM", authType: "oauth" as const, color: "#FF7A59" },
  { id: "salesforce", name: "Salesforce", icon: "☁️", description: "Import from Salesforce", authType: "oauth" as const, color: "#00A1E0" },
  { id: "pipedrive", name: "Pipedrive", icon: "🟢", description: "Import from Pipedrive", authType: "oauth" as const, color: "#017737" },
  { id: "zoho", name: "Zoho CRM", icon: "🔴", description: "Import from Zoho CRM", authType: "oauth" as const, color: "#DC2626" },
  { id: "google-contacts", name: "Google Contacts", icon: "📇", description: "Import from Google", authType: "oauth" as const, color: "#4285F4" },
  { id: "airtable", name: "Airtable", icon: "📊", description: "Import from Airtable", authType: "import" as const, color: "#18BFFF" },
];

const CRMImportCenter = () => {
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<typeof PLATFORMS[0] | null>(null);
  const [activeTab, setActiveTab] = useState("import");
  const { data: importJobs = [] } = useCRMImportJobs();
  const { adaptations, primaryMode } = useBusinessProfile();

  const SMART_FIELDS: Record<string, { label: string; fields: string[] }> = {
    ecommerce: { label: "E-Commerce", fields: ["order_history", "cart_status", "lifetime_value", "campaign_source", "spend_segment", "return_rate"] },
    service: { label: "Service", fields: ["proposal_status", "invoice_status", "delivery_timeline", "communication_history", "follow_up_date"] },
    "brick-and-mortar": { label: "Local", fields: ["visit_count", "loyalty_status", "preferred_location", "staff_notes", "last_visit"] },
    "employee-based": { label: "Operations", fields: ["account_owner", "handoff_state", "response_time", "accountability_score", "team_assigned"] },
    agency: { label: "Agency", fields: ["project_status", "retainer_health", "billing_status", "team_assigned", "proposal_status"] },
  };
  const smartFieldConfig = SMART_FIELDS[primaryMode] || SMART_FIELDS.service;

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Import & Connect</h2>
          <p className="text-xs text-muted-foreground">Import contacts from files, download templates, or connect external CRMs</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="import" className="text-xs gap-1"><Upload className="h-3 w-3" /> Import</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs gap-1"><Download className="h-3 w-3" /> Templates</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Quality Report</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1"><History className="h-3 w-3" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-4 space-y-6">
          {/* Smart field suggestions */}
          <div className="rounded-xl border border-[hsl(var(--sita-purple))]/15 bg-[hsl(var(--sita-purple))]/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--sita-purple))] mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Smart Field Suggestions — {smartFieldConfig.label} Business
            </p>
            <p className="text-[10px] text-foreground/40 mb-3">Based on your business profile, we recommend including these fields in your import:</p>
            <div className="flex flex-wrap gap-1.5">
              {smartFieldConfig.fields.map((field) => (
                <span key={field} className="text-[9px] px-2 py-1 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] font-medium">
                  {field.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer" onClick={() => setShowImportWizard(true)}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Import from File</p>
                  <p className="text-xs text-muted-foreground">Upload CSV or Excel (.xlsx) with contacts, leads, or accounts</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setConnectPlatform(PLATFORMS[0])}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--trust-safe))]/10 flex items-center justify-center">
                  <Link className="h-6 w-6 text-[hsl(var(--trust-safe))]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Connect CRM</p>
                  <p className="text-xs text-muted-foreground">Sync from HubSpot, Salesforce, Pipedrive, and more</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available platforms */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Available Platforms</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PLATFORMS.map(p => (
                <Card key={p.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer" onClick={() => setConnectPlatform(p)}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.description}</p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <CRMImportTemplates />
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <CRMImportQuality showDemo />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {importJobs.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-3 py-2 text-left font-semibold">Source</th>
                    <th className="px-3 py-2 text-left font-semibold">File</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                    <th className="px-3 py-2 text-left font-semibold">Records</th>
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {importJobs.map((job: any) => (
                    <tr key={job.id} className="border-t border-border">
                      <td className="px-3 py-2 capitalize">{job.source}</td>
                      <td className="px-3 py-2 text-muted-foreground">{job.file_name || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          job.status === "completed" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                          job.status === "failed" ? "bg-destructive/10 text-destructive" :
                          "bg-primary/10 text-primary"
                        }`}>{job.status}</span>
                      </td>
                      <td className="px-3 py-2">{job.created_count ?? 0} created, {job.updated_count ?? 0} updated</td>
                      <td className="px-3 py-2 text-muted-foreground">{job.created_at ? format(new Date(job.created_at), "MMM d, yyyy") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <History className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No imports yet</p>
              <p className="text-xs text-muted-foreground mt-1">Import your first contacts to get started</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => { setActiveTab("import"); setShowImportWizard(true); }}>
                <Upload className="h-3.5 w-3.5" /> Import Now
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showImportWizard && <CRMImportWizard onClose={() => setShowImportWizard(false)} />}
      {connectPlatform && <CRMConnectModal platform={connectPlatform} onClose={() => setConnectPlatform(null)} />}
    </div>
  );
};

export default CRMImportCenter;
