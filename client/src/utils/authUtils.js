// utils/authUtils.js
import axios from 'axios'

const BASE_URL = 'https://stream-flow-api.onrender.com'

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important: includes cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor to handle token refresh
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        await refreshAccessToken()
        return authAPI(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Sign up user
export const signUpUser = async (userData) => {
  try {
    const response = await authAPI.post('/api/users/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    })
    
    return {
      success: true,
      data: response.data,
      user: response.data.data,
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
    const response = await authAPI.post('/api/users/login', {
      email: userData.email,
      password: userData.password,
      remember: "on" // Enable refresh token
    })
    
    return {
      success: true,
      data: response.data,
      user: response.data.data,
      message: response.data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please try again.',
      error: error.response?.data || error.message
    }
  }
}

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const response = await authAPI.get('/api/users/refresh-token')
    
    return {
      success: true,
      data: response.data,
      message: response.data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Token refresh failed.',
      error: error.response?.data || error.message
    }
  }
}

// Logout user
export const logoutUser = async () => {
  try {
    const response = await authAPI.get('/api/users/logout')
    
    return {
      success: true,
      data: response.data,
      message: response.data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Logout failed. Please try again.',
      error: error.response?.data || error.message
    }
  }
}

// Check if user is authenticated (optional utility)
export const checkAuthStatus = async () => {
  try {
    // You can call any protected endpoint to check auth status
    // For now, we'll try to refresh the token
    const result = await refreshAccessToken()
    return result.success
  } catch (error) {
    return false
  }
}