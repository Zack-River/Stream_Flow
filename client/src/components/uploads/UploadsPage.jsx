import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { Edit2, X, Upload, Search } from "lucide-react"
import { useMusic } from "../../context/MusicContext"
import SongCard from "../songCard/SongCard.jsx"
import UploadModal from "./UploadModal"
import { usePageSearch } from "../../hooks/usePageSearch"

export default function UploadsPage() {
  const { state } = useMusic()
  const { searchQuery: externalSearchQuery, clearSearch: externalClearSearch } = useOutletContext()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingSong, setEditingSong] = useState(null)

  // Use the new page search hook for local searching
  const {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
    setSearchQuery,
    hasResults,
    isLocalSearch
  } = usePageSearch(state.uploads || [])

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

  const songs = state.uploads || []

  const handleEditClick = (song) => {
    setEditingSong(song)
    setShowUploadModal(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  const handleUploadModalClose = () => {
    setShowUploadModal(false)
    setEditingSong(null)
  }

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
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Edit Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? `Search in Your Uploads` : 'Your Uploads'}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                {searchQuery 
                  ? `${searchResults.length} of ${songs.length}`
                  : songs.length
                } {(searchQuery ? searchResults.length : songs.length) === 1 ? 'song' : 'songs'}
              </span>
            </div>
            {searchQuery && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Results for "{truncatedSearchQuery}" in your uploads
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 self-start sm:self-center">
            {isEditMode ? (
              <button
                onClick={handleCancelEdit}
                className="btn-ghost flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="btn-ghost flex items-center space-x-2 px-3 sm:px-4 py-2 cursor-pointer rounded-lg sm:rounded-xl hover:text-purple-600 dark:hover:text-purple-400 text-sm"
                disabled={songs.length === 0}
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Songs</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && songs.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Searching in your uploads
              </span>
            </div>
            {searchResults.length > 0 && (
              <button
                onClick={handleClearSearch}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium self-start sm:self-center"
              >
                Show all uploads
              </button>
            )}
          </div>
        )}

        {/* Edit Mode Instructions */}
        {isEditMode && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-purple-800 dark:text-purple-300 font-medium text-sm sm:text-base leading-relaxed">
                Edit mode enabled. Tap on songs and click the edit button to modify their details.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {songs.length === 0 ? (
          // No uploads at all
          <div className="text-center py-8 sm:py-10 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              No songs uploaded yet
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 sm:mb-8 max-w-sm mx-auto leading-relaxed">
              Start building your music library by uploading your favorite songs.
            </p>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          // No search results
          <div className="text-center py-8 sm:py-10 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No matching uploads found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 max-w-sm mx-auto">
              No songs in your uploads match "{truncatedSearchQuery}"
            </p>
            <button
              onClick={handleClearSearch}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors"
            >
              Show All Uploads
            </button>
          </div>
        ) : (
          // Show songs grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {searchResults.map((song) => (
              <div key={song.id} className="group">
                <SongCard
                  song={song}
                  isEditMode={isEditMode}
                  onEditClick={handleEditClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={handleUploadModalClose} 
          editSong={editingSong}
        />
      )}
    </>
  )
}