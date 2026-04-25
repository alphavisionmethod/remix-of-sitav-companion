// ═══════════════════════════════════════════════════════════════
// NovaOS — Per-Window Error Boundary with Crash Fallback UI
// Isolates window crashes, renders frozen fallback, allows restart
// ═══════════════════════════════════════════════════════════════

import React, { type ReactNode } from "react";
import { AlertTriangle, RotateCcw, X } from "lucide-react";

interface Props {
  windowId?: string;
  title?: string;
  onClose?: () => void;
  onRestart?: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WindowErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[WindowErrorBoundary] Window "${this.props.windowId}" crashed:`,
      error,
      info.componentStack
    );
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRestart?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 gap-4 select-none">
          {/* Frozen state indicator */}
          <div className="w-12 h-12 rounded-2xl bg-[hsl(0_70%_60%/0.12)] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[hsl(0_70%_55%)]" />
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-sm font-semibold text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)]">
              This window encountered an error
            </h3>
            <p className="text-xs text-[hsl(0_0%_50%)] dark:text-[hsl(0_0%_60%)] max-w-[240px]">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={this.handleRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-[hsl(210_80%_60%/0.1)] text-[hsl(210_80%_55%)] hover:bg-[hsl(210_80%_60%/0.2)]
                transition-colors duration-150"
            >
              <RotateCcw className="w-3 h-3" />
              Restart
            </button>
            {this.props.onClose && (
              <button
                onClick={this.props.onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-[hsl(0_0%_50%/0.08)] text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_65%)]
                  hover:bg-[hsl(0_0%_50%/0.15)] transition-colors duration-150"
              >
                <X className="w-3 h-3" />
                Close
              </button>
            )}
          </div>

          {/* Technical details (collapsed) */}
          <details className="w-full max-w-[280px] mt-2">
            <summary className="text-[10px] text-[hsl(0_0%_60%)] cursor-pointer hover:text-[hsl(0_0%_40%)] transition-colors">
              Technical details
            </summary>
            <pre className="mt-1 p-2 rounded-lg bg-[hsl(0_0%_0%/0.04)] dark:bg-[hsl(0_0%_100%/0.04)] text-[9px] text-[hsl(0_0%_50%)] overflow-auto max-h-[100px] font-mono">
              {this.state.error?.stack?.slice(0, 500)}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
