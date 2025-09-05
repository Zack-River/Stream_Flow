import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { PuffLoader } from 'react-spinners'
import SongCard from "../songCard/SongCard.jsx"
import { ToastContainer, useToast } from "../common/Toast"
import { useSearch } from "../../hooks/useDebounce"
import { useAuth } from "../../context/AuthContext"
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
import AuthenticationModals from "../authentication/AuthenticationModals.jsx"

export default function HomePage() {
  const { searchQuery: externalSearchQuery, clearSearch: externalClearSearch } = useOutletContext()
  const { isAuthenticated, user } = useAuth()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [retryCount, setRetryCount] = useState(0)
  const [apiStatus, setApiStatus] = useState(null)

  // Authentication modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("signin")

  // Enhanced Toast hook with FIFO queue (max 4 toasts)
  const {
    toasts,
    removeToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showUniqueToast,
    showWelcomeToast,
    showRegistrationToast,
    showAuthToast
  } = useToast(4)

  // Debounced search hook
  const {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
    setSearchQuery
  } = useSearch(
    searchApiSongs, // search function
    500, // 500ms debounce delay
    (message, type, duration) => showUniqueToast(message, type, duration) // toast function
  )

  const truncate = (text, maxLength = 50) => {
    if (!text || typeof text !== 'string') return text
    const trimmed = text.trim()
    return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed
  }

  // Authentication handlers
  const handleAuthRequired = (mode = 'signin') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (userData, isRegistration = false) => {
    console.log('Authentication successful from HomePage:', userData)
    
    // Show appropriate welcome toast
    if (isRegistration) {
      showRegistrationToast(userData?.username || userData?.name || 'User')
    } else {
      showWelcomeToast(userData?.username || userData?.name || 'User')
    }
  }

  // Sync external search query with internal search
  useEffect(() => {
    if (externalSearchQuery !== searchQuery) {
      if (externalSearchQuery === "") {
        clearSearch()
      } else {
        setSearchQuery(externalSearchQuery)
        handleSearchChange(externalSearchQuery)
      }
    }
  }, [externalSearchQuery, searchQuery, handleSearchChange, clearSearch, setSearchQuery])

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

      // Show info toast for background refresh
      if (!showLoadingSpinner && apiSongs.length > 0) {
        showInfoToast(`Refreshed ${apiSongs.length} songs`, 2000)
      }

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

      // Show error toast for background operations
      if (!showLoadingSpinner) {
        showErrorToast('Failed to refresh songs', 3000)
      }
    } finally {
      if (showLoadingSpinner) {
        setLoading(false)
      }
    }
  }

  // Clear search and reload all songs
  const handleClearSearch = () => {
    clearSearch()
    if (externalClearSearch) {
      externalClearSearch()
    }
    getAllSongs()
    showInfoToast('Showing all songs', 2000)
  }

  // Retry with exponential backoff
  const handleRetry = () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)

    showInfoToast(`Retrying... (attempt ${newRetryCount})`, 2000)

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

  // Determine which songs to display
  const displaySongs = searchQuery ? searchResults : songs
  const truncatedSearchQuery = truncate(searchQuery, 50)
  
  // Get unique genres for filter
  const availableGenres = getUniqueGenres(displaySongs)

  // Filter songs by selected genre
  const filteredSongs = filterSongsByGenre(displaySongs, selectedGenre)

  // Get featured songs (first 8 songs)
  const featuredSongs = getFeaturedSongs(filteredSongs, 8)

  // Get trending songs (random selection from remaining)
  const remainingSongs = filteredSongs.slice(8)
  const trendingSongs = getTrendingSongs(remainingSongs, 6)

  // Loading state
  if ((loading && songs.length === 0) || (isSearching && searchResults.length === 0 && searchQuery)) {
    return (
      <>
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <HeroSection />

          {/* Loading State with PuffLoader */}
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 space-y-3 sm:space-y-4">
            <PuffLoader
              color="#7C3AED"
              size={60}
              className="sm:w-20 sm:h-20"
              loading={true}
            />
            <div className="text-center px-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-1 sm:mb-2">
                {isSearching ? 'Searching...' : 'Loading your music...'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {isSearching ? `Searching for "${truncatedSearchQuery}"` : 'Fetching songs from our collection'}
              </p>
              {retryCount > 0 && !isSearching && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                  Retry attempt {retryCount}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthenticationModals
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
          showAuthToast={showAuthToast}
        />
        
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </>
    )
  }

  // Error state
  if (error && songs.length === 0 && !searchQuery) {
    return (
      <>
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <HeroSection />

          {/* Error State */}
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4">
            <div className="text-red-500 text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">⚠️</div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
              Oops! Something went wrong
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 text-center max-w-sm sm:max-w-md">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
              <button
                onClick={handleRetry}
                disabled={loading}
                className="bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {retryCount > 0 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Failed attempts: {retryCount}
              </p>
            )}
          </div>
        </div>

        {/* Authentication Modal */}
        <AuthenticationModals
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
          showAuthToast={showAuthToast}
        />
        
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <HeroSection />
        
        {/* Genre Filter */}
        {availableGenres.length > 1 && !searchQuery && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 -mx-1">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm shadow-md font-medium whitespace-nowrap transition-colors flex-shrink-0 ${selectedGenre === genre
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{displaySongs.length}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              {searchQuery ? 'Search Results' : 'Total Songs'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{availableGenres.length - 1}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Genres</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{featuredSongs.length}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Featured</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{trendingSongs.length}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Trending</p>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                Search Results for "{truncatedSearchQuery}"
                {isSearching && <span className="ml-2 text-xs sm:text-sm text-gray-500">(searching...)</span>}
              </h2>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''}
              </span>
            </div>
            {filteredSongs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {filteredSongs.map((song) => (
                  <SongCard 
                    key={song.id} 
                    song={song} 
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            ) : !isSearching ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4">
                <div className="text-gray-400 text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🔍</div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                  No Results Found
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-sm sm:max-w-md mb-4">
                  No songs found for "{truncatedSearchQuery}". Try different keywords or check your spelling.
                </p>
                <button
                  onClick={handleClearSearch}
                  className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors"
                >
                  Browse All Songs
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Featured Songs - Only show if not searching */}
        {!searchQuery && featuredSongs.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Featured Songs</h2>
              {selectedGenre !== 'all' && (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedGenre} • {featuredSongs.length} song{featuredSongs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {featuredSongs.map((song) => (
                <SongCard 
                  key={song.id} 
                  song={song} 
                  onAuthRequired={handleAuthRequired}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Now - Only show if not searching */}
        {!searchQuery && trendingSongs.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Trending Now</h2>
              {selectedGenre !== 'all' && (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedGenre} • {trendingSongs.length} song{trendingSongs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {trendingSongs.map((song) => (
                <SongCard 
                  key={`trending-${song.id}`} 
                  song={song} 
                  onAuthRequired={handleAuthRequired}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Songs - Only show if not searching and there are more songs */}
        {!searchQuery && filteredSongs.length > featuredSongs.length + trendingSongs.length && (
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">All Songs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {filteredSongs.slice(featuredSongs.length + trendingSongs.length).map((song) => (
                <SongCard 
                  key={`all-${song.id}`} 
                  song={song} 
                  onAuthRequired={handleAuthRequired}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Songs Available */}
        {!searchQuery && songs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4">
            <div className="text-gray-400 text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎵</div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">No Songs Available</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-sm sm:max-w-md mb-4">
              There are no songs available at the moment. Check back later or try refreshing the page.
            </p>
            <button
              onClick={() => getAllSongs()}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}

        {/* No Songs for Selected Genre */}
        {!searchQuery && songs.length > 0 && filteredSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4">
            <div className="text-gray-400 text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎭</div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
              No {selectedGenre} Songs Found
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-sm sm:max-w-md mb-4">
              No songs found for the selected genre. Try selecting a different genre.
            </p>
            <button
              onClick={() => setSelectedGenre('all')}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors"
            >
              Show All Songs
            </button>
          </div>
        )}

        {/* Loading Overlay for Background Operations */}
        {(loading && songs.length > 0) || (isSearching && searchResults.length > 0) && (
          <div className="fixed top-12 sm:top-14 right-2 sm:right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 z-50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <PuffLoader
                color="#7C3AED"
                size={16}
                className="sm:w-5 sm:h-5"
                loading={true}
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {isSearching ? 'Searching...' : 'Refreshing...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthenticationModals
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        showAuthToast={showAuthToast}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  )
}