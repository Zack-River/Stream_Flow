import { Heart, X, PanelRightClose } from "lucide-react"
import { useMusic } from "../../context/MusicContext"

export default function RightSidebar({ isOpen, onClose }) {
  const { state, dispatch } = useMusic()

  const { currentSong } = state
  const isFavorite = currentSong && state.favorites.some((fav) => fav.id === currentSong.id)

  const handleFavorite = () => {
    if (!currentSong) return

    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: currentSong.id })
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: currentSong })
    }
  }

  const handleClose = () => {
    onClose()
  }

  // Don't render sidebar if no song is playing
  if (!currentSong) {
    return null
  }

  return (
    <>
      {/* MOBILE: Full-screen overlay on mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden" onClick={handleClose} />}

      {/* MOBILE-FIRST: Full screen on mobile, sidebar on desktop */}
      <div className={`
        fixed lg:sticky inset-0 lg:inset-y-0 lg:right-0 z-50 lg:z-20 
        transition-all duration-300 ease-in-out
        ${isOpen
          ? "w-full lg:w-80 h-full"
          : "w-0 h-0 lg:h-full overflow-hidden"
        }
      `}>

        <div className={`
          w-full lg:w-80 h-full bg-white/98 lg:bg-white/95 dark:bg-gray-800/98 lg:dark:bg-gray-800/95 
          backdrop-blur-lg lg:border-l border-gray-200/50 dark:border-gray-700/50 
          shadow-2xl transition-all duration-300
          ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full lg:translate-x-full opacity-0"}
        `}>

          {/* MOBILE: Header with close button */}
          <div className="flex items-center justify-between p-4 lg:px-6 lg:pb-2 border-b border-gray-200/50 dark:border-gray-700/50 lg:border-none">
            <h2 className="text-lg font-semibold">Now Playing</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close now playing"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

          {/* Sidebar content */}
          <div className="flex flex-col h-full overflow-hidden">

            {/* Song Info */}
            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto flex-1">
              {/* Cover Image */}
              <div className="relative">
                <img
                  src={currentSong.cover || "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"}
                  alt={currentSong.title}
                  className="w-full aspect-square object-cover rounded-2xl shadow-lg max-w-sm mx-auto lg:max-w-none"
                />
                {currentSong.isUploaded && (
                  <div className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-green-500 text-white text-xs px-2 py-1 lg:px-3 lg:py-1 rounded-full font-medium">
                    Uploaded
                  </div>
                )}
              </div>

              {/* Song Details */}
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <h3 className="text-xl lg:text-2xl font-bold truncate">{currentSong.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 truncate text-lg lg:text-base">{currentSong.artist}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm truncate">{currentSong.album}</p>
                  </div>

                  {/* DESKTOP: Heart button on desktop */}
                  <div className="hidden lg:flex items-center space-x-2 ml-4">
                    <button
                      onClick={handleFavorite}
                      className={`p-2 rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${isFavorite
                        ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* MOBILE: Favorite button centered below song info */}
                <div className="flex justify-center lg:hidden">
                  <button
                    onClick={handleFavorite}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${isFavorite
                      ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    <span className="font-medium">
                      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </span>
                  </button>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 lg:border-t-0 lg:pt-0">
                  <span>Duration</span>
                  <span className="font-mono">{currentSong.duration}</span>
                </div>
              </div>

              {/* Song Stats */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4 lg:pt-6 space-y-3">
                <h4 className="font-medium text-center lg:text-left">Song Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Format</span>
                    <span>MP3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quality</span>
                    <span>High</span>
                  </div>
                  {currentSong.isUploaded && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Source</span>
                      <span className="text-green-600 dark:text-green-400">Your Upload</span>
                    </div>
                  )}
                </div>
              </div>

              {/* MOBILE: Additional padding at bottom for better spacing */}
              <div className="pb-20 lg:pb-4"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}