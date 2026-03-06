import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-card rounded-xl border border-border shadow-sm m-4">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        {this.state.error?.message || "An unexpected error occurred while rendering this component."}
                    </p>
                    <Button onClick={this.handleReload} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
