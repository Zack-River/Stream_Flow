import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ 
  children, 
  fallback = null,
  showSpinner = true,
  requireAuth = true 
}) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return showSpinner ? (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    ) : null
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access this content.
          </p>
        </div>
      </div>
    )
  }

  // If authentication is not required, or user is authenticated, show children
  return children
}