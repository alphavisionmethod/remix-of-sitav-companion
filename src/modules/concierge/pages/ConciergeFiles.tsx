import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { PersonalEssentialsPreviewPanel, ConciergePageWrapper, ConciergeEmptyState } from "@/components/concierge";
import type { EssentialDoc } from "@/components/concierge";
import { useState } from "react";
import { FileText, Upload, FolderOpen, Shield, GraduationCap, Stethoscope, Home, Plane, Receipt, Calendar, Search, Eye } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";

interface HouseholdFile {
  id: string;
  name: string;
  type: "form" | "receipt" | "contract" | "report" | "medical" | "travel" | "school" | "insurance" | "warranty";
  category: string;
  linkedTo?: string;
  uploadedAt: string;
  sensitivity: "normal" | "sensitive" | "confidential";
  status: "active" | "archived" | "expiring";
  expiryDate?: string;
}

const files: HouseholdFile[] = [
  { id: "1", name: "Emma — Immunization Record 2025", type: "medical", category: "Health", linkedTo: "Annual health form", uploadedAt: "Jan 15, 2025", sensitivity: "confidential", status: "active" },
  { id: "2", name: "Home Insurance Policy — 2025", type: "insurance", category: "Home Admin", linkedTo: "Annual review", uploadedAt: "Feb 1, 2025", sensitivity: "sensitive", status: "active", expiryDate: "Feb 2026" },
  { id: "3", name: "HVAC Service Contract", type: "contract", category: "Home Services", linkedTo: "ComfortAir maintenance", uploadedAt: "Mar 10, 2025", sensitivity: "normal", status: "active", expiryDate: "Mar 2026" },
  { id: "4", name: "Spring Break Hotel Confirmation", type: "travel", category: "Travel", linkedTo: "Family vacation — Apr 20", uploadedAt: "Mar 28, 2025", sensitivity: "normal", status: "active" },
  { id: "5", name: "Lincoln Elementary — Handbook 2024–25", type: "school", category: "School", linkedTo: "Emma — Lincoln Elementary", uploadedAt: "Aug 20, 2024", sensitivity: "normal", status: "active" },
  { id: "6", name: "Dishwasher Warranty", type: "warranty", category: "Home Admin", uploadedAt: "Sep 5, 2023", sensitivity: "normal", status: "expiring", expiryDate: "Sep 2025" },
  { id: "7", name: "Car Insurance — Renewal Quote", type: "insurance", category: "Auto", linkedTo: "Car registration renewal", uploadedAt: "Mar 25, 2025", sensitivity: "sensitive", status: "active" },
  { id: "8", name: "Pet Vaccination Records — Max", type: "medical", category: "Pet Care", linkedTo: "Vet appointment — Apr 14", uploadedAt: "Apr 2024", sensitivity: "normal", status: "active" },
];

const typeIcon = (t: HouseholdFile["type"]) => {
  const m: Record<string, typeof FileText> = { form: FileText, receipt: Receipt, contract: FileText, report: FileText, medical: Stethoscope, travel: Plane, school: GraduationCap, insurance: Shield, warranty: Home };
  return m[t] || FileText;
};

const ConciergeFiles = () => {
  const [view, setView] = useState("all");
  const expiring = files.filter(f => f.status === "expiring").length;
  const sensitive = files.filter(f => f.sensitivity !== "normal").length;

  const filtered = view === "expiring" ? files.filter(f => f.status === "expiring")
    : view === "sensitive" ? files.filter(f => f.sensitivity !== "normal")
    : view === "medical" ? files.filter(f => f.type === "medical" || f.type === "insurance")
    : files;

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Files" value={String(files.length)} icon={FolderOpen} />
        <KPITile label="Expiring Soon" value={String(expiring)} icon={Calendar} sub={expiring > 0 ? "Review needed" : "All current"} />
        <KPITile label="Sensitive" value={String(sensitive)} icon={Shield} sub="Protected access" />
        <KPITile label="Linked" value={String(files.filter(f => f.linkedTo).length)} icon={FileText} sub="Connected to items" />
      </div>

      {/* Upload area */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-6 border-dashed border-2 border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer micro-hover-lift">
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Upload household documents</p>
          <p className="text-xs text-muted-foreground">Drop files here or click to browse · PDF, images, documents</p>
        </div>
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Files" },
          { key: "expiring", label: "Expiring" },
          { key: "sensitive", label: "Sensitive" },
          { key: "medical", label: "Medical & Insurance" },
        ]}
        active={view}
        onChange={setView}
      />

      {filtered.length === 0 ? (
        <ConciergeEmptyState domain="files" icon={FolderOpen} />
      ) : (
      <div className="space-y-3">
        {filtered.map(file => {
          const Icon = typeIcon(file.type);
          return (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={file.id} >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <div className="flex items-center gap-2">
                      {file.sensitivity !== "normal" && (
                        <span className={`rounded-md px-1.5 py-px text-[10px] font-medium ${file.sensitivity === "confidential" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}`}>
                          {file.sensitivity}
                        </span>
                      )}
                      <TrustBadge level={file.status === "expiring" ? "review" : "safe"} label={file.status} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span className="rounded-md bg-secondary px-1.5 py-px text-[10px]">{file.category}</span>
                    <span>·</span>
                    <span>Uploaded {file.uploadedAt}</span>
                    {file.expiryDate && <><span>·</span><span>Expires {file.expiryDate}</span></>}
                  </div>
                  {file.linkedTo && <p className="text-xs text-primary/70 mt-1">↗ {file.linkedTo}</p>}
                </div>
              </div>
          </div>
          );
        })}
      </div>
      )}

      {/* Essential Documents Preview */}
      <PersonalEssentialsPreviewPanel docs={files.slice(0, 4).map(f => ({
        id: f.id,
        name: f.name,
        type: (f.type === "medical" || f.type === "travel" || f.type === "insurance" || f.type === "contract" || f.type === "form") ? f.type : "general" as const,
        sensitivity: f.sensitivity,
        expiryWarning: f.status === "expiring" ? `Expires ${f.expiryDate}` : undefined,
        linkedContext: f.linkedTo,
      }))} />
    </ConciergePageWrapper>
  );
};

export default ConciergeFiles;
