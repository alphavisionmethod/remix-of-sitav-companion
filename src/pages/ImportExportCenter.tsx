import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { Upload, FileText, Image, Table2, FileSpreadsheet, Download, ArrowUpFromLine, ArrowDownToLine, Camera, Clipboard, ScanLine, HardDrive, Cloud, CheckCircle2, Clock, AlertTriangle, ChevronRight, FolderInput, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type DemoUploadItem as UploadItem, type DemoExportItem as ExportItem } from "@/data/seed/import-export";
import { useImportExportJobs } from "@/hooks/use-live-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";
const STATUS_STYLES = { uploading: "text-primary", processing: "text-amber-400", complete: "text-emerald-400", failed: "text-red-400", generating: "text-amber-400", ready: "text-emerald-400", expired: "text-muted-foreground", pending: "text-amber-400" };
const STATUS_ICONS = { uploading: Clock, processing: Clock, complete: CheckCircle2, failed: AlertTriangle, generating: Clock, ready: CheckCircle2, expired: AlertTriangle, pending: Clock };

const ImportExportCenter = () => {
  const { isDemo } = useAuth();
  const [tab, setTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const { data: liveJobs } = useImportExportJobs();

  const uploads = useMemo(() => {
    if (!liveJobs?.length) return [];
    return liveJobs.filter((j: Record<string, any>) => j.job_type === "import").map((j: Record<string, any>) => ({
      id: j.id,
      name: j.file_name || "Untitled",
      type: j.format || "file",
      size: j.file_size ? `${(j.file_size / 1024).toFixed(0)} KB` : "—",
      status: j.status as never,
      progress: j.progress || 0,
      destination: undefined,
    }));
  }, [false, liveJobs]);

  const exports = useMemo(() => {
    if (!liveJobs?.length) return [];
    return liveJobs.filter((j: Record<string, any>) => j.job_type === "export").map((j: Record<string, any>) => ({
      id: j.id,
      name: j.file_name || "Export",
      type: j.format || "file",
      size: j.file_size ? `${(j.file_size / 1024).toFixed(0)} KB` : "—",
      status: j.status as never,
      generatedAt: j.completed_at || j.created_at,
      expiresAt: undefined,
    }));
  }, [false, liveJobs]);

  return (
    <PageShell>
    <div className="min-h-screen pb-12">
<SitaPageHeader title="Upload & Export Center" subtitle="Import files, export reports, and manage data transfers" />

      <SitaTabs tabs={[
        { key: "upload", label: "Upload" },
        { key: "import", label: "Import Data" },
        { key: "capture", label: "Capture" },
        { key: "exports", label: "Downloads & Exports" },
      ]} active={tab} onChange={setTab} className="mb-6" />

      {tab === "upload" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Drop zone */}
          <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={() => setIsDragging(false)}
            className={cn("border-2 border-dashed rounded-2xl p-12 text-center transition-all mb-6", isDragging ? "border-primary bg-primary/5" : "border-border/30 hover:border-border/50")}>
            <Upload className={cn("w-12 h-12 mx-auto mb-3 transition-colors", isDragging ? "text-primary" : "text-muted-foreground/30")} />
            <h3 className="text-sm font-semibold mb-1">{isDragging ? "Drop files here" : "Drag & drop files to upload"}</h3>
            <p className="text-xs text-muted-foreground mb-4">PDF, DOCX, XLSX, CSV, images, and more — up to 50MB each</p>
            <div className="flex justify-center gap-2">
              <Button size="sm" className="gap-1.5 text-xs"><ArrowUpFromLine className="w-3.5 h-3.5" /> Browse Files</Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"><FolderInput className="w-3.5 h-3.5" /> Upload Folder</Button>
            </div>
          </div>

          {/* Recent uploads */}
          <SitaCardTitle className="text-xs mb-3">Recent Uploads</SitaCardTitle>
          {uploads.length === 0 ? null : (
            <div className="space-y-2">
              {uploads.map((item: Record<string, any>) => {
                const StatusIcon = STATUS_ICONS[item.status as keyof typeof STATUS_ICONS] || Clock;
                return (
                  <SitaCard key={item.id} className="p-3" hover>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-card/50 flex items-center justify-center">
                        {item.type === "image" ? <Image className="w-4 h-4 text-muted-foreground" /> :
                         item.type === "spreadsheet" ? <FileSpreadsheet className="w-4 h-4 text-muted-foreground" /> :
                         <FileText className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground">{item.size}{item.destination ? ` → ${item.destination}` : ""}</div>
                      </div>
                      {item.status === "uploading" && (
                        <div className="w-20">
                          <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                          </div>
                          <div className="text-[9px] text-muted-foreground text-right mt-0.5">{item.progress}%</div>
                        </div>
                      )}
                      <StatusIcon className={cn("w-4 h-4", STATUS_STYLES[item.status as keyof typeof STATUS_STYLES])} />
                    </div>
                  </SitaCard>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {tab === "import" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: FileSpreadsheet, title: "Import CSV / Excel", desc: "Import contacts, transactions, or data from spreadsheets" },
              { icon: Cloud, title: "Import from Service", desc: "Pull data from connected services and integrations" },
              { icon: HardDrive, title: "Import from Backup", desc: "Restore data from a previous backup or export" },
            ].map(opt => (
              <SitaCard key={opt.title} className="p-5 cursor-pointer" hover>
                <opt.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-sm font-semibold mb-1">{opt.title}</h3>
                <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
              </SitaCard>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "capture" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Camera, title: "Photo Capture", desc: "Take a photo directly" },
              { icon: ScanLine, title: "Scan Document", desc: "Scan with your camera" },
              { icon: Clipboard, title: "Clipboard Paste", desc: "Paste from clipboard" },
              { icon: FileText, title: "Quick Note", desc: "Capture a thought" },
            ].map(opt => (
              <SitaCard key={opt.title} className="p-5 text-center cursor-pointer" hover>
                <opt.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">{opt.title}</h3>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </SitaCard>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "exports" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {exports.length === 0 ? null : (
            <div className="space-y-2">
              {exports.map((item: Record<string, any>) => {
                const StatusIcon = STATUS_ICONS[item.status as keyof typeof STATUS_ICONS] || Clock;
                return (
                  <SitaCard key={item.id} className="p-3" hover>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-card/50 flex items-center justify-center">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground">{item.size} · {(item.type || "").toUpperCase()}</div>
                      </div>
                      <Badge className={cn("text-[9px]", STATUS_STYLES[item.status as keyof typeof STATUS_STYLES])}>{item.status}</Badge>
                      {item.status === "ready" && <Button size="sm" variant="ghost" className="text-xs h-7"><Download className="w-3 h-3" /></Button>}
                    </div>
                  </SitaCard>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
    </PageShell>
  );
};

export default ImportExportCenter;
