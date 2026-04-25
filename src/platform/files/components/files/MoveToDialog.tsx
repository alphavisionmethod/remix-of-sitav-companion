import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAllFolders, useMoveFile } from "@/hooks/use-file-explorer";
import { Folder, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
}

export function MoveToDialog({ open, onOpenChange, fileId }: Props) {
  const { data: folders } = useAllFolders();
  const move = useMoveFile();
  const [selected, setSelected] = useState<string | null>(null);

  const handleMove = () => {
    move.mutate({ id: fileId, folderId: selected }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
        </DialogHeader>
        <div className="max-h-60 overflow-y-auto space-y-1">
          <button
            onClick={() => setSelected(null)}
            className={cn(
              "flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent",
              selected === null && "bg-accent text-accent-foreground"
            )}
          >
            <Home className="h-4 w-4" /> Root
          </button>
          {(folders || []).map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={cn(
                "flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-accent",
                selected === f.id && "bg-accent text-accent-foreground"
              )}
            >
              <Folder className="h-4 w-4" /> {f.name}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleMove} disabled={move.isPending}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
