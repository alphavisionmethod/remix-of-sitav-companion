import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight admin check — no redirect, just returns isAdmin boolean.
 * Use in UI to conditionally show/hide admin-only elements.
 */
export function useIsAdmin() {
  const { user, loading, isDemo } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setIsAdmin(false);
      return;
    }

    if (isDemo) {
      setIsAdmin(true);
      return;
    }

    (supabase as any)
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }: any) => setIsAdmin(!!data))
      .catch(() => setIsAdmin(false));
  }, [user, loading, isDemo]);

  return isAdmin;
}
