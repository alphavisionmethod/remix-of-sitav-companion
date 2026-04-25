import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PbWorkspace } from "./hooks/usePbWorkspaces";

interface WorkspaceCardProps {
  workspace: PbWorkspace;
  onOpen: (id: string) => void;
}

const KIND_COLORS: Record<string, string> = {
  business: "border-l-primary",
  personal: "border-l-accent",
  skill: "border-l-secondary",
  writing: "border-l-muted",
  finance: "border-l-primary",
  custom: "border-l-border",
};

export function WorkspaceCard({ workspace, onOpen }: WorkspaceCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(workspace.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(workspace.id);
        }
      }}
      className={cn(
        "cursor-pointer border-l-4 transition-shadow hover:shadow-md",
        KIND_COLORS[workspace.kind] ?? "border-l-border",
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-lg bg-muted p-2">
          <FolderKanban className="h-4 w-4 text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{workspace.name}</h3>
            <Badge variant="outline" className="text-[10px] capitalize">
              {workspace.kind}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">
            Default mode: {workspace.default_mode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}