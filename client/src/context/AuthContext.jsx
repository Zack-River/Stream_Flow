// context/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'
import { refreshAccessToken, logoutUser } from '../utils/authUtils'

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
        accessToken: action.payload.accessToken,
        isLoading: false,
        error: null
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    case 'UPDATE_ACCESS_TOKEN':
      return {
        ...state,
        accessToken: action.payload
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null, // Stored only in memory
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
        
        // Try to refresh access token using existing refresh token cookie
        const result = await refreshAccessToken()
        
        console.log('Session check result:', result) // Debug log
        
        if (result.success) {
          console.log('Existing session found:', result)
          console.log('User data:', result.user) // Debug user data
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: result.user || result.data?.data || result.data?.user,
              accessToken: result.accessToken || result.data?.metadata?.accessToken
            }
          })
        } else {
          // No valid refresh token or session expired
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.log('No existing session found')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkExistingSession()
  }, [])

  // Login function
  const login = (user, accessToken) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user, accessToken }
    })
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to clear httpOnly cookies
      await logoutUser()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local state
      dispatch({ type: 'LOGOUT' })
    }
  }

  // Update access token (for silent refresh)
  const updateAccessToken = (newToken) => {
    dispatch({
      type: 'UPDATE_ACCESS_TOKEN',
      payload: newToken
    })
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
    updateAccessToken,
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