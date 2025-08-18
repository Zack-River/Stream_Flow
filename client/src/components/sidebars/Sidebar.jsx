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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
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
    // Restore body scroll before closing
    document.body.style.overflow = 'unset'
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
      aria-describedby="create-playlist-description"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl mt-8 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="create-playlist-title" className="text-xl font-bold text-gray-900 dark:text-white">Create Playlist</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close create playlist dialog"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Playlist Name *
            </label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400"
              autoFocus
              required
              aria-describedby="playlist-name-help"
            />
            <p id="playlist-name-help" className="sr-only">Enter a name for your new playlist</p>
          </div>

          <div>
            <label htmlFor="playlist-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your playlist"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400 resize-none"
              aria-describedby="playlist-description-help"
            />
            <p id="playlist-description-help" className="sr-only">Optional description for your playlist</p>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-describedby={!name.trim() ? "playlist-name-required" : undefined}
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
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-menu"
        className={`
          fixed lg:relative inset-y-0 px-6 py-4 left-0 z-50 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-200 ease-in-out shadow-2xl overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full
        `}
        role="complementary"
        aria-label="Music library navigation"
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Your Library Header */}
          <header className="py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Library className="w-6 h-6 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Library</h2>
              </div>
              {/* Close button for mobile - only visible on mobile */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Library Items */}
          <nav className="py-2" aria-label="Library navigation">
            <ul className="space-y-1" role="list">
              {libraryItems.map((item) => (
                <li key={item.path} role="listitem">
                  <Link
                    to={item.path}
                    onClick={handleMobileClose}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${isActive(item.path)
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    aria-current={isActive(item.path) ? "page" : undefined}
                  >
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Playlists */}
          <section className="py-2" aria-labelledby="playlists-heading">
            <div className="flex items-center justify-between mb-3">
              <h3 id="playlists-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Playlists ({state.playlists?.length || 0})
              </h3>
              <button
                onClick={() => setShowCreatePlaylist(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full duration-200 transition-colors"
                title="Create new playlist"
                aria-label="Create new playlist"
              >
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Playlists">
              <ul className="space-y-1" role="list">
                {state.playlists?.map((playlist) => (
                  <li key={playlist.id} role="listitem">
                    <Link
                      to={`/playlist/${playlist.id}`}
                      onClick={handleMobileClose}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${isActive(`/playlist/${playlist.id}`)
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      aria-current={isActive(`/playlist/${playlist.id}`) ? "page" : undefined}
                    >
                      <ListMusic className="w-5 h-5" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{playlist.name}</span>
                        {playlist.songs?.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <hr className="border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" />

          {/* Upload Button */}
          <div className="my-6 flex-shrink-0 relative">
            {/* wrapper for the Upload Button animation */}
            <div className="uploadButton rounded-xl p-0.5">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full text-black dark:text-white bg-white dark:bg-gray-900 
                font-medium py-3 px-6 rounded-xl transition-all duration-200 transform shadow-md"
                aria-label="Upload new song"
              >
                <div className="flex items-center space-x-3 justify-center">
                  <Upload className="w-5 h-5" aria-hidden="true" />
                  <span>Upload Song</span>
                </div>
              </button>
            </div>
          </div>
          {/* intended Space */}
          <div className="bg-white dark:bg-gray-800 my-10">ㅤ</div>

        </div>
      </aside>

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