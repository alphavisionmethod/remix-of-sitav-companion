import { useState, useCallback, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SitaButton } from "@/components/sita/SitaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload, FileSpreadsheet, CheckCircle, ArrowRight, ArrowLeft, AlertTriangle,
  Loader2, ChevronDown, Download, Search, Merge, Shield, BarChart3, X, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useCreateContact } from "@/hooks/use-crm-data";
import { supabase } from "@/integrations/supabase/client";
import { emitRegisteredTrustAction } from "@/modules/_trust";

interface Props {
  onClose: () => void;
}

type Step = "upload" | "structure" | "mapping" | "validation" | "dedup" | "review" | "summary";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "structure", label: "Detect" },
  { key: "mapping", label: "Map" },
  { key: "validation", label: "Validate" },
  { key: "dedup", label: "Dedup" },
  { key: "review", label: "Review" },
  { key: "summary", label: "Done" },
];

const CRM_FIELDS = [
  { key: "first_name", label: "First Name", required: true, group: "identity" },
  { key: "last_name", label: "Last Name", required: true, group: "identity" },
  { key: "email", label: "Email", required: false, group: "contact" },
  { key: "phone", label: "Phone", required: false, group: "contact" },
  { key: "title", label: "Job Title", required: false, group: "identity" },
  { key: "company", label: "Company", required: false, group: "org" },
  { key: "lifecycle_stage", label: "Lifecycle Stage", required: false, group: "crm" },
  { key: "source", label: "Lead Source", required: false, group: "crm" },
  { key: "status", label: "Status", required: false, group: "crm" },
  { key: "tags", label: "Tags", required: false, group: "crm" },
  { key: "address", label: "Address", required: false, group: "location" },
  { key: "city", label: "City", required: false, group: "location" },
  { key: "state", label: "State", required: false, group: "location" },
  { key: "country", label: "Country", required: false, group: "location" },
  { key: "website", label: "Website", required: false, group: "contact" },
  { key: "notes", label: "Notes", required: false, group: "other" },
  { key: "skip", label: "— Skip —", required: false, group: "skip" },
];

const SIMILARITY_MAP: Record<string, string> = {
  "name": "first_name", "full name": "first_name", "fullname": "first_name", "contact name": "first_name",
  "first name": "first_name", "firstname": "first_name", "first": "first_name", "given name": "first_name",
  "last name": "last_name", "lastname": "last_name", "last": "last_name", "surname": "last_name", "family name": "last_name",
  "email": "email", "e-mail": "email", "email address": "email", "mail": "email",
  "phone": "phone", "telephone": "phone", "phone number": "phone", "mobile": "phone", "cell": "phone",
  "company": "company", "organization": "company", "org": "company", "business": "company", "company name": "company",
  "title": "title", "job title": "title", "position": "title", "role": "title",
  "source": "source", "lead source": "source", "channel": "source", "origin": "source",
  "status": "status", "lead status": "status", "stage": "lifecycle_stage", "lifecycle": "lifecycle_stage",
  "notes": "notes", "note": "notes", "comment": "notes", "comments": "notes", "description": "notes",
  "tags": "tags", "tag": "tags", "labels": "tags",
  "address": "address", "street": "address", "address line": "address",
  "city": "city", "town": "city",
  "state": "state", "province": "state", "region": "state",
  "country": "country", "nation": "country",
  "website": "website", "url": "website", "web": "website", "site": "website",
};

function autoMapColumn(header: string): string {
  const normalized = header.toLowerCase().trim();
  return SIMILARITY_MAP[normalized] || "skip";
}

type DedupStrategy = "create_all" | "skip_existing" | "update_existing" | "manual";

interface ValidationIssue {
  row: number;
  column: string;
  type: "missing" | "invalid_email" | "invalid_phone" | "duplicate_email";
  message: string;
  severity: "error" | "warning";
}

interface DuplicateCandidate {
  importRow: number;
  importEmail: string;
  importName: string;
  existingId?: string;
  existingName?: string;
  action: "create" | "skip" | "update";
}

const CRMImportWizard = ({ onClose }: Props) => {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [dedupStrategy, setDedupStrategy] = useState<DedupStrategy>("skip_existing");
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [importResult, setImportResult] = useState<{ created: number; updated: number; skipped: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createContact = useCreateContact();

  const stepIndex = STEPS.findIndex(s => s.key === step);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    const handleParsedData = (data: string[][]) => {
      if (data.length < 2) { toast.error("File appears empty"); return; }
      const fileHeaders = data[0];
      const fileRows = data.slice(1).filter(r => r.some(c => c?.trim()));
      setHeaders(fileHeaders);
      setRows(fileRows);
      const autoMap: Record<number, string> = {};
      fileHeaders.forEach((h, i) => { autoMap[i] = autoMapColumn(h); });
      setMapping(autoMap);
      setStep("structure");
    };

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1, defval: "" });
          handleParsedData(data as string[][]);
        } catch { toast.error("Failed to parse Excel file"); }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        complete: (results) => handleParsedData(results.data as string[][]),
        error: () => toast.error("Failed to parse file"),
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const mappedFields = Object.values(mapping).filter(v => v !== "skip");
  const hasName = mappedFields.includes("first_name") || mappedFields.includes("last_name");
  const duplicateFields = mappedFields.filter((v, i, arr) => v !== "skip" && arr.indexOf(v) !== i);
  const autoMappedCount = Object.values(mapping).filter(v => v !== "skip").length;

  const emailColIndex = useMemo(() => {
    return Object.entries(mapping).find(([, v]) => v === "email")?.[0];
  }, [mapping]);

  const runValidation = useCallback(() => {
    const issues: ValidationIssue[] = [];
    const emailIdx = emailColIndex ? parseInt(emailColIndex) : -1;
    const seenEmails = new Set<string>();

    rows.forEach((row, ri) => {
      // Check required name field
      const fnIdx = Object.entries(mapping).find(([, v]) => v === "first_name")?.[0];
      const lnIdx = Object.entries(mapping).find(([, v]) => v === "last_name")?.[0];
      if (fnIdx && !row[parseInt(fnIdx)]?.trim() && lnIdx && !row[parseInt(lnIdx)]?.trim()) {
        issues.push({ row: ri, column: "Name", type: "missing", message: "No name provided", severity: "error" });
      }

      // Validate email
      if (emailIdx >= 0 && row[emailIdx]?.trim()) {
        const email = row[emailIdx].trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          issues.push({ row: ri, column: "Email", type: "invalid_email", message: `Invalid email: ${email}`, severity: "error" });
        } else if (seenEmails.has(email)) {
          issues.push({ row: ri, column: "Email", type: "duplicate_email", message: `Duplicate in file: ${email}`, severity: "warning" });
        }
        seenEmails.add(email);
      }
    });

    setValidationIssues(issues);
    setStep("validation");
  }, [rows, mapping, emailColIndex]);

  const runDedupCheck = useCallback(async () => {
    // For now simulate dedup — in real mode would query existing contacts
    const emailIdx = emailColIndex ? parseInt(emailColIndex) : -1;
    const fnIdx = Object.entries(mapping).find(([, v]) => v === "first_name")?.[0];
    const candidates: DuplicateCandidate[] = [];

    if (emailIdx >= 0) {
      const emails = rows.map((r, i) => ({ idx: i, email: r[emailIdx]?.trim().toLowerCase() })).filter(e => e.email);
      // Check against existing DB contacts
      const { data: existingContacts } = await (supabase as any).from("crm_contacts").select("id, first_name, last_name, email").in("email", emails.map(e => e.email));
      const existingMap = new Map((existingContacts || []).map((c: any) => [(c.email as string)?.toLowerCase(), c]));

      emails.forEach(({ idx, email }) => {
        const existing = existingMap.get(email) as any;
        if (existing) {
          candidates.push({
            importRow: idx,
            importEmail: email,
            importName: fnIdx ? rows[idx][parseInt(fnIdx)] || "" : "",
            existingId: existing.id,
            existingName: `${existing.first_name} ${existing.last_name}`,
            action: dedupStrategy === "create_all" ? "create" : dedupStrategy === "update_existing" ? "update" : "skip",
          });
        }
      });
    }

    setDuplicates(candidates);
    setStep("dedup");
  }, [rows, mapping, emailColIndex, dedupStrategy]);

  const handleImport = async () => {
    setImporting(true);
    let created = 0, updated = 0, skipped = 0, errors = 0;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to import contacts");
      setImporting(false);
      return;
    }

    const dupEmails = new Set(duplicates.filter(d => d.action === "skip").map(d => d.importEmail));
    const updateEmails = new Map(duplicates.filter(d => d.action === "update").map(d => [d.importEmail, d.existingId]));

    for (const [ri, row] of rows.entries()) {
      try {
        const record: Record<string, any> = { user_id: user.id };
        Object.entries(mapping).forEach(([colIdx, field]) => {
          if (field === "skip") return;
          const val = row[parseInt(colIdx)]?.trim();
          if (!val) return;
          if (field === "tags") {
            record[field] = val.split(",").map(t => t.trim());
          } else {
            record[field] = val;
          }
        });

        if (!record.first_name && !record.last_name) { skipped++; continue; }

        const email = record.email?.toLowerCase();
        if (email && dupEmails.has(email)) { skipped++; continue; }

        if (email && updateEmails.has(email)) {
          const existingId = updateEmails.get(email);
          const { user_id, ...updates } = record;
          await (supabase as any).from("crm_contacts").update(updates).eq("id", existingId);
          updated++;
        } else {
          record.import_source = "csv";
          await (supabase as any).from("crm_contacts").insert(record);
          created++;
        }
      } catch {
        errors++;
      }
    }

    setImportResult({ created, updated, skipped, errors });
    setImporting(false);
    setStep("summary");
    if (created > 0 || updated > 0) toast.success(`Imported ${created} new, updated ${updated} contacts`);

    // Trust receipt — bulk PII writes must be auditable as a single
    // owner-authorized event, not just N anonymous row inserts.
    if (created > 0 || updated > 0) {
      await emitRegisteredTrustAction("business.crm.contact_bulk_import", {
        impactSummary: `Imported ${created} new contacts and updated ${updated} existing.`,
        payload: { created, updated, skipped, errors, totalRows: rows.length },
      });
    }
  };

  const errorCount = validationIssues.filter(v => v.severity === "error").length;
  const warningCount = validationIssues.filter(v => v.severity === "warning").length;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Contacts
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a CSV file with your contacts"}
            {step === "structure" && "We detected your file structure"}
            {step === "mapping" && "Map your columns to CRM fields"}
            {step === "validation" && "Reviewing data quality"}
            {step === "dedup" && "Checking for duplicates"}
            {step === "review" && "Final review before importing"}
            {step === "summary" && "Import complete"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-3">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 flex-1">
              <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
                stepIndex >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{i + 1}</div>
              <span className={`text-[10px] font-medium hidden sm:inline ${stepIndex >= i ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${stepIndex > i ? "bg-primary/40" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {/* Step 1: Upload */}
            {step === "upload" && (
              <div className="space-y-3">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all ${
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/30"
                  }`}
                >
                  <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" className="hidden" onChange={handleFileSelect} />
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">Drop your file here</p>
                  <p className="text-xs text-muted-foreground mt-1">CSV, Excel (.xlsx) — up to 10,000 rows</p>
                  <SitaButton variant="secondary" size="sm" className="mt-4">Browse Files</SitaButton>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  <button className="text-[11px] text-primary hover:underline" onClick={() => {
                    const csv = "First Name,Last Name,Email,Phone,Company,Title,Source,Tags\nJohn,Doe,john@example.com,555-0100,Acme Inc,CEO,Website,VIP\n";
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = "crm-import-template.csv"; a.click();
                  }}>Download CSV template</button>
                </div>
              </div>
            )}

            {/* Step 2: Structure Detection */}
            {step === "structure" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/15 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
                    <p className="text-xs font-semibold text-foreground">File parsed successfully</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-background/50 p-2">
                      <p className="text-lg font-bold text-foreground">{rows.length}</p>
                      <p className="text-[10px] text-muted-foreground">Rows</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-2">
                      <p className="text-lg font-bold text-foreground">{headers.length}</p>
                      <p className="text-[10px] text-muted-foreground">Columns</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-2">
                      <p className="text-lg font-bold text-primary">{autoMappedCount}</p>
                      <p className="text-[10px] text-muted-foreground">Auto-mapped</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Preview (first 3 rows)</p>
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-muted/30">
                          {headers.map((h, i) => <th key={i} className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 3).map((row, ri) => (
                          <tr key={ri} className="border-t border-border">
                            {row.map((cell, ci) => <td key={ci} className="px-2 py-1 text-muted-foreground whitespace-nowrap max-w-[120px] truncate">{cell || "—"}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <SitaButton variant="ghost" size="sm" onClick={() => { setStep("upload"); setHeaders([]); setRows([]); }}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Re-upload
                  </SitaButton>
                  <SitaButton variant="primary" size="sm" onClick={() => setStep("mapping")}>
                    Continue to Mapping <ArrowRight className="h-3.5 w-3.5" />
                  </SitaButton>
                </div>
              </div>
            )}

            {/* Step 3: Field Mapping */}
            {step === "mapping" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{fileName} — {headers.length} columns</p>
                  {!hasName && (
                    <span className="text-[10px] text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Map at least a name column
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {headers.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{h}</p>
                        <p className="text-[10px] text-muted-foreground truncate">e.g. "{rows[0]?.[i] || "—"}"</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="relative">
                        <select
                          value={mapping[i] || "skip"}
                          onChange={(e) => setMapping(prev => ({ ...prev, [i]: e.target.value }))}
                          className={`appearance-none rounded-lg border px-3 py-1.5 pr-7 text-xs font-medium cursor-pointer bg-background ${
                            mapping[i] === "skip" ? "border-border text-muted-foreground" : "border-primary/30 bg-primary/5 text-primary"
                          }`}
                        >
                          {CRM_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>

                {duplicateFields.length > 0 && (
                  <p className="text-[10px] text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Duplicate mapping: {duplicateFields.join(", ")}
                  </p>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <SitaButton variant="ghost" size="sm" onClick={() => setStep("structure")}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </SitaButton>
                  <SitaButton variant="primary" size="sm" onClick={runValidation} disabled={!hasName || duplicateFields.length > 0}>
                    Validate <ArrowRight className="h-3.5 w-3.5" />
                  </SitaButton>
                </div>
              </div>
            )}

            {/* Step 4: Validation */}
            {step === "validation" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/15 p-3 text-center">
                    <p className="text-lg font-bold text-[hsl(var(--trust-safe))]">{rows.length - errorCount}</p>
                    <p className="text-[10px] text-muted-foreground">Valid rows</p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${errorCount > 0 ? "bg-destructive/5 border border-destructive/15" : "bg-muted/30 border border-border"}`}>
                    <p className={`text-lg font-bold ${errorCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>{errorCount}</p>
                    <p className="text-[10px] text-muted-foreground">Errors</p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${warningCount > 0 ? "bg-yellow-500/5 border border-yellow-500/15" : "bg-muted/30 border border-border"}`}>
                    <p className={`text-lg font-bold ${warningCount > 0 ? "text-yellow-500" : "text-muted-foreground"}`}>{warningCount}</p>
                    <p className="text-[10px] text-muted-foreground">Warnings</p>
                  </div>
                </div>

                {validationIssues.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {validationIssues.slice(0, 20).map((issue, i) => (
                      <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
                        issue.severity === "error" ? "bg-destructive/5 text-destructive" : "bg-yellow-500/5 text-yellow-600"
                      }`}>
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Row {issue.row + 1}: {issue.message}</span>
                      </div>
                    ))}
                    {validationIssues.length > 20 && (
                      <p className="text-[10px] text-muted-foreground text-center">+{validationIssues.length - 20} more issues</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4 gap-2">
                    <CheckCircle className="h-8 w-8 text-[hsl(var(--trust-safe))]" />
                    <p className="text-sm font-medium text-foreground">All rows pass validation</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <SitaButton variant="ghost" size="sm" onClick={() => setStep("mapping")}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Fix Mapping
                  </SitaButton>
                  <SitaButton variant="primary" size="sm" onClick={runDedupCheck}>
                    Check Duplicates <ArrowRight className="h-3.5 w-3.5" />
                  </SitaButton>
                </div>
              </div>
            )}

            {/* Step 5: Deduplication */}
            {step === "dedup" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Duplicate Strategy</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: "skip_existing" as DedupStrategy, label: "Skip Duplicates", desc: "Don't import rows that match existing contacts" },
                      { key: "update_existing" as DedupStrategy, label: "Update Existing", desc: "Overwrite existing contact fields with import data" },
                      { key: "create_all" as DedupStrategy, label: "Create All", desc: "Import everything, even if duplicates exist" },
                      { key: "manual" as DedupStrategy, label: "Manual Review", desc: "Review each duplicate individually" },
                    ]).map(s => (
                      <button
                        key={s.key}
                        onClick={() => {
                          setDedupStrategy(s.key);
                          setDuplicates(prev => prev.map(d => ({
                            ...d,
                            action: s.key === "create_all" ? "create" : s.key === "update_existing" ? "update" : "skip",
                          })));
                        }}
                        className={`rounded-lg border p-2.5 text-left transition-all ${
                          dedupStrategy === s.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {duplicates.length > 0 ? (
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Merge className="h-4 w-4 text-yellow-500" />
                      <p className="text-xs font-semibold text-foreground">{duplicates.length} potential duplicates found</p>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1.5">
                      {duplicates.slice(0, 10).map((d, i) => (
                        <div key={i} className="flex items-center justify-between rounded bg-muted/20 px-2 py-1 text-[11px]">
                          <span className="text-foreground">{d.importName || d.importEmail}</span>
                          <span className="text-muted-foreground">↔ {d.existingName}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            d.action === "skip" ? "bg-muted text-muted-foreground" : d.action === "update" ? "bg-primary/10 text-primary" : "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]"
                          }`}>{d.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4 gap-2">
                    <Shield className="h-8 w-8 text-[hsl(var(--trust-safe))]" />
                    <p className="text-sm font-medium text-foreground">No duplicates detected</p>
                    <p className="text-xs text-muted-foreground">All rows appear to be new contacts</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <SitaButton variant="ghost" size="sm" onClick={() => setStep("validation")}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </SitaButton>
                  <SitaButton variant="primary" size="sm" onClick={() => setStep("review")}>
                    Review Import <ArrowRight className="h-3.5 w-3.5" />
                  </SitaButton>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {step === "review" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground">Import Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between bg-muted/20 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground">Total rows</span>
                      <span className="font-semibold text-foreground">{rows.length}</span>
                    </div>
                    <div className="flex justify-between bg-muted/20 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground">Will create</span>
                      <span className="font-semibold text-[hsl(var(--trust-safe))]">{rows.length - duplicates.filter(d => d.action === "skip").length - errorCount}</span>
                    </div>
                    <div className="flex justify-between bg-muted/20 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground">Will update</span>
                      <span className="font-semibold text-primary">{duplicates.filter(d => d.action === "update").length}</span>
                    </div>
                    <div className="flex justify-between bg-muted/20 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground">Will skip</span>
                      <span className="font-semibold text-muted-foreground">{duplicates.filter(d => d.action === "skip").length + errorCount}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Field Mappings:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(mapping).filter(([, v]) => v !== "skip").map(([idx, field]) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {headers[parseInt(idx)]} → {CRM_FIELDS.find(f => f.key === field)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/15 px-3 py-2">
                  <Shield className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">Import is reversible</span> — imported contacts are tagged for easy identification
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <SitaButton variant="ghost" size="sm" onClick={() => setStep("dedup")}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </SitaButton>
                  <SitaButton variant="primary" size="sm" onClick={handleImport} disabled={importing}>
                    {importing ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing...</>
                    ) : (
                      <><CheckCircle className="h-3.5 w-3.5" /> Import Now</>
                    )}
                  </SitaButton>
                </div>
              </div>
            )}

            {/* Step 7: Summary */}
            {step === "summary" && importResult && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-6 gap-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--trust-safe))]/10 border border-[hsl(var(--trust-safe))]/20">
                      <CheckCircle className="h-8 w-8 text-[hsl(var(--trust-safe))]" />
                    </div>
                  </motion.div>
                  <p className="text-base font-bold text-foreground">Import Complete!</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Created", value: importResult.created, color: "text-[hsl(var(--trust-safe))]" },
                    { label: "Updated", value: importResult.updated, color: "text-primary" },
                    { label: "Skipped", value: importResult.skipped, color: "text-muted-foreground" },
                    { label: "Errors", value: importResult.errors, color: "text-destructive" },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg bg-muted/20 p-3 text-center">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <SitaButton variant="primary" size="sm" onClick={onClose}>
                    <Eye className="h-3.5 w-3.5" /> View Contacts
                  </SitaButton>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CRMImportWizard;
