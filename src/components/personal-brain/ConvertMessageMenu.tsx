import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, FolderPlus, MoreHorizontal } from "lucide-react";

interface ConvertMessageMenuProps {
  content: string;
  chatTitle?: string;
}

function summarize(content: string, max = 120): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

export function ConvertMessageMenu({ content, chatTitle }: ConvertMessageMenuProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const safeNotify = (title: string, description?: string) => {
    toast({ title, description });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      safeNotify("Copied to clipboard");
    } catch {
      safeNotify("Couldn't copy", "Clipboard unavailable");
    }
  };

  const convertToProject = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const name = chatTitle ? `Project · ${chatTitle}` : `Project · ${summarize(content, 40)}`;
      const { data, error } = await supabase
        .from("pb_workspaces")
        .insert({
          user_id: user.id,
          name,
          kind: "custom",
          default_mode: "build",
          custom_instructions: content.slice(0, 4000),
        })
        .select()
        .single();
      if (error) throw error;
      safeNotify("Project workspace created", "Opening it now…");
      navigate(`/personal-brain/w/${data.id}`);
    } catch (e) {
      safeNotify("Couldn't create project", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          disabled={busy}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-3.5 w-3.5" />
          Copy text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={convertToProject}>
          <FolderPlus className="h-3.5 w-3.5" />
          New project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}