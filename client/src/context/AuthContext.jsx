// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  autoLogin, 
  getCurrentUser,
  isAuthenticated as checkAuth,
  clearAuth 
} from '../utils/authUtils'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  // Listen for logout events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userData' && !e.newValue) {
        // User data removed in another tab
        handleLogout(false) // Don't call API, just clear state
      }
    }

    const handleAuthLogout = () => {
      handleLogout(false)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth:logout', handleAuthLogout)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)
      setAuthError(null)

      // Check if user was previously logged in
      if (checkAuth()) {
        const result = await autoLogin()
        
        if (result.success) {
          setUser(result.user)
          setIsAuthenticated(true)
          console.log('Auto-login successful:', result.user?.username)
        } else {
          console.log('Auto-login failed:', result.message)
          clearAuth()
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setAuthError('Failed to initialize authentication')
      clearAuth()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials, remember = false) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const result = await loginUser(credentials, remember)
      
      if (result.success) {
        if (result.alreadyLoggedIn) {
          // User is already logged in, get current user data
          const currentUser = getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            setIsAuthenticated(true)
          }
        } else {
          setUser(result.user)
          setIsAuthenticated(true)
        }
        
        return result
      } else {
        throw new Error(result.message || 'Login failed')
      }
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData, profileImg = null) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const result = await registerUser(userData, profileImg)
      
      if (result.success) {
        setUser(result.user)
        setIsAuthenticated(true)
        return result
      } else {
        throw new Error(result.message || 'Registration failed')
      }
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    return handleLogout(true)
  }

  const handleLogout = async (callApi = true) => {
    try {
      setIsLoading(true)
      
      if (callApi) {
        await logoutUser()
      } else {
        // Just clear local state (for cross-tab logout)
        clearAuth()
      }
      
      setUser(null)
      setIsAuthenticated(false)
      setAuthError(null)
      
      return { success: true, message: 'Logged out successfully' }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear state even if API call fails
      setUser(null)
      setIsAuthenticated(false)
      setAuthError(null)
      clearAuth()
      
      return { success: true, message: 'Logged out locally' }
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setAuthError(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  // Get authentication status (cookies handle the token)
  const getAuthStatus = () => {
    return {
      isAuthenticated,
      user
    }
  }

  const contextValue = {
    // State
    user,
    isAuthenticated,
    isLoading,
    authError,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    updateUser,
    getAuthStatus,
    
    // Utils
    initializeAuth
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}