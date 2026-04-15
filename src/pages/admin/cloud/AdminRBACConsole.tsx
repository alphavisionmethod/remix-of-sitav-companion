import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, ChevronRight, Check, X } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { PERMISSION_CATEGORIES, type PermissionCategory } from "@/lib/platform-plane";

interface RolePermRow {
  id: string;
  role_key: string;
  permission: string;
  description: string;
  granted: boolean;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  "super-admin": { label: "Super Admin", color: "bg-red-500/20 text-red-400" },
  "platform-admin": { label: "Platform Admin", color: "bg-purple-500/20 text-purple-400" },
  "storage-admin": { label: "Storage Admin", color: "bg-amber-500/20 text-amber-400" },
  "security-admin": { label: "Security Admin", color: "bg-blue-500/20 text-blue-400" },
  "support-admin": { label: "Support Admin", color: "bg-green-500/20 text-green-400" },
  "billing-admin": { label: "Billing Admin", color: "bg-cyan-500/20 text-cyan-400" },
  "read-only-auditor": { label: "Read-Only Auditor", color: "bg-gray-500/20 text-gray-400" },
};

export function AdminRBACConsole() {
  const [permissions, setPermissions] = useState<RolePermRow[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("super-admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await fromTable("admin_role_permissions").select("*").order("role_key");
      setPermissions(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const roles = Object.keys(ROLE_LABELS);
  const rolePerms = permissions.filter((p) => p.role_key === selectedRole);
  const categories = Object.keys(PERMISSION_CATEGORIES) as PermissionCategory[];

  if (loading) {
    return <div className="h-64 bg-muted/30 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Admin RBAC Console</h2>
        <Badge variant="outline" className="text-[10px]">{roles.length} roles</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Role List */}
        <div className="space-y-1">
          {roles.map((role) => {
            const info = ROLE_LABELS[role];
            const count = permissions.filter((p) => p.role_key === role && p.granted).length;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-xs transition-all ${
                  selectedRole === role
                    ? "bg-primary/10 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{info.label}</span>
                <Badge variant="secondary" className="ml-auto text-[9px]">{count}</Badge>
                {selectedRole === role && <ChevronRight className="h-3 w-3 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Permission Matrix */}
        <div className="md:col-span-3 space-y-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Badge className={`text-[10px] ${ROLE_LABELS[selectedRole]?.color}`}>
                  {ROLE_LABELS[selectedRole]?.label}
                </Badge>
                <span className="text-muted-foreground">— {rolePerms.length} permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const catPerms = PERMISSION_CATEGORIES[cat];
                  return (
                    <div key={cat} className="space-y-1.5">
                      <h4 className="text-xs font-medium text-foreground capitalize flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {cat}
                      </h4>
                      {catPerms.map((perm) => {
                        const hasIt = rolePerms.some((rp) => rp.permission === perm && rp.granted);
                        return (
                          <div key={perm} className="flex items-center gap-2 px-2 py-1 rounded text-[11px]">
                            {hasIt ? (
                              <Check className="h-3 w-3 text-green-400 shrink-0" />
                            ) : (
                              <X className="h-3 w-3 text-red-400/50 shrink-0" />
                            )}
                            <span className={hasIt ? "text-foreground" : "text-muted-foreground/50"}>
                              {perm.split(".")[1]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
