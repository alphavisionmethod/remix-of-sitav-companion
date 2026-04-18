import React from "react";
import { Folder, Home, Trash2, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExplorerFolder } from "@/data/repositories/file-explorer-service";

interface Props {
  folders: ExplorerFolder[];
  currentFolderId: string | null;
  onNavigate: (folderId: string | null) => void;
  onTrash: () => void;
  showingTrash: boolean;
}

export function FileExplorerSidebar({
  folders, currentFolderId, onNavigate, onTrash, showingTrash,
}: Props) {
  const rootFolders = folders.filter((f) => !f.parent_id);

  return (
    <div className="w-48 shrink-0 border-r border-border pr-3 space-y-1 hidden md:block">
      <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">
        Quick Access
      </p>

      <SidebarBtn
        icon={Home}
        label="Home"
        active={currentFolderId === null && !showingTrash}
        onClick={() => onNavigate(null)}
      />

      {rootFolders.map((f) => (
        <SidebarBtn
          key={f.id}
          icon={Folder}
          label={f.name}
          active={currentFolderId === f.id}
          onClick={() => onNavigate(f.id)}
        />
      ))}

      <div className="border-t border-border my-2" />

      <SidebarBtn icon={Trash2} label="Trash" active={showingTrash} onClick={onTrash} />
    </div>
  );
}

function SidebarBtn({
  icon: Icon, label, active, onClick,
}: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors",
        active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
