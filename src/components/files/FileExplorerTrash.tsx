import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, File } from "lucide-react";
import type { ExplorerFile } from "@/data/repositories/file-explorer-service";
import { useTrash, useRestoreFile, usePermanentDeleteFile, useEmptyTrash } from "@/hooks/use-file-explorer";

export function FileExplorerTrash() {
  const { data: files, isLoading } = useTrash();
  const restore = useRestoreFile();
  const permDelete = usePermanentDeleteFile();
  const empty = useEmptyTrash();

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  const items = files || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""} in trash</p>
        {items.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => empty.mutate()} disabled={empty.isPending}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Empty Trash
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Trash2 className="h-10 w-10 opacity-20 mb-2" />
          <p className="text-sm">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((f) => (
            <div key={f.id} className="flex items-center gap-3 px-3 py-2 rounded-md border border-border/40 bg-card">
              <File className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm flex-1 truncate">{f.name}</span>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => restore.mutate(f.id)}
                title="Restore"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                onClick={() => permDelete.mutate(f.id)}
                title="Delete permanently"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
