// SITA OS — CRM Files Linkage Component
// Cross-domain integration: CRM ↔ Files (contracts, proposals, attachments)
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Upload, Download, Eye, FolderOpen, FileLock2,
  FileCheck2, FileWarning, Clock, CheckCircle, Sparkles,
  ExternalLink, Plus, Image, FileSpreadsheet, Presentation
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

interface LinkedFile {
  id: string;
  name: string;
  type: "contract" | "proposal" | "nda" | "invoice" | "receipt" | "presentation" | "spreadsheet" | "image" | "other";
  status: "active" | "expired" | "pending_signature" | "signed" | "draft";
  uploaded_at: string;
  expires_at?: string;
  size_kb: number;
  sensitivity: "public" | "internal" | "confidential" | "restricted";
  proof_linked?: boolean;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  contract: <FileLock2 className="h-4 w-4 text-purple-400" />,
  proposal: <FileText className="h-4 w-4 text-blue-400" />,
  nda: <FileLock2 className="h-4 w-4 text-red-400" />,
  invoice: <FileCheck2 className="h-4 w-4 text-green-400" />,
  receipt: <FileCheck2 className="h-4 w-4 text-emerald-400" />,
  presentation: <Presentation className="h-4 w-4 text-orange-400" />,
  spreadsheet: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  image: <Image className="h-4 w-4 text-pink-400" />,
  other: <FileText className="h-4 w-4 text-muted-foreground" />,
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-500/15 text-green-400 border-green-500/25" },
  expired: { label: "Expired", className: "bg-red-500/15 text-red-400 border-red-500/25" },
  pending_signature: { label: "Awaiting Signature", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
  signed: { label: "Signed", className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border/50" },
};

const SENSITIVITY_BADGES: Record<string, { label: string; className: string }> = {
  public: { label: "Public", className: "text-muted-foreground" },
  internal: { label: "Internal", className: "text-blue-400" },
  confidential: { label: "Confidential", className: "text-orange-400" },
  restricted: { label: "Restricted", className: "text-red-400" },
};

function generateDemoFiles(entityName: string): LinkedFile[] {
  return [
    { id: "f1", name: `Master Service Agreement — ${entityName}.pdf`, type: "contract", status: "active", uploaded_at: "2025-09-15", expires_at: "2026-09-15", size_kb: 420, sensitivity: "confidential", proof_linked: true },
    { id: "f2", name: `NDA — ${entityName}.pdf`, type: "nda", status: "signed", uploaded_at: "2025-06-01", expires_at: "2027-06-01", size_kb: 180, sensitivity: "restricted", proof_linked: true },
    { id: "f3", name: `Proposal Q2 2026 — ${entityName}.pdf`, type: "proposal", status: "pending_signature", uploaded_at: "2026-03-20", size_kb: 1250, sensitivity: "confidential" },
    { id: "f4", name: `Brand Guidelines — ${entityName}.pptx`, type: "presentation", status: "active", uploaded_at: "2026-01-10", size_kb: 8900, sensitivity: "internal" },
    { id: "f5", name: `Payment Schedule.xlsx`, type: "spreadsheet", status: "active", uploaded_at: "2026-02-28", size_kb: 95, sensitivity: "confidential" },
  ];
}

interface CRMFilesLinkageProps {
  entityType: "contact" | "company";
  entityId: string;
  entityName: string;
}

export function CRMFilesLinkage({ entityType, entityId, entityName }: CRMFilesLinkageProps) {
  const files = useMemo(() => generateDemoFiles(entityName), [entityName]);

  const expiringSoon = files.filter(f => f.expires_at && !isPast(new Date(f.expires_at)) && 
    (new Date(f.expires_at).getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000);
  const pendingSig = files.filter(f => f.status === "pending_signature");
  const proofLinked = files.filter(f => f.proof_linked);

  const byType = files.reduce<Record<string, LinkedFile[]>>((acc, f) => {
    const group = ["contract", "nda"].includes(f.type) ? "Legal" : 
                  ["proposal", "presentation"].includes(f.type) ? "Commercial" : "Other";
    (acc[group] = acc[group] || []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
          <p className="text-lg font-bold text-foreground">{files.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Files</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
          <p className="text-lg font-bold text-foreground">{proofLinked.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Proof-Linked</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
          <p className={`text-lg font-bold ${pendingSig.length > 0 ? "text-yellow-400" : "text-foreground"}`}>{pendingSig.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Awaiting Sign</p>
        </div>
      </div>

      {/* Alerts */}
      {pendingSig.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-500/8 border border-yellow-500/20 flex items-start gap-3">
          <FileWarning className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-400">{pendingSig.length} document{pendingSig.length > 1 ? "s" : ""} awaiting signature</p>
            <p className="text-xs text-muted-foreground mt-0.5">{pendingSig.map(f => f.name.split("—")[0].trim()).join(", ")}</p>
          </div>
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div className="p-3 rounded-lg bg-orange-500/8 border border-orange-500/20 flex items-start gap-3">
          <Clock className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-400">{expiringSoon.length} document{expiringSoon.length > 1 ? "s" : ""} expiring within 90 days</p>
          </div>
        </div>
      )}

      {/* Grouped file list */}
      {Object.entries(byType).map(([group, groupFiles]) => (
        <Card key={group} className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" /> {group}
              <Badge variant="outline" className="text-[10px]">{groupFiles.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {groupFiles.map(file => {
                const status = STATUS_BADGES[file.status];
                const sens = SENSITIVITY_BADGES[file.sensitivity];
                return (
                  <div key={file.id} className="px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer group flex items-center gap-3">
                    {FILE_ICONS[file.type]}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${status.className}`}>{status.label}</span>
                        <span className={`text-[10px] ${sens.className}`}>{sens.label}</span>
                        <span className="text-[10px] text-muted-foreground/60">{(file.size_kb / 1024).toFixed(1)} MB</span>
                        {file.proof_linked && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5">
                            <CheckCircle className="h-2.5 w-2.5" /> Proof
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Upload action */}
      <Button variant="outline" className="w-full text-xs gap-2 h-9 border-dashed">
        <Upload className="h-3.5 w-3.5" /> Attach File to {entityType === "company" ? entityName : "Contact"}
      </Button>
    </div>
  );
}
