import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl m-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-500 max-w-md mb-6">
                        We encountered an unexpected error while rendering this component.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reload Page
                    </button>

                    {process.env.NODE_ENV !== 'production' && this.state.error && (
                        <div className="mt-8 text-left bg-gray-900 text-red-300 p-4 rounded-lg overflow-auto max-w-full text-xs font-mono">
                            <p className="font-bold mb-2">{this.state.error.toString()}</p>
                            <pre>{this.state.errorInfo.componentStack}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
