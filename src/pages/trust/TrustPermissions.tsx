import { Navigate } from "react-router-dom";

export default function TrustPermissions() {
  // Re-surface the existing PermissionsCenter under /trust/permissions
  return <Navigate to="/permissions" replace />;
}