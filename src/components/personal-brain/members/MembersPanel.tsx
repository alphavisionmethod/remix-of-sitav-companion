// Personal Brain — Phase 7 Members panel
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Trash2, UserPlus, Users, Copy, Check } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { usePbWorkspaceMembers, type PbWorkspaceRole } from "../hooks/usePbWorkspaceMembers";

const ROLE_COLOR: Record<PbWorkspaceRole, string> = {
  viewer: "bg-muted text-muted-foreground",
  editor: "bg-primary/15 text-primary",
  owner: "bg-accent/20 text-accent-foreground",
};

interface MembersPanelProps {
  workspaceId: string;
}

export function MembersPanel({ workspaceId }: MembersPanelProps) {
  const { members, loading, busy, invite, remove, updateRole } = usePbWorkspaceMembers(workspaceId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PbWorkspaceRole>("viewer");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!email.trim()) return;
    try {
      const res = await invite(email.trim(), role);
      const token = res?.member.invite_token;
      if (token) {
        const link = `${window.location.origin}/personal-brain/invite/${token}`;
        await navigator.clipboard.writeText(link).catch(() => {});
        toast.success("Invite created", { description: "Invite link copied to clipboard." });
      } else {
        toast.success("Invite sent");
      }
      setEmail("");
    } catch (e) {
      toast.error("Invite failed", { description: e instanceof Error ? e.message : "Unknown error" });
    }
  };

  const copyLink = async (token: string, id: string) => {
    const link = `${window.location.origin}/personal-brain/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Invite link copied");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Members & sharing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="invite@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleInvite()}
              className="pl-8"
            />
          </div>
          <Select value={role} onValueChange={(v) => setRole(v as PbWorkspaceRole)}>
            <SelectTrigger className="sm:w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => void handleInvite()} disabled={busy || !email}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Invite
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading members…</p>
        ) : members.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
            <Users className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">No members yet. Invite someone to collaborate.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40 rounded-lg border border-border/40">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-semibold uppercase text-primary">
                  {(m.member_email ?? "?").slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{m.member_email ?? "—"}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className={`text-[10px] ${ROLE_COLOR[m.role]}`}>{m.role}</Badge>
                    <span>·</span>
                    <span className="capitalize">{m.status}</span>
                  </div>
                </div>
                {m.status === "invited" && m.invite_token && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => void copyLink(m.invite_token!, m.id)}>
                    {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                )}
                <Select value={m.role} onValueChange={(v) => void updateRole(m.id, v as PbWorkspaceRole)}>
                  <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => void remove(m.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
