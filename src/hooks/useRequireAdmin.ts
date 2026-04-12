import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function useRequireAdmin() {
  const { user, loading, isDemo } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth/login");
      return;
    }

    // Demo mode: grant admin
    if (isDemo) {
      setIsAdmin(true);
      setChecking(false);
      return;
    }

    const checkRole = async () => {
      try {
        const { data } = await ( supabase as any).rpc("has_role" as any, { _user_id: user.id, _role: "admin" });
        if (!data) {
          navigate("/");
        } else {
          setIsAdmin(true);
        }
      } catch {
        navigate("/");
      } finally {
        setChecking(false);
      }
    };
    checkRole();
  }, [user, loading, isDemo, navigate]);

  return { isAdmin, loading: loading || checking };
}
