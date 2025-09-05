import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Library, Plus, Heart, X, Upload, ListMusic } from "lucide-react"
import UploadModal from "../uploads/UploadModal"
import { useMusic } from "../../context/MusicContext"

// Create Playlist Modal Component
const CreatePlaylistModal = ({ isOpen, onClose, onCreatePlaylist }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

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
      setName("")
      setDescription("")
      onClose()
    }, 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onCreatePlaylist(name.trim(), description.trim())
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl mt-8 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Create Playlist</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Playlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400"
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Playlist
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const location = useLocation()
  const { state, createPlaylist } = useMusic()

  const libraryItems = [
    { path: "/uploads", icon: Upload, label: "Your Uploads" },
    { path: "/favorites", icon: Heart, label: "Liked Songs" },
  ]

  const handleMobileClose = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  const isActive = (path) => location.pathname === path

  const handleCreatePlaylist = (name, description) => {
    createPlaylist(name, description)
  }

  return (
    <>
      {/* MOBILE: Full-screen overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* MOBILE-FIRST: Reduced width and padding on mobile */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 
          w-80 sm:w-72 lg:w-72
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg 
          border-r border-gray-200/50 dark:border-gray-700/50 
          transform transition-all duration-200 ease-in-out shadow-2xl overflow-y-auto
          px-4 py-3 sm:px-6 sm:py-4
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full
        `}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* MOBILE: Header with close button */}
          <div className="py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Library className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Your Library</h2>
              </div>
              {/* MOBILE: Close button visible on mobile */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MOBILE: Library Items with better touch targets */}
          <div className="py-2">
            <nav className="space-y-1">
              {libraryItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleMobileClose}
                  className={`flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 w-full text-left min-h-[48px] ${isActive(item.path)
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* MOBILE: Playlists section */}
          <div className="py-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Playlists ({state.playlists?.length || 0})
              </h3>
              <button
                onClick={() => setShowCreatePlaylist(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full duration-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Create new playlist"
                aria-label="Create new playlist"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <nav className="space-y-1">
              {state.playlists?.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  onClick={handleMobileClose}
                  className={`flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 w-full text-left min-h-[48px] ${isActive(`/playlist/${playlist.id}`)
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  <ListMusic className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate text-sm sm:text-base">{playlist.name}</span>
                    {playlist.songs?.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <hr className="border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" />

          {/* MOBILE: Upload Button with enhanced styling */}
          <div className="my-4 sm:my-6 flex-shrink-0 relative">
            {/* Wrapper for the Upload Button animation */}
            <div className="uploadButton rounded-xl p-0.5">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full text-black dark:text-white bg-white dark:bg-gray-900 
                font-medium py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 transform
                min-h-[48px] flex items-center justify-center space-x-3"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm sm:text-base">Upload Song</span>
              </button>
            </div>
          </div>

          {/* MOBILE: Bottom spacing for better UX */}
          <div className="bg-white/95 dark:bg-gray-800/95 pb-20 lg:pb-10 flex-shrink-0">
            {/* Intentional spacing for mobile audio player */}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreatePlaylist={handleCreatePlaylist}
      />
    </>
  )
}