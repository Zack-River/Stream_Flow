import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { setTokenUpdateCallback, refreshAccessToken } from '../utils/authUtils'

export const useAuthToken = () => {
  const { accessToken, updateAccessToken, logout } = useAuth()
  const refreshTimeoutRef = useRef(null)

  useEffect(() => {
    // Set up token update callback
    setTokenUpdateCallback(updateAccessToken)

    return () => {
      // Clear timeout on cleanup
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [updateAccessToken])

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!accessToken) return

    try {
      // Decode JWT to get expiration time
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
      const expirationTime = tokenPayload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()
      const timeUntilExpiry = expirationTime - currentTime
      
      // Refresh 5 minutes before expiration, or immediately if token expires in less than 5 minutes
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000) // Minimum 1 minute

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          try {
            console.log('Auto-refreshing access token...')
            await refreshAccessToken()
          } catch (error) {
            console.error('Auto-refresh failed:', error)
            // If refresh fails, logout user
            logout()
          }
        }, refreshTime)
      } else {
        // Token is already expired or expires very soon, try to refresh immediately
        refreshAccessToken().catch((error) => {
          console.error('Immediate refresh failed:', error)
          logout()
        })
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      // Invalid token, logout user
      logout()
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [accessToken, logout])

  return {
    accessToken,
    isTokenValid: !!accessToken
  }
}