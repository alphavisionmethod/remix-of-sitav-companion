import { useCallback, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseCsv, suggestMapping } from "@/lib/imports/csv-parser";
import { IMPORT_TARGETS, getTarget, type ImportTarget } from "@/lib/imports/import-targets";

interface RowPreview {
  index: number;
  payload: Record<string, unknown>;
  errors: string[];
}

/**
 * Self-contained CSV → table importer used inside the Imports & Exports
 * center. The flow is: pick target → drop CSV → review auto-mapped columns
 * → preview validation → commit insert. All inserts go through the standard
 * supabase client, so RLS enforces row scoping (auth.uid() = user_id).
 */
export function CsvImportPanel() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetId, setTargetId] = useState<string>(IMPORT_TARGETS[0].id);
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; failed: number } | null>(null);

  const target = useMemo<ImportTarget>(() => getTarget(targetId)!, [targetId]);

  const onFile = useCallback(
    async (file: File) => {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("CSV must be under 5MB");
        return;
      }
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0) {
        toast.error("Could not read any columns from this CSV");
        return;
      }
      setFileName(file.name);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);
      setMapping(suggestMapping(parsed.headers, target.fields));
      setResult(null);
    },
    [target],
  );

  const handleTargetChange = (id: string) => {
    setTargetId(id);
    const next = getTarget(id);
    if (next && headers.length) {
      setMapping(suggestMapping(headers, next.fields));
    } else {
      setMapping({});
    }
    setResult(null);
  };

  const previews = useMemo<RowPreview[]>(() => {
    if (!user || rawRows.length === 0) return [];
    return rawRows.slice(0, 50).map((row, i) => {
      const { payload, errors } = target.coerce(row, mapping, user.id);
      return { index: i + 1, payload, errors };
    });
  }, [rawRows, mapping, target, user]);

  const validCount = previews.filter((r) => r.errors.length === 0).length;
  const invalidCount = previews.length - validCount;

  const missingRequired = target.fields
    .filter((f) => f.required)
    .filter((f) => !mapping[f.key]);

  const reset = () => {
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runImport = async () => {
    if (!user) {
      toast.error("Please sign in to import data");
      return;
    }
    if (missingRequired.length > 0) {
      toast.error(`Map required column(s): ${missingRequired.map((f) => f.label).join(", ")}`);
      return;
    }
    // Re-validate full set, not just the 50-row preview window.
    const allCoerced = rawRows.map((row) => target.coerce(row, mapping, user.id));
    const valid = allCoerced.filter((r) => r.errors.length === 0).map((r) => r.payload);
    const failed = allCoerced.length - valid.length;

    if (valid.length === 0) {
      toast.error("No rows pass validation — fix the mapping or CSV first");
      return;
    }

    setImporting(true);
    try {
      // Chunk to keep request size sane.
      const CHUNK = 200;
      let inserted = 0;
      for (let i = 0; i < valid.length; i += CHUNK) {
        const chunk = valid.slice(i, i + CHUNK);
        const { error } = await (supabase as any).from(target.table).insert(chunk);
        if (error) {
          toast.error(`Insert failed at row ${i + 1}: ${error.message}`);
          setResult({ inserted, failed: failed + (valid.length - inserted) });
          setImporting(false);
          return;
        }
        inserted += chunk.length;
      }
      setResult({ inserted, failed });
      toast.success(`Imported ${inserted} row${inserted === 1 ? "" : "s"} into ${target.label}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <SitaCard className="p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <SitaCardTitle className="text-sm">CSV importer</SitaCardTitle>
          <p className="text-[11px] text-muted-foreground mt-1">
            Upload a CSV, map columns, and write rows into your own RLS-scoped tables.
          </p>
        </div>
        <div className="w-56">
          <Select value={targetId} onValueChange={handleTargetChange}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPORT_TARGETS.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mb-4">{target.description}</p>

      {!fileName ? (
        <div
          className="border-2 border-dashed border-border/30 rounded-xl p-8 text-center hover:border-border/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
        >
          <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-xs font-medium mb-1">Drop a CSV or click to browse</p>
          <p className="text-[10px] text-muted-foreground">UTF-8, comma-separated, up to 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-card/30 border border-border/30">
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{fileName}</div>
                <div className="text-[10px] text-muted-foreground">
                  {rawRows.length} rows · {headers.length} columns
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={reset} className="h-7 px-2">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div>
            <SitaCardTitle className="text-[11px] mb-2">Map columns</SitaCardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {target.fields.map((field) => (
                <div key={field.key} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium flex items-center gap-1">
                      {field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </div>
                    {field.help && (
                      <div className="text-[9px] text-muted-foreground truncate">{field.help}</div>
                    )}
                  </div>
                  <div className="w-40">
                    <Select
                      value={mapping[field.key] || "__none__"}
                      onValueChange={(v) =>
                        setMapping((m) => ({ ...m, [field.key]: v === "__none__" ? "" : v }))
                      }
                    >
                      <SelectTrigger className="h-8 text-[11px]">
                        <SelectValue placeholder="— skip —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" className="text-[11px]">
                          — skip —
                        </SelectItem>
                        {headers.map((h) => (
                          <SelectItem key={h} value={h} className="text-[11px]">
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {missingRequired.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Required columns not mapped: {missingRequired.map((f) => f.label).join(", ")}
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px]">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {validCount} valid
            </Badge>
            {invalidCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> {invalidCount} blocked
              </Badge>
            )}
            <span className="text-muted-foreground">
              {previews.length < rawRows.length
                ? `Previewing first ${previews.length} of ${rawRows.length}`
                : `${previews.length} rows previewed`}
            </span>
          </div>

          {previews.some((r) => r.errors.length > 0) && (
            <div className="max-h-32 overflow-auto rounded-md border border-border/30 p-2 space-y-1">
              {previews
                .filter((r) => r.errors.length > 0)
                .slice(0, 10)
                .map((r) => (
                  <div key={r.index} className="text-[10px] text-muted-foreground">
                    <span className="text-amber-400">Row {r.index}:</span> {r.errors.join("; ")}
                  </div>
                ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={reset} disabled={importing}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={runImport}
              disabled={importing || missingRequired.length > 0 || validCount === 0}
              className="gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {importing
                ? "Importing…"
                : `Import ${validCount} row${validCount === 1 ? "" : "s"}`}
            </Button>
          </div>

          {result && (
            <div
              className={cn(
                "rounded-md p-3 text-xs",
                result.failed > 0 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400",
              )}
            >
              Imported {result.inserted} row{result.inserted === 1 ? "" : "s"} into {target.label}
              {result.failed > 0 ? ` · ${result.failed} skipped` : ""}.
            </div>
          )}
        </div>
      )}
    </SitaCard>
  );
}