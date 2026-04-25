// Shared action bar for AI Engineer truth panels.
// Provides:
//   • Refresh button — re-fetches the panel's evidence sources
//   • Source link — deep-links to the canonical generated/ artifact
// Satisfies the no-museum-boards + admin-action-orientation BLOCK gates by
// guaranteeing every status-bearing panel has at least one actionable element.
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RefreshCw, FileText } from "lucide-react";

interface TruthPanelActionsProps {
  onRefresh: () => void;
  refreshing?: boolean;
  sourcePath: string; // e.g. "/generated/architecture-hardening/"
  sourceLabel?: string;
  /**
   * Optional pass-through click handler. Kept on the props interface so that
   * panels can attach extra observability (analytics, audit pings) at the
   * action-bar level without breaking type-safety. Does not replace the
   * built-in Refresh handler — both fire if both are wired.
   */
  onClick?: () => void;
}

export function TruthPanelActions({
  onRefresh,
  refreshing = false,
  sourcePath,
  sourceLabel = "View source evidence",
  onClick,
}: TruthPanelActionsProps) {
  const handleRefresh = () => {
    onClick?.();
    onRefresh();
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleRefresh}
        disabled={refreshing}
        aria-label="Refresh truth panel evidence"
      >
        <RefreshCw className={`mr-1 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
      <Link to={sourcePath} target="_blank" rel="noopener noreferrer">
        <Button type="button" size="sm" variant="ghost" aria-label={sourceLabel}>
          <FileText className="mr-1 h-3 w-3" />
          Source
        </Button>
      </Link>
    </div>
  );
}
