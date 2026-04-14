import { useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

const subpageFromPath = (path: string): string => {
  const segments = path.replace("/money", "").split("/").filter(Boolean);
  return segments[0] || "overview";
};

const MoneyCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const module = subpageFromPath(location.pathname);
    window.dispatchEvent(new CustomEvent("sita-open-finance", { detail: { module } }));
    navigate("/desktop", { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default MoneyCenter;
