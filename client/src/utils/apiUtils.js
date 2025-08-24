
// utils/apiUtils.js
import axios from 'axios'

// API Configuration
const API_BASE_URL = 'https://stream-flow-api.onrender.com'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API response from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
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
 * Fetch all songs from API
 */
export const fetchSongs = async () => {
  try {
    const response = await api.get('/audios')
    
    // Handle different response structures
    const songsData = response.data?.data?.audios || response.data?.audios || []
    
    if (!Array.isArray(songsData)) {
      throw new Error('Invalid response format: expected array of songs')
    }
    
    const transformedSongs = transformApiSongs(songsData)
    console.log(`Successfully fetched ${transformedSongs.length} songs`)
    
    return transformedSongs
  } catch (error) {
    console.error('Error fetching songs:', error)
    
    // Provide more specific error messages
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const message = error.response.data?.message || error.message
      
      switch (status) {
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
      // Network error
      throw new Error('Network error. Please check your internet connection.')
    } else {
      // Other error
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
      console.log(`Fetch attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}

/**
 * Fetch a specific song by ID
 */
export const fetchSongById = async (songId) => {
  try {
    const response = await api.get(`/audios/${songId}`)
    const songData = response.data?.data || response.data
    
    return transformApiSong(songData)
  } catch (error) {
    console.error(`Error fetching song ${songId}:`, error)
    throw error
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
    console.error('Error searching songs:', error)
    throw error
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
 * API Health Check
 */
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 })
    return response.status === 200
  } catch (error) {
    console.warn('API health check failed:', error.message)
    return false
  }
}

/**
 * Get API status and statistics
 */
export const getApiStatus = async () => {
  try {
    const [songsResponse] = await Promise.all([
      api.get('/audios')
    ])
    
    const songs = songsResponse.data?.data?.audios || songsResponse.data?.audios || []
    
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