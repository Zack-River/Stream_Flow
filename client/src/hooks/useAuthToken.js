import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { refreshAccessToken, setAuthContext, hasAuthCookies } from '../utils/authUtils'

export const useAuthToken = () => {
  const authContext = useAuth()
  const { isAuthenticated, logout } = authContext
  const refreshTimeoutRef = useRef(null)
  const refreshIntervalRef = useRef(null)

  // Set up auth context reference for utils
  useEffect(() => {
    setAuthContext(authContext)
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [authContext])

  // Periodic session validation when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear intervals when not authenticated
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      return
    }

    // Check session validity every 10 minutes
    const checkSession = async () => {
      try {
        // If cookies are missing, user was logged out externally
        if (!hasAuthCookies()) {
          console.log('🍪 Auth cookies missing, logging out...')
          await logout()
          return
        }

        // Try to refresh token to ensure session is still valid
        const result = await refreshAccessToken()
        
        if (!result.success) {
          console.log('🔄 Session validation failed, logging out...')
          await logout()
        } else {
          console.log('✅ Session validated successfully')
        }
      } catch (error) {
        console.error('❌ Session validation error:', error)
        await logout()
      }
    }

    // Initial check
    checkSession()

    // Set up periodic checking
    refreshIntervalRef.current = setInterval(checkSession, 10 * 60 * 1000) // Every 10 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [isAuthenticated, logout])

  // Proactive token refresh before expiration (estimated)
  useEffect(() => {
    if (!isAuthenticated) return

    // Since tokens are HTTP-only, we can't read their expiration
    // Set up proactive refresh every 50 minutes (assuming 1-hour access token)
    const proactiveRefresh = async () => {
      try {
        console.log('🔄 Proactive token refresh...')
        await refreshAccessToken()
        console.log('✅ Proactive refresh successful')
      } catch (error) {
        console.error('❌ Proactive refresh failed:', error)
        // Don't force logout on proactive refresh failure
        // Let the API request interceptor handle it
      }
    }

    // Refresh every 50 minutes when authenticated
    refreshTimeoutRef.current = setInterval(proactiveRefresh, 50 * 60 * 1000)

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [isAuthenticated])

  // Manual refresh function
  const manualRefresh = async () => {
    try {
      const result = await refreshAccessToken()
      return result.success
    } catch (error) {
      console.error('Manual refresh failed:', error)
      return false
    }
  }

  return {
    isTokenValid: isAuthenticated && hasAuthCookies(),
    hasAuthCookies: hasAuthCookies(),
    manualRefresh
  }
}