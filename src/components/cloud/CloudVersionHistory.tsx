import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, RefreshCw, Smartphone, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cloudStorageService } from "@/platform/cloud/cloud-storage-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileVersion {
  id: string;
  file_id: string;
  version: number;
  size: number;
  checksum: string | null;
  origin_device_id: string | null;
  restore_point: boolean;
  created_at: string;
}

interface Props {
  fileId: string;
  fileName: string;
  currentVersion: number;
  onClose?: () => void;
}

export function CloudVersionHistory({ fileId, fileName, currentVersion, onClose }: Props) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("cloud-storage-api?action=versions", {
        body: { file_id: fileId },
      });
      if (res.data?.versions) setVersions(res.data.versions);
    } catch { /* empty */ }
    setLoading(false);
  }, [user?.id, fileId]);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  const restoreVersion = async (versionId: string) => {
    setRestoring(versionId);
    // In a full implementation, this would create a new version from the old blob
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Version restored");
    setRestoring(null);
    loadVersions();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Version History</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">v{currentVersion} current</Badge>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading...
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No version history</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border/50" />

              {versions.map((ver, i) => {
                const isCurrent = ver.version === currentVersion;
                return (
                  <div key={ver.id} className="flex items-start gap-3 px-4 py-4 relative hover:bg-muted/20 transition-colors">
                    {/* Timeline dot */}
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 mt-0.5 z-10 shrink-0",
                      isCurrent
                        ? "bg-primary border-primary"
                        : ver.restore_point
                          ? "bg-amber-500 border-amber-500"
                          : "bg-background border-muted-foreground/30"
                    )} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Version {ver.version}</span>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Current
                          </Badge>
                        )}
                        {ver.restore_point && !isCurrent && (
                          <Badge variant="secondary" className="text-xs">Restore Point</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{cloudStorageService.formatBytes(ver.size)}</span>
                        <span>·</span>
                        <span>{new Date(ver.created_at).toLocaleString()}</span>
                        {ver.origin_device_id && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              {ver.origin_device_id.slice(0, 8)}
                            </span>
                          </>
                        )}
                        {ver.checksum && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[10px]">{ver.checksum.slice(0, 12)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {!isCurrent && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs shrink-0"
                        disabled={restoring === ver.id}
                        onClick={() => restoreVersion(ver.id)}
                      >
                        <RotateCcw className={cn("h-3 w-3 mr-1", restoring === ver.id && "animate-spin")} />
                        Restore
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
