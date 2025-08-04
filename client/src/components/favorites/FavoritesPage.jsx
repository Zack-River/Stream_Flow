import { Heart } from "lucide-react"
import SongCard from "../songCard/SongCard.jsx"
import { useMusic } from "../../context/MusicContext"

export default function FavoritesPage() {
  const { state } = useMusic()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Liked Songs</h1>
            <p className="text-gray-600 dark:text-gray-400">Your favorite tracks</p>
          </div>
        <p className="text-gray-500 dark:text-gray-400">
          {state.favorites.length} {state.favorites.length === 1 ? 'song' : 'songs'}
        </p>
      </div>
      
      {state.favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No favorites yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
            Like some songs to see them here!
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Click the heart icon on any song to add it to your favorites
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4">
          {state.favorites.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  )
}