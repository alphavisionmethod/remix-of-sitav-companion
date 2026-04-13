import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fromTable } from "@/lib/supabase-helpers";

interface Org {
  id: string;
  name: string;
  slug: string;
  role: string;
}

const STORAGE_KEY = "sita-active-org";

export function useCurrentOrg() {
  const { user, isDemo } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || isDemo) {
      setLoading(false);
      return;
    }

    fromTable("org_members")
      .select("org_id, role, organizations(id, name, slug)")
      .eq("user_id", user.id)
      .then(({ data }: any) => {
        if (data) {
          const mapped = data.map((m: any) => ({
            id: m.organizations.id,
            name: m.organizations.name,
            slug: m.organizations.slug,
            role: m.role,
          }));
          setOrgs(mapped);
          if (!activeOrgId && mapped.length > 0) {
            setActiveOrgId(mapped[0].id);
            localStorage.setItem(STORAGE_KEY, mapped[0].id);
          }
        }
        setLoading(false);
      });
  }, [user, isDemo]);

  const switchOrg = (orgId: string) => {
    setActiveOrgId(orgId);
    localStorage.setItem(STORAGE_KEY, orgId);
  };

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;

  return { orgs, activeOrg, activeOrgId, switchOrg, loading };
}
