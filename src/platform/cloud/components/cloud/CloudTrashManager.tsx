import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, Clock, AlertTriangle, RefreshCw, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cloudStorageService } from "@/platform/cloud/cloud-storage-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TrashItem {
  id: string;
  object_type: string;
  object_id: string;
  original_name: string | null;
  original_path: string | null;
  size: number;
  deleted_at: string;
  purge_after: string;
}

export function CloudTrashManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("cloud-storage-api?action=trash", { body: {} });
      if (res.data?.items) setItems(res.data.items);
    } catch { /* empty */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadTrash(); }, [loadTrash]);

  const restoreItem = async (trashId: string) => {
    await supabase.functions.invoke("cloud-storage-api?action=restore", { body: { trash_id: trashId } });
    toast.success("File restored");
    loadTrash();
  };

  const purgeItem = async (trashId: string) => {
    await supabase.functions.invoke("cloud-storage-api?action=purge", { body: { trash_id: trashId } });
    toast.success("Permanently deleted");
    loadTrash();
  };

  const getDaysUntilPurge = (purgeAfter: string) => {
    const days = Math.ceil((new Date(purgeAfter).getTime() - Date.now()) / 86400000);
    return Math.max(0, days);
  };

  const totalTrashSize = items.reduce((s, i) => s + (i.size || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">Trash</p>
                <p className="text-xs text-muted-foreground">
                  {items.length} items · {cloudStorageService.formatBytes(totalTrashSize)}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={loadTrash} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Trash2 className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Trash is empty</p>
              <p className="text-xs mt-1">Deleted files will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {items.map(item => {
                const daysLeft = getDaysUntilPurge(item.purge_after);
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.original_name || "Unknown file"}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{cloudStorageService.formatBytes(item.size || 0)}</span>
                        <span>·</span>
                        <span>Deleted {new Date(item.deleted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={daysLeft <= 3 ? "destructive" : "secondary"}
                        className="text-xs flex items-center gap-1"
                      >
                        {daysLeft <= 3 && <AlertTriangle className="h-3 w-3" />}
                        <Clock className="h-3 w-3" />
                        {daysLeft}d
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => restoreItem(item.id)}>
                        <RotateCcw className="h-3 w-3 mr-1" /> Restore
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => purgeItem(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
