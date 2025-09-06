import { ListMusic, Edit2, Trash2, X, Search } from "lucide-react"
import SongCard from "../songCard/SongCard.jsx"
import { useMusic } from "../../context/MusicContext"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import { useState, useEffect } from "react"
import { usePageSearch } from "../../hooks/usePageSearch"

// Edit Playlist Modal Component
const EditPlaylistModal = ({ isOpen, onClose, playlist, onUpdatePlaylist }) => {
  const [name, setName] = useState(playlist?.name || "")
  const [description, setDescription] = useState(playlist?.description || "")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen && playlist) {
      setName(playlist.name || "")
      setDescription(playlist.description || "")
      setIsVisible(true)
    }
  }, [isOpen, playlist])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setName(playlist?.name || "")
      setDescription(playlist?.description || "")
      onClose()
    }, 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onUpdatePlaylist(name.trim(), description.trim())
      handleClose()
    }
  }

  if (!isOpen || !playlist) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[60] p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className={`card rounded-2xl w-full max-w-md shadow-2xl mt-8 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Playlist</h2>
          <button
            onClick={handleClose}
            className="btn-ghost p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Playlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Enter playlist name"
              className="input-primary w-full px-3 py-2 rounded-lg text-sm placeholder-gray-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your playlist"
              maxLength={70}
              rows={3}
              className="input-primary w-full px-3 py-2 rounded-lg text-sm placeholder-gray-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}

// Delete Playlist Confirmation Modal Component
const DeletePlaylistModal = ({ isOpen, onClose, playlist, onConfirmDelete }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !playlist) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="card rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center">Delete Playlist</h3>

        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm text-center">
          Are you sure you want to delete <span className="font-semibold">"{playlist.name}"</span>?
        </p>

        <p className="text-gray-500 dark:text-gray-500 mb-4 sm:mb-6 text-xs text-center">
          This action cannot be undone and will remove all {playlist.songs?.length || 0} songs from this playlist.
        </p>

        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlaylistPage() {
  const { state, deletePlaylist, updatePlaylist } = useMusic()
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const { searchQuery: externalSearchQuery, clearSearch: externalClearSearch } = useOutletContext()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Find the specific playlist by ID
  const playlist = state.playlists?.find(p => p.id === playlistId)
  const playlistSongs = playlist?.songs || []

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
  } = usePageSearch(playlistSongs)

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

  const handleUpdatePlaylist = (name, description) => {
    updatePlaylist(playlistId, { name, description })
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    deletePlaylist(playlistId)
    setShowDeleteModal(false)
    navigate("/")
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

  // Handle case where playlist is not found
  if (!playlist) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <ListMusic className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Playlist not found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          The playlist you're looking for doesn't exist.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? `Search in ${playlist.name}` : playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                {playlist.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                {searchQuery 
                  ? `${searchResults.length} of ${playlistSongs.length}`
                  : playlistSongs.length
                } {(searchQuery ? searchResults.length : playlistSongs.length) === 1 ? 'song' : 'songs'}
              </span>
            </div>
            {searchQuery && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Results for "{truncatedSearchQuery}" in this playlist
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-ghost flex items-center space-x-2 px-4 py-2 rounded-xl hover:text-purple-600 dark:hover:text-purple-400"
              title="Edit playlist"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="btn-ghost flex items-center space-x-2 px-4 py-2 rounded-xl hover:text-red-600 dark:hover:text-red-400"
              title="Delete playlist"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && playlistSongs.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Searching in this playlist
                {isLocalSearch && <span className="ml-1 text-xs">(local search)</span>}
              </span>
            </div>
            {searchResults.length > 0 && (
              <button
                onClick={handleClearSearch}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium self-start sm:self-center"
              >
                Show all songs
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {playlistSongs.length === 0 ? (
          // No songs in playlist
          <div className="text-center py-10">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ListMusic className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              No songs in this playlist yet
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-8 max-w-md mx-auto">
              Start building your playlist by adding your favorite songs from your library.
            </p>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          // No search results
          <div className="text-center py-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No matching songs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 max-w-sm mx-auto">
              No songs in this playlist match "{truncatedSearchQuery}"
            </p>
            <button
              onClick={handleClearSearch}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors"
            >
              Show All Songs
            </button>
          </div>
        ) : (
          // Show songs grid
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4">
            {searchResults.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlist={playlist}
        onUpdatePlaylist={handleUpdatePlaylist}
      />

      {/* Delete Playlist Confirmation Modal */}
      <DeletePlaylistModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        playlist={playlist}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}