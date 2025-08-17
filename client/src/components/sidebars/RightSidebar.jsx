import { Heart, Share2, Download, MoreHorizontal } from "lucide-react"
import { useMusic } from "../../context/MusicContext"

export default function RightSidebar({ isOpen, onClose }) {
  const { state } = useMusic()
  const { currentSong } = state
  const isFavorite = currentSong && state.favorites.some((fav) => fav.id === currentSong.id)

  if (!currentSong) return null

  const handleFavorite = () => {
    if (isFavorite) {
      state.dispatch({ type: "REMOVE_FROM_FAVORITES", payload: currentSong.id })
    } else {
      state.dispatch({ type: "ADD_TO_FAVORITES", payload: currentSong })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentSong.title,
        text: `Check out ${currentSong.title} by ${currentSong.artist}`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${currentSong.title} by ${currentSong.artist}`)
    }
  }

  return (
    <aside
      className={`fixed lg:relative inset-y-0 right-0 z-40 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-l border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-200 ease-in-out shadow-2xl overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}
      role="complementary"
      aria-label="Song details and controls"
    >
      <div className="p-6">
        {/* Song Info Header */}
        <header className="mb-6">
          <div className="relative mb-4">
            <img
              src={currentSong.cover || "https://placehold.co/300x300/EFEFEF/AAAAAA?text=Song+Cover"}
              alt={`Album cover for ${currentSong.title} by ${currentSong.artist}`}
              className="w-full aspect-square object-cover rounded-xl shadow-lg"
              loading="lazy"
            />
            {currentSong.isUploaded && (
              <div 
                className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
                aria-label="Uploaded song indicator"
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
              {currentSong.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {currentSong.artist}
            </p>
            {currentSong.album && (
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                {currentSong.album}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Duration: {currentSong.duration}
            </p>
          </div>
        </header>

        {/* Action Buttons */}
        <section aria-labelledby="song-actions-title">
          <h3 id="song-actions-title" className="sr-only">Song actions</h3>
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={handleFavorite}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                isFavorite
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              aria-label={isFavorite ? `Remove ${currentSong.title} from favorites` : `Add ${currentSong.title} to favorites`}
              aria-pressed={isFavorite}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
              <span>{isFavorite ? "Liked" : "Like"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              aria-label={`Share ${currentSong.title}`}
            >
              <Share2 className="w-5 h-5" aria-hidden="true" />
              <span>Share</span>
            </button>

            <button
              className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              aria-label="More options"
              aria-haspopup="true"
            >
              <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Song Details */}
        <section aria-labelledby="song-details-title">
          <h3 id="song-details-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Song Details
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Title
              </h4>
              <p className="text-gray-900 dark:text-white">
                {currentSong.title}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Artist
              </h4>
              <p className="text-gray-900 dark:text-white">
                {currentSong.artist}
              </p>
            </div>

            {currentSong.album && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Album
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {currentSong.album}
                </p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Duration
              </h4>
              <p className="text-gray-900 dark:text-white">
                {currentSong.duration}
              </p>
            </div>

            {currentSong.isUploaded && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Upload Status
                </h4>
                <p className="text-green-700 dark:text-green-400">
                  Successfully uploaded to your library
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Related Songs Placeholder */}
        <section className="mt-8" aria-labelledby="related-songs-title">
          <h3 id="related-songs-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            You Might Also Like
          </h3>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Related song ${i}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // Handle click
                  }
                }}
              >
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex-shrink-0" aria-hidden="true"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Related Song {i}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Artist Name
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}