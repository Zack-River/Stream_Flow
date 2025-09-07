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
  onAuthRequired = null
}) {
  const { state, dispatch } = useMusic()
  const { isAuthenticated } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef(null)

  const {
    guardPlayAction,
    guardFavoriteAction,
    createGuardedAction
  } = useAuthGuard(isAuthenticated, onAuthRequired)

  const songId = song.id || song._id
  const isCurrentSong = state.currentSong?.id === songId
  const isPlaying = isCurrentSong && state.isPlaying
  const isFavorite = state.favorites.some((fav) => (fav.id || fav._id) === songId)
  const isUploaded = song.isUploaded || false

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

  const formatArtists = (artistString) => {
    if (!artistString) return "Unknown Artist"

    let cleanedString = artistString
      .replace(/\\"/g, '"')
      .replace(/^"/, '')
      .replace(/"$/, '')

    let artists = []

    if (cleanedString.includes('","')) {
      artists = cleanedString.split('","')
    }
    else if (cleanedString.includes('\",\"')) {
      artists = cleanedString.split('\",\"')
    }
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

    artists = artists
      .map(artist => artist.trim())
      .map(artist => artist.replace(/^["']+|["']+$/g, ''))
      .filter(artist => artist.length > 0)
      .filter(artist => !['ft', 'feat', 'featuring', 'and'].includes(artist.toLowerCase()))

    artists = [...new Set(artists)]

    if (artists.length === 0) return "Unknown Artist"
    if (artists.length === 1) return artists[0]
    if (artists.length === 2) return `${artists[0]} & ${artists[1]}`
    if (artists.length <= 4) return artists.join(', ')

    return `${artists.slice(0, 3).join(', ')} & ${artists.length - 3} more`
  }

  const playSongCore = () => {
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

    if (isCurrentSong) {
      dispatch({ type: "TOGGLE_PLAY" })
    } else {
      dispatch({ type: "SET_CURRENT_SONG", payload: normalizedSong })
      dispatch({ type: "SET_PLAYING", payload: true })
    }
  }

  const toggleFavoriteCore = () => {
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

  const guardedPlaySong = guardPlayAction(playSongCore, {
    errorMessage: 'You must be signed in to play music.',
    authMode: 'signin'
  })

  const guardedToggleFavorite = guardFavoriteAction(toggleFavoriteCore, {
    errorMessage: 'You must be signed in to add favorites.',
    authMode: 'signin'
  })

  // Card click handler for playing music
  const handleCardClick = () => {
    if (!isEditMode) {
      guardedPlaySong()
    }
  }

  const handlePlayPause = (e) => {
    e.stopPropagation()
    guardedPlaySong()
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    guardedToggleFavorite()
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleMenuOption = (action, e) => {
    e.stopPropagation()
    setShowMenu(false)

    const guardedQueueAction = createGuardedAction(() => {
      console.log('Add to queue:', song.title)
    }, {
      errorMessage: 'You must be signed in to add songs to queue.',
      authMode: 'signin'
    })

    const guardedPlaylistAction = createGuardedAction(() => {
      console.log('Add to playlist:', song.title)
    }, {
      errorMessage: 'You must be signed in to manage playlists.',
      authMode: 'signin'
    })

    switch (action) {
      case "queue":
        guardedQueueAction()
        break
      case "playlist":
        guardedPlaylistAction()
        break
      case "delete":
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

    const audioUrl = song.url || song.audioUrl
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl)
    }

    setShowDeleteConfirm(false)
  }

  const displayTitle = song.title || "Unknown Title"
  const rawArtist = song.artist || song.singer || "Unknown Artist"
  const displayArtist = formatArtists(rawArtist)
  const displayCover = song.cover || song.coverImageUrl || "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"
  const displayDuration = song.duration || "0:00"
  const displayGenre = song.genre

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border border-gray-100 dark:border-gray-700 group ${!isEditMode ? 'cursor-pointer' : ''
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        title={!isEditMode ? (isAuthenticated ? (isPlaying ? "Pause" : "Play") : "Sign in to play music") : undefined}
      >
        <div className="relative mb-2 sm:mb-3">
          {isUploaded && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-green-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-medium z-10">
              Uploaded
            </div>
          )}

          {displayGenre && !isUploaded && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-purple-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-medium z-10">
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

          {isEditMode && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={handleEditClick}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 sm:p-2.5 rounded-full shadow-lg transition-colors"
                title="Edit song"
              >
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}

          {!isEditMode && (
            <div
              className={`absolute inset-0 bg-black bg-opacity-40 rounded-md sm:rounded-lg flex items-center justify-center transition-opacity duration-200 ${isHovered || isPlaying ? "opacity-100" : "opacity-0"
                }`}
            >
              <button
                onClick={handlePlayPause}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg ${isAuthenticated
                  ? "bg-white text-gray-900"
                  : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                title={isAuthenticated ? (isPlaying ? "Pause" : "Play") : "Sign in to play music"}
              >
                {isAuthenticated && isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
                )}
              </button>
            </div>
          )}

          {!isEditMode && (
            <button
              onClick={handleFavorite}
              className={`absolute top-1 sm:top-2 right-1 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${!isAuthenticated
                ? "bg-gray-500 bg-opacity-70 text-gray-300 hover:bg-purple-500 hover:text-white hover:bg-opacity-90"
                : isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                }`}
              title={!isAuthenticated ? "Sign in to add to favorites" : (isFavorite ? "Remove from favorites" : "Add to favorites")}
            >
              <Heart className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isFavorite && isAuthenticated ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="font-semibold text-xs sm:text-sm truncate leading-tight" title={displayTitle}>
            {displayTitle}
          </h3>
          <p
            className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs truncate leading-tight"
            title={rawArtist}
          >
            {displayArtist}
          </p>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-gray-500 dark:text-gray-500 text-[9px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 px-1 sm:px-1.5 py-0.5 rounded-full">
              {displayDuration}
            </span>

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
                  <MoreHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-28 sm:w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={(e) => handleMenuOption("queue", e)}
                          className="w-full text-left px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Add to Queue
                        </button>
                        <button
                          onClick={(e) => handleMenuOption("playlist", e)}
                          className="w-full text-left px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Add to Playlist
                        </button>
                        {isUploaded && (
                          <button
                            onClick={(e) => handleMenuOption("delete", e)}
                            className="w-full text-left px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                          >
                            <div className="flex items-center space-x-1 sm:space-x-1.5">
                              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span>Delete</span>
                            </div>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="px-2 sm:px-3 py-2">
                        <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 text-center mb-1.5 sm:mb-2">
                          Sign in to access menu options
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowMenu(false)
                            if (onAuthRequired) {
                              onAuthRequired('signin')
                            }
                          }}
                          className="w-full text-center px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Delete Song</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm">
              Are you sure you want to delete "{displayTitle}"? This action cannot be undone.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm text-gray-700 dark:text-gray-300"
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