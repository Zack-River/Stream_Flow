// utils/apiUtils.js
import axios from 'axios'
import { refreshAccessToken } from './authUtils'

// API Configuration
const API_BASE_URL = 'https://stream-flow-api.onrender.com'

// Create axios instance with default config for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include HTTP-only cookies
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making API request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling and automatic token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API response from ${response.config.url}: ${response.status}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    console.log(`❌ API error from ${originalRequest?.url}: ${error.response?.status}`)
    
    // Handle 401 errors with automatic retry
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('refresh-token') &&
      !originalRequest.url?.includes('logout') &&
      !originalRequest.url?.includes('login') &&
      !originalRequest.url?.includes('register')
    ) {
      originalRequest._retry = true
      
      console.log('🔄 Access token expired, attempting silent refresh...')
      
      try {
        const refreshResult = await refreshAccessToken()
        
        if (refreshResult.success) {
          console.log('✅ Silent refresh successful, retrying original request')
          // The HTTP-only cookies are now refreshed, retry the request
          return api(originalRequest)
        } else {
          console.log('❌ Silent refresh failed')
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        console.error('❌ Silent refresh error:', refreshError)
        
        // Force page reload to clear auth state and redirect to login
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
        
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

/**
 * Transform API song data to match app's expected format
 */
export const transformApiSong = (apiSong) => {
  if (!apiSong) return null;
  
  return {
    id: apiSong._id,
    title: apiSong.title || 'Unknown Title',
    artist: apiSong.singer || 'Unknown Artist',
    album: apiSong.album || '',
    duration: formatDurationFromMs(apiSong.duration),
    cover: apiSong.coverImageUrl || "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
    url: apiSong.audioUrl,
    genre: apiSong.genre || '',
    category: apiSong.category || '',
    isPrivate: apiSong.isPrivate || false,
    uploadedBy: apiSong.uploadedBy,
    createdAt: apiSong.createdAt,
    isUploaded: false, // This distinguishes API songs from user uploads
    // Keep original API fields for reference
    _originalApiData: {
      _id: apiSong._id,
      singer: apiSong.singer,
      audioUrl: apiSong.audioUrl,
      coverImageUrl: apiSong.coverImageUrl,
      duration: apiSong.duration // original milliseconds
    }
  };
};

/**
 * Transform multiple API songs
 */
export const transformApiSongs = (apiSongs) => {
  if (!Array.isArray(apiSongs)) return [];
  return apiSongs.map(transformApiSong).filter(Boolean);
};

/**
 * Convert milliseconds to MM:SS format
 */
export const formatDurationFromMs = (milliseconds) => {
  if (!milliseconds || isNaN(milliseconds)) return "0:00";
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Convert MM:SS format to milliseconds
 */
export const parseDurationToMs = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  
  return (minutes * 60 + seconds) * 1000;
};

/**
 * Fetch all songs from API with authentication
 */
export const fetchSongs = async () => {
  try {
    console.log('🎵 Fetching songs...')
    const response = await api.get('/audios')
    
    // Handle different response structures
    const songsData = response.data?.data?.audios || response.data?.audios || []
    
    if (!Array.isArray(songsData)) {
      throw new Error('Invalid response format: expected array of songs')
    }
    
    const transformedSongs = transformApiSongs(songsData)
    console.log(`✅ Successfully fetched ${transformedSongs.length} songs`)
    
    return transformedSongs
  } catch (error) {
    console.error('❌ Error fetching songs:', error)
    
    // Provide more specific error messages
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message
      
      switch (status) {
        case 401:
          throw new Error('Authentication required. Please log in.')
        case 403:
          throw new Error('Access denied. You may not have permission to view songs.')
        case 404:
          throw new Error('Songs not found. The API endpoint may have changed.')
        case 500:
          throw new Error('Server error. Please try again later.')
        case 503:
          throw new Error('Service temporarily unavailable. Please try again later.')
        default:
          throw new Error(`API Error (${status}): ${message}`)
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.')
    } else {
      throw new Error(error.message || 'Unknown error occurred')
    }
  }
}

/**
 * Fetch songs with retry logic
 */
export const fetchSongsWithRetry = async (maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchSongs()
    } catch (error) {
      console.log(`❌ Fetch attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}

/**
 * Fetch a specific song by ID
 */
export const fetchSongById = async (songId) => {
  try {
    console.log(`🎵 Fetching song ID: ${songId}`)
    const response = await api.get(`/audios/${songId}`)
    const songData = response.data?.data || response.data
    
    return transformApiSong(songData)
  } catch (error) {
    console.error(`❌ Error fetching song ${songId}:`, error)
    throw error
  }
}

/**
 * Upload a new song (authenticated)
 */
export const uploadSong = async (formData) => {
  try {
    console.log('📤 Uploading song...')
    
    // Create upload-specific API instance
    const uploadAPI = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: 60000, // 60 seconds for uploads
      headers: {
        // Don't set Content-Type for FormData - let axios set it with boundary
      }
    })
    
    // Add the same response interceptor
    uploadAPI.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (
          error.response?.status === 401 && 
          !originalRequest._retry && 
          !originalRequest.url?.includes('refresh-token')
        ) {
          originalRequest._retry = true
          
          try {
            const refreshResult = await refreshAccessToken()
            
            if (refreshResult.success) {
              return uploadAPI(originalRequest)
            }
          } catch (refreshError) {
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
            return Promise.reject(refreshError)
          }
        }
        
        return Promise.reject(error)
      }
    )
    
    const response = await uploadAPI.post('/api/audios/upload', formData)
    
    console.log('✅ Song upload successful:', response.data)
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Song uploaded successfully!'
    }
  } catch (error) {
    console.error('❌ Song upload failed:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Upload failed. Please try again.',
      error: error.response?.data || error.message
    }
  }
}

/**
 * Search songs (client-side filtering since API doesn't support search)
 */
export const searchSongs = async (query, limit = 50) => {
  try {
    const songs = await fetchSongs()
    
    if (!query || query.trim() === '') return songs.slice(0, limit)
    
    const searchQuery = query.toLowerCase().trim()
    const filteredSongs = songs.filter(song =>
      song.title?.toLowerCase().includes(searchQuery) ||
      song.artist?.toLowerCase().includes(searchQuery) ||
      song.genre?.toLowerCase().includes(searchQuery) ||
      song.album?.toLowerCase().includes(searchQuery)
    )
    
    return filteredSongs.slice(0, limit)
  } catch (error) {
    console.error('❌ Error searching songs:', error)
    throw error
  }
}

/**
 * Get user's favorite songs
 */
export const fetchUserFavorites = async () => {
  try {
    console.log('❤️ Fetching user favorites...')
    const response = await api.get('/api/users/favorites')
    
    const favoritesData = response.data?.data || response.data?.favorites || []
    return transformApiSongs(favoritesData)
  } catch (error) {
    console.error('❌ Error fetching favorites:', error)
    throw error
  }
}

/**
 * Add song to favorites
 */
export const addToFavorites = async (songId) => {
  try {
    console.log(`❤️ Adding song ${songId} to favorites...`)
    const response = await api.post(`/api/users/favorites/${songId}`)
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Added to favorites!'
    }
  } catch (error) {
    console.error('❌ Error adding to favorites:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add to favorites.',
      error: error.response?.data || error.message
    }
  }
}

/**
 * Remove song from favorites
 */
export const removeFromFavorites = async (songId) => {
  try {
    console.log(`💔 Removing song ${songId} from favorites...`)
    const response = await api.delete(`/api/users/favorites/${songId}`)
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Removed from favorites!'
    }
  } catch (error) {
    console.error('❌ Error removing from favorites:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to remove from favorites.',
      error: error.response?.data || error.message
    }
  }
}

/**
 * Get user's uploaded songs
 */
export const fetchUserUploads = async () => {
  try {
    console.log('📤 Fetching user uploads...')
    const response = await api.get('/api/users/uploads')
    
    const uploadsData = response.data?.data || response.data?.uploads || []
    return transformApiSongs(uploadsData)
  } catch (error) {
    console.error('❌ Error fetching uploads:', error)
    throw error
  }
}

/**
 * Delete user's uploaded song
 */
export const deleteUpload = async (songId) => {
  try {
    console.log(`🗑️ Deleting song ${songId}...`)
    const response = await api.delete(`/api/audios/${songId}`)
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Song deleted successfully!'
    }
  } catch (error) {
    console.error('❌ Error deleting song:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete song.',
      error: error.response?.data || error.message
    }
  }
}

/**
 * Filter songs by genre
 */
export const filterSongsByGenre = (songs, genre) => {
  if (!genre || genre === 'all') return songs;
  return songs.filter(song => 
    song.genre?.toLowerCase() === genre.toLowerCase()
  );
};

/**
 * Filter songs by category
 */
export const filterSongsByCategory = (songs, category) => {
  if (!category || category === 'all') return songs;
  return songs.filter(song => 
    song.category?.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Get unique genres from songs
 */
export const getUniqueGenres = (songs) => {
  const genres = songs
    .map(song => song.genre)
    .filter(Boolean)
    .filter((genre, index, array) => array.indexOf(genre) === index)
    .sort()
  
  return ['all', ...genres]
}

/**
 * Get unique categories from songs
 */
export const getUniqueCategories = (songs) => {
  const categories = songs
    .map(song => song.category)
    .filter(Boolean)
    .filter((category, index, array) => array.indexOf(category) === index)
    .sort()
  
  return ['all', ...categories]
}

/**
 * Get songs by uploader
 */
export const getSongsByUploader = (songs, uploaderId) => {
  return songs.filter(song => 
    song.uploadedBy?._id === uploaderId
  );
}

/**
 * Get random songs
 */
export const getRandomSongs = (songs, count = 10) => {
  const shuffled = [...songs].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Get featured songs (first N songs, or implement your own logic)
 */
export const getFeaturedSongs = (songs, count = 8) => {
  return songs.slice(0, count)
}

/**
 * Get trending songs (implement your own logic based on play count, etc.)
 */
export const getTrendingSongs = (songs, count = 6) => {
  // For now, return a random selection
  // In a real app, you might sort by play count, recent popularity, etc.
  return getRandomSongs(songs, count)
}

/**
 * API Health Check (unauthenticated)
 */
export const checkApiHealth = async () => {
  try {
    // Use a separate instance without auth for health check
    const healthAPI = axios.create({
      baseURL: API_BASE_URL,
      timeout: 5000
    })
    
    const response = await healthAPI.get('/health')
    return response.status === 200
  } catch (error) {
    console.warn('⚠️ API health check failed:', error.message)
    return false
  }
}

/**
 * Get API status and statistics (authenticated)
 */
export const getApiStatus = async () => {
  try {
    const response = await api.get('/audios')
    
    const songs = response.data?.data?.audios || response.data?.audios || []
    
    return {
      isHealthy: true,
      totalSongs: songs.length,
      genres: getUniqueGenres(transformApiSongs(songs)).length - 1, // -1 for 'all'
      categories: getUniqueCategories(transformApiSongs(songs)).length - 1,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message,
      lastChecked: new Date().toISOString()
    }
  }
}

/**
 * Helper function for making any authenticated API request
 */
export const makeAuthenticatedRequest = async (requestConfig) => {
  try {
    return await api(requestConfig)
  } catch (error) {
    // Error handling and retry is done by the interceptor
    throw error
  }
}