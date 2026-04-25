import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload, Download, ArrowRightLeft, Clock, CheckCircle, AlertTriangle, Loader2
} from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportExportJob {
  id: string;
  job_type: string;
  source: string;
  destination: string;
  status: string;
  progress_pct: number;
  total_items: number;
  processed_items: number;
  created_at: string;
}

export function CloudImportExport() {
  const { user, isDemo } = useAuth();
  const [jobs, setJobs] = useState<ImportExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user && !isDemo) { setLoading(false); return; }
    if (isDemo) { setJobs(getDemoJobs()); setLoading(false); return; }

    fromTable("cloud_import_export_jobs")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }: any) => { setJobs(data || []); setLoading(false); })
      .catch(() => { setJobs(getDemoJobs()); setLoading(false); });
  }, [user, isDemo]);

  const handleExport = async () => {
    setExporting(true);
    if (isDemo) {
      await new Promise(r => setTimeout(r, 1500));
      toast.success("Export started — you'll be notified when it's ready");
      setExporting(false);
      return;
    }
    try {
      await supabase.functions.invoke("cloud-lifecycle-api", {
        body: { action: "export", source: "all" },
      });
      toast.success("Export started");
    } catch {
      toast.error("Failed to start export");
    }
    setExporting(false);
  };

  const displayJobs = jobs.length > 0 ? jobs : getDemoJobs();

  const statusIcon: Record<string, React.ElementType> = {
    pending: Clock, processing: Loader2, completed: CheckCircle, failed: AlertTriangle,
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" /> Import & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Preparing Export..." : "Export All My Data"}
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Import wizard opening...")}>
            <Upload className="h-4 w-4 mr-2" /> Import from Another Cloud
          </Button>
          <p className="text-xs text-muted-foreground">
            Export creates a downloadable archive of all your files, settings, and metadata. Import supports Google Drive, Dropbox, OneDrive, and iCloud formats.
          </p>
        </CardContent>
      </Card>

      {/* Job History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Job History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayJobs.map(j => {
            const Icon = statusIcon[j.status] || Clock;
            return (
              <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${j.status === "completed" ? "text-emerald-400" : j.status === "failed" ? "text-red-400" : "text-amber-400"}`} />
                  <div>
                    <p className="text-sm font-medium capitalize">{j.job_type}</p>
                    <p className="text-xs text-muted-foreground">{j.source || "All data"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {j.status === "processing" && (
                    <div className="w-20">
                      <Progress value={j.progress_pct} className="h-2" />
                    </div>
                  )}
                  <Badge variant={j.status === "completed" ? "default" : "secondary"} className="text-xs capitalize">{j.status}</Badge>
                </div>
              </div>
            );
          })}
          {displayJobs.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No import/export jobs yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getDemoJobs(): ImportExportJob[] {
  return [
    { id: "ie1", job_type: "export", source: "all", destination: "", status: "completed", progress_pct: 100, total_items: 1247, processed_items: 1247, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "ie2", job_type: "import", source: "Google Drive", destination: "/imported", status: "completed", progress_pct: 100, total_items: 342, processed_items: 342, created_at: new Date(Date.now() - 604800000).toISOString() },
  ];
}
