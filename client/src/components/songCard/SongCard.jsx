import { useState, useRef, useEffect } from "react"
import { Play, Pause, Heart, MoreHorizontal, Trash2, Music, Edit2 } from "lucide-react"
import { useMusic } from "../../context/MusicContext"
import { useAuth } from "../../context/AuthContext"
import { useAuthGuard } from "../../utils/authGuardUtils"
import { showErrorToast } from "../../utils/toastUtils"

export default function SongCard({
  song,
  isEditMode = false,
  onEditClick = null,
  onAuthRequired = null // Callback to open auth modal
}) {
  const { state, dispatch } = useMusic()
  const { isAuthenticated } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef(null)

  // Create authentication guards
  const {
    guardPlayAction,
    guardFavoriteAction,
    createGuardedAction
  } = useAuthGuard(isAuthenticated, onAuthRequired)

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

  // Helper function to parse and format multiple artists
  const formatArtists = (artistString) => {
    if (!artistString) return "Unknown Artist"
    
    // Clean up the string first
    let cleanedString = artistString
      .replace(/\\"/g, '"')  // Replace escaped quotes
      .replace(/^"/, '')     // Remove leading quote
      .replace(/"$/, '')     // Remove trailing quote
    
    // Try to split by quote-comma patterns first
    let artists = []
    
    // Check for the specific format like: David Guetta","Bebe Rexha
    if (cleanedString.includes('","')) {
      artists = cleanedString.split('","')
    }
    // Check for escaped quote format
    else if (cleanedString.includes('\",\"')) {
      artists = cleanedString.split('\",\"')
    }
    // Fall back to other separators
    else {
      artists = [cleanedString]
      const separators = [',', ' & ', ' and ', ' ft. ', ' feat. ', ' featuring ', '+', ' x ']
      
      for (const separator of separators) {
        if (artists.length === 1 && artists[0].includes(separator)) {
          artists = artists[0].split(separator)
          break
        }
      }
    }
    
    // Clean up each artist name
    artists = artists
      .map(artist => artist.trim())
      .map(artist => artist.replace(/^["']+|["']+$/g, '')) // Remove quotes
      .filter(artist => artist.length > 0)
      .filter(artist => !['ft', 'feat', 'featuring', 'and'].includes(artist.toLowerCase()))
    
    // Remove duplicates
    artists = [...new Set(artists)]
    
    // Format the display
    if (artists.length === 0) return "Unknown Artist"
    if (artists.length === 1) return artists[0]
    if (artists.length === 2) return `${artists[0]} & ${artists[1]}`
    if (artists.length <= 4) return artists.join(', ')
    
    // For more than 4 artists
    return `${artists.slice(0, 3).join(', ')} & ${artists.length - 3} more`
  }

  /**
   * Core play song function (unguarded)
   */
  const playSongCore = () => {
    // Normalize song data for the player
    const normalizedSong = {
      id: songId,
      title: song.title,
      artist: song.artist || song.singer, // Keep original format for internal use
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

  /**
   * Core favorite function (unguarded)
   */
  const toggleFavoriteCore = () => {
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

  /**
   * Guarded play action with authentication check
   */
  const guardedPlaySong = guardPlayAction(playSongCore, {
    errorMessage: 'You must be signed in to play music.',
    authMode: 'signin'
  })

  /**
   * Guarded favorite action with authentication check
   */
  const guardedToggleFavorite = guardFavoriteAction(toggleFavoriteCore, {
    errorMessage: 'You must be signed in to add favorites.',
    authMode: 'signin'
  })

  /**
   * Handle play/pause with authentication guard
   */
  const handlePlayPause = (e) => {
    e.stopPropagation()
    
    // Call the guarded action - it will handle auth check and modal opening
    guardedPlaySong()
  }

  /**
   * Handle favorite toggle with authentication guard
   */
  const handleFavorite = (e) => {
    e.stopPropagation()
    
    // Call the guarded action - it will handle auth check and modal opening
    guardedToggleFavorite()
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  /**
   * Guarded menu action handler
   */
  const handleMenuOption = (action, e) => {
    e.stopPropagation()
    setShowMenu(false)

    // Create guarded actions for menu options
    const guardedQueueAction = createGuardedAction(() => {
      // TODO: Implement queue functionality
      console.log('Add to queue:', song.title)
    }, {
      errorMessage: 'You must be signed in to add songs to queue.',
      authMode: 'signin'
    })

    const guardedPlaylistAction = createGuardedAction(() => {
      // TODO: Implement playlist functionality
      console.log('Add to playlist:', song.title)
    }, {
      errorMessage: 'You must be signed in to manage playlists.',
      authMode: 'signin'
    })

    // Handle different menu actions
    switch (action) {
      case "queue":
        guardedQueueAction()
        break
      case "playlist":
        guardedPlaylistAction()
        break
      case "delete":
        // Delete action only available for authenticated users with uploaded songs
        if (isAuthenticated && isUploaded) {
          setShowDeleteConfirm(true)
        }
        break
      default:
        break
    }
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
  const rawArtist = song.artist || song.singer || "Unknown Artist"
  const displayArtist = formatArtists(rawArtist)
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
              className={`absolute inset-0 bg-black bg-opacity-40 rounded-md sm:rounded-lg flex items-center justify-center transition-opacity duration-200 ${isHovered || isPlaying ? "opacity-100" : "opacity-0"
                }`}
            >
              <button
                onClick={handlePlayPause}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg ${isAuthenticated
                    ? "bg-white text-gray-900"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                title={isAuthenticated ? (isPlaying ? "Pause" : "Play") : "Sign in to play music"}
              >
                {isAuthenticated && isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
                )}
              </button>
            </div>
          )}

          {/* Heart button - Show visual state for auth status */}
          {!isEditMode && (
            <button
              onClick={handleFavorite}
              className={`absolute top-1 sm:top-2 right-1 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${!isAuthenticated
                  ? "bg-gray-500 bg-opacity-70 text-gray-300 hover:bg-purple-500 hover:text-white hover:bg-opacity-90"
                  : isFavorite
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                }`}
              title={!isAuthenticated ? "Sign in to add to favorites" : (isFavorite ? "Remove from favorites" : "Add to favorites")}
            >
              <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isFavorite && isAuthenticated ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="font-semibold text-xs sm:text-sm truncate" title={displayTitle}>
            {displayTitle}
          </h3>
          <p 
            className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs truncate" 
            title={rawArtist} // Show full original artist string on hover
          >
            {displayArtist}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-500 text-[9px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              {displayDuration}
            </span>

            {/* Menu button - Show for everyone but provide visual feedback for auth status */}
            {!isEditMode && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleMenuToggle}
                  className={`p-0.5 sm:p-1 rounded-full transition-colors ${isAuthenticated
                      ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                      : "hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
                    }`}
                  title={isAuthenticated ? "More options" : "Sign in for more options"}
                >
                  <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 sm:w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                    {isAuthenticated ? (
                      <>
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
                      </>
                    ) : (
                      <div className="px-2 sm:px-3 py-2">
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                          Sign in to access menu options
                        </p>
                        <button
                          onClick={() => {
                            setShowMenu(false)
                            if (onAuthRequired) {
                              onAuthRequired('signin')
                            }
                          }}
                          className="w-full text-center px-2 py-1 text-[10px] sm:text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
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