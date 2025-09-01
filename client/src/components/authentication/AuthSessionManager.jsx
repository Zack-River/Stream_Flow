// components/auth/AuthSessionManager.jsx
import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { refreshAccessToken, hasAuthCookies } from '../../utils/authUtils'

/**
 * AuthSessionManager handles automatic session management for HTTP-only tokens
 * This component should be mounted once in your app (e.g., in Layout or App)
 */
export default function AuthSessionManager() {
  const { isAuthenticated, logout, silentRefresh } = useAuth()
  const sessionCheckIntervalRef = useRef(null)
  const visibilityTimeoutRef = useRef(null)
  const proactiveRefreshIntervalRef = useRef(null)

  // Monitor session validity
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all intervals when not authenticated
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current)
        sessionCheckIntervalRef.current = null
      }
      if (proactiveRefreshIntervalRef.current) {
        clearInterval(proactiveRefreshIntervalRef.current)
        proactiveRefreshIntervalRef.current = null
      }
      return
    }

    const checkSessionValidity = async () => {
      try {
        // First check if cookies are still present
        if (!hasAuthCookies()) {
          console.log('🍪 Auth cookies missing - session ended externally')
          await logout()
          return
        }

        // Try to refresh to validate session
        const result = await refreshAccessToken()
        
        if (!result.success) {
          console.log('🔄 Session validation failed')
          await logout()
        } else {
          console.log('✅ Session still valid')
        }
      } catch (error) {
        console.error('❌ Session validation error:', error)
        await logout()
      }
    }

    // Check session every 15 minutes
    sessionCheckIntervalRef.current = setInterval(
      checkSessionValidity, 
      15 * 60 * 1000
    )

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current)
      }
    }
  }, [isAuthenticated, logout])

  // Proactive token refresh (since we can't read HTTP-only token expiration)
  useEffect(() => {
    if (!isAuthenticated) return

    const proactiveRefresh = async () => {
      try {
        console.log('🔄 Proactive token refresh...')
        const result = await refreshAccessToken()
        
        if (result.success) {
          console.log('✅ Proactive refresh successful')
        } else {
          console.log('❌ Proactive refresh failed')
          // Don't force logout on proactive refresh failure
          // Let the API request interceptor handle it when needed
        }
      } catch (error) {
        console.error('❌ Proactive refresh error:', error)
        // Don't force logout - let normal request flow handle auth failures
      }
    }

    // Refresh every 50 minutes (assuming 1-hour access token lifespan)
    proactiveRefreshIntervalRef.current = setInterval(
      proactiveRefresh, 
      50 * 60 * 1000
    )

    return () => {
      if (proactiveRefreshIntervalRef.current) {
        clearInterval(proactiveRefreshIntervalRef.current)
      }
    }
  }, [isAuthenticated])

  // Handle page visibility changes (user switches tabs, minimizes browser, etc.)
  useEffect(() => {
    if (!isAuthenticated) return

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // User returned to the tab - check if session is still valid
        console.log('👀 User returned to tab - validating session...')
        
        // Clear any existing timeout
        if (visibilityTimeoutRef.current) {
          clearTimeout(visibilityTimeoutRef.current)
          visibilityTimeoutRef.current = null
        }

        // Add a small delay to avoid rapid fire requests
        visibilityTimeoutRef.current = setTimeout(async () => {
          try {
            if (!hasAuthCookies()) {
              console.log('🍪 Cookies missing after tab return')
              await logout()
              return
            }

            // Validate session by refreshing
            const result = await silentRefresh()
            if (!result) {
              console.log('🔄 Session invalid after tab return')
              await logout()
            } else {
              console.log('✅ Session validated on tab return')
            }
          } catch (error) {
            console.error('❌ Error validating session on tab return:', error)
            await logout()
          }
        }, 1000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }
  }, [isAuthenticated, logout, silentRefresh])

  // Handle browser beforeunload (user closing tab)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clean up any ongoing intervals/timeouts
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current)
      }
      if (proactiveRefreshIntervalRef.current) {
        clearInterval(proactiveRefreshIntervalRef.current)
      }
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Handle online/offline status
  useEffect(() => {
    if (!isAuthenticated) return

    const handleOnline = async () => {
      console.log('🌐 Connection restored - validating session...')
      
      try {
        // When connection is restored, validate session
        if (hasAuthCookies()) {
          const result = await refreshAccessToken()
          if (!result.success) {
            console.log('🔄 Session invalid after reconnection')
            await logout()
          }
        } else {
          console.log('🍪 No auth cookies after reconnection')
          await logout()
        }
      } catch (error) {
        console.error('❌ Error validating session after reconnection:', error)
        // Don't force logout on network errors
      }
    }

    const handleOffline = () => {
      console.log('📡 Connection lost - pausing session checks...')
      // Optionally pause session checking while offline
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated, logout])

  // This component doesn't render anything - it's just for session management
  return null
}