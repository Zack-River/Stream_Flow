import { useState, useRef, useEffect } from "react"
import { Play, Pause, Heart, MoreHorizontal, Trash2, Music, Edit2 } from "lucide-react"
import { useMusic } from "../../context/MusicContext"

export default function SongCard({ song, isEditMode = false, onEditClick = null }) {
  const { state, dispatch } = useMusic()
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef(null)
  
  // Handle both API songs (id) and user uploads (id or _id)
  const songId = song.id || song._id
  
  const isCurrentSong = state.currentSong?.id === songId
  const isPlaying = isCurrentSong && state.isPlaying
  const isFavorite = state.favorites.some((fav) => (fav.id || fav._id) === songId)
  const isUploaded = song.isUploaded || false // API songs have isUploaded: false

  // Handle outside click and escape key for menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showMenu])

  const handlePlayPause = (e) => {
    e.stopPropagation()
    
    // Normalize song data for the player
    const normalizedSong = {
      id: songId,
      title: song.title,
      artist: song.artist || song.singer, // Handle both formats
      album: song.album,
      duration: song.duration,
      cover: song.cover || song.coverImageUrl,
      url: song.url || song.audioUrl, // Handle both formats
      isUploaded: isUploaded,
      genre: song.genre,
      category: song.category
    }
    
    if (isCurrentSong) {
      dispatch({ type: "TOGGLE_PLAY" })
    } else {
      dispatch({ type: "SET_CURRENT_SONG", payload: normalizedSong })
      dispatch({ type: "SET_PLAYING", payload: true })
    }
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    
    // Normalize song data for favorites
    const normalizedSong = {
      id: songId,
      title: song.title,
      artist: song.artist || song.singer,
      album: song.album,
      duration: song.duration,
      cover: song.cover || song.coverImageUrl,
      url: song.url || song.audioUrl,
      isUploaded: isUploaded,
      genre: song.genre,
      category: song.category
    }
    
    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: songId })
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: normalizedSong })
    }
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleMenuOption = (action, e) => {
    e.stopPropagation()
    setShowMenu(false)

    if (action === "delete") {
      setShowDeleteConfirm(true)
    }
    // TODO: Implement other menu actions like "Add to Queue", "Add to Playlist"
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    if (onEditClick) {
      onEditClick(song)
    }
  }

  const confirmDelete = () => {
    if (isCurrentSong) {
      dispatch({ type: "SET_CURRENT_SONG", payload: null })
      dispatch({ type: "SET_PLAYING", payload: false })
    }

    dispatch({ type: "REMOVE_UPLOAD", payload: songId })

    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: songId })
    }

    // Clean up blob URLs if they exist
    const audioUrl = song.url || song.audioUrl
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl)
    }

    setShowDeleteConfirm(false)
  }

  // Get display values with fallbacks
  const displayTitle = song.title || "Unknown Title"
  const displayArtist = song.artist || song.singer || "Unknown Artist"
  const displayCover = song.cover || song.coverImageUrl || "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"
  const displayDuration = song.duration || "0:00"
  const displayGenre = song.genre

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 md:p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] border border-gray-100 dark:border-gray-700 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative mb-2 sm:mb-3">
          {isUploaded && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-green-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium z-10">
              Uploaded
            </div>
          )}

          {/* Genre badge for API songs */}
          {displayGenre && !isUploaded && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-purple-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium z-10">
              {displayGenre}
            </div>
          )}

          <img
            src={displayCover}
            alt={`${displayTitle} cover`}
            className="w-full aspect-square object-cover rounded-md sm:rounded-lg"
            onError={(e) => {
              e.target.src = "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"
            }}
          />

          {/* Edit Mode Overlay */}
          {isEditMode && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={handleEditClick}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 sm:p-3 rounded-full shadow-lg transition-colors"
                title="Edit song"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* Normal Play/Pause Overlay - Only show when not in edit mode */}
          {!isEditMode && (
            <div
              className={`absolute inset-0 bg-black bg-opacity-40 rounded-md sm:rounded-lg flex items-center justify-center transition-opacity duration-200 ${
                isHovered || isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <button
                onClick={handlePlayPause}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900" />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900 ml-0.5" />
                )}
              </button>
            </div>
          )}

          {/* Heart button - Hide in edit mode */}
          {!isEditMode && (
            <button
              onClick={handleFavorite}
              className={`absolute top-1 sm:top-2 right-1 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                isFavorite ? "bg-red-500 text-white" : "bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              }`}
            >
              <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="font-semibold text-xs sm:text-sm truncate" title={displayTitle}>
            {displayTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs truncate" title={displayArtist}>
            {displayArtist}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-500 text-[9px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              {displayDuration}
            </span>
            
            {/* Menu button - Hide in edit mode */}
            {!isEditMode && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleMenuToggle}
                  className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-28 sm:w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <button
                      onClick={(e) => handleMenuOption("queue", e)}
                      className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Add to Queue
                    </button>
                    <button
                      onClick={(e) => handleMenuOption("playlist", e)}
                      className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Add to Playlist
                    </button>
                    {isUploaded && (
                      <button
                        onClick={(e) => handleMenuOption("delete", e)}
                        className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Delete</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Delete Song</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm">
              Are you sure you want to delete "{displayTitle}"? This action cannot be undone.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}