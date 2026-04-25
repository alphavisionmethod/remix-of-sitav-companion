import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatRow } from "./ChatRow";
import type { PbChat } from "./hooks/usePbChats";

interface ChatListProps {
  title?: string;
  chats: PbChat[];
  loading: boolean;
  onOpen: (id: string) => void;
  emptyMessage?: string;
  showWorkspaceBadge?: boolean;
}

export function ChatList({
  title = "Continue chats",
  chats,
  loading,
  onOpen,
  emptyMessage = "No chats yet. Start one from the dashboard.",
  showWorkspaceBadge = false,
}: ChatListProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <Badge variant="outline" className="text-[10px]">
            {chats.length}
          </Badge>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : chats.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-2">
            {chats.map((c) => (
              <ChatRow
                key={c.id}
                chat={c}
                onOpen={onOpen}
                showWorkspaceBadge={showWorkspaceBadge}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}