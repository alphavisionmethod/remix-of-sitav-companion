import { useAction } from "@/hooks/use-action";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Shield, Ban, UserCheck, ChevronRight } from "lucide-react";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface UserRecord {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  roles: string[];
}

export default function UserManagement() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: undefined,
      });
      if (error) throw error;
      return data as { users: UserRecord[]; total: number };
    },
    enabled: isAdmin,
  });

  const actionMutation = useAction("admin", "user.action");

  if (adminLoading) return <div className="p-6 text-center text-muted-foreground">Checking access...</div>;
  if (!isAdmin) return null;

  const users = data?.users || [];
  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground">{filtered.length} users total</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              ) : (
                filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.length > 0 ? u.roles.map(r => (
                          <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                        )) : (
                          <span className="text-xs text-muted-foreground">user</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.banned ? (
                        <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {u.banned ? (
                          <Button size="sm" variant="outline" onClick={() => actionMutation.mutate({ action: "unsuspend", target_user_id: u.id })}>
                            <UserCheck className="h-3 w-3 mr-1" /> Unsuspend
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => actionMutation.mutate({ action: "suspend", target_user_id: u.id })}>
                            <Ban className="h-3 w-3 mr-1" /> Suspend
                          </Button>
                        )}
                        {!u.roles.includes("admin") && (
                          <Button size="sm" variant="outline" onClick={() => actionMutation.mutate({ action: "assign_role", target_user_id: u.id, role: "admin" })}>
                            <Shield className="h-3 w-3 mr-1" /> Admin
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
