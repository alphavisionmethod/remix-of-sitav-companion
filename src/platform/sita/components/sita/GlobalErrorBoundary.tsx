import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { reportFatalError } from "@/lib/services/error-monitoring-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[SITA ErrorBoundary]", error, errorInfo);
    reportFatalError(error, errorInfo.componentStack || undefined);
  }

  handleReload = () => window.location.reload();
  handleGoHome = () => { window.location.href = "/"; };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full border-destructive/30">
            <CardContent className="p-6 space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  SITA encountered an unexpected error. Your data is safe.
                </p>
              </div>
              {this.state.error && (
                <pre className="text-[11px] bg-muted/50 rounded-lg p-3 text-left overflow-x-auto text-muted-foreground max-h-32 overflow-y-auto">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={this.handleGoHome}>
                  <Home className="h-3.5 w-3.5 mr-1.5" /> Go Home
                </Button>
                <Button size="sm" onClick={this.handleReload}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
