import { Heart } from "lucide-react"
import SongCard from "../songCard/SongCard.jsx"
import { useMusic } from "../../context/MusicContext"

export default function FavoritesPage() {
  const { state } = useMusic()

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Liked Songs</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Your favorite tracks</p>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {state.favorites.length} {state.favorites.length === 1 ? 'song' : 'songs'}
        </p>
      </div>
      
      {state.favorites.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No favorites yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 max-w-sm mx-auto">
            Like some songs to see them here!
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm max-w-xs mx-auto">
            Click the heart icon on any song to add it to your favorites
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {state.favorites.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  )
}