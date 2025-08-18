import { Heart, MoreHorizontal } from "lucide-react"
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
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={handleClose} />}


      {/* Right Sidebar */}
      <div className={`
      fixed lg:sticky inset-y-0 right-0 z-40 lg:z-20 h-full overflow-hidden transition-all duration-200
      ${isOpen ? "w-80" : "w-0"} `}>

        <div className={`
        w-80 h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-l border-gray-200/50 dark:border-gray-700/50 
        shadow-2xl transition-all duration-200
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

          {/* actual sidebar content */}
          <div className="flex flex-col h-full">

            {/* Song Info */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Cover Image */}
              <div className="relative">
                <img
                  src={currentSong.cover || "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"}
                  alt={currentSong.title}
                  className="w-full aspect-square object-cover rounded-2xl shadow-lg"
                />
                {currentSong.isUploaded && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Uploaded
                  </div>
                )}
              </div>

              {/* Song Details */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold truncate">{currentSong.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 truncate">{currentSong.artist}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm truncate">{currentSong.album}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={handleFavorite}
                      className={`p-2 rounded-full transition-all duration-200 ${isFavorite
                        ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                    
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Duration</span>
                  <span className="font-mono">{currentSong.duration}</span>
                </div>
              </div>

              {/* Song Stats */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6 space-y-3">
                <h4 className="font-medium">Song Information</h4>
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
            </div>
          </div>
        </div>

      </div>
    </>
  )
}