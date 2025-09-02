// client/src/utils/authUtils.js
import axios from 'axios'

// API Configuration
const API_BASE_URL = 'https://stream-flow-api.onrender.com'

// Create axios instance with credentials
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Enable cookies for authentication
  headers: {
    'Accept': 'application/json',
  }
})

// Request interceptor for logging
authApi.interceptors.request.use(
  (config) => {
    console.log(`Making auth request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Auth request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => {
    console.log(`Auth response from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    console.error('Auth response error:', error.response?.data || error.message)
    
    // Handle 401/403 errors (authentication failed)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear any stored user data and emit logout event
      localStorage.removeItem('userData')
      window.dispatchEvent(new Event('auth:logout'))
    }
    
    return Promise.reject(error)
  }
)

/**
 * Register a new user
 */
export const registerUser = async (userData, profileImg = null) => {
  try {
    const formData = new FormData()
    
    // Add required fields
    formData.append('username', userData.username)
    formData.append('email', userData.email)
    formData.append('password', userData.password)
    
    // Add optional profile image
    if (profileImg) {
      formData.append('profileImg', profileImg)
    }

    const response = await authApi.post('/api/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })

    if (response.data.result === 1) {
      // Store user data in localStorage (not the token, that's in cookies)
      const userData = response.data.data
      localStorage.setItem('userData', JSON.stringify(userData))

      return {
        success: true,
        message: response.data.message,
        user: userData
      }
    } else {
      throw new Error(response.data.message || 'Registration failed')
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message

      switch (status) {
        case 400:
          throw new Error(message || 'Invalid registration data. Please check your inputs.')
        case 409:
          throw new Error('Email or username already exists. Please try different credentials.')
        case 500:
          throw new Error('Server error. Please try again later.')
        default:
          throw new Error(`Registration failed (${status}): ${message}`)
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.')
    } else {
      throw new Error(error.message || 'Registration failed. Please try again.')
    }
  }
}

/**
 * Login user
 */
export const loginUser = async (credentials, remember = false) => {
  try {
    const loginData = {
      email: credentials.email,
      password: credentials.password,
    }

    // Add remember field if true
    if (remember) {
      loginData.remember = "on"
    }

    const response = await authApi.post('/api/users/login', loginData, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    // Handle already logged in case
    if (response.data.loggedIn === true) {
      return {
        success: true,
        message: response.data.message,
        alreadyLoggedIn: true
      }
    }

    // Handle successful login
    if (response.data.result === 1) {
      const userData = response.data.data
      
      // Store user data in localStorage (token is automatically set in cookies)
      localStorage.setItem('userData', JSON.stringify(userData))

      return {
        success: true,
        message: response.data.message,
        user: userData
      }
    } else {
      throw new Error(response.data.message || 'Login failed')
    }
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message

      switch (status) {
        case 400:
          throw new Error(message || 'Invalid credentials. Please check your email and password.')
        case 403:
          throw new Error('Account deactivated. Please contact support.')
        case 401:
          throw new Error('Invalid email or password. Please try again.')
        case 500:
          throw new Error('Server error. Please try again later.')
        default:
          throw new Error(`Login failed (${status}): ${message}`)
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.')
    } else {
      throw new Error(error.message || 'Login failed. Please try again.')
    }
  }
}

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const response = await authApi.get('/api/users/logout')
    
    // Clear user data from localStorage (cookies are cleared by the server)
    localStorage.removeItem('userData')
    
    // Emit logout event
    window.dispatchEvent(new Event('auth:logout'))

    return {
      success: true,
      message: response.data.message || 'Logged out successfully'
    }
  } catch (error) {
    console.error('Logout error:', error)
    
    // Still clear user data even if API call fails
    localStorage.removeItem('userData')
    
    // Emit logout event
    window.dispatchEvent(new Event('auth:logout'))
    
    return {
      success: true,
      message: 'Logged out locally'
    }
  }
}

/**
 * Check if user is authenticated by checking stored user data
 */
export const isAuthenticated = () => {
  const userData = localStorage.getItem('userData')
  return !!userData
}

/**
 * Get current user data
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

/**
 * Verify authentication by making a test request
 * This will use the cookies automatically
 */
export const verifyAuth = async () => {
  try {
    // Since we don't have a specific auth verification endpoint,
    // we can try to call the login endpoint to check if already logged in
    const response = await authApi.post('/api/users/login', {
      email: 'test@test.com', // dummy data
      password: 'test123'      // dummy data
    })
    
    // If we get "Already logged in" response, we're authenticated
    if (response.data.loggedIn === true) {
      return {
        success: true,
        authenticated: true,
        user: getCurrentUser()
      }
    }
    
    // If we get here with no error, but not already logged in,
    // it means the credentials were wrong but we might still be authenticated
    // Let's check if we have user data
    const userData = getCurrentUser()
    return {
      success: true,
      authenticated: !!userData,
      user: userData
    }
  } catch (error) {
    // If we get 401/403, we're not authenticated
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: true,
        authenticated: false,
        user: null
      }
    }
    
    // For other errors, assume we might still be authenticated if we have user data
    const userData = getCurrentUser()
    return {
      success: true,
      authenticated: !!userData,
      user: userData
    }
  }
}

/**
 * Auto-login check - verify if user is still authenticated
 */
export const autoLogin = async () => {
  try {
    if (!isAuthenticated()) {
      return { success: false, message: 'No stored user data' }
    }

    const authCheck = await verifyAuth()
    
    if (authCheck.authenticated) {
      return {
        success: true,
        user: authCheck.user,
        message: 'Auto-login successful'
      }
    } else {
      // Clear invalid user data
      localStorage.removeItem('userData')
      return {
        success: false,
        message: 'Session expired, please log in again'
      }
    }
  } catch (error) {
    console.error('Auto-login error:', error)
    localStorage.removeItem('userData')
    return {
      success: false,
      message: 'Auto-login failed'
    }
  }
}

/**
 * Update user data in localStorage
 */
export const updateUserData = (userData) => {
  try {
    localStorage.setItem('userData', JSON.stringify(userData))
    return true
  } catch (error) {
    console.error('Error updating user data:', error)
    return false
  }
}

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('userData')
  window.dispatchEvent(new Event('auth:logout'))
}

/**
 * Make an authenticated request (helper function)
 */
export const makeAuthenticatedRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
    }
    
    if (data) {
      config.data = data
    }
    
    const response = await authApi(config)
    return response.data
  } catch (error) {
    console.error(`Authenticated ${method} request to ${url} failed:`, error)
    throw error
  }
}

/**
 * Check authentication status by attempting to access a protected route
 * Alternative method if the login endpoint doesn't work for verification
 */
export const checkAuthStatus = async () => {
  try {
    // This is a placeholder - replace with an actual protected endpoint when available
    // For now, we'll just return based on stored user data
    const userData = getCurrentUser()
    
    if (userData) {
      return {
        success: true,
        authenticated: true,
        user: userData
      }
    } else {
      return {
        success: true,
        authenticated: false,
        user: null
      }
    }
  } catch (error) {
    console.error('Auth status check error:', error)
    return {
      success: false,
      authenticated: false,
      user: null,
      error: error.message
    }
  }
}