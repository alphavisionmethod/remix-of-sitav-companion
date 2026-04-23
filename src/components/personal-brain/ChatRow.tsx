import { MessageSquare, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PbChat } from "./hooks/usePbChats";

interface ChatRowProps {
  chat: PbChat;
  onOpen: (id: string) => void;
  showWorkspaceBadge?: boolean;
}

function formatRelative(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

export function ChatRow({ chat, onOpen, showWorkspaceBadge }: ChatRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(chat.id)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent/50",
      )}
    >
      <div className="rounded-md bg-muted p-1.5">
        <MessageSquare className="h-3.5 w-3.5 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {chat.pinned && <Pin className="h-3 w-3 text-primary" />}
          <span className="truncate text-sm font-medium text-foreground">{chat.title}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="capitalize">{chat.mode}</span>
          <span>·</span>
          <span>{chat.message_count} msg</span>
          <span>·</span>
          <span>{formatRelative(chat.last_message_at)}</span>
          {showWorkspaceBadge && chat.workspace_id && (
            <>
              <span>·</span>
              <Badge variant="outline" className="h-4 px-1 text-[9px]">
                workspace
              </Badge>
            </>
          )}
        </div>
      </div>
    </button>
  );
}