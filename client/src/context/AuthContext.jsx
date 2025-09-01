// context/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'
import { refreshAccessToken, logoutUser, checkAuthSession } from '../utils/authUtils'

// Development-only session persistence for localhost
const DEV_SESSION_KEY = 'dev_auth_session'
const isDevelopment = process.env.NODE_ENV === 'development'
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const AuthContext = createContext()

// Auth state management
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoading: false,
        error: null
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user || state.user, // Update user if provided
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true, // Start with loading to check for existing session
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing session on app initialization
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // Development workaround: Check sessionStorage first on localhost
        if (isDevelopment && isLocalhost) {
          try {
            const savedSession = sessionStorage.getItem(DEV_SESSION_KEY)
            if (savedSession) {
              const { user: savedUser, timestamp } = JSON.parse(savedSession)
              
              // Check if session is less than 8 hours old
              const maxAge = 8 * 60 * 60 * 1000 // 8 hours
              if (Date.now() - timestamp < maxAge && savedUser) {
                console.log('🔄 [DEV] Restoring session from sessionStorage:', savedUser)
                dispatch({
                  type: 'LOGIN_SUCCESS',
                  payload: { user: savedUser }
                })
                return // Skip API call if we restored from sessionStorage
              } else {
                sessionStorage.removeItem(DEV_SESSION_KEY)
              }
            }
          } catch (error) {
            console.error('❌ [DEV] Error restoring session:', error)
            sessionStorage.removeItem(DEV_SESSION_KEY)
          }
        }
        
        // Try to verify existing session using HTTP-only cookies
        const result = await checkAuthSession()
        
        console.log('Session check result:', result)
        
        if (result.success && result.user) {
          console.log('Existing session found:', result)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: result.user
            }
          })
        } else {
          // No valid session
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.log('No existing session found:', error.message)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkExistingSession()
  }, [])

  // Login function - only stores user data, tokens are HTTP-only
  const login = (user) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user }
    })

    // Development workaround: Save to sessionStorage on localhost
    if (isDevelopment && isLocalhost && user) {
      try {
        sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify({
          user,
          timestamp: Date.now()
        }))
        console.log('💾 [DEV] Session saved to sessionStorage')
      } catch (error) {
        console.error('❌ [DEV] Error saving session:', error)
      }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to clear HTTP-only cookies
      await logoutUser()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local state
      dispatch({ type: 'LOGOUT' })
      
      // Development workaround: Clear sessionStorage on localhost
      if (isDevelopment && isLocalhost) {
        try {
          sessionStorage.removeItem(DEV_SESSION_KEY)
          console.log('🗑️ [DEV] Session cleared from sessionStorage')
        } catch (error) {
          console.error('❌ [DEV] Error clearing session:', error)
        }
      }
    }
  }

  // Silent refresh function (called by interceptor)
  const silentRefresh = async () => {
    try {
      const result = await refreshAccessToken()
      
      if (result.success) {
        dispatch({
          type: 'REFRESH_SUCCESS',
          payload: { user: result.user }
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Silent refresh failed:', error)
      // Force logout on refresh failure
      dispatch({ type: 'LOGOUT' })
      return false
    }
  }

  // Set error
  const setError = (error) => {
    dispatch({
      type: 'SET_ERROR',
      payload: error
    })
  }

  const value = {
    ...state,
    login,
    logout,
    silentRefresh,
    setError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}