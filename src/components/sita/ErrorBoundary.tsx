import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SITA ErrorBoundary]", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 items-center justify-center p-8" data-testid="error-state">
          <div className="empty-state-premium max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-semibold text-foreground">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground">
                This page encountered an unexpected error. Your data is safe.
              </p>
              {this.state.error && (
                <p className="text-xs font-mono text-muted-foreground/60 mt-2 break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Try Again
              </Button>
              <Button size="sm" onClick={this.handleGoHome}>
                <Home className="h-4 w-4 mr-1.5" />
                Daily Pulse
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
