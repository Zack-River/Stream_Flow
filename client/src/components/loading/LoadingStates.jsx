import React from 'react'
import { Loader2, Music, Play } from 'lucide-react'

// Skeleton loader for song cards
export function SongCardSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
                    {/* Cover image skeleton */}
                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-md sm:rounded-lg mb-2 sm:mb-3"></div>

                    {/* Title skeleton */}
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 sm:mb-2"></div>

                    {/* Artist skeleton */}
                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>

                    {/* Duration skeleton */}
                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
            ))}
        </div>
    )
}

// Loading state for audio player
export function AudioPlayerSkeleton() {
    return (
        <div className="bg-white/95 dark:bg-gray-800/95 border-t border-gray-200/50 dark:border-gray-700/50 px-3 py-2 sm:px-4 lg:px-6 backdrop-blur-lg shadow-2xl w-full animate-pulse">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">

                {/* Song info skeleton */}
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="min-w-0 flex-1">
                        <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                </div>

                {/* Controls skeleton */}
                <div className="flex flex-col space-y-2 sm:space-y-1 flex-1 sm:max-w-md">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                        <div className="w-8 sm:w-10 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="w-8 sm:w-10 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>

                {/* Right controls skeleton */}
                <div className="hidden sm:flex items-center space-x-2 w-32 lg:w-40 justify-end">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="hidden md:block w-16 lg:w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    )
}

// Loading overlay for buffering audio
export function BufferingOverlay({ isVisible }) {
    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-sm font-medium">Loading audio...</span>
            </div>
        </div>
    )
}

// Inline loading spinner for buttons
export function ButtonSpinner({ size = "sm", className = "" }) {
    const sizeClasses = {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    }

    return (
        <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
    )
}

// Empty state components
export function EmptyPlaylist({ title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title || "No songs yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                {description || "Start building your music collection by adding some songs."}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    {action.icon && <action.icon className="w-4 h-4" />}
                    <span>{action.text}</span>
                </button>
            )}
        </div>
    )
}

export function EmptySearchResults({ query, onClearSearch }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No results found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                We couldn't find any songs matching "{query}". Try adjusting your search terms.
            </p>
            <button
                onClick={onClearSearch}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
                Clear Search
            </button>
        </div>
    )
}

// Error states for specific components
export function AudioError({ error, onRetry }) {
    return (
        <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Audio playback failed
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        {error?.message || "Unable to load or play this audio file"}
                    </p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    )
}

export function NetworkError({ onRetry }) {
    return (
        <div className="flex items-center justify-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-center">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Connection Problem
                </h3>
                <p className="text-xs text-yellow-600 dark:text-yellow-300 mb-4">
                    Unable to connect to the music service. Please check your internet connection.
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    )
}

// Higher-order component for handling loading states
export function withLoadingState(WrappedComponent, LoadingComponent) {
    return function LoadingWrapper({ isLoading, ...props }) {
        if (isLoading) {
            return <LoadingComponent />
        }
        return <WrappedComponent {...props} />
    }
}

// Hook for managing async operations with loading states
export function useAsyncOperation() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const execute = useCallback(async (asyncFunction) => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await asyncFunction()
            return result
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        setIsLoading(false)
        setError(null)
    }, [])

    return {
        isLoading,
        error,
        execute,
        reset
    }
}