import { CheckSquare } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function TrustApprovals() {
  // The canonical approvals UI already exists at /approvals.
  // Trust Center re-surfaces it under /trust/approvals to make the
  // platform layer discoverable from a single Trust home.
  return <Navigate to="/approvals" replace />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _Stub() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-3 mb-4">
        <CheckSquare className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-semibold">Approvals</h1>
      </header>
    </div>
  );
}