import { Wifi } from "lucide-react";

// Re-export wrapper for NetworkSetupStep — the full component lives in onboarding/
// This thin wrapper exists for the reusable component contract
export function NetworkSelectionPanel({ children }: { children?: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
