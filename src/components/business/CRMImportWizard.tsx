import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SitaButton } from "@/components/sita/SitaCard";
import {
  Upload, FileSpreadsheet, CheckCircle, ArrowRight, ArrowLeft, AlertTriangle,
  Loader2, X, ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Papa from "papaparse";

interface Props {
  onClose: () => void;
}

type Step = "upload" | "mapping" | "preview";

const CRM_FIELDS = [
  { key: "name", label: "Full Name", required: true },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "company", label: "Company", required: false },
  { key: "source", label: "Lead Source", required: false },
  { key: "status", label: "Status", required: false },
  { key: "notes", label: "Notes", required: false },
  { key: "value", label: "Deal Value", required: false },
  { key: "skip", label: "— Skip this column —", required: false },
];

const SIMILARITY_MAP: Record<string, string> = {
  "name": "name", "full name": "name", "fullname": "name", "contact name": "name",
  "first name": "name", "firstname": "name", "last name": "name", "lastname": "name",
  "email": "email", "e-mail": "email", "email address": "email", "mail": "email",
  "phone": "phone", "telephone": "phone", "phone number": "phone", "mobile": "phone", "cell": "phone",
  "company": "company", "organization": "company", "org": "company", "business": "company", "company name": "company",
  "source": "source", "lead source": "source", "channel": "source", "origin": "source",
  "status": "status", "lead status": "status", "stage": "status",
  "notes": "notes", "note": "notes", "comment": "notes", "comments": "notes", "description": "notes",
  "value": "value", "deal value": "value", "amount": "value", "revenue": "value", "price": "value",
};

function autoMapColumn(header: string): string {
  const normalized = header.toLowerCase().trim();
  return SIMILARITY_MAP[normalized] || "skip";
}

const CRMImportWizard = ({ onClose }: Props) => {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      toast.error("Excel files (.xlsx) will be supported soon. Please export as CSV for now.");
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length < 2) {
          toast.error("File appears to be empty");
          return;
        }
        const fileHeaders = data[0];
        const fileRows = data.slice(1).filter(r => r.some(c => c?.trim()));
        setHeaders(fileHeaders);
        setRows(fileRows);

        // Auto-map columns
        const autoMap: Record<number, string> = {};
        fileHeaders.forEach((h, i) => {
          autoMap[i] = autoMapColumn(h);
        });
        setMapping(autoMap);
        setStep("mapping");
      },
      error: () => toast.error("Failed to parse file"),
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const mappedFields = Object.values(mapping).filter(v => v !== "skip");
  const hasName = mappedFields.includes("name");
  const duplicateFields = mappedFields.filter((v, i, arr) => v !== "skip" && arr.indexOf(v) !== i);

  const handleImport = async () => {
    setImporting(true);
    // Simulate import
    await new Promise(r => setTimeout(r, 2000));
    setImporting(false);
    toast.success(`${rows.length} records imported successfully!`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Contacts
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Drag and drop a CSV file or click to browse"}
            {step === "mapping" && "Map your columns to CRM fields"}
            {step === "preview" && "Review before importing"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {["Upload", "Map Columns", "Import"].map((label, i) => {
            const stepKeys: Step[] = ["upload", "mapping", "preview"];
            const isActive = stepKeys.indexOf(step) >= i;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>{i + 1}</div>
                <span className={`text-[11px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-px ${isActive ? "bg-primary/40" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/30"
            }`}
          >
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFileSelect} />
            <motion.div animate={dragOver ? { scale: 1.1 } : { scale: 1 }}>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            </motion.div>
            <p className="text-sm font-medium text-foreground">Drop your file here</p>
            <p className="text-xs text-muted-foreground mt-1">CSV, TSV — up to 10,000 rows</p>
            <SitaButton variant="secondary" size="sm" className="mt-4">Browse Files</SitaButton>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === "mapping" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{fileName} — {rows.length} rows, {headers.length} columns</p>
              {!hasName && (
                <span className="text-[10px] text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Map a "Name" column
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{h}</p>
                    <p className="text-[10px] text-muted-foreground truncate">e.g. "{rows[0]?.[i] || "—"}"</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="relative">
                    <select
                      value={mapping[i] || "skip"}
                      onChange={(e) => setMapping(prev => ({ ...prev, [i]: e.target.value }))}
                      className={`appearance-none rounded-lg border px-3 py-1.5 pr-7 text-xs font-medium transition-all cursor-pointer ${
                        mapping[i] === "skip"
                          ? "border-border bg-secondary/40 text-muted-foreground"
                          : mapping[i] === "name"
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]"
                      }`}
                    >
                      {CRM_FIELDS.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
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

            <div className="flex gap-2 justify-end pt-2">
              <SitaButton variant="ghost" size="sm" onClick={() => setStep("upload")}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </SitaButton>
              <SitaButton
                variant="primary"
                size="sm"
                onClick={() => setStep("preview")}
                disabled={!hasName || duplicateFields.length > 0}
              >
                Preview Import <ArrowRight className="h-3.5 w-3.5" />
              </SitaButton>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Import */}
        {step === "preview" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary/40">
                      {headers.map((h, i) => mapping[i] !== "skip" && (
                        <th key={i} className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">
                          {CRM_FIELDS.find(f => f.key === mapping[i])?.label || h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, ri) => (
                      <tr key={ri} className="border-t border-border">
                        {headers.map((_, ci) => mapping[ci] !== "skip" && (
                          <td key={ci} className="px-3 py-2 text-muted-foreground whitespace-nowrap max-w-[150px] truncate">
                            {row[ci] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <span className="text-xs text-muted-foreground">Total records to import</span>
              <span className="text-sm font-semibold text-foreground">{rows.length}</span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <SitaButton variant="ghost" size="sm" onClick={() => setStep("mapping")}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </SitaButton>
              <SitaButton variant="primary" size="sm" onClick={handleImport} disabled={importing}>
                {importing ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing...</>
                ) : (
                  <><CheckCircle className="h-3.5 w-3.5" /> Import {rows.length} Records</>
                )}
              </SitaButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CRMImportWizard;
