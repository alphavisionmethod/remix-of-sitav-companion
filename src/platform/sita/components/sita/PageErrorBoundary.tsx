// ═══════════════════════════════════════════════════════════════
// SITA OS — Per-Page Error Boundary
// Lightweight wrapper for individual route pages with retry.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { PageErrorState } from "@/components/sita/PageErrorState";

interface Props {
  children: React.ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[PageErrorBoundary:${this.props.context ?? "unknown"}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isNetwork = this.state.error?.message?.toLowerCase().includes("fetch") ||
        this.state.error?.message?.toLowerCase().includes("network");
      return (
        <PageErrorState
          message={this.state.error?.message}
          variant={isNetwork ? "network" : "generic"}
          context={this.props.context}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}