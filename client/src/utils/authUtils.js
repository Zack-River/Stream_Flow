// utils/authUtils.js
import axios from 'axios'

const BASE_URL = 'https://stream-flow-api.onrender.com'

// Global access token storage (in-memory only)
let currentAccessToken = null

// Callback for when access token is updated
let onTokenUpdate = null

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important: includes cookies for refresh token
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add access token to headers
authAPI.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh automatically
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If we get a 401 and haven't already tried to refresh, and it's not the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('refresh-token')) {
      originalRequest._retry = true
      
      try {
        console.log('Access token expired, attempting refresh...')
        const refreshResult = await refreshAccessToken()
        
        if (refreshResult.success) {
          // Update the global token
          setAccessToken(refreshResult.data?.metadata?.accessToken)
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`
          return authAPI(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear tokens and redirect to login
        clearTokens()
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Set access token in memory
export const setAccessToken = (token) => {
  currentAccessToken = token
  // Notify context about token update
  if (onTokenUpdate) {
    onTokenUpdate(token)
  }
}

// Get current access token
export const getAccessToken = () => {
  return currentAccessToken
}

// Clear tokens from memory
export const clearTokens = () => {
  currentAccessToken = null
  if (onTokenUpdate) {
    onTokenUpdate(null)
  }
}

// Set token update callback
export const setTokenUpdateCallback = (callback) => {
  onTokenUpdate = callback
}

// Sign up user
export const signUpUser = async (userData) => {
  try {
    const response = await authAPI.post('/api/users/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    })
    
    // Extract access token from response and store it
    const accessToken = response.data?.metadata?.accessToken
    if (accessToken) {
      setAccessToken(accessToken)
    }
    
    return {
      success: true,
      data: response.data,
      user: response.data.data,
      accessToken: accessToken,
      message: response.data.message
    }
  } catch (error) {
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
      remember: "on" // Enable refresh token
    })
    
    console.log('✅ Login successful:', response.data)
    console.log('🍪 Checking cookies after login:', document.cookie)
    
    // Extract access token from response and store it
    const accessToken = response.data?.metadata?.accessToken
    if (accessToken) {
      console.log('🔑 Access token received and stored')
      setAccessToken(accessToken)
    } else {
      console.error('❌ No access token in login response')
    }
    
    return {
      success: true,
      data: response.data,
      user: response.data.data,
      accessToken: accessToken,
      message: response.data.message
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

// Refresh access token using httpOnly refresh token cookie
export const refreshAccessToken = async () => {
  try {
    console.log('🔄 Attempting to refresh access token...')
    
    // This endpoint uses the httpOnly refresh token cookie automatically
    // Use a separate axios instance to avoid interceptor loops
    const response = await axios.get(`${BASE_URL}/api/users/refresh-token`, {
      withCredentials: true, // Include cookies
      timeout: 10000, // 10 second timeout
    })
    
    console.log('📡 Refresh token response status:', response.status)
    console.log('📋 Refresh token response data:', response.data)
    
    // Extract and store new access token
    const accessToken = response.data?.metadata?.accessToken
    if (accessToken) {
      console.log('✅ New access token received')
      setAccessToken(accessToken)
    } else {
      console.error('❌ No access token in refresh response')
      throw new Error('No access token in response')
    }
    
    // Try to get user data from different possible locations in the response
    const userData = response.data?.data || response.data?.user
    console.log('👤 User data from refresh:', userData)
    
    return {
      success: true,
      data: response.data,
      accessToken: accessToken,
      user: userData, // User data for context
      message: response.data?.message || 'Token refreshed successfully'
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error)
    console.error('❌ Response data:', error.response?.data)
    console.error('❌ Status code:', error.response?.status)
    
    // Clear tokens on refresh failure
    clearTokens()
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Session expired. Please login again.',
      error: error.response?.data || error.message
    }
  }
}

// Logout user
export const logoutUser = async () => {
  try {
    const response = await authAPI.get('/api/users/logout')
    
    // Clear tokens from memory
    clearTokens()
    
    return {
      success: true,
      data: response.data,
      message: response.data.message
    }
  } catch (error) {
    // Even if logout API fails, clear local tokens
    clearTokens()
    
    return {
      success: false,
      message: error.response?.data?.message || 'Logout failed. Please try again.',
      error: error.response?.data || error.message
    }
  }
}

// Check if user is authenticated
export const checkAuthStatus = () => {
  return !!currentAccessToken
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
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  })
  
  // Add request interceptor to include access token
  api.interceptors.request.use(
    (config) => {
      if (currentAccessToken) {
        config.headers.Authorization = `Bearer ${currentAccessToken}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
  
  // Add response interceptor for auto token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('refresh-token')) {
        originalRequest._retry = true
        
        try {
          const refreshResult = await refreshAccessToken()
          
          if (refreshResult.success) {
            originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          clearTokens()
          // Optionally redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
          return Promise.reject(refreshError)
        }
      }
      
      return Promise.reject(error)
    }
  )
  
  return api
}

// Helper function to handle API calls with automatic retry
export const makeAuthenticatedRequest = async (requestFn) => {
  try {
    return await requestFn()
  } catch (error) {
    // If it's a 401, the interceptor will handle it
    // If it's any other error, just throw it
    throw error
  }
}