import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RouteErrorBoundaryInner extends React.Component<Props & { onGoHome: () => void }, State> {
  constructor(props: Props & { onGoHome: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[RouteErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isNetwork = this.state.error?.message?.toLowerCase().includes("fetch") ||
        this.state.error?.message?.toLowerCase().includes("network") ||
        this.state.error?.name === "TypeError";
      const Icon = isNetwork ? WifiOff : AlertTriangle;
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <Icon className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-xl font-semibold text-foreground">
              {isNetwork ? "Connection problem" : "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isNetwork
                ? "We couldn't reach the server. Check your connection and try again."
                : "This page encountered an error. The rest of SITA OS is still running."}
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/60 font-mono mt-2 break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button size="sm" variant="outline" onClick={this.props.onGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const RouteErrorBoundary = ({ children }: Props) => {
  const navigate = useNavigate();
  return (
    <RouteErrorBoundaryInner onGoHome={() => navigate("/")}>
      {children}
    </RouteErrorBoundaryInner>
  );
};
