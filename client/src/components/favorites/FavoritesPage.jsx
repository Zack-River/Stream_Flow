import { useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { Heart, Search } from "lucide-react"
import SongCard from "../songCard/SongCard.jsx"
import { useMusic } from "../../context/MusicContext"
import { usePageSearch } from "../../hooks/usePageSearch"

export default function FavoritesPage() {
  const { state } = useMusic()
  const { searchQuery: externalSearchQuery, clearSearch: externalClearSearch } = useOutletContext()
  
  // Use the new page search hook for local searching
  const {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
    setSearchQuery,
    hasResults,
    isLocalSearch,
    searchStats
  } = usePageSearch(state.favorites)

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

  // Clear search handler
  const handleClearSearch = () => {
    clearSearch()
    if (externalClearSearch) {
      externalClearSearch()
    }
  }

  const truncate = (text, maxLength = 50) => {
    if (!text || typeof text !== 'string') return text
    const trimmed = text.trim()
    return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed
  }

  const truncatedSearchQuery = truncate(searchQuery, 50)

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {searchQuery ? `Search in Liked Songs` : 'Liked Songs'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {searchQuery 
              ? `Results for "${truncatedSearchQuery}" in your favorites`
              : 'Your favorite tracks'
            }
          </p>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {searchQuery 
            ? `${searchResults.length} of ${state.favorites.length}`
            : state.favorites.length
          } {(searchQuery ? searchResults.length : state.favorites.length) === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Searching in your liked songs
              {isLocalSearch && <span className="ml-1 text-xs">(local search)</span>}
            </span>
          </div>
          {searchResults.length > 0 && (
            <button
              onClick={handleClearSearch}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium self-start sm:self-center"
            >
              Show all favorites
            </button>
          )}
        </div>
      )}
      
      {/* Content */}
      {state.favorites.length === 0 ? (
        // No favorites at all
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No favorites yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 max-w-sm mx-auto">
            Like some songs to see them here!
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm max-w-xs mx-auto">
            Click the heart icon on any song to add it to your favorites
          </p>
        </div>
      ) : searchQuery && searchResults.length === 0 ? (
        // No search results
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No matching favorites found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 max-w-sm mx-auto">
            No songs in your favorites match "{truncatedSearchQuery}"
          </p>
          <button
            onClick={handleClearSearch}
            className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors"
          >
            Show All Favorites
          </button>
        </div>
      ) : (
        // Show songs grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {searchResults.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  )
}