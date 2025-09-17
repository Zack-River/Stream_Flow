import React from 'react'
import { Heart } from 'lucide-react'

export default function SongInfo({ currentSong, isFavorite, onFavorite }) {
    const displayTitle = currentSong.title || "Unknown Title"
    const displayArtist = currentSong.artist || currentSong.singer || "Unknown Artist"
    const displayCover = currentSong.cover || currentSong.coverImageUrl ||
        "https://placehold.co/48x48/EFEFEF/AAAAAA?text=Cover"

    return (
        <div className="flex items-center justify-between sm:justify-start sm:space-x-3 sm:w-50 sm:min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                    <img
                        src={displayCover}
                        alt={displayTitle}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-md"
                        onError={(e) => {
                            e.target.src = "https://placehold.co/48x48/EFEFEF/AAAAAA?text=Cover"
                        }}
                    />
                    {currentSong.isUploaded && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs sm:text-sm truncate" title={displayTitle}>
                        {displayTitle}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs truncate" title={displayArtist}>
                        {displayArtist}
                    </p>
                </div>
            </div>

            <button
                onClick={onFavorite}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${isFavorite
                        ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
            >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
        </div>
    )
}