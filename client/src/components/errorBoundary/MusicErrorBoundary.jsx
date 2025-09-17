import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

class MusicErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0,
            maxRetries: 3
        }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
            hasError: true
        })

        // Log error to monitoring service
        console.error('Music App Error:', error, errorInfo)

        // In production, send to error reporting service
        if (process.env.NODE_ENV === 'production') {
            // reportError(error, errorInfo)
        }
    }

    handleRetry = () => {
        if (this.state.retryCount < this.state.maxRetries) {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: prevState.retryCount + 1
            }))
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        })

        // Clear any app state if needed
        if (this.props.onReset) {
            this.props.onReset()
        }
    }

    render() {
        if (this.state.hasError) {
            const canRetry = this.state.retryCount < this.state.maxRetries

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {this.props.fallbackMessage ||
                                "We're having trouble with the music player. This might be a temporary issue."}
                        </p>

                        <div className="space-y-3">
                            {canRetry && (
                                <button
                                    onClick={this.handleRetry}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Try Again ({this.state.maxRetries - this.state.retryCount} attempts left)</span>
                                </button>
                            )}

                            <button
                                onClick={this.handleReset}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span>Reset App</span>
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default MusicErrorBoundary
