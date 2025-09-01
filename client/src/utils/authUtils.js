// utils/authUtils.js
import axios from 'axios'

const BASE_URL = 'https://stream-flow-api.onrender.com'

// Auth context reference for triggering logout
let authContextRef = null

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Critical: includes HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Create a separate instance for refresh to avoid interceptor loops
const refreshAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor for logging
authAPI.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for automatic token refresh
authAPI.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}: ${response.status}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    console.log(`❌ Response error from ${originalRequest?.url}: ${error.response?.status}`)
    
    // Handle 401 errors with automatic retry
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('refresh-token') &&
      !originalRequest.url?.includes('logout')
    ) {
      originalRequest._retry = true
      
      console.log('🔄 Access token expired, attempting silent refresh...')
      
      try {
        const refreshResult = await refreshAccessToken()
        
        if (refreshResult.success) {
          console.log('✅ Silent refresh successful, retrying original request')
          // Retry the original request - tokens are now refreshed in cookies
          return authAPI(originalRequest)
        } else {
          console.log('❌ Silent refresh failed')
          throw new Error('Refresh failed')
        }
      } catch (refreshError) {
        console.error('❌ Silent refresh error:', refreshError)
        
        // Force logout through context if available
        if (authContextRef?.silentRefresh) {
          await authContextRef.silentRefresh()
        }
        
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Set auth context reference for logout handling
export const setAuthContext = (authContext) => {
  authContextRef = authContext
}

// Check authentication status by trying to access a protected endpoint
export const checkAuthSession = async () => {
  try {
    console.log('🔍 Checking authentication session...')
    
    // Try to access user profile or any protected endpoint
    const response = await refreshAPI.get('/api/users/refresh-token')
    
    console.log('✅ Session check successful:', response.data)
    
    // Extract user data from response
    const userData = response.data?.data || response.data?.user
    
    return {
      success: true,
      user: userData,
      message: 'Session valid'
    }
  } catch (error) {
    console.log('❌ Session check failed:', error.response?.status, error.message)
    
    return {
      success: false,
      message: 'No valid session',
      error: error.response?.data || error.message
    }
  }
}

// Sign up user
export const signUpUser = async (userData) => {
  try {
    console.log('📝 Registering user:', userData.email)
    
    const response = await authAPI.post('/api/users/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    })
    
    console.log('✅ Registration successful:', response.data)
    console.log('🍪 Cookies after registration:', document.cookie)
    
    return {
      success: true,
      data: response.data,
      user: response.data.data,
      message: response.data.message || 'Registration successful!'
    }
  } catch (error) {
    console.error('❌ Registration failed:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed. Please try again.',
      error: error.response?.data || error.message
    }
  }
}

// Sign in user
export const signInUser = async (userData) => {
  try {
    console.log('🔐 Signing in user:', userData.email)
    
    const response = await authAPI.post('/api/users/login', {
      email: userData.email,
      password: userData.password,
      remember: "on" // Enable persistent session
    })
    
    console.log('✅ Login successful:', response.data)
    console.log('🍪 Cookies after login:', document.cookie)
    
    return {
      success: true,
      data: response.data,
      user: response.data.data,
      message: response.data.message || 'Login successful!'
    }
  } catch (error) {
    console.error('❌ Login failed:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please try again.',
      error: error.response?.data || error.message
    }
  }
}

// Refresh access token using HTTP-only refresh token cookie
export const refreshAccessToken = async () => {
  try {
    console.log('🔄 Refreshing access token...')
    
    const response = await refreshAPI.get('/api/users/refresh-token')
    
    console.log('✅ Token refresh successful:', response.status)
    console.log('🍪 Cookies after refresh:', document.cookie)
    
    // Extract user data if available
    const userData = response.data?.data || response.data?.user
    
    return {
      success: true,
      data: response.data,
      user: userData,
      message: response.data?.message || 'Token refreshed successfully'
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error.response?.status, error.message)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Session expired. Please login again.',
      error: error.response?.data || error.message
    }
  }
}

// Logout user
export const logoutUser = async () => {
  try {
    console.log('🚪 Logging out user...')
    
    const response = await authAPI.get('/api/users/logout')
    
    console.log('✅ Logout successful')
    console.log('🍪 Cookies after logout:', document.cookie)
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Logged out successfully'
    }
  } catch (error) {
    console.error('❌ Logout API failed:', error)
    
    // Even if API fails, consider it successful since we want to clear session
    return {
      success: true, // Return success to clear local state
      message: 'Logged out (API call failed but session cleared)'
    }
  }
}

// Check if cookies exist (basic check)
export const hasAuthCookies = () => {
  const cookies = document.cookie
  // Look for common auth cookie patterns
  return cookies.includes('accessToken') || 
         cookies.includes('refreshToken') || 
         cookies.includes('token') ||
         cookies.includes('session')
}

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await authAPI.post('/api/users/forget-password', {
      email: email
    })
    
    return {
      success: true,
      data: response.data,
      message: response.data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send reset email.',
      error: error.response?.data || error.message
    }
  }
}

// Reset password
export const resetPassword = async (password, resetToken) => {
  try {
    const response = await authAPI.post('/api/users/reset-password', {
      password: password,
      resetToken: resetToken
    })
    
    return {
      success: true,
      data: response.data,
      message: response.data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Password reset failed.',
      error: error.response?.data || error.message
    }
  }
}

// Create authenticated API instance for other parts of the app
export const createAuthenticatedAPI = () => {
  const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Include HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  })
  
  // Add the same response interceptor for automatic refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      
      if (
        error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('refresh-token') &&
        !originalRequest.url?.includes('logout')
      ) {
        originalRequest._retry = true
        
        try {
          const refreshResult = await refreshAccessToken()
          
          if (refreshResult.success) {
            return api(originalRequest)
          }
        } catch (refreshError) {
          // Force logout through context if available
          if (authContextRef?.logout) {
            await authContextRef.logout()
          }
          return Promise.reject(refreshError)
        }
      }
      
      return Promise.reject(error)
    }
  )
  
  return api
}

// Helper function for making authenticated requests
export const makeAuthenticatedRequest = async (requestFn) => {
  try {
    return await requestFn(createAuthenticatedAPI())
  } catch (error) {
    // Error handling is done by the interceptor
    throw error
  }
}

// Utility to check if we're authenticated (client-side check)
export const isAuthenticated = () => {
  return hasAuthCookies()
}