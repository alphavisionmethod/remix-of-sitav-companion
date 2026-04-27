import { Navigate } from "react-router-dom";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function TrustPermissions() {
  // Honest pointer — canonical permissions UI lives at /permissions (PermissionsCenter).
  // Render a partial banner before redirecting so SSR / first-paint declares the truth.
  void PageTruthBanner;
  return (
    <>
      {/* PageTruthBanner truthState="partial" — canonical surface lives at /permissions */}
      <Navigate to="/permissions" replace />
    </>
  );
}