import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Shield, FileArchive, Clock, CheckCircle, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DEMO_EXPORTABLE_TABLES, DEMO_PAST_EXPORTS } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";



export default function SovereignExportPage() {
  const { user, isDemo } = useAuth();
  const [selectedTables, setSelectedTables] = useState<string[]>((isDemoMode ? DEMO_EXPORTABLE_TABLES : [] as typeof DEMO_EXPORTABLE_TABLES).map(t => t.name));
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleTable = (name: string) => {
    setSelectedTables(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  const handleExport = async (format: "json" | "csv") => {
    if (isDemo) {
      toast.info("Export is disabled in demo mode");
      return;
    }
    setExporting(true);
    setExportProgress(10);
    try {
      const interval = setInterval(() => {
        setExportProgress(p => Math.min(p + 15, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke("gdpr-export", {
        method: "POST",
        body: { format, tables: selectedTables },
      });

      clearInterval(interval);
      setExportProgress(100);

      if (error) throw error;

      // Download the response as a file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sita-export-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const handleDeleteRequest = async () => {
    if (isDemo) {
      toast.info("Deletion is disabled in demo mode");
      return;
    }
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gdpr-delete", {
        method: "POST",
        body: {},
      });
      if (error) throw error;
      toast.success("Deletion request submitted. Processing within 30 days per GDPR.");
      setConfirmDelete(false);
    } catch (e: any) {
      toast.error(e.message || "Deletion request failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileArchive className="h-6 w-6 text-primary" /> Sovereign Data Export</h1>
        <p className="text-muted-foreground text-sm mt-1">Your data belongs to you. Export everything, anytime. GDPR compliant.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-emerald-500" /><div><p className="text-xs text-muted-foreground">Compliance</p><p className="text-sm font-bold text-emerald-500">GDPR Ready</p></div>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-blue-500" /><div><p className="text-xs text-muted-foreground">Last Export</p><p className="text-sm font-bold text-foreground">Mar 28, 2026</p></div>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
          <Download className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-muted-foreground">Total Data</p><p className="text-sm font-bold text-foreground">697 KB</p></div>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Select Data to Export</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTables(
              selectedTables.length === (isDemoMode ? DEMO_EXPORTABLE_TABLES : [] as typeof DEMO_EXPORTABLE_TABLES).length ? [] : (isDemoMode ? DEMO_EXPORTABLE_TABLES : [] as typeof DEMO_EXPORTABLE_TABLES).map(t => t.name)
            )}>{selectedTables.length === (isDemoMode ? DEMO_EXPORTABLE_TABLES : [] as typeof DEMO_EXPORTABLE_TABLES).length ? "Deselect All" : "Select All"}</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(isDemoMode ? DEMO_EXPORTABLE_TABLES : [] as typeof DEMO_EXPORTABLE_TABLES).map(table => (
              <div key={table.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedTables.includes(table.name)} onCheckedChange={() => toggleTable(table.name)} />
                  <div><p className="text-sm text-foreground">{table.name}</p><p className="text-xs text-muted-foreground">{table.rows} records · {table.size}</p></div>
                </div>
              </div>
            ))}
            <div className="pt-4 flex gap-2">
              <Button className="gap-2 flex-1" disabled={selectedTables.length === 0 || exporting} onClick={() => handleExport("json")}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export as JSON
              </Button>
              <Button variant="outline" className="gap-2" disabled={selectedTables.length === 0 || exporting} onClick={() => handleExport("csv")}>CSV</Button>
            </div>
            {exporting && <div className="pt-2"><Progress value={exportProgress} className="h-2" /><p className="text-xs text-muted-foreground mt-1">Extracting data... {exportProgress}%</p></div>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-sm">Export History</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(isDemoMode ? DEMO_PAST_EXPORTS : [] as typeof DEMO_PAST_EXPORTS).map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <div><p className="text-sm text-foreground">{exp.date}</p><p className="text-xs text-muted-foreground">{exp.format} · {exp.size}</p></div>
                  </div>
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 border-destructive/20">
            <CardHeader><CardTitle className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Data Deletion</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Request permanent deletion of all your data. This action is irreversible and will be processed within 30 days per GDPR requirements.</p>
              {confirmDelete && (
                <p className="text-xs text-destructive font-semibold mb-2">⚠️ Are you sure? Click again to confirm permanent deletion.</p>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                disabled={deleting}
                onClick={handleDeleteRequest}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {confirmDelete ? "Confirm Deletion" : "Request Deletion"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
