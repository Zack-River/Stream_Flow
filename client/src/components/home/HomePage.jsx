import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { PuffLoader } from 'react-spinners'
import SongCard from "../songCard/SongCard.jsx"
import {
  fetchSongsWithRetry,
  filterSongsByGenre,
  getUniqueGenres,
  getFeaturedSongs,
  getTrendingSongs,
  searchSongs as searchApiSongs,
  getApiStatus
} from "../../utils/apiUtils.js"
import HeroSection from "./HeroSection.jsx"

export default function HomePage() {
  const { searchQuery, clearSearch } = useOutletContext()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [retryCount, setRetryCount] = useState(0)
  const [apiStatus, setApiStatus] = useState(null)

  // Get all songs from API with retry logic
  const getAllSongs = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true)
      }
      setError(null)

      console.log('Fetching songs from API...')
      const apiSongs = await fetchSongsWithRetry(3, 1000)

      setSongs(apiSongs)
      setRetryCount(0)
      console.log(`Successfully loaded ${apiSongs.length} songs`)

      // Get API status
      const status = await getApiStatus()
      setApiStatus(status)

    } catch (err) {
      console.error('Error loading songs:', err)
      setError(err.message || 'Failed to load songs. Please try again.')
      setSongs([]) // Fallback to empty array

      // Set failed API status
      setApiStatus({
        isHealthy: false,
        error: err.message,
        lastChecked: new Date().toISOString()
      })
    } finally {
      if (showLoadingSpinner) {
        setLoading(false)
      }
    }
  }

  // Handle search from navbar
  const handleSearch = async (query) => {
    if (!query.trim()) {
      return
    }

    try {
      setLoading(true)

      const searchResults = await searchApiSongs(query, 100)
      setSongs(searchResults)
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Effect to handle search from navbar
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      handleSearch(searchQuery)
    } else if (searchQuery === "" && songs.length === 0) {
      getAllSongs()
    }
  }, [searchQuery])

  // Clear search and reload all songs
  const handleClearSearch = () => {
    if (clearSearch) {
      clearSearch()
    }
    getAllSongs()
  }

  // Retry with exponential backoff
  const handleRetry = () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)

    // Add delay for retries
    const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 10000)
    setTimeout(() => {
      getAllSongs()
    }, delay)
  }

  // Auto-refresh every 5 minutes if page is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && songs.length === 0 && !searchQuery) {
        getAllSongs(false) // Don't show loading spinner for background refresh
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [songs.length, searchQuery])

  // Initial load
  useEffect(() => {
    if (!searchQuery) {
      getAllSongs()
    }
  }, [])

  // Get unique genres for filter
  const availableGenres = getUniqueGenres(songs)

  // Filter songs by selected genre
  const filteredSongs = filterSongsByGenre(songs, selectedGenre)

  // Get featured songs (first 8 songs)
  const featuredSongs = getFeaturedSongs(filteredSongs, 8)

  // Get trending songs (random selection from remaining)
  const remainingSongs = filteredSongs.slice(8)
  const trendingSongs = getTrendingSongs(remainingSongs, 6)

  // Loading state
  if (loading && songs.length === 0) {
    return (
      <div className="space-y-8">
        <HeroSection />

        {/* Loading State with PuffLoader */}
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <PuffLoader
            color="#7C3AED"
            size={80}
            loading={true}
          />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Loading your music...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fetching songs from our collection
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Retry attempt {retryCount}...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && songs.length === 0) {
    return (
      <div className="space-y-8">
        <HeroSection />

        {/* Error State */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
            {error}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              Failed attempts: {retryCount}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <HeroSection />

      {/* API Status Indicator */}
      {/* {apiStatus && (
        <div className={`text-center py-2 px-4 rounded-lg text-sm ${
          apiStatus.isHealthy 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
        }`}>
          {apiStatus.isHealthy ? (
            <span>🟢 Connected to StreamFlow API</span>
          ) : (
            <span>🟡 API connection issues detected</span>
          )}
        </div>
      )} */}

      {/* Genre Filter */}
      {availableGenres.length > 1 && !searchQuery && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm shadow-md font-medium whitespace-nowrap transition-colors ${selectedGenre === genre
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {genre === 'all' ? 'All Genres' : genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Songs Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <h3 className="text-2xl font-bold text-purple-600">{songs.length}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {searchQuery ? 'Search Results' : 'Total Songs'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <h3 className="text-2xl font-bold text-green-600">{availableGenres.length - 1}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Genres</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <h3 className="text-2xl font-bold text-blue-600">{featuredSongs.length}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Featured</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <h3 className="text-2xl font-bold text-orange-600">{trendingSongs.length}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Trending</p>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Search Results for "{searchQuery}"
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filteredSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                No Results Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
                No songs found for "{searchQuery}". Try different keywords or check your spelling.
              </p>
              <button
                onClick={handleClearSearch}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Browse All Songs
              </button>
            </div>
          )}
        </div>
      )}

      {/* Featured Songs - Only show if not searching */}
      {!searchQuery && featuredSongs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Songs</h2>
            {selectedGenre !== 'all' && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedGenre} • {featuredSongs.length} song{featuredSongs.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {featuredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* Trending Now - Only show if not searching */}
      {!searchQuery && trendingSongs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending Now</h2>
            {selectedGenre !== 'all' && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedGenre} • {trendingSongs.length} song{trendingSongs.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={`trending-${song.id}`} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* All Songs - Only show if not searching and there are more songs */}
      {!searchQuery && filteredSongs.length > featuredSongs.length + trendingSongs.length && (
        <div>
          <h2 className="text-2xl font-bold mb-6">All Songs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSongs.slice(featuredSongs.length + trendingSongs.length).map((song) => (
              <SongCard key={`all-${song.id}`} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* No Songs Available */}
      {!searchQuery && songs.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Songs Available</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
            There are no songs available at the moment. Check back later or try refreshing the page.
          </p>
          <button
            onClick={() => getAllSongs()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* No Songs for Selected Genre */}
      {!searchQuery && songs.length > 0 && filteredSongs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No {selectedGenre} Songs Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
            No songs found for the selected genre. Try selecting a different genre.
          </p>
          <button
            onClick={() => setSelectedGenre('all')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Show All Songs
          </button>
        </div>
      )}

      {/* Loading Overlay for Background Operations */}
      {loading && songs.length > 0 && (
        <div className="fixed top-14 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <PuffLoader
              color="#7C3AED"
              size={20}
              loading={true}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Searching...' : 'Refreshing...'}
            </span>
          </div>
        </div>
      )}

      {/* Error Toast for Background Operations */}
      {error && songs.length > 0 && (
        <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 z-50 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-lg">⚠️</div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Update Failed
              </h4>
              <p className="text-xs text-red-600 dark:text-red-300 mb-2">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}