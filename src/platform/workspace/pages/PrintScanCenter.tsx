import { useState } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { Printer, ScanLine, FileText, Clock, CheckCircle2, AlertTriangle, Trash2, RotateCw, Settings, Camera, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

interface PrintJob {
  id: string;
  name: string;
  pages: number;
  status: "queued" | "printing" | "completed" | "failed";
  printer: string;
  submittedAt: string;
  progress: number;
}

interface ScanEntry {
  id: string;
  name: string;
  pages: number;
  source: string;
  scannedAt: string;
  destination: string;
  status: "processing" | "completed" | "routing";
}

const demoPrintJobs: PrintJob[] = [
  { id: "p1", name: "Q2 Financial Report.pdf", pages: 12, status: "completed", printer: "Office Laser Pro", submittedAt: "10 min ago", progress: 100 },
  { id: "p2", name: "Invoice INV-2026-0341.pdf", pages: 2, status: "printing", printer: "Office Laser Pro", submittedAt: "2 min ago", progress: 65 },
  { id: "p3", name: "Contract — Acme Corp.pdf", pages: 8, status: "queued", printer: "Office Laser Pro", submittedAt: "Just now", progress: 0 },
];

const demoScans: ScanEntry[] = [
  { id: "s1", name: "Receipt-2026-04-09.jpg", pages: 1, source: "Phone Camera", scannedAt: "5 min ago", destination: "Money Center → Receipts", status: "completed" },
  { id: "s2", name: "Business Card — Alex Chen.jpg", pages: 1, source: "Phone Camera", scannedAt: "15 min ago", destination: "CRM → Contacts", status: "routing" },
  { id: "s3", name: "Signed-Agreement.pdf", pages: 3, source: "Scanner", scannedAt: "1 hr ago", destination: "Files → Contracts", status: "completed" },
];

const statusIcon = (s: string) => {
  switch (s) {
    case "completed": return <CheckCircle2 className="h-4 w-4 text-trust-safe" />;
    case "printing": case "processing": return <RotateCw className="h-4 w-4 text-primary animate-spin" />;
    case "queued": case "routing": return <Clock className="h-4 w-4 text-sita-gold" />;
    case "failed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const PrintScanCenter = () => {
  const [activeTab, setActiveTab] = useState<"print" | "scan" | "routing">("print");

  return (
    <PageShell width="standard">
<SitaPageHeader icon={<Printer className="h-6 w-6" />} title="Print & Scan Center" subtitle="Print queue, scan import, and intelligent document routing">
        <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-1" /> Manage Printers</Button>
      </SitaPageHeader>

      <SitaTabs tabs={[
        { key: "print", label: `Print Queue (${demoPrintJobs.length})` },
        { key: "scan", label: `Scan Import (${demoScans.length})` },
        { key: "routing", label: "Routing Rules" },
      ]} active={activeTab} onChange={k => setActiveTab(k as typeof activeTab)} />

      {activeTab === "print" && (
        <div className="space-y-3">
          {demoPrintJobs.map(job => (
            <SitaCard key={job.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {statusIcon(job.status)}
                  <div>
                    <p className="text-sm font-medium">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.pages} pages · {job.printer} · {job.submittedAt}</p>
                    {job.status === "printing" && (
                      <div className="mt-2 flex items-center gap-2 min-w-[200px]">
                        <Progress value={job.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{job.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="capitalize text-[10px]">{job.status}</Badge>
                  {job.status === "queued" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  )}
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {activeTab === "scan" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SitaCard className="p-6 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Scan from Camera</p>
              <p className="text-xs text-muted-foreground mt-1">Use phone or webcam to capture</p>
            </SitaCard>
            <SitaCard className="p-6 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Import Scan</p>
              <p className="text-xs text-muted-foreground mt-1">Upload from file or scanner</p>
            </SitaCard>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Scans</h3>
            {demoScans.map(scan => (
              <SitaCard key={scan.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {statusIcon(scan.status)}
                    <div>
                      <p className="text-sm font-medium">{scan.name}</p>
                      <p className="text-xs text-muted-foreground">{scan.pages} page(s) · {scan.source} · {scan.scannedAt}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <FolderOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-primary">{scan.destination}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px]">{scan.status}</Badge>
                </div>
              </SitaCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === "routing" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Automatic routing rules for scanned documents.</p>
          {[
            { pattern: "Receipt / expense", destination: "Money Center → Receipts", rule: "OCR detects currency amount" },
            { pattern: "Business card", destination: "CRM → Contacts", rule: "OCR detects name + phone/email" },
            { pattern: "Contract / agreement", destination: "Files → Contracts", rule: "Keywords: agreement, contract, signed" },
            { pattern: "Invoice", destination: "Money Center → Invoices", rule: "Keywords: invoice, due date, amount due" },
            { pattern: "ID / passport", destination: "Secure Files → Identity", rule: "OCR detects ID number patterns" },
          ].map((rule, i) => (
            <SitaCard key={i} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{rule.pattern}</p>
                <p className="text-xs text-muted-foreground">{rule.rule}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{rule.destination}</Badge>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </SitaCard>
          ))}
          <Button variant="outline" className="w-full">+ Add Routing Rule</Button>
        </div>
      )}
    </PageShell>
  );
};

export default PrintScanCenter;
